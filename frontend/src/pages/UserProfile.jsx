import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiChatBubbleLeftRight, HiPhone, HiVideoCamera, HiCalendar, HiMapPin, HiCurrencyRupee } from 'react-icons/hi2';
import { getAvatarUrl, getDisplayName, getInitials, formatLastSeen } from '../utils/helpers';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCall } = useCall();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getProfileById(id);
        const p = res.data?.data?.profile || null;
        setProfile(p);
        if (user && p) {
          setIsCurrentUser(user._id === p._id || user._id === id);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id, user]);

  const handleStartChat = () => {
    if (isCurrentUser) {
      navigate('/profile');
      return;
    }
    if (!user) {
      // Not logged in — redirect to login with return path
      navigate(`/login?redirect=/chat?userId=${id}`);
      return;
    }
    navigate(`/chat?userId=${id}`);
  };

  const handleCall = (type) => {
    if (isCurrentUser) {
      toast('You cannot call yourself');
      return;
    }
    startCall(id, null, type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">Profile not found.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profile);
  const displayName = getDisplayName(profile);
  const isAgent = profile.accountType === 'employee' || profile.role === 'agent';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        <div className="card mb-6 text-center">
          <div className="relative inline-block">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-md" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary-600 flex items-center justify-center mx-auto border-4 border-white shadow-md">
                <span className="text-3xl text-white font-semibold">{getInitials(displayName)}</span>
              </div>
            )}
            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                profile.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">{displayName}</h2>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="text-sm text-gray-400 mt-1">
            {profile.status === 'online' ? 'Online' : formatLastSeen(profile.lastSeen)}
          </p>
          {profile.bio && (
            <p className="text-gray-600 mt-3 text-sm max-w-md mx-auto">{profile.bio}</p>
          )}

          {isAgent && profile.callRate !== undefined && (
            <div className="inline-flex items-center gap-1 mt-4 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              <HiCurrencyRupee className="w-4 h-4" />
              ₹{profile.callRate}/min
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <button onClick={handleStartChat} className="btn-primary flex items-center gap-2">
              <HiChatBubbleLeftRight className="w-4 h-4" />
              {isCurrentUser ? 'My Profile' : 'Message'}
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          {(!isAgent && (profile.mobile || profile.email)) && (
            <div className="flex items-center gap-3">
              <HiPhone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <div className="font-medium text-gray-900">
                  {profile.mobile && <p>{profile.mobile}</p>}
                  {profile.email && <p className="text-sm text-gray-600">{profile.email}</p>}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <HiMapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium text-gray-900 capitalize">{isAgent ? 'Consultant / Agent' : 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HiCalendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium text-gray-900">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
