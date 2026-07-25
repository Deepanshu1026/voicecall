import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatFileSize } from '../../utils/helpers';
import { HiOutlineArrowUturnLeft } from 'react-icons/hi2';
import ImageLightbox from '../common/ImageLightbox';

const MessageBubble = ({ message, isOwn, onReply, variant = 'default' }) => {
  const { user } = useAuth();
  const currentUserId = user?._id;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const deletedForMe = message.deletedFor?.some((id) => {
    const idStr = typeof id === 'object' ? id?._id || id?.toString() : id;
    return idStr === currentUserId;
  });

  if (deletedForMe) return null;

  if (message.isDeleted && !isOwn) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="text-xs text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-lg">
          This message was deleted
        </div>
      </div>
    );
  }

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full italic">
          {message.content}
        </div>
      </div>
    );
  }

  const renderFile = () => {
    if (message.type !== 'file' && message.type !== 'image') return null;
    if (!message.fileName) return null;

    const fileUrl = message.fileUrl || '';
    const isFileAvailable = fileUrl.startsWith('http') || fileUrl.startsWith('/uploads/');
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(message.fileName);
    const openFile = () => { if (isFileAvailable) window.open(fileUrl, '_blank'); };

    if (!isFileAvailable) {
      return (
        <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-gray-100">
          <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-xs text-gray-500">File unavailable</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mb-1">
          <img
            src={fileUrl}
            alt={message.fileName}
            className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            onClick={() => setLightboxOpen(true)}
            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-500 hover:text-blue-700"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Open image
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-black/10">
        <svg className="w-6 h-6 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{message.fileName}</p>
          {message.fileSize && <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>}
        </div>
        <button onClick={openFile} className="text-blue-500 hover:text-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>
    );
  };

  const bubbleBg = isOwn
    ? 'bg-[#6138d8] text-white'
    : 'bg-white text-gray-900';

  const bubbleRound = isOwn
    ? 'rounded-[18px] rounded-br-[6px]'
    : 'rounded-[18px] rounded-bl-[6px]';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-1.5 mx-1 mb-1 group relative`}>
      <div className={`${isOwn ? 'order-first' : 'order-last'} opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0`}>
        <button
          onClick={() => onReply()}
          className="p-1 rounded-full text-gray-300 hover:text-gray-600 transition-colors"
          title="Reply"
        >
          <HiOutlineArrowUturnLeft className="w-4 h-4" />
        </button>
      </div>

      <div className={`max-w-[72%] ${bubbleBg} ${bubbleRound} px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)]`}>
        {message.replyTo && (
          <div className={`mb-1.5 px-2 py-1 text-xs rounded-md border-l-[3px] ${isOwn ? 'border-white/40 bg-white/10' : 'border-[#6138d8]/50 bg-gray-100'}`}>
            <p className={`font-medium text-[11px] leading-tight ${isOwn ? 'text-white/80' : 'text-[#6138d8]'}`}>Replying</p>
            <p className={`truncate text-[11px] ${isOwn ? 'text-white/50' : 'text-gray-400'}`}>
              {message.replyTo?.content || 'Original message'}
            </p>
          </div>
        )}

        {renderFile()}

        {message.content && (
          <p className={`text-[15px] leading-[1.35] whitespace-pre-wrap break-words ${isOwn ? '' : ''}`}>
            {message.content}
          </p>
        )}

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-sm">{r.emoji}</span>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-end'}`}>
          <span className={`text-[11px] leading-tight ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="flex-shrink-0 flex items-center leading-none">
              {message.status === 'seen' ? (
                <svg className="w-3.5 h-3 text-white/80" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 8 L6 12 L13 4" />
                  <path d="M6 8 L10 12 L17 4" />
                </svg>
              ) : message.status === 'delivered' ? (
                <svg className="w-3.5 h-3 text-white/70" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 8 L6 12 L13 4" />
                  <path d="M6 8 L10 12 L17 4" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3 text-white/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8 L6.5 12 L13 4" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
      <ImageLightbox
        src={message.fileUrl}
        alt={message.fileName}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default MessageBubble;