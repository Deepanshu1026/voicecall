<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();

// Allow Admin and Manager
if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
    header("Location: ../login.php");
    exit;
}

$active = 'follow_ups'; // Update active page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Follow Up Applications - Avisa Portal</title> <!-- Upated Title -->
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
    </style>
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header">
        <h3>Follow Up Applications</h3>
        <p>Review applications that require follow up.</p>
    </div>

    <div class="table-card">
        <div class="table-card-header d-flex justify-content-between align-items-center">
            <h5>Follow Up List <span id="followUpCount" class="badge bg-primary rounded-pill ms-2" style="font-size: 0.7em;">0</span></h5>
            <div class="d-flex gap-2 align-items-center">
                <select id="outcomeFilter" class="form-select" style="width: auto; min-width: 150px;" onchange="filterApplications()">
                    <option value="">Filter by Outcome</option>
                    <option value="interested">Interested</option>
                    <option value="later">Call Back Later</option>
                    <option value="waste">Time Waste</option>
                    <option value="submitted">Submitted</option>
                </select>
                <select id="adminFilter" class="form-select" style="width: auto; min-width: 150px;" onchange="handleAdminFilterChange()">
                    <option value="">All Admins</option>
                    <!-- Populated by JS -->
                </select>
                <div class="form-check form-switch d-flex align-items-center gap-2 border rounded px-3 py-2 bg-light">
                    <input class="form-check-input m-0" type="checkbox" role="switch" id="myListToggle" checked onchange="handleMyListToggle()">
                    <label class="form-check-label small fw-bold text-secondary mb-0" for="myListToggle">My Follow Ups</label>
                </div>
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
                        <th style="width: 140px;">Status</th>
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
    
    // FETCH FOLLOW UP
    const myList = document.getElementById('myListToggle').checked ? 1 : 0;
    const adminId = document.getElementById('adminFilter').value;
    
    const params = { status: 'follow_up', my_list: myList };
    if (adminId) params.admin_id = adminId;

    fetch(apiUrl('api/agent/requests', params))
        .then(response => response.json())
        .then(data => {
            if (!isPolling) indicator.classList.add('d-none');
            if (data.success) {
                if (isPolling && window.allApplications && JSON.stringify(window.allApplications) === JSON.stringify(data.applications)) {
                    return;
                }
                window.allApplications = data.applications;
                filterApplications();
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            if (!isPolling) indicator.classList.add('d-none');
        });
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
        // Match outcome
        const matchesOutcome = outcomeFilter === '' || outcome.includes(outcomeFilter);
        
        return matchesSearch && matchesOutcome;
    });
    
    renderTable(filtered);
    document.getElementById('followUpCount').innerText = filtered.length;
}


function renderTable(apps) {
    const tbody = document.querySelector('#requestsTable tbody');
    if(apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No follow up applications found</td></tr>';
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
        
        const statusClass = 'follow_up';
        
        let remarkBadge = '';
        if (app.remark_count > 0) {
            remarkBadge = `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="z-index: 1;">${app.remark_count}</span>`;
        }
        
        return `<tr>
            <td><span class="app-id">#${app.id}</span></td>
            <td><div class="client-name">${app.client_name}</div><div class="client-contact">${contact}</div></td>
            <td>${app.agent_name || 'Unknown'}</td>
            <td><small class="text-muted">${new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small></td>
            <td><div class="outcome-badge ${outcomeClass}"><i class="bi ${outcomeIcon}"></i> ${outcomeStr}</div></td>
            <td><span class="status-pill ${statusClass}">${app.status.toUpperCase().replace('_', ' ')}</span></td>
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
    
    const agentRemarks = details.remarks || '';
    
    // Find rejection reason
    let rejectionReason = '';
    let rejectionLogId = 0;
    let rejectionUserId = 0;

    if (app.status === 'rejected' && logs) {
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
    
    if (logs && logs.length > 0) {
        let latestRemark = '';
        let latestRemarkUser = '';
        let latestRemarkDate = '';
        let latestRemarkId = 0;
        let latestRemarkUserId = 0;

        for (let l of logs) {
            let d = l.details;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
            
            if (d && d.remarks && d.remarks !== rejectionReason) {
                latestRemark = d.remarks;
                latestRemarkUser = l.user_name || 'System';
                latestRemarkDate = new Date(l.created_at).toLocaleString();
                latestRemarkId = l.id;
                latestRemarkUserId = l.user_id;
                break;
            }
        }
    
        if (latestRemark) {
            const safeRemark = latestRemark.replace(/'/g, "\\'").replace(/"/g, '&quot;');
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

function updateModalButtons(status) {
    const btns = document.getElementById('actionButtons');
    let html = '';
    // Even if we are in pending view, if we view an app that somehow got updated elsewhere, handle status
    if (status === 'rejected') { html += `<button type="button" class="btn btn-secondary me-2" disabled>Rejected</button>`; } 
    else { html += `<button type="button" class="btn btn-danger me-2" onclick="updateStatus('rejected')">Reject</button>`; }

    if (status === 'approved') { html += `<button type="button" class="btn btn-secondary" disabled>Approved</button>`; } 
    else { html += `<button type="button" class="btn btn-success" onclick="updateStatus('approved')">Approve</button>`; }
    
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
            viewDetails(currentAppId);
            fetchRequests(); // Refresh table too
        } else {
            alert('Error: ' + (data.error || 'Unknown'));
            viewDetails(currentAppId);
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
            const modalEl = document.getElementById('requestModal');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
            
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 300);
        } else {
            alert('Error: ' + (data.error || 'Unknown'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed');
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchAdmins();
    fetchRequests();
    // Poll every 10 seconds
    setInterval(() => fetchRequests(true), 10000);
});

function fetchAdmins() {
    fetch(apiUrl('api/users/list'))
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const admins = data.users.filter(u => ['admin', 'manager'].includes(u.role));
                const select = document.getElementById('adminFilter');
                admins.forEach(admin => {
                    const opt = document.createElement('option');
                    opt.value = admin.id;
                    opt.textContent = admin.name + ' (' + admin.role + ')';
                    select.appendChild(opt);
                });
            }
        });
}

function handleAdminFilterChange() {
    const adminId = document.getElementById('adminFilter').value;
    if (adminId) {
        document.getElementById('myListToggle').checked = false;
    }
    fetchRequests();
}

function handleMyListToggle() {
    const isChecked = document.getElementById('myListToggle').checked;
    if (isChecked) {
        document.getElementById('adminFilter').value = "";
    }
    fetchRequests();
}
</script>
</body>
</html>
