<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}
$active = 'dashboard';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dashboard - Admin</title>
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <link rel="stylesheet" href="../assets/css/admin-dashboard.css">
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
<?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header">
        <h3>Dashboard</h3>
        <p>Welcome back! Here's what's happening with your system today.</p>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="stat-card stat-card-blue">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-folder-fill stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="totalCases">0</div>
                    <div class="stat-label">Total Cases</div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="stat-card stat-card-red">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-file-earmark-text stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="pendingDocs">0</div>
                    <div class="stat-label">Pending Documents</div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="stat-card stat-card-yellow">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-clock-history stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="pendingCompletion">0</div>
                    <div class="stat-label">Pending Completion</div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="stat-card stat-card-green">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-people-fill stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="activeEmployees">0</div>
                    <div class="stat-label">Active Employees</div>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="stat-card stat-card-purple">
                <div class="stat-header">
                    <div class="stat-icon-wrapper">
                        <i class="bi bi-person-badge stat-icon"></i>
                    </div>
                </div>
                <div class="stat-body">
                    <div class="stat-value" id="activeManagers">0</div>
                    <div class="stat-label">Active Managers</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Weekly Stats Graph -->
    <div class="chart-card">
        <h5>Case Creation Trend</h5>
        <canvas id="weeklyChart" height="80"></canvas>
    </div>

    <!-- Recent Cases Table -->
    <div class="table-card">
        <div class="table-card-header">
            <h5>Recent Cases</h5>
            <a href="cases.php" class="btn-view-all">
                View All <i class="bi bi-arrow-right"></i>
            </a>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Manager</th>
                        <th>Employee</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="recentCasesTable">
                    <tr>
                        <td colspan="7">
                            <div class="loading-state">
                                <div class="loading-spinner"></div>
                                <p>Loading cases...</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
const API_BASE = "../../index.php?path=";
let weeklyChart;

async function loadDashboard() {
    try {
        const r = await fetch(API_BASE + "api/dashboard/stats");
        const j = await r.json();
        
        if (!j.success) {
            console.error("Failed to load dashboard");
            return;
        }
        
        // Update stat cards with animation
        animateValue('totalCases', 0, j.stats.total_cases, 1000);
        animateValue('pendingDocs', 0, j.stats.pending_docs, 1000);
        animateValue('pendingCompletion', 0, j.stats.pending_completion, 1000);
        animateValue('activeEmployees', 0, j.stats.active_employees, 1000);
        animateValue('activeManagers', 0, j.stats.active_managers, 1000);
        
        // Render weekly chart
        renderWeeklyChart(j.weekly_stats);
        
        // Render recent cases
        renderRecentCases(j.recent_cases);
        
    } catch (err) {
        console.error(err);
    }
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function renderWeeklyChart(data) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    
    if (weeklyChart) weeklyChart.destroy();
    
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Cases Created',
                data: data.map(d => d.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#667eea',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 32, 44, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 13 },
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        color: '#a0aec0',
                        font: { size: 11 }
                    },
                    grid: { 
                        color: '#f1f3f5',
                        drawBorder: false
                    },
                    border: { display: false }
                },
                x: {
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 11 }
                    },
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}

function renderRecentCases(cases) {
    const tbody = document.getElementById('recentCasesTable');
    tbody.innerHTML = '';
    
    if (!cases.length) {
        tbody.innerHTML = `<tr><td colspan="7">
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>No recent cases</p>
            </div>
        </td></tr>`;
        return;
    }
    
    const statusBadge = (status) => {
        const map = {
            pending: 'secondary',
            assigned: 'primary',
            'in-progress': 'warning',
            'waiting-doc-approval': 'info',
            'awaiting-completion-approval': 'dark',
            completed: 'success'
        };
        return `<span class="badge bg-${map[status] || 'secondary'}">${status.replace(/-/g, ' ')}</span>`;
    };
    
    cases.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${c.id}</strong></td>
            <td>${c.client_name}</td>
            <td>${c.case_type}</td>
            <td>${statusBadge(c.status)}</td>
            <td>${c.manager_name || '<span style="color: #cbd5e0;">—</span>'}</td>
            <td>${c.employee_name || '<span style="color: #cbd5e0;">—</span>'}</td>
            <td>
                <a href="cases.php" class="btn-action">
                    <i class="bi bi-arrow-right"></i>
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

loadDashboard();

/* --------- Polling --------- */
let lastStatsSig = "";

function getStatsSig(s) {
    if (!s) return "";
    return `${s.total_cases}:${s.pending_docs}:${s.pending_completion}:${s.active_employees}:${s.active_managers}`;
}

async function checkDashboardUpdates() {
    try {
        const r = await fetch(API_BASE + "api/dashboard/stats");
        const j = await r.json();
        if (!j.success) return;

        const newSig = getStatsSig(j.stats);
        if (lastStatsSig && newSig !== lastStatsSig) {
            console.log("Dashboard stats changed, reloading...");
            lastStatsSig = newSig;
            loadDashboard();
        } else if (!lastStatsSig) {
            lastStatsSig = newSig;
        }
    } catch (e) {
        console.error("Polling error", e);
    }
}

setInterval(checkDashboardUpdates, 5000);
</script>

</body>
</html>
