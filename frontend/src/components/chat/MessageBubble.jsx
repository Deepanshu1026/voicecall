import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatFileSize } from '../../utils/helpers';
import { HiOutlineArrowUturnLeft } from 'react-icons/hi2';
import { HiCheck } from 'react-icons/hi2';

const MessageBubble = ({ message, isOwn, onReply, variant = 'default' }) => {
  const { user } = useAuth();
  const currentUserId = user?._id;

  const deletedForMe = message.deletedFor?.some((id) => {
    const idStr = typeof id === 'object' ? id?._id || id?.toString() : id;
    return idStr === currentUserId;
  });

  if (deletedForMe) return null;

  if (message.isDeleted && !isOwn) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="text-xs text-gray-400 italic bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
          This message was deleted
        </div>
      </div>
    );
  }

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full italic">
          {message.content}
        </div>
      </div>
    );
  }

  const renderFile = () => {
    if (message.type !== 'file' && message.type !== 'image') return null;
    if (!message.fileName) return null;

    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(message.fileName);
    const fileUrl = message.fileUrl || `/uploads/${message.fileName}`;

    if (isImage) {
      return (
        <div className="mb-1">
          <img
            src={fileUrl}
            alt={message.fileName}
            className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(fileUrl, '_blank')}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <a
            href={fileUrl}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-500 hover:text-blue-700"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-black/10 dark:bg-white/10">
        <svg className="w-6 h-6 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{message.fileName}</p>
          {message.fileSize && <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>}
        </div>
        <a href={fileUrl} download={message.fileName} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </a>
      </div>
    );
  };

  const bubbleBg = isOwn
    ? 'bg-chat-sent dark:bg-chat-sentDark text-white'
    : 'bg-chat-received dark:bg-chat-receivedDark text-gray-900 dark:text-gray-100';

  const bubbleRound = isOwn
    ? 'rounded-2xl rounded-br-md'
    : 'rounded-2xl rounded-bl-md';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-1 mb-1.5 group relative`}>
      <div className={`${isOwn ? 'order-first' : 'order-last'} opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex-shrink-0`}>
        <button
          onClick={() => onReply()}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Reply"
        >
          <HiOutlineArrowUturnLeft className="w-4 h-4" />
        </button>
      </div>

      <div className={`max-w-[75%] sm:max-w-[65%] ${bubbleBg} ${bubbleRound} px-3 py-1.5 shadow-sm`}>
        {message.replyTo && (
          <div className={`mb-1 px-2 py-1 text-xs rounded border-l-2 ${isOwn ? 'border-white/40 bg-white/10' : 'border-primary-400 bg-gray-200/60 dark:bg-gray-700/50'}`}>
            <p className={`font-medium ${isOwn ? 'text-white/80' : 'text-primary-600 dark:text-primary-400'}`}>Replying</p>
            <p className={`truncate ${isOwn ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
              {message.replyTo?.content || 'Original message'}
            </p>
          </div>
        )}

        {renderFile()}

        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-sm">{r.emoji}</span>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] leading-none ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="flex-shrink-0">
              {message.status === 'seen' ? (
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.457.457 0 00-.304-.102.493.493 0 00-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 00-.336-.153.456.456 0 00-.331.154.543.543 0 00-.14.376c0 .145.049.28.14.376l2.426 2.557a.49.49 0 00.348.178.45.45 0 00.344-.178l6.42-7.963a.544.544 0 00.14-.376.5.5 0 00-.145-.331l.02-.031zM7.726 9.005a.496.496 0 00.18-.027l.885-.445a.51.51 0 00.101-.052l2.737-3.38a.45.45 0 00.17-.367.459.459 0 00-.156-.381.492.492 0 00-.385-.113.458.458 0 00-.356.212l-2.437 3.022-1.704-1.775a.456.456 0 00-.331-.153.463.463 0 00-.331.154.543.543 0 00-.14.376c0 .146.049.28.14.376l2.167 2.258a.45.45 0 00.36.178z"/></svg>
              ) : message.status === 'delivered' ? (
                <HiCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <HiCheck className="w-3.5 h-3.5 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;