import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import '../styles/pushNotifications.css';
import '../styles/blockedDates.css';

const todayStr = new Date().toISOString().split('T')[0];

const formatDate = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const AdminBlockedDates = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [pending, setPending] = useState([]);
  const [pickDate, setPickDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyDate, setBusyDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCancelledDates();
      const dates = res.data?.data?.dates || res.data?.dates || [];
      setSaved(Array.isArray(dates) ? dates : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPending = () => {
    if (!pickDate) return;
    if (pending.includes(pickDate)) {
      toast.error('That date is already in the list');
      return;
    }
    if (saved.includes(pickDate)) {
      toast.error('That date is already blocked');
      return;
    }
    setPending((prev) => [...prev, pickDate].sort());
    setPickDate('');
  };

  const save = async () => {
    if (!pending.length) return;
    setSaving(true);
    try {
      const res = await adminAPI.addCancelledDates(pending);
      const dates = res.data?.data?.dates || res.data?.dates;
      if (Array.isArray(dates)) setSaved(dates);
      else await load();
      toast.success(`${pending.length} date${pending.length > 1 ? 's' : ''} blocked`);
      setPending([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save dates');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (date) => {
    setBusyDate(date);
    try {
      await adminAPI.deleteCancelledDate(date);
      setSaved((prev) => prev.filter((d) => d !== date));
      toast.success('Date unblocked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove date');
    } finally {
      setBusyDate('');
    }
  };

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Blocked Dates</h3>
          <p>Pick the dates on which users cannot book a Premium (Chairman) meeting.</p>
        </div>
        <button
          className="agent-btn agent-btn-outline-dark"
          onClick={() => navigate('/agent/dashboard')}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-calendar-x me-2" />Select Dates to Block</h4>
        </div>
        <div className="push-compose-body">
          <div className="bd-picker">
            <input
              type="date"
              className="bd-date-input"
              min={todayStr}
              value={pickDate}
              onChange={(e) => setPickDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPending();
                }
              }}
            />
            <button type="button" className="bd-btn" onClick={addPending}>
              <i className="bi bi-plus-lg" /> Add date
            </button>
          </div>
          <div className="push-helper">
            Add one date at a time, then save them all together. These dates apply to Premium
            meetings on both the website and the app.
          </div>

          {pending.length > 0 && (
            <div className="bd-pending">
              <h5>Ready to block ({pending.length})</h5>
              <div className="bd-chips">
                {pending.map((d) => (
                  <span className="bd-chip" key={d}>
                    {formatDate(d)}
                    <button
                      type="button"
                      aria-label={`Remove ${d}`}
                      onClick={() => setPending((prev) => prev.filter((x) => x !== d))}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </span>
                ))}
              </div>
              <button type="button" className="bd-btn primary" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : `Save ${pending.length} date${pending.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-calendar-check me-2" />Currently Blocked ({saved.length})</h4>
        </div>
        <div className="push-compose-body">
          {loading ? (
            <div className="push-empty">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading blocked dates...</p>
            </div>
          ) : saved.length === 0 ? (
            <p className="bd-empty">
              No dates are blocked. Premium meetings are open every day except Sunday.
            </p>
          ) : (
            <div className="bd-table-wrap">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="bd-col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {saved.map((d) => (
                    <tr key={d}>
                      <td>{formatDate(d)}</td>
                      <td><span className="bd-pill">Schedule Cancelled</span></td>
                      <td className="bd-col-action">
                        <button
                          type="button"
                          className="bd-del"
                          onClick={() => remove(d)}
                          disabled={busyDate === d}
                          title="Unblock this date"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlockedDates;
