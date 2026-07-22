<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}

$active = 'cases';
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>All Cases - Admin</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            --hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        body {
            background: #f5f7fa;
        }

        .content {
            padding: 20px;
        }

        /* Page Header */
        .page-header {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: var(--card-shadow);
        }

        .page-header h3 {
            margin: 0;
            color: #2d3748;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .page-header h3 i {
            font-size: 1.5rem;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Filter Section */
        .filter-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: var(--card-shadow);
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-section input,
        .filter-section select {
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
        }

        .filter-section input:focus,
        .filter-section select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Table Improvements */
        .table-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: var(--card-shadow);
        }

        .table {
            margin-bottom: 0;
        }

        .table thead {
            background: var(--primary-gradient);
            color: white;
        }

        .table thead th {
            border: none;
            padding: 14px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }

        .table thead th:first-child {
            border-top-left-radius: 8px;
        }

        .table thead th:last-child {
            border-top-right-radius: 8px;
        }

        .table tbody tr {
            transition: all 0.2s;
            border-bottom: 1px solid #f1f3f5;
        }

        .table tbody tr:hover {
            background: #f8f9fa;
            transform: translateX(2px);
        }

        .table tbody td {
            padding: 14px;
            vertical-align: middle;
            font-size: 0.9rem;
        }

        /* HIGHLIGHT ACTIVE ROW */
        .table tbody tr.active-case-row {
            background-color: #e0e7ff !important; /* Light indigo */
        }
        
        .table tbody tr.active-case-row td:first-child {
            border-left: 5px solid #667eea !important;
        }

        /* Badge Improvements */
        .badge {
            font-size: 0.75rem;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 500;
            text-transform: capitalize;
        }

        .badge.bg-secondary {
            background: linear-gradient(135deg, #a0aec0 0%, #718096 100%) !important;
        }

        .badge.bg-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }

        .badge.bg-warning {
            background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%) !important;
        }

        .badge.bg-info {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%) !important;
        }

        .badge.bg-dark {
            background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%) !important;
        }

        .badge.bg-success {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
        }

        .badge.bg-cancelled {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
            color: white;
        }

        /* Drawer Improvements */
        #caseDrawer {
            position: fixed;
            top: 0;
            right: -650px;
            width: 600px;
            height: 100%;
            background: #ffffff;
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            z-index: 1050;
        }

        #caseDrawer.open {
            right: 0;
        }

        .drawer-header {
            padding: 24px;
            background: var(--primary-gradient);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .drawer-header h4 {
            margin: 0;
            font-weight: 600;
            font-size: 1.3rem;
        }

        #drawerClose {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        #drawerClose:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        .drawer-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .drawer-info-section {
            background: #f7fafc;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .drawer-info-section p {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .drawer-info-section p:last-child {
            margin-bottom: 0;
        }

        .drawer-info-section strong {
            color: #4a5568;
            min-width: 100px;
            font-weight: 600;
        }

        .drawer-section-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
            margin-top: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.1rem;
        }

        .drawer-section-title i {
            color: #667eea;
        }

        /* Document Items */
        .doc-row {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s;
        }

        .doc-row:hover {
            border-color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        /* Timeline Improvements */
        .timeline-container {
            position: relative;
            padding-left: 40px;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease-out forwards;
            opacity: 0;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -28px;
            top: 0;
            bottom: -20px;
            width: 2px;
            background: #e2e8f0;
        }

        .timeline-item:last-child::before {
            display: none;
        }

        .timeline-icon {
            position: absolute;
            left: -36px;
            top: 4px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--primary-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.7rem;
            z-index: 1;
        }

        .timeline-content {
            background: #f8f9fa;
            padding: 12px 15px;
            border-radius: 8px;
            border-left: 3px solid #667eea;
            transition: all 0.2s ease;
        }

        .timeline-content:hover {
            background: #e9ecef;
            transform: translateX(3px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .timeline-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .timeline-user {
            font-size: 0.85rem;
            color: #718096;
            font-weight: 500;
        }

        .timeline-date {
            font-size: 0.75rem;
            color: #a0aec0;
            margin-top: 4px;
        }

        /* Action Buttons */
        .drawer-actions {
            padding: 20px 24px;
            background: #f7fafc;
            border-top: 1px solid #e2e8f0;
        }

        .drawer-actions .btn {
            border-radius: 8px;
            font-weight: 500;
            padding: 10px 16px;
            transition: all 0.2s;
        }

        .drawer-actions .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Upload Form */
        #uploadDocForm {
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            margin-top: 12px;
        }

        /* Empty States */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #a0aec0;
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        /* Alert Improvements */
        .alert {
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Loading Spinner */
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
        }

        /* Responsive */
        @media (max-width: 768px) {
            #caseDrawer {
                width: 100%;
                right: -100%;
            }

            .filter-section {
                flex-direction: column;
            }

            .filter-section input,
            .filter-section select {
                width: 100%;
            }
        }
    </style>
</head>

<body>

    <?php include __DIR__ . '/../layout/sidebar.php'; ?>

    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>

        <div class="page-header">
            <h3><i class="bi bi-folder"></i> All Cases</h3>
        </div>

        <div class="filter-section">
            <input id="searchBox" class="form-control form-control-sm" placeholder="🔍 Search client / phone / type"
                style="width:320px;">
            <select id="statusFilter" class="form-select form-select-sm" style="width:200px;">
                <option value="">All statuses</option>
                <option value="pending">pending</option>
                <option value="assigned">assigned</option>
                <option value="in-progress">in-progress</option>
                <option value="on-hold">on-hold</option>
                <option value="waiting-doc-approval">waiting-doc-approval</option>
                <option value="awaiting-completion-approval">awaiting-completion-approval</option>
                <option value="reopen-requested">reopen-requested</option>
                <option value="completed">completed</option>
            </select>
            <select id="managerFilter" class="form-select form-select-sm" style="width:200px;">
                <option value="">All managers</option>
            </select>
        </div>

        <div id="casesAlert"></div>

        <div class="table-container">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Agent</th>
                        <th>Manager</th>
                        <th>Employee</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="casesBody"></tbody>
            </table>
        </div>
    </div>

    <!-- Sliding Drawer -->
    <div id="caseDrawer">
        <div class="drawer-header">
            <h4 id="drawerTitle">Case Details</h4>
            <span id="drawerClose">&times;</span>
        </div>

        <div class="drawer-content" id="drawerMain">
            <div class="drawer-info-section">
                <p><strong><i class="bi bi-person"></i> Client:</strong> <span id="drawerClient"></span></p>
                <p><strong><i class="bi bi-telephone"></i> Phone:</strong> <span id="drawerPhone"></span></p>
                <p><strong><i class="bi bi-tag"></i> Case Type:</strong> <span id="drawerCaseType"></span></p>
                <p><strong><i class="bi bi-flag"></i> Priority:</strong> <span id="drawerPriority"></span></p>
                <p><strong><i class="bi bi-circle-fill"></i> Status:</strong> <span id="drawerStatus"></span></p>
            </div>

            <h6 class="drawer-section-title"><i class="bi bi-people"></i> Assignments</h6>
            <div class="drawer-info-section">
                <p><strong>Manager:</strong> <span id="drawerManager"></span></p>
                <p><strong>Employee:</strong> <span id="drawerEmployee"></span></p>
            </div>

            <div class="d-flex gap-2 mb-3">
                <button id="btnAssignManager" class="btn btn-primary btn-sm"><i class="bi bi-person-plus"></i> Assign
                    Manager</button>
                <button id="btnAssignEmployee" class="btn btn-warning btn-sm"><i class="bi bi-person-badge"></i> Assign
                    Employee</button>
            </div>

            <h6 class="drawer-section-title"><i class="bi bi-paperclip"></i> Documents</h6>
            <div id="docsList" class="mb-2"></div>

            <form id="uploadDocForm">
                <label class="form-label small fw-bold">Upload New Document</label>
                <input type="file" name="file" id="fileInput" class="form-control form-control-sm mb-2" required>
                <button class="btn btn-success btn-sm w-100"><i class="bi bi-cloud-upload"></i> Upload</button>
            </form>

            <h6 class="drawer-section-title"><i class="bi bi-clock-history"></i> Activity Timeline</h6>
            <div id="caseTimeline">
                <div id="timelineList" class="timeline-container"></div>
            </div>
        </div>

        <div class="drawer-actions">
            <h6 class="fw-bold mb-3"><i class="bi bi-lightning"></i> Quick Actions</h6>
            <div id="caseActions" class="d-flex flex-wrap gap-2"></div>
        </div>
    </div>

    <!-- ASSIGN MANAGER MODAL -->
    <div class="modal fade" id="assignManagerModal">
        <div class="modal-dialog">
            <form id="assignManagerForm" class="modal-content">
                <div class="modal-header">
                    <h5><i class="bi bi-person-badge"></i> Assign Manager</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <select id="managerDropdown" name="manager_id" class="form-select" required></select>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary">Assign</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ASSIGN EMPLOYEE MODAL -->
    <div class="modal fade" id="assignEmployeeModal">
        <div class="modal-dialog">
            <form id="assignEmployeeForm" class="modal-content">
                <div class="modal-header">
                    <h5><i class="bi bi-person-plus"></i> Assign Employee</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <select id="employeeDropdown" name="employee_id" class="form-select" required></select>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-warning">Assign</button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        const API_BASE = "../../index.php?path=";
        let allCases = [];
        let currentCaseId = null;
        let currentCase = null;

        function showAlert(msg, type = 'info') {
            const c = document.getElementById('casesAlert');
            c.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'x-circle' : 'info-circle'}"></i>
                ${msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
            setTimeout(() => c.innerHTML = '', 4000);
        }

        function statusBadge(status) {
            const map = {
                pending: 'secondary',
                assigned: 'primary',
                'in-progress': 'warning',
                'waiting-doc-approval': 'info',
                'awaiting-completion-approval': 'dark',
                completed: 'success',
                cancelled: 'cancelled'
            };
            return `<span class="badge bg-${map[status]||'secondary'}">${status}</span>`;
        }

        async function loadCases() {
            const r = await fetch(API_BASE + "api/cases/list");
            const j = await r.json();
            
            // Debugging: Log the API response to check 'agent_name' and 'remarks'
            console.log("API Response (Cases):", j);
            if (j.cases) {
                j.cases.forEach(c => {
                    console.log(`Case #${c.id} | Agent: ${c.agent_name} | Remarks: ${c.remarks}`);
                });
            }

            allCases = j.cases || [];

            populateManagerFilter();
            renderCases(allCases);
            
            // Update signature
            lastCasesSig = getCasesSig(allCases);
        }

/* --------- Polling --------- */
let lastCasesSig = "";

function getCasesSig(list) {
    if (!list || !list.length) return "empty";
    // Signature: ID + Status + Manager + Employee
    return list.map(c => `${c.id}:${c.status}:${c.assigned_manager}:${c.assigned_employee}`).join("|");
}

async function checkCaseUpdates() {
    try {
        const r = await fetch(API_BASE + "api/cases/list");
        const j = await r.json();
        const list = j.cases || [];
        
        const newSig = getCasesSig(list);
        if (lastCasesSig && newSig !== lastCasesSig) {
            console.log("Cases changed, reloading...");
            lastCasesSig = newSig;
            
            // Show toast
            showAlert("New updates found. List refreshed.", "info");
            
            await loadCases();
        } else if (!lastCasesSig) {
            lastCasesSig = newSig;
        }
    } catch (e) {
        console.error("Polling error", e);
    }
}

setInterval(checkCaseUpdates, 5000);

        function populateManagerFilter() {
            const mfilter = document.getElementById("managerFilter");
            mfilter.innerHTML = `<option value="">All managers</option>`;

            const names = new Set();
            allCases.forEach(c => {
                if (c.manager_name) names.add(c.manager_name);
            });

            [...names].sort().forEach(n => {
                mfilter.innerHTML += `<option value="${n}">${n}</option>`;
            });
        }

        function renderCases(list) {
            const tb = document.getElementById("casesBody");
            tb.innerHTML = "";

            if (!list.length) {
                tb.innerHTML = `<tr><td colspan="9" class="text-center">
                    <div class="empty-state py-5">
                        <i class="bi bi-inbox"></i>
                        <p>No cases found</p>
                    </div>
                </td></tr>`;
                return;
            }

            list.forEach(c => {
                const tr = document.createElement("tr");
                tr.id = 'case-row-' + c.id;
                if (currentCaseId && c.id == currentCaseId) {
                    tr.classList.add('active-case-row');
                }
                tr.innerHTML = `
            <td><strong>#${c.id}</strong></td>
            <td>${c.client_name}</td>
            <td>${c.client_phone}</td>
            <td><i class="bi bi-tag"></i> ${c.case_type}</td>
            <td>${statusBadge(c.status)}</td>
            <td>
                <div>${c.agent_name || "<span class='text-muted'>N/A</span>"}</div>
                ${c.approved_by_name ? `
                    <div class="text-muted mt-1" style="font-size:0.75em; line-height:1.2;">
                        <i class="bi bi-shield-check text-success"></i> Approved by ${c.approved_by_name}
                        ${c.approval_remark ? `<br><span class="d-inline-block text-truncate" style="max-width:140px;" title="${c.approval_remark.replace(/"/g, '&quot;')}">${c.approval_remark}</span>` : ''}
                    </div>
                ` : ''}
            </td>
            <td>${c.manager_name || "<span class='text-muted'>Not assigned</span>"}</td>
            <td>${c.employee_name || "<span class='text-muted'>Not assigned</span>"}</td>
            <td><small class="text-muted">${c.created_at}</small></td>
            <td><button class="btn btn-sm btn-outline-primary" style="font-size: 0.75rem;" onclick="event.stopPropagation(); openCaseDrawer(${c.id})"><i class="bi bi-eye"></i> View</button></td>
        `;
                tb.appendChild(tr);
            });
        }

        document.getElementById("searchBox").oninput = applyFilters;
        document.getElementById("statusFilter").onchange = applyFilters;
        document.getElementById("managerFilter").onchange = applyFilters;

        function applyFilters() {
            const q = document.getElementById("searchBox").value.toLowerCase();
            const st = document.getElementById("statusFilter").value;
            const mn = document.getElementById("managerFilter").value;

            const filtered = allCases.filter(c => {
                if (st && c.status !== st) return false;
                if (mn && c.manager_name !== mn) return false;
                if (q) {
                    if (c.client_name.toLowerCase().includes(q)) return true;
                    if (c.client_phone.toLowerCase().includes(q)) return true;
                    if (c.case_type.toLowerCase().includes(q)) return true;
                    return false;
                }
                return true;
            });

            renderCases(filtered);
        }

        function closeDrawer() {
            document.getElementById("caseDrawer").classList.remove("open");
            currentCaseId = null;
            document.querySelectorAll('.active-case-row').forEach(row => row.classList.remove('active-case-row'));
        }

        document.getElementById("drawerClose").onclick = closeDrawer;

        // Close drawer when clicking outside
        document.addEventListener('click', function(event) {
            const drawer = document.getElementById('caseDrawer');
            if (drawer.classList.contains('open') && !drawer.contains(event.target)) {
                closeDrawer();
            }
        });

        async function openCaseDrawer(id) {
            currentCaseId = id;

            // Immediate visual feedback
            document.querySelectorAll('.active-case-row').forEach(row => row.classList.remove('active-case-row'));
            const activeRow = document.getElementById('case-row-' + id);
            if (activeRow) activeRow.classList.add('active-case-row');

            // Refresh case data from server
            await loadCases();
            currentCase = allCases.find(c => c.id == id);

            if (!currentCase) return;

            document.getElementById('drawerTitle').innerText = "Case #" + id;
            document.getElementById('drawerClient').innerText = currentCase.client_name;
            document.getElementById('drawerPhone').innerText = currentCase.client_phone;
            document.getElementById('drawerCaseType').innerText = currentCase.case_type;
            document.getElementById('drawerPriority').innerText = currentCase.priority;
            document.getElementById('drawerStatus').innerHTML = statusBadge(currentCase.status);
            document.getElementById('drawerManager').innerText = currentCase.manager_name || 'Not assigned';
            document.getElementById('drawerEmployee').innerText = currentCase.employee_name || 'Not assigned';

            const lock = !!currentCase.assigned_employee;
            document.getElementById("btnAssignManager").disabled = lock;

            loadDocuments(id);
            loadTimeline(id);
            renderActionBox(currentCase);

            document.getElementById("caseDrawer").classList.add("open");
        }

        async function loadDocuments(id) {
            const box = document.getElementById("docsList");
            box.innerHTML = `<div class="text-center py-3"><div class="loading-spinner"></div></div>`;

            try {
                const r = await fetch(API_BASE + "api/cases/documents&case_id=" + id);
                const j = await r.json();

                const docs = j.documents || [];
                if (!docs.length) {
                    box.innerHTML = `<div class="empty-state"><i class="bi bi-file-earmark"></i><p>No documents uploaded</p></div>`;
                    return;
                }

                box.innerHTML = "";

                docs.forEach(d => {
                    const div = document.createElement("div");
                    div.className = "doc-row";
                    div.innerHTML = `
                <div>
                    <strong><i class="bi bi-file-earmark-text"></i> ${d.file_name}</strong><br>
                    <small class="text-muted"><i class="bi bi-clock"></i> ${d.uploaded_at} • <i class="bi bi-person"></i> ${d.uploaded_by_name || 'Unknown'}</small>
                </div>
                <div class="d-flex gap-2">
                    <a href="${d.file_url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument(${d.id})"><i class="bi bi-trash"></i></button>
                </div>
            `;
                    box.appendChild(div);
                });
            } catch (err) {
                console.error(err);
                box.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load documents</p></div>`;
            }
        }

        document.getElementById("uploadDocForm").onsubmit = async e => {
            e.preventDefault();
            const fileInput = document.getElementById("fileInput");
            const btn = e.target.querySelector("button");
            const docsBox = document.getElementById("docsList");

            if (!fileInput.files.length) {
                showAlert("Please select a file", "warning");
                return;
            }

            docsBox.innerHTML = `<div class="text-center py-3"><div class="loading-spinner"></div><p class="small mt-2">Uploading...</p></div>`;
            btn.disabled = true;

            const fd = new FormData();
            fd.append("file", fileInput.files[0]);
            fd.append("case_id", currentCaseId);

            try {
                const r = await fetch(API_BASE + "api/cases/upload-document", {
                    method: "POST",
                    body: fd
                });
                const j = await r.json();

                btn.disabled = false;

                if (j.error || !j.success) {
                    showAlert(j.error || "Upload failed", "danger");
                    await loadDocuments(currentCaseId);
                    return;
                }

                showAlert("Document uploaded successfully!", "success");
                fileInput.value = "";
                await loadDocuments(currentCaseId);

            } catch (err) {
                btn.disabled = false;
                showAlert("Upload failed", "danger");
                console.error(err);
                await loadDocuments(currentCaseId);
            }
        };

        async function deleteDocument(id) {
            if (!confirm("Delete this document?")) return;

            try {
                const r = await fetch(API_BASE + "api/cases/document-delete", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: "doc_id=" + id
                });

                const j = await r.json();

                if (j.error || !j.success) {
                    showAlert(j.error || "Delete failed", "danger");
                    return;
                }

                showAlert("Document deleted", "success");

                // Only refresh documents
                await loadDocuments(currentCaseId);

            } catch (err) {
                console.error(err);
                showAlert("Delete failed", "danger");
            }
        }

        async function loadTimeline(id) {
            const box = document.getElementById("timelineList");
            box.innerHTML = `<div class="text-center py-3"><div class="loading-spinner"></div></div>`;

            try {
                const r = await fetch(`${API_BASE}api/cases/timeline&case_id=${id}`);
                const j = await r.json();

                if (!j.success || !j.timeline || !j.timeline.length) {
                    box.innerHTML = `<div class="empty-state"><i class="bi bi-clock-history"></i><p>No activity yet</p></div>`;
                    return;
                }

                // Store timeline globally to check for reopen requests
                window.currentTimeline = j.timeline;

                box.innerHTML = "";

                const LABELS = {
                    "docs_marked_complete": {
                        text: "Documents Submitted",
                        icon: "bi-file-earmark-check"
                    },
                    "docs_approved": {
                        text: "Documents Approved",
                        icon: "bi-check-circle-fill"
                    },
                    "document_deleted": {
                        text: "Document Deleted",
                        icon: "bi-trash"
                    },
                    "document_uploaded": {
                        text: "Document Uploaded",
                        icon: "bi-cloud-upload"
                    },
                    "case_completion_requested": {
                        text: "Completion Requested",
                        icon: "bi-flag"
                    },
                    "case_completed": {
                        text: "Case Completed",
                        icon: "bi-check-all"
                    },
                    "reopen_requested": {
                        text: "Reopen Requested",
                        icon: "bi-arrow-clockwise"
                    },
                    "case_reopened": {
                        text: "Case Reopened",
                        icon: "bi-unlock"
                    },
                    "assigned_manager": {
                        text: "Manager Assigned",
                        icon: "bi-person-badge"
                    },
                    "assigned_employee": {
                        text: "Employee Assigned",
                        icon: "bi-person-plus"
                    },
                    "case_on_hold": {
                        text: "Case Put On Hold",
                        icon: "bi-pause-circle"
                    },
                    "case_resumed": {
                        text: "Case Resumed",
                        icon: "bi-play-circle"
                    },
                    // Application Log Types
                    "app_created": {
                        text: "Application Received",
                        icon: "bi-stars"
                    },
                    "app_updated": {
                        text: "App Info Updated",
                        icon: "bi-pencil"
                    },
                    "app_status_change": {
                        text: "Application Approved",
                        icon: "bi-arrow-left-right"
                    },
                    "app_admin_remark": {
                        text: "Note Added (App)",
                        icon: "bi-chat-left-text"
                    },
                    "app_follow_up": {
                        text: "Follow Up Required",
                        icon: "bi-telephone"
                    }
                };

                j.timeline.forEach((t, index) => {
                    const config = LABELS[t.type] || {
                        text: t.type.replace(/_/g, ' '),
                        icon: "bi-circle"
                    };
                    const userName = t.user_name || 'System';
                    const time = new Date(t.created_at).toLocaleString();

                    const item = document.createElement('div');
                    item.className = 'timeline-item';
                    item.style.animationDelay = `${index * 0.05}s`;

                    let extraContent = '';
                    
                    if (t.details) {
                        try {
                            const det = typeof t.details === 'string' ? JSON.parse(t.details) : t.details;
                            if (det.remarks) {
                                extraContent = `<div class="mt-1 small text-dark fst-italic">"${det.remarks}"</div>`;
                            }
                        } catch(e) {}
                    }

                    item.innerHTML = `
                        <div class="timeline-icon"><i class="bi ${config.icon}"></i></div>
                        <div class="timeline-content">
                            <div class="timeline-title">${config.text}</div>
                            <div class="timeline-user"><i class="bi bi-person"></i> ${userName}</div>
                            <div class="timeline-date"><i class="bi bi-clock"></i> ${time}</div>
                            ${extraContent}
                        </div>
                    `;

                    box.appendChild(item);
                });
            } catch (err) {
                console.error(err);
                box.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load timeline</p></div>`;
            }
        }

        function hasReopenRequest() {
            return false; // Not needed anymore since status will show it
        }

        function renderActionBox(c) {
            const box = document.getElementById("caseActions");
            box.innerHTML = "";

            function addBtn(text, cls, cb) {
                const b = document.createElement("button");
                b.className = "btn btn-sm " + cls;
                b.textContent = text;
                b.onclick = cb;
                box.appendChild(b);
            }

            const id = c.id;
            const st = c.status;

            // Allow admin to hold/resume in-progress cases
            if (st === "in-progress") {
                addBtn("Hold Case", "btn-warning", async () => {
                    if (!confirm("Put this case on hold? Employee will not be able to work on it.")) return;
                    await post("api/cases/hold-case", id);
                    await reloadDrawer(id);
                });
                addBtn("Request Completion", "btn-outline-dark", async () => {
                    await post("api/cases/request-completion", id);
                    await reloadDrawer(id);
                });
            }

            // Allow admin to resume on-hold cases
            if (st === "on-hold") {
                addBtn("Resume Case", "btn-success", async () => {
                    if (!confirm("Resume this case? It will become active for the employee.")) return;
                    await post("api/cases/resume-case", id);
                    await reloadDrawer(id);
                });
            }

            if (st === "waiting-doc-approval") {
                addBtn("Approve Documents", "btn-success", async () => {
                    await post("api/cases/approve-docs", id);
                    await reloadDrawer(id);
                });
                addBtn("Reject Documents", "btn-danger", async () => {
                    if (!confirm("Reject documents? This will revert case to In Progress.")) return;
                    await post("api/cases/reject-docs", id);
                    await reloadDrawer(id);
                });
            }

            if (st === "awaiting-completion-approval") {
                addBtn("Approve Completion", "btn-success", async () => {
                    await post("api/cases/approve-completion", id);
                    await reloadDrawer(id);
                });
                addBtn("Reject Completion", "btn-danger", async () => {
                    const reason = prompt("Reason for rejecting completion:");
                    if (!reason) return;
                    await postWithReason("api/cases/reject-completion", id, reason);
                    await reloadDrawer(id);
                });
            }

            if (st === "reopen-requested") {
                addBtn("Approve Reopen", "btn-success", async () => {
                    await post("api/cases/approve-reopen", id);
                    await reloadDrawer(id);
                });
                addBtn("Reject Reopen", "btn-danger", async () => {
                    const reason = prompt("Reason for rejecting reopen request:");
                    if (!reason) return;
                    await postWithReason("api/cases/reject-reopen", id, reason);
                    await reloadDrawer(id);
                });
            }

            if (st === "completed") {
                box.innerHTML = '<div class="small text-muted mt-2">Case is completed.</div>';
            }

            if (st === "assigned") {
                box.innerHTML = '<div class="small text-muted mt-2">Case is assigned. Waiting for employee to start.</div>';
            }
        }

        async function post(path, caseId) {
            try {
                const r = await fetch(API_BASE + path, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `case_id=${caseId}`
                });
                const j = await r.json();

                if (j.error) {
                    showAlert(j.error, 'danger');
                } else {
                    showAlert(j.message || 'Action completed', 'success');
                }

                return j;
            } catch (err) {
                console.error(err);
                showAlert('Action failed', 'danger');
            }
        }

        async function postWithReason(path, caseId, reason) {
            try {
                const r = await fetch(API_BASE + path, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `case_id=${caseId}&reason=${encodeURIComponent(reason)}`
                });
                const j = await r.json();

                if (j.error) {
                    showAlert(j.error, 'danger');
                } else {
                    showAlert(j.message || 'Action completed', 'success');
                }

                return j;
            } catch (err) {
                console.error(err);
                showAlert('Action failed', 'danger');
            }
        }

        async function reloadDrawer(id) {
            await loadCases();
            await openCaseDrawer(id);
        }

        // Assign Manager
        document.getElementById('btnAssignManager').onclick = async () => {
            const r = await fetch(API_BASE + "api/users/list");
            const j = await r.json();
            const managers = (j.users || []).filter(u => u.role === 'manager');

            const sel = document.getElementById('managerDropdown');
            sel.innerHTML = '<option value="">Select manager</option>';
            managers.forEach(m => sel.innerHTML += `<option value="${m.id}">${m.name}</option>`);

            new bootstrap.Modal(document.getElementById('assignManagerModal')).show();
        };

        document.getElementById('assignManagerForm').onsubmit = async (e) => {
            e.preventDefault();
            const managerId = document.getElementById('managerDropdown').value;
            if (!managerId) {
                showAlert('Pick a manager', 'warning');
                return;
            }

            const r = await fetch(API_BASE + "api/cases/assign-manager", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `case_id=${currentCaseId}&manager_id=${managerId}`
            });

            const j = await r.json();
            if (j.error) {
                showAlert(j.error, 'danger');
                return;
            }

            showAlert('Manager assigned', 'success');
            bootstrap.Modal.getInstance(document.getElementById('assignManagerModal')).hide();
            await reloadDrawer(currentCaseId);
        };

        // Assign Employee
        document.getElementById('btnAssignEmployee').onclick = async () => {
            const r = await fetch(API_BASE + "api/users/list");
            const j = await r.json();
            const employees = (j.users || []).filter(u => u.role === 'employee');

            const sel = document.getElementById('employeeDropdown');
            sel.innerHTML = '<option value="">Select employee</option>';
            employees.forEach(e => sel.innerHTML += `<option value="${e.id}">${e.name}</option>`);

            new bootstrap.Modal(document.getElementById('assignEmployeeModal')).show();
        };

        document.getElementById('assignEmployeeForm').onsubmit = async (e) => {
            e.preventDefault();
            const employeeId = document.getElementById('employeeDropdown').value;
            if (!employeeId) {
                showAlert('Pick an employee', 'warning');
                return;
            }

            const r = await fetch(API_BASE + "api/cases/assign-employee", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `case_id=${currentCaseId}&employee_id=${employeeId}`
            });

            const j = await r.json();
            if (j.error) {
                showAlert(j.error, 'danger');
                return;
            }

            showAlert('Employee assigned', 'success');
            bootstrap.Modal.getInstance(document.getElementById('assignEmployeeModal')).hide();
            await reloadDrawer(currentCaseId);
        };

        loadCases();
    </script>

</body>

</html>