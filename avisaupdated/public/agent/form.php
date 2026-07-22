<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_auth();
require_role('agent');

$active = 'new_application';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent - New Application</title>
    <!-- <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"> -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- <link rel="stylesheet" href="../assets/css/agent-dashboard.css"> -->
    <style>
        :root {
            --primary: #6366f1;
            --bg-dark: #f8fafc;
            --bg-card: #ffffff;
            --text-light: #0f172a;
            --border: #e2e8f0;
        }
        /* body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: 'Outfit', sans-serif;
        } */
    
        .form-container {
            width: 100%;
            background: var(--bg-card);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid var(--border);
        }
        .form-label {
            color: #64748b;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .form-control, .form-select {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #0f172a;
        }
        .form-control:focus, .form-select:focus {
            background: #ffffff;
            color: #0f172a;
            border-color: var(--primary);
            box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
        }
        .btn-primary {
            background: var(--primary);
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .btn-primary:hover {
            background: #4f46e5;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
        }
        
        /* History Panel Styles */
        .history-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-light);
            position: sticky;
            top: 2rem;
            border-radius: 12px;
            padding: 1.5rem;
            max-height: calc(100vh - 4rem);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .history-list {
            overflow-y: auto;
            flex: 1;
            padding-right: 5px;
        }
        
        .history-list::-webkit-scrollbar {
            width: 4px;
        }
        
        .history-list::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
        }
        
        .history-item {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            transition: background 0.2s;
        }
        
        .history-item:last-child {
            border-bottom: none;
        }
        
        .history-item:hover {
            background: rgba(0,0,0,0.02);
        }

        .history-item .text-muted {
            color: #64748b !important;
        }
    </style>
    <!-- Ensure Bootstrap JS is loaded for modal -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>

<?php include __DIR__ . '/../layout/sidebar.php'; ?>

