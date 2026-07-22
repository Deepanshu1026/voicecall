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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --card-shadow: 0 2px 8px rgba(0,0,0,0.08);
            --hover-shadow: 0 4px 16px rgba(0,0,0,0.12);
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

        .page-header p {
            margin: 8px 0 0 0;
            color: #718096;
        }

        /* Stat Cards */
        .stat-card {
            border-radius: 12px;
            padding: 24px;
            color: white;
            transition: all 0.3s ease;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            transform: translate(30%, -30%);
        }

        .stat-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        }

        .stat-icon {
            font-size: 3rem;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.95;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
            margin-top: 8px;
        }

        .stat-trend {
            font-size: 0.85rem;
            margin-top: 8px;
            opacity: 0.9;
        }

        /* Chart Container */
        .chart-container {
            background: white;
            padding: 28px;
            border-radius: 12px;
            box-shadow: var(--card-shadow);
            transition: box-shadow 0.3s;
        }

        .chart-container:hover {
            box-shadow: var(--hover-shadow);
        }

        .chart-container h5 {
            color: #2d3748;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        .chart-container h5 i {
            color: #667eea;
            font-size: 1.3rem;
        }

        /* Table Improvements */
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
        }

        /* Badge Improvements */
        .badge {
            font-size: 0.75rem;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 500;
            text-transform: capitalize;
        }

        .badge.bg-secondary { background: linear-gradient(135deg, #a0aec0 0%, #718096 100%) !important; }
        .badge.bg-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }
        .badge.bg-warning { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%) !important; }
        .badge.bg-info { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%) !important; }
        .badge.bg-dark { background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%) !important; }
        .badge.bg-success { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important; }

        /* Loading Animation */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .loading {
            animation: pulse 1.5s ease-in-out infinite;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #a0aec0;
        }

        .empty-state i {
            font-size: 4rem;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .stat-value {
                font-size: 2rem;
            }

            .stat-icon {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
<?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header">
        <h3><i class="bi bi-speedometer2"></i> Dashboard Overview</h3>
        <p>Monitor your system performance and key metrics</p>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="stat-label">Total Cases</div>
                        <div class="stat-value" id="totalCases">0</div>
                        <div class="stat-trend"><i class="bi bi-graph-up"></i> All time</div>
                    </div>
                    <i class="bi bi-folder-fill stat-icon"></i>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="stat-label">Pending Docs</div>
                        <div class="stat-value" id="pendingDocs">0</div>
                        <div class="stat-trend"><i class="bi bi-hourglass-split"></i> Awaiting approval</div>
                    </div>
                    <i class="bi bi-file-earmark-text stat-icon"></i>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="stat-label">Pending Completion</div>
                        <div class="stat-value" id="pendingCompletion">0</div>
                        <div class="stat-trend"><i class="bi bi-clock-history"></i> Needs review</div>
                    </div>
                    <i class="bi bi-check-circle stat-icon"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="stat-label">Active Employees</div>
                        <div class="stat-value" id="activeEmployees">0</div>
                        <div class="stat-trend"><i class="bi bi-person-check"></i> Currently active</div>
                    </div>
                    <i class="bi bi-people-fill stat-icon"></i>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="stat-label">Active Managers</div>
                        <div class="stat-value" id="activeManagers">0</div>
                        <div class="stat-trend"><i class="bi bi-person-badge"></i> Currently active</div>
                    </div>
                    <i class="bi bi-person-badge stat-icon"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Weekly Stats Graph -->
    <div class="chart-container mb-4">
        <h5><i class="bi bi-graph-up-arrow"></i> Weekly Case Creation Trend</h5>
        <canvas id="weeklyChart" height="80"></canvas>
    </div>

    <!-- Recent Cases Table -->
    <div class="chart-container">
        <h5><i class="bi bi-clock-history"></i> Recent Cases</h5>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Manager</th>
                        <th>Employee</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="recentCasesTable">
                    <tr>
                        <td colspan="7">
                            <div class="text-center py-4 loading">
                                <i class="bi bi-arrow-repeat" style="font-size: 2rem; color: #667eea;"></i>
                                <p class="mt-2 text-muted">Loading dashboard data...</p>
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
        document.getElementById('recentCasesTable').innerHTML = `
            <tr><td colspan="7">
                <div class="empty-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p class="text-danger">Failed to load dashboard data</p>
                </div>
            </td></tr>
        `;
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
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#764ba2',
                pointHoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        font: { size: 13, weight: '600' },
                        color: '#4a5568'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 55, 72, 0.95)',
                    padding: 12,
                    borderColor: '#667eea',
                    borderWidth: 2,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        color: '#718096',
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#718096',
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    }
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
                <p>No recent cases found</p>
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
            <td><i class="bi bi-person"></i> ${c.client_name}</td>
            <td><i class="bi bi-tag"></i> ${c.case_type}</td>
            <td>${statusBadge(c.status)}</td>
            <td>${c.manager_name || '<span class="text-muted">Not assigned</span>'}</td>
            <td>${c.employee_name || '<span class="text-muted">Not assigned</span>'}</td>
            <td>
                <a href="cases.php" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i> View
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

loadDashboard();
</script>

</body>
</html>
