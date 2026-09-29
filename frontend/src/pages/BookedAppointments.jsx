import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentPortalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/bookedAppointments.css';

const LIMIT = 50;

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchItems = async (pageNum, append = false) => {
    const isInitial = pageNum === 1 && !append;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await agentPortalAPI.getAppointments(
        pageNum,
        fromDate || undefined,
        toDate || undefined,
        search || undefined
      );
      const data = res.data?.data || [];
      const pagination = res.data?.pagination || res.data;
      setItems((prev) => (append ? [...prev, ...data] : data));
      setHasMore(pagination ? pagination.page < pagination.pages : false);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load appointments');
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
    fetchItems(1, false);
  };

  useEffect(() => {
    resetAndFetch();
  }, [fromDate, toDate]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await agentPortalAPI.exportAppointments(
        fromDate || undefined,
        toDate || undefined,
        search || undefined
      );
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const stamp = fromDate && toDate ? `${fromDate}_to_${toDate}` : (fromDate || toDate || new Date().toISOString().split('T')[0]);
      link.download = `appointments-${stamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  };

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

  return (
    <div className="simple-list-page">
      <div className="simple-list-header">
        <h2>Appointments</h2>
        <button className="simple-btn" onClick={() => navigate('/agent/dashboard')}>
          Back
        </button>
      </div>

      <div className="simple-list-filters">
        <input
          type="text"
          placeholder="Search name, contact, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="simple-input"
        />
        <input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => setFromDate(e.target.value)}
          className="simple-input"
          title="From date"
        />
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => setToDate(e.target.value)}
          className="simple-input"
          title="To date"
        />
        {(fromDate || toDate) && (
          <button className="simple-btn secondary" onClick={() => { setFromDate(''); setToDate(''); }}>
            Clear
          </button>
        )}
        <button className="simple-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {loading ? (
        <p className="simple-loading">Loading...</p>
      ) : items.length === 0 ? (
        <p className="simple-empty">No appointments found.</p>
      ) : (
        <>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>Plan</th>
                <th>Mode</th>
                <th>Status</th>
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
                  <td>{item.mode || '-'}</td>
                  <td>{item.status || '-'}</td>
                  <td>{item.referenceId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="simple-load-more">
            {hasMore ? (
              <button className="simple-btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            ) : (
              <span className="simple-end">No more appointments</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentsPage;
