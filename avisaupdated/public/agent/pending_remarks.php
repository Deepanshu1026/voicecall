<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();

// Allow only Agent
if ($_SESSION['role'] !== 'agent') {
    header("Location: ../login.php");
    exit;
}

$active = 'pending_remarks';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pending Remarks - Avisa Agent</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/agent-dashboard.css">
    <style>
        .timeline {
            border-left: 2px solid #ddd;
            padding-left: 20px;
            margin-left: 10px;
        }
        .timeline-item {
            position: relative;
            margin-bottom: 20px;
        }
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -26px;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #0d6efd;
            border: 2px solid #fff;
        }
        .timeline-date {
            font-size: 0.85em;
            color: #6c757d;
        }
    </style>
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header mb-4">
        <h3>Pending Remarks</h3>
        <p>Applications with remarks from administrators pending your review.</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover align-middle" id="remarksTable">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>CLIENT DETAILS</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
            <div id="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div id="no-data" class="text-center py-4 d-none">
                <p class="text-muted">No pending remarks found.</p>
            </div>
        </div>
    </div>
</div>

<!-- Details Modal -->
<div class="modal fade" id="viewModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Application Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-7 border-end">
                        <div id="modalContent"></div>
                    </div>
                    <div class="col-md-5">
                       <h6 class="mb-3">Activity Timeline</h6>
                       <div id="timelineContent" class="timeline"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <a href="form.php?edit_id=" id="editAppBtn" class="btn btn-primary">Edit Application</a>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
const BASE_URL = '/avisaupdated/index.php';
const USER_ID = <?php echo $_SESSION['user_id']; ?>;

function apiUrl(endpoint, params = {}) {
    const url = new URL(BASE_URL, window.location.origin);
    url.searchParams.append('path', endpoint);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    return url.toString();
}

function fetchRemarks() {
    fetch(apiUrl('api/agent/applications'))
        .then(r => r.json())
        .then(data => {
            document.getElementById('loading').classList.add('d-none');
            if(data.success) {
                // Filter: Status 'pending' AND remark_count > 0
                const remarks = data.applications.filter(app => app.status === 'pending' && app.remark_count > 0);
                
                if(remarks.length === 0) {
                    document.getElementById('no-data').classList.remove('d-none');
                    document.querySelector('#remarksTable tbody').innerHTML = '';
                    return;
                }
                
                document.getElementById('no-data').classList.add('d-none');
                renderTable(remarks);
            }
        })
        .catch(e => {
            console.error(e);
            document.getElementById('loading').classList.add('d-none');
        });
}

