<?php
require_once __DIR__ . '/../../app/helpers/session.php';
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['manager', 'admin'])) {
    header("Location: ../login.php");
    exit;
}
$active = 'dashboard';
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Manager Dashboard - Approvals</title>
    <?php $pwaPath = '../'; include __DIR__ . '/../layout/pwa_head.php'; ?>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

<link rel="stylesheet" href="../assets/css/manager-index.css">
</head>

<body>
    <?php include __DIR__ . '/../layout/sidebar.php'; ?>
    <div class="content">
        <?php include __DIR__ . '/../layout/topbar.php'; ?>

        <div class="container-fluid">
            <div class="page-header">
                <h3><i class="bi bi-check-circle"></i> Pending Approvals</h3>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <div class="section-card">
                        <h5><i class="bi bi-hourglass-split"></i> Cases Awaiting Your Action</h5>
                        <div id="pendingList">
                            <div class="empty-state">
                                <div class="loading-spinner"></div>
                                <p class="mt-2">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="section-card">
                        <h5><i class="bi bi-briefcase"></i> Your Assigned Cases</h5>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-md-8">
                                <input type="text" id="filterName" class="form-control form-control-sm" placeholder="Search client name..." oninput="renderAssigned()">
                            </div>
                            <div class="col-md-4">
                                <select id="filterStatus" class="form-select form-select-sm" onchange="renderAssigned()">
                                    <option value="">All Status</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="waiting-doc-approval">Waiting Docs</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        <div id="assignedList">
                            <div class="empty-state">
                                <div class="loading-spinner"></div>
                                <p class="mt-2">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Drawer -->
        <div id="drawer" aria-hidden="true">
            <div class="drawer-header">
                <h5 id="drawerTitle">Case Details</h5>
                <button id="closeDrawer">&times;</button>
            </div>

            <div class="drawer-content" id="drawerBody">
                <div class="drawer-info-section">
                    <p><b><i class="bi bi-person"></i> Client:</b> <span id="dClient"></span></p>
                    <p><b><i class="bi bi-telephone"></i> Phone:</b> <span id="dPhone"></span></p>
                    <p><b><i class="bi bi-tag"></i> Type:</b> <span id="dType"></span></p>
                    <p><b><i class="bi bi-flag"></i> Status:</b> <span id="dStatus"></span></p>
                </div>

                <h6 class="drawer-section-title"><i class="bi bi-paperclip"></i> Documents</h6>
                <div id="dDocs"></div>

                <h6 class="drawer-section-title mt-4"><i class="bi bi-clock-history"></i> Timeline</h6>
                <div id="dTimeline"></div>
            </div>

            <div class="drawer-actions" id="dActions"></div>
        </div>

    </div>

    <script>
        const API = "../../index.php?path=";
        let pendingCases = [];
        let assignedCases = [];
        let drawerCase = null;

        // helpers
        function escapeHtml(s) {
            if (!s) return '';
            return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", "&#039;");
        }

        function showTemp(msg, type = 'info') {
            const container = document.getElementById('pendingList');
            // small temporary message at top
            const el = document.createElement('div');
            el.className = 'alert alert-' + type;
            el.innerText = msg;
            document.querySelector('.container-fluid').prepend(el);
            setTimeout(() => el.remove(), 3000);
        }

        // load pending approvals
        async function loadPending(){
            const box = document.getElementById('pendingList');
            box.innerHTML = '<div class="empty-state"><div class="loading-spinner"></div><p class="mt-2">Loading...</p></div>';

            try {
                const res = await fetch(API + 'api/cases/pending-approvals');
                const j = await res.json();
                
                console.log('Pending approvals response:', j);
                
                if (j.error) { 
                    box.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-circle"></i><p class="text-danger">${escapeHtml(j.error)}</p></div>`; 
                    return; 
                }
                
                pendingCases = j.cases || [];
                
                if (!pendingCases.length) { 
                    box.innerHTML = '<div class="empty-state"><i class="bi bi-check-circle"></i><p>No pending approvals</p></div>'; 
                    return; 
                }

                box.innerHTML = '';
                pendingCases.forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'case-row';
                    
                    let badgeClass = 'bg-info';
                    if (c.status === 'awaiting-completion-approval') badgeClass = 'bg-dark';
                    if (c.status === 'reopen-requested') badgeClass = 'bg-warning';
                    
                    div.innerHTML = `<div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                  <div class="case-client-name">${escapeHtml(c.client_name)}</div>
                                  <div class="case-meta">
                                    <span><i class="bi bi-tag"></i> ${escapeHtml(c.case_type)}</span>
                                    ${c.priority ? `<span><i class="bi bi-flag"></i> ${escapeHtml(c.priority)}</span>` : ''}
                                  </div>
                                  ${c.employee_name ? `<div class="employee-name"><i class="bi bi-person-badge"></i> ${escapeHtml(c.employee_name)}</div>` : ''}
                                </div>
                                <div class="text-end">
                                  <span class="badge badge-status ${badgeClass}">${escapeHtml(c.status).replace(/-/g, ' ')}</span>
                                </div>
                             </div>`;
                    div.onclick = ()=> openDrawer(c.id);
                    box.appendChild(div);
                });

            } catch (err) { 
                console.error(err); 
                box.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load</p></div>'; 
            }
        }

        // load assigned cases by manager (for listing)
        async function loadAssigned() {
            try {
                const res = await fetch(API + 'api/cases/list');
                const j = await res.json();
                if (j.error) {
                    console.error(j.error);
                    return;
                }
                
                // Filter for this manager
                assignedCases = (j.cases || []).filter(c => c.assigned_manager == <?php echo (int)$_SESSION['user_id']; ?>);
                renderAssigned();
                
            } catch (err) {
                console.error(err);
                document.getElementById('assignedList').innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load</p></div>';
            }
        }

        function renderAssigned() {
            const box = document.getElementById('assignedList');
            const term = (document.getElementById('filterName').value || '').toLowerCase();
            const status = document.getElementById('filterStatus').value || '';
            
            let list = assignedCases;
            
            if (term) {
                list = list.filter(c => c.client_name.toLowerCase().includes(term));
            }
            if (status) {
                list = list.filter(c => c.status === status);
            }
            
            if (!assignedCases.length) {
                box.innerHTML = '<div class="empty-state"><i class="bi bi-inbox"></i><p>No assigned cases</p></div>';
                return;
            }
            
            if (!list.length) {
                box.innerHTML = '<div class="empty-state"><p class="text-muted">No matching cases found</p></div>';
                return;
            }
            
            box.innerHTML = '';
            list.forEach(c => {
                let badgeClass = 'bg-secondary';
                if (c.status === 'in-progress') badgeClass = 'bg-warning';
                if (c.status === 'waiting-doc-approval') badgeClass = 'bg-info';
                if (c.status === 'awaiting-completion-approval') badgeClass = 'bg-dark';
                if (c.status === 'reopen-requested') badgeClass = 'bg-warning';
                if (c.status === 'completed') badgeClass = 'bg-success';

                const d = document.createElement('div');
                d.className = 'case-row';
                d.innerHTML = `<div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                          <div class="case-client-name">${escapeHtml(c.client_name)}</div>
                          <div class="case-meta"><i class="bi bi-tag"></i> ${escapeHtml(c.case_type)}</div>
                        </div>
                        <div><span class="badge badge-status ${badgeClass}">${escapeHtml(c.status).replace(/-/g, ' ')}</span></div>
                       </div>`;
                d.onclick = () => openDrawer(c.id);
                box.appendChild(d);
            });
        }

        async function openDrawer(caseId) {
            // fetch case details (we can find from pending or assigned)
            const all = pendingCases.concat(assignedCases);
            let c = all.find(x => Number(x.id) === Number(caseId));
            // if not found, call case detail endpoint or list
            if (!c) {
                // fallback fetch single
                try {
                    const res = await fetch(API + 'api/cases/list');
                    const j = await res.json();
                    c = (j.cases || []).find(x => Number(x.id) === Number(caseId));
                } catch (e) {
                    console.error(e);
                }
            }

            if (!c) {
                showTemp('Case not found', 'danger');
                return;
            }
            drawerCase = c;

            document.getElementById('drawerTitle').innerText = `Case #${c.id}`;
            document.getElementById('dClient').innerText = c.client_name || '';
            document.getElementById('dPhone').innerText = c.client_phone || '';
            document.getElementById('dType').innerText = c.case_type || '';
            document.getElementById('dStatus').innerText = c.status || '';

            // load docs/timeline
            loadDrawerDocs(c.id);
            loadDrawerTimeline(c.id);

            // actions
            renderDrawerActions(c);

            document.getElementById('drawer').classList.add('open');
        }

        document.getElementById('closeDrawer').addEventListener('click', () => {
            document.getElementById('drawer').classList.remove('open');
        });

        async function loadDrawerDocs(caseId) {
            const target = document.getElementById('dDocs');
            target.innerHTML = '<div class="text-center py-3"><div class="loading-spinner"></div></div>';
            try {
                const res = await fetch(API + 'api/cases/documents&case_id=' + encodeURIComponent(caseId));
                const j = await res.json();
                if (j.error) {
                    target.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-circle"></i><p class="text-danger">${escapeHtml(j.error)}</p></div>`;
                    return;
                }
                const docs = j.documents || [];
                if (!docs.length) {
                    target.innerHTML = '<div class="empty-state"><i class="bi bi-file-earmark"></i><p>No documents</p></div>';
                    return;
                }
                target.innerHTML = '';
                docs.forEach(d => {
                    const div = document.createElement('div');
                    div.className = 'doc-item';
                    div.innerHTML = `<div class="d-flex justify-content-between align-items-center">
                                <div class="flex-grow-1">
                                  <strong>${escapeHtml(d.file_name)}</strong><br>
                                  <small class="text-muted"><i class="bi bi-person"></i> ${escapeHtml(d.uploaded_by_name || d.uploaded_by)} • <i class="bi bi-clock"></i> ${escapeHtml(d.uploaded_at || '')}</small>
                                </div>
                                <div>
                                  <a href="${escapeHtml(d.file_url)}" target="_blank" class="btn btn-sm btn-outline-primary me-2"><i class="bi bi-eye"></i></a>
                                  <button class="btn btn-sm btn-outline-danger" onclick="deleteDoc(${d.id})"><i class="bi bi-trash"></i></button>
                                </div>
                             </div>`;
                    target.appendChild(div);
                });
            } catch (err) {
                console.error(err);
                target.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load docs</p></div>';
            }
        }

        // delete doc (admin only — backend will guard)
        async function deleteDoc(docId) {
            if (!confirm('Delete this document?')) return;
            try {
                const res = await fetch(API + 'api/cases/document-delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'doc_id=' + encodeURIComponent(docId)
                });
                const j = await res.json();
                if (j.error) {
                    showTemp(j.error, 'danger');
                    return;
                }
                showTemp('Document deleted', 'success');
                loadDrawerDocs(drawerCase.id);
            } catch (err) {
                console.error(err);
                showTemp('Failed to delete', 'danger');
            }
        }

        async function loadDrawerTimeline(caseId){
            const target = document.getElementById('dTimeline'); 
            target.innerHTML = '<div class="text-center py-3"><div class="loading-spinner"></div></div>';
            
            try {
                const res = await fetch(API + 'api/cases/timeline&case_id=' + encodeURIComponent(caseId));
                const j = await res.json();
                
                if (j.error || !j.timeline || !j.timeline.length) { 
                    target.innerHTML = '<div class="empty-state"><i class="bi bi-clock-history"></i><p>No timeline</p></div>'; 
                    window.currentTimeline = [];
                    return; 
                }
                
                // Store timeline globally
                window.currentTimeline = j.timeline;
                
                target.innerHTML = '';
                j.timeline.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'timeline-item';
                    div.innerHTML = `<div class="timeline-icon"><i class="bi bi-circle-fill"></i></div>
                                 <div><strong>${escapeHtml(item.type || item.action || 'activity').replace(/_/g,' ')}</strong></div>
                                 <div class="small text-muted"><i class="bi bi-person"></i> ${escapeHtml(item.user_name || item.by || 'System')} • <i class="bi bi-clock"></i> ${escapeHtml(item.created_at)}</div>
                                 ${ item.data ? `<div class="small text-muted mt-1"><i class="bi bi-info-circle"></i> ${escapeHtml(JSON.stringify(item.data))}</div>` : '' }`;
                    target.appendChild(div);
                });
            } catch (err) { 
                console.error(err); 
                target.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p class="text-danger">Failed to load timeline</p></div>'; 
                window.currentTimeline = [];
            }
        }

        function hasReopenRequest() {
            if (!window.currentTimeline) return false;
            
            const reopenRequested = window.currentTimeline.find(t => t.type === 'reopen_requested');
            const reopenApproved = window.currentTimeline.find(t => t.type === 'case_reopened');
            const reopenRejected = window.currentTimeline.find(t => t.type === 'reopen_rejected');
            
            return reopenRequested && !reopenApproved && !reopenRejected;
        }

        // drawer actions: Approve Docs / Approve Completion / Approve Reopen / Hold / Resume
        function renderDrawerActions(caseObj){
            const container = document.getElementById('dActions'); 
            container.innerHTML = '';
            if (!caseObj) return;

            // Allow manager to hold in-progress cases
            if (caseObj.status === 'in-progress') {
                const holdBtn = document.createElement('button');
                holdBtn.className = 'btn btn-warning w-100 mb-2';
                holdBtn.innerText = 'Hold Case';
                holdBtn.onclick = async ()=> {
                    if (!confirm('Put this case on hold? Employee will not be able to work on it.')) return;
                    await actionCase('api/cases/hold-case', caseObj.id);
                };
                container.appendChild(holdBtn);
            }
            
            // Allow manager to resume on-hold cases
            if (caseObj.status === 'on-hold') {
                const resumeBtn = document.createElement('button');
                resumeBtn.className = 'btn btn-success w-100 mb-2';
                resumeBtn.innerText = 'Resume Case';
                resumeBtn.onclick = async ()=> {
                    if (!confirm('Resume this case? It will become active for the employee.')) return;
                    await actionCase('api/cases/resume-case', caseObj.id);
                };
                container.appendChild(resumeBtn);
            }

            // Approve documents
            if (caseObj.status === 'waiting-doc-approval') {
                const btn = document.createElement('button');
                btn.className = 'btn btn-success w-100 mb-2';
                btn.innerText = 'Approve Documents';
                btn.onclick = async ()=> {
                    if (!confirm('Approve documents for this case?')) return;
                    await actionCase('api/cases/approve-docs', caseObj.id);
                };
                container.appendChild(btn);
                
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'btn btn-danger w-100 mb-2';
                rejectBtn.innerText = 'Reject Documents';
                rejectBtn.onclick = async ()=> {
                    if (!confirm("Reject documents? This will return the case to In Progress.")) return;
                    await actionCase('api/cases/reject-docs', caseObj.id);
                };
                container.appendChild(rejectBtn);
            }

            // Approve completion
            if (caseObj.status === 'awaiting-completion-approval') {
                const btn2 = document.createElement('button');
                btn2.className = 'btn btn-primary w-100 mb-2';
                btn2.innerText = 'Approve Case Completion';
                btn2.onclick = async ()=> {
                    if (!confirm('Approve completion for this case?')) return;
                    await actionCase('api/cases/approve-completion', caseObj.id);
                };
                container.appendChild(btn2);
                
                const rejectBtn2 = document.createElement('button');
                rejectBtn2.className = 'btn btn-danger w-100 mb-2';
                rejectBtn2.innerText = 'Reject Completion';
                rejectBtn2.onclick = async ()=> {
                    const reason = prompt('Reason for rejecting completion:');
                    if (!reason) return;
                    await actionCaseWithReason('api/cases/reject-completion', caseObj.id, reason);
                };
                container.appendChild(rejectBtn2);
            }
            
            // For reopen-requested cases - show approve/reject reopen buttons
            if (caseObj.status === 'reopen-requested') {
                const reopenBtn = document.createElement('button');
                reopenBtn.className = 'btn btn-success w-100 mb-2';
                reopenBtn.innerText = 'Approve Reopen Request';
                reopenBtn.onclick = async ()=> {
                    if (!confirm('Reopen this case? It will change status back to in-progress.')) return;
                    await actionCase('api/cases/approve-reopen', caseObj.id);
                };
                container.appendChild(reopenBtn);
                
                const rejectReopenBtn = document.createElement('button');
                rejectReopenBtn.className = 'btn btn-danger w-100 mb-2';
                rejectReopenBtn.innerText = 'Reject Reopen Request';
                rejectReopenBtn.onclick = async ()=> {
                    const reason = prompt('Reason for rejecting reopen request:');
                    if (!reason) return;
                    await actionCaseWithReason('api/cases/reject-reopen', caseObj.id, reason);
                };
                container.appendChild(rejectReopenBtn);
            }
            
            // For completed cases without pending reopen request
            if (caseObj.status === 'completed') {
                container.innerHTML = '<div class="text-muted small">Case completed. No pending requests.</div>';
            }
            
            // For assigned cases
            if (caseObj.status === 'assigned') {
                container.innerHTML = '<div class="text-muted small">Case is assigned. Waiting for employee to start.</div>';
            }
            
            // For other statuses
            if (!['waiting-doc-approval', 'awaiting-completion-approval', 'reopen-requested', 'completed', 'assigned', 'in-progress', 'on-hold'].includes(caseObj.status)) {
                container.innerHTML = '<div class="text-muted small">No actions available for this status.</div>';
            }
        }

        async function actionCase(endpoint, caseId) {
            try {
                const res = await fetch(API + endpoint, {
                    method:'POST',
                    headers: {'Content-Type':'application/x-www-form-urlencoded'},
                    body: 'case_id=' + encodeURIComponent(caseId)
                });
                const j = await res.json();
                if (j.error || !j.success) { 
                    showTemp(j.error || 'Action failed','danger'); 
                    return; 
                }
                showTemp(j.message || 'Action completed successfully','success');
                loadPending(); 
                loadAssigned();
                openDrawer(caseId);
            } catch(err){ 
                console.error(err); 
                showTemp('Action failed','danger'); 
            }
        }

        async function actionCaseWithReason(endpoint, caseId, reason) {
            try {
                const res = await fetch(API + endpoint, {
                    method:'POST',
                    headers: {'Content-Type':'application/x-www-form-urlencoded'},
                    body: `case_id=${encodeURIComponent(caseId)}&reason=${encodeURIComponent(reason)}`
                });
                const j = await res.json();
                if (j.error || !j.success) { 
                    showTemp(j.error || 'Action failed','danger'); 
                    return; 
                }
                showTemp(j.message || 'Action completed successfully','success');
                loadPending(); 
                loadAssigned();
                openDrawer(caseId);
            } catch(err){ 
                console.error(err); 
                showTemp('Action failed','danger'); 
            }
        }

        window.addEventListener('load', () => {
            loadPending();
            loadAssigned();

            /* --------- Background Polling --------- */
            let lastPendingSig = "";
            let lastAssignedSig = "";
            
            function getSig(list) {
                if (!list || !list.length) return "empty";
                return list.map(c => `${c.id}:${c.status}`).join("|");
            }

            async function checkManagerUpdates() {
                // Check Pending
                try {
                    const r = await fetch(API + 'api/cases/pending-approvals');
                    const j = await r.json();
                    const list = j.cases || [];
                    const newSig = getSig(list);
                    
                    if (lastPendingSig && newSig !== lastPendingSig) {
                        console.log("Pending approvals changed");
                        showTemp("New approval requests found", "info");
                        loadPending();
                        lastPendingSig = newSig;
                    } else if (!lastPendingSig) {
                        lastPendingSig = newSig;
                    }
                } catch(e) {}

                // Check Assigned
                try {
                    const r = await fetch(API + 'api/cases/list');
                    const j = await r.json();
                    const all = j.cases || [];
                    // Filter for this manager happens in loadAssigned, but we need to detect changes here too
                    // We'll just check the signature of ALL cases that belong to this manager
                    // Note: We don't have manager ID here easily without parsing PHP or extra API
                    // But loadAssigned() filters using PHP session ID in the previous code?
                    // Wait, previous code used: `c.assigned_manager == <?php echo (int)$_SESSION['user_id']; ?>`
                    // We need that ID here too.
                    
                    // Let's assume the list API returns everything and we filter same way
                    const myCases = all.filter(c => c.assigned_manager == <?php echo (int)$_SESSION['user_id']; ?>);
                    const newSig = getSig(myCases);
                    
                    if (lastAssignedSig && newSig !== lastAssignedSig) {
                        console.log("Assigned cases changed");
                        loadAssigned();
                        lastAssignedSig = newSig;
                    } else if (!lastAssignedSig) {
                        lastAssignedSig = newSig;
                    }
                } catch(e) {}
            }

            setInterval(checkManagerUpdates, 5000);

            // Init
            // The initial calls to loadPending() and loadAssigned() are already above.
            // The polling helper handles initialization of lastPendingSig/lastAssignedSig on its first run.
        });
    </script>

</body>

</html>