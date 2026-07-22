import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useCall } from '../context/CallContext';
import { useChat } from '../hooks/useChat';
import LandingLayout from '../components/user/LandingLayout';
import ChatArea from '../components/chat/ChatArea';
import { userAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/consultants.css';
import { FiMessageCircle, FiPhone, FiStar, FiBriefcase, FiUsers, FiGlobe, FiX, FiAward } from 'react-icons/fi';

const staticConsultants = [
  {
    id: 1,
    name: 'Kaveesh Kapoor',
    avatar: '/images/user/kaveesh.webp',
    expertise: 'Immigration Lawyer • Work & Tourist Visas',
    language: 'English, Hindi',
    experience: '12',
    status: 'Active',
    clients: '1,200',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Study Visa Expert • UK, Canada, Australia',
    language: 'English, Hindi, Punjabi',
    experience: '8',
    status: 'Active',
    clients: '850',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 3,
    name: 'Rahul Verma',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Work Permit Specialist • Europe & USA',
    language: 'English, Hindi',
    experience: '7',
    status: 'Active',
    clients: '620',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 4,
    name: 'Anjali Gupta',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Tourist Visa Advisor • Schengen & UK',
    language: 'English, Hindi',
    experience: '5',
    status: 'Unavailable',
    clients: '430',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 5,
    name: 'Sandeep Yadav',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Transit Visa & Documentation Expert',
    language: 'English, Hindi',
    experience: '6',
    status: 'Unavailable',
    clients: '310',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 6,
    name: 'Meera Iyer',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Family Visa & Settlement Expert',
    language: 'English, Hindi, Tamil',
    experience: '9',
    status: 'Active',
    clients: '740',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 7,
    name: 'Amit Singh',
    avatar: '/images/user/userdemo.webp',
    expertise: 'USA Visa & Interview Coach',
    language: 'English, Hindi',
    experience: '10',
    status: 'Active',
    clients: '980',
    price: 'Free',
    oldPrice: '₹20/min',
  },
  {
    id: 8,
    name: 'Neha Joshi',
    avatar: '/images/user/userdemo.webp',
    expertise: 'Australia & New Zealand Visa Expert',
    language: 'English, Hindi, Marathi',
    experience: '4',
    status: 'Unavailable',
    clients: '280',
    price: 'Free',
    oldPrice: '₹20/min',
  },
];

const getTier = (years) => {
  const y = parseInt(years, 10) || 0;
  if (y >= 5) return { key: 'gold', label: 'Top Expert', className: 'tier-gold' };
  if (y >= 3) return { key: 'silver', label: 'Expert', className: 'tier-silver' };
  return { key: 'bronze', label: 'Rising Star', className: 'tier-bronze' };
};

const ConsultantCard = memo(({ consultant, isOnline, onStartChat, onStartCall }) => {
  const name = consultant.name || consultant.displayName || consultant.username;
  const avatar = consultant.avatar?.url || consultant.avatar || '/images/user/userdemo.webp';
  const expertise = consultant.expertise || consultant.bio || 'Visa Consultant';
  const language = consultant.languages || consultant.language || 'English, Hindi';
  const experience = consultant.experience || '5';
  const clients = consultant.clients || '100';
  const rating = consultant.rating || 4.8;
  const tier = getTier(experience);

  return (
    <div className="card">
      <div className="card-top-badges">
        <div className={`tier-badge ${tier.className}`}>
          <FiAward className="tier-icon" />
          {tier.label}
        </div>
        <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          <span className="status-dot" />
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="card-center">
        <div className={`avatar-ring ${isOnline ? 'online' : 'offline'}`}>
          <img
            src={avatar}
            alt={name}
            className="profile-img"
            onError={(e) => {
              e.target.src = '/images/user/userdemo.webp';
            }}
          />
        </div>

        <div className="name-row">
          <h5 className="consultant-name" title={name}>
            {name}
          </h5>
          <div className="verification-ticks" title={isOnline ? 'Verified & online' : 'Offline'}>
            {isOnline ? (
              <svg className="verify-tickk" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none">
                <g>
                  <path d="M10.75 28.125L8.375 24.125L3.875 23.125L4.3125 18.5L1.25 15L4.3125 11.5L3.875 6.875L8.375 5.875L10.75 1.875L15 3.6875L19.25 1.875L21.625 5.875L26.125 6.875L25.6875 11.5L28.75 15L25.6875 18.5L26.125 23.125L21.625 24.125L19.25 28.125L15 26.3125L10.75 28.125ZM13.6875 19.4375L20.75 12.375L19 10.5625L13.6875 15.875L11 13.25L9.25 15L13.6875 19.4375Z" fill="#689A18" />
                </g>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 28 27" fill="none">
                <path d="M9.5 26.25L7.125 22.25L2.625 21.25L3.0625 16.625L0 13.125L3.0625 9.625L2.625 5L7.125 4L9.5 0L13.75 1.8125L18 0L20.375 4L24.875 5L24.4375 9.625L27.5 13.125L24.4375 16.625L24.875 21.25L20.375 22.25L18 26.25L13.75 24.4375L9.5 26.25ZM12.4375 17.5625L19.5 10.5L17.75 8.6875L12.4375 14L9.75 11.375L8 13.125L12.4375 17.5625Z" fill="#808080" />
              </svg>
            )}
          </div>
        </div>

        <p className="expertise-title" title={expertise}>
          {expertise}
        </p>

        <div className="rating-mini" title={`Rating ${rating}`}>
          <FiStar className="rating-mini-icon" />
          {rating}
        </div>
      </div>

      <div className="card-meta">
        <span className="meta-item" title={`${experience}+ years experience`}>
          <FiBriefcase className="meta-icon" />
          {experience}+ yrs
        </span>
        <span className="meta-item" title={`${clients} clients served`}>
          <FiUsers className="meta-icon" />
          {clients}
        </span>
        <span className="meta-item" title={`Languages: ${language}`}>
          <FiGlobe className="meta-icon" />
          {language}
        </span>
      </div>

      <div className="card-footer">
        <div className="price-tag">
          <span className="price">
            {consultant.callRate > 0 ? `₹${consultant.callRate}/min` : (consultant.price || 'Free')}
          </span>
          {consultant.callRate > 0 && (
            <span className="old-price">{consultant.oldPrice || '₹20/min'}</span>
          )}
        </div>
        <div className="btn-container">
          <button
            className={`btn btn-chat ${isOnline ? 'online-btn' : 'offline-btn'}`}
            disabled={!isOnline}
            onClick={() => onStartChat(consultant)}
          >
            <FiMessageCircle className="btn-icon" />
            Chat
          </button>
          <button
            className={`btn btn-call ${isOnline ? 'online-btn' : 'offline-btn'}`}
            disabled={!isOnline}
            onClick={() => onStartCall(consultant)}
          >
            <FiPhone className="btn-icon" />
            Call
          </button>
        </div>
      </div>
    </div>
  );
});

const Consultants = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { on, isUserOnline } = useSocket();
  const chat = useChat();
  const { startCall } = useCall();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useStatic, setUseStatic] = useState(false);
  const [wallet, setWallet] = useState({ balance: user?.walletBalance || 0 });

  useEffect(() => {
    setWallet((prev) => ({ ...prev, balance: user?.walletBalance || 0 }));
  }, [user?.walletBalance]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState(100);
  const [addingMoney, setAddingMoney] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversation, setChatConversation] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const fetchWallet = async () => {
      try {
        const res = await userAPI.getWallet();
        if (!cancelled) setWallet(res.data?.data || { balance: 0 });
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchWallet();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.walletBalance]);

  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAddingMoney(true);
    try {
      const res = await userAPI.addMoney(addAmount);
      setWallet(res.data?.data || { balance: 0 });
      toast.success(`₹${addAmount} added to your wallet`);
      setShowAddMoney(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to add money');
    } finally {
      setAddingMoney(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchConsultants = async () => {
      try {
        const res = await userAPI.getConsultants();
        const data = res.data?.data || [];
        if (!cancelled) {
          if (data.length > 0) {
            setConsultants(data);
          } else {
            setConsultants(staticConsultants);
            setUseStatic(true);
          }
        }
      } catch (err) {
        console.error('Failed to load consultants:', err);
        if (!cancelled) {
          setConsultants(staticConsultants);
          setUseStatic(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchConsultants();
    return () => {
      cancelled = true;
    };
  }, []);

  const openChatById = useCallback(async (targetId) => {
    try {
      const res = await chatAPI.getOrCreateConversation(targetId);
      const conversation = res.data?.data;
      if (!conversation) return;
      chat.setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      setChatConversation(conversation);
      setChatOpen(true);
      chat.loadMessages(conversation._id, true);
      setSearchParams({}, { replace: true });
    } catch (error) {
      console.error('Failed to open chat:', error);
      toast.error('Could not open chat');
    }
  }, [chat, setSearchParams]);

  const handleStartChat = useCallback((consultant) => {
    if (!isAuthenticated) {
      toast('Please sign in to chat with a consultant', { icon: '🔒' });
      navigate('/login');
      return;
    }
    if (useStatic) {
      toast('This consultant is not available for live chat yet.', { icon: 'ℹ️' });
      return;
    }
    openChatById(consultant._id);
  }, [isAuthenticated, navigate, useStatic, openChatById]);

  const handleStartCall = useCallback((consultant) => {
    if (!isAuthenticated) {
      toast('Please sign in to call a consultant', { icon: '🔒' });
      navigate('/login');
      return;
    }
    if (useStatic) {
      toast('This consultant is not available for live calls yet.', { icon: 'ℹ️' });
      return;
    }
    startCall(consultant._id || consultant.id, consultant, 'audio');
  }, [isAuthenticated, navigate, useStatic, startCall]);

  // Open chat popup from URL ?userId=...
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId || !isAuthenticated) return;
    openChatById(userId);
  }, [searchParams, isAuthenticated, openChatById]);

  // Listen for incoming messages in the chat popup
  useEffect(() => {
    const handleNewMessage = (message) => {
      chat.addMessage(message.conversation, message);
    };
    const cleanup = on('message:new', handleNewMessage);
    return cleanup;
  }, [on, chat]);

  const filtered = consultants
    .filter((c) => {
      const q = search.toLowerCase();
      const name = c.name || c.displayName || c.username || '';
      const expertise = c.expertise || c.bio || '';
      const language = c.languages || c.language || '';
      return (
        name.toLowerCase().includes(q) ||
        expertise.toLowerCase().includes(q) ||
        language.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Real-time online status only; don't rely on the DB workStatus fallback,
      // which can stay 'active' after the agent has actually disconnected.
      const aOnline = isUserOnline(a._id);
      const bOnline = isUserOnline(b._id);
      return (bOnline ? 1 : 0) - (aOnline ? 1 : 0);
    });

  const activeUser = isAuthenticated
    ? {
        name: user?.displayName || user?.username || 'User',
        phone: user?.email || '',
        avatar: user?.avatar?.url || '/images/user/userdemo.webp',
      }
    : null;

  return (
    <LandingLayout>
      <div className="consultants-page">
        <div className="margin-from-bottom">
          {/* Reference-style navbar with search and profile/login */}
          <div id="navbar">
            <div id="main-nav">
              <div id="search-container">
                <input
                  type="text"
                  placeholder="Search by name, expertise or language"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button id="search-clear" aria-label="Clear search" onClick={() => setSearch('')}>
                    <FiX />
                  </button>
                )}
                <button id="search-button" aria-label="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11 16.5C14.0376 16.5 16.5 14.0376 16.5 11C16.5 7.96243 14.0376 5.5 11 5.5C7.96243 5.5 5.5 7.96243 5.5 11C5.5 14.0376 7.96243 16.5 11 16.5Z" stroke="black" />
                    <path d="M15 15L19 19" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {activeUser ? (
                <>
                  <div id="balance" onClick={() => setShowAddMoney(true)} style={{ cursor: 'pointer' }}>
                    <span>₹{wallet.balance}</span>
                    <button className="add-money-btn" title="Add money">+</button>
                  </div>
                  <div id="profile" onClick={() => setProfileOpen((p) => !p)} style={{ cursor: 'pointer' }}>
                    <img id="thisprofile" src={activeUser.avatar} alt="Profile Picture" />
                  </div>
                </>
              ) : (
                <div id="balance">
                  <a href="/login">Login</a>
                </div>
              )}
            </div>
          </div>

          {showAddMoney && (
            <div className="add-money-modal" onClick={() => setShowAddMoney(false)}>
              <div className="add-money-content" onClick={(e) => e.stopPropagation()}>
                <h3>Recharge Wallet</h3>
                <p className="current-balance">Current balance: <strong>₹{wallet.balance}</strong></p>
                <input
                  type="number"
                  min="10"
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  className="add-money-input"
                />
                <div className="add-money-actions">
                  <button
                    onClick={handleAddMoney}
                    disabled={addingMoney || addAmount <= 0}
                    className="add-money-confirm"
                  >
                    {addingMoney ? 'Adding...' : `Add ₹${addAmount}`}
                  </button>
                  <button onClick={() => setShowAddMoney(false)} className="add-money-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeUser && profileOpen && (
            <div className="profile-card" style={{ display: 'block' }}>
              <div className="profile-image">
                <img id="profile" src={activeUser.avatar} alt="User Image" />
              </div>
              <div className="profile-name">{activeUser.name}</div>
              <div className="profile-phone">{activeUser.phone}</div>
              <a href="/profile">
                <button className="profile-btn">View Profile</button>
              </a>
              <div className="info-section-consultant">
                <button
                  className="profile-btn"
                  onClick={() => {
                    logout();
                    navigate('/home');
                  }}
                  style={{ width: '100%' }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <div className="consultant-section">
            <div className="consultant-section-header">
              <h2>Our Immigration Advisers</h2>
              {!loading && (
                <span className="consultant-count">
                  {filtered.length} {filtered.length === 1 ? 'consultant' : 'consultants'}
                </span>
              )}
            </div>
          </div>

          {/* Reference-style tabs (decorative for now) */}
          <div className="tabs-con-container">
            <div className="tabs-con-header">
              <h2>Recent Video Call</h2>
              <div className="tabs-con-icon-group">
                <div
                  className={`tabs-con-icon-button video ${activeTab === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveTab('video')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#clipVideo)">
                      <path d="M9.55556 10.3333V11.8889C9.55556 12.0952 9.47361 12.293 9.32775 12.4389C9.18189 12.5847 8.98406 12.6667 8.77778 12.6667H3.33333L1 15V7.22222C1 7.01594 1.08194 6.81811 1.22781 6.67225C1.37367 6.52639 1.5715 6.44444 1.77778 6.44444H3.33333M15 9.55556L12.6667 7.22222H7.22222C7.01594 7.22222 6.81811 7.14028 6.67225 6.99442C6.52639 6.84855 6.44444 6.65072 6.44444 6.44444V1.77778C6.44444 1.5715 6.52639 1.37367 6.67225 1.22781C6.81811 1.08194 7.01594 1 7.22222 1H14.2222C14.4285 1 14.6263 1.08194 14.7722 1.22781C14.9181 1.37367 15 1.5715 15 1.77778V9.55556Z" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                      <clipPath id="clipVideo">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div
                  className={`tabs-con-icon-button phone ${activeTab === 'phone' ? 'active' : ''}`}
                  onClick={() => setActiveTab('phone')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M3.71516 0.0823959L2.89299 0.292456C2.16093 0.479689 1.50716 0.840387 1.00864 1.33209C0.510127 1.8238 0.187606 2.42605 0.0790411 3.06796C-0.261523 5.07909 0.499872 7.43059 2.33571 10.1273C4.16695 12.8173 6.18282 14.5502 8.40164 15.3088C9.11456 15.5525 9.895 15.6174 10.6502 15.4959C11.4053 15.3743 12.1035 15.0714 12.6616 14.6232L13.2831 14.1233C13.6866 13.7994 13.9378 13.3622 13.9899 12.893C14.042 12.4239 13.8915 11.9546 13.5663 11.5725L12.0114 9.74416C11.8012 9.49734 11.5052 9.31249 11.1648 9.21552C10.8245 9.11856 10.4569 9.11433 10.1136 9.20345L7.76179 9.81321L7.70102 9.82294C7.44187 9.85503 6.8433 9.37948 6.09796 8.28444C5.31822 7.13884 5.15768 6.46879 5.37211 6.29568L6.5681 5.34944C7.00502 5.00344 7.30347 4.55025 7.42169 4.05328C7.53991 3.55632 7.472 3.04044 7.22744 2.57783L6.46834 1.14728C6.24008 0.716798 5.83502 0.371401 5.32869 0.175476C4.82235 -0.020449 4.24813 -0.0535314 3.71516 0.0823959ZM5.42486 1.54601L6.18167 2.97655C6.32854 3.25402 6.36948 3.56349 6.29875 3.86166C6.22802 4.15983 6.04917 4.4318 5.78721 4.63952L4.58778 5.58673C3.81951 6.2033 4.07407 7.25554 5.10608 8.77069C6.07617 10.1964 6.96141 10.9005 7.91316 10.7779L8.05534 10.7526L10.4496 10.1332C10.5641 10.1033 10.6866 10.1047 10.8002 10.1369C10.9137 10.1692 11.0124 10.2308 11.0826 10.3131L12.6375 12.1414C12.8003 12.3324 12.8757 12.5671 12.8498 12.8018C12.8239 13.0365 12.6983 13.2552 12.4964 13.4173L11.8738 13.9172C11.4751 14.2371 10.9766 14.4533 10.4373 14.54C9.89802 14.6267 9.34073 14.5803 8.83165 14.4063C6.88458 13.7411 5.04416 12.1589 3.32988 9.64108C1.61101 7.11745 0.914971 4.97114 1.21425 3.20606C1.29173 2.74746 1.52208 2.31718 1.8782 1.96588C2.23432 1.61458 2.70138 1.35688 3.22438 1.22314L4.04655 1.01308C4.31311 0.945146 4.5997 0.961758 4.85287 1.05981C5.10605 1.15787 5.30854 1.33067 5.42257 1.54601" fill="black" />
                  </svg>
                </div>
                <div
                  className={`tabs-con-icon-button message ${activeTab === 'message' ? 'active' : ''}`}
                  onClick={() => setActiveTab('message')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 6.33333L12.6559 5.00567C12.7448 4.96124 12.8436 4.94026 12.9429 4.94474C13.0422 4.94921 13.1387 4.97898 13.2233 5.03122C13.3078 5.08346 13.3776 5.15644 13.4261 5.24324C13.4745 5.33004 13.4999 5.42777 13.5 5.52717V9.47283C13.4999 9.57223 13.4745 9.66996 13.4261 9.75676C13.3776 9.84356 13.3078 9.91654 13.2233 9.96878C13.1387 10.021 13.0422 10.0508 12.9429 10.0553C12.8436 10.0597 12.7448 10.0388 12.6559 9.99433L10 8.66667V6.33333ZM3 5.16667C3 4.85725 3.12292 4.5605 3.34171 4.34171C3.5605 4.12292 3.85725 4 4.16667 4H8.83333C9.14275 4 9.4395 4.12292 9.65829 4.34171C9.87708 4.5605 10 4.85725 10 5.16667V9.83333C10 10.1428 9.87708 10.4395 9.65829 10.6583C9.4395 10.8771 9.14275 11 8.83333 11H4.16667C3.85725 11 3.5605 10.8771 3.34171 10.6583C3.12292 10.4395 3 10.1428 3 9.83333V5.16667Z" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="outer-parent-card">
            <div className="parent-card">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-${i}`} className="skeleton-card">
                    <div className="skeleton-circle" />
                    <div className="skeleton-lines">
                      <div className="skeleton-line short" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line medium" />
                      <div className="skeleton-line" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="consultants-empty">
                  <h3>No consultants available right now</h3>
                  <p>Please check back later or try a different search.</p>
                </div>
              ) : (
                filtered.map((consultant) => (
                  <ConsultantCard
                    key={consultant._id || consultant.id}
                    consultant={consultant}
                    isOnline={isUserOnline(consultant._id)}
                    onStartChat={handleStartChat}
                    onStartCall={handleStartCall}
                  />
                ))
              )}
            </div>
          </div>

          <div className="peragraph-section">
            <h1>How Connecting with a Voicecall Consultant can help you?</h1>
            <p>
              Getting expert advice can be confusing, especially when you need quick answers. Connecting with a
              consultant at Voicecall helps simplify the process. Our consultants are trained to provide clear,
              accurate guidance for career, business, travel, education, and personal queries.
              As a trusted voice consultation platform, we guide you through each step and help you avoid common
              mistakes that can lead to delays or wrong decisions. You can connect through chat or voice call to
              ask questions and get real-time advice. Voicecall is here to ensure that every user receives the right
              guidance from the most trusted consultants in the field.
            </p>
          </div>
          <div className="peragraph-section margin-up-p">
            <h1>Connection With Voicecall Consultant - FAQs</h1>
            <p>
              Voicecall offers simple and direct consultation services through live chat and voice calls. Whether you
              need quick answers through chat or a direct phone conversation for detailed help, our system is built
              to assist from anywhere. Planning a career move, a business decision, or a personal consultation? Our
              consultants are ready to help you at every stage. We offer the latest updates, reduce the chances of
              mistakes, and explain every step clearly. With our user-friendly platform, you won’t need to visit
              offices or wait for appointments. The consultants at Voicecall provide reliable advice and strong
              support throughout your journey. Choose Voicecall for a trusted and efficient consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Chat popup (userchat.php style) */}
      {chatOpen && chatConversation && (
        <div
          className="fixed inset-0 z-[400] bg-[#f0f2f5] dark:bg-[#0a0a1a] flex items-center justify-center p-0 md:p-6 overflow-hidden"
          onClick={() => setChatOpen(false)}
        >
          <div
            className="w-full h-full md:h-[90vh] md:max-w-5xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatArea
              conversation={chatConversation}
              chat={chat}
              onBack={() => setChatOpen(false)}
              onEndChat={() => setChatOpen(false)}
              onClose={() => setChatOpen(false)}
            />
          </div>
        </div>
      )}
    </LandingLayout>
  );
};

export default Consultants;