function renderTable(apps) {
    const tbody = document.querySelector('#remarksTable tbody');
    tbody.innerHTML = apps.map(app => {
        let details = {};
        try { details = JSON.parse(app.details || '{}'); } catch(e) {}
        
        return `<tr>
            <td><span class="text-muted">#${app.id}</span></td>
            <td>
                <div class="fw-bold text-dark">${app.client_name}</div>
                <div class="small text-muted">${app.contact_number || (details.contact_number || '')}</div>
            </td>
            <td><span class="badge bg-warning text-dark status-pill pending">PENDING</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary position-relative" onclick="viewDetails(${app.id})">
                    <i class="bi bi-eye"></i> View Remarks
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${app.remark_count}</span>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function viewDetails(id) {
    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    modal.show();
    
    document.getElementById('modalContent').innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
    document.getElementById('timelineContent').innerHTML = '';
    
    // Set edit link
    document.getElementById('editAppBtn').href = `form.php?edit_id=${id}`;

    fetch(apiUrl('api/agent/application-details', { id: id }))
        .then(r => r.json())
        .then(data => {
            if(data.success) {
                renderDetails(data.application, data.logs);
                // Agent doesn't have approve/reject buttons, so we just set edit link which is already set.
            } else {
                 document.getElementById('modalContent').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            }
        });
}

function renderDetails(app, logs) {
    let details = {};
    if (typeof app.details === 'string') { try { details = JSON.parse(app.details); } catch(e) {} } 
    else { details = app.details || {}; }
    
    const agentRemarks = details.remarks || '';
    
    let html = '';
    
    // 1. Latest Internal Note (Admin/Manager remarks)
    if (logs && logs.length > 0) {
        let latestRemark = '';
        let latestRemarkUser = '';
        let latestRemarkDate = '';

        for (let l of logs) {
            let d = l.details;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
            
            // Only show admin remarks here if we want to highlight them
            // The original code shows 'status_change', 'admin_remark' etc.
            if (d && d.remarks) {
                latestRemark = d.remarks;
                latestRemarkUser = l.user_name || 'System';
                latestRemarkDate = new Date(l.created_at).toLocaleString();
                break;
            }
        }
    
        if (latestRemark) {
            html += `<div class="mb-4">
                <h6 class="text-uppercase text-muted small fw-bold mb-2">Latest Internal Note</h6>
                <div class="p-3 rounded border" style="background-color: #fff; border-left: 4px solid #f59e0b !important;">
                    <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span class="small fw-bold text-dark"><i class="bi bi-person-fill me-1"></i>${latestRemarkUser}</span>
                        <div class="d-flex align-items-center gap-2">
                            <span class="small text-muted">${latestRemarkDate}</span>
                        </div>
                    </div>
                    <div class="text-dark">${latestRemark}</div>
                </div>
            </div>`;
        }
    }

    if (agentRemarks) {
        html += `<div class="mb-4">
            <h6 class="text-uppercase text-muted small fw-bold mb-2">Agent Remarks</h6>
            <div class="p-3 rounded border" style="background-color: #fff; border-left: 4px solid #6366f1 !important;">
                <i class="bi bi-chat-quote text-primary me-2"></i>
                <span class="fst-italic text-dark">${agentRemarks}</span>
            </div>
        </div>`;
    }

    html += `<h6 class="text-uppercase text-muted small fw-bold mb-3">Client Application Details</h6>
             <div class="card bg-light border-0 mb-4"><div><table class="table table-sm table-borderless mb-0">`;
    html += `<tr><td class="text-muted w-25">Name:</td><td class="fw-bold">${app.client_name}</td></tr>`;
    if(details.contact_number) html += `<tr><td class="text-muted">Mobile:</td><td>${details.contact_number}</td></tr>`;
    
    if(details.lead_outcome) {
        const outcomeStr = details.lead_outcome;
        let outcomeClass = 'outcome-default'; let outcomeIcon = 'bi-circle';
        const lowerOutcome = outcomeStr.toLowerCase().replace(/\s/g, '');
        if (lowerOutcome.includes('interested')) { outcomeClass = 'outcome-interested'; outcomeIcon = 'bi-check-circle-fill'; }
        else if (lowerOutcome.includes('later')) { outcomeClass = 'outcome-later'; outcomeIcon = 'bi-clock-history'; }
        else if (lowerOutcome.includes('timewaste') || lowerOutcome.includes('waste')) { outcomeClass = 'outcome-timewaste'; outcomeIcon = 'bi-x-circle-fill'; }
        else if (lowerOutcome.includes('submitted')) { outcomeClass = 'outcome-submitted'; outcomeIcon = 'bi-file-earmark-check-fill'; }
        html += `<tr><td class="text-muted">Lead Outcome:</td><td><div class="outcome-badge ${outcomeClass}"><i class="bi ${outcomeIcon}"></i>${outcomeStr}</div></td></tr>`;
    }
    
    for (const [key, value] of Object.entries(details)) {
        if (['client_name', 'contact_number', 'lead_outcome', 'remarks'].includes(key)) continue; 
        if (!value || value === 'not-provided') continue;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        html += `<tr><td class="text-muted">${label}:</td><td>${value}</td></tr>`;
    }
    html += `</table></div></div>`;
    
    document.getElementById('modalContent').innerHTML = html;
    renderTimeline(logs);
}

function renderTimeline(logs) {
    const container = document.getElementById('timelineContent');
    if (!logs || logs.length === 0) { container.innerHTML = '<p class="text-muted small">No activity recorded yet.</p>'; return; }
    container.innerHTML = logs.map(log => `
        <div class="timeline-item">
            <div class="fw-bold text-capitalize">${log.action_type.replace(/_/g, ' ')}</div>
            <div class="small text-muted">by ${log.user_name || 'System'} (${log.user_role || ''})</div>
            <div class="timeline-date">${new Date(log.created_at).toLocaleString()}</div>
            ${renderLogDetails(log.details)}
        </div>
    `).join('');
}

function renderLogDetails(details) {
    if (!details) return '';
    let data = typeof details === 'string' ? JSON.parse(details) : details;
    if (Object.keys(data).length === 0) return '';
    let parts = [];
    if(data.to) parts.push(`Changed to <span class="badge bg-secondary">${data.to}</span>`);
    if(data.remarks) parts.push(`<em>"${data.remarks}"</em>`);
    return parts.length > 0 ? `<div class="small mt-1">${parts.join('<br>')}</div>` : '';
}

document.addEventListener('DOMContentLoaded', fetchRemarks);
</script>
</body>
</html>
