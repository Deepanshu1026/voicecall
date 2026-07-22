<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();
require_role('admin');
$active = 'create_case';

include __DIR__ . '/../layout/header.php';
include __DIR__ . '/../layout/sidebar.php';
include __DIR__ . '/../layout/topbar.php';
?>

<link rel="stylesheet" href="../assets/css/admin-create-case.css">

<div class="container mt-4">
    <div class="page-header">
        <h3><i class="bi bi-plus-circle"></i> Create New Case</h3>
        <p>Fill in the details below to create a new case in the system</p>
    </div>

    <div id="alertContainer"></div>

    <div class="form-card">
        <form id="caseForm">
            
            <div class="form-section-title">
                <i class="bi bi-person-circle"></i> Client Information
            </div>

            <div class="mb-4">
                <label class="form-label"><i class="bi bi-person"></i> Client Name</label>
                <input type="text" name="client_name" class="form-control" placeholder="Enter client full name" required>
            </div>

            <div class="mb-4">
                <label class="form-label"><i class="bi bi-telephone"></i> Client Phone</label>
                <input type="text" name="client_phone" class="form-control" placeholder="Enter phone number" required>
            </div>

            <div class="form-section-title mt-4">
                <i class="bi bi-briefcase"></i> Case Details
            </div>

            <div class="mb-4">
                <label class="form-label"><i class="bi bi-tag"></i> Case Type</label>
                <input type="text" name="case_type" class="form-control" placeholder="e.g., Study Visa, Work Visa, PR Application" required>
            </div>

            <div class="mb-4">
                <label class="form-label"><i class="bi bi-person-badge"></i> Agent Name</label>
                <select name="agent_id" id="agentSelect" class="form-select">
                    <option value="">-- Select Agent (Reference) --</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="form-label">
                    <i class="bi bi-flag"></i> Priority
                    <span id="priorityPreview" class="priority-preview priority-normal">Normal</span>
                </label>
                <select name="priority" id="prioritySelect" class="form-select">
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="form-label"><i class="bi bi-chat-left-text"></i> Remarks (Optional)</label>
                <textarea name="remarks" class="form-control" rows="4" placeholder="Add any additional notes or special instructions..."></textarea>
            </div>

            <button type="submit" class="btn btn-submit" id="submitBtn">
                <i class="bi bi-check-circle"></i> Create Case
            </button>
</form>
    </div>
</div>

<script>
// Load Agents
async function loadAgents() {
    try {
        const res = await fetch("../../index.php?path=api/agents/list");
        const data = await res.json();
        if (data.success && data.agents) {
            const sel = document.getElementById("agentSelect");
            data.agents.forEach(a => {
                const opt = document.createElement("option");
                // Use ID as value
                opt.value = a.id; 
                opt.textContent = a.user_name;
                sel.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Failed to load agents", e);
    }
}
loadAgents();

// Priority preview update
document.getElementById("prioritySelect").addEventListener("change", function() {
    const preview = document.getElementById("priorityPreview");
    if (this.value === "high") {
        preview.textContent = "High";
        preview.className = "priority-preview priority-high";
    } else {
        preview.textContent = "Normal";
        preview.className = "priority-preview priority-normal";
    }
});

// Show alert function
function showAlert(message, type = 'success') {
    const container = document.getElementById("alertContainer");
    const icon = type === 'success' ? 'check-circle-fill' : 'x-circle-fill';
    
    container.innerHTML = `
        <div class="alert-modern alert-${type}">
            <i class="bi bi-${icon}"></i>
            <div>${message}</div>
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Form submission
document.getElementById("caseForm").onsubmit = async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById("submitBtn");
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating Case...';
    
    const form = new FormData(this);

    try {
        const response = await fetch("../../index.php?path=api/cases/create", {
            method: "POST",
            body: form
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`✓ Case created successfully! Case ID: #${data.case_id || 'N/A'}`, 'success');
            
            // Reset form
            this.reset();
            document.getElementById("priorityPreview").textContent = "Normal";
            document.getElementById("priorityPreview").className = "priority-preview priority-normal";
            
            // Optional: Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = "/public/admin/cases.php";
            }, 2000);
        } else {
            showAlert(`✗ Error: ${data.error || 'Failed to create case'}`, 'danger');
        }
    } catch (error) {
        console.error(error);
        showAlert('✗ Network error. Please try again.', 'danger');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
};
</script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
