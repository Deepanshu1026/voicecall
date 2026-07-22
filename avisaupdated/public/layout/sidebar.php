<?php
require_once __DIR__ . '/../../app/helpers/session.php';
$role = $_SESSION['role'] ?? '';
?>
<link rel="stylesheet" href="../assets/css/layout.css">


<div class="sidebar position-fixed top-0 start-0 col-2">
    <h4 class="text-center py-3">
        <?= ucfirst($role) ?> Portal
    </h4>

    <?php if ($role === 'admin'): ?>

        <a href="/avisaupdated/public/admin/index.php" class="<?= $active == 'dashboard' ? 'active' : '' ?>">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>

        <a href="/avisaupdated/public/admin/create_case.php" class="<?= $active == 'create_case' ? 'active' : '' ?>">
            <i class="bi bi-plus-circle"></i> Create Case
        </a>

        <a href="/avisaupdated/public/admin/cases.php" class="<?= $active == 'cases' ? 'active' : '' ?>">
            <i class="bi bi-folder"></i> All Cases
            <span class="badge bg-primary rounded-pill float-end mt-1 menu-badge" id="badge-admin-all-cases" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/admin/users.php" class="<?= $active == 'users' ? 'active' : '' ?>">
            <i class="bi bi-people"></i> Manage Users
        </a>

        <a href="/avisaupdated/public/admin/appointments.php" class="<?= $active == 'appointments' ? 'active' : '' ?>">
            <i class="bi bi-calendar-event"></i> Appointments
            <span class="badge bg-info text-dark rounded-pill float-end mt-1 menu-badge" id="badge-admin-appointments" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/admin/daily_logins.php" class="<?= $active == 'daily_logins' ? 'active' : '' ?>">
            <i class="bi bi-list-check"></i> Daily Logins
        </a>

        <a href="/avisaupdated/public/admin/agent_requests.php" class="<?= $active == 'agent_requests' ? 'active' : '' ?>">
            <i class="bi bi-person-check"></i> Agent Requests
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-admin-agent-requests" style="display:none"></span>
        </a>
        <a href="/avisaupdated/public/admin/follow_ups.php" class="<?= $active == 'follow_ups' ? 'active' : '' ?>">
            <i class="bi bi-person-exclamation"></i> Follow Ups
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-admin-pending-remarks" style="display:none"></span>
        </a>



    <?php endif; ?>


    <?php if ($role === 'manager'): ?>

        <a href="/avisaupdated/public/manager/index.php" class="<?= $active == 'dashboard' ? 'active' : '' ?>">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>

        <a href="/avisaupdated/public/manager/cases.php" class="<?= $active == 'cases' ? 'active' : '' ?>">
            <i class="bi bi-briefcase"></i> Assigned Cases
            <span class="badge bg-warning text-dark rounded-pill float-end mt-1 menu-badge ms-1" id="badge-mgr-progress" style="display:none"></span>
            <span class="badge bg-primary rounded-pill float-end mt-1 menu-badge" id="badge-mgr-assigned" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/manager/approvals.php" class="<?= $active == 'approvals' ? 'active' : '' ?>">
            <i class="bi bi-check-circle"></i> Approvals
            <span class="badge bg-warning text-dark rounded-pill float-end mt-1 menu-badge" id="badge-mgr-approvals" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/manager/daily_logins.php" class="<?= $active == 'daily_logins' ? 'active' : '' ?>">
            <i class="bi bi-list-check"></i> Daily Logins
        </a>

        <a href="/avisaupdated/public/manager/agent_requests.php" class="<?= $active == 'agent_requests' ? 'active' : '' ?>">
            <i class="bi bi-person-check"></i> Agent Requests
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-mgr-agent-requests" style="display:none"></span>
        </a>
        <a href="/avisaupdated/public/manager/follow_ups.php" class="<?= $active == 'follow_ups' ? 'active' : '' ?>">
            <i class="bi bi-person-exclamation"></i> Follow Ups
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-mgr-pending-remarks" style="display:none"></span>
        </a>



    <?php endif; ?>


    <?php if ($role === 'employee'): ?>

        <a href="/avisaupdated/public/employee/index.php" class="<?= $active == 'dashboard' ? 'active' : '' ?>">
            <i class="bi bi-speedometer"></i> Dashboard
        </a>

        <a href="/avisaupdated/public/employee/my-case.php" class="<?= $active == 'mycase' ? 'active' : '' ?>">
            <i class="bi bi-folder2-open"></i> My Case
        </a>




    <?php endif; ?>


    <?php if ($role === 'agent'): ?>

        <a href="/avisaupdated/public/agent/index.php" class="<?= $active == 'dashboard' ? 'active' : '' ?>">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>

        <a href="/avisaupdated/public/agent/form.php" class="<?= $active == 'new_application' ? 'active' : '' ?>">
            <i class="bi bi-file-earmark-plus"></i> New Application
        </a>
        <a href="/avisaupdated/public/agent/daily_logins.php" class="<?= $active == 'daily_logins' ? 'active' : '' ?>">
            <i class="bi bi-file-earmark-plus"></i> Daily Logins
            <span class="badge bg-primary rounded-pill float-end mt-1 menu-badge" id="badge-agent-logins" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/agent/pending_remarks.php" class="<?= $active == 'pending_remarks' ? 'active' : '' ?>">
            <i class="bi bi-person-exclamation"></i> Pending Remarks
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-agent-pending-remarks" style="display:none"></span>
        </a>

        <a href="/avisaupdated/public/agent/chat.php" class="<?= $active == 'chat' ? 'active' : '' ?>">
            <i class="bi bi-chat-dots"></i> Client Chat
            <span class="badge bg-danger rounded-pill float-end mt-1 menu-badge" id="badge-agent-chat" style="display:none"></span>
        </a>



    <?php endif; ?>


    <!-- Logout -->
    <a href="/avisaupdated/public/logout.php"
        class="text-danger fw-bold mt-3">
        <i class="bi bi-box-arrow-right"></i> Logout
    </a>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const POLL_INTERVAL = 15000; // 15 seconds
    const API_URL = '/index.php?path=api/notifications/counts';

    function updateBadge(id, count) {
        const badge = document.getElementById(id);
        if(!badge) return;
        
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    function fetchCounts() {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    const c = data.counts;
                    // Admin Agent Requests
                    updateBadge('badge-admin-agent-requests', c.agent_requests);
                    updateBadge('badge-admin-pending-remarks', c.pending_remarks);
                    updateBadge('badge-admin-all-cases', c.all_cases);
                    updateBadge('badge-admin-appointments', c.today_appointments);
                    
                    // Manager
                    updateBadge('badge-mgr-assigned', c.assigned_cases_new);
                    updateBadge('badge-mgr-progress', c.assigned_cases_progress);
                    updateBadge('badge-mgr-approvals', c.approvals);
                    updateBadge('badge-mgr-agent-requests', c.agent_requests);
                    updateBadge('badge-mgr-pending-remarks', c.pending_remarks);
                    
                    // Agent
                    updateBadge('badge-agent-logins', c.daily_logins_today);
                    updateBadge('badge-agent-chat', c.chat_unread);

                    updateBadge('badge-agent-pending-remarks', c.agent_pending_remarks);
                    
                    // Universal Chat Badge
                    updateBadge('badge-topbar-internal-chat', c.chat_unread);

                }
            })
            .catch(err => console.error('Badge fetch error', err));
    }

    // Initial fetch
    fetchCounts();
    // Poll
    setInterval(fetchCounts, POLL_INTERVAL);
});
</script>