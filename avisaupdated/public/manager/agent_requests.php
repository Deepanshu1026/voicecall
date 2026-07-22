<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();

// Allow Admin and Manager
if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
    header("Location: ../login.php");
    exit;
}

$active = 'agent_requests';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Agent Requests - Avisa Manager</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/admin-dashboard.css">
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
            left: -26px; /* Adjust based on border width and padding */
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
        
        /* Enhanced Table Styles */
        .table-card {
            background: #fff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .table-card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            background: #fff;
        }
        .table-card-header h5 {
            margin: 0;
            font-weight: 600;
            color: #1e293b;
        }
        .table th {
            background: #f8fafc;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .table td {
            vertical-align: middle;
            padding: 1rem 1.5rem;
            color: #334155;
            font-size: 0.875rem;
            border-bottom: 1px solid #f1f5f9;
        }
        .table tr:last-child td {
            border-bottom: none;
        }
        .table-hover tbody tr:hover {
            background-color: #f8fafc;
            transition: background-color 0.2s;
        }
        
        /* Custom Outcome Badges */
        .outcome-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
        }
        .outcome-interested { 
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #166534;
            border: 1px solid #86efac;
        }
        .outcome-later { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border: 1px solid #fcd34d;
        }
        .outcome-timewaste { 
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        .outcome-submitted { 
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            color: #3730a3;
            border: 1px solid #a5b4fc;
        }
        .outcome-default { 
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
        }

        /* Status Pills */
        .status-pill {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pill.approved { 
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #6ee7b7;
        }
        .status-pill.rejected { 
            background: #fef2f2;
            color: #991b1b;
            border: 2px solid #f87171;
            box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
            font-weight: 700;
        }
        .status-pill.pending { 
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }
        .status-pill.follow_up {
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
        }
        
        /* Search Bar Styles */
        .search-container {
            position: relative;
            max-width: 400px;
        }
        .search-input {
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 0.9rem;
            transition: all 0.2s;
            width: 100%;
        }
        .search-input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            pointer-events: none;
        }
        .client-name {
            font-weight: 600;
            color: #0f172a;
        }
        .client-contact {
            font-size: 0.8rem;
            color: #64748b;
        }
        .app-id {
            color: #64748b;
            font-weight: 500;
        }

        /* Stats Drawer Styles */
        #statsTrigger {
            position: fixed;
            right: 0;
            top: 50%; /* Initial position */
            transform: translateY(-50%); 
            background: #1e293b; /* Professional slate color */
            color: white;
            padding: 12px 16px;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            cursor: move; /* Indicate draggable */
            box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1060; /* Higher than drawer */
            font-weight: 500;
            font-size: 0.9rem;
            transition: background 0.2s, padding-right 0.2s, right 0.3s;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #statsTrigger:hover {
            padding-right: 20px;
            background: #0f172a;
        }
        #statsTrigger:active {
            cursor: grabbing;
        }

        #statsDrawer {
            position: fixed;
            top: 0;
            right: -340px;
            width: 320px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -5px 0 30px rgba(0,0,0,0.15);
            z-index: 1050;
            padding: 25px;
            transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow-y: auto;
            border-left: 1px solid #e2e8f0;
        }
        #statsDrawer.open {
            right: 0;
        }

        .stats-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
            margin-bottom: 12px;
        }
        .stats-card:hover {
            background: #fff;
            border-color: #cbd5e1;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transform: translateY(-1px);
        }
        
        /* Minimalist Professional text styles */
        .stats-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .stats-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.2;
        }
        
        .icon-box {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
        }
        /* Subtle branding colors for icons only */
        .interested .icon-box { background: #dcfce7; color: #15803d; }
        .later .icon-box { background: #fef3c7; color: #b45309; }
        .waste .icon-box { background: #fee2e2; color: #b91c1c; }
        .today .icon-box { background: #dbeafe; color: #1d4ed8; }
        .total .icon-box { background: #f1f5f9; color: #475569; }
    </style>
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header">
        <h3>Agent Applications</h3>
        <p>Review and manage client applications submitted by agents.</p>
    </div>

    <!-- Stats Drawer Trigger -->
    <div id="statsTrigger">
        <i class="bi bi-chevron-left me-2"></i>
        <i class="bi bi-bar-chart-fill"></i> 
        <span>Stats</span>
    </div>

    <!-- Sliding Stats Drawer -->
    <div id="statsDrawer">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <h5 class="mb-0 fw-bold text-dark">Analytics</h5>
            <button type="button" class="btn-close" onclick="toggleStatsDrawer()"></button>
        </div>
        
        <div class="stats-card interested d-flex justify-content-between align-items-center">
            <div>
                <div class="stats-label">Interested</div>
                <div class="stats-value" id="count-interested">0</div>
            </div>
            <div class="icon-box"><i class="bi bi-check-lg"></i></div>
        </div>

        <div class="stats-card later d-flex justify-content-between align-items-center">
            <div>
                <div class="stats-label">Call Later</div>
                <div class="stats-value" id="count-later">0</div>
            </div>
            <div class="icon-box"><i class="bi bi-clock-history"></i></div>
        </div>

        <div class="stats-card waste d-flex justify-content-between align-items-center">
            <div>
                <div class="stats-label">Time Waste</div>
                <div class="stats-value" id="count-waste">0</div>
            </div>
            <div class="icon-box"><i class="bi bi-x-lg"></i></div>
        </div>

        <div class="stats-card today d-flex justify-content-between align-items-center">
            <div>
                <div class="stats-label">Today</div>
                <div class="stats-value" id="count-today">0</div>
            </div>
            <div class="icon-box"><i class="bi bi-calendar-check"></i></div>
        </div>

        <div class="stats-card total d-flex justify-content-between align-items-center">
            <div>
                <div class="stats-label">Total</div>
                <div class="stats-value" id="count-total">0</div>
            </div>
            <div class="icon-box"><i class="bi bi-list-ul"></i></div>
        </div>
    </div>

    <div class="table-card">
        <div class="table-card-header d-flex justify-content-between align-items-center">
            <h5>Agent Applications</h5>
            <div class="d-flex gap-2 align-items-center">
                <select id="outcomeFilter" class="form-select" style="width: auto; min-width: 150px;" onchange="filterApplications()">
                    <option value="">Filter by Outcome</option>
                    <option value="interested">Interested</option>
                    <option value="later">Call Back Later</option>
                    <option value="waste">Time Waste</option>
                    <option value="submitted">Submitted</option>
                </select>
                <div class="search-container">
                    <i class="bi bi-search search-icon"></i>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search by name, agent or number..." oninput="filterApplications()">
                </div>
            </div>
            <div id="loading-indicator" class="spinner-border text-primary spinner-border-sm d-none" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle" id="requestsTable">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Client Details</th>
                        <th>Agent</th>
                        <th style="width: 150px;">Date</th>
                        <th style="width: 180px;">Lead Outcome</th>
                        <th style="width: 120px;">Status</th>
                        <th style="width: 100px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Populated by JS -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Details Modal -->
<div class="modal fade" id="requestModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Application Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <!-- Application Data -->
                    <div class="col-md-7 border-end">
                        <div id="modalContent">
                            <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
                        </div>
                    </div>
                    <!-- Activity Timeline -->
                    <div class="col-md-5">
                        <h6 class="mb-3">Activity Timeline</h6>
                        <div id="timelineContent" class="timeline">
                            <!-- Timeline items here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div id="actionButtons">
                    <button type="button" class="btn btn-danger me-2" onclick="updateStatus('rejected')">Reject</button>
                    <button type="button" class="btn btn-success" onclick="updateStatus('approved')">Approve</button>
                </div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<!-- Rejection Reason Modal -->
<div class="modal fade" id="rejectReasonModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Reason for Rejection</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <label for="rejectionReason" class="form-label">Please provide a reason for rejecting this application:</label>
                <textarea class="form-control" id="rejectionReason" rows="3" placeholder="Enter reason here..."></textarea>
                <div id="rejectionError" class="text-danger small mt-2 d-none">Reason is required.</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="submitRejection()">Reject Application</button>
            </div>
        </div>
    </div>
</div>

<!-- Add Remark Modal -->
<div class="modal fade" id="addRemarkModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Remark</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <label for="newRemarkText" class="form-label">Add a note to the timeline:</label>
                <textarea class="form-control" id="newRemarkText" rows="3" placeholder="Enter remark here..."></textarea>
                <div id="remarkError" class="text-danger small mt-2 d-none">Remark cannot be empty.</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitNewRemark()">Add Remark</button>
            </div>
        </div>
    </div>
</div>

<!-- Edit Remark Modal -->
<div class="modal fade" id="editRemarkModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Remark</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editRemarkLogId">
                <label for="editRemarkText" class="form-label">Update existing remark:</label>
                <textarea class="form-control" id="editRemarkText" rows="3"></textarea>
                <div id="editRemarkError" class="text-danger small mt-2 d-none">Remark cannot be empty.</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitEditRemark()">Save Changes</button>
            </div>
        </div>
    </div>
</div>


<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
let currentAppId = null;
const CURRENT_USER_ID = <?php echo $_SESSION['user_id'] ?? 0; ?>;
const BASE_URL = '/avisaupdated/index.php';

// Helper to build API URL
function apiUrl(endpoint, params = {}) {
    const url = new URL(BASE_URL, window.location.origin);
    url.searchParams.append('path', endpoint);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    return url.toString();
}

// Polling
function fetchRequests(isPolling = false) {
    const indicator = document.getElementById('loading-indicator');
    if (!isPolling) indicator.classList.remove('d-none');
    
    fetch(apiUrl('api/agent/requests', { sort_by: 'date' }))
        .then(response => response.json())
        .then(data => {
            if (!isPolling) indicator.classList.add('d-none');
            if (data.success) {
                if (isPolling && window.allApplications && JSON.stringify(window.allApplications) === JSON.stringify(data.applications)) {
                    return;
                }
                window.allApplications = data.applications;
                
                updateStats(data.applications);

                const searchTerm = document.getElementById('searchInput').value.trim();
                const outcomeFilter = document.getElementById('outcomeFilter').value;
                
                if (searchTerm || outcomeFilter) {
                    filterApplications();
                } else {
                    renderTable(data.applications);
                }
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            if (!isPolling) indicator.classList.add('d-none');
        });
}

function updateStats(apps) {
    let interested = 0;
    let later = 0;
    let waste = 0;
    let todayCount = 0;
    
    const todayStr = new Date().toLocaleDateString('en-CA');

    apps.forEach(app => {
        let details = {};
        try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
        const outcome = (details.lead_outcome || 'submitted').toLowerCase().replace(/\s/g, '');

        if (outcome.includes('interested')) interested++;
        else if (outcome.includes('later')) later++;
        else if (outcome.includes('timewaste') || outcome.includes('waste')) waste++;
        
        if (app.created_at && app.created_at.startsWith(todayStr)) {
            todayCount++;
        }
    });

    // Animate numbers (simple implementation)
    document.getElementById('count-interested').innerText = interested;
    document.getElementById('count-later').innerText = later;
    document.getElementById('count-waste').innerText = waste;
    document.getElementById('count-today').innerText = todayCount;
    document.getElementById('count-total').innerText = apps.length;
}

function filterApplications() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const outcomeFilter = document.getElementById('outcomeFilter').value.toLowerCase();
    
    if (!window.allApplications) return;
    
    const filtered = window.allApplications.filter(app => {
        let details = {};
        try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
        
        const contact = (details.contact_number || app.contact_number || '').toLowerCase();
        const name = (app.client_name || '').toLowerCase();
        const agent = (app.agent_name || '').toLowerCase();
        const outcome = (details.lead_outcome || 'submitted').toLowerCase();
        const id = (app.id || '').toString();
        
        const matchesSearch = searchTerm === '' || contact.includes(searchTerm) || name.includes(searchTerm) || agent.includes(searchTerm) || id.includes(searchTerm);
        const matchesOutcome = outcomeFilter === '' || outcome.includes(outcomeFilter);
        
        return matchesSearch && matchesOutcome;
    });
    
    renderTable(filtered);
}

function renderTable(apps) {
    const tbody = document.querySelector('#requestsTable tbody');
    if(apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No applications found</td></tr>';
        return;
    }
    
    tbody.innerHTML = apps.map(app => {
        let details = {};
        try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
        
        const outcomeStr = details.lead_outcome || 'Submitted';
        const contact = details.contact_number || app.contact_number || 'N/A';
        
        let outcomeClass = 'outcome-default';
        let outcomeIcon = 'bi-circle';
        const lowerOutcome = outcomeStr.toLowerCase().replace(/\s/g, '');
        
        if (lowerOutcome.includes('interested')) { outcomeClass = 'outcome-interested'; outcomeIcon = 'bi-check-circle-fill'; }
        else if (lowerOutcome.includes('later')) { outcomeClass = 'outcome-later'; outcomeIcon = 'bi-clock-history'; }
        else if (lowerOutcome.includes('timewaste') || lowerOutcome.includes('waste')) { outcomeClass = 'outcome-timewaste'; outcomeIcon = 'bi-x-circle-fill'; }
        else if (lowerOutcome.includes('submitted')) { outcomeClass = 'outcome-submitted'; outcomeIcon = 'bi-file-earmark-check-fill'; }
        
        const statusClass = app.status === 'approved' ? 'approved' : 
                          (app.status === 'rejected' ? 'rejected' : 
                          (app.status === 'follow_up' ? 'follow_up' : 'pending'));
        
        let remarkBadge = '';
        if (app.remark_count > 0 && app.status === 'pending') {
            remarkBadge = `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="z-index: 1;">${app.remark_count}</span>`;
        }
        
        return `<tr>
            <td><span class="app-id">#${app.id}</span></td>
            <td><div class="client-name">${app.client_name}</div><div class="client-contact">${contact}</div></td>
            <td>${app.agent_name || 'Unknown'}</td>
            <td><small class="text-muted">${new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small></td>
            <td><div class="outcome-badge ${outcomeClass}"><i class="bi ${outcomeIcon}"></i> ${outcomeStr}</div></td>
            <td><span class="status-pill ${statusClass}">${app.status.toUpperCase()}</span></td>
            <td><button class="btn btn-sm btn-outline-primary position-relative" onclick="viewDetails(${app.id})"><i class="bi bi-eye"></i> View${remarkBadge}</button></td>
        </tr>`;
    }).join('');
}

function viewDetails(id) {
    currentAppId = id;
    const modalEl = document.getElementById('requestModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    
    document.getElementById('modalContent').innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
    document.getElementById('timelineContent').innerHTML = ''; 
    
    fetch(apiUrl('api/agent/application-details', { id: id }))
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                renderDetails(data.application, data.logs);
                updateModalButtons(data.application.status);
            } else {
                document.getElementById('modalContent').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            }
        });
}

function renderDetails(app, logs) {
    let details = {};
    if (typeof app.details === 'string') { try { details = JSON.parse(app.details); } catch(e) {} } 
    else { details = app.details || {}; }
    
    // Extract specific fields
    const agentRemarks = details.remarks || '';
    
    // Find rejection reason from logs if status is rejected
    let rejectionReason = '';
    let rejectionLogId = 0;
    let rejectionUserId = 0;

    if (app.status === 'rejected' && logs) {
        // Look for the most recent rejection log
        const rejectLog = logs.find(l => l.action_type === 'status_change' && (
            (l.details.includes && l.details.includes('rejected')) || 
            (typeof l.details === 'object' && l.details.to === 'rejected')
        ));
        
        if (rejectLog) {
            let d = rejectLog.details;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
            if (d && d.remarks) {
                rejectionReason = d.remarks;
                rejectionLogId = rejectLog.id;
                rejectionUserId = rejectLog.user_id;
            }
        }
    }

    let html = '';
    
    // 1. Rejection Alert
    if (app.status === 'rejected') {
        const safeRejectionReason = rejectionReason.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const canEditRejection = (rejectionUserId == CURRENT_USER_ID);

        html += `<div class="alert alert-danger border-danger d-flex align-items-center mb-4 shadow-sm" style="background-color: #fef2f2;">
        <i class="bi bi-x-circle-fill fs-3 me-3 text-danger"></i>
        <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="alert-heading fw-bold mb-1">Application Rejected</h6>
                ${canEditRejection ? `<button class="btn btn-link btn-sm p-0 text-danger text-decoration-none" onclick="openEditRemarkModal(${rejectionLogId}, '${safeRejectionReason}')"><i class="bi bi-pencil-square"></i> Edit</button>` : ''}
            </div>
            ${rejectionReason ? `<div class="mb-0 text-dark">${rejectionReason}</div>` : '<div class="small text-muted">No specific reason provided.</div>'}
        </div>
        </div>`;
    }

    // 2. Latest Internal Remark (Manager/Admin)
    let latestRemark = '';
    let latestRemarkUser = '';
    let latestRemarkDate = '';
    let latestRemarkId = 0;
    let latestRemarkUserId = 0;
    
    if (logs && logs.length > 0) {
        for (let l of logs) {
            let d = l.details;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
            
            // Show remark if it exists AND it's not the same as the rejection reason already displayed
            if (d && d.remarks && d.remarks !== rejectionReason) {
                latestRemark = d.remarks;
                latestRemarkUser = l.user_name || 'System';
                latestRemarkDate = new Date(l.created_at).toLocaleString();
                latestRemarkId = l.id;
                latestRemarkUserId = l.user_id;
                break; // Found latest
            }
        }
    }

    if (latestRemark) {
        // Escape special chars to prevent syntax errors in onclick
        const safeRemark = latestRemark.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        // Only show edit button if current user created the remark
        const canEdit = (latestRemarkUserId == CURRENT_USER_ID);

        html += `<div class="mb-4">
            <h6 class="text-uppercase text-muted small fw-bold mb-2">Latest Internal Note</h6>
            <div class="p-3 rounded border" style="background-color: #fff; border-left: 4px solid #f59e0b !important;">
                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <span class="small fw-bold text-dark"><i class="bi bi-person-fill me-1"></i>${latestRemarkUser}</span>
                    <div class="d-flex align-items-center gap-2">
                        <span class="small text-muted">${latestRemarkDate}</span>
                        ${canEdit ? `<button class="btn btn-link btn-sm p-0 text-decoration-none" onclick="openEditRemarkModal(${latestRemarkId}, '${safeRemark}')"><i class="bi bi-pencil-square"></i> Edit</button>` : ''}
                    </div>
                </div>
                <div class="text-dark">${latestRemark}</div>
            </div>
        </div>`;
    }

    // 3. Remarks Section (Better UX) - MOVED TO TOP
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
             <div class="card bg-light border-0 mb-4"><table class="table table-sm table-borderless mb-0">`;
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

function updateModalButtons(status) {
    const btns = document.getElementById('actionButtons');
    let html = '';
    if (status === 'rejected') { html += `<button type="button" class="btn btn-secondary me-2" disabled>Rejected</button>`; } 
    else { html += `<button type="button" class="btn btn-danger me-2" onclick="updateStatus('rejected')">Reject</button>`; }

    if (status === 'approved') { html += `<button type="button" class="btn btn-secondary" disabled>Approved</button>`; } 
    else { html += `<button type="button" class="btn btn-success" onclick="updateStatus('approved')">Approve</button>`; }
    
    // Add Remark Button
    html += `<button type="button" class="btn btn-outline-primary ms-2" onclick="openAddRemarkModal()">Add Remark</button>`;
    
    btns.innerHTML = html;
}

function openAddRemarkModal() {
    const modalEl = document.getElementById('requestModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();

    const remarkModalEl = document.getElementById('addRemarkModal');
    const remarkModal = bootstrap.Modal.getOrCreateInstance(remarkModalEl);
    document.getElementById('newRemarkText').value = '';
    document.getElementById('remarkError').classList.add('d-none');
    remarkModal.show();
}

function submitNewRemark() {
    const remark = document.getElementById('newRemarkText').value.trim();
    if (!remark) {
        document.getElementById('remarkError').classList.remove('d-none');
        return;
    }
    
    const remarkModalEl = document.getElementById('addRemarkModal');
    const remarkModal = bootstrap.Modal.getOrCreateInstance(remarkModalEl);
    remarkModal.hide();
    
    fetch(apiUrl('api/agent/add-remark'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: currentAppId, remarks: remark })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Re-open details modal which will refresh the timeline
            viewDetails(currentAppId);
        } else {
            alert('Error: ' + (data.error || 'Unknown'));
            viewDetails(currentAppId); // Re-open anyway
        }
    })
    .catch(e => {
        alert('Error submitting remark');
        viewDetails(currentAppId);
    });
}

function openEditRemarkModal(id, currentText) {
    const modalEl = document.getElementById('requestModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();

    const editModalEl = document.getElementById('editRemarkModal');
    const editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
    
    document.getElementById('editRemarkLogId').value = id;
    document.getElementById('editRemarkText').value = currentText;
    document.getElementById('editRemarkError').classList.add('d-none');
    
    editModal.show();
}

function submitEditRemark() {
    const id = document.getElementById('editRemarkLogId').value;
    const remark = document.getElementById('editRemarkText').value.trim();
    
    if (!remark) {
        document.getElementById('editRemarkError').classList.remove('d-none');
        return;
    }
    
    const editModalEl = document.getElementById('editRemarkModal');
    const editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
    editModal.hide();
    
    fetch(apiUrl('api/agent/edit-remark'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ log_id: id, remarks: remark })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            viewDetails(currentAppId);
        } else {
            alert('Error: ' + (data.error || 'Unknown'));
            viewDetails(currentAppId);
        }
    })
    .catch(e => {
        alert('Error saving remark');
        viewDetails(currentAppId);
    });
}

function updateStatus(newStatus) {
    if (!currentAppId) return;

    if (newStatus === 'rejected') {
        const modalEl = document.getElementById('requestModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();

        const rejectModalEl = document.getElementById('rejectReasonModal');
        const rejectModal = bootstrap.Modal.getOrCreateInstance(rejectModalEl);
        document.getElementById('rejectionReason').value = '';
        document.getElementById('rejectionError').classList.add('d-none');
        rejectModal.show();
        return;
    }
    
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) return;
    performUpdate(currentAppId, newStatus, '');
}

function submitRejection() {
    const reason = document.getElementById('rejectionReason').value.trim();
    if (!reason) {
        document.getElementById('rejectionError').classList.remove('d-none');
        return;
    }
    const rejectModalEl = document.getElementById('rejectReasonModal');
    const rejectModal = bootstrap.Modal.getOrCreateInstance(rejectModalEl);
    rejectModal.hide();
    performUpdate(currentAppId, 'rejected', reason);
}

function performUpdate(id, status, remarks) {
    fetch(apiUrl('api/agent/request-status'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: id, status: status, remarks: remarks })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fetchRequests(); 
            // 1. Try standard Bootstrap method
            const modalEl = document.getElementById('requestModal');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();

            // 2. Force DOM cleanup in case of desync
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                modalEl.setAttribute('aria-hidden', 'true');
                modalEl.removeAttribute('aria-modal');
                modalEl.removeAttribute('role');
            }, 100); 
        } else {
            alert('Error: ' + data.error);
        }
    });
}

// Initial fetch and polling setup
document.addEventListener('DOMContentLoaded', () => {
    fetchRequests();
    setInterval(() => fetchRequests(true), 10000); // Poll every 10 seconds
});
// Drawer & Drag Logic
const drawer = document.getElementById('statsDrawer');
const trigger = document.getElementById('statsTrigger');
let isDragging = false;
let startY, startTop;
let hasMoved = false;

// Initialize drag events
trigger.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDrag);

// Handle click (differentiate from drag)
trigger.addEventListener('click', (e) => {
    if (!hasMoved) {
        toggleStatsDrawer();
    }
    e.stopPropagation(); // Prevent document click from firing immediately
});

// Close drawer when clicking outside
document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && 
        !drawer.contains(e.target) && 
        !trigger.contains(e.target)) {
        toggleStatsDrawer();
    }
});

function startDrag(e) {
    isDragging = true;
    hasMoved = false;
    startY = e.clientY;
    startTop = trigger.offsetTop;
    trigger.style.transition = 'none'; // Disable transition during drag for smoothness
    trigger.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaY = e.clientY - startY;
    
    // Threshold to consider it a drag move
    if (Math.abs(deltaY) > 5) hasMoved = true;
    
    let newTop = startTop + deltaY;
    
    // Constrain to viewport height
    const minTop = 50;
    const maxTop = window.innerHeight - 50;
    
    if (newTop < minTop) newTop = minTop;
    if (newTop > maxTop) newTop = maxTop;
    
    trigger.style.top = newTop + 'px';
    // Update transform to keep centered on finger/mouse if needed, or rely on absolute positioning
    // Since we set top directly, remove transformY if we want absolute control, 
    // BUT our CSS has transform: translateY(-50%), so 'top' sets the center point.
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    trigger.style.transition = 'top 0.3s ease'; // Re-enable transition
    trigger.style.cursor = 'move';
}

function toggleStatsDrawer() {
    drawer.classList.toggle('open');
    
    if (drawer.classList.contains('open')) {
        // Option A: Hide trigger
        // trigger.style.display = 'none'; 
        // Option B: Slide it with the drawer (complex)
        // Option C: Just keep it there or minimize it
        trigger.style.right = '320px'; // Move with drawer
        trigger.innerHTML = '<i class="bi bi-chevron-right"></i>';
        trigger.style.padding = '10px 10px';
    } else {
        trigger.style.right = '0';
        trigger.innerHTML = '<i class="bi bi-chevron-left me-2"></i><i class="bi bi-bar-chart-fill"></i> <span>Stats</span>';
        trigger.style.padding = '12px 16px';
    }
}
</script>
</body>
</html>
