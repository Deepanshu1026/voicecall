<?php
require_once __DIR__ . '/../app/helpers/session.php';

// If already logged in, redirect
if (isset($_SESSION['user_id'])) {
    $role = $_SESSION['role'];
    if ($role === 'admin') {
        header("Location: admin/index.php");
    } elseif ($role === 'manager') {
        header("Location: manager/index.php");
    } elseif ($role === 'employee') {
        header("Location: employee/index.php");
    }
    else if ($role === 'agent') {
     header("Location: agent/index.php");
    }
    else{
        header("Location: login.php");
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Avisa Experts Portal</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <style>
        :root {
            --primary-bg: #ffffff;
            --grid-color: #f1f3f5;
            --btn-dark-green: #06231d;
            --text-navy: #0a1d37;
            --text-gray: #4b5563;
            --accent-green: #d1fae5;
            --accent-green-text: #065f46;
            --border-color: #e5e7eb;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--primary-bg);
            background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
            background-size: 50px 50px;
            color: var(--text-navy);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            position: relative;
            overflow: hidden;
        }

        /* Decorative Bubbles */
        .bubble {
            position: absolute;
            background: #fff;
            padding: 10px 16px;
            border-radius: 50px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            font-weight: 600;
            z-index: -1;
            animation: float 6s ease-in-out infinite;
            border: 1px solid #f3f4f6;
        }

        .bubble img {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        .bubble-1 { top: 15%; left: 10%; animation-delay: 0s; }
        .bubble-2 { top: 25%; right: 10%; animation-delay: 1s; }
        .bubble-3 { bottom: 20%; left: 15%; animation-delay: 2s; }
        .bubble-4 { bottom: 25%; right: 15%; animation-delay: 3s; }

        .login-card {
            width: 100%;
            max-width: 440px;
            text-align: center;
            background: rgba(255, 255, 255, 0);
            backdrop-filter: blur(1px);
            padding: 40px;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.5);
            /* box-shadow: 0 20px 40px rgba(0,0,0,0.03); */
        }

        .badge-process {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff;
            border: 1px solid var(--border-color);
            padding: 6px 14px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-navy);
            margin-bottom: 24px;
        }

        .badge-process i {
            color: #0d9488;
        }

        .login-header h1 {
            font-size: 46px;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 12px;
            letter-spacing: -1px;
        }

        .login-header p {
            font-size: 15px;
            color: var(--text-gray);
            margin-bottom: 32px;
        }

        .form-group {
            margin-bottom: 12px;
            text-align: left;
        }

        .input-wrapper {
            position: relative;
            background: #f9fafb;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
            background: #fff;
            border-color: var(--btn-dark-green);
            box-shadow: 0 0 0 4px rgba(6, 35, 29, 0.05);
        }

        .form-control-custom {
            background: transparent;
            border: none;
            color: var(--text-navy);
            padding: 16px;
            width: 100%;
            font-size: 15px;
            outline: none;
            font-weight: 500;
        }

        .form-control-custom::placeholder {
            color: #9ca3af;
        }

        .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
        }

        .password-toggle:hover {
            color: var(--text-navy);
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            margin-bottom: 32px;
            font-size: 14px;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-gray);
            cursor: pointer;
            font-weight: 500;
        }

        .remember-me input {
            width: 18px;
            height: 18px;
            border-radius: 4px;
            cursor: pointer;
            accent-color: var(--btn-dark-green);
        }

        .forgot-link {
            color: #555;
            text-decoration: none;
            font-weight: 500;
        }

        .forgot-link:hover {
            color: var(--btn-dark-green);
        }

        .btn-continue {
            width: 100%;
            background-color: var(--btn-dark-green);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(6, 35, 29, 0.2);
        }

        .btn-continue:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(6, 35, 29, 0.3);
            background-color: #0a3d34;
        }

        .btn-continue:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        /* Spinner */
        .spinner {
            width: 22px;
            height: 22px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Alert */
        .alert-custom {
            background: #fff;
            border: 1px solid #fee2e2;
            color: #ef4444;
            padding: 14px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-size: 14px;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
            display: none;
        }

        /* Loader Overlay */
        .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }

        .loader-overlay.active {
            display: flex;
        }
    </style>
