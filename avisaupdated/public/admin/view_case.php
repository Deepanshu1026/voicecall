<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}

$caseId = $_GET['id'] ?? null;
if (!$caseId) {
    die("Invalid Case ID");
}

$active = 'cases';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Case Details - Admin</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        .section-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
        }
        .timeline {
            border-left: 2px solid #ccc;
            padding-left: 15px;
        }
        .timeline-entry {
            margin-bottom: 15px;
        }
    </style>
</head>

<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
<?php include __DIR__ . '/../layout/topbar.php'; ?>

    <h3 class="mb-3">Case Details</h3>

    <div id="alertBox"></div>

    <!-- ==========================
         1. CASE HEADER
    =========================== -->
    <div class="section-box" id="caseHeader"></div>

    <!-- ==========================
         2. ASSIGNMENTS
    =========================== -->
    <div class="section-box" id="assignmentBox"></div>

    <!-- ==========================
         3. DOCUMENTS
    =========================== -->
    <div class="section-box" id="documentsBox"></div>

    <!-- ==========================
         4. TIMELINE
    =========================== -->
    <div class="section-box" id="timelineBox"></div>

</div>



<script>
const API = "../../index.php?path=";
const CASE_ID = "<?php echo $caseId; ?>";


/* --------------------------------
    UTIL: Show alert
----------------------------------- */
function showAlert(msg, type="info") {
    document.getElementById("alertBox").innerHTML =
        `<div class="alert alert-${type}">${msg}</div>`;
    setTimeout(() => document.getElementById("alertBox").innerHTML = "", 3000);
}


/* --------------------------------
    LOAD CASE DETAILS
----------------------------------- */
async function loadCase() {
    const res = await fetch(API + "api/cases/list");
    const json = await res.json();

    const caseData = json.cases.find(c => c.id == CASE_ID);
    if (!caseData) {
        showAlert("Case not found", "danger");
        return;
    }

    renderCaseHeader(caseData);
    renderAssignments(caseData);
}

function statusBadge(status) {
    const map = {
        "pending": "secondary",
        "assigned": "primary",
        "in-progress": "warning",
        "waiting-doc-approval": "info",
        "awaiting-completion-approval": "dark",
        "completed": "success",
        "rejected": "danger"
    };
    return `<span class="badge bg-${map[status] || 'secondary'}">${status}</span>`;
}

function renderCaseHeader(c) {
    document.getElementById("caseHeader").innerHTML = `
        <h4>Client: ${c.client_name} &nbsp; ${statusBadge(c.status)}</h4>
        <p><strong>Phone:</strong> ${c.client_phone}</p>
        <p><strong>Case Type:</strong> ${c.case_type}</p>
        <p><strong>Priority:</strong> ${c.priority}</p>
        <p><strong>Created:</strong> ${c.created_at}</p>
    `;
}


/* --------------------------------
    LOAD ASSIGNMENTS
----------------------------------- */
function renderAssignments(c) {
    document.getElementById("assignmentBox").innerHTML = `
        <h5>Assignments</h5>
        <p><strong>Manager:</strong> ${c.assigned_manager ?? '<span class="text-muted">Not assigned</span>'}</p>
        <p><strong>Employee:</strong> ${c.assigned_employee ?? '<span class="text-muted">Not assigned</span>'}</p>

        <button class="btn btn-sm btn-primary" onclick="assignManager()">Assign Manager</button>
        <button class="btn btn-sm btn-warning" onclick="assignEmployee()">Assign Employee</button>
    `;
}


/* --------------------------------
    ASSIGN MANAGER
----------------------------------- */
async function assignManager() {
    const managerId = prompt("Enter Manager ID:");
    if (!managerId) return;

    const form = new FormData();
    form.append("case_id", CASE_ID);
    form.append("manager_id", managerId);

    const res = await fetch(API + "api/cases/assign-manager", { method: "POST", body: form });
    const json = await res.json();

    if (json.error) showAlert(json.error, "danger");
    else {
        showAlert("Manager Assigned", "success");
        loadCase();
    }
}


/* --------------------------------
    ASSIGN EMPLOYEE
----------------------------------- */
async function assignEmployee() {
    const empId = prompt("Enter Employee ID:");
    if (!empId) return;

    const form = new FormData();
    form.append("case_id", CASE_ID);
    form.append("employee_id", empId);

    const res = await fetch(API + "api/cases/assign-employee", { method: "POST", body: form });
    const json = await res.json();

    if (json.error) showAlert(json.error, "danger");
    else {
        showAlert("Employee Assigned", "success");
        loadCase();
    }
}


/* --------------------------------
    DOCUMENTS
----------------------------------- */
async function loadDocuments() {
    const res = await fetch(API + "api/cases/documents&case_id=" + CASE_ID);
    const json = await res.json();

    const box = document.getElementById("documentsBox");

    let html = `<h5>Documents</h5>`;

    if (!json.documents || !json.documents.length) {
        html += `<p class="text-muted">No documents uploaded</p>`;
    } else {
        html += `<ul class="list-group">`;
        json.documents.forEach(d => {
            html += `
                <li class="list-group-item d-flex justify-content-between">
                    <a href="${d.file_url}" target="_blank">${d.file_name}</a>
                    <button onclick="deleteDocument(${d.id})" class="btn btn-sm btn-danger">Delete</button>
                </li>`;
        });
        html += `</ul>`;
    }

    box.innerHTML = html;
}

async function deleteDocument(id) {
    if (!confirm("Delete this document?")) return;

    const form = new FormData();
    form.append("doc_id", id);

    const res = await fetch(API + "api/cases/document-delete", { method: "POST", body: form });
    const json = await res.json();

    if (json.error) showAlert(json.error, "danger");
    else {
        showAlert("Document deleted", "success");
        loadDocuments();
    }
}


/* --------------------------------
    TIMELINE
----------------------------------- */
async function loadTimeline() {
    const res = await fetch("/avisaexperts-portal/api/timeline.php?case_id=" + CASE_ID);
    const json = await res.json();

    let html = `<h5>Activity Timeline</h5><div class="timeline">`;

    if (!json.timeline || !json.timeline.length) {
        html += `<p class="text-muted">No activity yet</p>`;
    } else {
        json.timeline.forEach(t => {
            html += `
                <div class="timeline-entry">
                    <strong>${t.action}</strong><br>
                    <small>${t.created_at}</small>
                </div>`;
        });
    }

    html += `</div>`;

    document.getElementById("timelineBox").innerHTML = html;
}


/* --------------------------------
    INIT
----------------------------------- */
loadCase();
loadDocuments();
loadTimeline();

</script>

</body>
</html>
