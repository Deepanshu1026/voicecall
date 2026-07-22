<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'manager') {
    header("Location: ../login.php");
    exit;
}
$active = 'cases'; // sidebar active state
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Cases</title>
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/manager-cases.css">
    <!-- Reuse create case alerts css if we want floating alerts -->
    <link rel="stylesheet" href="../assets/css/admin-create-case.css"> 
</head>
<body>



<div class="content">
    <?php include __DIR__ . '/../layout/sidebar.php'; ?>
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header d-flex justify-content-between align-items-center">
        <div>
            <h3><i class="bi bi-briefcase"></i> My Cases</h3>
            <p class="text-muted mb-0">Manage and assign cases to employees</p>
        </div>
    </div>

    <div id="alertContainer"></div>

    <div class="card position-relative">
        <div id="loadingbox" class="loading-overlay">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Assigned Employee</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="casesBody">
                        <!-- JS populated -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Assign Modal -->
<div class="modal fade" id="assignModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Assign Employee</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="assignForm">
                    <input type="hidden" id="assignCaseId">
                    <div class="mb-3">
                        <label class="form-label">Select Employee</label>
                        <select class="form-select" id="employeeSelect" required>
                            <option value="">Loading employees...</option>
                        </select>
                        <div class="form-text">Only active employees with available capacity are shown.</div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitAssignment()">Assign Case</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
const API_BASE = '../../index.php?path=';
let allCases = [];
let allEmployees = [];

// Reuse alert from create_case logic (floating)
function showAlert(message, type = 'success') {
    const container = document.getElementById("alertContainer");
    const icon = type === 'success' ? 'check-circle-fill' : 'x-circle-fill';
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-modern alert-${type}`;
    alertDiv.innerHTML = `
        <i class="bi bi-${icon}"></i>
        <div>${message}</div>
    `;
    
    container.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

async function init() {
    await Promise.all([loadCases(), loadEmployees()]);
    document.getElementById('loadingbox').style.display = 'none';
    
    // Start polling
    setInterval(checkUpdates, 5000);
}

async function loadCases() {
    try {
        const res = await fetch(API_BASE + 'api/cases/list');
        const data = await res.json();
        
        // Manager's cases are filtered by backend or we filter here
        // The /api/cases/list endpoint usually returns cases based on role
        allCases = data.cases || [];
        renderCases();
    } catch (e) {
        console.error("Failed to load cases", e);
        showAlert("Failed to load cases", "danger");
    }
}

async function loadEmployees() {
    try {
        const res = await fetch(API_BASE + 'api/users/list'); // Check path
        const data = await res.json();
        allEmployees = (data.users || []).filter(u => u.role === 'employee' && u.status === 'active');
    } catch (e) {
        console.error("Failed to load employees", e);
    }
}

function renderCases() {
    const tbody = document.getElementById('casesBody');
    tbody.innerHTML = '';
    
    if (allCases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No cases assigned to you.</td></tr>';
        return;
    }

    // Sort by ID desc
    allCases.sort((a,b) => b.id - a.id);

    allCases.forEach(c => {
        const hasEmp = !!c.assigned_employee;
        const employeeName = hasEmp ? (c.employee_name || 'Assigned ID: ' + c.assigned_employee) : '<span class="text-muted fst-italic">Unassigned</span>';
        
        let statusBadge = 'secondary';
        if (c.status === 'assigned') statusBadge = 'assigned';
        if (c.status === 'unassigned') statusBadge = 'unassigned';
        if (c.status === 'in-progress') statusBadge = 'in-progress';
        if (c.status === 'completed') statusBadge = 'completed';
        if (c.status === 'cancelled') statusBadge = 'cancelled';

        let actionBtn = '';
        if (!hasEmp && c.status !== 'completed') {
            actionBtn = `<button class="btn-assign" onclick="openAssignModal(${c.id})"><i class="bi bi-person-plus"></i> Assign</button>`;
        } else if (hasEmp && c.status !== 'completed') {
             // Maybe re-assign? logic usually restricted, keep simple for now
             actionBtn = `<button class="btn btn-sm btn-outline-secondary" onclick="openAssignModal(${c.id})" title="Re-assign"><i class="bi bi-arrow-repeat"></i></button>`;
        }

        const row = `
            <tr>
                <td>#${c.id}</td>
                <td>
                    <div class="fw-bold">${c.client_name}</div>
                    <div class="small text-muted">${c.client_phone || ''}</div>
                </td>
                <td>${c.case_type}</td>
                <td><span class="badge badge-${statusBadge}">${c.status}</span></td>
                <td>${employeeName}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function openAssignModal(caseId) {
    document.getElementById('assignCaseId').value = caseId;
    const select = document.getElementById('employeeSelect');
    select.innerHTML = '<option value="">Select Employee...</option>';
    
    allEmployees.forEach(e => {
        select.innerHTML += `<option value="${e.id}">${e.name}</option>`;
    });
    
    new bootstrap.Modal(document.getElementById('assignModal')).show();
}

async function submitAssignment() {
    const caseId = document.getElementById('assignCaseId').value;
    const empId = document.getElementById('employeeSelect').value;
    
    if (!empId) {
        alert("Please select an employee");
        return;
    }

    const btn = document.querySelector('#assignModal .btn-primary');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Assigning...";
    
    try {
        const res = await fetch(API_BASE + 'api/cases/assign-employee', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `case_id=${caseId}&employee_id=${empId}`
        });
        const j = await res.json();
        
        if (j.success) {
            showAlert("Employee assigned successfully!", "success");
            // close modal
            const el = document.getElementById('assignModal');
            const modal = bootstrap.Modal.getInstance(el);
            modal.hide();
            
            // refresh
            await loadCases();
        } else {
            showAlert(j.error || "Assignment failed", "danger");
        }
    } catch (e) {
        console.error(e);
        showAlert("Network error", "danger");
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// Background Polling
let lastSig = "";
function getSig(arr) {
    return arr.map(c => c.id+c.status+c.assigned_employee).join('|');
}
async function checkUpdates() {
    try {
        const res = await fetch(API_BASE + 'api/cases/list');
        const data = await res.json();
        const fresh = data.cases || [];
        
        const sig = getSig(fresh);
        if (lastSig && sig !== lastSig) {
            console.log("Updates detected");
            allCases = fresh;
            renderCases();
            showAlert("Case list updated", "info");
        }
        lastSig = sig;
    } catch(e){}
}

init();
</script>
</body>
</html>
