import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSun, HiMoon, HiBell, HiMegaphone, HiEye, HiLockClosed, HiTrash } from 'react-icons/hi2';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: user?.settings?.notifications ?? true,
    soundEnabled: user?.settings?.soundEnabled ?? true,
    privacyLastSeen: user?.settings?.privacyLastSeen ?? 'everyone',
    privacyProfilePhoto: user?.settings?.privacyProfilePhoto ?? 'everyone',
  });

  const handleSave = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      const res = await authAPI.updateSettings(newSettings);
      if (res.data.data?.settings) {
        updateUser({ ...user, settings: res.data.data.settings });
        toast.success('Setting updated');
      }
    } catch {
      toast.error('Failed to update setting');
      setSettings(settings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/consultants" className="btn-ghost p-2">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <HiMoon className="w-5 h-5 text-gray-400" /> : <HiSun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'Dark' : 'Light'} mode</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiBell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for new messages and calls</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSave('notifications', !settings.notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiMegaphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Sounds</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSave('soundEnabled', !settings.soundEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiEye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Last Seen</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Who can see your last seen</p>
                  </div>
                </div>
                <select
                  value={settings.privacyLastSeen}
                  onChange={(e) => handleSave('privacyLastSeen', e.target.value)}
                  className="input-field w-auto text-sm py-1"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My Contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiEye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Profile Photo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Who can see your profile photo</p>
                  </div>
                </div>
                <select
                  value={settings.privacyProfilePhoto}
                  onChange={(e) => handleSave('privacyProfilePhoto', e.target.value)}
                  className="input-field w-auto text-sm py-1"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My Contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <Link to="/profile" className="flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
              <HiLockClosed className="w-5 h-5 text-gray-400" />
              <span>Change Password</span>
            </Link>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 dark:border-red-900/30">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  authAPI.deleteAccount().then(() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }).catch(() => toast.error('Failed to delete account'));
                }
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <HiTrash className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
