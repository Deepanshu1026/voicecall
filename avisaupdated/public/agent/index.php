<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'agent') {
    header("Location: ../login.php");
    exit;
}
$active = 'dashboard';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Agent Dashboard - Avisa</title>  
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <link rel="stylesheet" href="../assets/css/agent-dashboard.css">
    <style>
        /* Agent specific extra styles if needed */
        
        /* Clickable Stat Cards */
        .stat-card-clickable {
            transition: all 0.3s ease;
            position: relative;
        }
        .stat-card-clickable:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        .stat-card-clickable.active {
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
            border: 2px solid #6366f1;
        }
        .stat-card-clickable.active::after {
            content: '';
            position: absolute;
            top: 10px;
            right: 10px;
            width: 8px;
            height: 8px;
            background: #6366f1;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        
        .btn-new-app-dash {
            background-color: var(--primary);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .btn-new-app-dash:hover {
            background-color: #4f46e5;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
        .table {
            margin-bottom: 0;
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
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
            color: #991b1b;
        }
        .status-pill.pending { 
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        .client-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 0.95rem;
        }
        .client-contact {
            font-size: 0.8rem;
            color: #64748b;
        }
        .app-id {
            color: #64748b;
            font-weight: 500;
        }
        .action-btn {
            padding: 8px 16px;
            font-size: 0.85rem;
            border-radius: 8px;
            transition: all 0.2s;
            font-weight: 500;
        }
        .action-btn:hover {
            background-color: #6366f1;
            color: white;
            border-color: #6366f1;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
        }
        .date-info {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #64748b;
            font-size: 0.85rem;
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

    <div class="container-fluid pb-5">
    <div class="page-header mt-4 d-flex justify-content-between align-items-center">
        <div>
            <h3>Agent Dashboard</h3>
            <p>Track your client applications and status.</p>
        </div>
        <a href="form.php" class="btn btn-outline-dark d-inline-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i> New Application
        </a>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="stat-card stat-card-blue stat-card-clickable active" id="cardAll" onclick="filterByStatus('all')" style="cursor: pointer;">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-folder-fill stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="statTotal">0</div>
                    <div class="stat-label">Total Applications</div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="stat-card stat-card-purple stat-card-clickable" id="cardPending" onclick="filterByStatus('pending')" style="cursor: pointer;">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-hourglass-split stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="statPending">0</div>
                    <div class="stat-label">Pending Review</div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="stat-card stat-card-green stat-card-clickable" id="cardApproved" onclick="filterByStatus('approved')" style="cursor: pointer;">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-check-circle-fill stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="statApproved">0</div>
                    <div class="stat-label">Approved</div>
                </div>
            </div>
        </div>

         <div class="col-md-3">
            <div class="stat-card stat-card-red stat-card-clickable" id="cardRejected" onclick="filterByStatus('rejected')" style="cursor: pointer; --card-color: #f56565; --icon-bg: #fff5f5;">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-x-circle-fill stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="statRejected">0</div>
                    <div class="stat-label">Rejected</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Applications Table -->
    <div class="table-card">
        <div class="table-card-header d-flex flex-wrap gap-3 justify-content-between align-items-center">
            <h5 class="mb-0">Recent Applications</h5>
            
            <div class="d-flex gap-3 align-items-center flex-grow-1 justify-content-end">
                <!-- Filter Dropdown -->
                <div style="min-width: 200px;">
                    <select id="outcomeFilter" class="form-select" onchange="filterApplications()">
                        <option value="">Filter by Outcome</option>
                        <option value="Interested">Interested</option>
                        <option value="Later">Call Back Later</option>
                        <option value="Time Waste">Time Waste</option>
                        <!-- <option value="Submitted">Submitted</option> -->
                    </select>
                </div>

                <div class="search-container">
                    <i class="bi bi-search search-icon"></i>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search by name or contact..." oninput="filterApplications()">
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Client Details</th>
                        <th style="width: 180px;">Submitted</th>
                        <th style="width: 180px;">Lead Outcome</th>
                        <th style="width: 120px;">Status</th>
                        <th style="width: 140px;" class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody id="appTableBody">
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="loading-spinner mb-2"></div>
                            <p class="text-muted">Loading...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>

</div>

</div>

<!-- Application Details Modal -->
<div class="modal fade" id="appDetailsModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Application Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-7 border-end">
                        <div id="modalContent">
                             <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
                        </div>
                    </div>
                    <div class="col-md-5">
                       <h6 class="mb-3">Activity Timeline</h6>
                       <div id="timelineContent" class="timeline"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" id="appDetailsFooter">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                             <a href="#" id="editAppBtn" class="btn btn-primary d-none">Edit Application</a>
            </div>
        </div>
    </div>
</div>


<!-- Edit Application Modal -->
<div class="modal fade" id="editAppModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Application</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="editAppForm">
                    <input type="hidden" name="id" id="editAppId">
                    
                    <div class="row g-3">
                        <!-- Submission Info -->
                        <div class="col-md-3">
                            <label class="form-label">Submission Date</label>
                            <input type="date" class="form-control" name="submission_date" id="edit_submission_date">
                        </div>
                         <div class="col-md-3">
                            <label class="form-label">Gender</label>
                            <select class="form-select" name="gender" id="edit_gender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <!-- Client Info -->
                        <div class="col-md-6">
                            <label class="form-label">Client Name</label>
                            <input type="text" class="form-control" name="client_name" id="edit_client_name" required>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Age</label>
                            <input type="number" class="form-control" name="age" id="edit_age">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label">Spouse Name</label>
                            <input type="text" class="form-control" name="spouse_name" id="edit_spouse_name">
                        </div>
                         <div class="col-md-4">
                            <label class="form-label">Spouse Age</label>
                            <input type="number" class="form-control" name="spouse_age" id="edit_spouse_age">
                        </div>
                        
                         <div class="col-12">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-control" name="address" id="edit_address">
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">City</label>
                            <input type="text" class="form-control" name="city" id="edit_city">
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">State</label>
                            <input type="text" class="form-control" name="state" id="edit_state">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Contact Number</label>
                            <input type="text" class="form-control" name="contact_number" id="edit_contact_number" required>
                        </div>
                        
                        <!-- Visa Info -->
                        <div class="col-md-6">
                            <label class="form-label">Visa Type</label>
                            <select class="form-select" name="visa_type" id="edit_visa_type">
                                <option value="Study Visa">Study Visa</option>
                                <option value="Tourist Visa">Tourist Visa</option>
                                <option value="Work Visa">Work Visa</option>
                                <option value="PR">PR</option>
                            </select>
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">Country</label>
                            <select class="form-select" name="visa_country" id="edit_visa_country">
                                <option value="Canada">Canada</option>
                                <option value="UK">UK</option>
                                <option value="USA">USA</option>
                                <option value="Australia">Australia</option>
                                <option value="Europe">Europe</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">Passport Validity</label>
                            <input type="date" class="form-control" name="passport_validity" id="edit_passport_validity">
                        </div>
                        
                        <!-- Background -->
                        <div class="col-12"><hr class="my-2"></div>
                        <div class="col-md-4">
                            <label class="form-label">Education</label>
                            <input type="text" class="form-control" name="education" id="edit_education">
                        </div>
                         <div class="col-md-4">
                            <label class="form-label">IELTS Score</label>
                            <input type="text" class="form-control" name="ielts_score" id="edit_ielts_score">
                        </div>
                         <div class="col-md-4">
                            <label class="form-label">Occupation</label>
                            <input type="text" class="form-control" name="occupation" id="edit_occupation">
                        </div>
                        
                        <div class="col-md-6">
                            <label class="form-label">Annual Income</label>
                            <input type="text" class="form-control" name="income" id="edit_income">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Bank Balance</label>
                            <input type="text" class="form-control" name="bank_balance" id="edit_bank_balance">
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">Travel History</label>
                            <textarea class="form-control" name="travel_history" id="edit_travel_history" rows="2"></textarea>
                        </div>
                         <div class="col-md-6">
                            <label class="form-label">Refusal History</label>
                            <textarea class="form-control" name="refusal_history" id="edit_refusal_history" rows="2"></textarea>
                        </div>
                        
                        <div class="col-12">
                            <label class="form-label">Remarks</label>
                            <textarea class="form-control" name="remarks" id="edit_remarks" rows="2"></textarea>
                        </div>

                        <!-- Lead Outcome -->
                        <div class="col-12 mt-4">
                            <label class="form-label d-block fw-bold">Lead Outcome</label>
                            <div class="btn-group w-100" role="group">
                                <input type="radio" class="btn-check" name="lead_outcome" id="edit_outcome_interested" value="Interested">
                                <label class="btn btn-outline-success" for="edit_outcome_interested">Interested</label>

                                <input type="radio" class="btn-check" name="lead_outcome" id="edit_outcome_later" value="Later">
                                <label class="btn btn-outline-warning" for="edit_outcome_later">Call Back Later</label>

                                <input type="radio" class="btn-check" name="lead_outcome" id="edit_outcome_waste" value="Time Waste">
                                <label class="btn btn-outline-danger" for="edit_outcome_waste">Time Waste</label>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="saveEdit()">Save Changes</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
    const API_BASE = '/avisaupdated/index.php?path=';
    let currentStatusFilter = 'all'; // Track current status filter
    
    // Smart polling - only update when data changes
    let lastDataHash = null;
    let lastStatsHash = null;
    
    function hashData(data) {
        // Create a simple hash from the data to detect changes
        return JSON.stringify(data);
    }
    
    async function loadStats() {
        try {
            const res = await fetch(API_BASE + 'api/agent/stats');
            const data = await res.json();
            if (data.success && data.stats) {
                document.getElementById('statTotal').innerText = data.stats.total;
                document.getElementById('statPending').innerText = data.stats.pending;
                document.getElementById('statApproved').innerText = data.stats.approved;
                document.getElementById('statRejected').innerText = data.stats.rejected;
                // Set initial hash
                lastStatsHash = hashData(data.stats);
            }
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    }

    async function loadApplications() {
        try {
            const res = await fetch(API_BASE + 'api/agent/applications');
            const data = await res.json();
            
            const tbody = document.getElementById('appTableBody');
            
            if (data.success && data.applications && data.applications.length > 0) {
                // Store all applications globally for search
                window.allApplications = data.applications;
                renderApplications(data.applications);
                // Set initial hash
                lastDataHash = hashData(data.applications);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No applications submitted yet.</td></tr>`;
            }
        } catch (e) {
            console.error('Failed to load applications', e);
             document.getElementById('appTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load data.</td></tr>`;
        }
    }

    function renderApplications(applications) {
        const tbody = document.getElementById('appTableBody');
        tbody.innerHTML = '';
        
        if (applications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No matching applications found.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = applications.map(app => {
            let details = {};
            try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
            
            const outcomeStr = details.lead_outcome || 'Submitted';
            
            let outcomeClass = 'outcome-default';
            let outcomeIcon = 'bi-circle';
            const lowerOutcome = outcomeStr.toLowerCase().replace(/\s/g, '');
            
            if (lowerOutcome.includes('interested')) { outcomeClass = 'outcome-interested'; outcomeIcon = 'bi-check-circle-fill'; }
            else if (lowerOutcome.includes('later')) { outcomeClass = 'outcome-later'; outcomeIcon = 'bi-clock-history'; }
            else if (lowerOutcome.includes('timewaste') || lowerOutcome.includes('waste')) { outcomeClass = 'outcome-timewaste'; outcomeIcon = 'bi-x-circle-fill'; }
            else if (lowerOutcome.includes('submitted')) { outcomeClass = 'outcome-submitted'; outcomeIcon = 'bi-file-earmark-check-fill'; }

            // Remark Notification Badge
            let remarkBadge = '';
            if (app.remark_count > 0 && app.status === 'pending') {
                remarkBadge = `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="z-index: 1;">${app.remark_count}</span>`;
            }

            const statusClass = app.status === 'approved' ? 'approved' : (app.status === 'rejected' ? 'rejected' : 'pending');

            return `<tr>
                <td><span class="app-id">#${app.id}</span></td>
                <td>
                    <div class="fw-bold text-dark">${app.client_name}</div>
                    <div class="small text-muted">${app.contact_number || (details.contact_number || 'N/A')}</div>
                </td>
                <td><small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small></td>
                <td><div class="outcome-badge ${outcomeClass}"><i class="bi ${outcomeIcon}"></i> ${outcomeStr}</div></td>
                <td><span class="status-pill ${statusClass}">${app.status.toUpperCase()}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary position-relative" onclick="viewApplication(${app.id})">
                        <i class="bi bi-eye me-1"></i>View
                        ${remarkBadge}
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    function filterByStatus(status) {
        currentStatusFilter = status;
        
        // Update active state on cards
        document.querySelectorAll('.stat-card-clickable').forEach(card => {
            card.classList.remove('active');
        });
        
        const cardMap = {
            'all': 'cardAll',
            'pending': 'cardPending',
            'approved': 'cardApproved',
            'rejected': 'cardRejected'
        };
        
        if (cardMap[status]) {
            document.getElementById(cardMap[status]).classList.add('active');
        }
        
        // Apply filters
        filterApplications();
    }
    
    function filterApplications() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const outcomeFilter = document.getElementById('outcomeFilter').value.toLowerCase();
        
        if (!window.allApplications) return;
        
        const filtered = window.allApplications.filter(app => {
            const contact = (app.contact_number || '').toLowerCase();
            const name = (app.client_name || '').toLowerCase();
            
            // Search Text Match
            const matchesSearch = searchTerm === '' || contact.includes(searchTerm) || name.includes(searchTerm);
            
            // Status Match
            const matchesStatus = currentStatusFilter === 'all' || app.status === currentStatusFilter;
            
            // Outcome Match
            let matchesOutcome = true;
            if (outcomeFilter !== '') {
                let details = {};
                try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
                const appOutcome = (details.lead_outcome || 'submitted').toLowerCase();
                
                if (outcomeFilter === 'submitted') {
                    // Match specific 'submitted' or default if missing
                    matchesOutcome = appOutcome === 'submitted'; 
                } else {
                    matchesOutcome = appOutcome.includes(outcomeFilter);
                }
            }
            
            return matchesSearch && matchesStatus && matchesOutcome;
        });
        
        renderApplications(filtered);
    }

    let detailsModal;

    async function viewApplication(id) {
        if (!detailsModal) detailsModal = new bootstrap.Modal(document.getElementById('appDetailsModal'));
        detailsModal.show();
        
        document.getElementById('modalContent').innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        document.getElementById('timelineContent').innerHTML = '';
        
        // Update Footer with Edit Button (initially hidden until loaded)
        const editBtn = document.getElementById('editAppBtn');
        editBtn.classList.add('d-none');
        editBtn.removeAttribute('href');
        // Remove any existing event listeners by cloning
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        
        newEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Opening edit modal for ID:', id);
            openEditModal(id);
        });
        
        try {
            const res = await fetch(API_BASE + 'api/agent/application-details&id=' + id);
            const data = await res.json();
            
            if (data.success && data.application) {
                renderDetails(data.application, data.logs);
                // Reveal the button (using the fresh reference from DOM)
                document.getElementById('editAppBtn').classList.remove('d-none');
            } else {
                 document.getElementById('modalContent').innerHTML = `<div class="alert alert-danger">${data.error || 'Failed to load'}</div>`;
            }
        } catch (e) {
             document.getElementById('modalContent').innerHTML = `<div class="alert alert-danger">Error loading details</div>`;
        }
    }

    function renderDetails(app, logs) {
        let details = {};
        if (typeof app.details === 'string') { try { details = JSON.parse(app.details); } catch(e) {} } 
        else { details = app.details || {}; }
        
        const agentRemarks = details.remarks || '';
        
        let html = '';

        // Check for Rejection Reason in logs
        if (app.status === 'rejected' && logs && logs.length > 0) {
            let rejectionReason = '';
            for (let l of logs) {
                if (l.action_type === 'status_change') {
                    let d = l.details;
                    if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
                    if (d && d.to === 'rejected' && d.remarks) {
                        rejectionReason = d.remarks;
                        break;
                    }
                }
            }

            if (rejectionReason) {
                html += `<div class="alert alert-danger d-flex align-items-start mb-4" role="alert">
                    <i class="bi bi-x-circle-fill me-3 fs-4"></i>
                    <div>
                        <div class="fw-bold mb-1">Application Rejected</div>
                        <div>${rejectionReason}</div>
                    </div>
                </div>`;
            }
        }
        
        // 1. Latest Internal Note (Admin/Manager remarks)
        if (logs && logs.length > 0) {
            let latestRemark = '';
            let latestRemarkUser = '';
            let latestRemarkDate = '';

            for (let l of logs) {
                // Skip if it's the same rejection remark we just showed
                if (app.status === 'rejected' && l.action_type === 'status_change') continue;

                let d = l.details;
                if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){} }
                
                if (d && d.remarks && (l.action_type === 'admin_remark' || l.action_type === 'status_change')) {
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

    // --- Edit Modal Logic (Restored) ---
    let editModal;
    let currentEditApp = null;

    async function openEditModal(id) {
        // Handle transitions between modals to avoid backdrop errors
        if (detailsModal) {
            detailsModal.hide();
        } else {
             const existingDetails = bootstrap.Modal.getInstance(document.getElementById('appDetailsModal'));
             if (existingDetails) existingDetails.hide();
        }
        
        // Small delay to ensure previous modal backdrop is cleared
        setTimeout(async () => {
            const modalEl = document.getElementById('editAppModal');
            if (!editModal) {
                editModal = new bootstrap.Modal(modalEl);
            }
            editModal.show();
            
            // Fetch and populate data
            try {
                const res = await fetch(API_BASE + 'api/agent/application-details&id=' + id);
                const data = await res.json();
                
                if (data.success && data.application) {
                    currentEditApp = data.application;
                    const app = data.application;
                    let details = {};
                    try {
                        details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {});
                    } catch(e) {}
                    
                    // Helper to clean 'not-provided' values
                    const getVal = (v) => (!v || String(v).toLowerCase().replace(/[\s-]/g,'') === 'notprovided') ? '' : v;

                    // Populate form
                    document.getElementById('editAppId').value = app.id;
                    document.getElementById('edit_submission_date').value = getVal(details.submission_date);
                    document.getElementById('edit_gender').value = getVal(details.gender);
                    document.getElementById('edit_client_name').value = app.client_name || '';
                    document.getElementById('edit_age').value = getVal(details.age);
                    document.getElementById('edit_spouse_name').value = getVal(details.spouse_name);
                    document.getElementById('edit_spouse_age').value = getVal(details.spouse_age);
                    document.getElementById('edit_address').value = getVal(details.address);
                    document.getElementById('edit_city').value = getVal(details.city);
                    document.getElementById('edit_state').value = getVal(details.state);
                    document.getElementById('edit_contact_number').value = getVal(details.contact_number || app.contact_number);
                    document.getElementById('edit_visa_type').value = getVal(details.visa_type);
                    document.getElementById('edit_visa_country').value = getVal(details.visa_country);
                    document.getElementById('edit_passport_validity').value = getVal(details.passport_validity);
                    document.getElementById('edit_education').value = getVal(details.education);
                    document.getElementById('edit_ielts_score').value = getVal(details.ielts_score);
                    document.getElementById('edit_occupation').value = getVal(details.occupation);
                    document.getElementById('edit_income').value = getVal(details.income);
                    document.getElementById('edit_bank_balance').value = getVal(details.bank_balance);
                    document.getElementById('edit_travel_history').value = getVal(details.travel_history);
                    document.getElementById('edit_refusal_history').value = getVal(details.refusal_history);
                    document.getElementById('edit_remarks').value = getVal(details.remarks);
                    
                    // Set lead outcome radio
                    if (details.lead_outcome) {
                        const outcomeMap = {
                            'Interested': 'edit_outcome_interested',
                            'Later': 'edit_outcome_later',
                            'Time Waste': 'edit_outcome_waste'
                        };
                        const radioId = outcomeMap[details.lead_outcome];
                        if (radioId) {
                            document.getElementById(radioId).checked = true;
                        }
                    }
                }
            } catch(e) {
                console.error(e);
                alert('Error loading application data');
            }
        }, 300); // 300ms delay for safe transition
    }

    async function saveEdit() {
        const formData = new FormData(document.getElementById('editAppForm'));
        const data = Object.fromEntries(formData.entries());
        
        console.log('Saving edit:', data);
        
        if (!data.id) {
            alert('Error: No application ID');
            return;
        }
        
        try {
            const res = await fetch(API_BASE + 'api/agent/update-application', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            console.log('Update result:', result);
            
            if (result.success) {
                alert('Application updated successfully!');
                editModal.hide();
                loadApplications(); // Refresh list
            } else {
                alert('Error: ' + (result.error || 'Unknown error'));
            }
        } catch(e) {
            console.error(e);
            alert('Error saving changes');
        }
    }

    async function smartLoadStats() {
        try {
            const res = await fetch(API_BASE + 'api/agent/stats');
            const data = await res.json();
            
            if (data.success && data.stats) {
                const currentHash = hashData(data.stats);
                
                // Only update if stats have changed
                if (currentHash !== lastStatsHash) {
                    document.getElementById('statTotal').innerText = data.stats.total;
                    document.getElementById('statPending').innerText = data.stats.pending;
                    document.getElementById('statApproved').innerText = data.stats.approved;
                    document.getElementById('statRejected').innerText = data.stats.rejected;
                    lastStatsHash = currentHash;
                }
            }
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    }
    
    async function smartLoadApplications() {
        try {
            const res = await fetch(API_BASE + 'api/agent/applications');
            const data = await res.json();
            
            if (data.success && data.applications) {
                const currentHash = hashData(data.applications);
                
                // Only update if applications have changed
                if (currentHash !== lastDataHash) {
                    window.allApplications = data.applications;
                    
                    // Re-apply current filters to the new data
                    filterApplications();
                    
                    lastDataHash = currentHash;
                    console.log('Applications updated - new data detected');
                }
            }
        } catch (e) {
            console.error('Failed to load applications', e);
        }
    }
    
    // Load on page load
    document.addEventListener('DOMContentLoaded', () => {
        loadStats();
        loadApplications();
        
        // Smart polling every 5 seconds - only updates UI when data changes
        setInterval(() => {
            smartLoadStats();
            smartLoadApplications();
        }, 5000);
    });
</script>

</body>
</html>