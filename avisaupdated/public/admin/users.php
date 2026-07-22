<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}
$active = 'users';
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Manage Users - Admin</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <link rel="stylesheet" href="../assets/css/admin-users.css">
</head>

<body>

    <?php include __DIR__ . '/../layout/sidebar.php'; ?>

    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>
        
        <div class="page-header">
            <h3><i class="bi bi-people"></i> Manage Users</h3>
            <button class="btn btn-create" data-bs-toggle="modal" data-bs-target="#createUserModal">
                <i class="bi bi-person-plus"></i> Create User
            </button>
        </div>

        <div id="usersAlert"></div>

        <div class="table-container">
            <table class="table table-hover" id="usersTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersBody">
                    <tr>
                        <td colspan="7">
                            <div class="text-center py-3">
                                <div class="loading-spinner" style="border-color: #e2e8f0; border-top-color: #667eea;"></div>
                                <p class="mt-2 text-muted">Loading users...</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Create User Modal -->
    <div class="modal fade" id="createUserModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <form id="createUserForm" class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="bi bi-person-plus-fill"></i> Create New User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-person"></i> Full Name</label>
                        <input name="name" class="form-control" placeholder="Enter full name" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-envelope"></i> Email</label>
                        <input name="email" type="email" class="form-control" placeholder="user@example.com" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-telephone"></i> Phone</label>
                        <input name="phone" class="form-control" placeholder="Enter phone number" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-shield-check"></i> Role</label>
                        <select name="role" class="form-select">
                            <option value="employee" selected>Employee</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-create" id="createBtn">
                        <i class="bi bi-check-circle"></i> Create User
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        const API_BASE = "../../index.php?path=";

        function showUsersAlert(msg, type = 'info') {
            const iconMap = {
                'success': 'check-circle-fill',
                'danger': 'x-circle-fill',
                'warning': 'exclamation-triangle-fill',
                'info': 'info-circle-fill'
            };
            
            document.getElementById('usersAlert').innerHTML = `
                <div class="alert alert-${type}">
                    <i class="bi bi-${iconMap[type]}"></i>
                    <div>${msg}</div>
                </div>
            `;
            setTimeout(() => document.getElementById('usersAlert').innerHTML = '', 5000);
        }

        async function loadUsers() {
            try {
                const res = await fetch(API_BASE + "api/users/list");
                const json = await res.json();
                if (json.error) {
                    showUsersAlert(json.error, 'danger');
                    return;
                }
                const users = json.users || json.data || [];
                renderUsers(users);
            } catch (err) {
                showUsersAlert('Failed to load users', 'danger');
                console.error(err);
            }
        }

        function renderUsers(users) {
            const tb = document.getElementById('usersBody');
            tb.innerHTML = '';
            if (!users.length) {
                tb.innerHTML = `<tr><td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-people"></i>
                        <p>No users found</p>
                    </div>
                </td></tr>`;
                return;
            }
            users.forEach(u => {
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                const roleClass = `role-${u.role}`;
                const statusClass = (u.status === 'active' || !u.status) ? 'status-active' : 'status-inactive';
                const statusText = u.status || 'active';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
            <td><strong>#${escapeHtml(u.id)}</strong></td>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${initials}</div>
                    <strong>${escapeHtml(u.name)}</strong>
                </div>
            </td>
            <td><i class="bi bi-envelope"></i> ${escapeHtml(u.email)}</td>
            <td>${u.phone ? `<i class="bi bi-telephone"></i> ${escapeHtml(u.phone)}` : '<span class="text-muted">—</span>'}</td>
            <td><span class="role-badge ${roleClass}">${escapeHtml(u.role)}</span></td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(statusText)}</span></td>
            <td>
                <button class="btn btn-action btn-sm btn-outline-primary" onclick="resetPassword(${u.id})" title="Reset Password">
                    <i class="bi bi-key"></i>
                </button>
                <button class="btn btn-action btn-sm btn-outline-danger" onclick="deactivateUser(${u.id})" title="Deactivate User">
                    <i class="bi bi-person-x"></i>
                </button>
            </td>
        `;
                tb.appendChild(tr);
            });
        }

        function escapeHtml(s) {
            if (s === null || s === undefined) return '';
            return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
        }

        // Create user
        document.getElementById('createUserForm').onsubmit = async function(e) {
            e.preventDefault();
            
            const createBtn = document.getElementById('createBtn');
            const originalText = createBtn.innerHTML;
            createBtn.disabled = true;
            createBtn.innerHTML = '<span class="loading-spinner"></span> Creating...';
            
            const form = new FormData(this);

            const name = form.get('name').trim();
            const email = form.get('email').trim();
            if (!name || !email) {
                showUsersAlert('Name and email are required', 'warning');
                createBtn.disabled = false;
                createBtn.innerHTML = originalText;
                return;
            }

            const post = new URLSearchParams();
            post.append('name', name);
            post.append('email', email);
            post.append('phone', form.get('phone') || '');
            post.append('role', form.get('role') || 'employee');

            try {
                const res = await fetch(API_BASE + "api/users/create", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: post
                });

                const text = await res.text();
                console.log('Raw response:', text);
                
                let j;
                try {
                    j = JSON.parse(text);
                } catch (parseErr) {
                    console.error('JSON parse error:', parseErr);
                    console.error('Response text:', text);
                    showUsersAlert('Server returned invalid response. Check console for details.', 'danger');
                    createBtn.disabled = false;
                    createBtn.innerHTML = originalText;
                    return;
                }

                if (!j.success) {
                    showUsersAlert(j.error || 'Failed to create user', 'danger');
                    createBtn.disabled = false;
                    createBtn.innerHTML = originalText;
                    return;
                }

                let msg = `✓ User created successfully!<br>`;
                msg += `<strong>Temporary Password:</strong> <code style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${j.temp_password}</code><br>`;
                msg += `<strong>Email Status:</strong> ${j.email_status || 'Not sent'}`;

                showUsersAlert(msg, "success");

                // Close modal and refresh users
                const modalEl = document.getElementById('createUserModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                document.getElementById('createUserForm').reset();
                await loadUsers();
                
            } catch (err) {
                console.error('Full error:', err);
                showUsersAlert('Network error: ' + err.message, 'danger');
            } finally {
                createBtn.disabled = false;
                createBtn.innerHTML = originalText;
            }
        };

        // user actions (stubs)
        async function resetPassword(userId) {
            if (!confirm('Reset password for this user? A new temporary password will be generated.')) return;
            showUsersAlert('Password reset functionality is not yet implemented in the API.', 'info');
        }

        async function deactivateUser(userId) {
            if (!confirm('Deactivate this user? They will no longer be able to access the system.')) return;
            showUsersAlert('User deactivation is not yet implemented in the API.', 'info');
        }

        // initial load
        loadUsers();
    </script>

</body>

</html>