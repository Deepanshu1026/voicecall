const TypingIndicator = () => {
  return (
    <div className="message-bubble-received inline-flex items-center gap-1.5 py-2.5 px-3.5">
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
    </div>
  );
};

export default TypingIndicator;
