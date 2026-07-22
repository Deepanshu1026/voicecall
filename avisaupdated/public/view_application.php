<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';

require_auth();

$appId = $_GET['id'] ?? 0;

// Ensure role is valid
$role = $_SESSION['role'] ?? '';
if (!in_array($role, ['admin', 'manager', 'agent'])) {
    die("Unauthorized access.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $appId ? "Application Details #$appId" : "All Applications"; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root{
            --surface: #ffffff;
            --bg: #f6f8fc;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e5e7eb;
            --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
            --shadow-md: 0 10px 20px rgba(15, 23, 42, 0.08);
            --radius: 14px;
        }
        body {
            background: radial-gradient(1200px 600px at 10% -10%, rgba(99, 102, 241, 0.08), transparent 60%),
                        radial-gradient(1000px 600px at 90% 0%, rgba(16, 185, 129, 0.06), transparent 55%),
                        var(--bg);
            font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            color: var(--text);
            padding-top: 96px;
        }
        .page-shell { max-width: 1180px; }
        .topbar {
            background: rgba(255,255,255,0.9);
            border: 1px solid rgba(229,231,235,0.8);
            backdrop-filter: blur(8px);
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
        }
        .topbar .title {
            font-size: 1.05rem;
            letter-spacing: -0.01em;
        }
        .topbar .subtitle {
            color: var(--muted);
            font-size: 0.875rem;
        }
        .card-surface {
            background: var(--surface);
            border: 1px solid rgba(229,231,235,0.9);
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
        }
        .section-card { padding: 1.25rem; }
        .details-card { padding: 1.5rem; }
        .kpi {
            border: 1px solid rgba(229,231,235,0.9);
            border-radius: 12px;
            padding: 0.75rem 0.9rem;
            background: #fbfcff;
        }
        .info-label {
            font-size: 0.72rem;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
        }
        .info-value { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.85rem; }
        .badge-status { padding: 0.45em 0.8em; font-weight: 700; border-radius: 999px; letter-spacing: 0.02em; }
        .table th {
            background: #f8fafc;
            color: var(--muted);
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 0.95rem 1rem;
            border-bottom: 1px solid rgba(229,231,235,0.9);
        }
        .table td { vertical-align: middle; padding: 0.95rem 1rem; font-size: 0.9rem; color: #334155; }
        .row-link { cursor: pointer; transition: background 0.15s ease; }
        .row-link:hover { background-color: #f3f6ff; }
        .form-control, .form-select { border-radius: 12px; }
        .form-control:focus, .form-select:focus { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12); border-color: #6366f1; }
        .btn.rounded-pill { font-weight: 600; }
        .muted { color: var(--muted); }
        .timeline { border-left: 2px solid #e8edf7; padding-left: 18px; margin-left: 10px; }
        .timeline-item { position: relative; margin-bottom: 18px; }
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -25px;
            top: 4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #6366f1;
            border: 2px solid #fff;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .timeline-item.is-success::before { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.14); }
        .timeline-item.is-danger::before { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.14); }
        .timeline-item.is-warning::before { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.16); }
        .sticky-actions {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(min(1180px, 100% - 24px));
            z-index: 1030;
            box-shadow: var(--shadow-md);
        }
        @media (max-width: 576px) {
            body { padding-top: 118px; }
            .sticky-actions { top: 12px; width: calc(100% - 16px); }
        }
    </style>
</head>
<body>
    <div class="container pb-5 page-shell">
        <div class="topbar sticky-actions px-3 px-md-4 py-3">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div class="d-flex align-items-start gap-3">
                    <div class="d-flex align-items-center justify-content-center rounded-3" style="width:42px;height:42px;background:#eef2ff;border:1px solid rgba(99,102,241,0.25);">
                        <i class="bi bi-clipboard-data text-primary fs-5"></i>
                    </div>
                    <div>
                        <div id="pageTitle" class="title fw-bold">
                            <?php echo $appId ? "Application #$appId" : "Reports"; ?>
                        </div>
                        <div class="subtitle">
                            <?php echo $appId ? "Review submitted details, current status, and activity history." : "Filter, review, and export operational data."; ?>
                        </div>
                    </div>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-2">
                    <?php if (!$appId): ?>
                        <select id="dataCategory" class="form-select form-select-sm rounded-pill px-3 border-primary" style="width:auto; height: 38px; font-weight: 700;" onchange="handleCategoryChange()">
                            <option value="applications">Application Leads</option>
                            <option value="appointments">Appointments</option>
                            <option value="logins">Daily Logins</option>
                        </select>
                    <?php endif; ?>

                    <?php if ($appId): ?>
                        <button class="btn btn-outline-secondary px-4 rounded-pill" onclick="window.history.back()">
                            <i class="bi bi-arrow-left"></i> Back
                        </button>
                    <?php else: ?>
                        <div class="d-flex gap-2">
                            <button class="btn btn-success px-4 rounded-pill" onclick="exportToExcel()">
                                <i class="bi bi-file-earmark-excel"></i> Export
                            </button>
                            <button class="btn btn-primary px-4 rounded-pill" onclick="fetchData()">
                                <i class="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <?php if (!$appId): ?>
        <div class="card-surface section-card mt-3 mb-4" id="filterCard">
            <div class="row g-3 align-items-end" id="filterContent">
                <div class="col-md-3 filter-date">
                    <label class="info-label mb-1">Start Date</label>
                    <input type="date" id="startDate" class="form-control" onchange="fetchData()">
                </div>
                <div class="col-md-3 filter-date">
                    <label class="info-label mb-1">End Date</label>
                    <input type="date" id="endDate" class="form-control" onchange="fetchData()">
                </div>
                <div class="col-md-3 filter-outcome">
                    <label class="info-label mb-1">Lead Outcome</label>
                    <select id="leadOutcome" class="form-select" onchange="fetchData()">
                        <option value="">All Outcomes</option>
                        <option value="Interested">Interested</option>
                        <option value="Later">Call Back Later</option>
                        <option value="Time Waste">Time Waste</option>
                        <option value="Submitted">Submitted</option>
                    </select>
                </div>
                <div class="col-md-3 filter-plan d-none">
                    <label class="info-label mb-1">Plan Coverage</label>
                    <select id="planFilter" class="form-select" onchange="fetchData()">
                        <option value="all">All Plans</option>
                        <option value="Advance">Advance</option>
                        <option value="Premium">Premium</option>
                        <option value="Basic">Basic</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="info-label mb-1">Search</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0" style="border-radius:12px 0 0 12px;">
                            <i class="bi bi-search muted"></i>
                        </span>
                        <input type="text" id="tableSearch" class="form-control border-start-0" style="border-radius:0 12px 12px 0;" placeholder="Search by name, phone, agent, status..." oninput="applySearch()">
                        <button class="btn btn-outline-danger ms-2 rounded-pill px-3" onclick="clearFilters()">
                            <i class="bi bi-x-circle"></i> Clear
                        </button>
                    </div>
                    <div class="small muted mt-2">
                        Tip: search filters the currently loaded list.
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <div id="loadingIndicator" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading data...</p>
        </div>

        <div id="errorContainer" class="alert alert-danger d-none"></div>

        <!-- Details View -->
        <div id="detailsContainer" class="row d-none">
            <div class="col-md-7">
                <div class="card-surface details-card mt-3">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <div>
                            <div class="fw-bold">Client & Application</div>
                            <div class="small muted">Primary details for this submission.</div>
                        </div>
                        <div id="detailsKpi" class="d-flex gap-2 flex-wrap"></div>
                    </div>
                    <hr class="my-3">

                    <h6 class="mb-3 fw-bold">Client Information</h6>
                    <div class="row" id="clientInfo"></div>
                    
                    <h6 class="mt-3 mb-3 fw-bold">Application Data</h6>
                    <div class="row" id="appData"></div>
                </div>
            </div>
            <div class="col-md-5">
                <div class="card-surface details-card mt-3">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div>
                            <div class="fw-bold">Activity Timeline</div>
                            <div class="small muted">Status changes and remarks.</div>
                        </div>
                    </div>
                    <div id="timelineContent" class="timeline"></div>
                </div>
            </div>
        </div>

        <!-- List View -->
        <div id="listContainer" class="d-none">
            <div class="card-surface section-card mt-3">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-light text-dark border" style="font-size: 0.9rem;">
                            Total: <span id="appCount" class="fw-bold">0</span>
                        </span>
                        <span id="activeCategoryLabel" class="small muted"></span>
                    </div>
                    <div class="small muted" id="lastUpdated"></div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead id="tableHead">
                            <!-- Populated by JS -->
                        </thead>
                        <tbody id="tableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const appId = <?php echo json_encode($appId); ?>;
        
        // Use the newly created standalone API endpoint
        const API_URL = '/avisaupdated/api/agent/application_details.php';

        function fetchData() {
            if (appId) {
                fetchDetails();
                return;
            }

            const category = document.getElementById('dataCategory').value;
            document.getElementById('loadingIndicator').classList.remove('d-none');
            document.getElementById('errorContainer').classList.add('d-none');
            document.getElementById('listContainer').classList.add('d-none');

            let urlStr = '';
            if (category === 'applications') {
                urlStr = '/avisaupdated/api/agent/application_details.php';
            } else if (category === 'appointments') {
                urlStr = '/avisaupdated/index.php?path=api/appointments/list';
            } else if (category === 'logins') {
                urlStr = '/avisaupdated/index.php?path=api/admin/daily-logins';
            }

            const url = new URL(urlStr, window.location.origin);
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (category === 'applications') {
                const leadOutcome = document.getElementById('leadOutcome').value;
                if (startDate) url.searchParams.append('start_date', startDate);
                if (endDate) url.searchParams.append('end_date', endDate);
                if (leadOutcome) url.searchParams.append('lead_outcome', leadOutcome);
            } else if (category === 'appointments') {
                const plan = document.getElementById('planFilter').value;
                if (startDate) url.searchParams.append('start_date', startDate);
                if (endDate) url.searchParams.append('end_date', endDate);
                if (plan) url.searchParams.append('plan', plan);
            } else if (category === 'logins') {
                if (startDate) url.searchParams.append('start_date', startDate);
                if (endDate) url.searchParams.append('end_date', endDate);
            }

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('loadingIndicator').classList.add('d-none');
                    if (data.success) {
                        window.allData = data.applications || data.data || [];
                        window.allApps = window.allData; // backward compat for export
                        document.getElementById('listContainer').classList.remove('d-none');
                        renderList(window.allData, category);
                        document.getElementById('lastUpdated').innerText = `Updated ${new Date().toLocaleString()}`;
                        applySearch();
                    } else {
                        document.getElementById('errorContainer').classList.remove('d-none');
                        document.getElementById('errorContainer').innerText = data.error || 'Failed to load data.';
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    document.getElementById('loadingIndicator').classList.add('d-none');
                    document.getElementById('errorContainer').classList.remove('d-none');
                    document.getElementById('errorContainer').innerText = 'Network error while fetching data.';
                });
        }

        function fetchDetails() {
            document.getElementById('loadingIndicator').classList.remove('d-none');
            document.getElementById('errorContainer').classList.add('d-none');
            document.getElementById('detailsContainer').classList.add('d-none');

            const url = new URL('/avisaupdated/api/agent/application_details.php', window.location.origin);
            url.searchParams.append('id', appId);

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('loadingIndicator').classList.add('d-none');
                    if (data.success) {
                        document.getElementById('detailsContainer').classList.remove('d-none');
                        renderDetails(data.application, data.logs);
                    } else {
                        document.getElementById('errorContainer').classList.remove('d-none');
                        document.getElementById('errorContainer').innerText = data.error || 'Failed to load details.';
                    }
                });
        }

        function handleCategoryChange() {
            const category = document.getElementById('dataCategory').value;
            const filterCard = document.getElementById('filterCard');
            
            // Toggle filter visibility
            document.querySelectorAll('.filter-date').forEach(el => el.classList.remove('d-none'));
            document.querySelectorAll('.filter-outcome').forEach(el => el.classList.toggle('d-none', category !== 'applications'));
            document.querySelectorAll('.filter-plan').forEach(el => el.classList.toggle('d-none', category !== 'appointments'));
            
            filterCard.classList.remove('d-none'); // Always show filter card now, since dates apply to all

            fetchData();
        }

        function clearFilters() {
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            if (document.getElementById('leadOutcome')) document.getElementById('leadOutcome').value = '';
            if (document.getElementById('planFilter')) document.getElementById('planFilter').value = 'all';
            fetchData();
        }

        function exportToExcel() {
            const exportData = window.allData || window.allApps || [];
            if (!exportData || exportData.length === 0) {
                alert("No data to export");
                return;
            }
            
            const category = document.getElementById('dataCategory') ? document.getElementById('dataCategory').value : 'applications';

            let csvContent = "";
            let filename = 'export';
            
            if (category === 'applications') {
                let dynamicKeys = new Set();
                exportData.forEach(app => {
                    let details = {};
                    if (typeof app.details === 'string') { try { details = JSON.parse(app.details); } catch(e) {} } 
                    else { details = app.details || {}; }
                    Object.keys(details).forEach(k => {
                        if (!['client_name', 'contact_number'].includes(k)) dynamicKeys.add(k);
                    });
                });
                
                const dynamicKeysArray = Array.from(dynamicKeys);
                let headers = ["ID", "Client Name", "Contact Number", "Agent", "Status", "Submitted On", ...dynamicKeysArray.map(k => k.replace(/_/g, ' '))];
                csvContent = "data:text/csv;charset=utf-8," + headers.map(h => `"${h}"`).join(",") + "\n";
                
                exportData.forEach(app => {
                    let details = {};
                    if (typeof app.details === 'string') { try { details = JSON.parse(app.details); } catch(e) {} } 
                    else { details = app.details || {}; }
                    
                    let row = [
                        app.id,
                        app.client_name || '',
                        app.contact_number || '',
                        app.agent_name || 'Unknown',
                        app.status || 'pending',
                        app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Invalid Date'
                    ];
                    
                    dynamicKeysArray.forEach(k => {
                        let val = details[k] || '';
                        if (typeof val === 'object') {
                            val = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
                        }
                        row.push(val);
                    });
                    
                    csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
                });
                filename = 'applications_export';
            } else if (category === 'appointments') {
                let headers = ["ID", "Name", "Contact", "Plan", "Date", "Time Slot", "Status", "Message"];
                csvContent = "data:text/csv;charset=utf-8," + headers.map(h => `"${h}"`).join(",") + "\n";
                
                exportData.forEach(item => {
                    let row = [
                        item.id,
                        item.name || '',
                        item.contact || '',
                        item.selected_plan || '',
                        item.date || '',
                        item.time_slot || '',
                        item.meeting_confirm || 'Pending',
                        item.message || ''
                    ];
                    csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
                });
                filename = 'appointments_export';
            } else if (category === 'logins') {
                let headers = ["User Name", "Login From", "Email", "Mobile", "Date Time"];
                csvContent = "data:text/csv;charset=utf-8," + headers.map(h => `"${h}"`).join(",") + "\n";
                
                exportData.forEach(item => {
                    let row = [
                        item.user_name || '',
                        item.login_from || 'Direct',
                        item.user_email || '',
                        item.user_mobile || '',
                        item.created_at || ''
                    ];
                    csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
                });
                filename = 'logins_export';
            }
            
            const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
            const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
            if (startDate) filename += `_from_${startDate}`;
            if (endDate) filename += `_to_${endDate}`;
            if (!startDate && !endDate) filename += `_${new Date().toISOString().slice(0,10)}`;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        function applySearch() {
            if (appId) return;
            const searchEl = document.getElementById('tableSearch');
            const q = (searchEl ? searchEl.value : '').trim().toLowerCase();
            const category = document.getElementById('dataCategory')?.value || 'applications';

            const data = window.allData || [];
            if (!q) {
                renderList(data, category);
                return;
            }

            const filtered = data.filter(row => {
                const haystack = JSON.stringify(row || {}).toLowerCase();
                return haystack.includes(q);
            });

            renderList(filtered, category);
        }

        function renderList(data, category = 'applications') {
            const countEl = document.getElementById('appCount');
            if (countEl) countEl.innerText = (data || []).length;

            const catLabel = document.getElementById('activeCategoryLabel');
            if (catLabel) {
                const map = {
                    applications: 'Application Leads',
                    appointments: 'Appointments',
                    logins: 'Daily Logins'
                };
                catLabel.innerText = map[category] ? `Showing ${map[category]}` : '';
            }
            
            const thead = document.getElementById('tableHead');
            const tbody = document.getElementById('tableBody');
            
            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted">
                    <div class="d-flex flex-column align-items-center gap-2">
                        <i class="bi bi-inbox fs-2"></i>
                        <div class="fw-semibold">No ${category} found</div>
                        <div class="small">Try adjusting your filters or search.</div>
                    </div>
                </td></tr>`;
                return;
            }

            if (category === 'applications') {
                thead.innerHTML = `
                    <tr>
                        <th>ID</th>
                        <th>Client Name</th>
                        <th>Contact Number</th>
                        <th>Agent</th>
                        <th>Outcome</th>
                        <th>Status</th>
                        <th>Submitted On</th>
                        <th>Action</th>
                    </tr>`;
                
                tbody.innerHTML = data.map(app => {
                    const statusColor = app.status === 'approved' ? 'bg-success' : 
                                      (app.status === 'rejected' ? 'bg-danger' : 
                                      (app.status === 'follow_up' ? 'bg-info' : 'bg-warning text-dark'));
                    
                    let details = {};
                    try { details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {}); } catch(e) {}
                    const leadOutcome = details.lead_outcome || 'N/A';
                    
                    let outcomeColor = 'bg-secondary';
                    if (leadOutcome.toLowerCase().includes('interested')) outcomeColor = 'bg-success';
                    else if (leadOutcome.toLowerCase().includes('later')) outcomeColor = 'bg-warning text-dark';
                    else if (leadOutcome.toLowerCase().includes('waste')) outcomeColor = 'bg-danger';

                    return `<tr class="row-link" onclick="window.location.href='?id=${app.id}'">
                        <td class="fw-bold text-muted">#${app.id}</td>
                        <td class="fw-bold">${app.client_name || 'N/A'}</td>
                        <td>${app.contact_number || 'N/A'}</td>
                        <td>${app.agent_name || 'Unknown'}</td>
                        <td><span class="badge ${outcomeColor}">${leadOutcome}</span></td>
                        <td><span class="badge ${statusColor} badge-status">${(app.status || 'Pending').toUpperCase()}</span></td>
                        <td><small class="text-muted">${new Date(app.created_at).toLocaleDateString()}</small></td>
                        <td><a href="?id=${app.id}" class="btn btn-sm btn-outline-primary shadow-sm" onclick="event.stopPropagation()">View</a></td>
                    </tr>`;
                }).join('');
            } else if (category === 'appointments') {
                thead.innerHTML = `
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Plan</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                    </tr>`;
                
                tbody.innerHTML = data.map(item => {
                    const planColor = item.selected_plan === 'Basic' ? 'bg-light text-dark border' : 'bg-primary';
                    const statusColor = item.meeting_confirm === 'Confirmed' ? 'bg-success' : 'bg-warning text-dark';

                    return `<tr>
                        <td class="fw-bold text-muted">#${item.id}</td>
                        <td class="fw-bold">${item.name || 'N/A'}</td>
                        <td>${item.contact || 'N/A'}</td>
                        <td><span class="badge ${planColor}">${item.selected_plan || 'N/A'}</span></td>
                        <td>${item.date || 'N/A'}</td>
                        <td>${item.time_slot || 'N/A'}</td>
                        <td><span class="badge ${statusColor}">${(item.meeting_confirm || 'Pending').toUpperCase()}</span></td>
                    </tr>`;
                }).join('');
            } else if (category === 'logins') {
                thead.innerHTML = `
                    <tr>
                        <th>User Name</th>
                        <th>Login From</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Date Time</th>
                    </tr>`;
                
                tbody.innerHTML = data.map(row => `
                    <tr>
                        <td class="fw-bold text-dark">${row.user_name || 'N/A'}</td>
                        <td><span class="badge bg-info text-dark">${row.login_from || 'Direct'}</span></td>
                        <td>${row.user_email || 'N/A'}</td>
                        <td>${row.user_mobile || 'N/A'}</td>
                        <td><small class="text-muted">${row.created_at || 'N/A'}</small></td>
                    </tr>
                `).join('');
            }
        }

        function renderDetails(app, logs) {
            let details = {};
            if (typeof app.details === 'string') { 
                try { details = JSON.parse(app.details); } catch(e) {} 
            } else { 
                details = app.details || {}; 
            }

            // Client Info
            const statusColor = app.status === 'approved' ? 'bg-success' : 
                               (app.status === 'rejected' ? 'bg-danger' : 
                               (app.status === 'follow_up' ? 'bg-info' : 'bg-warning text-dark'));

            // KPI chips
            const kpiHost = document.getElementById('detailsKpi');
            if (kpiHost) {
                const leadOutcome = (details.lead_outcome || '').toString().trim();
                const outcomeBadge = leadOutcome ? `<span class="badge bg-light text-dark border">Outcome: <span class="fw-bold">${leadOutcome}</span></span>` : '';
                kpiHost.innerHTML = `
                    <span class="badge ${statusColor} badge-status">Status: ${(app.status || 'Pending').toUpperCase()}</span>
                    ${outcomeBadge}
                    <span class="badge bg-light text-dark border">Submitted: <span class="fw-bold">${new Date(app.created_at).toLocaleDateString()}</span></span>
                `;
            }

            let clientHtml = `
                <div class="col-6"><div class="info-label">Name</div><div class="info-value">${app.client_name || 'N/A'}</div></div>
                <div class="col-6"><div class="info-label">Contact</div><div class="info-value">${app.contact_number || 'N/A'}</div></div>
                <div class="col-6"><div class="info-label">Agent</div><div class="info-value">${app.agent_name || 'Unknown'}</div></div>
                <div class="col-6"><div class="info-label">Status</div><div class="info-value"><span class="badge ${statusColor} badge-status">${(app.status || 'Pending').toUpperCase()}</span></div></div>
                <div class="col-6"><div class="info-label">Submitted On</div><div class="info-value">${new Date(app.created_at).toLocaleString()}</div></div>
            `;
            document.getElementById('clientInfo').innerHTML = clientHtml;

            // App Data
            let appDataHtml = '';
            for (const [key, value] of Object.entries(details)) {
                if (['client_name', 'contact_number'].includes(key)) continue;
                if (!value || value === 'not-provided') continue;
                
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                let displayValue = value;
                
                if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                    } else {
                        displayValue = JSON.stringify(value);
                    }
                }
                
                appDataHtml += `<div class="col-sm-6"><div class="info-label">${label}</div><div class="info-value">${displayValue}</div></div>`;
            }
            if (!appDataHtml) appDataHtml = '<div class="col-12 text-muted">No additional details provided.</div>';
            document.getElementById('appData').innerHTML = appDataHtml;

            // Timeline
            let timelineHtml = '';
            if (logs && logs.length > 0) {
                timelineHtml = logs.map(log => {
                    let logDetails = {};
                    if (typeof log.details === 'string') { try { logDetails = JSON.parse(log.details); } catch(e){} }
                    else { logDetails = log.details || {}; }
                    
                    const date = new Date(log.created_at).toLocaleString();
                    const userName = log.user_name || 'System';
                    let actionText = '';
                    let extraInfo = '';
                    let tone = '';
                    
                    switch(log.action_type) {
                        case 'created': actionText = 'Application Created'; break;
                        case 'updated': actionText = 'Application Updated'; break;
                        case 'status_change':
                            actionText = `Status changed to <strong>${logDetails.to || 'Unknown'}</strong>`;
                            if ((logDetails.to || '').toString().toLowerCase().includes('approve')) tone = 'is-success';
                            else if ((logDetails.to || '').toString().toLowerCase().includes('reject')) tone = 'is-danger';
                            else tone = 'is-warning';
                            break;
                        case 'admin_remark': actionText = 'Added a Remark'; tone = 'is-warning'; break;
                        default: actionText = log.action_type;
                    }
                    
                    if (logDetails.remarks) extraInfo = `<div class="mt-1 p-2 bg-light rounded small border">${logDetails.remarks}</div>`;
                    
                    return `<div class="timeline-item ${tone}">
                        <div class="fw-bold text-dark">${actionText}</div>
                        <div class="small text-muted mb-1"><i class="bi bi-person"></i> ${userName} • ${date}</div>
                        ${extraInfo}
                    </div>`;
                }).join('');
            } else {
                timelineHtml = '<div class="text-muted">No activity recorded yet.</div>';
            }
            document.getElementById('timelineContent').innerHTML = timelineHtml;
        }

        document.addEventListener('DOMContentLoaded', fetchData);
    </script>
</body>
</html>
