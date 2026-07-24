import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ConversationItem from '../chat/ConversationItem';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import { userAPI, chatAPI } from '../../services/api';
import { getDisplayName, debounce } from '../../utils/helpers';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';

const Sidebar = ({ activeConversation, onSelectConversation, chat, showHeader = true }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chats');

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
    <div className="flex flex-col h-full w-full bg-white dark:bg-surface-dark">
      {showHeader && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <button onClick={() => setShowProfile(!showProfile)} className="relative group">
              <Avatar user={user} size="md" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">VoiceCall</h1>
            <div className="flex items-center gap-1">
              <Avatar user={user} size="xs" />
              <button onClick={logout} className="btn-ghost p-2 text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setSelectedTab('chats')}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative ${
                selectedTab === 'chats' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <HiChatBubbleLeftRight className="w-4 h-4 mx-auto mb-0.5" />
              Chats
              {selectedTab === 'chats' && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-600 rounded-full" />}
            </button>
          </div>
        </>
      )}

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
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <Avatar user={u} showStatus size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getDisplayName(u)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.username}{u.bio ? ` - ${u.bio.substring(0, 30)}` : ''}</p>
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
                  <HiChatBubbleLeftRight className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Search for users above to start chatting</p>
                </div>
              )}
            </>
          )}

          {!showHeader && selectedTab === 'calls' && (
            <div className="text-center py-12 px-4">
              <HiChatBubbleLeftRight className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No call history</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Your call history will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Online users count */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{onlineUsers.length} online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
