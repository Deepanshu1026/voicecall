import { useState, useRef, useEffect } from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        if (onClear) onClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  return (
    <div className={`relative flex items-center transition-all duration-200 ${focused ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}>
      <HiMagnifyingGlass className={`absolute left-3 w-4 h-4 ${focused ? 'text-primary-500' : 'text-gray-400'}`} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => {
            if (onClear) onClear();
            if (onChange) onChange('');
          }}
          className="absolute right-2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <HiXMark className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