<div class="content">
    
    <?php include __DIR__ . '/../layout/topbar.php'; ?>

    <div class="container-fluid pb-5">
        <div class="page-header mt-4">
            <h3 id="pageTitle">New Client Application</h3>
            <a href="index.php" class="btn btn-outline-dark d-inline-flex align-items-center gap-2">Back to Dashboard</a>
        </div>

        <div class="row g-4">
            <!-- LEFT COLUMN: FORM (70% ~ col-lg-8) -->
            <div class="col-lg-8">
                <div class="form-container">
                    <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                        <div>
                            <img src="/assets/images/avelogo.png" alt="A Visa Experts" style="max-height: 120px; max-width: 100%;">
                        </div>
                        <div class="text-end">
                            <h2 class="mb-0" style="font-weight: 800; color: #1e293b; letter-spacing: 1px;">A VISA EXPERTS</h2>
                            <!-- <small class="text-muted" style="letter-spacing: 2px;">VISA EXPERTS</small> -->
                        </div>
                    </div>
                    <form id="appForm" onsubmit="submitApplication(event)">
                        
                        <div class="row g-3">
                            <input type="hidden" name="id" id="editAppId">
                            
                            <!-- ROW 1: DATE & GENDER -->
                            <div class="col-md-6">
                                <label class="form-label">Date</label>
                                <input type="date" name="submission_date" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                            </div>
                             <div class="col-6">
                                <label class="form-label">Contact Number</label>
                                <input type="text" name="contact_number" id="contactNumber" class="form-control" oninput="syncSearch(this.value)">
                            </div>
                            
                            <div class="col-md-6">
                                <label class="form-label">Gender</label>
                                <select name="gender" class="form-select">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <!-- ROW 2: NAME & AGE -->
                            <div class="col-md-8">
                                <label class="form-label">Name</label>
                                <input type="text" name="client_name" class="form-control">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Age</label>
                                <input type="number" name="age" class="form-control">
                            </div>

                            <!-- ROW 3: SPOUSE -->
                            <div class="col-md-8">
                                <label class="form-label">Spouse Name</label>
                                <input type="text" name="spouse_name" class="form-control">
                            </div>
                             <div class="col-md-4">
                                <label class="form-label">Age</label>
                                <input type="number" name="spouse_age" class="form-control">
                            </div>

                            <!-- ROW 4: KIDS -->
                            <div class="col-12">
                                <label class="form-label">Kids (If any)</label>
                                <input type="text" name="kids" class="form-control" placeholder="Names and ages...">
                            </div>

                             <!-- ROW 5: ADDRESS -->
                            <div class="col-12">
                                <label class="form-label">Full Address</label>
                                <input type="text" name="address" class="form-control">
                            </div>
                            
                            <!-- ROW 6: CITY, STATE, PINCODE -->
                            <div class="col-md-4">
                                <label class="form-label">City</label>
                                <input type="text" name="city" class="form-control">
                            </div>
                             <div class="col-md-4">
                                <label class="form-label">State</label>
                                <input type="text" name="state" class="form-control">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Pincode</label>
                                <input type="text" name="pincode" class="form-control">
                            </div>
                            
                            <!-- ROW 7: CONTACT NUMBER -->
                           

                            <!-- ROW 8: REQUIRED VISA -->
                            <div class="col-md-12">
                                <label class="form-label">Required Visa</label>
                                <div class="input-group">
                                    <select name="visa_type" id="visaTypeSelect" class="form-select">
                                        <option value="">Select...</option>
                                        <option value="Tourist">Tourist</option>
                                        <option value="Student">Student</option>
                                        <option value="Work">Work</option>
                                        <option value="PR">PR</option>
                                        <option value="Business">Business</option>
                                    </select>
                                    <input type="text" name="visa_type_other" id="visaTypeInput" class="form-control" placeholder="Enter Custom Visa Type" style="display: none;">
                                    <button class="btn btn-outline-secondary" type="button" onclick="toggleCustomVisa()">
                                        <i class="bi bi-plus-lg" id="visaToggleIcon"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- ROW 9: TRAVEL HISTORY -->
                            <div class="col-12">
                                <label class="form-label">Travel History</label>
                                <input type="text" name="travel_history" class="form-control">
                            </div>

                            <!-- ROW 10: REFUSAL -->
                            <div class="col-12">
                                 <label class="form-label">Refusal (If any)</label>
                                <input type="text" name="refusal_history" class="form-control">
                            </div>
                            
                            <!-- ROW 11: PASSPORT VALIDITY -->
                             <div class="col-md-12">
                                <label class="form-label">Passport Validity</label>
                                <input type="date" name="passport_validity" class="form-control">
                            </div>

                            <!-- ROW 12: EDUCATION & IELTS -->
                            <div class="col-12">
                                <label class="form-label">Education</label>
                                <input type="text" name="education" class="form-control">
                            </div>
                             <div class="col-12">
                                <label class="form-label">IELTS Score (If Any)</label>
                                <input type="text" name="ielts_score" class="form-control">
                            </div>

                            <!-- ROW 14-16: OCCUPATION, INCOME, BANK -->
                            <div class="col-12">
                                <label class="form-label">Occupation</label>
                                <input type="text" name="occupation" class="form-control">
                            </div>
                             <div class="col-12">
                                <label class="form-label">Income</label>
                                <input type="text" name="income" class="form-control">
                            </div>
                             <div class="col-12">
                                <label class="form-label">Bank Balance</label>
                                <input type="text" name="bank_balance" class="form-control">
                            </div>

                            <!-- ROW 17: REMARKS -->
                            <div class="col-12">
                                <label class="form-label">Remarks</label>
                                <textarea name="remarks" class="form-control" rows="4"></textarea>
                            </div>

                            <!-- FOOTER: CASE MANAGER & SIGNATURE PREVIEW -->
                            <div class="col-md-6 mt-5">
                                <label class="form-label text-muted small text-uppercase">Case Manager</label>
                                <div class="border-bottom border-dark pb-1"><?php echo htmlspecialchars($_SESSION['user_name']); ?></div>
                            </div>
                            <!-- <div class="col-md-6 mt-5 text-end">
                                <label class="form-label text-start text-muted small text-uppercase d-block">Signature</label>
                                <div class="border-bottom border-dark pb-1">&nbsp;</div>
                            </div> -->

                            <!-- ROW 18: MEETINGS -->
                            <!-- <div class="col-12 mt-4">
                                <label class="form-label d-block text-muted small text-uppercase fw-bold mb-2">Required Meetings</label>
                                <div class="d-flex gap-4 flex-wrap">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" name="meeting_team" id="meetingTeam" value="Yes">
                                        <label class="form-check-label" for="meetingTeam">Team Meeting</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" name="meeting_senior" id="meetingSenior" value="Yes">
                                        <label class="form-check-label" for="meetingSenior">Senior Meeting</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" name="meeting_kaveesh" id="meetingKaveesh" value="Yes">
                                        <label class="form-check-label" for="meetingKaveesh">Kaveesh Sir Meeting</label>
                                    </div>
                                </div>
                            </div> -->

                            <div class="col-12 mt-5">
                                <div class="d-flex justify-content-center gap-3 align-items-center flex-wrap">
                                    <input type="hidden" name="lead_outcome" id="leadOutcome" value="Submitted">
                                    
                                    <button type="button" class="btn btn-outline-danger px-4 outcome-btn" data-type="danger" onclick="selectOutcome('Time Waste', this)">
                                        <i class="bi bi-x-circle me-2"></i>Time Waste
                                    </button>
                                    
                                    <button type="button" class="btn btn-outline-warning px-4 outcome-btn" data-type="warning" onclick="selectOutcome('Later', this)">
                                        <i class="bi bi-clock me-2"></i>Later
                                    </button>
                                    
                                    <button type="button" class="btn btn-outline-success px-4 outcome-btn" data-type="success" onclick="selectOutcome('Interested', this)">
                                        <i class="bi bi-check-circle me-2"></i>Interested
                                    </button>
                                    
                                    <button type="submit" class="btn btn-primary px-5 py-2" id="btnSubmit">
                                        Submit Application
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                    
                    <div id="loadingOverlay" style="display:none; position: absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); z-index:10; border-radius:12px; justify-content:center; align-items:center;">
                        <div class="spinner-border text-primary"></div>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: HISTORY (30% ~ col-lg-4) -->
            <div class="col-lg-4">
                <div class="history-card">
                    <h5 class="mb-3 pb-2 border-bottom border-secondary">Previous History</h5>
                    
                    <!-- Manual Search Option -->
                    <div class="mb-3 position-relative">
                        <input type="text" id="manualSearchInput" class="form-control ps-5" placeholder="Search number..." style="border-radius: 20px; background: #f1f5f9; border:none;" oninput="checkHistory(this.value)">
                        <i class="bi bi-search position-absolute text-muted" style="top: 50%; left: 15px; transform: translateY(-50%);"></i>
                    </div>

                    <div id="historyLoader" class="text-center my-3" style="display:none;">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>
                    
                    <div id="historyList" class="history-list">
                        <p class="small text-center my-4">
                            <i class="bi bi-search d-block fs-4 mb-2"></i>
                            Enter a contact number to search history
                        </p>
                    </div>
                </div>
            </div>
    </div>
