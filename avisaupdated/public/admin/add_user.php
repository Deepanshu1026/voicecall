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
    <title>Add New User - Admin</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <link rel="stylesheet" href="../assets/css/admin-users.css">
    <style>
        .form-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 500;
            color: #374151;
        }
    </style>
</head>

<body>

    <?php include __DIR__ . '/../layout/sidebar.php'; ?>

    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>
        
        <div class="container-fluid p-4">
            <div class="page-header d-flex align-items-center mb-4">
                <a href="users.php" class="btn btn-outline-secondary me-3">
                    <i class="bi bi-arrow-left"></i> Back to Users
                </a>
                <h3 class="m-0"><i class="bi bi-person-plus"></i> Add New User</h3>
            </div>

            <div id="usersAlert"></div>

            <div class="form-card">
                <form id="createUserForm">
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
                        <select name="role" class="form-select" required>
                            <option value="employee" selected>Employee</option>
                            <option value="manager">Manager</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div class="pt-3">
                        <button type="submit" class="btn btn-create w-100 justify-content-center py-2" id="createBtn">
                            <i class="bi bi-check-circle"></i> Create User
                        </button>
                    </div>
                </form>
            </div>
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
                <div class="alert alert-${type} alert-dismissible fade show">
                    <i class="bi bi-${iconMap[type]} me-2"></i>
                    ${msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            // Auto hide after 5 seconds if generic info, but keep success/error a bit longer or until dismissed
            if(type === 'info') {
                setTimeout(() => {
                    const alertNode = document.querySelector('.alert');
                    if(alertNode) {
                        const alert = bootstrap.Alert.getOrCreateInstance(alertNode);
                        alert.close();
                    }
                }, 5000);
            }
        }

        // Create user
        document.getElementById('createUserForm').onsubmit = async function(e) {
            e.preventDefault();
            
            const createBtn = document.getElementById('createBtn');
            const originalText = createBtn.innerHTML;
            createBtn.disabled = true;
            createBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
            
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

                let msg = `<strong>User created successfully!</strong><br>`;
                msg += `Temporary Password: <code>${j.temp_password}</code><br>`;
                msg += `Email Status: ${j.email_status || 'Not sent'}`;

                showUsersAlert(msg, "success");

                document.getElementById('createUserForm').reset();
                
            } catch (err) {
                console.error('Full error:', err);
                showUsersAlert('Network error: ' + err.message, 'danger');
            } finally {
                createBtn.disabled = false;
                createBtn.innerHTML = originalText;
            }
        };
    </script>

</body>

</html>
