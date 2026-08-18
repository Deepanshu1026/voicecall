import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/bookedAppointments.css';

const BookedAppointments = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [total, setTotal] = useState(0);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await agentPortalAPI.getBookedAppointments(selectedDate || undefined, search || undefined);
      const grouped = res.data?.data || {};
      setData(grouped);
      setTotal(res.data?.total || 0);
      // Expand first 3 dates by default
      const dates = Object.keys(grouped);
      setExpandedDates((prev) => {
        const next = new Set(prev);
        dates.slice(0, 3).forEach((d) => next.add(d));
        return next;
      });
    } catch (err) {
      toast.error('Failed to load booked appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const debounceTimeout = useMemo(() => ({ current: null }), []);
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchAppointments();
    }, 300);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  const toggleDate = (date) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const getStatusClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved' || s === 'confirmed') return 'status-confirmed';
    if (s === 'rejected' || s === 'cancelled') return 'status-cancelled';
    if (s === 'follow_up') return 'status-followup';
    return 'status-pending';
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr === 'No Date') return 'No Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dates = useMemo(() => Object.keys(data).sort((a, b) => b.localeCompare(a)), [data]);

  return (
    <div className="booked-appointments-page">
      <div className="ba-header">
        <div>
          <h2>Booked Appointments</h2>
          <p className="ba-subtitle">All appointments from website and applications, grouped by date.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      <div className="ba-toolbar">
        <div className="ba-search">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="Search by name, contact, email or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ba-date-filter">
          <label>
            <i className="bi bi-calendar3" /> Filter by date:
          </label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          {selectedDate && (
            <button className="ba-clear-btn" onClick={() => setSelectedDate('')}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
        <div className="ba-count">
          <span className="ba-count-badge">{total} total</span>
        </div>
      </div>

      {loading ? (
        <div className="ba-empty">
          <div className="spinner-border text-primary" />
          <p>Loading appointments...</p>
        </div>
      ) : dates.length === 0 ? (
        <div className="ba-empty">
          <i className="bi bi-calendar-x" />
          <p>No appointments found</p>
          <span>{selectedDate || search ? 'Try changing the filters' : 'No bookings yet'}</span>
        </div>
      ) : (
        <div className="ba-list">
          {dates.map((date) => {
            const items = data[date] || [];
            const isExpanded = expandedDates.has(date);
            return (
              <div key={date} className="ba-date-group">
                <button className="ba-date-header" onClick={() => toggleDate(date)}>
                  <div className="ba-date-header-left">
                    <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`} />
                    <span className="ba-date-title">{formatDisplayDate(date)}</span>
                    <span className="ba-date-count">{items.length} booking{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="ba-date-header-right">
                    <span className={`ba-source-badge website`}>Website {items.filter((i) => i.type === 'website').length}</span>
                    <span className={`ba-source-badge application`}>App {items.filter((i) => i.type === 'application').length}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ba-cards">
                    {items.map((item) => (
                      <div key={item._id} className={`ba-card ${item.type}`}>
                        <div className="ba-card-main">
                          <div className="ba-card-type">
                            <span className={`ba-source-pill ${item.type}`}>{item.source}</span>
                            <span className={`ba-status-pill ${getStatusClass(item.status)}`}>{item.status}</span>
                          </div>
                          <h4 className="ba-card-name">{item.name || 'No Name'}</h4>
                          <div className="ba-card-meta">
                            {item.contact && (
                              <span>
                                <i className="bi bi-telephone" /> {item.contact}
                              </span>
                            )}
                            {item.email && (
                              <span>
                                <i className="bi bi-envelope" /> {item.email}
                              </span>
                            )}
                            {item.time && (
                              <span>
                                <i className="bi bi-clock" /> {item.time}
                              </span>
                            )}
                            {item.plan && (
                              <span>
                                <i className="bi bi-tag" /> {item.plan}
                              </span>
                            )}
                            {item.mode && (
                              <span>
                                <i className="bi bi-camera-video" /> {item.mode}
                              </span>
                            )}
                          </div>
                          {item.query && <p className="ba-card-query">{item.query}</p>}
                        </div>
                        <div className="ba-card-side">
                          {item.referenceId && (
                            <div className="ba-card-ref">
                              <span>Ref</span>
                              <strong>{item.referenceId}</strong>
                            </div>
                          )}
                          {item.agentName && (
                            <div className="ba-card-agent">
                              <i className="bi bi-person" />
                              <span>{item.agentName}</span>
                            </div>
                          )}
                          {item.address && (
                            <div className="ba-card-address">
                              <i className="bi bi-geo-alt" />
                              <span>{item.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookedAppointments;
