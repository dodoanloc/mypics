// Main application state
const app = {
    events: [],
    submissions: [],
    currentUser: null,
    isAdmin: false,
    adminCredentials: {
        username: 'admin',
        password: 'agribank2026'
    }
};

// DOM Elements
const elements = {
    eventsList: document.getElementById('events-list'),
    eventSelect: document.getElementById('event-select'),
    uploadFile: document.getElementById('upload-file'),
    fileInfo: document.getElementById('file-info'),
    staffSelect: document.getElementById('staff-select'),
    idNumber: document.getElementById('id-number'),
    submitBtn: document.getElementById('submit-btn'),
    uploadStatus: document.getElementById('upload-status'),
    adminLink: document.getElementById('admin-link'),
    adminLogin: document.getElementById('admin-login'),
    adminDashboard: document.getElementById('admin-dashboard'),
    loginBtn: document.getElementById('login-btn'),
    loginMessage: document.getElementById('login-message'),
    createEventBtn: document.getElementById('create-event-btn'),
    createEventForm: document.getElementById('create-event-form'),
    saveEventBtn: document.getElementById('save-event-btn'),
    cancelEventBtn: document.getElementById('cancel-event-btn'),
    eventTitle: document.getElementById('event-title'),
    eventDescription: document.getElementById('event-description'),
    eventDeadline: document.getElementById('event-deadline'),
    eventStatus: document.getElementById('event-status'),
    downloadAllBtn: document.getElementById('download-all-btn'),
    progressCards: document.getElementById('progress-cards')
};

// Staff list (Agribank Thọ Xuân - updated from provided list)
const staffList = [
    { id: '1', name: 'Nguyễn Quốc Huy', idNumber: 'CMND_001' },
    { id: '2', name: 'Đỗ Văn Nam', idNumber: 'CMND_002' },
    { id: '3', name: 'Nguyễn Chí Thanh', idNumber: 'CMND_003' },
    { id: '4', name: 'Đỗ Doãn Lộc', idNumber: 'CMND_004' },
    { id: '5', name: 'Nguyễn Thị Như Quỳnh', idNumber: 'CMND_005' },
    { id: '6', name: 'Nguyễn Thị Hòa', idNumber: 'CMND_006' },
    { id: '7', name: 'Đàm Thị Thu Phương', idNumber: 'CMND_007' },
    { id: '8', name: 'Trịnh Thị Hường', idNumber: 'CMND_008' },
    { id: '9', name: 'Lê Thanh Xuân', idNumber: 'CMND_009' },
    { id: '10', name: 'Nguyễn Thị Quyên', idNumber: 'CMND_010' },
    { id: '11', name: 'Lê Nam Phượng', idNumber: 'CMND_011' },
    { id: '12', name: 'Lê Thị Oanh', idNumber: 'CMND_012' },
    { id: '13', name: 'Đoàn Thị Dịu', idNumber: 'CMND_013' },
    { id: '14', name: 'Nguyễn Diệu Linh', idNumber: 'CMND_014' },
    { id: '15', name: 'Nguyễn Ngọc Tú', idNumber: 'CMND_015' },
    { id: '16', name: 'Đỗ Quang Huy', idNumber: 'CMND_016' },
    { id: '17', name: 'Nguyễn Văn Sơn', idNumber: 'CMND_017' },
    { id: '18', name: 'Đỗ Tuấn Minh', idNumber: 'CMND_018' },
    { id: '19', name: 'Hà Sĩ Dũng', idNumber: 'CMND_019' },
    { id: '20', name: 'Lê Thị Giang', idNumber: 'CMND_020' },
    { id: '21', name: 'Đỗ Tuấn Anh', idNumber: 'CMND_021' },
    { id: '22', name: 'Vũ Xuân Trường', idNumber: 'CMND_022' },
    { id: '23', name: 'Lê Thị Uyên', idNumber: 'CMND_023' },
    { id: '24', name: 'Đỗ Thị Ngọc Anh', idNumber: 'CMND_024' },
    { id: '25', name: 'Đỗ Thị Trang', idNumber: 'CMND_025' },
    { id: '26', name: 'Nguyễn Trịnh', idNumber: 'CMND_026' },
    { id: '27', name: 'Phương Thảo', idNumber: 'CMND_027' },
    { id: '28', name: 'Lê Thu Phương', idNumber: 'CMND_028' },
    { id: '29', name: 'Lê Thị Diễm Quỳnh', idNumber: 'CMND_029' },
    { id: '30', name: 'Nguyễn Quốc', idNumber: 'CMND_030' },
    { id: '31', name: 'Vương Linh', idNumber: 'CMND_031' },
    { id: '32', name: 'Trịnh Ngọc Nam', idNumber: 'CMND_032' },
    { id: '33', name: 'Trịnh Quang Dũng', idNumber: 'CMND_033' },
    { id: '34', name: 'Nguyễn Thị Hạnh', idNumber: 'CMND_034' },
    { id: '35', name: 'Lê Thị Nga', idNumber: 'CMND_035' },
    { id: '36', name: 'Mai Thị Huyền', idNumber: 'CMND_036' },
    { id: '37', name: 'Phùng Lê Diệu Linh', idNumber: 'CMND_037' },
    { id: '38', name: 'Hoàng Thị Lê', idNumber: 'CMND_038' },
    { id: '39', name: 'Lý Thị Ngọc Mai', idNumber: 'CMND_039' },
    { id: '40', name: 'Hoàng Thị Minh', idNumber: 'CMND_040' },
    { id: '41', name: 'Mai Thị Lan Anh', idNumber: 'CMND_041' },
    { id: '42', name: 'Lê Xuân Quý', idNumber: 'CMND_042' },
    { id: '43', name: 'Đặng Thị Hảo', idNumber: 'CMND_043' },
    { id: '44', name: 'Trần Thị Hồ Lan', idNumber: 'CMND_044' },
    { id: '45', name: 'Phạm Văn Khoa', idNumber: 'CMND_045' }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load data from localStorage or initialize default data
    loadFromStorage();
    
    // Populate staff dropdown
    populateStaffSelect();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial UI
    renderEvents();
    renderEventSelect();
    
    // Check if user is admin (for demo purposes)
    checkAdminStatus();
});

