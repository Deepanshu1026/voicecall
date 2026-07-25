import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import ConversationItem from '../chat/ConversationItem';
import CallLogItem from '../chat/CallLogItem';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import { userAPI, chatAPI, callAPI } from '../../services/api';
import { getDisplayName, debounce } from '../../utils/helpers';
import { HiChatBubbleLeftRight, HiPhone } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Sidebar = ({ activeConversation, onSelectConversation, chat, showHeader = true }) => {
  const { user, logout } = useAuth();
  const { onlineUsers, on } = useSocket();
  const { startCall } = useCall();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chats');
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [callsError, setCallsError] = useState(false);
  const [callsPage, setCallsPage] = useState(1);
  const [hasMoreCalls, setHasMoreCalls] = useState(true);
  const loadingCallsRef = useRef(false);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      try {
        setSearching(true);
        const res = await userAPI.searchUsers(query);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    chat.loadConversations();
  }, []);

  const loadCalls = useCallback(async (page = 1, reset = false) => {
    if (loadingCallsRef.current) return;
    loadingCallsRef.current = true;
    setLoadingCalls(true);
    setCallsError(false);
    try {
      console.log('[Sidebar] loading call history...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await callAPI.getCallHistory(page, 20, null, { signal: controller.signal });
      clearTimeout(timeoutId);
      console.log('[Sidebar] call history response:', res.data);
      const data = res.data?.data || [];
      const pagination = res.data?.pagination || {};
      setCalls((prev) => reset ? data : [...prev, ...data]);
      setHasMoreCalls(pagination.page < pagination.pages);
      setCallsPage(page);
    } catch (error) {
      setCallsError(true);
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
        toast.error('Call history is taking too long. Tap to retry.');
      } else if (error?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load call history');
      }
      console.error('Failed to load call history:', error);
    } finally {
      loadingCallsRef.current = false;
      setLoadingCalls(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTab === 'calls') {
      loadCalls(1, true);
    }
  }, [selectedTab, loadCalls]);

  // Update call history in real-time via socket
  useEffect(() => {
    const handleCallUpdate = (data) => {
      if (!data?.call) return;
      // Add or update the call in the list without fetching from REST API
      setCalls((prev) => {
        const idx = prev.findIndex((c) => c._id === data.call._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data.call;
          return updated;
        }
        return [data.call, ...prev];
      });
    };
    const cleanup = on('call:updated', handleCallUpdate);
    const cleanupEnded = on('call:ended', handleCallUpdate);
    return () => { cleanup(); cleanupEnded(); };
  }, [on]);

  const handleStartConversation = async (participantId) => {
    try {
      const res = await chatAPI.getOrCreateConversation(participantId);
      const conv = res.data.data;
      onSelectConversation(conv);
      chat.loadMessages(conv._id, true);
      chat.loadConversations();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => setShowProfile(!showProfile)} className="relative group">
            <Avatar user={user} size="md" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">VoiceCall</h1>
          <div className="flex items-center gap-1">
            <Avatar user={user} size="xs" />
            <button onClick={logout} className="btn-ghost p-2 text-gray-500 hover:text-red-500 transition-colors" title="Logout">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setSelectedTab('chats')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative ${
            selectedTab === 'chats' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <HiChatBubbleLeftRight className="w-4 h-4 mx-auto mb-0.5" />
          Chats
          {selectedTab === 'chats' && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-600 rounded-full" />}
        </button>
        <button
          onClick={() => setSelectedTab('calls')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative ${
            selectedTab === 'calls' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <HiPhone className="w-4 h-4 mx-auto mb-0.5" />
          Calls
          {selectedTab === 'calls' && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-600 rounded-full" />}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
          onClear={() => { setSearchQuery(''); setSearchResults([]); }}
        />
      </div>

      {/* Search results */}
      {searchQuery.trim().length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Search Results</div>
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleStartConversation(u._id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Avatar user={u} showStatus size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{getDisplayName(u)}</p>
                    <p className="text-xs text-gray-500 truncate">@{u.username}{u.bio ? ` - ${u.bio.substring(0, 30)}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-400">No users found</div>
          )}
        </div>
      )}

      {/* Conversations list */}
      {searchQuery.trim().length === 0 && (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {selectedTab === 'chats' && (
            <>
              {chat.loadingConversations ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : chat.conversations.length > 0 ? (
                chat.conversations.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conversation={conv}
                    isActive={activeConversation?._id === conv._id}
                    onSelect={onSelectConversation}
                  />
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <HiChatBubbleLeftRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-400">Search for users above to start chatting</p>
                </div>
              )}
            </>
          )}

          {selectedTab === 'calls' && (
            <>
              {loadingCalls ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : calls.length > 0 ? (
                <>
                  {calls.map((call) => (
                    <CallLogItem
                      key={call._id}
                      call={call}
                      currentUserId={user?._id}
                      onCallClick={(otherUser) => startCall(otherUser?._id, otherUser, 'audio')}
                    />
                  ))}
                  {hasMoreCalls && (
                    <button
                      onClick={() => loadCalls(callsPage + 1)}
                      className="w-full py-2 text-xs text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      Load more
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-12 px-4">
                  <HiPhone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {callsError ? 'Could not load calls' : 'No call history'}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {callsError ? 'Check your connection and try again' : 'Your calls will appear here'}
                  </p>
                  {callsError && (
                    <button
                      onClick={() => loadCalls(1, true)}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Online users count */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{onlineUsers.length} online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
