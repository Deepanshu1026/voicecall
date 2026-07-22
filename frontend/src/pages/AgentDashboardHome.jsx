import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import '../styles/agentPortal.css';

const statusLabel = (s) => s?.replace(/_/g, ' ') || 'Unknown';

const outcomeClass = (outcome) => {
  const o = (outcome || '').toLowerCase().replace(/\s/g, '');
  if (o.includes('interested')) return 'outcome-interested';
  if (o.includes('later')) return 'outcome-later';
  if (o.includes('waste')) return 'outcome-timewaste';
  return 'outcome-submitted';
};

const AgentDashboardHome = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        agentPortalAPI.getStats(),
        agentPortalAPI.getApplications(),
      ]);
      setStats(statsRes.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const parsedApps = useMemo(() => {
    return applications.map((app) => {
      let details = {};
      try {
        details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {});
      } catch (e) { details = {}; }
      return { ...app, details };
    });
  }, [applications]);

  const filtered = useMemo(() => {
    return parsedApps.filter((app) => {
      const name = (app.client_name || '').toLowerCase();
      const contact = (app.contact_number || '').toLowerCase();
      const term = search.toLowerCase().trim();
      const matchesSearch = !term || name.includes(term) || contact.includes(term) || String(app.id).includes(term);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const outcome = (app.details.lead_outcome || '').toLowerCase();
      const matchesOutcome = !outcomeFilter || outcome.includes(outcomeFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesOutcome;
    });
  }, [parsedApps, search, statusFilter, outcomeFilter]);

  const viewApp = async (id) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      const res = await agentPortalAPI.getApplication(id);
      const app = res.data.application;
      let details = {};
      try {
        details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {});
      } catch (e) { details = {}; }
      setSelectedApp({ ...app, details });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load application');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
  };

  const openEdit = () => {
    if (!selectedApp) return;
    const d = selectedApp.details || {};
    setEditForm({
      id: selectedApp.id,
      client_name: selectedApp.client_name || '',
      contact_number: selectedApp.contact_number || '',
      lead_outcome: d.lead_outcome || '',
      submission_date: d.submission_date || '',
      visa_type: d.visa_type || '',
      country: d.country || '',
      notes: d.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await agentPortalAPI.updateApplication(editForm.id, editForm);
      if (res.data.success) {
        alert('Application updated successfully');
        setEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const StatCard = ({ icon, iconClass, label, value, filter }) => (
    <div
      className={`agent-stat-card ${statusFilter === filter ? 'active' : ''}`}
      onClick={() => setStatusFilter(filter)}
    >
      <div className={`agent-stat-icon ${iconClass}`}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="agent-stat-info">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
      </div>
    </div>
  );

  if (loading && !applications.length) {
    return (
      <div className="agent-loading">
        <div className="spinner-border text-primary spinner-border-sm" role="status" />
        <p className="mt-2">Loading data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h3>Dashboard</h3>
          <p>Track your client applications and status.</p>
        </div>
        <button className="agent-btn agent-btn-primary" onClick={() => navigate('/agent/dashboard/new-application')}>
          <i className="bi bi-plus-lg" /> New Application
        </button>
      </div>

      <div className="agent-stats-grid">
        <StatCard icon="bi-folder" iconClass="" label="Total Applications" value={stats.total} filter="all" />
        <StatCard icon="bi-clock" iconClass="purple" label="Pending Review" value={stats.pending} filter="pending" />
        <StatCard icon="bi-check2" iconClass="green" label="Approved" value={stats.approved} filter="approved" />
        <StatCard icon="bi-x" iconClass="red" label="Rejected" value={stats.rejected} filter="rejected" />
      </div>

      <div className="agent-card">
        <div className="agent-card-header">
          <h3>Recent Applications</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="agent-select" value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
              <option value="">All Outcomes</option>
              <option value="Interested">Interested</option>
              <option value="Later">Call Back Later</option>
              <option value="Time Waste">Time Waste</option>
            </select>
            <div className="agent-search">
              <i className="bi bi-search search-icon" />
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="agent-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Details</th>
              <th>Submitted</th>
              <th>Lead Outcome</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="agent-empty">
                    <i className="bi bi-inbox" />
                    <div className="fw-semibold">No applications found</div>
                    <div className="small">Try adjusting your filters or search.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="row-link" onClick={() => viewApp(app.id)}>
                  <td style={{ color: 'var(--text-muted)' }}>#{app.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.client_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.contact_number}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fmtDate(app.created_at)}</td>
                  <td>
                    <span className={`outcome-badge ${outcomeClass(app.details.lead_outcome)}`}>
                      {app.details.lead_outcome || 'Submitted'}
                    </span>
                  </td>
                  <td><span className={`status-pill ${app.status}`}>{statusLabel(app.status)}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="agent-btn agent-btn-sm" onClick={(e) => { e.stopPropagation(); viewApp(app.id); }}>
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <div className="agent-modal-overlay" onClick={closeModal}>
          <div className="agent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agent-modal-header">
              <h3>Application #{selectedApp?.id}</h3>
              <button className="agent-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="agent-modal-body">
              {modalLoading ? (
                <div className="agent-loading"><div className="spinner-border spinner-border-sm text-primary" /></div>
              ) : selectedApp ? (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 55%', minWidth: '280px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: '0.875rem' }}>
                        <div className="info-label">Name</div>
                        <div className="info-value" style={{ marginBottom: '0.5rem' }}>{selectedApp.client_name}</div>
                        <div className="info-label">Contact</div>
                        <div className="info-value" style={{ marginBottom: '0.5rem' }}>{selectedApp.contact_number}</div>
                        <div className="info-label">Status</div>
                        <div style={{ marginBottom: '0.5rem' }}><span className={`status-pill ${selectedApp.status}`}>{statusLabel(selectedApp.status)}</span></div>
                        <div className="info-label">Submitted</div>
                        <div style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>{fmtDate(selectedApp.created_at)}</div>
                        <div className="info-label">Lead Outcome</div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span className={`outcome-badge ${outcomeClass(selectedApp.details.lead_outcome)}`}>
                            {selectedApp.details.lead_outcome || 'Submitted'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: '1 1 35%', minWidth: '220px' }}>
                    <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Activity Timeline</h6>
                    <div className="agent-timeline">
                      {(!selectedApp.logs || selectedApp.logs.length === 0) ? (
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>No activity recorded.</div>
                      ) : (
                        selectedApp.logs.map((log, idx) => {
                          let cls = 'agent-timeline-item';
                          if (log.action_type === 'approved' || log.action_type === 'completed') cls += ' is-success';
                          else if (log.action_type === 'rejected') cls += ' is-danger';
                          else if (log.action_type === 'updated') cls += ' is-warning';
                          return (
                            <div key={idx} className={cls}>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text)' }}>
                                {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                {log.user_name} &middot; {fmtDate(log.created_at)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="agent-modal-footer">
              <button className="agent-btn" onClick={closeModal}>Close</button>
              {selectedApp && <button className="agent-btn agent-btn-primary" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="agent-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="agent-modal agent-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="agent-modal-header">
              <h3>Edit Application</h3>
              <button className="agent-modal-close" onClick={() => setEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="agent-modal-body">
                <div className="agent-form-grid">
                  <input type="hidden" name="id" value={editForm.id} />
                  <div className="agent-form-group">
                    <label>Client Name</label>
                    <input name="client_name" value={editForm.client_name} onChange={handleEditChange} required />
                  </div>
                  <div className="agent-form-group">
                    <label>Contact Number</label>
                    <input name="contact_number" value={editForm.contact_number} onChange={handleEditChange} required />
                  </div>
                  <div className="agent-form-group">
                    <label>Lead Outcome</label>
                    <select name="lead_outcome" value={editForm.lead_outcome} onChange={handleEditChange}>
                      <option value="">Select...</option>
                      <option value="Interested">Interested</option>
                      <option value="Later">Call Back Later</option>
                      <option value="Time Waste">Time Waste</option>
                    </select>
                  </div>
                  <div className="agent-form-group">
                    <label>Visa Type</label>
                    <input name="visa_type" value={editForm.visa_type} onChange={handleEditChange} />
                  </div>
                  <div className="agent-form-group">
                    <label>Country</label>
                    <input name="country" value={editForm.country} onChange={handleEditChange} />
                  </div>
                  <div className="agent-form-group">
                    <label>Submission Date</label>
                    <input type="date" name="submission_date" value={editForm.submission_date} onChange={handleEditChange} />
                  </div>
                  <div className="agent-form-group full-width">
                    <label>Notes</label>
                    <textarea name="notes" value={editForm.notes} onChange={handleEditChange} rows={3} />
                  </div>
                </div>
              </div>
              <div className="agent-modal-footer">
                <button type="button" className="agent-btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="agent-btn agent-btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-1" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDashboardHome;