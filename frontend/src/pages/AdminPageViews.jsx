import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import '../styles/pushNotifications.css';
import '../styles/pageViews.css';

// The pages listed in sitemap-visa.xml, so they can be reviewed on their own.
const VISA_PAGES = new Set([
  '/uk-visa',
  '/uk-visa/requirements',
  '/uk-visa/business-visitor-visa',
  '/uk-visa/family-visit-visa',
  '/uk-visa/long-term-visitor-visa',
  '/uk-visa/fees',
  '/uk-visa/processing-time',
  '/uk-visa/refusal',
  '/usa-visa',
  '/usa-visa/appointment',
  '/usa-visa/business-visa',
  '/usa-visa/fees',
  '/usa-visa/processing-time',
  '/usa-visa/rejection-reasons',
  '/usa-visa/requirements',
  '/usa-visa/usa-b1b2-visa',
  '/canada-visa',
]);

const label = (path) => (path === '/' ? 'Home page' : path);

const AdminPageViews = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlyVisa, setOnlyVisa] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPageViews(days);
      setData(res.data?.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load page views');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const totals = data?.totals || [];
    const period = totals.reduce((a, b) => a + b, 0);
    return {
      period,
      today: totals[totals.length - 1] || 0,
      yesterday: totals[totals.length - 2] || 0,
    };
  }, [data]);

  const rows = useMemo(() => {
    const all = data?.pages || [];
    const list = onlyVisa ? all.filter((p) => VISA_PAGES.has(p.path)) : all;
    return list.slice(0, 100);
  }, [data, onlyVisa]);

  const maxRow = useMemo(() => Math.max(1, ...rows.map((r) => r.period || 0)), [rows]);

  const missingVisa = useMemo(() => {
    if (!onlyVisa || !data) return [];
    const seen = new Set((data.pages || []).map((p) => p.path));
    return [...VISA_PAGES].filter((p) => !seen.has(p));
  }, [data, onlyVisa]);

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Page Views</h3>
          <p>
            Clicks recorded by our own tracker on the marketing pages - including every page in
            sitemap-visa.xml.
          </p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      <div className="push-compose-panel">
        <div className="push-compose-body">
          <div className="pv-head">
            <p className="pv-sub">
              <strong>{summary.period.toLocaleString()}</strong> views in the last {days} days
              <span className="pv-today"> · {summary.today} today · {summary.yesterday} yesterday</span>
            </p>
            <div className="pv-controls">
              <div className="pv-toggle">
                <button
                  type="button"
                  className={onlyVisa ? 'active' : ''}
                  onClick={() => setOnlyVisa(true)}
                >
                  Visa pages
                </button>
                <button
                  type="button"
                  className={!onlyVisa ? 'active' : ''}
                  onClick={() => setOnlyVisa(false)}
                >
                  All pages
                </button>
              </div>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="push-empty">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading page views...</p>
            </div>
          ) : rows.length === 0 ? (
            <p className="pv-empty">
              No views recorded in this period yet. Tracking starts from the day it was added, so
              give it a little time.
            </p>
          ) : (
            <div className="pv-table-wrap">
              <table className="pv-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th className="num">Views</th>
                    <th className="num">Today</th>
                    <th className="num">Yesterday</th>
                    <th className="num">Change</th>
                    <th className="num">All-time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const delta = p.today - p.yesterday;
                    return (
                      <tr key={p.path}>
                        <td className="pv-path">
                          <a href={p.path} target="_blank" rel="noopener noreferrer">
                            {label(p.path)}
                          </a>
                        </td>
                        <td className="num">
                          <span
                            className="pv-bar"
                            style={{ width: `${Math.round((p.period / maxRow) * 100)}%` }}
                          />
                          <span className="pv-num">{p.period}</span>
                        </td>
                        <td className="num">{p.today}</td>
                        <td className="num">{p.yesterday}</td>
                        <td className="num">
                          <span className={`pv-change ${delta >= 0 ? 'up' : 'down'}`}>
                            {delta >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(delta)}
                          </span>
                        </td>
                        <td className="num pv-alltime">{p.allTime}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {missingVisa.length > 0 && (
            <p className="pv-note">
              Not visited yet in this period: {missingVisa.map(label).join(', ')}
            </p>
          )}

          <p className="pv-note">
            One view is counted per real page visit, by our own script. Blog posts are counted
            separately on the Blogs page. This is not Google Search Console data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPageViews;
