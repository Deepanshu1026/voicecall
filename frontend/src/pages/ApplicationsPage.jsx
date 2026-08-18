import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/bookedAppointments.css';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await agentPortalAPI.getApplications(date || undefined, search || undefined);
      setItems(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [date]);

  const debounceTimeout = useMemo(() => ({ current: null }), []);
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  return (
    <div className="simple-list-page">
      <div className="simple-list-header">
        <h2>Applications</h2>
        <button className="simple-btn" onClick={() => navigate('/agent/dashboard')}>
          Back
        </button>
      </div>

      <div className="simple-list-filters">
        <input
          type="text"
          placeholder="Search name, contact, reference, agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="simple-input"
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="simple-input" />
        {date && (
          <button className="simple-btn secondary" onClick={() => setDate('')}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="simple-loading">Loading...</p>
      ) : items.length === 0 ? (
        <p className="simple-empty">No applications found.</p>
      ) : (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Time</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name || '-'}</td>
                <td>{item.contact || item.email || '-'}</td>
                <td>{item.date || '-'}</td>
                <td>{item.time || '-'}</td>
                <td>{item.plan || '-'}</td>
                <td>{item.status || '-'}</td>
                <td>{item.agentName || '-'}</td>
                <td>{item.referenceId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApplicationsPage;
