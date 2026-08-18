import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/bookedAppointments.css';

const LIMIT = 50;

const detailLabels = {
  age: 'Age',
  gender: 'Gender',
  address: 'Address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  visaType: 'Visa Type',
  visaCountry: 'Visa Country',
  passportValidity: 'Passport Validity',
  education: 'Education',
  ieltsScore: 'IELTS Score',
  occupation: 'Occupation',
  income: 'Income',
  bankBalance: 'Bank Balance',
  travelHistory: 'Travel History',
  refusalHistory: 'Refusal History',
  leadOutcome: 'Lead Outcome',
  spouseName: 'Spouse Name',
  spouseAge: 'Spouse Age',
  kids: 'Kids',
  remarks: 'Remarks',
  query: 'Query',
  submissionDate: 'Submission Date',
  appointmentTime: 'Appointment Time',
};

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchItems = async (pageNum, append = false) => {
    const isInitial = pageNum === 1 && !append;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await agentPortalAPI.getApplicationsList(pageNum, date || undefined, search || undefined);
      const data = res.data?.data || [];
      const pagination = res.data?.pagination || res.data;
      setItems((prev) => (append ? [...prev, ...data] : data));
      setHasMore(pagination ? pagination.page < pagination.pages : false);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const resetAndFetch = () => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    setExpandedId(null);
    fetchItems(1, false);
  };

  useEffect(() => {
    resetAndFetch();
  }, [date]);

  const debounceTimeout = useMemo(() => ({ current: null }), []);
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      resetAndFetch();
    }, 300);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchItems(page + 1, true);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderDetails = (details) => {
    if (!details) return null;
    const entries = Object.entries(detailLabels)
      .map(([key, label]) => [label, details[key]])
      .filter(([, value]) => value !== '' && value !== null && value !== undefined);
    if (entries.length === 0) return <p className="simple-detail-empty">No extra details</p>;
    return (
      <div className="simple-detail-grid">
        {entries.map(([label, value]) => (
          <div key={label} className="simple-detail-item">
            <span className="simple-detail-label">{label}</span>
            <span className="simple-detail-value">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

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
          placeholder="Search name, contact, reference, visa, country, city..."
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
        <>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Plan</th>
                <th>Country</th>
                <th>City</th>
                <th>Occupation</th>
                <th>Status</th>
                <th>Lead Outcome</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <>
                  <tr key={item._id} className="simple-row">
                    <td>{item.name || '-'}</td>
                    <td>{item.contact || item.email || '-'}</td>
                    <td>{item.date || '-'}</td>
                    <td>{item.plan || '-'}</td>
                    <td>{item.country || '-'}</td>
                    <td>{item.city || '-'}</td>
                    <td>{item.occupation || '-'}</td>
                    <td>{item.status || '-'}</td>
                    <td>{item.leadOutcome || '-'}</td>
                    <td>{item.agentName || '-'}</td>
                    <td>
                      <button className="simple-btn small" onClick={() => toggleExpand(item._id)}>
                        {expandedId === item._id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === item._id && (
                    <tr className="simple-expanded-row">
                      <td colSpan={11}>
                        <div className="simple-expanded-content">
                          <h4>Application Details</h4>
                          {renderDetails(item.details)}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          <div className="simple-load-more">
            {hasMore ? (
              <button className="simple-btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            ) : (
              <span className="simple-end">No more applications</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ApplicationsPage;