// Populate staff dropdown
function populateStaffSelect() {
    const select = elements.staffSelect;
    if (!select) return;
    
    let options = '<option value="">-- Chọn cán bộ --</option>';
    staffList.forEach(staff => {
        options += `<option value="${staff.id}">${staff.name}</option>`;
    });
    select.innerHTML = options;
    
    // Add event listener for staff selection
    select.addEventListener('change', function() {
        const staffId = this.value;
        const staff = staffList.find(s => s.id === staffId);
        if (staff) {
            elements.idNumber.value = staff.idNumber;
        } else {
            elements.idNumber.value = '';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Upload form
    elements.uploadFile.addEventListener('change', handleFileSelect);
    elements.submitBtn.addEventListener('click', handleUpload);
    
    // Admin login
    elements.loginBtn.addEventListener('click', handleAdminLogin);
    elements.cancelEventBtn.addEventListener('click', () => {
        elements.createEventForm.style.display = 'none';
    });
    
    // Create event
    elements.createEventBtn.addEventListener('click', () => {
        elements.createEventForm.style.display = 'block';
    });
    
    elements.saveEventBtn.addEventListener('click', saveEvent);
    
    // Download all
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);
    
    // Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        elements.fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    } else {
        elements.fileInfo.textContent = 'Chưa chọn tệp';
    }
}

// Handle upload submission
function handleUpload() {
    const eventId = elements.eventSelect.value;
    const file = elements.uploadFile.files[0];
    const staffId = elements.staffSelect.value;
    const idNumber = elements.idNumber.value.trim();
    
    // Validation
    if (!eventId) {
        showStatus('Vui lòng chọn sự kiện!', 'error');
        return;
    }
    
    if (!file) {
        showStatus('Vui lòng chọn ảnh để tải lên!', 'error');
        return;
    }
    
    if (!staffId) {
        showStatus('Vui lòng chọn cán bộ!', 'error');
        return;
    }
    
    // Auto-fill ID number from staff list
    const staff = staffList.find(s => s.id === staffId);
    const fullName = staff ? staff.name : '';
    const staffIdNumber = staff ? staff.idNumber : '';
    
    // If ID number field is empty, use staff's ID number
    const finalIdNumber = idNumber || staffIdNumber;
    
    if (!finalIdNumber) {
        showStatus('Vui lòng nhập số CMND/CCCD hoặc chọn cán bộ có thông tin!', 'error');
        return;
    }
    
    // Simulate upload process
    showStatus('Đang xử lý...', 'info');
    
    // In a real app, this would upload to a server
    setTimeout(() => {
        // Create submission
        const submission = {
            id: Date.now().toString(),
            eventId: eventId,
            fullName: fullName,
            idNumber: finalIdNumber,
            timestamp: new Date().toISOString(),
            status: 'uploaded'
        };
        
        app.submissions.push(submission);
        saveToStorage();
        
        showStatus('Tải lên thành công! Cảm ơn bạn đã nộp kết quả thi.', 'success');
        
        // Reset form
        elements.uploadFile.value = '';
        elements.staffSelect.value = '';
        elements.idNumber.value = '';
        elements.fileInfo.textContent = 'Chưa chọn tệp';
        
        // Update progress
        updateProgress();
    }, 1500);
}

// Show status message
function showStatus(message, type) {
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `status-${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        elements.uploadStatus.textContent = '';
        elements.uploadStatus.className = '';
    }, 5000);
}

// Render events
function renderEvents() {
    if (!elements.eventsList) return;
    
    let html = '';
    app.events.forEach(event => {
        const submissionsCount = app.submissions.filter(s => s.eventId === event.id).length;
        const totalSubmissions = app.submissions.length;
        const progress = totalSubmissions > 0 ? Math.round((submissionsCount / totalSubmissions) * 100) : 0;
        
        html += `
            <div class="event-card">
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <div class="event-meta">
                        <span>${event.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}</span>
                        <span>${new Date(event.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
                <div class="event-body">
                    <p class="event-description">${event.description}</p>
                    <div class="event-status ${event.status}">
                        <span class="status-${event.status}">${event.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}</span>
                    </div>
                    <div class="event-deadline">
                        <span>📅 Hạn cuối:</span>
                        <span>${new Date(event.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <span>✅ Đã nộp: ${submissionsCount}/${totalSubmissions}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    elements.eventsList.innerHTML = html || '<p>Hiện chưa có sự kiện nào. Vui lòng chờ quản trị viên tạo sự kiện.</p>';
}

// Render event select dropdown
function renderEventSelect() {
    let options = '<option value="">-- Chọn sự kiện --</option>';
    app.events.forEach(event => {
        if (event.status === 'active') {
            options += `<option value="${event.id}">${event.title}</option>`;
        }
    });
    elements.eventSelect.innerHTML = options;
}

// Check admin status (for demo)
function checkAdminStatus() {
    // In production, this would be handled by authentication
    // For demo, we'll use a simple check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        elements.adminLink.style.display = 'inline-block';
        elements.adminLogin.style.display = 'block';
        elements.adminDashboard.style.display = 'none';
    }
}

// Handle admin login
function handleAdminLogin() {
    const username = elements.adminUsername.value;
    const password = elements.adminPassword.value;
    
    if (username === app.adminCredentials.username && password === app.adminCredentials.password) {
        elements.loginMessage.textContent = 'Đăng nhập thành công!';
        elements.loginMessage.className = 'status-success';
        
        // Show admin dashboard
        elements.adminLogin.style.display = 'none';
        elements.adminDashboard.style.display = 'block';
        
        // Update progress
        updateProgress();
        
        // Set admin flag
        app.isAdmin = true;
    } else {
        elements.loginMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        elements.loginMessage.className = 'status-error';
    }
}

// Save event
function saveEvent() {
    const title = elements.eventTitle.value.trim();
    const description = elements.eventDescription.value.trim();
    const deadline = elements.eventDeadline.value;
    const status = elements.eventStatus.value;
    
    if (!title) {
        showStatus('Vui lòng nhập tiêu đề sự kiện!', 'error');
        return;
    }
    
    if (!deadline) {
        showStatus('Vui lòng chọn ngày hết hạn!', 'error');
        return;
    }
    
    const event = {
        id: Date.now().toString(),
        title: title,
        description: description,
        deadline: deadline,
        status: status,
        createdAt: new Date().toISOString()
    };
    
    app.events.push(event);
    saveToStorage();
    
    // Reset form
    elements.eventTitle.value = '';
    elements.eventDescription.value = '';
    elements.eventDeadline.value = '';
    elements.eventStatus.value = 'active';
    
    // Hide form
    elements.createEventForm.style.display = 'none';
    
    // Update UI
    renderEvents();
    renderEventSelect();
    showStatus('Sự kiện đã được tạo thành công!', 'success');
}

// Update progress tracking
function updateProgress() {
    if (!elements.progressCards) return;
    
    let html = '';
    
    app.events.forEach(event => {
        const eventSubmissions = app.submissions.filter(s => s.eventId === event.id);
        const totalSubmissions = app.submissions.length;
        const eventProgress = eventSubmissions.length > 0 ? 
            Math.round((eventSubmissions.length / totalSubmissions) * 100) : 0;
        
        html += `
            <div class="progress-card">
                <div class="progress-header">
                    <h3 class="progress-title">${event.title}</h3>
                    <span class="progress-stats">
                        <span>${eventSubmissions.length}/${totalSubmissions}</span>
                    </span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${eventProgress}%"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${eventProgress}%</div>
                    <div class="stat-label">Tiến độ</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${eventSubmissions.length}</div>
                    <div class="stat-label">Đã nộp</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${totalSubmissions - eventSubmissions.length}</div>
                    <div class="stat-label">Còn lại</div>
                </div>
            </div>
        `;
    });
    
    elements.progressCards.innerHTML = html || '<p>Chưa có sự kiện nào để theo dõi tiến độ.</p>';
}

// Download all images (simulated)
function downloadAllImages() {
    if (app.submissions.length === 0) {
        showStatus('Chưa có ảnh nào để tải xuống!', 'error');
        return;
    }
    
    showStatus(`Đang chuẩn bị tải xuống ${app.submissions.length} ảnh...`, 'info');
    
    // In a real app, this would generate a zip file with all images
    setTimeout(() => {
        showStatus(`Đã tạo file chứa ${app.submissions.length} ảnh. Nhấn vào link dưới đây để tải xuống.`, 'success');
        
        // Create a fake download link
        const downloadLink = document.createElement('a');
        downloadLink.href = '#';
        downloadLink.textContent = '📥 Tải xuống tất cả ảnh (ZIP)';
        downloadLink.style.display = 'block';
        downloadLink.style.marginTop = '15px';
        downloadLink.style.color = 'var(--primary)';
        downloadLink.style.fontWeight = '600';
        downloadLink.onclick = (e) => {
            e.preventDefault();
            showStatus('Tải xuống đang được xử lý...', 'info');
            setTimeout(() => {
                showStatus('Tải xuống hoàn tất! File đã được lưu vào thư mục tải xuống.', 'success');
            }, 2000);
        };
        
        const existingLink = document.querySelector('.download-link');
        if (existingLink) {
            existingLink.remove();
        }
        
        elements.uploadStatus.appendChild(downloadLink);
    }, 2000);
}

// Load data from localStorage
function loadFromStorage() {
    try {
        const savedData = localStorage.getItem('agribank-mypics-data');
        if (savedData) {
            const data = JSON.parse(savedData);
            app.events = data.events || [];
            app.submissions = data.submissions || [];
        } else {
            // Initialize with sample data for demo
            app.events = [
                {
                    id: '1',
                    title: 'Kỳ Thi Chuyển Ngạch 2026',
                    description: 'Nộp kết quả thi chuyển ngạch năm 2026 cho nhân viên chi nhánh Thọ Xuân',
                    deadline: '2026-06-30',
                    status: 'active',
                    createdAt: '2026-03-08T10:00:00Z'
                },
                {
                    id: '2',
                    title: 'Thi Nâng Bậc Chuyên Viên',
                    description: 'Nộp kết quả thi nâng bậc chuyên viên năm 2026',
                    deadline: '2026-07-15',
                    status: 'active',
                    createdAt: '2026-03-08T10:00:00Z'
                }
            ];
            
            // Add some sample submissions for demo
            app.submissions = [
                {
                    id: 's1',
                    eventId: '1',
                    fullName: 'Nguyễn Văn A',
                    idNumber: '123456789',
                    timestamp: '2026-03-08T12:30:00Z',
                    status: 'uploaded'
                },
                {
                    id: 's2',
                    eventId: '1',
                    fullName: 'Trần Thị B',
                    idNumber: '987654321',
                    timestamp: '2026-03-08T13:15:00Z',
                    status: 'uploaded'
                },
                {
                    id: 's3',
                    eventId: '2',
                    fullName: 'Lê Văn C',
                    idNumber: '456789123',
                    timestamp: '2026-03-08T14:00:00Z',
                    status: 'uploaded'
                }
            ];
        }
    } catch (e) {
        console.error('Error loading data:', e);
        // Fallback to empty data
        app.events = [];
        app.submissions = [];
    }
}

// Save data to localStorage
function saveToStorage() {
    try {
        localStorage.setItem('agribank-mypics-data', JSON.stringify({
            events: app.events,
            submissions: app.submissions
        }));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

// Initialize with sample data for demo
window.onload = function() {
    // Add sample data if none exists
    if (app.events.length === 0) {
        app.events = [
            {
                id: '1',
                title: 'Kỳ Thi Chuyển Ngạch 2026',
                description: 'Nộp kết quả thi chuyển ngạch năm 2026 cho nhân viên chi nhánh Thọ Xuân',
                deadline: '2026-06-30',
                status: 'active',
                createdAt: '2026-03-08T10:00:00Z'
            },
            {
                id: '2',
                title: 'Thi Nâng Bậc Chuyên Viên',
                description: 'Nộp kết quả thi nâng bậc chuyên viên năm 2026',
                deadline: '2026-07-15',
                status: 'active',
                createdAt: '2026-03-08T10:00:00Z'
            }
        ];
        
        app.submissions = [
            {
                id: 's1',
                eventId: '1',
                staffId: '1',
                fullName: 'Nguyễn Quốc Huy',
                idNumber: 'CMND_001',
                timestamp: '2026-03-08T12:30:00Z',
                status: 'uploaded'
            },
            {
                id: 's2',
                eventId: '1',
                staffId: '2',
                fullName: 'Đỗ Văn Nam',
                idNumber: 'CMND_002',
                timestamp: '2026-03-08T13:15:00Z',
                status: 'uploaded'
            },
            {
                id: 's3',
                eventId: '2',
                staffId: '3',
                fullName: 'Nguyễn Chí Thanh',
                idNumber: 'CMND_003',
                timestamp: '2026-03-08T14:00:00Z',
                status: 'uploaded'
            }
        ];
        
        saveToStorage();
        renderEvents();
        renderEventSelect();
        updateProgress();
    }
};