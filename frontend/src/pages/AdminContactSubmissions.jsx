import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/agentPortal.css';

const AdminContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0 });

  const fetchSubmissions = async (p) => {
    setLoading(true);
    try {
      const res = await api.get('/settings/contact/submissions', { params: { page: p || page, limit: 20 } });
      setSubmissions(res.data.data || []);
      setPagination(res.data.pagination || { current_page: p || 1, total_pages: 1, total_records: 0 });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(1); }, []);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' + new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="agent-card" style={{ margin: '20px' }}>
      <div className="agent-card-header">
        <h3>Contact Form Submissions</h3>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
          Total: <strong>{pagination.total_records}</strong>
        </span>
      </div>
      <div className="agent-card-body" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div className="agent-loading"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Loading...</p></div>
        ) : (
          <>
            <table className="agent-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Page</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan={7}><div className="agent-empty"><i className="bi bi-inbox" /><div className="fw-semibold">No submissions yet</div></div></td></tr>
                ) : (
                  submissions.map((s, idx) => (
                    <tr key={s.id}>
                      <td style={{ color: '#718096', fontSize: '0.85rem' }}>{(pagination.current_page - 1) * 20 + idx + 1}</td>
                      <td className="fw-semibold">{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.phone}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message}</td>
                      <td>{s.page}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(s.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {submissions.length > 0 && (
              <div className="agent-pagination">
                <div className="page-info">Page {pagination.current_page} of {pagination.total_pages}</div>
                <nav>
                  <button className="pagination-btn" disabled={pagination.current_page <= 1} onClick={() => { setPage(p => p - 1); fetchSubmissions(page - 1); }}><i className="bi bi-chevron-left" /></button>
                  <span className="px-2">{pagination.current_page}/{pagination.total_pages}</span>
                  <button className="pagination-btn" disabled={pagination.current_page >= pagination.total_pages} onClick={() => { setPage(p => p + 1); fetchSubmissions(page + 1); }}><i className="bi bi-chevron-right" /></button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminContactSubmissions;
