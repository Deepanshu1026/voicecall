<?php
require_once __DIR__ . '/../../app/helpers/session.php';
// role guard
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employee') {
    header("Location: ../login.php");
    exit;
}

$active = 'mycase';
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>My Cases - Employee</title>
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        :root {
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --primary-color: #0f172a; /* Dark sleek primary */
            --accent-color: #6366f1;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        h3, h4, h5, h6 { font-weight: 600; letter-spacing: -0.5px; }

        /* Scoped Container */
        .page-container { padding: 20px; max-width: 1400px; margin: 0 auto; }

        /* Cards */
        .section-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition: box-shadow 0.2s;
        }
        .section-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

        /* Case List */
        .case-list-scroll {
            max-height: calc(100vh - 180px);
            overflow-y: auto;
            padding: 0;
            background: #fff;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }
        .case-list-scroll::-webkit-scrollbar { width: 4px; }
        .case-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .case-item {
            padding: 18px 20px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s;
            margin: 0;
            border-radius: 0;
            border-left: 3px solid transparent;
            background: #fff;
        }
        .case-item:hover { background-color: #f8fafc; }
        .case-item.active-case {
            background-color: #f0fdf4; /* Very subtle green tint for active work */
            border-left-color: #10b981;
        }
        .case-item.active-case h6, .case-item.active-case b { color: #15803d; }
        
        .case-item.locked-case.active-case {
             /* When selected but NOT the active working case (view only) */
             background-color: #f8fafc;
             border-left-color: var(--accent-color);
             color: inherit;
        }
        .case-item.locked-case.active-case h6, .case-item.locked-case.active-case b { color: var(--accent-color); }
        
        .case-item:last-child { border-bottom: none; }
        
        /* Typography */
        .muted { color: var(--text-muted); font-size: 0.95rem; }
        .small-muted { color: var(--text-muted); font-size: 0.85rem; }
        
        /* Badges */
        .badge { font-weight: 500; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; }
        .bg-success { background-color: #dcfce7 !important; color: #166534; }
        .bg-secondary { background-color: #f1f5f9 !important; color: #475569; }
        .bg-warning { background-color: #fef3c7 !important; color: #b45309; }

        /* File Cards */
        .file-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            border: 1px solid var(--border-color);
            transition: border-color 0.2s;
        }
        .file-card:hover { border-color: var(--accent-color); }
        .thumb-img { max-height: 80px; max-width: 100%; border-radius: 4px; object-fit: cover; }
        
        /* Timeline */
        .timeline-entry {
            position: relative;
            padding-left: 24px;
            padding-bottom: 24px;
            border-left: 2px solid #e2e8f0;
            margin-left: 8px;
        }
        .timeline-entry::before {
            content: '';
            position: absolute;
            left: -5px;
            top: 6px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--text-muted);
        }
        .timeline-entry:last-child { border-left: none; padding-bottom: 0; }
        .timeline-entry .fw-bold { font-size: 0.95rem; color: var(--text-main); }

        /* Buttons */
        .btn { padding: 10px 16px; font-weight: 500; border-radius: 8px; font-size: 0.95rem; }
        .btn-primary { background-color: var(--primary-color); border: none; }
        .btn-primary:hover { background-color: #1e293b; }
        .btn-success { background-color: #10b981; border: none; }
        .btn-success:hover { background-color: #059669; }

        /* Inputs */
        .form-control {
            border-radius: 8px;
            border-color: var(--border-color);
            padding: 10px 12px;
        }
        .form-control:focus { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); border-color: var(--accent-color); }

        .lock-note {
            background: #fff1f2;
            color: #be123c;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ffe4e6;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .lock-note::before { content: '\F42B'; font-family: 'bootstrap-icons'; }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(3px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
    </style>
</head>

<body>

    <?php include __DIR__ . '/../layout/sidebar.php'; ?>

    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>

        <div class="container-fluid">
            <h3 class="mb-3">My Cases</h3>

            <div id="empAlert"></div>

            <div class="row">
                <div class="col-md-3">
                    <div class="case-list-wrapper position-relative" style="background:#fff; border:1px solid var(--border-color); border-radius:12px; overflow:hidden;">
                        <div class="px-3 py-2 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px;">Assigned Cases</span>
                            <span id="caseListCount" class="badge bg-secondary text-dark" style="font-size:0.65rem;">0</span>
                        </div>
                        <div id="caseListBox" class="case-list-scroll position-relative" style="border:none; border-radius:0; max-height: calc(100vh - 220px);">
                            <div class="p-4 text-center text-muted">Loading...</div>
                        </div>
                        <!-- Scroll Indicator -->
                        <div id="scrollIndicator" class="position-absolute bottom-0 w-100 text-center py-1" style="background: linear-gradient(transparent, rgba(0,0,0,0.05)); display:none; pointer-events:none;">
                            <i class="bi bi-chevron-compact-down text-muted animate-bounce"></i>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Case Details -->
                <div class="col-md-9">

                    <!-- Case Header -->
                    <div id="caseHeader" class="section-card">
                        <div id="noCaseMsg" class="text-center text-muted p-4" style="display:none;">
                            <p>No assigned cases found.</p>
                            <p>Please contact your manager to get assignments.</p>
                        </div>

                        <div id="caseDetails" style="display:none;">
                            <!-- Header Row: Name & Status -->
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h4 id="clientName" class="mb-1"></h4>
                                    <div id="clientPhone" class="text-muted small"></div>
                                </div>
                                <div class="text-end">
                                    <span id="caseStatus" class="badge bg-secondary fs-6"></span>
                                    <div class="small text-muted mt-1">ID: #<span id="caseIdLabel"></span></div>
                                </div>
                            </div>
                            
                            <!-- Details Grid -->
                            <div class="row g-3 pt-3 border-top">
                                <div class="col-md-3 col-6">
                                    <div class="small-muted text-uppercase fw-bold mb-1" style="font-size:0.7rem;">Case Type</div>
                                    <div id="caseType" class="fw-medium"></div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="small-muted text-uppercase fw-bold mb-1" style="font-size:0.7rem;">Priority</div>
                                    <div id="casePriority" class="fw-medium"></div>
                                </div>
                                <div class="col-md-4 col-12">
                                    <div class="small-muted text-uppercase fw-bold mb-1" style="font-size:0.7rem;">Manager</div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:24px; height:24px; font-size:10px;"><i class="bi bi-person-fill"></i></div>
                                        <div id="caseManager" class="fw-medium text-truncate"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Documents -->
                        <div class="col-md-6">
                            <div class="section-card">
                                <div id="uploadSection">
                                    <h5 class="d-flex justify-content-between align-items-center">
                                        <span>Documents</span>
                                        <small id="docsCount" class="text-muted"></small>
                                    </h5>
                                    <p class="muted small">Upload documents required for this case. Files will be uploaded to Google Drive and stored in DB.</p>

                                    <form id="uploadForm" class="mb-3" enctype="multipart/form-data">
                                        <input type="file" id="fileInput" name="file[]" class="form-control mb-2" multiple accept="image/*,.pdf" required>
                                        <div class="progress mb-2" id="uploadProgressContainer" style="display:none; height: 12px; border-radius: 6px;">
                                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" id="uploadProgressBar" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        <button id="uploadBtn" class="btn btn-success w-100">Upload Document(s)</button>
                                    </form>
                                </div>

                                <div id="lockedMessage" style="display:none;" class="lock-note mb-3">
                                    You cannot perform actions on this case until you finish your active case <b id="activeCaseLabel"></b>.
                                </div>

                                <div class="row g-3" id="docsGallery"></div>
                            </div>
                        </div>

                        <!-- Timeline + Actions -->
                        <div class="col-md-6">
                            <div class="section-card">
                                <h5>Timeline</h5>
                                <div id="timelineBox">
                                    <p class="muted">Loading...</p>
                                </div>
                            </div>

                            <div class="section-card">
                                <h5>Actions</h5>
                                <div id="actionArea">
                                    <p class="muted">Loading actions...</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    </div>

    <script>
        const API = "/avisaupdated/index.php?path=";
        let allCases = [];
        let selectedCase = null;
        let activeWorkingCaseId = null; // case id with status === 'in-progress'

        // UI helpers
        function showAlert(msg, type = 'info') {
            document.getElementById("empAlert").innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
            setTimeout(() => document.getElementById("empAlert").innerHTML = "", 3500);
        }

        function pretty(dt) {
            try {
                return new Date(dt).toLocaleString();
            } catch (e) {
                return dt;
            }
        }

        function isImageExt(n) {
            const ex = (n || '').split('.').pop().toLowerCase();
            return ["jpg", "jpeg", "png", "webp"].includes(ex);
        }

        function escapeHtml(s) {
            if (s === null || s === undefined) return '';
            return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;').replaceAll("'", "&#039;");
        }

        /* --------- Load case list --------- */
        async function loadCaseList() {
            const box = document.getElementById("caseListBox");
            box.innerHTML = "<p class='muted'>Loading...</p>";

            try {
                const res = await fetch(API + "api/employee/my-cases");
                const j = await res.json();

                if (j.error) {
                    box.innerHTML = `<p class='text-danger'>${escapeHtml(j.error)}</p>`;
                    return;
                }

                allCases = j.cases || [];

                // find active working case (status === 'in-progress')
                const active = allCases.find(c => c.status === 'in-progress');
                activeWorkingCaseId = active ? active.id : null;

                document.getElementById("caseListCount").innerText = allCases.length;

                if (!allCases.length) {
                    box.innerHTML = `<p class="muted">You have no cases.</p>`;
                    document.getElementById("noCaseMsg").style.display = 'block';
                    document.getElementById("caseDetails").style.display = 'none';
                    checkScroll();
                    return;
                }

                box.innerHTML = "";
                allCases.forEach(c => {
                    const el = document.createElement("div");
                    el.className = "case-item " + (c.id === activeWorkingCaseId ? "active-case" : "locked-case");
                    el.id = "caseItem_" + c.id;

                    // small manager display
                    const managerName = c.manager_name ? escapeHtml(c.manager_name) : '<span class="small-muted">No manager</span>';
                    el.innerHTML = `
                <div><b>${escapeHtml(c.client_name)}</b></div>
                <div class="small-muted">${escapeHtml(c.case_type)} • ${escapeHtml(c.priority||'')}</div>
                <div class="mt-1"><span class="badge ${c.status === 'in-progress' ? 'bg-success' : 'bg-secondary'}">${escapeHtml(c.status)}</span></div>
                <div class="small-muted mt-1">Mgr: ${managerName}</div>
            `;
                    el.onclick = () => selectCase(c.id); // clickable even if locked (view-only)
                    box.appendChild(el);
                });
                
                // Initialize scroll indicator logic
                setTimeout(checkScroll, 100);
                box.onscroll = checkScroll;

                // auto-select: prefer saved > active > first
                const savedId = localStorage.getItem('avisa_emp_active_case');
                let toSelect = null;

                if (savedId && allCases.find(c => c.id == savedId)) {
                    toSelect = savedId;
                } else {
                    toSelect = activeWorkingCaseId || (allCases.length ? allCases[0].id : null);
                }
                
                if (toSelect) selectCase(toSelect);

            } catch (err) {
                console.error(err);
                box.innerHTML = `<p class='text-danger'>Failed loading cases</p>`;
            }
        }

        /* --------- Select a case and render details --------- */
        function selectCase(caseId) {
            // Save selection
            localStorage.setItem('avisa_emp_active_case', caseId);

            selectedCase = allCases.find(x => Number(x.id) === Number(caseId));
            if (!selectedCase) {
                showAlert("Case not found", "danger");
                return;
            }

            // highlight selected in list
            allCases.forEach(c => {
                const node = document.getElementById("caseItem_" + c.id);
                if (node) {
                    node.classList.toggle("active-case", c.id === selectedCase.id);
                }
            });

            // Scroll selected into view
            const selectedNode = document.getElementById("caseItem_" + selectedCase.id);
            if (selectedNode) {
                setTimeout(() => {
                    selectedNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }

            document.getElementById("noCaseMsg").style.display = 'none';
            document.getElementById("caseDetails").style.display = 'block';
            document.getElementById("clientName").innerText = selectedCase.client_name;
            document.getElementById("clientPhone").innerText = selectedCase.client_phone || '';
            document.getElementById("caseType").innerText = selectedCase.case_type || '';
            document.getElementById("casePriority").innerText = selectedCase.priority || '-';
            document.getElementById("caseStatus").innerText = selectedCase.status || '-';
            document.getElementById("caseManager").innerText = selectedCase.manager_name || 'Not assigned';
            document.getElementById("caseIdLabel").innerText = selectedCase.id;

            // active vs locked behavior
            const isActiveCase = (selectedCase.id === activeWorkingCaseId);

            // Show or hide upload form
            if (isActiveCase && selectedCase.status === 'in-progress') {
                document.getElementById("uploadSection").style.display = '';
                document.getElementById("lockedMessage").style.display = 'none';
            } else if (selectedCase.status === 'assigned') {
                // assigned state: show Start Case button (actions will show it)
                document.getElementById("uploadSection").style.display = 'none';
                document.getElementById("lockedMessage").style.display = activeWorkingCaseId ? '' : 'none';
                document.getElementById("activeCaseLabel").innerText = activeWorkingCaseId ? "#" + activeWorkingCaseId : "none";
            } else {
                // other statuses (waiting-doc-approval, completed etc.)
                document.getElementById("uploadSection").style.display = 'none';
                document.getElementById("lockedMessage").style.display = activeWorkingCaseId ? '' : 'none';
                document.getElementById("activeCaseLabel").innerText = activeWorkingCaseId ? "#" + activeWorkingCaseId : "none";
            }

            // load details
            loadDocuments(selectedCase.id);
            loadTimeline(selectedCase.id);
            renderActions();
        }

        /* --------- Documents gallery --------- */
        async function loadDocuments(caseId) {
            const box = document.getElementById("docsGallery");
            document.getElementById("docsCount").innerText = '';
            box.innerHTML = "<p class='muted'>Loading...</p>";

            try {
                const res = await fetch(API + "api/cases/documents&case_id=" + encodeURIComponent(caseId));
                const j = await res.json();

                if (j.error) {
                    box.innerHTML = `<p class="text-danger">${escapeHtml(j.error)}</p>`;
                    return;
                }

                const docs = j.documents || [];
                document.getElementById("docsCount").innerText = docs.length ? `${docs.length} files` : '';

                if (!docs.length) {
                    box.innerHTML = "<p class='muted'>No documents</p>";
                    return;
                }

                box.innerHTML = "";
                docs.forEach(d => {
                    const ext = (d.file_name || '').split('.').pop().toLowerCase();
                    let thumbHtml = '';
                    if (isImageExt(d.file_name)) {
                        thumbHtml = `<img src="${escapeHtml(d.file_url)}" class="thumb-img" alt="${escapeHtml(d.file_name)}">`;
                    } else if (ext === "pdf") {
                        thumbHtml = `<div class="text-center"><i class="bi bi-file-earmark-pdf" style="font-size:44px;color:#d9534f"></i></div>`;
                    } else {
                        thumbHtml = `<div class="text-center"><i class="bi bi-file-earmark" style="font-size:44px;color:#6c757d"></i></div>`;
                    }

                    const col = document.createElement("div");
                    col.className = "col-4";
                    col.innerHTML = `
                <a href="${escapeHtml(d.file_url)}" target="_blank" style="text-decoration:none;color:inherit;">
                    <div class="file-card mb-1">${thumbHtml}</div>
                    <div class="file-name text-truncate">${escapeHtml(d.file_name)}</div>
                    <div class="small-muted text-center">${escapeHtml(d.uploaded_by_name || d.uploaded_by || '')}</div>
                </a>
            `;
                    box.appendChild(col);
                });

            } catch (err) {
                console.error(err);
                box.innerHTML = "<p class='text-danger'>Failed to load documents</p>";
            }
        }

        /* --------- Chunked Upload implementation --------- */
        async function uploadFileInChunks(file, caseId, onProgress) {
            const chunkSize = 1.2 * 1024 * 1024; // 1.2MB chunk size (conservative for 2MB limit)
            const totalChunks = Math.ceil(file.size / chunkSize);
            const uploadId = Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
            
            let lastResult = null;
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                
                const fd = new FormData();
                fd.append('case_id', caseId);
                fd.append('upload_id', uploadId);
                fd.append('chunk_index', i);
                fd.append('total_chunks', totalChunks);
                fd.append('file_name', file.name);
                fd.append('chunk', chunk, file.name); // passing filename helps some backends
                
                const res = await fetch(API + "api/cases/upload-chunk", {
                    method: "POST",
                    body: fd
                });
                
                if (!res.ok) throw new Error("Server error " + res.status);
                
                const j = await res.json();
                if (j.error) throw new Error(j.error);
                
                lastResult = j;
                if (onProgress) onProgress(((i + 1) / totalChunks) * 100);
            }
            return lastResult;
        }

        document.getElementById("uploadForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            if (!selectedCase) {
                showAlert("Select a case first", "warning");
                return;
            }

            if (!(selectedCase.id === activeWorkingCaseId && selectedCase.status === 'in-progress')) {
                showAlert("You are not allowed to upload to this case. Start the case first.", "warning");
                return;
            }

            const input = document.getElementById("fileInput");
            if (!input.files || input.files.length === 0) {
                showAlert("Choose at least one file", "warning");
                return;
            }

            const btn = document.getElementById("uploadBtn");
            const prev = btn.innerHTML;
            const progressContainer = document.getElementById("uploadProgressContainer");
            const progressBar = document.getElementById("uploadProgressBar");

            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Uploading...';
            
            if (progressContainer) {
                progressContainer.style.display = 'block';
            }
            if (progressBar) {
                progressBar.style.width = '0%';
            }

            try {
                const files = input.files;
                let totalFiles = files.length;
                let errors = [];

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    console.log(`Processing file ${i+1}/${totalFiles}: ${file.name} (${file.size} bytes)`);
                    
                    // Label button with current file progress
                    btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> [${i+1}/${totalFiles}] ${file.name}...`;
                    
                    try {
                        await uploadFileInChunks(file, selectedCase.id, (p) => {
                            if (progressBar) {
                                progressBar.style.width = p + '%';
                            }
                            // Show percentage in button as well
                            btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> [${i+1}/${totalFiles}] ${Math.round(p)}%...`;
                        });
                    } catch (err) {
                        console.error('File upload failed:', file.name, err);
                        errors.push(`${file.name}: ${err.message}`);
                    }
                }

                if (errors.length > 0) {
                    if (errors.length === totalFiles) {
                        showAlert("All uploads failed: " + errors.join("; "), "danger");
                    } else {
                        showAlert("Some uploads failed: " + errors.join("; "), "warning");
                    }
                } else {
                    showAlert(`Uploaded ${totalFiles} file(s) successfully`, "success");
                }

                input.value = '';
                await loadDocuments(selectedCase.id);
                await loadTimeline(selectedCase.id);
                await loadCaseList(); // sync status

            } catch (err) {
                console.error('Upload process crash:', err);
                showAlert("Upload process failed: " + err.message, "danger");
            } finally {
                btn.disabled = false;
                btn.innerHTML = prev;
                if (progressContainer) {
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        if (progressBar) progressBar.style.width = '0%';
                    }, 2000);
                }
            }
        });

        /* --------- Timeline --------- */
        async function loadTimeline(caseId) {
            const box = document.getElementById("timelineBox");
            box.innerHTML = "<p class='muted'>Loading...</p>";

            try {
                const res = await fetch(API + "api/cases/timeline&case_id=" + encodeURIComponent(caseId));
                const j = await res.json();

                if (j.error || !j.timeline || !j.timeline.length) {
                    box.innerHTML = "<p class='muted'>No activity yet</p>";
                    return;
                }

                box.innerHTML = "";
                j.timeline.forEach(item => {
                    const div = document.createElement("div");
                    div.className = "timeline-entry";
                    const label = (item.type || item.action || "activity").replace(/_/g, " ");
                    const who = item.user_name || item.by || "System";
                    const when = pretty(item.created_at || item.created_at);
                    
                    let meta = "";
                    // Parse details if string
                    let details = item.details || item.data || {};
                    if(typeof details === 'string') {
                        try { details = JSON.parse(details); } catch(e){}
                    }

                    // Check for rejection reason
                    if ((item.type === 'completion_rejected' || item.type === 'docs_rejected' || item.type === 'reopen_rejected') && details.reason) {
                        meta = `<div class="mt-1">
                            <span class="badge bg-danger" title="${escapeHtml(details.reason)}" style="cursor:help;">
                                <i class="bi bi-info-circle"></i> Rejected Reason
                            </span>
                            <small class="text-danger ms-1 d-block mt-1">"${escapeHtml(details.reason)}"</small>
                        </div>`;
                    } else if (Object.keys(details).length) {
                        // meta = `<div class="small-muted mt-1">Info: ${escapeHtml(JSON.stringify(details))}</div>`;
                    }
                    
                    div.innerHTML = `<div class="fw-bold">${escapeHtml(label)}</div>
                             <div class="small-muted">by ${escapeHtml(who)} • ${escapeHtml(when)}</div>
                             ${meta}`;
                    box.appendChild(div);
                });

            } catch (err) {
                console.error(err);
                box.innerHTML = "<p class='text-danger'>Failed to load timeline</p>";
            }
        }

        /* --------- Actions (Start Case, Mark Docs Complete, Request Completion) --------- */
        function renderActions() {
            const area = document.getElementById("actionArea");
            area.innerHTML = "";
            if (!selectedCase) {
                area.innerHTML = "<p class='muted'>No case selected</p>";
                return;
            }

            const isActive = (selectedCase.id === activeWorkingCaseId);
            const status = selectedCase.status || '';

            // If not active and status is "assigned", show Start Case button
            if (!isActive && status === 'assigned') {
                const startBtn = document.createElement("button");
                startBtn.className = "btn btn-primary w-100 mb-2";
                startBtn.innerHTML = '<i class="bi bi-play-circle"></i> Start Case';

                startBtn.onclick = async () => {
                    if (!confirm("Start this case now? This will make it your active case.")) return;

                    try {
                        const res = await fetch(API + "api/cases/start-case", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: `case_id=${encodeURIComponent(selectedCase.id)}`
                        });
                        const j = await res.json();
                        if (j.error) {
                            showAlert(j.error, "danger");
                            return;
                        }
                        showAlert("Case started successfully!", "success");

                        await loadCaseList();
                        selectCase(selectedCase.id);
                    } catch (err) {
                        console.error(err);
                        showAlert("Failed to start case", "danger");
                    }
                };

                area.appendChild(startBtn);

                if (activeWorkingCaseId) {
                    const msg = document.createElement("div");
                    msg.className = "mt-2 small-muted";
                    msg.innerHTML = `You already have active case <b>#${activeWorkingCaseId}</b>. Put it on hold first.`;
                    area.appendChild(msg);
                }
                return;
            }

            // If active and in-progress => show Mark Docs + Request Completion (NO HOLD BUTTON)
            if (isActive && status === 'in-progress') {
                
                const markBtn = document.createElement("button");
                markBtn.className = "btn btn-primary w-100 mb-2";
                markBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Mark Documents Complete';

                markBtn.onclick = async () => {
                    if (!confirm("Mark documents complete and notify manager?")) return;
                    try {
                        const r = await fetch(API + "api/cases/mark-docs-complete", {
                            method: "POST",
                            headers: {"Content-Type": "application/x-www-form-urlencoded"},
                            body: `case_id=${encodeURIComponent(selectedCase.id)}`
                        });
                        const j = await r.json();
                        if (j.error) {
                            showAlert(j.error, "danger");
                            return;
                        }
                        showAlert("Documents marked complete. Waiting for manager approval.", "success");
                        await loadCaseList();
                        selectCase(selectedCase.id);
                    } catch (err) {
                        console.error(err);
                        showAlert("Action failed", "danger");
                    }
                };

                area.appendChild(markBtn);

                const reqBtn = document.createElement("button");
                reqBtn.className = "btn btn-outline-dark w-100 mt-2";
                reqBtn.innerHTML = '<i class="bi bi-send"></i> Request Case Completion';
                reqBtn.onclick = async (e) => {
                    if (!confirm("Request case completion?")) return;
                    
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Sending...';
                    
                    try {
                        const r = await fetch(API + "api/cases/request-completion", {
                            method: "POST",
                            headers: {"Content-Type": "application/x-www-form-urlencoded"},
                            body: `case_id=${encodeURIComponent(selectedCase.id)}`
                        });
                        
                        const j = await r.json();
                        
                        if (j.error || !j.success) {
                            showAlert(j.error || "Failed to request completion", "danger");
                            btn.disabled = false;
                            btn.innerHTML = originalText;
                            return;
                        }
                        
                        showAlert(j.message || "Completion requested. Manager will review.", "success");
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await loadCaseList();
                        if (selectedCase && selectedCase.id) {
                            selectCase(selectedCase.id);
                        }
                        
                    } catch (err) {
                        console.error("Error:", err);
                        showAlert("Action failed: " + err.message, "danger");
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }
                };
                area.appendChild(reqBtn);
                return;
            }

            // REMOVED: If case is on-hold, show Resume button
            // Employees cannot resume cases - only managers can

            // SPECIAL CASE: Completed cases can request reopen
            if (status === 'completed') {
                const reopenBtn = document.createElement("button");
                reopenBtn.className = "btn btn-warning w-100 mb-2";
                reopenBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Request Reopen';
                reopenBtn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!confirm("Request to reopen this completed case?")) return;
                    
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Requesting...';
                    
                    try {
                        const r = await fetch(API + "api/cases/request-reopen", {
                            method: "POST",
                            headers: {"Content-Type": "application/x-www-form-urlencoded"},
                            body: `case_id=${encodeURIComponent(selectedCase.id)}`
                        });
                        
                        const j = await r.json();
                        
                        if (j.error || !j.success) {
                            showAlert(j.error || "Failed to request reopen", "danger");
                            btn.disabled = false;
                            btn.innerHTML = originalText;
                            return;
                        }
                        
                        showAlert(j.message || "Reopen request sent to manager", "success");
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await loadCaseList();
                        await loadTimeline(selectedCase.id);
                        
                    } catch (err) {
                        console.error("Error:", err);
                        showAlert("Failed to request reopen: " + err.message, "danger");
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }
                };
                area.appendChild(reopenBtn);
                
                const msg = document.createElement("div");
                msg.className = "small-muted mt-2";
                msg.innerText = "This case is completed. You can request to reopen it if needed.";
                area.appendChild(msg);
                return;
            }

            // For all other statuses
            if (!isActive && status !== 'assigned' && status !== 'completed' && status !== 'on-hold') {
                area.innerHTML += `<div class="small-muted mt-2">Case is in status <b>${escapeHtml(status)}</b>. Actions are available only for your active case.</div>`;
            }
        }

        /* --------- Background Polling --------- */
        let lastCaseSignature = "";

        // Helper to generate a unique signature for the case list
        function getSignature(cases) {
            if (!cases || !cases.length) return "empty";
            // Signature based on ID and Status (and Manager for assignment changes)
            return cases.map(c => `${c.id}:${c.status}:${c.assigned_manager}`).join("|");
        }

        async function checkForUpdates() {
            try {
                // Silent fetch - don't show loaders
                const res = await fetch(API + "api/employee/my-cases");
                const j = await res.json();
                
                if (j.error) return; // Silent fail on error
                
                const newCases = j.cases || [];
                const newSig = getSignature(newCases);
                
                // Initialize signature on first load if not set
                if (!lastCaseSignature && allCases.length) {
                    lastCaseSignature = getSignature(allCases);
                }

                // If signature changed, reload UI
                if (lastCaseSignature && newSig !== lastCaseSignature) {
                    console.log("Changes detected, refreshing list...");
                    lastCaseSignature = newSig;
                    
                    // Optional: Show toast
                    const alertBox = document.getElementById("empAlert");
                    if (alertBox) {
                        alertBox.innerHTML = `<div class="alert alert-info alert-dismissible fade show">
                            <i class="bi bi-bell"></i> New updates found. List refreshed.
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>`;
                        setTimeout(() => alertBox.innerHTML = "", 3000);
                    }
                    
                    await loadCaseList();
                } else if (!lastCaseSignature) {
                    // First time setting signature
                    lastCaseSignature = newSig;
                }
                
            } catch (e) {
                console.error("Polling error:", e);
            }
        }

        // Start polling every 5 seconds
        setInterval(checkForUpdates, 5000);

        function checkScroll() {
            const box = document.getElementById("caseListBox");
            const indicator = document.getElementById("scrollIndicator");
            if (!box || !indicator) return;
            
            // Show indicator if scrollable and not at bottom
            const tolerance = 5;
            if (box.scrollHeight > box.clientHeight && (box.scrollTop + box.clientHeight < box.scrollHeight - tolerance)) {
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        }

        /* --------- Initialize --------- */
        loadCaseList().then(() => {
            // Set initial signature after first load
            lastCaseSignature = getSignature(allCases);
        });
    </script>

<!-- SSE Realtime Updates removed -->
    <!-- Bootstrap JS (Required for Dropdowns) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>