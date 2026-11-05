import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import '../styles/pushNotifications.css';
import '../styles/blockedDates.css';

const PLANS = [
  { key: 'basic', label: 'Basic' },
  { key: 'advance', label: 'Advance' },
  { key: 'premium', label: 'Premium' },
];

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayStr = iso(new Date());

const formatDate = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const planText = (plans) => {
  const list = Array.isArray(plans) && plans.length ? plans : ['all'];
  if (list.includes('all')) return 'All meetings';
  const names = PLANS.filter((p) => list.includes(p.key)).map((p) => p.label);
  return names.length ? names.join(' + ') : 'All meetings';
};

const expandRange = (from, to) => {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const out = [];
  const cursor = new Date(start);
  while (cursor <= end && out.length < 120) {
    out.push(iso(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};

const AdminBlockedDates = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyDate, setBusyDate] = useState('');

  const [mode, setMode] = useState('single'); // single | range
  const [singleDate, setSingleDate] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const [scopeMode, setScopeMode] = useState('all'); // all | specific
  const [scopePlans, setScopePlans] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCancelledDates();
      const list = res.data?.data?.entries || res.data?.entries || [];
      setEntries(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activePlans = useMemo(
    () => (scopeMode === 'all' ? ['all'] : scopePlans),
    [scopeMode, scopePlans]
  );

  const rangePreview = useMemo(
    () => (mode === 'range' ? expandRange(rangeFrom, rangeTo) : []),
    [mode, rangeFrom, rangeTo]
  );

  const togglePlan = (key) => {
    setScopePlans((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const resetPicker = () => {
    setSingleDate('');
    setRangeFrom('');
    setRangeTo('');
  };

  const addToList = () => {
    if (scopeMode === 'specific' && scopePlans.length === 0) {
      toast.error('Choose at least one meeting type, or select "All meetings"');
      return;
    }

    let dates = [];
    if (mode === 'single') {
      if (!singleDate) {
        toast.error('Pick a date first');
        return;
      }
      dates = [singleDate];
    } else {
      dates = rangePreview;
      if (!rangeFrom || !rangeTo) {
        toast.error('Pick both a start and an end date');
        return;
      }
      if (!dates.length) {
        toast.error('The end date must be on or after the start date');
        return;
      }
    }

    const plans = [...activePlans];
    setPending((prev) => {
      const map = new Map(prev.map((e) => [e.date, e]));
      dates.forEach((date) => map.set(date, { date, plans }));
      return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    });

    const skipped = dates.filter((d) => entries.some((e) => e.date === d)).length;
    toast.success(
      `${dates.length} date${dates.length > 1 ? 's' : ''} added${skipped ? ` (${skipped} already blocked)` : ''}`
    );
    resetPicker();
  };

  const save = async () => {
    if (!pending.length) return;
    setSaving(true);
    try {
      const res = await adminAPI.addCancelledDates({ entries: pending });
      const list = res.data?.data?.entries || res.data?.entries;
      if (Array.isArray(list)) setEntries(list);
      else await load();
      toast.success(`${pending.length} date${pending.length > 1 ? 's' : ''} saved`);
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
      setEntries((prev) => prev.filter((e) => e.date !== date));
      toast.success('Date unblocked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove date');
    } finally {
      setBusyDate('');
    }
  };

  const removePending = (date) => setPending((prev) => prev.filter((e) => e.date !== date));

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Blocked Dates</h3>
          <p>Choose the dates on which users cannot book a meeting — for every type, or just some.</p>
        </div>
        <button
          className="agent-btn agent-btn-outline-dark"
          onClick={() => navigate('/agent/dashboard')}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      {/* ---------- Add dates ---------- */}
      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-calendar-plus me-2" />Add Blocked Dates</h4>
        </div>
        <div className="push-compose-body">
          <div className="bd-seg" role="tablist" aria-label="Date selection mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'single'}
              className={`bd-seg-btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => setMode('single')}
            >
              <i className="bi bi-calendar-event" /> Single date
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'range'}
              className={`bd-seg-btn ${mode === 'range' ? 'active' : ''}`}
              onClick={() => setMode('range')}
            >
              <i className="bi bi-calendar-range" /> Date range
            </button>
          </div>

          {mode === 'single' ? (
            <div className="bd-field">
              <label htmlFor="bd-single">Date</label>
              <input
                id="bd-single"
                type="date"
                className="bd-date-input"
                min={todayStr}
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList();
                  }
                }}
              />
            </div>
          ) : (
            <div className="bd-range">
              <div className="bd-field">
                <label htmlFor="bd-from">From</label>
                <input
                  id="bd-from"
                  type="date"
                  className="bd-date-input"
                  min={todayStr}
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                />
              </div>
              <div className="bd-field">
                <label htmlFor="bd-to">To</label>
                <input
                  id="bd-to"
                  type="date"
                  className="bd-date-input"
                  min={rangeFrom || todayStr}
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                />
              </div>
              {rangePreview.length > 0 && (
                <span className="bd-range-count">
                  {rangePreview.length} day{rangePreview.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          <div className="bd-scope">
            <span className="bd-scope-label">Applies to</span>
            <div className="bd-seg small">
              <button
                type="button"
                className={`bd-seg-btn ${scopeMode === 'all' ? 'active' : ''}`}
                onClick={() => setScopeMode('all')}
              >
                All meetings
              </button>
              <button
                type="button"
                className={`bd-seg-btn ${scopeMode === 'specific' ? 'active' : ''}`}
                onClick={() => setScopeMode('specific')}
              >
                Specific types
              </button>
            </div>

            {scopeMode === 'specific' && (
              <div className="bd-plan-pills">
                {PLANS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`bd-plan-pill ${scopePlans.includes(p.key) ? 'on' : ''}`}
                    onClick={() => togglePlan(p.key)}
                    aria-pressed={scopePlans.includes(p.key)}
                  >
                    <i className={`bi ${scopePlans.includes(p.key) ? 'bi-check-circle-fill' : 'bi-circle'}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="bd-btn primary" onClick={addToList}>
            <i className="bi bi-plus-lg" /> Add to list
          </button>
        </div>
      </div>

      {/* ---------- Pending ---------- */}
      {pending.length > 0 && (
        <div className="push-compose-panel">
          <div className="push-compose-header">
            <h4><i className="bi bi-list-check me-2" />Ready to Save ({pending.length})</h4>
          </div>
          <div className="push-compose-body">
            <div className="bd-chips">
              {pending.map((e) => (
                <span className="bd-chip" key={e.date}>
                  <span className="bd-chip-date">{formatDate(e.date)}</span>
                  <span className="bd-chip-plan">{planText(e.plans)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${e.date}`}
                    onClick={() => removePending(e.date)}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </span>
              ))}
            </div>
            <div className="bd-actions">
              <button type="button" className="bd-btn primary" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : `Save ${pending.length} date${pending.length > 1 ? 's' : ''}`}
              </button>
              <button type="button" className="bd-btn" onClick={() => setPending([])} disabled={saving}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Existing ---------- */}
      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-calendar-check me-2" />Blocked Dates ({entries.length})</h4>
        </div>
        <div className="push-compose-body">
          {loading ? (
            <div className="push-empty">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading blocked dates...</p>
            </div>
          ) : entries.length === 0 ? (
            <p className="bd-empty">
              No dates are blocked. Meetings are open every day except Sunday.
            </p>
          ) : (
            <div className="bd-table-wrap">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Applies to</th>
                    <th className="bd-col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const isPast = e.date < todayStr;
                    return (
                      <tr key={e.date} className={isPast ? 'is-past' : ''}>
                        <td>
                          {formatDate(e.date)}
                          {isPast && <span className="bd-past-tag">past</span>}
                        </td>
                        <td>
                          <span className={`bd-scope-tag ${(e.plans || []).includes('all') ? 'all' : 'some'}`}>
                            {planText(e.plans)}
                          </span>
                        </td>
                        <td className="bd-col-action">
                          <button
                            type="button"
                            className="bd-del"
                            onClick={() => remove(e.date)}
                            disabled={busyDate === e.date}
                            title="Unblock this date"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
