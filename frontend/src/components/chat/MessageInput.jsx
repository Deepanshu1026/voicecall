import { useState, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';
import EmojiPicker from '../emoji/EmojiPicker';
import { HiPaperAirplane, HiPaperClip, HiFaceSmile, HiXMark, HiArrowUturnLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const MessageInput = ({ conversation, chat, replyingTo, onCancelReply, recipientId, variant = 'default' }) => {
  const { emit } = useSocket();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (!recipientId || !conversation?._id) return;
    emit('typing:start', { conversationId: conversation._id, recipientId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit('typing:stop', { conversationId: conversation._id, recipientId });
    }, 2000);
  }, [conversation?._id, recipientId, emit]);

  const handleSendMessage = useCallback(async (content) => {
    if (!content?.trim() || sending) return;
    setSending(true);
    try {
      emit('typing:stop', { conversationId: conversation._id, recipientId });
      emit('message:send', {
        conversationId: conversation._id,
        content: content.trim(),
        type: 'text',
        replyTo: replyingTo?._id || null,
      }, (response) => {
        if (response?.success) {
          chat.addMessage(conversation._id, response.message);
        } else if (response?.error) {
          toast.error(response.error);
        }
      });
      setMessage('');
      if (onCancelReply) onCancelReply();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [conversation?._id, recipientId, sending, emit, replyingTo, chat, onCancelReply]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter: let the default newline behavior happen (textarea handles it)
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB');
      return;
    }
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content', file.name);
      formData.append('type', 'file');
      const res = await chatAPI.sendMessage(conversation._id, formData);
      chat.addMessage(conversation._id, res.data.data);
      toast.success('File sent');
    } catch {
      toast.error('Failed to send file');
    } finally {
      setSending(false);
      setShowFilePicker(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
    setShowEmojiPicker(false);
  };

  // User chat style (avisaexperts reference)
  if (variant === 'user') {
    return (
      <div className="relative border-t border-gray-200 bg-white px-3 py-2">
        {/* Reply preview */}
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <HiArrowUturnLeft className="w-4 h-4 text-[#001E74] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#001E74]">Replying</p>
                <p className="text-xs text-gray-500 truncate">{replyingTo.content?.substring(0, 50)}</p>
              </div>
            </div>
            <button onClick={onCancelReply} className="p-1 text-gray-400 hover:text-gray-600">
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.zip,.txt"
        />

        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Emoji"
          >
            <HiFaceSmile className="w-6 h-6" />
          </button>

          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (e.target.value) handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={sending}
            className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#001E74] max-h-32"
          />

          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Attach file"
          >
            <HiPaperClip className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleSendMessage(message)}
            disabled={!message.trim() || sending}
            className="bg-[#001E74] hover:bg-[#001a63] text-white rounded-xl p-2.5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sending ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <HiPaperAirplane className="w-5 h-5 -rotate-45" />
            )}
          </button>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full right-4 z-50 animate-slide-up">
            <div className="relative">
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-3">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 min-w-0">
            <HiArrowUturnLeft className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400">Replying</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyingTo.content?.substring(0, 50)}</p>
            </div>
          </div>
          <button onClick={onCancelReply} className="btn-ghost p-1 text-gray-400 hover:text-gray-600">
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2">
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.zip,.txt"
          />
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="btn-ghost p-2 text-gray-400 hover:text-primary-500 transition-colors"
            title="Attach file"
          >
            <HiPaperClip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (e.target.value) handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
            className="input-field pr-10 py-2.5 resize-none max-h-32"
            disabled={sending}
            style={{ lineHeight: '1.4' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-1.5 btn-ghost p-1 text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <HiFaceSmile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => handleSendMessage(message)}
          disabled={!message.trim() || sending}
          className="btn-primary p-2.5 rounded-full flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {sending ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
            <HiPaperAirplane className="w-5 h-5 -rotate-45" />
          )}
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-4 z-50 animate-slide-up">
          <div className="relative">
            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
