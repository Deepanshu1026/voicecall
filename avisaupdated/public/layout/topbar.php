<div class="container-fluid">
    <nav class="navbar navbar-light bg-white shadow-sm px-4 d-flex justify-content-between align-items-center">
        <span class="navbar-text">
            Welcome, <strong><?= htmlspecialchars($_SESSION['user_name']) ?></strong>
        </span>

        <button onclick="openChatModal()" class="btn btn-dark d-flex align-items-center gap-2 position-relative" style="background: #202c33; border: none;">
            <i class="bi bi-chat-dots-fill text-success"></i> 
            <span>Internal Chat</span>
            <span class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle" id="badge-topbar-internal-chat" style="display:none; font-size: 0.7rem;">0</span>
        </button>
    </nav>
</div>

<?php include __DIR__ . '/chat_popup.php'; ?>
