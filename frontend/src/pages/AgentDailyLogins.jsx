import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const AgentDailyLogins = () => {
  const navigate = useNavigate();
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogins = async (p, d) => {
    try {
      setLoading(true);
      const pageNum = p || page;
      const dateStr = d || date;
      const res = await agentPortalAPI.getDailyLogins(pageNum, dateStr);
      setLogins(res.data.data || []);
      setPagination(res.data.pagination || { current_page: pageNum, total_pages: 1, total_records: 0 });
    } catch (err) {
      toast.error('Failed to load daily logins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins(1, date);
  }, []);

  const handleDateChange = (e) => {
    const d = e.target.value;
    setDate(d);
    setPage(1);
    fetchLogins(1, d);
  };

  const logTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderPagination = () => {
    const total = pagination.total_pages || 1;
    const current = pagination.current_page || 1;
    const go = (p) => { setPage(p); fetchLogins(p, date); };

    const pages = [];
    const range = 2;
    let start = Math.max(1, current - range);
    let end = Math.min(total, current + range);

    if (start > 1) {
      pages.push(<button key={1} className="pagination-btn" onClick={() => go(1)}>1</button>);
      if (start > 2) pages.push(<span key="s1" className="px-1" style={{ color: '#94a3b8' }}>...</span>);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={`pagination-btn ${i === current ? 'active' : ''}`} onClick={() => go(i)}>
          {i}
        </button>
      );
    }
    if (end < total) {
      if (end < total - 1) pages.push(<span key="s2" className="px-1" style={{ color: '#94a3b8' }}>...</span>);
      pages.push(<button key={total} className="pagination-btn" onClick={() => go(total)}>{total}</button>);
    }

    return (
      <div className="d-flex align-items-center gap-1">
        <button className="pagination-btn" disabled={current <= 1} onClick={() => go(current - 1)}>
          <i className="bi bi-chevron-left" />
        </button>
        {pages}
        <button className="pagination-btn" disabled={current >= total} onClick={() => go(current + 1)}>
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>Daily Logins</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Agent login history.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </button>
      </div>

      {/* Filter */}
      <div className="agent-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div className="d-flex align-items-center gap-3">
          <label style={{ fontWeight: 500, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            <i className="bi bi-calendar3 me-2" />Date:
          </label>
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: '250px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
            value={date}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="agent-card">
        <div className="agent-card-header">
          <h3>Login Records</h3>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Total: <strong>{pagination.total_records}</strong>
          </span>
        </div>
        <div className="agent-card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="agent-loading">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading data...</p>
            </div>
          ) : (
            <>
              <table className="agent-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Login From</th>
                    <th>Login Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="agent-empty">
                          <i className="bi bi-inbox" />
                          <div className="fw-semibold">No logins found</div>
                          <div className="small">No records for this date.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logins.map((login, idx) => (
                      <tr key={idx}>
                        <td style={{ color: '#718096', fontSize: '0.85rem' }}>{(pagination.current_page - 1) * 10 + idx + 1}</td>
                        <td><span className="fw-semibold">{login.user_name}</span></td>
                        <td>{login.user_email}</td>
                        <td>{login.user_mobile || 'N/A'}</td>
                        <td>
                          <span className={`badge bg-${login.login_from === 'app' ? 'info' : 'secondary'} text-white`} style={{ padding: '0.35em 0.6em', fontSize: '0.75rem', borderRadius: '6px' }}>
                            {login.login_from}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{logTime(login.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {logins.length > 0 && (
                <div className="agent-pagination">
                  <div className="page-info">
                    Showing page {pagination.current_page} of {pagination.total_pages}
                  </div>
                  <nav>{renderPagination()}</nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AgentDailyLogins;