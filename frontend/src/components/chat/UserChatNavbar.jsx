import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiBars3,
  HiMagnifyingGlass,
  HiPlus,
  HiUser,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import Avatar from '../common/Avatar';

const UserChatNavbar = ({ user, walletBalance, onAddMoney, onToggleDrawer, searchValue, onSearch }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
      <button
        onClick={onToggleDrawer}
        className="p-2 -ml-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        title="Menu"
      >
        <HiBars3 className="w-6 h-6" />
      </button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search consultant"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition"
          />
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 relative">
        <button
          onClick={onAddMoney}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
        >
          <span>₹{walletBalance}</span>
          <HiPlus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowProfileMenu((p) => !p)}
          className="hidden sm:flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Avatar user={user} size="sm" showStatus />
        </button>

        {showProfileMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.displayName || user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <HiUser className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <HiCog6Tooth className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <HiArrowRightOnRectangle className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChatNavbar;
