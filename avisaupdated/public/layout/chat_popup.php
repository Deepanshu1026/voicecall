<!-- Chat Popup Modal -->
<div id="internalChatModal" class="chat-modal-overlay" style="display: none;">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <div class="chat-modal-content">
        <div class="chat-modal-body">
            <!-- Sidebar -->
            <div class="chat-sidebar">
                <div class="chat-sidebar-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-dark">Chats</h5>
                        <div>
                            <button class="btn btn-icon btn-sm text-secondary"><i class="bi bi-plus-lg"></i></button>
                            <button class="btn btn-icon btn-sm text-secondary"><i class="bi bi-three-dots-vertical"></i></button>
                        </div>
                    </div>
                    <div class="mt-3 search-box">
                        <i class="bi bi-search"></i>
                        <input type="text" placeholder="Search" id="chatUserSearch" oninput="filterChatUsers()">
                    </div>
                    <div class="filter-slider-container mt-3 position-relative">
                        <div class="slider-fade fade-start d-none" id="fadeStart"></div>
                        <button class="filter-nav-btn prev-btn d-none" id="filterPrevBtn" onclick="scrollFilters(-1)">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        
                        <div class="d-flex gap-2 flex-nowrap overflow-auto py-2 px-1" id="chatRoleFilters" style="white-space: nowrap; scrollbar-width: none; scroll-behavior: smooth;">
                             <span class="badge rounded-pill filter-chip active-filter px-3 py-2 cursor-pointer flex-shrink-0" onclick="filterByRole('all', this)">All</span>
                             <span class="badge rounded-pill filter-chip px-3 py-2 cursor-pointer flex-shrink-0" onclick="filterByRole('calling_team', this)">Calling Team</span>
                             <span class="badge rounded-pill filter-chip px-3 py-2 cursor-pointer flex-shrink-0" onclick="filterByRole('employee', this)">Filing Team</span>
                             <span class="badge rounded-pill filter-chip px-3 py-2 cursor-pointer flex-shrink-0" onclick="filterByRole('manager', this)">Manager</span>
                             <span class="badge rounded-pill filter-chip px-3 py-2 cursor-pointer flex-shrink-0" onclick="filterByRole('admin', this)">Admin</span>
                        </div>
                        
                        <div class="slider-fade fade-end" id="fadeEnd"></div>
                        <button class="filter-nav-btn next-btn" id="filterNextBtn" onclick="scrollFilters(1)">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="chat-users-list" id="chatUsersList">
                    <!-- Users will be loaded here -->
                </div>
            </div>

            <!-- Chat Area -->
            <div class="chat-main">
                <!-- Welcome State -->
                <div id="chatWelcomeState" class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <img src="/assets/images/avelogo.png" alt="Avisa Logo" class="mb-4 welcome-logo">
                    <h4 class="text-dark mb-2">Avisa Internal Chat</h4>
                    <p class="text-secondary">Send and receive messages internally.</p>
                </div>

                <!-- Active Chat -->
                <div id="chatActiveState" class="d-none flex-column h-100">
                    <div class="chat-main-header">
                        <div class="d-flex align-items-center gap-3">
                            <div class="user-avatar-sm" id="activeChatAvatar">A</div>
                            <div>
                                <h6 class="mb-0 text-dark" id="activeChatName">User Name</h6>
                                <small class="text-secondary" id="activeChatRole">Role</small>
                            </div>
                        </div>
                        <div class="d-flex gap-3">
                             <button class="btn btn-icon text-secondary" onclick="closeChatModal()"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                    
                    <div class="chat-messages-area" id="modalChatMessages">
                        <!-- Messages -->
                    </div>

                    <div class="chat-input-wrapper">
                        <!-- Attachment Menu Trigger -->
                        <div class="position-relative">
                            <button class="btn btn-icon text-secondary" id="attachMenuBtn" onclick="toggleAttachMenu()">
                                <i class="bi bi-plus-lg"></i>
                            </button>
                            
                            <!-- WhatsApp Style Attachment Menu -->
                            <div class="attach-menu" id="attachMenu">
                                <div class="attach-menu-item" onclick="document.getElementById('chatFileInput').click()"> <!-- Simplified to click file input directly for now, or use wrapper logic if we want specific types later -->
                                    <div class="attach-icon icon-doc">
                                        <i class="bi bi-file-earmark-text-fill"></i>
                                    </div>
                                    <span class="menu-label">Document</span>
                                </div>
                                <div class="attach-menu-item" onclick="document.getElementById('chatFileInput').click()">
                                    <div class="attach-icon icon-photo">
                                        <i class="bi bi-image-fill"></i>
                                    </div>
                                    <span class="menu-label">Photos & videos</span>
                                </div>
                            </div>
                        </div>

                        <input type="file" id="chatFileInput" multiple style="display: none;" onchange="handleFileSelect(this)">

                        <div class="chat-input-bar">
                            <button class="btn btn-icon text-secondary"><i class="bi bi-emoji-smile"></i></button>
                            <input type="text" class="chat-input-field" id="modalMessageInput" placeholder="Type a message" onkeypress="handleModalEnter(event)">
                        </div>
                        
                        <button class="btn btn-icon text-secondary" onclick="sendModalMessage()">
                             <i class="bi bi-send-fill text-primary"></i> 
                        </button>
                    </div>
                    <!-- WhatsApp Style Full Screen Preview Modal -->
                    <div id="filePreviewModal" class="file-preview-overlay" style="display: none;">
                        <!-- Header -->
                        <div class="preview-header">
                            <button class="btn btn-icon text-white" onclick="closeFilePreview()"><i class="bi bi-x-lg"></i></button>
                            <span class="preview-title" id="previewTitle">Filename.pdf</span>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="preview-body">
                            <div id="previewContentContainer">
                                <!-- Image or Iframe will go here -->
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="preview-footer">
                            <div class="preview-input-container">
                                <input type="text" id="previewCaptionInput" placeholder="Type a message" onkeypress="if(event.key==='Enter') sendFileFromPreview()">
                                <button class="btn btn-icon text-secondary"><i class="bi bi-emoji-smile"></i></button>
                            </div>
                            
                            <div class="preview-thumbnails">
                                <div class="thumb-item active" id="previewThumb">
                                    <!-- Thumb content -->
                                </div>
                                <div class="thumb-add" onclick="document.getElementById('chatFileInput').click()">
                                    <i class="bi bi-plus"></i>
                                </div>
                            </div>

                            <div class="preview-send-btn" onclick="sendFileFromPreview()">
                                <i class="bi bi-send-fill"></i>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- Custom Context Menu -->
