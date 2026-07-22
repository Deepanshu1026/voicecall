<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employee') {
    header("Location: ../login.php");
    exit;
}
$active = 'dashboard';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Employee Dashboard</title>
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

       <style>
         :root {
            --primary-bg: #f8fafc;
            --card-bg: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --accent: #6366f1;
        }
        body { background-color: var(--primary-bg); }
        .page-header { margin-bottom: 2rem; }
        .welcome-text { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .sub-text { color: var(--text-secondary); }
        
        /* Stats Cards */
        .stats-overview { margin-bottom: 2rem; }
        .stat-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background: #e0e7ff;
            color: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .stat-info p { margin: 0; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; }

        /* Search Bar */
        .search-wrapper { position: relative; margin-bottom: 2rem; max-width: 400px; }
        .search-input {
            width: 100%;
            padding: 12px 20px 12px 45px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: var(--card-bg);
            font-size: 0.95rem;
            transition: all 0.2s;
        }
        .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); outline: none; }
        .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }

        /* Case Cards */
        .case-card {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
            cursor: pointer;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .case-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: var(--accent);
        }
        .card-header-custom {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
        }
        .case-type { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
        .card-body-custom { padding: 1.25rem; flex: 1; }
        .client-name { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .info-row { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem; }
        .info-row i { color: #94a3b8; width: 16px; }
        .card-footer-custom {
            padding: 1rem 1.25rem;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn-view {
            padding: 6px 12px;
            border-radius: 6px;
            background: #eef2ff;
            color: var(--accent);
            font-size: 0.85rem;
            font-weight: 500;
            border: none;
            transition: background 0.2s;
        }
        .case-card:hover .btn-view { background: var(--accent); color: white; }
        
        .badge-status { 
            font-size: 0.75rem; 
            padding: 4px 10px; 
            border-radius: 20px; 
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-badge-pending { background-color: #f1f5f9; color: #475569; }
        .status-badge-assigned { background-color: #e0e7ff; color: #4338ca; }
        .status-badge-in-progress { background-color: #fef3c7; color: #b45309; }
        .status-badge-completed { background-color: #dcfce7; color: #166534; }
        /* Skeleton Loading */
        .skeleton { background: #e2e8f0; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
        .skeleton-text { height: 16px; margin-bottom: 8px; }
        .skeleton-title { height: 24px; margin-bottom: 12px; }
        .skeleton-badge { height: 20px; width: 60px; border-radius: 12px; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        /* Filter & Search Group */
        .actions-toolbar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .search-wrapper { flex: 1; max-width: 400px; position: relative; }
        .filter-wrapper { min-width: 180px; }
        .form-select-custom {
            width: 100%;
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background-color: var(--card-bg);
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 16px 12px;
            appearance: none;
            font-size: 0.95rem;
            transition: all 0.2s;
            cursor: pointer;
        }
        .form-select-custom:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
       </style>
</head>

<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
<?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header d-flex justify-content-between align-items-end">
        <div>
            <h1 class="welcome-text">My Caseload</h1>
            <p class="sub-text">Manage your assigned immigration cases</p>
        </div>
        <div class="d-none d-md-block text-end">
             <div id="dateDisplay" class="text-muted small fw-bold"></div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="row stats-overview">
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card">
                <div class="stat-icon"><i class="bi bi-briefcase"></i></div>
                <div class="stat-info">
                    <h3 id="stat-total">0</h3>
                    <p>Total Cases</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
             <div class="stat-card">
                <div class="stat-icon" style="background:#fef3c7; color:#b45309;"><i class="bi bi-hourglass-split"></i></div>
                <div class="stat-info">
                    <h3 id="stat-active">0</h3>
                    <p>In Progress</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
             <div class="stat-card">
                <div class="stat-icon" style="background:#dcfce7; color:#166534;"><i class="bi bi-check-circle"></i></div>
                <div class="stat-info">
                    <h3 id="stat-completed">0</h3>
                    <p>Completed</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions & Filter -->
    <div class="actions-toolbar">
        <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input type="text" id="searchInput" class="search-input" placeholder="Search client, phone, or ID..." oninput="filterCases()">
        </div>
        <div class="filter-wrapper">
            <select id="statusFilter" class="form-select-custom" onchange="filterCases()">
                <option value="all">All Statuses</option>
                <option value="active">Active (In Progress)</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
            </select>
        </div>
    </div>

    <div id="alertBox"></div>

    <div class="row g-4" id="casesContainer">
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading assigned cases...</p>
        </div>
    </div>

</div>

<script>
const API = "/avisaupdated/index.php?path=";

// Set today's date
document.getElementById('dateDisplay').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

let allCases = [];

function statusBadge(s) {
    const map = {
        "pending": "pending",
        "assigned": "assigned",
        "in-progress": "in-progress",
        "waiting-doc-approval": "in-progress",
        "awaiting-completion-approval": "in-progress",
        "completed": "completed",
    };
    const key = map[s] || "pending";
    const label = s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<span class="badge-status status-badge-${key}">${label}</span>`;
}

function showAlert(msg,type='info'){
    document.getElementById('alertBox').innerHTML=`<div class="alert alert-${type} shadow-sm border-0">${msg}</div>`;
    setTimeout(()=>document.getElementById('alertBox').innerHTML='',3000);
}

async function loadCases(){
    const container = document.getElementById("casesContainer");
    
    // Skeleton Loader
    container.innerHTML = Array(3).fill(0).map(() => `
        <div class="col-lg-4 col-md-6">
            <div class="case-card" style="pointer-events: none;">
                <div class="card-header-custom">
                    <div class="skeleton skeleton-text" style="width: 30%;"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
                <div class="card-body-custom">
                    <div class="skeleton skeleton-title" style="width: 70%;"></div>
                    <div class="skeleton skeleton-text" style="width: 50%;"></div>
                    <div class="skeleton skeleton-text" style="width: 40%;"></div>
                    <div class="mt-3 skeleton" style="height: 4px; width: 100%;"></div>
                </div>
                <div class="card-footer-custom">
                    <div class="skeleton skeleton-text" style="width: 20%; margin:0;"></div>
                    <div class="skeleton skeleton-badge" style="width: 80px; height: 28px;"></div>
                </div>
            </div>
        </div>
    `).join('');

    try {
        const res = await fetch(API+"api/employee/my-cases");
        const j = await res.json();

        if (j.error){
            container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${j.error}</div></div>`;
            return;
        }

        allCases = j.cases || [];
        updateStats();
        renderCases(allCases);

    } catch (err){
        console.error(err);
        container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Failed to load cases. Please try refreshing.</div></div>`;
    }
}

function updateStats() {
    document.getElementById('stat-total').innerText = allCases.length;
    const active = allCases.filter(c => ['in-progress', 'waiting-doc-approval', 'awaiting-completion-approval'].includes(c.status)).length;
    document.getElementById('stat-active').innerText = active;
    const completed = allCases.filter(c => c.status === 'completed').length;
    document.getElementById('stat-completed').innerText = completed;
}

function filterCases() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const status = document.getElementById('statusFilter').value;

    const filtered = allCases.filter(c => {
        // Text Search
        const matchesTerm = c.client_name.toLowerCase().includes(term) || 
                          (c.client_phone && c.client_phone.includes(term)) ||
                          c.id.toString().includes(term);
        
        // Status Filter
        let matchesStatus = true;
        if (status === 'active') {
            matchesStatus = ['in-progress', 'waiting-doc-approval', 'awaiting-completion-approval'].includes(c.status);
        } else if (status !== 'all') {
            matchesStatus = c.status === status;
        }

        return matchesTerm && matchesStatus;
    });

    renderCases(filtered, term || status !== 'all');
}

function renderCases(list, isFiltered = false) {
    const container = document.getElementById("casesContainer");
    
    if (!list.length){
        const emptyMsg = isFiltered 
            ? "No cases match your search or filter."
            : "You haven't been assigned any cases yet.";
            
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="mb-3">
                    <i class="bi bi-folder-x display-4 text-muted"></i>
                </div>
                <h5 class="text-muted fw-bold">No cases found</h5>
                <p class="text-secondary mb-0">${emptyMsg}</p>
                ${isFiltered ? '<button class="btn btn-link mt-2" onclick="resetFilters()">Clear filters</button>' : ''}
            </div>`;
        return;
    }

    container.innerHTML = "";

    list.forEach(c => {
        // Determine lock status
        // "Unlock view case only for in progress case"
        const allowedStatuses = ['in-progress', 'waiting-doc-approval', 'awaiting-completion-approval'];
        const isLocked = !allowedStatuses.includes(c.status);

        const div = document.createElement('div');
        div.className = "col-lg-4 col-md-6";
        
        const clickAttr = isLocked ? '' : `onclick="openCase(${c.id})"`;
        const lockStyle = isLocked ? 'opacity: 0.7; cursor: not-allowed;' : '';
        const btnContent = isLocked 
            ? '<i class="bi bi-lock-fill"></i> Locked' 
            : 'View Case';
        const btnClass = isLocked ? 'btn-view text-secondary bg-light' : 'btn-view';

        div.innerHTML = `
            <div class="case-card" ${clickAttr} style="${lockStyle}">
                <div class="card-header-custom">
                    <span class="case-type">${c.case_type}</span>
                    ${statusBadge(c.status)}
                </div>
                <div class="card-body-custom">
                    <h5 class="client-name">${c.client_name}</h5>
                    <div class="info-row"><i class="bi bi-telephone"></i> ${c.client_phone}</div>
                    <div class="info-row"><i class="bi bi-person-badge"></i> Manager: ${c.manager_name || 'N/A'}</div>
                
                </div>
                <div class="card-footer-custom">
                    <span class="text-secondary small" style="font-size:0.8rem">ID: #${c.id}</span>
                    <button class="${btnClass}" ${isLocked ? 'disabled' : ''}>${btnContent}</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    filterCases();
}

function openCase(id){
    window.location.href = "my-case.php?id=" + id;
}

// Initialize
loadCases();
</script>

</body>
</html>
