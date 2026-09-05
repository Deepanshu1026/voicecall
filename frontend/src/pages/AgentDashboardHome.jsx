import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import '../styles/agentPortal.css';

const statusLabel = (s) => s?.replace(/_/g, ' ') || 'Unknown';

const detailFieldMap = {
  gender: 'Gender',
  age: 'Age',
  spouse_name: 'Spouse Name',
  spouse_age: 'Spouse Age',
  kids: 'Kids',
  address: 'Address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  visa_type: 'Visa Type',
  visa_type_other: 'Other Visa Type',
  visa_country: 'Visa Country',
  country: 'Country',
  travel_history: 'Travel History',
  refusal_history: 'Refusal History',
  passport_validity: 'Passport Validity',
  education: 'Education',
  ielts_score: 'IELTS Score',
  occupation: 'Occupation',
  income: 'Income',
  bank_balance: 'Bank Balance',
  lead_source: 'Lead Source',
  lead_outcome: 'Lead Outcome',
  remarks: 'Remarks',
  client_notes: 'Client Notes',
  query: 'Query',
  appointment_time: 'Appointment Time',
  time_slot: 'Time Slot',
  submission_date: 'Submission Date',
};

const renderDetailRows = (details) => {
  if (!details || typeof details !== 'object') return null;
  const rows = [];
  Object.entries(detailFieldMap).forEach(([key, label]) => {
    const value = details[key];
    if (value !== undefined && value !== null && value !== '') {
      rows.push(
        <div key={key} className="agent-detail-row">
          <span className="info-label">{label}</span>
          <span className="info-value">{String(value)}</span>
        </div>
      );
    }
  });
  return rows;
};

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
      gender: d.gender || '',
      age: d.age || '',
      spouse_name: d.spouse_name || '',
      spouse_age: d.spouse_age || '',
      kids: d.kids || '',
      address: d.address || '',
      city: d.city || '',
      state: d.state || '',
      pincode: d.pincode || '',
      visa_type: d.visa_type || '',
      visa_type_other: d.visa_type_other || '',
      travel_history: d.travel_history || '',
      refusal_history: d.refusal_history || '',
      passport_validity: d.passport_validity || '',
      education: d.education || '',
      ielts_score: d.ielts_score || '',
      occupation: d.occupation || '',
      income: d.income || '',
      remarks: d.remarks || '',
      lead_source: d.lead_source || '',
      lead_outcome: d.lead_outcome || '',
      client_notes: d.client_notes || '',
      submission_date: d.submission_date || '',
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
                <div className="agent-detail-layout">
                  <div className="agent-detail-main">
                    <div className="agent-detail-section">
                      <div className="agent-detail-grid">
                        <div className="agent-detail-row">
                          <span className="info-label">Name</span>
                          <span className="info-value">{selectedApp.client_name || '-'}</span>
                        </div>
                        <div className="agent-detail-row">
                          <span className="info-label">Contact</span>
                          <span className="info-value">{selectedApp.contact_number || '-'}</span>
                        </div>
                        <div className="agent-detail-row">
                          <span className="info-label">Email</span>
                          <span className="info-value">{selectedApp.details.email || '-'}</span>
                        </div>
                        <div className="agent-detail-row">
                          <span className="info-label">Status</span>
                          <span className="info-value"><span className={`status-pill ${selectedApp.status}`}>{statusLabel(selectedApp.status)}</span></span>
                        </div>
                        <div className="agent-detail-row">
                          <span className="info-label">Submitted</span>
                          <span className="info-value">{fmtDate(selectedApp.created_at)}</span>
                        </div>
                        <div className="agent-detail-row">
                          <span className="info-label">Lead Outcome</span>
                          <span className="info-value">
                            <span className={`outcome-badge ${outcomeClass(selectedApp.details.lead_outcome)}`}>
                              {selectedApp.details.lead_outcome || 'Submitted'}
                            </span>
                          </span>
                        </div>
                        {renderDetailRows(selectedApp.details)}
                      </div>
                    </div>
                  </div>
                  <div className="agent-detail-side">
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
                    <label>Gender</label>
                    <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="agent-form-group">
                    <label>Age</label>
                    <input name="age" value={editForm.age} onChange={handleEditChange} placeholder="Age" />
                  </div>
                  <div className="agent-form-group">
                    <label>Spouse Name</label>
                    <input name="spouse_name" value={editForm.spouse_name} onChange={handleEditChange} placeholder="Spouse name" />
                  </div>
                  <div className="agent-form-group">
                    <label>Spouse Age</label>
                    <input name="spouse_age" value={editForm.spouse_age} onChange={handleEditChange} placeholder="Spouse age" />
                  </div>
                  <div className="agent-form-group">
                    <label>Kids</label>
                    <input name="kids" value={editForm.kids} onChange={handleEditChange} placeholder="Number of kids" />
                  </div>
                  <div className="agent-form-group full-width">
                    <label>Address</label>
                    <input name="address" value={editForm.address} onChange={handleEditChange} placeholder="Full address" />
                  </div>
                  <div className="agent-form-group">
                    <label>City</label>
                    <input name="city" value={editForm.city} onChange={handleEditChange} placeholder="City" />
                  </div>
                  <div className="agent-form-group">
                    <label>State</label>
                    <input name="state" value={editForm.state} onChange={handleEditChange} placeholder="State" />
                  </div>
                  <div className="agent-form-group">
                    <label>Pincode</label>
                    <input name="pincode" value={editForm.pincode} onChange={handleEditChange} placeholder="Pincode" />
                  </div>
                  <div className="agent-form-group">
                    <label>Visa Type</label>
                    <select name="visa_type" value={editForm.visa_type} onChange={handleEditChange}>
                      <option value="">Select visa type</option>
                      <option value="Tourist">Tourist</option>
                      <option value="Student">Student</option>
                      <option value="Work">Work</option>
                      <option value="PR">PR</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {editForm.visa_type === 'Other' && (
                    <div className="agent-form-group">
                      <label>Other Visa Type</label>
                      <input name="visa_type_other" value={editForm.visa_type_other} onChange={handleEditChange} placeholder="Specify visa type" />
                    </div>
                  )}
                  <div className="agent-form-group">
                    <label>Travel History</label>
                    <input name="travel_history" value={editForm.travel_history} onChange={handleEditChange} placeholder="Countries visited" />
                  </div>
                  <div className="agent-form-group">
                    <label>Refusal History</label>
                    <input name="refusal_history" value={editForm.refusal_history} onChange={handleEditChange} placeholder="Any refusals" />
                  </div>
                  <div className="agent-form-group">
                    <label>Passport Validity</label>
                    <input name="passport_validity" value={editForm.passport_validity} onChange={handleEditChange} placeholder="Validity date" />
                  </div>
                  <div className="agent-form-group">
                    <label>Education</label>
                    <input name="education" value={editForm.education} onChange={handleEditChange} placeholder="Highest education" />
                  </div>
                  <div className="agent-form-group">
                    <label>IELTS Score</label>
                    <input name="ielts_score" value={editForm.ielts_score} onChange={handleEditChange} placeholder="IELTS score" />
                  </div>
                  <div className="agent-form-group">
                    <label>Occupation</label>
                    <input name="occupation" value={editForm.occupation} onChange={handleEditChange} placeholder="Occupation" />
                  </div>
                  <div className="agent-form-group">
                    <label>Income</label>
                    <input name="income" value={editForm.income} onChange={handleEditChange} placeholder="Annual income" />
                  </div>
                  <div className="agent-form-group">
                    <label>Lead Source</label>
                    <select name="lead_source" value={editForm.lead_source} onChange={handleEditChange}>
                      <option value="">Select source</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Call">Call</option>
                    </select>
                  </div>
                  <div className="agent-form-group">
                    <label>Lead Outcome</label>
                    <select name="lead_outcome" value={editForm.lead_outcome} onChange={handleEditChange}>
                      <option value="">Select outcome</option>
                      <option value="Interested">Interested</option>
                      <option value="Later">Call Back Later</option>
                      <option value="Time Waste">Time Waste</option>
                    </select>
                  </div>
                  <div className="agent-form-group">
                    <label>Submission Date</label>
                    <input type="date" name="submission_date" value={editForm.submission_date} onChange={handleEditChange} />
                  </div>
                  <div className="agent-form-group full-width">
                    <label>Remarks</label>
                    <textarea name="remarks" value={editForm.remarks} onChange={handleEditChange} rows={2} placeholder="Any remarks" />
                  </div>
                  <div className="agent-form-group full-width">
                    <label>Client Notes</label>
                    <textarea name="client_notes" value={editForm.client_notes} onChange={handleEditChange} rows={2} placeholder="Additional notes" />
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