</div>

<!-- History Details Modal -->
<div class="modal fade" id="historyModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: var(--bg-card); color: var(--text-light); border: 1px solid var(--border);">
            <div class="modal-header border-secondary">
                <h5 class="modal-title">Application Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="modalContent"></div>
            </div>
            <div class="modal-footer border-secondary">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
function selectOutcome(val, btn) {
    document.getElementById('leadOutcome').value = val;
    
    // Reset all status buttons
    document.querySelectorAll('.outcome-btn').forEach(b => {
        const type = b.dataset.type;
        b.className = `btn btn-outline-${type} px-4 outcome-btn`;
    });
    
    // Set active state
    const type = btn.dataset.type;
    btn.className = `btn btn-${type} px-4 outcome-btn active shadow fw-bold`;
}

function toggleCustomVisa() {
    const select = document.getElementById('visaTypeSelect');
    const input = document.getElementById('visaTypeInput');
    const icon = document.getElementById('visaToggleIcon');
    
    if (input.style.display === 'none') {
        // Switch to custom input
        select.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        icon.classList.remove('bi-plus-lg');
        icon.classList.add('bi-x-lg');
    } else {
        // Switch back to select
        select.style.display = 'block';
        input.style.display = 'none';
        input.value = ''; // clear custom
        icon.classList.remove('bi-x-lg');
        icon.classList.add('bi-plus-lg');
    }
}

