<?php
require_once __DIR__ . '/../app/helpers/session.php';
// Allow all authenticated users
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Adjust paths based on location or valid roles
// This file is in public/internal_chat.php
// But we might need to handle includes carefully if they expect to be in a subdirectory
// Sidebar expects to be included from a file in public/something/
// Let's stick to standard layout includes: __DIR__ . '/layout/...'
$active = 'chat'; 
$role = $_SESSION['role'] ?? 'guest';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Internal Chat - Avisa</title>  
    <link rel="manifest" href="manifest.json">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- We might need role-specific CSS or just a general one -->
    <link rel="stylesheet" href="assets/css/layout.css">
    <style>
        /* General Layout Fixes for shared page */
        body { background: #f1f5f9; }
        .content {
            margin-left: 16.66667%; /* matches col-2 */
            width: 83.33333%;
            padding: 20px;
        }
        @media (max-width: 768px) {
            .content { margin-left: 0; width: 100%; }
        }

        /* Chat Specific Styles */
        .chat-container {
            display: flex;
            height: calc(100vh - 100px); 
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .users-list {
            width: 300px;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            background: #f8fafc;
        }
        .users-header {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
        }
        .users-scroll {
            flex-grow: 1;
            overflow-y: auto;
        }
        .user-item {
            padding: 12px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .user-item:hover {
            background: #e2e8f0;
        }
        .user-item.active {
            background: #cbd5e1;
            font-weight: 600;
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        .chat-area {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        .chat-header {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
            background: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-messages {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
            background: #fdfdfd;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message-bubble {
            max-width: 70%;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            position: relative;
        }
        .message-sent {
            align-self: flex-end;
            background: #6366f1;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .message-received {
            align-self: flex-start;
            background: #e2e8f0;
            color: #1e293b;
            border-bottom-left-radius: 2px;
        }
        .message-info {
            font-size: 0.7rem;
            margin-top: 4px;
            opacity: 0.8;
            text-align: right;
        }
        .message-sender {
            font-size: 0.7rem;
            font-weight: 600;
            margin-bottom: 2px;
            color: #6366f1;
        }
        .chat-input-area {
            padding: 15px;
            border-top: 1px solid #e2e8f0;
            background: #fff;
            display: flex;
            gap: 10px;
        }
        .chat-input {
            flex-grow: 1;
            border-radius: 20px;
            padding-left: 15px;
            border: 1px solid #cbd5e1;
        }
        .chat-input:focus {
            outline: none;
            border-color: #6366f1;
        }
    </style>
</head>
<body>

<?php include __DIR__ . '/layout/sidebar.php'; ?>

<div class="content">
    <?php include __DIR__ . '/layout/topbar.php'; ?>

    <div class="container-fluid pb-5 mt-4">
        <h3>Internal Chat</h3>
        <p class="text-muted mb-4">Chat with the team or broadcast messages.</p>

        <div class="chat-container">
            <!-- Sidebar -->
            <div class="users-list">
                <div class="users-header">Contacts</div>
                <div class="users-scroll" id="usersList">
                    <!-- Avisaexperts  -->
                    <div class="user-item active" onclick="selectUser(null, this)">
                        <div class="user-avatar" style="background: #f59e0b;"><i class="bi bi-megaphone-fill"></i></div>
                        <div>Avisaexperts </div>
                    </div>
                </div>
            </div>

            <!-- Chat Area -->
            <div class="chat-area">
                <div class="chat-header">
                    <span id="chatTitle">Avisaexperts </span>
                    <small class="text-muted" id="chatSubtitle">Visible to everyone</small>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="text-center text-muted mt-5">Loading messages...</div>
                </div>
                
                <div class="chat-input-area">
                    <input type="text" class="form-control chat-input" id="messageInput" placeholder="Type a message..." onkeypress="handleEnter(event)">
                    <button class="btn btn-primary rounded-circle" onclick="sendMessage()">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
    const API_BASE = '/avisaupdated/api/groupchat/';
    let currentReceiverId = null; // null = Broadcast
    let lastMessageId = 0;
    let pollingInterval = null;

    // Load users on start
    loadUsers();

    // Initial load of broadcast messages
    startPolling();

    async function loadUsers() {
        try {
            const res = await fetch(API_BASE + 'users.php');
            const data = await res.json();
            if (data.success && data.users) {
                const list = document.getElementById('usersList');
                // Keep the broadcast item
                list.innerHTML = `
                    <div class="user-item active" onclick="selectUser(null, this)">
                        <div class="user-avatar" style="background: #f59e0b;"><i class="bi bi-megaphone-fill"></i></div>
                        <div>Avisaexperts </div>
                    </div>
                `;
                
                data.users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'user-item';
                    div.onclick = () => selectUser(user.id, div, user.name);
                    div.innerHTML = `
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div class="d-flex flex-column">
                            <span>${user.name}</span>
                            <small class="text-muted" style="font-size:0.7em">${user.role || 'User'}</small>
                        </div>
                    `;
                    list.appendChild(div);
                });
            }
        } catch (e) {
            console.error('Failed to load users', e);
        }
    }

    function selectUser(userId, element, name = 'Avisaexperts ') {
        currentReceiverId = userId;
        
        // Update UI
        document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        
        document.getElementById('chatTitle').innerText = name;
        document.getElementById('chatSubtitle').innerText = userId ? 'Private Chat' : 'Visible to everyone';
        
        // Reset Chat
        document.getElementById('chatMessages').innerHTML = '<div class="text-center text-muted mt-5">Loading...</div>';
        lastMessageId = 0;
        
        // Restart Polling
        clearInterval(pollingInterval);
        startPolling();
    }

    function startPolling() {
        fetchMessages();
        pollingInterval = setInterval(fetchMessages, 3000);
    }

    async function fetchMessages() {
        try {
            let url = API_BASE + 'get.php?last_id=' + lastMessageId;
            if (currentReceiverId) {
                url += '&receiver_id=' + currentReceiverId;
            } else {
                 url += '&receiver_id=null';
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                const container = document.getElementById('chatMessages');
                
                // If it was the first load and we have messages, clear the loading spinner
                if (lastMessageId === 0) {
                     container.innerHTML = '';
                     if (data.messages.length === 0) {
                         container.innerHTML = '<div class="text-center text-muted mt-5">No messages yet. Say hi!</div>';
                     }
                }

                if (data.messages.length > 0) {
                    
                    // Remove "No messages" text if present
                    if (container.innerText.includes('No messages yet')) {
                        container.innerHTML = '';
                    }

                    data.messages.forEach(msg => {
                        const div = document.createElement('div');
                        div.className = `message-bubble ${msg.is_me ? 'message-sent' : 'message-received'}`;
                        
                        let senderHtml = '';
                        if (!msg.is_me && !currentReceiverId) {
                            senderHtml = `<div class="message-sender">${msg.sender_name}</div>`;
                        }

                        div.innerHTML = `
                            ${senderHtml}
                            ${renderAttachment(msg)}
                            <div>${msg.message}</div>
                            <div class="message-info">${msg.time_formatted}</div>
                        `;
                        container.appendChild(div);
                        lastMessageId = msg.id;
                    });
                    
                    // Scroll to bottom
                    container.scrollTop = container.scrollHeight;
                }
            }
        } catch (e) {
            console.error('Fetch error', e);
        }
    }

    function renderAttachment(msg) {
        if (!msg.attachment) return '';
        
        const ext = msg.attachment.split('.').pop().toLowerCase();
        const fullPath = '/avisaupdated/' + msg.attachment;
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return `
                <div class="mb-2">
                    <a href="${fullPath}" target="_blank">
                        <img src="${fullPath}" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(0,0,0,0.1);">
                    </a>
                </div>`;
        } else {
            return `
                <div class="mb-2">
                    <a href="${fullPath}" target="_blank" class="d-flex align-items-center gap-2 p-2 bg-light rounded text-decoration-none text-dark" style="border: 1px solid rgba(0,0,0,0.1);">
                        <i class="bi bi-file-earmark-text" style="font-size: 1.5rem; color: #4f46e5;"></i>
                        <span style="font-size: 0.85rem; text-decoration: underline;">Download ${ext.toUpperCase()}</span>
                    </a>
                </div>`;
        }
    }

    async function sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';

        try {
            const res = await fetch(API_BASE + 'send.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    receiver_id: currentReceiverId
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchMessages(); 
            } else {
                alert('Failed to send: ' + data.error);
            }
        } catch (e) {
            alert('Error sending message');
        }
    }

    function handleEnter(e) {
        if (e.key === 'Enter') sendMessage();
    }
</script>

</body>
</html>
