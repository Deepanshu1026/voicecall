import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiCamera } from 'react-icons/hi2';
import { getAvatarUrl, getDisplayName, getInitials } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const isAgent = user?.role === 'agent';
  const [form, setForm] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    email: user?.email || '',
    callRate: user?.callRate ?? 20,
  });
  const [editMode, setEditMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.data.user);
      setEditMode(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSaving(true);
      const res = await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      const { accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/consultants" className="btn-ghost p-2">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>

        <div className="card mb-6 text-center">
          <div className="relative inline-block">
            {avatarUrl ? (
              <img src={avatarUrl} alt={getDisplayName(user)} className="w-24 h-24 rounded-full object-cover mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center mx-auto">
                <span className="text-2xl text-white font-semibold">{getInitials(getDisplayName(user))}</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
              <HiCamera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-3">{getDisplayName(user)}</h2>
          <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
        </div>

        {!editMode && !showPasswordForm && (
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Username</span>
              <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Display Name</span>
              <span className="font-medium text-gray-900 dark:text-white">{user?.displayName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Bio</span>
              <span className="font-medium text-gray-900 dark:text-white">{user?.bio || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
              <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
            </div>
            {isAgent && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Call Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{user?.callRate ?? 20}/min</span>
              </div>
            )}
            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setEditMode(true)} className="btn-primary flex-1">Edit Profile</button>
              <button onClick={() => setShowPasswordForm(true)} className="btn-secondary flex-1">Change Password</button>
            </div>
          </div>
        )}

        {editMode && (
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input type="text" className="input-field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input type="text" className="input-field" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea className="input-field" rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {isAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Call Rate (₹/min)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="input-field"
                  value={form.callRate}
                  onChange={(e) => setForm({ ...form, callRate: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleUpdateProfile} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditMode(false); setForm({ username: user?.username || '', displayName: user?.displayName || '', bio: user?.bio || '', email: user?.email || '', callRate: user?.callRate ?? 20 }); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {showPasswordForm && (
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input type="password" className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" className="input-field" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdatePassword} disabled={saving} className="btn-primary flex-1">{saving ? 'Updating...' : 'Update Password'}</button>
              <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