async function submitApplication(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerText = 'Sending...';

    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData.entries());
    const data = {};

    // Fill "not-provided" for empty fields
    for (const key in rawData) {
        let val = rawData[key];
        if (typeof val === 'string') val = val.trim();
        
        if (!val || val === '') {
            data[key] = 'not-provided';
        } else {
            data[key] = rawData[key];
        }
    }

    // Determine Visa Type based on toggle state
    const visaInput = document.getElementById('visaTypeInput');
    if (visaInput.style.display !== 'none' && visaInput.value.trim() !== '') {
        data.visa_type = visaInput.value.trim();
    }
    delete data.visa_type_other;

    // Determine URL: create or update
    const editId = document.getElementById('editAppId').value;
    
    // Add ID to data if editing
    if (editId) {
        data.id = editId;
        console.log('Edit mode - ID:', editId);
    } else {
        console.log('Create mode - no ID');
    }
    
    console.log('Data being sent:', data);
    
    const apiUrl = editId 
        ? '/avisaupdated/index.php?path=api/agent/update-application' 
        : '/avisaupdated/index.php?path=api/agent/submit-application';
    
    console.log('API URL:', apiUrl);

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const text = await res.text();
        console.log("Server Response:", text);

        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            alert('Server Error (Not JSON):\\n' + text.substring(0, 300));
            throw new Error('Invalid JSON response');
        }
        
        if (json.success) {
            const successMsg = editId ? 'Application updated successfully!' : 'Application submitted successfully!';
            alert(successMsg);
            window.location.href = 'index.php';
        } else {
            alert('Error: ' + (json.error || 'Unknown error'));
            
            // Auto-logout if session is invalid
            if (json.error && json.error.includes('session is invalid')) {
                window.location.href = '../logout.php';
            }
            
            btn.disabled = false;
            btn.innerText = editId ? 'Update Application' : 'Submit Application';
        }

    } catch (err) {
        console.error(err);
        if (err.message !== 'Invalid JSON response') {
             alert('Request Failed: ' + err.message);
        }
        btn.disabled = false;
        btn.innerText = 'Submit Application';
    }
}



function syncSearch(val) {
    // When typing in main form, sync to history search bar and trigger search
    document.getElementById('manualSearchInput').value = val;
    checkHistory(val);
}

