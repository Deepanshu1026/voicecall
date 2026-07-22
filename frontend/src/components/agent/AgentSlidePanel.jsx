import { useState, useEffect, useCallback } from 'react';
import { agentPortalAPI } from '../../services/api';
import '../../styles/agentSlidePanel.css';

const AgentSlidePanel = ({ onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [panelData, setPanelData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll for new pending remark applications that need action
  const checkForAction = useCallback(async () => {
    try {
      const res = await agentPortalAPI.getPendingRemarks();
      const apps = res.data.applications || [];
      if (apps.length > 0 && !panelData && !open) {
        // Show the most recent one
        setPanelData(apps[0]);
        setOpen(true);
      }
    } catch (err) {
      // silent
    }
  }, [panelData, open]);

  useEffect(() => {
    checkForAction();
    const interval = setInterval(checkForAction, 15000);
    return () => clearInterval(interval);
  }, [checkForAction]);

  const dismiss = () => {
    setOpen(false);
    setTimeout(() => setPanelData(null), 300);
  };

  const handleAction = async (id, newStatus) => {
    try {
      setLoading(true);
      await agentPortalAPI.updateApplication(id, { status: newStatus });
      dismiss();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${newStatus} application`);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await agentPortalAPI.getApplication(id);
      setPanelData(res.data.application);
    } catch (err) {
      alert('Failed to load details');
    }
  };

  return (
    <>
      <button
        className="agent-slide-trigger"
        onClick={() => {
          checkForAction();
          setOpen(!open);
        }}
        title="Pending actions"
      >
        <i className="bi bi-bell" />
        {panelData && <span className="agent-slide-dot" />}
      </button>

      <div className={`agent-slide-overlay ${open ? 'open' : ''}`} onClick={dismiss} />
      <div className={`agent-slide-panel ${open ? 'open' : ''}`}>
        <div className="agent-slide-header">
          <h4>Action Required</h4>
          <button className="agent-modal-close" onClick={dismiss}>&times;</button>
        </div>

        {panelData ? (
          <div className="agent-slide-body">
            <div className="agent-slide-info">
              <div className="info-label">Client</div>
              <div className="info-value" style={{ marginBottom: '0.5rem' }}>{panelData.client_name}</div>

              <div className="info-label">Contact</div>
              <div className="info-value" style={{ marginBottom: '0.5rem' }}>{panelData.contact_number}</div>

              <div className="info-label">Submitted</div>
              <div className="info-value" style={{ marginBottom: '0.5rem' }}>
                {new Date(panelData.created_at).toLocaleDateString()}
              </div>

              {panelData.remark_count > 0 && (
                <>
                  <div className="info-label">Admin Remarks</div>
                  <div className="info-value" style={{ marginBottom: '0.5rem', color: '#d97706' }}>
                    <i className="bi bi-chat-dots me-1" />{panelData.remark_count} remark(s) pending
                  </div>
                </>
              )}
            </div>

            <div className="agent-slide-actions">
              <button
                className="agent-btn agent-btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleAction(panelData.id, 'approved')}
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-check-lg" /> Accept</>}
              </button>
              <button
                className="agent-btn"
                style={{ flex: 1, justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => handleAction(panelData.id, 'rejected')}
                disabled={loading}
              >
                <i className="bi bi-x-lg" /> Reject
              </button>
            </div>

            <button className="agent-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => viewDetails(panelData.id)}>
              <i className="bi bi-eye" /> View Full Details
            </button>
          </div>
        ) : (
          <div className="agent-slide-body">
            <div className="agent-empty" style={{ padding: '2rem 0' }}>
              <i className="bi bi-check2-circle" style={{ fontSize: '2rem', color: '#10b981' }} />
              <div className="fw-semibold" style={{ color: '#10b981' }}>All caught up!</div>
              <div className="small">No pending actions.</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AgentSlidePanel;