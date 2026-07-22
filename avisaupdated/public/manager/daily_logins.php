<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';

require_auth();
require_role('manager');

$active = 'daily_logins';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Daily Logins - Avisa Agent</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/admin-dashboard.css">
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="page-header">
        <h3>Daily Login Logs</h3>
        <p>View user login activity from external database.</p>
    </div>

    <div class="table-card">
        <div class="table-card-header">
            <h5>Login History <span id="totalRecordsBadge" class="badge bg-secondary ms-2" style="display:none">0</span></h5>
            <button class="btn btn-sm btn-outline-primary" onclick="fetchLogins(currPage)">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
        </div>
        <div class="table-responsive">
            <div id="loadingIndicator" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Loading records...</p>
            </div>
            
            <table class="table table-hover" id="loginsTable" style="display:none">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Login From</th>
                        <th>Email</th>
                        <th>Country Code</th>
                        <th>Mobile</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    <!-- JS Populated -->
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="p-3 border-top d-flex justify-content-between align-items-center" id="paginationControls" style="display:none">
            <small class="text-muted" id="pageInfo">Showing page 1 of 1</small>
            <nav>
                <ul class="pagination pagination-sm mb-0" id="paginationList">
                   <!-- JS Populated -->
                </ul>
            </nav>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
    
const BASE_URL = '/avisaupdated/index.php';
let currPage = 1;

// Helper to build API URL
function apiUrl(endpoint, params = {}) {
    const url = new URL(BASE_URL, window.location.origin);
    url.searchParams.append('path', endpoint);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    return url.toString();
}

function fetchLogins(page = 1) {
    currPage = page;
    
    // Show loader only on initial load or full refresh, 
    // maybe keep table visible but dim it? For now, standard loader.
    const table = document.getElementById('loginsTable');
    const loader = document.getElementById('loadingIndicator');
    const pagination = document.getElementById('paginationControls');
    
    // Simple state: table hides, loader shows
    table.style.display = 'none';
    pagination.style.display = 'none';
    loader.style.display = 'block';

    fetch(apiUrl('api/admin/daily-logins', { page: page }))
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderTable(data.data);
                renderPagination(data.pagination);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to load data.</td></tr>';
        })
        .finally(() => {
            loader.style.display = 'none';
            table.style.display = 'table';
            pagination.style.display = 'flex';
        });
}

function renderTable(rows) {
    const tbody = document.getElementById('tableBody');
    if (!rows || rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No records found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = rows.map(row => `
        <tr>
            <td>${row.user_name || ''}</td>
            <td>${row.login_from || ''}</td>
            <td>${row.user_email || ''}</td>
            <td>${row.country_code || ''}</td>
            <td>${row.user_mobile || ''}</td>
            <td>${row.created_at || ''}</td>
        </tr>
    `).join('');
}

function renderPagination(meta) {
    const { current_page, total_pages, total_records } = meta;
    
    // Update Info
    document.getElementById('totalRecordsBadge').innerText = total_records;
    document.getElementById('totalRecordsBadge').style.display = 'inline-block';
    
    document.getElementById('pageInfo').innerText = `Showing page ${current_page} of ${total_pages}`;
    
    if (total_pages <= 1) {
        document.getElementById('paginationList').innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Prev
    html += `<li class="page-item ${current_page <= 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="fetchLogins(${current_page - 1})">Previous</button>
             </li>`;
             
    // Simple range: current-2 to current+2
    const start = Math.max(1, current_page - 2);
    const end = Math.min(total_pages, current_page + 2);
    
    if (start > 1) {
        html += `<li class="page-item"><button class="page-link" onclick="fetchLogins(1)">1</button></li>`;
        if (start > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    
    for (let i = start; i <= end; i++) {
        html += `<li class="page-item ${i === current_page ? 'active' : ''}">
                    <button class="page-link" onclick="fetchLogins(${i})">${i}</button>
                 </li>`;
    }
    
    if (end < total_pages) {
        if (end < total_pages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><button class="page-link" onclick="fetchLogins(${total_pages})">${total_pages}</button></li>`;
    }

    // Next
    html += `<li class="page-item ${current_page >= total_pages ? 'disabled' : ''}">
                <button class="page-link" onclick="fetchLogins(${current_page + 1})">Next</button>
             </li>`;
             
    document.getElementById('paginationList').innerHTML = html;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchLogins(1);
});
</script>
</body>
</html>