let searchTimeout;
async function checkHistory(contact) {
    const list = document.getElementById('historyList');
    const loader = document.getElementById('historyLoader');
    
    if (!contact || contact.length < 1) {
        list.innerHTML = `
            <p class="text-muted small text-center my-4">
                <i class="bi bi-search d-block fs-4 mb-2"></i>
                Enter a contact number to search history
            </p>`;
        return;
    }

    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(async () => {
        loader.style.display = 'block';
        list.style.opacity = '0.5';
        
        try {
            // Using absolute path to ensure no relative path issues
            const url = `/avisaupdated/index.php?path=api/agent/check-contact-history&contact=${encodeURIComponent(contact)}`;
            const res = await fetch(url);
            
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON:", text);
                throw new Error("Invalid server response");
            }
            
            list.innerHTML = '';
            
            if (data.success && data.history && data.history.length > 0) {
                historyDataMap = {}; // Reset map
                data.history.forEach(item => {
                    historyDataMap[item.id] = item; // Store for view details
                    const date = new Date(item.created_at).toLocaleDateString();
                    const statusColor = item.status === 'approved' ? 'bg-success' : (item.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark');
                    
                    // Parse details for lead_outcome
                    let details = {};
                    try {
                        details = typeof item.details === 'string' ? JSON.parse(item.details) : (item.details || {});
                    } catch(e) {}
                    const leadOutcome = details.lead_outcome || 'N/A';
                    
                    // Determine outcome badge color
                    let outcomeColor = 'bg-secondary';
                    if (leadOutcome.toLowerCase().includes('interested')) outcomeColor = 'bg-success';
                    else if (leadOutcome.toLowerCase().includes('later')) outcomeColor = 'bg-warning text-dark';
                    else if (leadOutcome.toLowerCase().includes('waste')) outcomeColor = 'bg-danger';
                    
                    const div = document.createElement('div');
                    div.className = 'history-item';
                    div.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <strong class="text-dark">${item.visa_type}</strong>
                            <span class="badge ${statusColor}">${item.status.toUpperCase()}</span>
                        </div>
                        <div class="small mb-2">
                            <span class="badge ${outcomeColor}"><i class="bi bi-tag-fill me-1"></i>${leadOutcome}</span>
                        </div>
                        <div class="small text-muted mb-1">
                            <i class="bi bi-person me-1"></i> ${item.agent_name}
                        </div>
                        <div class="small text-muted mb-1">
                            <i class="bi bi-calendar3 me-1"></i> ${date}
                        </div>
                        <div class="small text-muted">
                            <i class="bi bi-person-badge me-1"></i> ${item.client_name}
                        </div>
                        <div class="mt-2 text-end">
                            <button class="btn btn-sm btn-outline-primary py-0" onclick="viewHistoryDetails(${item.id})">
                                <i class="bi bi-eye"></i> View
                            </button>
                        </div>
                    `;
                    list.appendChild(div);
                });
            } else {
                list.innerHTML = `
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                        No previous applications found
                    </div>`;
            }
            
        } catch(e) {
            console.error(e);
            list.innerHTML = `<p class="text-danger small">Error fetching history.</p>`;
        } finally {
            loader.style.display = 'none';
            list.style.opacity = '1';
        }
    }, 100); // Debounce 100ms
}

let historyDataMap = {}; // Store fetched history items

async function viewHistoryDetails(id) {
    const item = historyDataMap[id];
    if (!item) return;
    
    const details = item.details || {};
    const content = document.getElementById('modalContent');
    
    // Helper for rows
    const row = (label, val) => `
        <div class="mb-2">
            <small class="d-block" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">${label}</small>
            <div style="color: #0f172a; font-weight: 500;">${val || '-'}</div>
        </div>`;

    let html = `
        <div class="row">
            <div class="col-6">${row('Client Name', item.client_name)}</div>
            <div class="col-6">${row('Status', `<span class="badge ${item.status === 'approved' ? 'bg-success' : (item.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark')}">${item.status.toUpperCase()}</span>`)}</div>
            
            <div class="col-6">${row('Visa Type', item.visa_type)}</div>
            <div class="col-6">${row('Date', new Date(item.created_at).toLocaleDateString())}</div>
            
            <div class="col-6">${row('Contact', details.contact_number)}</div>
            <div class="col-6">${row('Gender', details.gender)}</div>
            
            <div class="col-6">${row('Age', details.age)}</div>
            <div class="col-6">${row('Education', details.education)}</div>

            <div class="col-6">${row('Spouse Name', details.spouse_name)}</div>
            <div class="col-6">${row('Spouse Age', details.spouse_age)}</div>
            
            <div class="col-12">${row('Kids', details.kids)}</div>
            
            <div class="col-6">${row('Passport Validity', details.passport_validity)}</div>
            <div class="col-6">${row('IELTS Score', details.ielts_score)}</div>
            
            <div class="col-6">${row('Occupation', details.occupation)}</div>
            <div class="col-6">${row('Income', details.income)}</div>
            <div class="col-6">${row('Bank Balance', details.bank_balance)}</div>
             
             <div class="col-12"><hr class="border-secondary"></div>
             
             <div class="col-12">${row('Address', `${details.address || ''}, ${details.city || ''}, ${details.state || ''}`)}</div>
             
             <div class="col-12 mt-2">
                <small class="d-block" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Travel History</small>
                <div class="p-2 rounded mb-2" style="background: #f1f5f9; color: #0f172a;">${details.travel_history || '-'}</div>
             </div>
             
             <div class="col-12 mt-2">
                <small class="d-block text-danger" style="font-size: 0.8rem; text-transform: uppercase;">Refusal History</small>
                <div class="p-2 rounded mb-2" style="background: #f1f5f9; color: #0f172a;">${details.refusal_history || '-'}</div>
             </div>
             
             <div class="col-12 mt-2">
                <small class="d-block" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Remarks</small>
                <div class="p-2 rounded" style="background: #f1f5f9; color: #0f172a;">${details.remarks || 'No remarks'}</div>
             </div>
             
             <div class="col-12 mt-3">
                 <small class="d-block" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Agent Info</small>
                 <div style="color: #0f172a;">This application was submitted by <strong class="text-dark">${item.agent_name}</strong>.</div>
             </div>
        </div>
    `;
    
    content.innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}
</script>

<script>
async function checkForEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        document.getElementById('editAppId').value = editId;
        document.getElementById('pageTitle').innerText = 'Edit Application #' + editId;
        document.getElementById('btnSubmit').innerText = 'Update Application';
        document.title = 'Edit Application - Agent';
        
        // Show loading
        const overlay = document.getElementById('loadingOverlay');
        const container = document.querySelector('.form-container');
        container.style.position = 'relative'; // Ensure overlay positioning works
        overlay.style.display = 'flex';
        
        try {
            const res = await fetch(`/avisaupdated/index.php?path=api/agent/application-details&id=${editId}`);
            const data = await res.json();
            
            if (data.success && data.application) {
                const app = data.application;
                let details = app.details;
                if (typeof details === 'string') {
                    try { details = JSON.parse(details); } catch(e) {}
                }
                details = details || {};
                
                // Merge top-level fields into details for easier loop
                details.client_name = app.client_name;
                details.contact_number = app.contact_number; // Prioritize app table contact
                
                // Populate inputs
                const form = document.getElementById('appForm');
                
                // Fields that map 1:1 by name
                // Fields that map 1:1 by name
                for (const key in details) {
                    // Special handling for visa_type
                    if (key === 'visa_type') {
                        const standardOptions = ['Tourist', 'Student', 'Work', 'PR', 'Business'];
                        const visaSelect = document.getElementById('visaTypeSelect');
                        const visaInput = document.getElementById('visaTypeInput');
                        const icon = document.getElementById('visaToggleIcon');
                        
                        if (standardOptions.includes(details[key])) {
                            visaSelect.value = details[key];
                            // Ensure select mode
                            visaSelect.style.display = 'block';
                            visaInput.style.display = 'none';
                            icon.classList.remove('bi-x-lg');
                            icon.classList.add('bi-plus-lg');
                        } else if (details[key] && details[key] !== 'not-provided') {
                            // Custom mode
                            visaInput.value = details[key];
                            visaSelect.style.display = 'none';
                            visaInput.style.display = 'block';
                            icon.classList.remove('bi-plus-lg');
                            icon.classList.add('bi-x-lg');
                        }
                        continue;
                    }

                    if (form.elements[key]) {
                        if (form.elements[key].type === 'checkbox') {
                            form.elements[key].checked = (details[key] === 'Yes');
                        } else {
                             form.elements[key].value = details[key] === 'not-provided' ? '' : details[key];
                        }
                    }
                }
                
                // Special handling: Lead Outcome
                if (details.lead_outcome) {
                    const btn = document.querySelector(`.outcome-btn[onclick*="${details.lead_outcome}"]`);
                    if (btn) btn.click(); // Trigger selection logic
                    else document.getElementById('leadOutcome').value = details.lead_outcome;
                }
                
            } else {
                alert('Failed to load application details. ' + (data.error || ''));
                window.location.href = 'index.php';
            }
        } catch (e) {
            console.error(e);
            alert('Error loading application.');
        } finally {
            overlay.style.display = 'none';
        }
    }
}

// Run on load
window.addEventListener('load', checkForEditMode);
</script>

</body>
</html>
