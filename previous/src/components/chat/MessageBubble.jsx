import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatFileSize } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import { HiCheck, HiCheckBadge, HiPencil, HiTrash, HiArrowUturnLeft, HiFaceSmile, HiDocumentText, HiChevronDoubleRight, HiXMark, HiCheckCircle } from 'react-icons/hi2';

const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageBubble = ({ message, isOwn, onDelete, onReaction, onEdit, onReply, variant = 'default' }) => {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const currentUserId = user?._id;
  const sentClass = variant === 'user' ? 'message-bubble-sent-user' : 'message-bubble-sent';
  const receivedClass = variant === 'user' ? 'message-bubble-received-user' : 'message-bubble-received';
  const bubbleClass = isOwn ? sentClass : receivedClass;

  const deletedForMe = message.deletedFor?.some((id) => {
    const idStr = typeof id === 'object' ? id?._id || id?.toString() : id;
    return idStr === currentUserId;
  });

  if (deletedForMe) return null;

  if (message.isDeleted && !isOwn) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} opacity-50`}>
        <div className={`${bubbleClass} bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic text-xs px-3 py-2`}>
          This message was deleted
        </div>
      </div>
    );
  }

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full italic">
          {message.content}
        </div>
      </div>
    );
  }

  const statusIcon = () => {
    if (message.status === 'seen') return <HiCheckBadge className="w-3.5 h-3.5 text-blue-400" />;
    if (message.status === 'delivered') return <HiCheckCircle className="w-3.5 h-3.5 text-gray-400" />;
    if (message.status === 'sent') return <HiCheck className="w-3.5 h-3.5 text-gray-400" />;
    return <HiChevronDoubleRight className="w-3.5 h-3.5 text-gray-400" />;
  };

  const handleStartEdit = () => {
    setEditContent(message.content);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent);
    }
    setEditing(false);
  };

  const handleEmojiSelect = (emoji) => {
    onReaction(emoji);
    setShowEmojiPicker(false);
  };

  const myReaction = message.reactions?.find((r) => {
    const rid = typeof r.user === 'object' ? r.user?._id : r.user;
    return rid === currentUserId;
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2 group relative`}>
      {variant === 'user' && !isOwn && <Avatar user={message.sender} size="sm" />}
      <div className="max-w-[75%] sm:max-w-[65%]">
        {message.replyTo && (
          <div className={`mb-0.5 px-3 pt-1.5 pb-0.5 text-xs border-l-2 ${isOwn ? 'border-white/50' : 'border-primary-500'} rounded-t-md ${isOwn ? 'bg-primary-700/50' : 'bg-gray-200 dark:bg-gray-600/50'}`}>
            <p className={`font-medium ${isOwn ? 'text-white/80' : 'text-primary-600 dark:text-primary-400'}`}>
              Replying to a message
            </p>
            <p className={`truncate ${isOwn ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
              {(message.replyTo?.content || 'Original message')}
            </p>
          </div>
        )}

        <div
          className={`relative ${bubbleClass}`}
        >
          {editing ? (
            <div className="min-w-[200px]">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditing(false); }}
                className={`w-full bg-transparent border-b ${isOwn ? 'border-white/50 text-white placeholder-white/50' : 'border-gray-400 text-gray-900 placeholder-gray-400'} focus:outline-none`}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setEditing(false)} className={isOwn ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'}>
                  <HiXMark className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleSaveEdit} className={isOwn ? 'text-white/80 hover:text-white' : 'text-primary-600 hover:text-primary-700'}>
                  <HiCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.type === 'file' && message.fileName && (
                <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-black/10 dark:bg-white/10">
                  <HiDocumentText className="w-8 h-8 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{message.fileName}</p>
                    {message.fileSize && <p className={`text-xs ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>{formatFileSize(message.fileSize)}</p>}
                  </div>
                </div>
              )}

              <p className={`text-sm whitespace-pre-wrap break-words`}>
                {message.content}
              </p>

              {message.isEdited && (
                <span className={`text-xs ml-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>edited</span>
              )}

              {message.reactions?.length > 0 && (
                <div className={`flex flex-wrap gap-0.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {message.reactions.map((r, idx) => (
                    <span key={idx} className="text-sm" title={r.user?.displayName || r.user?.username}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && statusIcon()}
          </div>
        </div>

        {!editing && (
          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
            <button onClick={() => onReply()} className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500" title="Reply">
              <HiArrowUturnLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500" title="React">
              <HiFaceSmile className="w-3.5 h-3.5" />
            </button>
            {isOwn && (
              <>
                <button onClick={handleStartEdit} className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500" title="Edit">
                  <HiPencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (window.confirm('Delete this message?')) onDelete(false); }} className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500" title="Delete">
                  <HiTrash className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}

        {showEmojiPicker && (
          <div className={`absolute bottom-full mb-1 ${isOwn ? 'right-0' : 'left-0'} z-10`}>
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-1.5 flex gap-1 border dark:border-gray-700">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-lg transition-colors ${myReaction?.emoji === emoji ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-primary-500' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {variant === 'user' && isOwn && <Avatar user={user} size="sm" />}
    </div>
  );
};

export default MessageBubble;
