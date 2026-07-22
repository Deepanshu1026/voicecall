<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}
$active = 'appointments';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appointments Management - Admin</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Custom Style -->
    <link rel="stylesheet" href="../assets/css/admin-appointments.css">
</head>
<body>

    <?php include __DIR__ . '/../layout/sidebar.php'; ?>

    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>
        
        <div class="page-header mt-4">
            <div>
                <h3><i class="bi bi-calendar-event-fill text-primary"></i> Appointments</h3>
                <p class="text-muted mb-0">Manage and track all customer appointments from database2</p>
            </div>
            <div class="d-flex flex-wrap gap-3 align-items-end justify-content-end" style="display:none !important;">
                <div class="filter-group">
                    <label class="small text-muted mb-1 fw-bold">Start Date</label>
                    <input type="date" id="startDate" class="form-control form-control-sm shadow-sm" style="border-radius: 8px;">
                </div>
                <div class="filter-group">
                    <label class="small text-muted mb-1 fw-bold">End Date</label>
                    <input type="date" id="endDate" class="form-control form-control-sm shadow-sm" style="border-radius: 8px;">
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary h-auto px-3 shadow-sm" onclick="loadAppointments()" style="border-radius: 8px;">
                        <i class="bi bi-filter"></i> Apply
                    </button>
                    <button class="btn btn-sm btn-outline-secondary h-auto px-3 shadow-sm" onclick="resetFilters()" style="border-radius: 8px;">
                        <i class="bi bi-x-circle"></i> Reset
                    </button>
                    <button class="btn btn-sm btn-outline-primary h-auto px-2 shadow-sm" onclick="loadAppointments()" style="border-radius: 8px;">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </div>
        </div>

        <div id="alertPlaceholder"></div>

        <div class="row g-4 mb-3">
            <div class="col-12">
                <!-- Plan Filter Tabs -->
                <div class="filter-tabs" id="planTabs">
                    <div class="filter-tab active" data-plan="all">All Plan</div>
                    <div class="filter-tab" data-plan="Basic">Basic</div>
                    <div class="filter-tab" data-plan="Paid">Paid</div>
                </div>
            </div>
        </div>

        <!-- Date Horizontal Selector -->
        <div class="date-selector-wrapper shadow-sm mb-4">
            <button class="nav-btn" onclick="scrollDates(-1)">
                <i class="bi bi-chevron-left"></i>
            </button>
            <div class="date-items-container" id="dateCarousel">
                <!-- Dates populated by JS -->
            </div>
            <button class="nav-btn" onclick="scrollDates(1)">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>

        <div class="table-container shadow-sm border-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th>CUSTOMER</th>
                            <th>CONTACT INFO</th>
                            <th>MODE</th>
                            <th>PLAN</th>
                            <th>SCHEDULE</th>
                            <th>STATUS</th>
                            <th>ADMIN REMARK</th>
                            <th class="text-end">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody id="appointmentsBody">
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Fetching appointment records...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Details Modal -->
    <div class="modal fade" id="detailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold" id="remarkModalTitle">
                        <i class="bi bi-chat-left-text-fill text-primary me-2"></i>Add Remark
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4" id="detailsBody">
                    <!-- Loaded via JS -->
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-light px-4 border" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary px-4" id="saveRemarkBtn">Add Remark</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        const API_BASE = "../../index.php?path=";
        let currentPlan = 'all';
        let currentSingleDate = null;

        document.addEventListener('DOMContentLoaded', () => {
            initPlanTabs();
            generateDateCarousel();
            loadAppointments();
        });

        function initPlanTabs() {
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentPlan = tab.dataset.plan;
                    loadAppointments();
                });
            });
        }

        function generateDateCarousel() {
            const container = document.getElementById('dateCarousel');
            const today = new Date();
            const daysPast = 30; // Show last 30 days
            const daysFuture = 30; // Show next 30 days
            
            container.innerHTML = '';
            
            // Add "All Dates" option
            const allItem = document.createElement('div');
            allItem.className = 'date-item'; // Removed 'active'
            allItem.innerHTML = `<span class="day-label">Show</span><span class="date-label">All Dates</span>`;
            allItem.onclick = () => selectDate(null, allItem);
            container.appendChild(allItem);

            let todayElement = null;
            let todayIso = today.toISOString().split('T')[0];

            for (let i = -daysPast; i <= daysFuture; i++) {
                const date = new Date();
                date.setDate(today.getDate() + i);
                
                const dateIso = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateDisplay = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                const isToday = i === 0;

                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                if (isToday) {
                    dateItem.id = 'todayDateItem';
                    todayElement = dateItem;
                }
                dateItem.innerHTML = `
                    ${isToday ? '<span class="today-badge">Today</span>' : ''}
                    <span class="day-label">${dayName}</span>
                    <span class="date-label">${dateDisplay}</span>
                `;
                dateItem.onclick = () => selectDate(dateIso, dateItem);
                container.appendChild(dateItem);
            }

            // Select today by default
            if (todayElement) {
                selectDate(todayIso, todayElement);
            }

            // Scroll today into view after a short delay to ensure rendering
            setTimeout(() => {
                if (todayElement) {
                    todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 100);
        }

        function selectDate(date, element) {
            document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
            element.classList.add('active');
            currentSingleDate = date;
            
            // Clear manual date range if a carousel date is picked
            if (date) {
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
            }
            
            loadAppointments();
        }

        function scrollDates(direction) {
            const container = document.getElementById('dateCarousel');
            const scrollAmount = 300;
            container.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        }

        async function loadAppointments() {
            const tb = document.getElementById('appointmentsBody');
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            let url = API_BASE + "api/appointments/list";
            url += `&plan=${currentPlan}`;
            
            if (currentSingleDate) {
                url += `&single_date=${currentSingleDate}`;
            } else if (startDate || endDate) {
                if (startDate) url += `&start_date=${startDate}`;
                if (endDate) url += `&end_date=${endDate}`;
            }

            try {
                const res = await fetch(url);
                const json = await res.json();
                
                if (json.error || json.success === false) {
                    showAlert(json.error || 'Failed to fetch data', 'danger');
                    tb.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-danger">Error: ${json.error || 'Unknown error'}</td></tr>`;
                    return;
                }
                
                renderAppointments(json.data || []);
            } catch (err) {
                showAlert('Failed to connect to server', 'danger');
                tb.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-danger">Network error: Could not connect to API</td></tr>`;
                console.error(err);
            }
        }

        function resetFilters() {
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            currentPlan = 'all';
            currentSingleDate = null;
            
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.filter-tab[data-plan="all"]').classList.add('active');
            
            document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
            document.querySelector('.date-item').classList.add('active');
            
            loadAppointments();
        }


        function renderAppointments(data) {
            const tb = document.getElementById('appointmentsBody');
            tb.innerHTML = '';
            
            if (!data.length) {
                tb.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">No appointments found for the selected criteria.</td></tr>';
                return;
            }
            
            data.forEach(item => {
                const tr = document.createElement('tr');
                
                // Status Badge Logic
                let statusBadge = '';
                if (item.meeting_confirm == 'confirmed') {
                    statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i> Confirmed</span>';
                } else if (item.meeting_confirm == 'not_confirmed') {
                    statusBadge = '<span class="badge bg-secondary">Pending</span>';
                } else if (item.meeting_confirm == '1') {
                    statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i> Confirmed</span>';
                } else {
                    statusBadge = '<span class="badge bg-secondary">Pending</span>';
                }

                // Mode Badge
                const modeClass = item.mode?.toLowerCase() === 'online' ? 'bg-info' : 'bg-warning text-dark';
                
                tr.innerHTML = `
                    <td>
                        <div class="fw-bold text-dark">${escapeHtml(item.name)}</div>
                        <div class="small text-muted mb-1">${escapeHtml(item.email)}</div>
                        <span class="badge bg-light text-dark border-0 p-1 px-2" style="font-size: 0.7rem;">
                            <i class="bi bi-hash me-1"></i>${escapeHtml(item.reference_id || 'N/A')}
                        </span>
                    </td>
                    <td>
                        <div class="small"><i class="bi bi-telephone text-muted me-1"></i> ${escapeHtml(item.contact)}</div>
                        <div class="small text-truncate" style="max-width: 150px;"><i class="bi bi-geo-alt text-muted me-1"></i> ${escapeHtml(item.address)}</div>
                    </td>
                    <td><span class="badge ${modeClass}">${escapeHtml(item.mode || 'N/A')}</span></td>
                    <td><span class="text-dark fw-medium">${escapeHtml(item.selected_plan || 'N/A')}</span></td>
                    <td>
                        <div class="fw-medium text-dark">${escapeHtml(item.date)}</div>
                        <div class="small text-muted">${escapeHtml(item.time_slot)}</div>
                    </td>
                    <td>
                        ${statusBadge}
                        <div class="small text-muted mt-1" style="font-size: 0.75rem;">${escapeHtml(item.updated_status || '')}</div>
                    </td>
                    <td>
                        <div class="small text-muted text-wrap" style="max-width: 200px;">
                            ${escapeHtml(item.admin_remark) || '<i class="text-light-emphasis">No remark</i>'}
                        </div>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm ${item.admin_remark ? 'btn-outline-primary' : 'btn-primary'} shadow-sm" onclick='showRemarkPopup(${JSON.stringify(item).replace(/'/g, "&apos;")})' style="border-radius: 6px; min-width: 110px;">
                            <i class="bi ${item.admin_remark ? 'bi-pencil-square' : 'bi-plus-circle'} me-1"></i>
                            ${item.admin_remark ? 'Update Remark' : 'Add Remark'}
                        </button>
                    </td>
                `;
                tb.appendChild(tr);
            });
        }

        async function saveRemark(id) {
            const remark = document.getElementById('adminRemarkInput').value;
            const btn = document.getElementById('saveRemarkBtn');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

            try {
                const res = await fetch(API_BASE + "api/appointments/update-remark", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, remark })
                });
                const json = await res.json();
                
                if (json.success) {
                    showAlert('Remark updated successfully', 'success');
                    bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();
                    loadAppointments();
                } else {
                    showAlert(json.error || 'Failed to update remark', 'danger');
                }
            } catch (err) {
                showAlert('Network error occurred', 'danger');
                console.error(err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }

        function showRemarkPopup(item) {
            const body = document.getElementById('detailsBody');
            const saveBtn = document.getElementById('saveRemarkBtn');
            const modalTitle = document.getElementById('remarkModalTitle');
            const hasRemark = !!item.admin_remark;
            
            modalTitle.innerHTML = `<i class="bi ${hasRemark ? 'bi-pencil-square' : 'bi-plus-circle'} text-primary me-2"></i>${hasRemark ? 'Update Remark' : 'Add Remark'}`;
            saveBtn.innerHTML = hasRemark ? 'Update Remark' : 'Add Remark';
            saveBtn.onclick = () => saveRemark(item.id);

            body.innerHTML = `
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 h-100">
                            <label class="text-muted small text-uppercase fw-bold mb-2 d-block">Customer Details</label>
                            <h5 class="fw-bold mb-1">${escapeHtml(item.name)}</h5>
                            <p class="mb-1 text-muted small"><i class="bi bi-envelope me-2"></i>${escapeHtml(item.email)}</p>
                            <p class="mb-1 text-muted small"><i class="bi bi-telephone me-2"></i>${escapeHtml(item.contact)}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 h-100">
                            <label class="text-muted small text-uppercase fw-bold mb-2 d-block">Appointment</label>
                            <p class="mb-1 small"><strong>Date:</strong> ${escapeHtml(item.date)}</p>
                            <p class="mb-1 small"><strong>Slot:</strong> ${escapeHtml(item.time_slot)}</p>
                            <p class="mb-0 small"><strong>REF ID:</strong> <code class="text-primary">${escapeHtml(item.reference_id)}</code></p>
                        </div>
                    </div>
                    
                    <div class="col-md-12">
                        <div class="p-3 border-start border-4 border-primary bg-white shadow-sm rounded-3">
                            <label class="text-primary small text-uppercase fw-bold mb-2 d-block">Admin Remark</label>
                            <textarea id="adminRemarkInput" class="form-control border-0 bg-light" rows="4" placeholder="Type your internal notes here...">${escapeHtml(item.admin_remark || '')}</textarea>
                        </div>
                    </div>
                </div>
            `;
            const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
            modal.show();
        }

        function showAlert(msg, type) {
            const container = document.getElementById('alertPlaceholder');
            container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show shadow-sm border-0 d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div class="flex-grow-1">${msg}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        }

        function escapeHtml(s) {
            if (!s) return '';
            return String(s).replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            })[m]);
        }

        // Initial load
        // Already handled by DOMContentLoaded event above
    </script>
</body>
</html>
