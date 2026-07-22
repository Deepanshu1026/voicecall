import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const statusLabel = (s) => s?.replace(/_/g, ' ') || 'Unknown';

const outcomeClass = (outcome) => {
  const o = (outcome || '').toLowerCase().replace(/\s/g, '');
  if (o.includes('interested')) return 'outcome-interested';
  if (o.includes('later')) return 'outcome-later';
  if (o.includes('waste')) return 'outcome-timewaste';
  return 'outcome-submitted';
};

const outcomeIcon = (outcome) => {
  const o = (outcome || '').toLowerCase().replace(/\s/g, '');
  if (o.includes('interested')) return 'bi-check-circle-fill';
  if (o.includes('later')) return 'bi-clock-history';
  if (o.includes('waste')) return 'bi-x-circle-fill';
  return 'bi-file-earmark-check-fill';
};

const AgentPendingRemarks = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await agentPortalAPI.getPendingRemarks();
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error('Failed to load pending remarks');
      console.error(err);
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

  const logTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

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
      toast.error('Failed to load application');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>Pending Remarks</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Applications with admin remarks awaiting your action.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </button>
      </div>

      {/* Table */}
      <div className="agent-card">
        <div className="agent-card-header">
          <h3>Pending Remarks</h3>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Total: <strong>{applications.length}</strong>
          </span>
        </div>
        <div className="agent-card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="agent-loading">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading data...</p>
            </div>
          ) : (
            <table className="agent-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client Details</th>
                  <th>Submitted</th>
                  <th>Lead Outcome</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Remarks</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parsedApps.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="agent-empty">
                        <i className="bi bi-inbox" />
                        <div className="fw-semibold">No applications with pending remarks</div>
                        <div className="small">All caught up!</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parsedApps.map((app) => (
                    <tr key={app.id} className="row-link" onClick={() => viewApp(app.id)}>
                      <td><span style={{ color: '#718096', fontSize: '0.85rem' }}>#{app.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.client_name}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{app.contact_number}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{logTime(app.created_at)}</td>
                      <td>
                        <span className={`outcome-badge ${outcomeClass(app.details.lead_outcome)}`}>
                          <i className={`bi ${outcomeIcon(app.details.lead_outcome)}`} />
                          {app.details.lead_outcome || 'Submitted'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${app.status}`}>{statusLabel(app.status)}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge bg-danger text-white" style={{ padding: '0.4em 0.6em', borderRadius: '6px', fontWeight: 700 }}>
                          {app.remark_count || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="agent-btn agent-btn-outline agent-btn-sm"
                          onClick={(e) => { e.stopPropagation(); viewApp(app.id); }}
                        >
                          <i className="bi bi-eye me-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <div className="agent-modal-overlay" onClick={closeModal}>
          <div className="agent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agent-modal-header">
              <h3>Application Details</h3>
              <button className="agent-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="agent-modal-body">
              {modalLoading ? (
                <div className="agent-loading"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Loading...</p></div>
              ) : selectedApp ? (
                <div className="row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {/* Left */}
                  <div style={{ flex: '1 1 55%', minWidth: '300px', borderRight: '1px solid #e5e7eb', paddingRight: '24px' }}>
                    <div className="card bg-light border-0 mb-4" style={{ padding: '16px', borderRadius: '12px', background: '#f8f9fa' }}>
                      <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted" style={{ width: '35%', padding: '6px 0' }}>Name:</td>
                            <td className="fw-bold" style={{ padding: '6px 0' }}>{selectedApp.client_name}</td>
                          </tr>
                          <tr>
                            <td className="text-muted" style={{ padding: '6px 0' }}>Contact:</td>
                            <td className="fw-bold" style={{ padding: '6px 0' }}>{selectedApp.contact_number}</td>
                          </tr>
                          <tr>
                            <td className="text-muted" style={{ padding: '6px 0' }}>Status:</td>
                            <td style={{ padding: '6px 0' }}>
                              <span className={`status-pill ${selectedApp.status}`}>{statusLabel(selectedApp.status)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted" style={{ padding: '6px 0' }}>Submitted:</td>
                            <td style={{ padding: '6px 0' }}>{logTime(selectedApp.created_at)}</td>
                          </tr>
                          <tr>
                            <td className="text-muted" style={{ padding: '6px 0' }}>Lead Outcome:</td>
                            <td style={{ padding: '6px 0' }}>
                              <span className={`outcome-badge ${outcomeClass(selectedApp.details.lead_outcome)}`}>
                                <i className={`bi ${outcomeIcon(selectedApp.details.lead_outcome)}`} />
                                {selectedApp.details.lead_outcome || 'Submitted'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right - Timeline */}
                  <div style={{ flex: '1 1 35%', minWidth: '250px' }}>
                    <h6 className="mb-3" style={{ fontWeight: 600 }}>Activity Timeline</h6>
                    <div className="agent-timeline">
                      {(!selectedApp.logs || selectedApp.logs.length === 0) ? (
                        <div className="text-muted small">No activity recorded.</div>
                      ) : (
                        selectedApp.logs.map((log, idx) => {
                          let cls = 'agent-timeline-item';
                          if (log.action_type === 'approved' || log.action_type === 'completed') cls += ' is-success';
                          else if (log.action_type === 'rejected') cls += ' is-danger';
                          else if (log.action_type === 'updated') cls += ' is-warning';
                          return (
                            <div key={idx} className={cls}>
                              <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </div>
                              <div className="small text-muted mb-1">
                                <i className="bi bi-person me-1" />{log.user_name} • {logTime(log.created_at)}
                              </div>
                              {log.details && <div className="mt-1 p-2 bg-light rounded small border">{JSON.stringify(log.details)}</div>}
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
              <button className="agent-btn agent-btn-primary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentPendingRemarks;