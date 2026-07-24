import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatFileSize } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import { HiCheck, HiCheckBadge, HiArrowUturnLeft, HiDocumentText, HiChevronDoubleRight, HiCheckCircle } from 'react-icons/hi2';

const MessageBubble = ({ message, isOwn, onReply, variant = 'default' }) => {
  const { user } = useAuth();

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
              {(message.type === 'file' || message.type === 'image') && message.fileName && (
                <div className="mb-1">
                  {/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(message.fileName) ? (
                    <div className="relative">
                      <img
                        src={message.fileUrl || `/uploads/${message.fileName}`}
                        alt={message.fileName}
                        className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer"
                        onClick={() => window.open(message.fileUrl || `/uploads/${message.fileName}`, '_blank')}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <a
                        href={message.fileUrl || `/uploads/${message.fileName}`}
                        download={message.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                        title="Download"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10 dark:bg-white/10">
                      <HiDocumentText className="w-8 h-8 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{message.fileName}</p>
                        {message.fileSize && <p className={`text-xs ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>{formatFileSize(message.fileSize)}</p>}
                      </div>
                      <a
                        href={message.fileUrl || `/uploads/${message.fileName}`}
                        download={message.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs font-medium ${isOwn ? 'text-white/70 hover:text-white' : 'text-blue-500 hover:text-blue-700'} transition-colors`}
                        title="Download"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </a>
                    </div>
                  )}
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

        <div className={`flex items-center gap-0.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <button onClick={() => onReply()} className="p-1 rounded-full text-gray-400 hover:text-primary-500 transition-colors" title="Reply">
            <HiArrowUturnLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {variant === 'user' && isOwn && <Avatar user={user} size="sm" />}
    </div>
  );
};

export default MessageBubble;
