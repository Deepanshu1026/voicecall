import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import CallModal from '../components/call/CallModal';
import IncomingCallModal from '../components/call/IncomingCallModal';
import toast from 'react-hot-toast';
import { CallProvider } from '../context/CallContext';

const Chat = () => {
  const { user } = useAuth();
  const { on } = useSocket();
  const chat = useChat();
  const { notifyMessage, notifyCall } = useNotifications();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const webrtc = useWebRTC();

  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    chat.loadConversations();
  }, []);

  // WebRTC/call listeners - stable function deps, should run once
  useEffect(() => {
    const cleanupIncoming = webrtc.handleIncomingCall((data) => {
      setIncomingCall(data);
      notifyCall(data.caller?.displayName || data.caller?.username || 'Someone', data.call?.type || 'audio');
    });

    const cleanupRinging = webrtc.handleRinging((data) => {
      setActiveCall(data.call);
      setShowCallModal(true);
    });

    const cleanupRejected = webrtc.handleCallRejected((data) => {
      toast.error('Call rejected');
      setActiveCall(null);
      setShowCallModal(false);
    });

    const cleanupEnded = webrtc.handleCallEnded(() => {
      setActiveCall(null);
      setShowCallModal(false);
    });

    const cleanupAccepted = webrtc.handleCallAccepted((data) => {
      setActiveCall(data.call);
      setShowCallModal(true);
    });

    const cleanupError = webrtc.handleCallError((data) => {
      setActiveCall(null);
      setShowCallModal(false);
      setIncomingCall(null);
    });

    const cleanupMissed = webrtc.handleCallMissed((data) => {
      toast('Missed call', { icon: '📞' });
      setIncomingCall(null);
    });

    const cleanupSignal = webrtc.handleSignal();

    return () => {
      cleanupIncoming();
      cleanupRinging();
      cleanupRejected();
      cleanupEnded();
      cleanupAccepted();
      cleanupError();
      cleanupMissed();
      cleanupSignal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End active call if the user closes the tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (webrtc.callState !== 'idle') {
        webrtc.endCall();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [webrtc]);

  // Message listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      chat.addMessage(message.conversation, message);
      if (message.sender?._id !== user?._id) {
        notifyMessage(
          message.sender?.displayName || message.sender?.username || 'New message',
          message
        );
      }
    };

    const cleanupMessage = on('message:new', handleNewMessage);

    const handleStatusChange = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        status: data.status,
      });
    };

    const cleanupStatus = on('message:status', handleStatusChange);

    const handleReaction = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        reactions: data.reactions,
      });
    };

    const cleanupReaction = on('message:reaction:updated', handleReaction);

    const handleEdit = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        content: data.content,
        isEdited: data.isEdited,
        editedAt: data.editedAt,
      });
    };

    const cleanupEdit = on('message:edited', handleEdit);

    const handleDelete = (data) => {
      if (data.forEveryone) {
        chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
          isDeleted: true,
          content: 'This message was deleted',
        });
      }
    };

    const cleanupDelete = on('message:deleted', handleDelete);

    const handleRead = (data) => {
      const msgs = chat.messages[data.conversationId] || [];
      msgs.forEach((msg) => {
        if (msg.sender?._id === user?._id) {
          chat.updateMessage(data.conversationId, msg._id, { status: 'seen' });
        }
      });
    };

    const cleanupRead = on('messages:read', handleRead);

    return () => {
      cleanupMessage();
      cleanupStatus();
      cleanupReaction();
      cleanupEdit();
      cleanupDelete();
      cleanupRead();
    };
  }, [user, on, notifyMessage, chat, activeConversation]);

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    setShowMobileSidebar(false);
    chat.loadMessages(conv._id, true);
  }, [chat.loadMessages]);

  const handleBackToSidebar = useCallback(() => {
    setShowMobileSidebar(true);
  }, []);

  const startCall = useCallback(async (receiverId, receiver = null, type = 'audio') => {
    const result = await webrtc.startCall(receiverId, type);
    if (result.success) {
      if (receiver) {
        setActiveCall({
          caller: user,
          receiver,
          type,
          status: 'ringing',
          _id: null,
        });
      }
      setShowCallModal(true);
      toast('Calling...', { icon: '📞' });
    }
  }, [webrtc, user]);

  const callContextValue = useMemo(() => ({
    webrtc,
    localStream: webrtc.localStream,
    activeCall,
    setActiveCall,
    showCallModal,
    setShowCallModal,
    incomingCall,
    setIncomingCall,
    startCall,
    cancelCall: webrtc.cancelCall,
    missCall: webrtc.missCall,
  }), [webrtc, webrtc.localStream, activeCall, showCallModal, incomingCall, startCall, webrtc.cancelCall, webrtc.missCall]);

  return (
    <CallProvider value={callContextValue}>
      <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-surface-dark">
        <div className={`${showMobileSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700`}>
          <Sidebar
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            chat={chat}
          />
        </div>

        <div className={`${!showMobileSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          {activeConversation ? (
            <ChatArea
              conversation={activeConversation}
              chat={chat}
              onBack={handleBackToSidebar}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to VoiceCall
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Select a conversation or search for users to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {showCallModal && activeCall && <CallModal call={activeCall} />}
        {incomingCall && (
          <IncomingCallModal
            call={incomingCall}
            onAccept={() => {
              const result = webrtc.acceptCall(incomingCall.call._id, incomingCall.roomId);
              if (result.success) {
                setActiveCall(incomingCall.call);
                setShowCallModal(true);
              }
              setIncomingCall(null);
            }}
            onReject={() => {
              webrtc.rejectCall(incomingCall.call._id);
              setIncomingCall(null);
            }}
            onMissed={() => {
              webrtc.missCall(incomingCall.call._id);
              setIncomingCall(null);
            }}
          />
        )}
      </div>
    </CallProvider>
  );
};

export default Chat;