</head>
<body>

    <!-- Decorative Elements -->
    <div class="bubble bubble-1">
        <img src="https://i.pravatar.cc/100?u=1" alt="User">
        <span>Visa Approved!</span>
    </div>
    <div class="bubble bubble-2">
        <img src="https://i.pravatar.cc/100?u=2" alt="User">
        <span>Doc Verified</span>
    </div>
    <div class="bubble bubble-3">
        <img src="https://i.pravatar.cc/100?u=3" alt="User">
        <span>Case Filed</span>
    </div>
    <div class="bubble bubble-4">
        <img src="https://i.pravatar.cc/100?u=4" alt="User">
        <span>Need Help?</span>
    </div>

    <div class="loader-overlay" id="loaderOverlay">
        <div class="spinner mb-3" style="width: 48px; height: 48px; border-width: 4px; border-top-color: var(--btn-dark-green);"></div>
        <p style="font-weight: 600; color: var(--text-navy);">Signing you in...</p>
    </div>

    <div class="login-card">
        <div class="badge-process">
            <i class="bi bi-lightning-fill"></i> Fast & Secure Process
        </div>

        <div class="login-header">
            <h1>Login to Your Dashboard</h1>
            <p>Empowering your visa journey with intelligence.</p>
        </div>

        <div id="alertBox" class="alert-custom">
            <i class="bi bi-exclamation-circle-fill"></i>
            <span id="alertMsg"></span>
        </div>

        <form id="loginForm">
            <div class="form-group">
                <div class="input-wrapper">
                    <input type="text" name="email" class="form-control-custom" placeholder="Username or Email" required>
                </div>
            </div>

            <div class="form-group">
                <div class="input-wrapper">
                    <input type="password" name="password" id="password" class="form-control-custom" placeholder="Password" required>
                    <button type="button" class="password-toggle" id="togglePassword">
                        <i class="bi bi-eye-slash" id="toggleIcon"></i>
                    </button>
                </div>
            </div>

            <div class="form-options">
                <label class="remember-me">
                    <input type="checkbox" name="remember"> Remember me
                </label>
                <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn-continue" id="loginBtn">Continue</button>
        </form>

        <div style="margin-top: 32px; font-size: 13px; color: #9ca3af; font-weight: 500;">
            © 2026 Avisa Experts. Professional Case Management.
        </div>
    </div>

    <script>
        // Password toggle
        document.getElementById('togglePassword').addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = document.getElementById('toggleIcon');
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            } else {
                password.type = 'password';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            }
        });

        const alertBox = document.getElementById('alertBox');
        const alertMsg = document.getElementById('alertMsg');
        
        function showAlert(msg) {
            alertMsg.innerText = msg;
            alertBox.style.display = 'flex';
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 5000);
        }

        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const overlay = document.getElementById('loaderOverlay');
            
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span>';
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/avisaupdated/index.php?path=api/login', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    showAlert(data.error);
                    btn.disabled = false;
                    btn.innerHTML = 'Continue';
                } else if (data.success) {
                    overlay.classList.add('active');
                    setTimeout(() => {
                        const role = data.user.role;
                        if (role === 'admin') window.location.href = 'admin/index.php';
                        else if (role === 'manager') window.location.href = 'manager/index.php';
                        else if (role === 'agent') window.location.href = 'agent/index.php';
                        else window.location.href = 'employee/index.php';
                    }, 1000);
                }
            } catch (err) {
                showAlert("Network error. Try again.");
                btn.disabled = false;
                btn.innerHTML = 'Continue';
            }
        });
    </script>
</body>
</html>
