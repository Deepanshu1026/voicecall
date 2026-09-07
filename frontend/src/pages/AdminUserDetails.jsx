import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const AdminUserDetails = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await adminAPI.searchUsers(search.trim());
        setResults(res.data?.data || []);
      } catch {
        toast.error('Search failed');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const viewUser = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await adminAPI.getUser(id);
      setSelected(res.data?.data || null);
      setResetOpen(false);
      setNewPassword('');
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await adminAPI.resetUserPassword(selected._id, newPassword);
      toast.success('Password updated successfully');
      setResetOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const mobileDisplay = (u) => {
    const cc = u.countryCode ? `+${u.countryCode} ` : '';
    return u.mobile ? `${cc}${u.mobile}` : '—';
  };

  const detailRows = selected
    ? [
        { label: 'User ID', value: selected._id },
        { label: 'Username', value: selected.username },
        { label: 'Display Name', value: selected.displayName || selected.username },
        { label: 'Email', value: selected.email },
        { label: 'Mobile', value: mobileDisplay(selected) },
        { label: 'Role', value: selected.role },
        { label: 'Status', value: selected.status },
        { label: 'Login From', value: selected.loginFrom || '—' },
        { label: 'Verified', value: selected.isVerified ? 'Yes' : 'No' },
        { label: 'Wallet Balance', value: `₹${selected.walletBalance ?? 0}` },
        { label: 'Call Rate', value: `₹${selected.callRate ?? 0}/min` },
        { label: 'Last Seen', value: fmtDate(selected.lastSeen) },
        { label: 'Created At', value: fmtDate(selected.createdAt) },
        { label: 'Updated At', value: fmtDate(selected.updatedAt) },
      ]
    : [];

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>User Details</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Search and view the complete details of any client.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="agent-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div className="d-flex align-items-center gap-3">
          <label style={{ fontWeight: 500, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            <i className="bi bi-search me-2" />Search:
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Name, username, email, or mobile"
            style={{ maxWidth: '400px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searching && <span className="text-muted" style={{ fontSize: '0.85rem' }}>Searching...</span>}
        </div>

        {search.trim() && !loadingDetail && !selected && (
          <div className="mt-3" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            {results.length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>No users found.</p>
            ) : (
              results.map((u) => (
                <button
                  key={u._id}
                  className="agent-btn agent-btn-sm w-100 text-start"
                  style={{ justifyContent: 'flex-start', marginBottom: '4px' }}
                  onClick={() => viewUser(u._id)}
                >
                  <strong>{u.displayName || u.username}</strong>
                  <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>
                    {u.email} {u.mobile ? `· ${mobileDisplay(u)}` : ''}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail */}
      {loadingDetail ? (
        <div className="agent-loading"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Loading user...</p></div>
      ) : selected ? (
        <div className="agent-card">
          <div className="agent-card-header">
            <h3>User Details</h3>
            <button className="agent-btn agent-btn-sm" onClick={() => { setSelected(null); setSearch(''); }}>
              <i className="bi bi-arrow-left" /> Back
            </button>
          </div>
          <div className="agent-card-body">
            <div className="agent-detail-grid">
              {detailRows.map((row) => (
                <div className="agent-detail-row" key={row.label}>
                  <span className="info-label">{row.label}</span>
                  <span className="info-value" style={{ wordBreak: 'break-word' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Password */}
            <div className="mt-4" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>Password</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Passwords are stored encrypted and cannot be viewed as plain text.
                  </div>
                </div>
                {!resetOpen ? (
                  <button className="agent-btn agent-btn-primary agent-btn-sm" onClick={() => setResetOpen(true)}>
                    <i className="bi bi-key" /> Reset Password
                  </button>
                ) : (
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="New password (min 6 chars)"
                      style={{ maxWidth: '240px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button className="agent-btn agent-btn-primary agent-btn-sm" onClick={resetPassword} disabled={resetting}>
                      {resetting ? 'Saving...' : 'Set Password'}
                    </button>
                    <button className="agent-btn agent-btn-outline agent-btn-sm" onClick={() => { setResetOpen(false); setNewPassword(''); }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminUserDetails;
