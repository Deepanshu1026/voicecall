import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const VISA_OPTIONS = ['Tourist', 'Student', 'Work', 'PR', 'Business'];

const initialForm = {
  submission_date: new Date().toISOString().split('T')[0],
  contact_number: '',
  gender: '',
  client_name: '',
  age: '',
  spouse_name: '',
  spouse_age: '',
  kids: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  visa_type: '',
  visa_type_other: '',
  travel_history: '',
  refusal_history: '',
  passport_validity: '',
  education: '',
  ielts_score: '',
  occupation: '',
  income: '',
  remarks: '',
  lead_source: '',
  lead_outcome: '',
  client_notes: '',
};

const AgentNewApplication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchContact = (contact) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!contact || contact.trim().length < 3) {
      setHistory([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await agentPortalAPI.checkContactHistory(contact);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name || !form.contact_number) {
      toast.error('Name and Contact Number are required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await agentPortalAPI.submitApplication(form);
      if (res.data.success) {
        toast.success('Application submitted successfully');
        setForm(initialForm);
        setHistory([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const logTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>New Application</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Submit a new client application.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </button>
      </div>

      <div className="row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left - Form */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <div className="agent-form-container">
            <form onSubmit={handleSubmit}>
              {/* Contact Search */}
              <div className="agent-form-group">
                <label>Contact Number</label>
                <div className="agent-search" style={{ maxWidth: '100%', marginBottom: '8px' }}>
                  <i className="bi bi-search search-icon" />
                  <input
                    name="contact_number"
                    placeholder="Search or enter contact number..."
                    value={form.contact_number}
                    onChange={(e) => {
                      handleChange(e);
                      searchContact(e.target.value);
                    }}
                    required
                  />
                </div>
                {searching && <small className="text-muted">Searching...</small>}
                {history.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '12px', fontSize: '0.85rem', background: '#f8fafc' }}>
                    <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: '#64748b' }}>Previous Applications</div>
                    {history.map((h) => (
                      <div key={h.id} style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="fw-semibold">{h.client_name}</span>
                          <span className={`ms-2 status-pill ${h.status}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{h.status}</span>
                        </div>
                        <small className="text-muted">{logTime(h.created_at)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="agent-form-grid">
                <div className="agent-form-group">
                  <label>Client Name</label>
                  <input name="client_name" value={form.client_name} onChange={handleChange} placeholder="Full name" required />
                </div>
                <div className="agent-form-group">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="agent-form-group">
                  <label>Age</label>
                  <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />
                </div>
                <div className="agent-form-group">
                  <label>Spouse Name</label>
                  <input name="spouse_name" value={form.spouse_name} onChange={handleChange} placeholder="Spouse name" />
                </div>
                <div className="agent-form-group">
                  <label>Spouse Age</label>
                  <input name="spouse_age" value={form.spouse_age} onChange={handleChange} placeholder="Spouse age" />
                </div>
                <div className="agent-form-group">
                  <label>Kids</label>
                  <input name="kids" value={form.kids} onChange={handleChange} placeholder="Number of kids" />
                </div>
                <div className="agent-form-group full-width">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Full address" />
                </div>
                <div className="agent-form-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="agent-form-group">
                  <label>State</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
                </div>
                <div className="agent-form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />
                </div>
                <div className="agent-form-group">
                  <label>Visa Type</label>
                  <select name="visa_type" value={form.visa_type} onChange={handleChange}>
                    <option value="">Select visa type</option>
                    {VISA_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                {form.visa_type === 'Other' && (
                  <div className="agent-form-group">
                    <label>Other Visa Type</label>
                    <input name="visa_type_other" value={form.visa_type_other} onChange={handleChange} placeholder="Specify visa type" />
                  </div>
                )}
                <div className="agent-form-group">
                  <label>Travel History</label>
                  <input name="travel_history" value={form.travel_history} onChange={handleChange} placeholder="Countries visited" />
                </div>
                <div className="agent-form-group">
                  <label>Refusal History</label>
                  <input name="refusal_history" value={form.refusal_history} onChange={handleChange} placeholder="Any refusals" />
                </div>
                <div className="agent-form-group">
                  <label>Passport Validity</label>
                  <input name="passport_validity" value={form.passport_validity} onChange={handleChange} placeholder="Validity date" />
                </div>
                <div className="agent-form-group">
                  <label>Education</label>
                  <input name="education" value={form.education} onChange={handleChange} placeholder="Highest education" />
                </div>
                <div className="agent-form-group">
                  <label>IELTS Score</label>
                  <input name="ielts_score" value={form.ielts_score} onChange={handleChange} placeholder="IELTS score" />
                </div>
                <div className="agent-form-group">
                  <label>Occupation</label>
                  <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="Occupation" />
                </div>
                <div className="agent-form-group">
                  <label>Income</label>
                  <input name="income" value={form.income} onChange={handleChange} placeholder="Annual income" />
                </div>
                <div className="agent-form-group full-width">
                  <label>Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Any remarks" rows={3} />
                </div>
                <div className="agent-form-group">
                  <label>Lead Source</label>
                  <select name="lead_source" value={form.lead_source} onChange={handleChange}>
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
                  <select name="lead_outcome" value={form.lead_outcome} onChange={handleChange}>
                    <option value="">Select outcome</option>
                    <option value="Interested">Interested</option>
                    <option value="Later">Call Back Later</option>
                    <option value="Time Waste">Time Waste</option>
                  </select>
                </div>
                <div className="agent-form-group">
                  <label>Submission Date</label>
                  <input type="date" name="submission_date" value={form.submission_date} onChange={handleChange} />
                </div>
              </div>

              <div className="agent-form-group full-width">
                <label>Client Notes</label>
                <textarea name="client_notes" value={form.client_notes} onChange={handleChange} placeholder="Additional notes" rows={3} />
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="agent-btn agent-btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-1" /> Submitting...</> : <><i className="bi bi-plus-lg" /> Submit Application</>}
                </button>
                <button type="button" className="agent-btn agent-btn-outline" onClick={() => navigate('/agent/dashboard')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right - History Card */}
        <div style={{ flex: '1 1 30%', minWidth: '250px' }}>
          <div className="agent-history-card">
            <h6 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>
              <i className="bi bi-clock-history me-2" />Recent History
            </h6>
            {history.length === 0 ? (
              <div className="text-center py-4" style={{ color: '#718096', fontSize: '0.9rem' }}>
                <i className="bi bi-inbox" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }} />
                Search a contact number to see history.
              </div>
            ) : (
              <div className="agent-history-list">
                {history.map((h) => (
                  <div key={h.id} className="agent-history-item">
                    <div style={{ fontSize: '0.85rem' }}>
                      <span className="fw-bold">{h.client_name}</span>
                      <span className={`ms-2 status-pill ${h.status}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{h.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      <i className="bi bi-calendar3 me-1" />{logTime(h.created_at)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <i className="bi bi-person me-1" />{h.details?.visa_type || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentNewApplication;