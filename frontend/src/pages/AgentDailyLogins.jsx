import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const todayStr = () => new Date().toISOString().split('T')[0];

const AgentDailyLogins = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [fromDate, setFromDate] = useState(isAdmin ? '' : todayStr());
  const [toDate, setToDate] = useState(isAdmin ? '' : todayStr());
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchLogins = async (p, from, to, s) => {
    try {
      setLoading(true);
      const pageNum = p || page;
      const fromStr = from === undefined ? fromDate : from;
      const toStr = to === undefined ? toDate : to;
      const searchStr = isAdmin ? (s === undefined ? search : s) : '';
      const apiCall = isAdmin ? agentPortalAPI.getNewUsers : agentPortalAPI.getDailyLogins;
      const res = await apiCall(pageNum, fromStr, toStr, searchStr);
      setLogins(res.data.data || []);
      setPagination(res.data.pagination || { current_page: pageNum, total_pages: 1, total_records: 0 });
    } catch (err) {
      toast.error(isAdmin ? 'Failed to load new users' : 'Failed to load logins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins(1, fromDate, toDate, search);
  }, []);

  const handleFromChange = (e) => {
    const v = e.target.value;
    setFromDate(v);
    setPage(1);
    fetchLogins(1, v, toDate, isAdmin ? search : '');
  };

  const handleToChange = (e) => {
    const v = e.target.value;
    setToDate(v);
    setPage(1);
    fetchLogins(1, fromDate, v, isAdmin ? search : '');
  };

  const handleSearchChange = (e) => {
    const s = e.target.value;
    setSearch(s);
    setPage(1);
    fetchLogins(1, fromDate, toDate, s);
  };

  const logTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      toast.error('"From" date cannot be after "To" date');
      return;
    }
    try {
      setExporting(true);
      const res = await agentPortalAPI.exportNewUsers(fromDate, toDate, search);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const range = fromDate && toDate ? `${fromDate}_to_${toDate}` : (fromDate || toDate || todayStr());
      link.download = `new-users-${range}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel export downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel');
    } finally {
      setExporting(false);
    }
  };

  const renderPagination = () => {
    const total = pagination.total_pages || 1;
    const current = pagination.current_page || 1;
    const go = (p) => { setPage(p); fetchLogins(p, fromDate, toDate, isAdmin ? search : ''); };

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
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>
            {isAdmin ? 'New Users' : 'Daily Logins'}
          </h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            {isAdmin ? 'All newly registered users with details.' : 'Agent login history.'}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isAdmin && (
            <button
              className="agent-btn agent-btn-primary"
              onClick={handleExport}
              disabled={exporting}
              title="Export non-guest users with contact details to Excel"
            >
              {exporting ? (
                <>
                  <span className="spinner-border spinner-border-sm" /> Exporting...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-excel" /> Export to Excel
                </>
              )}
            </button>
          )}
          <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
            <i className="bi bi-arrow-left" /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="agent-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <label style={{ fontWeight: 500, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            <i className="bi bi-calendar3 me-2" />From:
          </label>
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: '200px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
            value={fromDate}
            max={toDate || undefined}
            onChange={handleFromChange}
          />
          <label style={{ fontWeight: 500, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            To:
          </label>
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: '200px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
            value={toDate}
            min={fromDate || undefined}
            onChange={handleToChange}
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              className="agent-btn agent-btn-outline-dark"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => { setFromDate(''); setToDate(''); setPage(1); fetchLogins(1, '', '', isAdmin ? search : ''); }}
            >
              <i className="bi bi-x-lg" /> Clear
            </button>
          )}
          {isAdmin && (
            <>
              <label style={{ fontWeight: 500, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                <i className="bi bi-search me-2" />Search:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Name, email, or mobile"
                style={{ maxWidth: '300px', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.5rem 1rem' }}
                value={search}
                onChange={handleSearchChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="agent-card">
        <div className="agent-card-header">
          <h3>{isAdmin ? 'New User Records' : 'Login Records'}</h3>
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
                    {isAdmin && <th>Country</th>}
                    <th>{isAdmin ? 'Source' : 'Login From'}</th>
                    <th>{isAdmin ? 'Registered At' : 'Login Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6}>
                        <div className="agent-empty">
                          <i className="bi bi-inbox" />
                          <div className="fw-semibold">{isAdmin ? 'No new users found' : 'No logins found'}</div>
                          <div className="small">{isAdmin ? 'No registered users match this filter.' : 'No records for this date.'}</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logins.map((login, idx) => (
                      <tr key={idx}>
                        <td style={{ color: '#718096', fontSize: '0.85rem' }}>{(pagination.current_page - 1) * 10 + idx + 1}</td>
                        <td><span className="fw-semibold">{login.user_name}</span></td>
                        <td>{login.user_email}</td>
                        <td>{login.country_code ? `+${login.country_code} ${login.user_mobile || ''}` : (login.user_mobile || 'N/A')}</td>
                        {isAdmin && <td>{login.country_code ? `+${login.country_code}` : 'N/A'}</td>}
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