<div id="chatContextMenu" class="chat-context-menu">
    <div class="context-item" onclick="closeActiveConversation()">
        <i class="bi bi-x-circle text-danger"></i> 
        <span>Close Conversation</span>
    </div>
    <div class="context-item" onclick="document.getElementById('chatContextMenu').style.display='none'">
        <i class="bi bi-slash-circle"></i> 
        <span>Cancel</span>
    </div>
</div>

<!-- Toast Notification Container -->
<div id="chatToast" class="chat-toast">
    <div class="chat-toast-icon">
        <i class="bi bi-trash"></i>
    </div>
    <div class="chat-toast-content">
        <div style="font-weight: 600; font-size: 0.95rem;">Deleted</div>
        <div style="font-size: 0.8rem; opacity: 0.8;">Message has been deleted</div>
    </div>
</div>


<style>
    /* Dark Theme Variables */
    /* Dark Theme Variables - Avisa Brand (Slate/Indigo) */
    /* Light Theme Variables - Avisa Brand (Light) */
    :root {
        --chat-bg-dark: #f1f5f9;
        --chat-sidebar-bg: #ffffff;
        --chat-header-bg: #ffffff;
        --chat-input-bg: #f1f5f9;
        --chat-text-primary: #1e293b;
        --chat-text-secondary: #64748b;
        --chat-border: #e2e8f0;
        --chat-green-sent: #4f46e5;
        --chat-tick-read: #3b82f6;
        --chat-overlay-bg: rgba(0,0,0,0.5);
    }
    
    .filter-chip {
        background-color: #f1f5f9;
        color: var(--chat-text-secondary);
        border: 1px solid var(--chat-border);
        transition: all 0.2s;
    }
    
    .filter-chip:hover {
        background-color: #e2e8f0;
    }

    .active-filter {
        background-color: var(--chat-green-sent) !important;
        color: #fff !important;
        border-color: var(--chat-green-sent) !important;
    }
    
    /* Hide scrollbar for Chrome, Safari and Opera */
    #chatRoleFilters::-webkit-scrollbar {
        display: none;
    }

    .chat-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--chat-overlay-bg);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(2px);
    }

    .chat-modal-content {
        width: 90%;
        max-width: 1100px;
        height: 85vh;
        background: var(--chat-bg-dark);
        border-radius: 0;
        overflow: hidden;
        box-shadow: 0 0 50px rgba(0,0,0,0.5);
        display: flex;
        color: var(--chat-text-primary);
        font-family: 'Outfit', sans-serif;
    }

    .chat-modal-body {
        display: flex;
        width: 100%;
        height: 100%;
    }

    /* Sidebar */
    .chat-sidebar {
        width: 30%;
        min-width: 300px;
        background: var(--chat-sidebar-bg);
        border-right: 1px solid var(--chat-border);
        display: flex;
        flex-direction: column;
    }

    .chat-sidebar-header {
        padding: 16px;
        /* height: 60px; */
    }

    .search-box {
        background: var(--chat-bg-dark);
        border-radius: 8px;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .search-box input {
        background: transparent;
        border: none;
        color: var(--chat-text-primary);
        width: 100%;
        outline: none;
        font-size: 0.9rem;
    }
    .search-box input::placeholder { color: var(--chat-text-secondary); }
    .search-box i { color: var(--chat-text-secondary); }

    .chat-users-list {
        flex: 1;
        overflow-y: auto;
    }

    .chat-user-item {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 15px;
        cursor: pointer;
        border-bottom: 1px solid var(--chat-border);
        transition: background 0.2s;
        position: relative;
    }
    .chat-user-item:hover { background: var(--chat-input-bg); }
    .chat-user-item.active { background: var(--chat-input-bg); }

    .user-avatar-lg {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: #6366f1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: white;
        flex-shrink: 0;
    }

    /* Main Chat */
    .chat-main {
        flex: 1;
        background: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); /* Pattern */
        background-color: #e2e8f0;
        background-blend-mode: overlay;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    
    .chat-main::before {
        content: '';
        position: absolute;
        top:0; left:0; right:0; bottom:0;
        background: var(--chat-bg-dark);
        opacity: 0.95;
        pointer-events: none;
    }
    .chat-main > * { position: relative; z-index: 2; }

    .chat-main-header {
        background: var(--chat-header-bg);
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
    }

    .user-avatar-sm {
        width: 35px;
        height: 35px;
        background: #6366f1;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
    }

    .chat-messages-area {
        flex: 1;
        overflow-y: auto;
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .chat-input-wrapper {
        background: var(--chat-header-bg);
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .chat-input-field {
        flex: 1;
        background: var(--chat-input-bg);
        border: none;
        border-radius: 8px;
        padding: 9px 12px;
        color: var(--chat-text-primary);
        outline: none;
    }

    /* UI Refinement: Bubbles & Spacing */
    .msg-bubble {
        max-width: 70%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 0.92rem;
        line-height: 1.5;
        position: relative;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08); /* Softer shadow */
        word-wrap: break-word;
    }

    .msg-delete-btn {
        width: 28px;
        height: 28px;
        background: #ffffff;
        border: 1px solid var(--chat-border);
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--chat-text-secondary);
        font-size: 0.85rem;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin: 0 8px;
    }
    .msg-row:hover .msg-delete-btn {
        display: flex;
    }
    .msg-delete-btn:hover {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fecaca;
        transform: scale(1.1);
    }
    
    /* Sent: Top-Right rounded, clean Indigo */
    .msg-sent {
        align-self: flex-end;
        background: var(--chat-green-sent);
        color: #fff;
        border-bottom-right-radius: 2px;
    }
    
    /* Received: Top-Left rounded, clear white/slate */
    .msg-received {
        align-self: flex-start;
        background: #ffffff; /* Explicit white for pop */
        color: var(--chat-text-primary);
        border: 1px solid rgba(0,0,0,0.05); /* Subtle border */
        border-bottom-left-radius: 2px;
    }

    .msg-meta {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
        opacity: 0.8;
    }
    
    .msg-time {
        font-size: 0.65rem;
        color: inherit; /* Inherit from bubble text color */
        opacity: 0.7;
    }

    /* Date Divider */
    .chat-date-divider {
        display: flex;
        justify-content: center;
        margin: 20px 0;
        position: relative;
    }
    .chat-date-divider span {
        background: #f1f5f9;
        color: #64748b;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    /* Input Area Polish */
    .chat-input-wrapper {
        border-top: 1px solid var(--chat-border);
        padding: 12px 16px;
        background: #ffffff;
    }
    
    .chat-input-field {
        background: #f1f5f9; /* Contrast with white wrapper */
        transition: all 0.2s;
        border: 1px solid transparent;
    }
    
    .chat-input-field:focus {
        background: #ffffff;
        border-color: var(--chat-green-sent);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); /* Indigo glow */
    }

    /* Icons */
    .btn-icon {
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    .btn-icon:hover {
        background: #f1f5f9;
        color: var(--chat-green-sent);
    }
    .btn-icon.text-danger:hover {
        background: #fee2e2;
        color: #dc3545 !important;
    }

    /* Smooth Scrollbar */
    .chat-messages-area::-webkit-scrollbar { width: 5px; }
    .chat-messages-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .chat-messages-area::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .chat-users-list::-webkit-scrollbar { width: 5px; }

    .welcome-logo {
        width: 150px;
        opacity: 1;
        filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4));
        transition: all 0.3s ease;
        animation: logoFloat 3s ease-in-out infinite;
    }
    
    .welcome-logo:hover {
        transform: scale(1.05);
        filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.6));
    }

    @keyframes logoFloat {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
    }

    .chat-attachment-img {
        max-width: 200px; 
        max-height: 200px; 
        border-radius: 8px; 
        object-fit: cover; 
        border: 1px solid rgba(0,0,0,0.1);
        display: block;
        transition: transform 0.2s;
    }
    .chat-attachment-img:hover {
        transform: scale(1.02);
    }
    .chat-attachment-file {
        display: flex; 
        align-items: center; 
        gap: 10px; 
        padding: 8px 12px; 
        background: rgba(255,255,255,0.8); 
        border-radius: 8px; 
        text-decoration: none; 
        color: #1e293b;
        border: 1px solid rgba(0,0,0,0.1);
        transition: all 0.2s;
    }
    .chat-attachment-file:hover {
        background: #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        color: #4f46e5;
    }

    /* --- New Attach Menu Styles --- */
    .attach-menu {
        position: absolute;
        bottom: 70px;
        left: 15px;
        background: #233138; /* Dark WhatsApp Theme */
        border-radius: 24px;
        padding: 16px;
        display: none; 
        flex-direction: column;
        gap: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        z-index: 1000;
        min-width: 200px;
        animation: menuPopup 0.25s cubic-bezier(0.19, 1, 0.22, 1);
        transform-origin: bottom left;
    }
    
    @keyframes menuPopup {
        from { opacity: 0; transform: scale(0.5) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .attach-menu-item {
        display: flex;
        align-items: center;
        gap: 16px;
        color: #e9edef;
        cursor: pointer;
        padding: 4px;
        border-radius: 12px;
        transition: background 0.2s;
    }
    .attach-menu-item:hover { background: rgba(255,255,255,0.08); }

    .attach-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .icon-doc {
        background: linear-gradient(180deg, #9F82F4, #6144D5); /* Vibrant Purple */
    }
    
    .icon-photo {
        background: linear-gradient(180deg, #09A5F6, #027CC5); /* Vibrant Blue */
    }
    
    .menu-label {
        font-size: 1.05rem;
        font-weight: 500;
        color: #ffffff;
        letter-spacing: 0.3px;
    }

    /* --- File Card in Chat --- */
    .file-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255,255,255,0.5); /* Semi-transparent */
        border-radius: 8px;
        text-decoration: none;
        color: inherit; /* Inherit text color */
        border: 1px solid rgba(0,0,0,0.05);
        transition: background 0.2s;
        min-width: 220px;
    }
    /* Darken slightly on hover or specifically for sent messsages */
    .msg-sent .file-card { background: rgba(0,0,0,0.05); } 
    .msg-received .file-card { background: rgba(240,242,245, 0.8); }

    .file-icon-box {
        width: 40px;
        height: 48px; /* Tall box like PDF icon */
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .file-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
    }
    
    .file-name {
        font-weight: 600;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
    }
    
    .file-meta {
        font-size: 0.75rem;
        opacity: 0.7;
        text-transform: uppercase;
    }
    
    /* --- Normal Input Bar Refinements --- */
    .chat-input-bar {
        flex: 1;
        background: #ffffff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        padding: 5px 10px;
        border: 1px solid var(--chat-border);
    }
    .chat-input-field {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }

    /* --- Full Screen Preview Overlay --- */
    .file-preview-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #0b141a; 
        z-index: 2000;
        display: flex;
        flex-direction: column;
        color: #e9edef;
        /* Ensure it behaves nicely inside chat-main */
        border-radius: 0; /* Or inherit from chat-main */
    }
    
    .preview-header {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 20px;
    }
    
    .preview-title {
        font-size: 1.1rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .preview-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #0b141a;
        position: relative;
    }
    
    #previewContentContainer img {
        max-width: 90%;
        max-height: 80vh;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    #previewContentContainer iframe {
        width: 80%;
        height: 80vh;
        border: none;
        background: #fff;
    }

    .preview-footer {
        background: #0b141a;
        padding: 10px 20px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        position: relative;
    }
    
    .preview-input-container {
        background: #2a3942;
        border-radius: 24px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .preview-input-container input {
        background: transparent;
        border: none;
        color: white;
        flex: 1;
        outline: none;
        font-size: 1rem;
    }
    
    .preview-thumbnails {
        display: flex;
        justify-content: center;
        gap: 8px;
    }
    
    /* --- Role Filter Slider --- */
    #chatRoleFilters::-webkit-scrollbar { display: none; }
    #chatRoleFilters {
        -ms-overflow-style: none;
        scrollbar-width: none;
        cursor: grab; /* Enable grab cursor */
        user-select: none; /* Prevent text selection while dragging */
    }
    #chatRoleFilters:active {
        cursor: grabbing;
    }
    
    .filter-slider-container {
        /* Ensure container handles buttons inside */
        margin-left: -10px; margin-right: -10px; /* Slight breakout to allow buttons at edges */
        padding: 0 10px;
    }

    .filter-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 32px; 
        height: 32px;
        border-radius: 50%;
        background: white;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* Softer shadow */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
        cursor: pointer;
        color: #64748b;
        font-size: 0.9rem;
        transition: all 0.2s;
    }
    .filter-nav-btn:hover { 
        background: #ffffff; 
        color: #334155; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .prev-btn { left: 0; }
    .next-btn { right: 0; }

    /* Fades */
    .slider-fade {
        position: absolute;
        top: 0; bottom: 0;
        width: 40px;
        pointer-events: none;
        z-index: 15;
    }
    .fade-start {
        left: 0;
        background: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));
    }
    .fade-end {
        right: 0;
        background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0));
    }

    .thumb-item {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: visible; /* Allow remove badge to overlap if needed, or hidden if keeping inside */
        border: 2px solid transparent; 
        cursor: pointer;
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: #ffffff;
        position: relative;
        flex-shrink: 0;
        transition: transform 0.1s;
    }
    .thumb-item.active {
        border-color: #00a884;
    }
    
    .thumb-remove {
        position: absolute;
        top: -6px; right: -6px;
        width: 20px; height: 20px;
        background: #667781;
        border-radius: 50%;
        color: white;
        font-size: 12px;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .thumb-item:hover .thumb-remove { display: flex; }
    
    .thumb-add {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        border: 1px solid #3b4a54;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #8696a0;
        cursor: pointer;
        font-size: 1.8rem;
        flex-shrink: 0;
        background: transparent;
        transition: background 0.2s;
    }
    .thumb-add:hover {
        background: rgba(255,255,255,0.05);
        color: #aebac1;
    }
    
    .preview-send-btn {
        position: absolute;
        right: 20px;
        bottom: 20px;
        width: 50px;
        height: 50px;
        background: #00a884; 
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.3rem;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: transform 0.2s;
    }
    .preview-send-btn:hover {
        transform: scale(1.1);
        background: #00bfa5;
    }

    .chat-input-bar {
        border-radius: 20px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
    }
    /* --- Context Menu --- */
    .chat-context-menu {
        display: none;
        position: fixed;
        z-index: 9999;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        padding: 6px;
        min-width: 180px;
        border: 1px solid #e2e8f0;
        animation: fadeIn 0.1s ease-out;
    }
    .context-item {
        padding: 10px 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #334155;
        font-size: 0.95rem;
        border-radius: 8px;
        font-weight: 500;
        transition: background 0.1s;
    }
    .context-item:hover {
        background: #f1f5f9;
        color: #0f172a;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }

    /* --- Toast Notification --- */
    .chat-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e293b;
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateY(-100px);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .chat-toast.show {
        transform: translateY(0);
    }
    .chat-toast-icon {
        width: 32px;
        height: 32px;
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
    }
</style>

<script>
    /* --- Filter Slider Logic --- */
    function scrollFilters(direction) {
        const container = document.getElementById('chatRoleFilters');
        const scrollAmount = 100; // px
        container.scrollLeft += direction * scrollAmount;
        // Buttons update via scroll event listener
    }

    function updateFilterButtons() {
        const container = document.getElementById('chatRoleFilters');
        const prev = document.getElementById('filterPrevBtn');
        const next = document.getElementById('filterNextBtn');
        const fadeStart = document.getElementById('fadeStart');
        const fadeEnd = document.getElementById('fadeEnd');
        
        // Show/Hide Prev & Fade
        if (container.scrollLeft > 5) { // Small buffer
            prev.classList.remove('d-none');
            prev.classList.add('d-flex');
            fadeStart?.classList.remove('d-none');
        } else {
            prev.classList.add('d-none');
            prev.classList.remove('d-flex');
            fadeStart?.classList.add('d-none');
        }
        
        // Show/Hide Next & Fade
        // Check if there is scrollable content remaining
        if (Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth) {
            next.classList.add('d-none');
            next.classList.remove('d-flex');
            fadeEnd?.classList.add('d-none');
        } else {
            next.classList.remove('d-none');
            next.classList.add('d-flex');
            fadeEnd?.classList.remove('d-none');
        }
    }



    // --- Drag to Scroll Logic ---
    document.addEventListener('DOMContentLoaded', () => {
        const slider = document.getElementById('chatRoleFilters');
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active'); // Optional for style
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            // Stop smooth scroll during drag
            slider.style.scrollBehavior = 'auto'; 
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.scrollBehavior = 'smooth';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.scrollBehavior = 'smooth';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });

        // Initialize buttons
        slider.addEventListener('scroll', updateFilterButtons);
        // Multiple checks to ensure layout is ready
        setTimeout(updateFilterButtons, 50);
        setTimeout(updateFilterButtons, 500); 
        window.addEventListener('resize', updateFilterButtons);
    });

    const CHAT_API_BASE = '/api/groupchat/';
    let modalReceiverId = null;
    let modalLastMsgId = 0;
    let modalPolling = null;
    let allChatUsers = [];
    let currentRoleFilter = 'all';
    let selectedFiles = []; // Array to store multiple files
    let currentPreviewIndex = 0;

    // --- Attachment Menu Logic ---
    function toggleAttachMenu() {
        const menu = document.getElementById('attachMenu');
        menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    }
    
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('attachMenu');
        const btn = document.getElementById('attachMenuBtn');
        if (menu.style.display === 'flex' && !menu.contains(e.target) && !btn.contains(e.target)) {
            menu.style.display = 'none';
        }
    });

    function triggerFileSelect(type) {
        document.getElementById('attachMenu').style.display = 'none';
        const input = document.getElementById('chatFileInput');
        
        if (type === 'image') input.accept = "image/*";
        else input.accept = ".pdf,.doc,.docx,.txt";
        
        input.click();
    }

    function handleFileSelect(input) {
        if (input.files && input.files.length > 0) {
            // Append new files to existing array
            for (let i = 0; i < input.files.length; i++) {
                selectedFiles.push(input.files[i]);
            }
            // Open preview with the last added file (or first if new)
            // But usually we want to show the first of the new batch, or just the list.
            // Let's set index to the start of this new batch? 
            // For simplicity, switch to the last one or 0.
            currentPreviewIndex = selectedFiles.length - 1;
            openFilePreview();
        }
    }

    // --- Preview Modal Logic ---
    function openFilePreview() {
        if (selectedFiles.length === 0) return;

        const modal = document.getElementById('filePreviewModal');
        const title = document.getElementById('previewTitle');
        const container = document.getElementById('previewContentContainer');
        
        modal.style.display = 'flex';
        
        // Render current file
        const file = selectedFiles[currentPreviewIndex];
        title.innerText = file.name;
        
        // Clear main container
        container.innerHTML = '';
        document.getElementById('previewCaptionInput').value = ''; // We could theoretically store captions per file, but keep simple for now single caption or reset. 
        // WhatsApp allows caption per file. For MVP let's just use one caption for the batch or per send.
        // Let's assume caption is applied to the *current* image? 
        // For simplicity in this iteration: Caption applies to the file being sent. 
        // Complication: standard sequential send. 
        // We will just clear caption logic for now or apply to all? 
        // Let's keep input blank on switch for now (simplest).
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        } else {
            // PDF or Doc
             if (file.type === 'application/pdf') {
                const objectUrl = URL.createObjectURL(file);
                const iframe = document.createElement('iframe');
                iframe.src = objectUrl;
                container.appendChild(iframe);
            } else {
                container.innerHTML = '<div class="d-flex flex-column align-items-center text-secondary"><i class="bi bi-file-earmark-text display-1"></i><div class="mt-3">Preview not available</div></div>';
            }
        }
        
        renderThumbnails();
    }

    function renderThumbnails() {
        const thumbContainer = document.querySelector('.preview-thumbnails');
        // Clear existing items but keep the 'add' button which I need to preserve or re-append.
        // The structure was: .preview-thumbnails > .thumb-item(s) + .thumb-add
        
        // Let's rebuild innerHTML
        let html = '';
        
        selectedFiles.forEach((file, index) => {
            const activeClass = (index === currentPreviewIndex) ? 'active' : '';
            let inner = '';
            
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                // Image thumb
                inner = `<img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius: 6px;">`;
            } else if (file.type === 'application/pdf') {
                // PDF Icon - Red
                inner = `<i class="bi bi-file-earmark-pdf" style="font-size: 1.8rem; color: #ef4444;"></i>`;
            } else if (file.type.includes('word') || file.type.includes('document')) {
                // Word/Doc Icon - Blue
                inner = `<i class="bi bi-file-earmark-word" style="font-size: 1.8rem; color: #3b82f6;"></i>`;
            } else {
                // Generic - Gray/Blue
                inner = `<i class="bi bi-file-earmark-text" style="font-size: 1.8rem; color: #3b82f6;"></i>`;
            }
            
            html += `
                <div class="thumb-item ${activeClass}" onclick="switchPreview(${index})">
                    ${inner}
                    <div class="thumb-remove" onclick="removeFile(event, ${index})"><i class="bi bi-x"></i></div>
                </div>
            `;
        });
        
        html += `
             <div class="thumb-add" onclick="document.getElementById('chatFileInput').click()">
                 <i class="bi bi-plus-lg"></i>
             </div>
        `;
        
        thumbContainer.innerHTML = html;
    }

    function switchPreview(index) {
        currentPreviewIndex = index;
        openFilePreview();
    }

    function removeFile(e, index) {
        e.stopPropagation();
        selectedFiles.splice(index, 1);
        if (selectedFiles.length === 0) {
            closeFilePreview();
        } else {
            if (currentPreviewIndex >= selectedFiles.length) {
                currentPreviewIndex = selectedFiles.length - 1;
            }
            openFilePreview();
        }
    }

    function closeFilePreview() {
        document.getElementById('filePreviewModal').style.display = 'none';
        selectedFiles = [];
        document.getElementById('chatFileInput').value = ''; 
    }
    
    async function sendFileFromPreview() {
        if (selectedFiles.length === 0) return;
        
        const caption = document.getElementById('previewCaptionInput').value.trim();
        
        // Send all files sequentially
        // For the *current* visible file, we attach the caption? 
        // Or send caption as a separate text message?
        // WhatsApp behavior: Caption is attached to the specific image.
        // Simplification: Attach caption to the FIRST file sent, or the CURRENT one.
        // Let's attach to the current one being previewed if possible, or just the first.
        // Let's just send the caption with the current file being viewed, and others without.
        
        // Actually, user wants "batch send". 
        // We will loop.
        
        const btn = document.querySelector('.preview-send-btn');
        btn.innerHTML = '<div class="spinner-border spinner-border-sm text-white" role="status"></div>';
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const msgText = (i === currentPreviewIndex) ? caption : ''; 
            
            await sendSingleFile(file, msgText);
        }
        
        btn.innerHTML = '<i class="bi bi-send-fill"></i>';
        closeFilePreview();
    }
    
    async function sendSingleFile(file, text) {
        try {
            const formData = new FormData();
            formData.append('message', text); 
            formData.append('receiver_id', modalReceiverId || '');
            formData.append('file', file);
            
            const res = await fetch(CHAT_API_BASE + 'send.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!data.success) {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
                console.error('Upload Error:', data);
            }
            fetchModalMessages(); 
        } catch(e) { 
            console.error(e); 
            alert('Error sending file.');
        }
    }

    function clearChatFile() {
        selectedFiles = [];
    }

    function openChatModal() {
        document.getElementById('internalChatModal').style.display = 'flex';
        loadChatUsers();
        modalPolling = setInterval(fetchModalMessages, 3000);
        
        // Update slider buttons after a brief delay to ensure layout is computed
        setTimeout(updateFilterButtons, 100);
    }

    function closeChatModal() {
        document.getElementById('internalChatModal').style.display = 'none';
        if (modalPolling) clearInterval(modalPolling);
    }
    
    function closeActiveConversation() {
        modalReceiverId = null; 
        document.getElementById('chatActiveState').classList.add('d-none');
        document.getElementById('chatActiveState').classList.remove('d-flex');
        document.getElementById('chatWelcomeState').classList.remove('d-none');
        document.getElementById('chatWelcomeState').classList.add('d-flex');
        
        // Remove active class from list
         document.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('active'));
    }

    async function deleteChat() {
        if (!confirm('Are you sure you want to delete this entire conversation? This cannot be undone.')) return;
        
        try {
            const formData = new FormData();
            formData.append('receiver_id', modalReceiverId === null ? 'null' : modalReceiverId);
            
            const res = await fetch(CHAT_API_BASE + 'delete_chat.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                // Clear messages in UI
                document.getElementById('modalChatMessages').innerHTML = '<div class="text-center text-secondary py-5">Conversation deleted.</div>';
                modalLastMsgId = 0; // Reset last ID
                
                // Refresh small indicators in sidebar
                loadChatUsers();
                
                // Close conversation view
                setTimeout(closeActiveConversation, 1000);
            } else {
                alert('Error: ' + (data.error || 'Failed to delete chat'));
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred while deleting the chat.');
        }
    }

    async function deleteMessage(msgId, event) {
        if (event) event.stopPropagation();
        if (!confirm('Delete this message?')) return;
        
        try {
            const formData = new FormData();
            formData.append('message_id', msgId);
            
            const res = await fetch(CHAT_API_BASE + 'delete_message.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                // Refresh messages
                // Find and remove from DOM for immediate feedback or just refetch
                modalLastMsgId = 0; // Trigger full reload for now to ensure grouping logic stays correct
                fetchModalMessages();
                showChatToast("Message has been deleted");
            } else {
                alert('Error: ' + (data.error || 'Failed to delete message'));
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred.');
        }
    }

    function showChatToast(message) {
        const toast = document.getElementById('chatToast');
        if (!toast) return;
        
        toast.querySelector('.chat-toast-content div:last-child').innerText = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async function loadChatUsers() {
        try {
            const res = await fetch(CHAT_API_BASE + 'users.php');
            const data = await res.json();
            if (data.success) {
                // Determine users list
                let users = data.users;
                
                // Add Avisaexperts Group  Manually if not present
                if (!users.find(u => u.broadcast)) {
                    users.unshift({
                        id: null,
                        name: 'Avisaexperts Group ',
                        role: 'System',
                        broadcast: true,
                        unread: 0, 
                        last_msg_time: null
                    });
                }
                
                // Sort by unread count then by last message time handled by backend? 
                // Backend already sorts. But let's ensure broadcast is at top or where appropriate.
                // Actually backend sort puts high unread first. Broadcast might get buried if unused.
                // Let's keep Broadcast pinned to top for now unless it has unread interactions (which technically it might not for broadcast listening).
                
                // Just use the valid list from backend which is already sorted by significance
                allChatUsers = users;
                
                filterChatUsers();
            }
        } catch (e) { console.error(e); }
    }
    
    function filterByRole(role, element) {
        currentRoleFilter = role;
        
        // Update styling
        document.querySelectorAll('#chatRoleFilters .badge').forEach(el => {
            el.classList.remove('active-filter');
        });
        
        element.classList.add('active-filter');
        
        filterChatUsers();
    }

    function renderChatUsers(users) {
        const list = document.getElementById('chatUsersList');
        list.innerHTML = '';
        
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = `chat-user-item ${modalReceiverId === u.id ? 'active' : ''}`;
            div.onclick = () => selectModalUser(u);
            
            const initial = u.broadcast ? '<i class="bi bi-megaphone-fill"></i>' : u.name.charAt(0);
            const color = u.broadcast ? '#f59e0b' : '#6366f1';
            
            // Format time
            let timeDisplay = '';
            if (u.last_msg_time) {
                const date = new Date(u.last_msg_time);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                timeDisplay = isToday ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
            }

            
            // Avatar (Image or Initial)
            let avatarContent = initial;
            let avatarStyle = `background:${color}`;
            
            if (u.user_profile) {
                 let pUrl = u.user_profile;
                 if (!pUrl.startsWith('http') && !pUrl.startsWith('//')) {
                        pUrl = '/' + pUrl;
                 }
                 avatarContent = '';
                 avatarStyle = `background-image: url('${pUrl}'); background-size: cover; background-position: center;`;
            }

            // Unread Badge
            const unreadBadge = u.unread > 0 
                ? `<span class="badge rounded-pill bg-success" style="font-size: 0.7rem;">${u.unread}</span>` 
                : '';
            
            div.innerHTML = `
                <div class="user-avatar-lg" style="${avatarStyle}">${avatarContent}</div>
                <div style="flex:1">
                    <div class="d-flex justify-content-between align-items-center">
                        <span style="font-weight:500; color:var(--chat-text-primary)">${u.name}</span>
                        <span class="text-secondary small" style="font-size: 0.75rem;">${timeDisplay}</span>  
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <div class="text-secondary small text-truncate" style="max-width:180px">${u.role === 'employee' ? 'Filing Team' : (u.role || 'Visible to all')}</div>
                        ${unreadBadge}
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    function filterChatUsers() {
        const term = document.getElementById('chatUserSearch').value.toLowerCase();
        
        let filtered = allChatUsers;
        
        // Filter by text
        if (term) {
             filtered = filtered.filter(u => u.name.toLowerCase().includes(term));
        }
        
        // Filter by role
        if (currentRoleFilter !== 'all') {
            filtered = filtered.filter(u => {
                const userRole = (u.role || '').toLowerCase();
                return userRole === currentRoleFilter || (currentRoleFilter === 'calling_team' && userRole === 'calling_team'); 
            });
        }
        
        renderChatUsers(filtered);
    }

    function selectModalUser(user) {
        modalReceiverId = user.id;
        
        // Update Active State UI
        document.getElementById('chatWelcomeState').classList.add('d-none');
        document.getElementById('chatWelcomeState').classList.remove('d-flex');
        document.getElementById('chatActiveState').classList.remove('d-none');
        document.getElementById('chatActiveState').classList.add('d-flex');

        document.getElementById('activeChatName').innerText = user.name;
        document.getElementById('activeChatRole').innerText = user.broadcast ? 'Visible to everyone' : user.role;
        
        // Header Avatar
        let headerAvatarHtml = user.broadcast ? '<i class="bi bi-megaphone-fill"></i>' : user.name.charAt(0);
        let headerAvatarStyle = `background: ${user.broadcast ? '#f59e0b' : '#6366f1'}`;
        
        if (user.user_profile) {
             let pUrl = user.user_profile;
             if (!pUrl.startsWith('http') && !pUrl.startsWith('//')) {
                    pUrl = '/' + pUrl;
             }
             headerAvatarHtml = '';
             headerAvatarStyle = `background-image: url('${pUrl}'); background-size: cover; background-position: center;`;
        }

        document.getElementById('activeChatAvatar').innerHTML = headerAvatarHtml;
        document.getElementById('activeChatAvatar').style = headerAvatarStyle; // Use style attribute to override completely

        // Update list active state
        renderChatUsers(allChatUsers); // Re-render to highlight active

        // Clear and load messages
        document.getElementById('modalChatMessages').innerHTML = '<div class="text-center text-secondary py-4">Loading messages...</div>';
        modalLastMsgId = 0;
        fetchModalMessages();
    }

    async function fetchModalMessages() {
        if (document.getElementById('chatActiveState').classList.contains('d-none')) return;
        
        try {
            let url = CHAT_API_BASE + 'get.php?last_id=' + modalLastMsgId;
            url += modalReceiverId ? '&receiver_id=' + modalReceiverId : '&receiver_id=null';

            const res = await fetch(url);
            const data = await res.json();

            if (data.success && data.messages.length > 0) {
                const container = document.getElementById('modalChatMessages');
                
                // Clear loading if first load
                if (modalLastMsgId === 0) container.innerHTML = '';
                
                // If it was "No messages" text
                if (container.innerText.includes('Loading messages') || container.innerText.includes('No messages')) container.innerHTML = '';

                // Get last message info from DOM to support incremental loading (grouping continuity)
                let lastSenderId = container.lastElementChild ? container.lastElementChild.getAttribute('data-sender') : null;
                // Note: Real date dividers on incremental load might need more robust checking, but this handles the current batch.
                let lastDate = container.lastElementChild ? container.lastElementChild.getAttribute('data-date') : null;

                data.messages.forEach(msg => {
                    // --- Date Logic ---
                    const msgDateObj = new Date(msg.created_at);
                    const msgDateStr = msgDateObj.toDateString(); // "Fri Feb 05 2026"
                    
                    if (msgDateStr !== lastDate) {
                         const today = new Date().toDateString();
                         const yesterday = new Date(Date.now() - 86400000).toDateString();
                         
                         let dateText = msgDateStr;
                         if (msgDateStr === today) dateText = 'Today';
                         else if (msgDateStr === yesterday) dateText = 'Yesterday';
                         else dateText = msgDateObj.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});

                         const dateDiv = document.createElement('div');
                         dateDiv.className = 'chat-date-divider';
                         dateDiv.innerHTML = `<span>${dateText}</span>`;
                         container.appendChild(dateDiv);
                         
                         lastDate = msgDateStr;
                         lastSenderId = null; // Reset grouping on new day
                    }

                    // --- Grouping Logic ---
                    // Same sender as previous message?
                    const isSameSender = (lastSenderId === msg.sender_id);
                    lastSenderId = msg.sender_id;

                    // Wrapper Row
                    const msgRow = document.createElement('div');
                    msgRow.className = 'msg-row';
                    msgRow.setAttribute('data-sender', msg.sender_id);
                    msgRow.setAttribute('data-date', msgDateStr);
                    msgRow.style.display = 'flex';
                    msgRow.style.width = '100%';
                    // Spacing: Tight if same sender, Loose if different
                    msgRow.style.marginBottom = isSameSender ? '2px' : '10px'; 
                    msgRow.style.justifyContent = msg.is_me ? 'flex-end' : 'flex-start';
                    msgRow.style.alignItems = 'flex-end'; // Avatar at bottom

                    // --- Avatar (Group Chat + Received) ---
                    let avatarHtml = '';
                    // Only show if NOT me, AND it's a group chat (no modalReceiverId)
                    if (!msg.is_me && !modalReceiverId) {
                         // Spacer logic: Always reserve space, but only show image if !isSameSender
                         let pUrl = msg.sender_profile;
                         let initial = (msg.sender_name || '?').charAt(0).toUpperCase();
                         let bg = '#6366f1'; 
                         let imgStyle = `width: 28px; height: 28px; border-radius: 50%; background: ${bg}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; margin-right: 8px; margin-bottom: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);`;
                         
                         let innerContent = '';
                         if (!isSameSender) { 
                             // Show Avatar
                             if (pUrl) {
                                  if (!pUrl.startsWith('http') && !pUrl.startsWith('//')) pUrl = '/' + pUrl;
                                  innerContent = `<div style="width:100%; height:100%; border-radius:50%; background-image: url('${pUrl}'); background-size: cover; background-position: center;"></div>`;
                             } else {
                                  innerContent = initial;
                             }
                             avatarHtml = `<div style="${imgStyle}">${innerContent}</div>`;
                         } else {
                             // Invisible Spacer for alignment
                             avatarHtml = `<div style="${imgStyle}; visibility: hidden"></div>`;
                         }
                         
                         msgRow.innerHTML = avatarHtml;
                    }

                    const div = document.createElement('div');
                    div.className = `msg-bubble ${msg.is_me ? 'msg-sent' : 'msg-received'}`;
                    div.style.marginBottom = '0'; // Controlled by wrapper
                    div.style.alignSelf = 'auto'; // Reset
                    
                    // --- Sender Name inside Bubble ---
                    // Show only if Group Chat + Received + First msg in sequence
                    let senderNameHtml = '';
                    if (!msg.is_me && !modalReceiverId && !isSameSender) {
                        senderNameHtml = `<div style="color:#f59e0b; font-size:0.7rem; font-weight:700; margin-bottom:4px; letter-spacing:0.3px;">${msg.sender_name}</div>`;
                    }

                    div.innerHTML = `
                        ${senderNameHtml}
                        ${renderAttachment(msg)}
                        <div style="word-break: break-word;">${msg.message}</div>
                        <div class="msg-meta">
                            <span class="msg-time">${msg.time_formatted}</span>
                            ${msg.is_me ? `<i class="bi bi-check2-all" style="font-size:14px; color: ${msg.is_read == 1 ? '#93c5fd' : 'rgba(255,255,255,0.7)'}"></i>` : ''}
                        </div>
                    `;
                    
                    if (msg.is_me) {
                        const deleteBtn = document.createElement('div');
                        deleteBtn.className = 'msg-delete-btn';
                        deleteBtn.title = 'Delete Message';
                        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                        deleteBtn.onclick = (e) => deleteMessage(msg.id, e);
                        
                        // For sent messages, delete button is on the LEFT of bubble
                        msgRow.appendChild(deleteBtn);
                        msgRow.appendChild(div);
                    } else {
                        // For received, bubble first then maybe actions (not implemented yet)
                        msgRow.appendChild(div);
                    }

                    container.appendChild(msgRow);
                    
                    modalLastMsgId = msg.id;
                });
                
                // Track Last Seen Group Message ID locally
                if (modalReceiverId === null && modalLastMsgId > 0) {
                    const currentStored = localStorage.getItem('avisa_group_last_id') || 0;
                    if (modalLastMsgId > currentStored) {
                        localStorage.setItem('avisa_group_last_id', modalLastMsgId);
                    }
                }
                
                // Scroll to bottom
                container.scrollTop = container.scrollHeight;
            } else if (modalLastMsgId === 0 && data.success && data.messages.length === 0) {
                 document.getElementById('modalChatMessages').innerHTML = '<div class="text-center text-secondary py-5">No messages yet. Start the conversation!</div>';
            }
        } catch (e) { console.error(e); }
    }

    function renderAttachment(msg) {
        if (!msg.attachment) return '';
        
        const ext = msg.attachment.split('.').pop().toLowerCase();
        const fullPath = '/' + msg.attachment;
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return `
                <div class="mb-2">
                    <a href="${fullPath}" target="_blank">
                        <img src="${fullPath}" class="chat-attachment-img">
                    </a>
                </div>`;
        } else {
            // Document Card Style
            let iconClass = 'bi-file-earmark-text';
            let iconColor = '#6b7280'; // Gray default
            let fileTypeLabel = ext.toUpperCase();
            
            if (ext === 'pdf') {
                iconClass = 'bi-file-earmark-pdf';
                iconColor = '#ef4444'; // Red
            } else if (['doc', 'docx'].includes(ext)) {
                iconClass = 'bi-file-earmark-word';
                iconColor = '#3b82f6'; // Blue
            } else if (['xls', 'xlsx'].includes(ext)) {
                iconClass = 'bi-file-earmark-excel';
                iconColor = '#22c55e'; // Green
            } else if (['ppt', 'pptx'].includes(ext)) {
                iconClass = 'bi-file-earmark-slides';
                iconColor = '#f97316'; // Orange
            } else if (['zip', 'rar'].includes(ext)) {
                iconClass = 'bi-file-earmark-zip';
                iconColor = '#a855f7'; // Purple
            }
            
            // Clean filename from path (optional, already handled by just showing generic 'Download' or similar in prev code, but let's try to extract filename)
            const fileName = msg.attachment.split('/').pop().replace(/^chat_[a-z0-9]+_/, ''); // Remove uniqid prefix if possible

            return `
                <div class="mb-2">
                    <a href="${fullPath}" target="_blank" class="file-card">
                        <div class="file-icon-box" style="color: ${iconColor}; background: rgba(255,255,255,0.8);">
                            <i class="bi ${iconClass}"></i>
                        </div>
                        <div class="file-info">
                            <div class="file-name" title="${fileName}">Download ${fileTypeLabel}</div>
                            <div class="file-meta">${fileTypeLabel} &bull; Document</div>
                        </div>
                    </a>
                </div>`;
        }
    }

    async function sendModalMessage(overrideText = null) {
        const input = document.getElementById('modalMessageInput');
        
        // If overrideText is provided (from preview), use it. Else use input value.
        const text = (overrideText !== null) ? overrideText : input.value.trim();
        
        // If we have selectedFiles (batch), we shouldn't be here via main enter/send unless logic changed.
        // Actually, if selectedFiles has content, we should use sendFileFromPreview logic or batch logic.
        // But main input is only for text unless file is attached.
        
        if (!text && selectedFiles.length === 0) return;

        input.value = ''; // Clear main input

        // If files are present in the buffer but we are clicking send on main chat, 
        // implies we might want to send them? But they are in preview modal usually.
        // Let's assume if this is called, we are just sending text. 
        // OR if this was called from the preview modal context (which calls sendFileFromPreview -> sendSingleFile).
        
        // We will keep this function for TEXT ONLY sending.
        // File sending is handled by `sendSingleFile` iterate.

        try {
             await fetch(CHAT_API_BASE + 'send.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, receiver_id: modalReceiverId })
             });
             fetchModalMessages();
        } catch (e) { alert('Error sending message'); }
    }

    function handleModalEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendModalMessage();
        }
    }
    
    // Close on outside click
    document.getElementById('internalChatModal').addEventListener('click', function(e) {
        if (e.target === this) closeChatModal();
    });

    // Check for unread counts
    function checkUnreadChatCount() {
        // Get local last seen ID
        const lastGroupId = localStorage.getItem('avisa_group_last_id') || 0;
        
        // Use the new simplified notifier endpoint
        fetch(`/api/groupchat/notifier.php?last_group_id=${lastGroupId}`)
            .then(res => res.json())
            .then(data => {
                // Update Topbar Badge
                const badge = document.getElementById('badge-topbar-internal-chat');
                if (badge) {
                    if (data.success && data.count > 0) {
                        badge.innerText = data.count > 99 ? '99+' : data.count;
                        badge.style.display = 'block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
                
                // Update Group Chat User in List (if loaded)
                if (data.group_count !== undefined && allChatUsers.length > 0) {
                    const groupUser = allChatUsers.find(u => u.broadcast);
                    if (groupUser) {
                        // Only update if changed to avoid unnecessary re-renders
                        if (groupUser.unread !== data.group_count) {
                            groupUser.unread = data.group_count;
                            // Re-render list to show new badge
                            // Only if chat modal is open
                            if (document.getElementById('internalChatModal').style.display !== 'none') {
                                filterChatUsers();
                            }
                        }
                    }
                }
            })
            .catch(err => console.error(err));
    }

    // Poll every 5 seconds
    setInterval(checkUnreadChatCount, 5000);
    // Initial Check
    checkUnreadChatCount();

    /* --- Context Menu Logic --- */
    document.addEventListener('contextmenu', function(e) {
        const modal = document.getElementById('internalChatModal');
        const activeState = document.getElementById('chatActiveState');
        const menu = document.getElementById('chatContextMenu');
        
        // Only trigger if modal is open AND active conversation is showing AND click is inside modal
        if (modal.style.display !== 'none' && !activeState.classList.contains('d-none') && modal.contains(e.target)) {
            e.preventDefault();
            
            // Calculate position
            let x = e.clientX;
            let y = e.clientY;
            
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
            menu.style.display = 'block';
        } else {
            if (menu) menu.style.display = 'none';
        }
    });

    // Hide context menu on click anywhere
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('chatContextMenu');
        if (menu) menu.style.display = 'none';
    });
    
    // Hide on scroll to prevent floating menu issues
    document.addEventListener('scroll', function() {
        const menu = document.getElementById('chatContextMenu');
        if (menu) menu.style.display = 'none';
    }, true); 
</script>
