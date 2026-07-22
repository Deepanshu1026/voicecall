<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();
require_role('agent');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Dashboard - Chat</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --text-light: #f8fafc;
            --text-muted: #94a3b8;
            --border: #334155;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 1rem 2rem;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary);
        }
        
        .logout {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s;
        }
        
        .logout:hover {
            color: var(--text-light);
        }

        .chat-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
            width: 300px;
            background: var(--bg-card);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
        }

        .sidebar-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .new-chat-form {
            display: flex;
            gap: 0.5rem;
        }

        .new-chat-input {
            background: #334155;
            border: none;
            padding: 0.5rem;
            border-radius: 6px;
            color: white;
            width: 100%;
            font-size: 0.9rem;
        }

        .new-chat-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .new-chat-btn:hover {
            background: var(--primary-dark);
        }

        .conversation-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
        }

        .conversation-item {
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
            margin-bottom: 0.25rem;
            color: var(--text-light);
        }

        .conversation-item:hover {
            background: #334155;
        }

        .conversation-item.active {
            background: var(--primary);
        }
        
        .conversation-name {
            font-weight: 500;
            font-size: 0.95rem;
            margin-bottom: 0.2rem;
        }
        
        .conversation-role {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .conversation-item.active .conversation-role {
            color: #e0e7ff;
        }

        /* Chat Area */
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: var(--bg-dark);
            background-image: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
        }
        
        .chat-placeholder {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            font-size: 1.2rem;
            font-weight: 500;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message {
            max-width: 70%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.5;
            position: relative;
            word-wrap: break-word;
        }

        .message.sent {
            background: var(--primary);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }

        .message.received {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-light);
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        
        .message-time {
            font-size: 0.7rem;
            opacity: 0.7;
            margin-top: 4px;
            text-align: right;
        }

        .chat-input-area {
            padding: 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border);
            display: flex;
            gap: 1rem;
        }

        .chat-input {
            flex: 1;
            background: #334155;
            border: 1px solid transparent;
            padding: 0.75rem 1rem;
            border-radius: 20px;
            color: white;
            font-size: 0.95rem;
            outline: none;
            transition: border 0.2s;
        }

        .chat-input:focus {
            border-color: var(--primary);
        }

        .send-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0 1.5rem;
            border-radius: 20px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }

        .send-btn:hover {
            background: var(--primary-dark);
        }

        .voice-call-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .voice-call-btn:hover {
            background: linear-gradient(135deg, #059669, #047857);
            transform: translateY(-1px);
        }

        .voice-call-btn:disabled {
            background: #475569;
            cursor: not-allowed;
            transform: none;
        }

        .loader {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 3px solid var(--primary);
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .spinning-icon {
            animation: spin 1s linear infinite;
            transform-origin: center;
        }

        .loader-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }

        .unread-badge {
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .breadcrumb-nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
        }
        
        .breadcrumb-link {
            color: var(--text-muted);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            transition: color 0.2s;
        }
        
        .breadcrumb-link:hover {
            color: var(--primary);
        }
        
        .breadcrumb-separator {
            color: var(--border);
        }
        
        .breadcrumb-current {
            color: var(--text-light);
            font-weight: 600;
        }

        /* Profile Panel */
        .profile-panel {
            width: 300px;
            background: var(--bg-card);
            border-left: 1px solid var(--border);
            display: none;
            flex-direction: column;
            overflow-y: auto;
        }
        
        .profile-header {
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 1px solid var(--border);
        }
        
        .profile-avatar {
            width: 80px;
            height: 80px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 600;
            margin: 0 auto 1rem;
        }
        
        .profile-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .profile-role {
            color: var(--text-muted);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .profile-body {
            padding: 1.5rem;
        }
        
        .profile-item {
            margin-bottom: 1.5rem;
        }
        
        .profile-label {
            color: var(--text-muted);
            font-size: 0.8rem;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
            display: block;
        }
        
        .profile-value {
            color: var(--text-light);
            font-weight: 500;
            word-break: break-word;
        }
        
        .badge-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .status-inactive { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        /* Context Menu */
        .context-menu {
            display: none;
            position: absolute;
            background: #1e293b; /* --bg-card */
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px;
            min-width: 200px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        }

        .context-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: var(--text-light);
            cursor: pointer;
            border-radius: 8px;
            font-size: 0.95rem;
            transition: background 0.2s;
            font-weight: 500;
        }

        .context-menu-item:hover {
            background: #334155;
        }

        .context-menu-item svg {
            width: 20px;
            height: 20px;
            stroke: var(--text-muted);
            stroke-width: 2px;
        }
        
        .context-menu-item:hover svg {
            stroke: var(--text-light);
        }
        
        /* New Sidebar Styles */
        .search-container {
            margin-top: 1rem;
            position: relative;
        }
        
        .search-input {
            width: 100%;
            background: #0f172a;
            border: 1px solid var(--border);
            padding: 0.6rem 0.8rem 0.6rem 2.2rem; /* space for icon */
            border-radius: 8px;
            color: var(--text-light);
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s;
        }
        
        .search-input:focus {
            border-color: var(--primary);
        }
        
        .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
        }

        .filter-tabs {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-bottom: 0.5rem;
        }
        
        .filter-tab {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            cursor: pointer;
            border-radius: 20px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .filter-tab.active {
            background: var(--primary);
            color: white;
        }
        
        .filter-tab:hover:not(.active) {
            background: rgba(255,255,255,0.05);
            color: var(--text-light);
        }

        .conversation-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.9rem;
            border-radius: 12px;
            margin-bottom: 4px;
            border: 1px solid transparent;
        }
        
        .conversation-item:hover {
            background: rgba(51, 65, 85, 0.5);
            border-color: rgba(255,255,255,0.05);
        }
        
        .conversation-item.active {
            background: var(--primary); /* Keep primary logic or change to card style */
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-color: transparent;
        }

        .user-avatar-small {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(45deg, #475569, #64748b);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
            flex-shrink: 0;
            text-transform: uppercase;
        }
        
        .conversation-info {
            flex: 1;
            overflow: hidden;
        }
        
        .conversation-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
        }

        .conversation-name {
            font-weight: 600;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .conversation-role {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: capitalize;
            display: block;
        }
        
        .conversation-item.active .conversation-role {
            color: rgba(255,255,255,0.7);
        }


        
        .msg-status {
            display: inline-block;
            margin-left: 5px;
            vertical-align: text-bottom;
        }
        .msg-status svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }
        /* Default double tick (grey) */
        .tick-sent { color: #94a3b8; }
        /* Read double tick (blue) */
        .tick-read { color: #3b82f6; }

        /* Date Divider */
        .date-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1.5rem 0;
            position: relative;
        }
        
        .date-divider::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: var(--border);
            z-index: 1;
        }
        
        .date-divider span {
            background: var(--bg-card);
            color: var(--text-muted);
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            position: relative;
            z-index: 2;
            border: 1px solid var(--border);
        }
		  /* Custom Scrollbar Design */
        .conversation-list::-webkit-scrollbar,
        .chat-messages::-webkit-scrollbar,
        .profile-panel::-webkit-scrollbar {
            width: 6px;
        }
        
        .conversation-list::-webkit-scrollbar-track,
        .chat-messages::-webkit-scrollbar-track,
        .profile-panel::-webkit-scrollbar-track {
            background: transparent; 
        }

        .conversation-list::-webkit-scrollbar-thumb,
        .chat-messages::-webkit-scrollbar-thumb,
        .profile-panel::-webkit-scrollbar-thumb {
            background: #334155; /* Matches border/input bg */
            border-radius: 10px;
        }

        .conversation-list::-webkit-scrollbar-thumb:hover,
        .chat-messages::-webkit-scrollbar-thumb:hover,
        .profile-panel::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }
        
        /* Firefox */
        .conversation-list,
        .chat-messages,
        .profile-panel {
            scrollbar-width: thin;
            scrollbar-color: #334155 transparent;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="breadcrumb-nav">
            <a href="index.php" class="breadcrumb-link" title="Back to Dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Dashboard
            </a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">Chat</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
            <button id="voiceCallBtn" class="voice-call-btn" onclick="startVoiceCall()" title="Open voice call dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Start Voice Call
            </button>
            <span>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?></span>
            <span style="color: var(--border);">|</span>
            <a href="../logout.php" class="logout">Logout</a>
        </div>
    </div>

    <div class="chat-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                
                <div class="search-container">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search..." onkeyup="filterConversations()">
                </div>
                
                <div class="filter-tabs">
                    <button class="filter-tab active" id="tabAll" onclick="setFilter('all')">All</button>
                    <button class="filter-tab" id="tabUnread" onclick="setFilter('unread')">Unread</button>
                </div>
            </div>
            <div class="conversation-list" id="conversationList">
                <!-- Loaded via JS -->
                <div id="convLoader" class="loader" style="display: none;"></div>
            </div>
        </div>

        <!-- Chat Area -->
        <div class="chat-area">
            <div id="chatPlaceholder" class="chat-placeholder">
                Select a conversation to start messaging
            </div>
            <div id="chatMessages" class="chat-messages" style="display: none;">
                <!-- Loaded via JS -->
            </div>
            <div id="chatLoader" class="loader-overlay" style="display: none;">
                <div class="loader"></div>
            </div>
            <div class="chat-input-area" id="inputArea" style="display: none;">
                <label for="fileInput" class="attach-btn" title="Attach file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </label>
                <input type="file" id="fileInput" style="display: none;" onchange="handleFileSelect(this)">
                <div id="fileNamePreview" style="display:none; color: var(--text-muted); font-size: 0.8rem; align- self: center;"></div>
                
                <input type="text" id="messageInput" class="chat-input" placeholder="Type a message..." onkeypress="handleKeyPress(event)">
                <button class="send-btn" onclick="sendMessage()">Send</button>
            </div>
        </div>

        <!-- Profile Panel -->
        <div class="profile-panel" id="profilePanel">
            <div id="profileContent" style="display:none;">
                <div class="profile-header">
                    <div class="profile-avatar" id="pAvatar">U</div>
                    <div class="profile-name" id="pName">User</div>
                    <div class="profile-role" id="pRole">Role</div>
                </div>
                <div class="profile-body">
                    <div class="profile-item">
                        <span class="profile-label">Email</span>
                        <div class="profile-value" id="pEmail">-</div>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Phone</span>
                        <div class="profile-value" id="pPhone">-</div>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Joined On</span>
                        <div class="profile-value" id="pDate">-</div>
                    </div>
                </div>
            </div>
            <div id="profileLoader" class="loader" style="margin-top: 50px;"></div>
        </div>
    </div>

    <!-- Custom Context Menu -->
    <div id="contextMenu" class="context-menu">
        <div class="context-menu-item" onclick="toggleSelectionMode()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Cancle
        </div>
        <div class="context-menu-item" onclick="closeCurrentChat()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Close chat
        </div>
    </div>

    <script>
        let currentChatId = null;
        let pollingInterval = null;
        let allConversations = []; // Store locally for filtering
        let currentFilter = 'all'; // 'all' or 'unread'

        document.addEventListener('DOMContentLoaded', () => {
            loadConversations(false);
            // Poll for new conversations every 10 seconds
            setInterval(() => loadConversations(true), 10000);
        });
        
        function setFilter(type) {
            currentFilter = type;
            document.getElementById('tabAll').classList.toggle('active', type === 'all');
            document.getElementById('tabUnread').classList.toggle('active', type === 'unread');
            renderList();
        }
        
        function filterConversations() {
            renderList();
        }

        function handleFileSelect(input) {
            const preview = document.getElementById('fileNamePreview');
            if (input.files && input.files[0]) {
                preview.textContent = input.files[0].name;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }

        async function loadConversations(background = false) {
            const list = document.getElementById('conversationList');
            const loader = document.getElementById('convLoader');
            
            if (!background) {
               // Show loader only if list is empty (initial load)
               if (list.children.length <= 1) loader.style.display = 'block'; 
            }

            try {
                const response = await fetch('/api/chat/get_conversations.php');
                const data = await response.json();
                
                // Clear loader
                loader.style.display = 'none';
                
                if (data.conversations) {
                    allConversations = data.conversations;
                    renderList();
                } else {
                    allConversations = [];
                    renderList();
                }
                
                // Keep loader for future use logic (preserved from original code style)
                if(!list.contains(loader)) list.appendChild(loader);

            } catch (err) {
                console.error("Error loading conversations", err);
                if(loader) loader.style.display = 'none';
            }
        }
        
        function renderList() {
            const list = document.getElementById('conversationList');
            const loader = document.getElementById('convLoader');
            const query = document.getElementById('searchInput').value.toLowerCase();
            
            // Detach loader to preserve it
            if(loader) loader.remove();
            
            // Filter logic
            let filtered = allConversations.filter(c => {
                const matchName = c.name.toLowerCase().includes(query);
                const matchUnread = currentFilter === 'unread' ? c.unread > 0 : true;
                return matchName && matchUnread;
            });

            let html = '';
            
            if (filtered.length > 0) {
                filtered.forEach(conv => {
                    const activeClass = currentChatId === conv.id ? 'active' : '';
                    const initials = (conv.name || 'U').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                    
                    let badge = '';
                    if (conv.unread > 0) {
                        badge = `<div class="unread-badge">${conv.unread}</div>`;
                    }
                    
                    html += `
                    <div class="conversation-item ${activeClass}" onclick="openChat(${conv.id}, '${conv.name.replace(/'/g, "\\'")}')">
                        <div class="user-avatar-small">${initials}</div>
                        <div class="conversation-info">
                            <div class="conversation-top">
                                <span class="conversation-name">${conv.name}</span>
                                ${badge}
                            </div>
                            <span class="conversation-role">${conv.role}</span>
                        </div>
                    </div>`;
                });
            } else {
                html = '<div style="color:var(--text-muted); text-align:center; padding:2rem 1rem; font-size:0.9rem;">No conversations found</div>';
            }
            
            list.innerHTML = html;
            if(loader) list.appendChild(loader);
        }

        function startNewChat() {
            const id = document.getElementById('newChatId').value;
            if (!id) return;
            openChat(parseInt(id), 'User ' + id);
            document.getElementById('newChatId').value = '';
        }
        function openChat(userId, userName) {
            currentChatId = userId;
            document.getElementById('chatPlaceholder').style.display = 'none';
            document.getElementById('chatMessages').style.display = 'flex';
            document.getElementById('inputArea').style.display = 'flex';
            
            document.getElementById('profilePanel').style.display = 'flex';
            document.getElementById('profileLoader').style.display = 'block'; // Show loader initially
            document.getElementById('profileContent').style.display = 'none';
            
            // Clear inputs
            document.getElementById('fileInput').value = '';
            document.getElementById('fileNamePreview').style.display = 'none';
            document.getElementById('messageInput').value = '';
            
            loadConversations(); // Re-render to highlight active class
            
            // Initial load: fetch messages AND profile AND mark as read in one go
            loadMessages(false, true);
            
            if (pollingInterval) clearInterval(pollingInterval);
            pollingInterval = setInterval(() => loadMessages(true, false), 3000);
        }

        async function loadMessages(background = false, initialLoad = false) {
            if (!currentChatId) return;
            
            const loader = document.getElementById('chatLoader');
            if (!background) {
                loader.style.display = 'flex';
                document.getElementById('chatMessages').style.display = 'flex'; 
            }
            
            try {
                // Pass flags for profile and mark_read
                let url = `/api/chat/get_messages.php?user_id=${currentChatId}`;
                if (initialLoad) {
                    url += '&include_profile=true&mark_read=true';
                }
                
                const response = await fetch(url);
                const data = await response.json();
                
                const container = document.getElementById('chatMessages');
                
                // --- HANDLE PROFILE (if returned) ---
                if (data.user_profile) {
                    renderUserProfile(data.user_profile);
                }
                
                // --- HANDLE READ MARK (if happened) ---
                if (data.read_marked) {
                    loadConversations(true); // Update unread badges silently
                }

                // --- HANDLE MESSAGES ---
                container.innerHTML = '';
                
                if (data.messages && data.messages.length > 0) {
                    const myId = <?php echo $_SESSION['user_id']; ?>;
                    let lastDate = null;

                    data.messages.forEach(msg => {
                        // Date Separator Logic
                        const msgDate = new Date(msg.created_at);
                        const dateStr = msgDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                        
                        if (dateStr !== lastDate) {
                            const dateDiv = document.createElement('div');
                            dateDiv.className = 'date-divider';
                            
                            // Check if date is today
                            const today = new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                            
                            let displayDate = dateStr;
                            if (dateStr === today) displayDate = 'Today';
                            else if (dateStr === yesterday) displayDate = 'Yesterday';
                            
                            dateDiv.innerHTML = `<span>${displayDate}</span>`;
                            container.appendChild(dateDiv);
                            lastDate = dateStr;
                        }

                        const div = document.createElement('div');
                        const isMe = parseInt(msg.sender_id) === myId;
                        div.className = `message ${isMe ? 'sent' : 'received'}`;
                        
                        let content = `<div class="msg-text">${msg.message}</div>`;
                        
                        if (msg.file_path) {
                            const ext = msg.file_path.split('.').pop().toLowerCase();
                            let url = msg.file_path;
                            if (!url.startsWith('http') && !url.startsWith('//')) {
                                url = 'https://avisaexperts.com/' + url;
                            }
                            
                            if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                                content += `<div class="msg-attachment"><img src="${url}" style="max-width:200px; border-radius:4px; margin-top:5px;"></div>`;
                            } else {
                                content += `<div class="msg-attachment"><a href="${url}" target="_blank" style="color:inherit; text-decoration:underline;">View Attachment (${ext})</a></div>`;
                            }
                        }
                        
                        
                        let tickHtml = '';
                        if (isMe) {
                            const isRead = (msg.is_read === 'yes' || msg.status === 'Read');
                            const tickClass = isRead ? 'tick-read' : 'tick-sent';
                            // Double tick icon (Material 'done_all')
                            tickHtml = `<span class="msg-status ${tickClass}" title="${isRead ? 'Read' : 'Sent'}">
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                                </svg>
                            </span>`;
                        }

                        div.innerHTML = `${content}<div class="message-time">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${tickHtml}</div>`;
                        container.appendChild(div);
                    });
                }
                
                if (!background) container.scrollTop = container.scrollHeight;
                
            } catch (err) {
                console.error(err);
            } finally {
                if (!background) loader.style.display = 'none';
            }
        }
        
        function renderUserProfile(u) {
            const container = document.getElementById('profileContent');
            const loader = document.getElementById('profileLoader');
            
            document.getElementById('pName').innerText = u.name || 'Unknown';
            document.getElementById('pRole').innerText = u.role || 'User';
            
            const avatarEl = document.getElementById('pAvatar');
            if (u.user_profile) {
                let pUrl = u.user_profile;
                if (!pUrl.startsWith('http') && !pUrl.startsWith('//')) {
                        pUrl = 'https://avisaexperts.com/' + pUrl;
                }
                avatarEl.innerText = '';
                avatarEl.style.backgroundImage = `url('${pUrl}')`;
                avatarEl.style.backgroundSize = 'cover';
                avatarEl.style.backgroundPosition = 'center';
            } else {
                avatarEl.style.backgroundImage = 'none';
                avatarEl.innerText = (u.name || 'U').charAt(0).toUpperCase();
            }
            
            document.getElementById('pEmail').innerText = u.email || '-';
            document.getElementById('pPhone').innerText = u.phone || '-';
            document.getElementById('pDate').innerText = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
            
            loader.style.display = 'none';
            container.style.display = 'block';
        }


        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const fileInput = document.getElementById('fileInput');
            const text = input.value.trim();
            
            if ((!text && (!fileInput.files || fileInput.files.length === 0)) || !currentChatId) return;
            
            const formData = new FormData();
            formData.append('receiver_id', currentChatId);
            formData.append('message', text); // Can be empty if file usually, but DB might require it? user schema allowed message text.
            
            // Should fill sender_id because existing code might check it? 
            // Update: We updated send_message.php to use SESSION, but user code accepts POST.
            // We don't need to append sender_id, PHP handles it.
            
            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }
            
            try {
                const res = await fetch('/api/chat/send_message.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await res.json();
                if (result.success) {
                    input.value = '';
                    fileInput.value = '';
                    document.getElementById('fileNamePreview').style.display = 'none';
                    loadMessages();

                    setTimeout(() => {
                        fetch("https://avisaexperts.com/chat_noti.php")
                            .then(() => console.log("Notification API called after 2s"))
                            .catch((err) => console.error("Notification Error:", err));
                    }, 2000);
                } else {
                    alert('Error sending message: ' + (result.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        }

        async function startVoiceCall() {
            const btn = document.getElementById('voiceCallBtn');
            if (btn.disabled) return;

            btn.disabled = true;
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning-icon">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
                </svg>
                Connecting...
            `;

            try {
                const response = await fetch('/index.php?path=api/voice/bridge');
                const responseText = await response.text();
                let data;

                try {
                    data = JSON.parse(responseText);
                } catch (parseErr) {
                    console.error('Invalid JSON response:', responseText);
                    alert('Server error (not JSON). HTTP ' + response.status + '. Check if you are logged in.');
                    return;
                }

                if (data.success && data.dashboard_url) {
                    window.open(data.dashboard_url, '_blank', 'noopener,noreferrer');
                } else {
                    alert('Could not open voice dashboard: ' + (data.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Connection error while opening voice dashboard: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Start Voice Call
                `;
            }
        }

        function handleKeyPress(e) {
            if (e.key === 'Enter') sendMessage();
        }

        // Context Menu Logic
        const contextMenu = document.getElementById('contextMenu');
        const chatArea = document.querySelector('.chat-area');

        // Prevent default right click on chat area and show custom menu
        chatArea.addEventListener('contextmenu', (e) => {
            // Only show if a chat is actually open
            if (!currentChatId) return;

            e.preventDefault();
            
            const x = e.clientX;
            const y = e.clientY;
            
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.style.display = 'block';
        });

        // Close menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (contextMenu.style.display === 'block') {
                contextMenu.style.display = 'none';
            }
        });

        function closeCurrentChat() {
            if (!currentChatId) return;
            
            // Clear current chat
            currentChatId = null;
            if (pollingInterval) clearInterval(pollingInterval);
            
            // Reset UI
            document.getElementById('chatMessages').style.display = 'none';
            document.getElementById('inputArea').style.display = 'none';
            document.getElementById('chatPlaceholder').style.display = 'flex';
            
            // Hide profile
            document.getElementById('profilePanel').style.display = 'none';
            
            // Remove active class from sidebar
            document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
            
            // Hide menu
            contextMenu.style.display = 'none';
        }

        function toggleSelectionMode() {
            // Placeholder for 'Select messages' functionality
            console.log("Selection mode activated");
            contextMenu.style.display = 'none';
        }



    </script>
</body>
</html>