<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php $pwaPath = 'public/'; include __DIR__ . '/public/layout/pwa_head.php'; ?>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <style>
        :root {
            --primary: #022c22; /* Dark green like reference */
            --accent: #10b981; /* Lighter green for accents */
            --text-main: #111827;
            --text-muted: #4b5563;
            --bg-white: #ffffff;
            --grid-color: #e5e7eb;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }

        body {
            background-color: var(--bg-white);
            color: var(--text-main);
            overflow-x: hidden;
            position: relative;
        }

        /* --- Grid Background --- */
        .grid-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: -1;
            /* Fade edges */
            mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }

        /* --- Navbar --- */
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 80px;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            background: transparent;
            /* backdrop-filter: blur(12px); */
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo-img {
            height: 100px;
            width: auto;
        }

        .nav-links {
            display: flex;
            gap: 32px;
        }

        .nav-link {
            text-decoration: none;
            color: var(--text-main);
            font-size: 15px;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-link:hover {
            color: var(--primary);
        }

        .nav-actions {
            display: flex;
            gap: 16px;
            align-items: center;
        }

        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
        }

        .btn-ghost {
            background: transparent;
            color: var(--text-main);
            border: 1px solid #e5e7eb;
        }
        .btn-ghost:hover {
            background: #f9fafb;
            border-color: #d1d5db;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            border: 1px solid var(--primary);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn-primary:hover {
            background: #064e3b; /* Darker green */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        /* --- Hero Section --- */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 120px 20px 60px;
            position: relative;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: white;
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid #e5e7eb;
            font-size: 12px;
            font-weight: 700;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 32px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            animation: slideDown 0.8s ease-out;
        }
        
        .hero-badge i { font-size: 14px; }

        .hero h1 {
            font-size: 4.5rem;
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -2px;
            color: var(--text-main);
            margin-bottom: 24px;
            max-width: 900px;
            position: relative;
            animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero-highlight {
            position: relative;
            display: inline-block;
        }
        
        .hero-highlight::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 6px;
            width: 100%;
            height: 14px;
            background: #dcfce7; /* Light green highlight */
            z-index: -1;
            transform: skewX(-12deg);
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin-bottom: 48px;
            line-height: 1.6;
            animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .hero-ctas {
            display: flex;
            gap: 16px;
            animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .btn-large {
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 12px;
        }

        /* --- Floating Avatars --- */
        .avatar-float {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: float 6s ease-in-out infinite;
            z-index: 2;
        }

        /* Cursor Icon */
        .cursor-icon {
            width: 24px;
            height: 24px;
            position: absolute;
            z-index: 10;
        }
        
        .user-pill {
             display: flex;
             align-items: center;
             gap: 8px;
             background: white;
             padding: 4px 12px 4px 4px;
             border-radius: 30px;
             box-shadow: 0 4px 20px rgba(0,0,0,0.08);
             border: 1px solid #f3f4f6;
             transition: transform 0.3s;
        }
        
        .user-pill:hover {
            transform: scale(1.05);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid white;
        }
        
        .user-name {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-main);
        }

        /* Positions for avatars */
        .av-1 { top: 20%; left: 15%; animation-delay: 0s; }
        .av-2 { top: 25%; right: 18%; animation-delay: 2s; }
        .av-3 { bottom: 25%; left: 20%; animation-delay: 4s; }
        .av-4 { bottom: 30%; right: 15%; animation-delay: 1s; }

        /* Cursor positioning relative to avatar */
        .av-1 .cursor-icon { top: 30px; left: 30px; transform: rotate(-10deg); color: #EA580C; }
        .av-2 .cursor-icon { bottom: -15px; left: -15px; transform: rotate(80deg); color: #2563EB; } 
        .av-3 .cursor-icon { top: -15px; right: -15px; transform: rotate(-90deg); color: #16A34A; }
        .av-4 .cursor-icon { bottom: 20px; left: -20px; transform: rotate(15deg); color: #DB2777; }


        /* --- Logos Section --- */
        .logos-section {
            padding: 40px 20px 80px;
            text-align: center;
            animation: fadeIn 1.5s ease-out;
        }
        
        .logos-title {
            font-size: 14px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 30px;
        }

        .logos-container {
            display: flex;
            justify-content: center;
            gap: 60px;
            opacity: 0.6;
            flex-wrap: wrap;
        }
        
        .company-logo {
            height: 24px;
            filter: grayscale(100%);
            transition: all 0.3s;
        }
        
        .company-logo:hover {
            filter: grayscale(0%);
            opacity: 1;
            transform: scale(1.1);
        }


        /* --- Animations --- */
        @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }

        @media (max-width: 1024px) {
            .hero h1 { font-size: 3.5rem; }
            .avatar-float { display: none; } /* Hide floating elements on smaller screens */
        }
        
        @media (max-width: 768px) {
            nav { padding: 20px; flex-direction: column; gap: 15px; }
            .nav-links { display: none; }
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.1rem; }
            .hero-ctas { flex-direction: column; width: 100%; max-width: 300px; }
            .logos-container { gap: 30px; }
        }
    </style>
</head>
<body>

    <div class="grid-background"></div>

    <!-- Navigation -->
    <nav>
        <div class="logo-container">
            <img src="assets/images/avelogo.png" alt="A Visa Experts" class="logo-img">
        </div>
        


        <div class="nav-actions">
            <a href="public/login.php" class="btn btn-ghost">Log In</a>
            <a href="https://avisaexperts.com/" target="_blank" class="btn btn-primary">Visit Our Website</a>
        </div>
    </nav>

    <!-- Floating Avatars -->
    <div class="avatar-float av-1">
        <div class="user-pill">
            <img src="https://i.pravatar.cc/150?img=33" class="user-avatar" alt="User">
            <span class="user-name">Visa Approved!</span>
        </div>
        <svg class="cursor-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3.21l12.32 7.03c2.37 1.35 1.55 4.93-1.12 5.09l-3.32.2 2.63 6.13-.93.39-2.63-6.13-2.58 2.58c-2.18 2.18-5.78-.15-5.32-3.16l1.37-12.13z"/></svg>
    </div>

    <div class="avatar-float av-2">
        <div class="user-pill">
            <img src="https://i.pravatar.cc/150?img=47" class="user-avatar" alt="User">
            <span class="user-name">Doc Verified</span>
        </div>
        <svg class="cursor-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3.21l12.32 7.03c2.37 1.35 1.55 4.93-1.12 5.09l-3.32.2 2.63 6.13-.93.39-2.63-6.13-2.58 2.58c-2.18 2.18-5.78-.15-5.32-3.16l1.37-12.13z"/></svg>
    </div>

    <div class="avatar-float av-3">
        <div class="user-pill">
            <img src="https://i.pravatar.cc/150?img=12" class="user-avatar" alt="User">
            <span class="user-name">Case Filed</span>
        </div>
        <svg class="cursor-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3.21l12.32 7.03c2.37 1.35 1.55 4.93-1.12 5.09l-3.32.2 2.63 6.13-.93.39-2.63-6.13-2.58 2.58c-2.18 2.18-5.78-.15-5.32-3.16l1.37-12.13z"/></svg>
    </div>

    <div class="avatar-float av-4">
        <div class="user-pill">
             <img src="https://i.pravatar.cc/150?img=68" class="user-avatar" alt="User">
            <span class="user-name">Need Help?</span>
        </div>
        <svg class="cursor-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3.21l12.32 7.03c2.37 1.35 1.55 4.93-1.12 5.09l-3.32.2 2.63 6.13-.93.39-2.63-6.13-2.58 2.58c-2.18 2.18-5.78-.15-5.32-3.16l1.37-12.13z"/></svg>
    </div>


    <!-- Hero Content -->
    <main class="hero">
        <div class="hero-badge">
            <i class="bi bi-lightning-fill"></i>
            FAST & SECURE PROCESS
        </div>

        <h1>One tool to manage<br>
            <span class="hero-highlight">visa applications</span> and your team
        </h1>
        
        <p>
            A Visa Experts helps you navigate the complex world of immigration 
            faster, smarter, and more efficiently. Delivering the visibility 
            and data-driven insights to ensure compliance.
        </p>

        <div class="hero-ctas">
            <a href="public/login.php"  class="btn btn-primary btn-large">Login Your Dashoard</a>
        </div>
    </main>



</body>
</html>