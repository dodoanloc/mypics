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
    submitBtn: document.getElementById('submit-btn'),
    uploadStatus: document.getElementById('upload-status'),
    adminLink: document.getElementById('admin-link'),
    adminLogin: document.getElementById('admin-login'),
    adminDashboard: document.getElementById('admin-dashboard'),
    adminUsername: document.getElementById('admin-username'),
    adminPassword: document.getElementById('admin-password'),
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

// Staff list (Agribank Thọ Xuân - corrected)
// Total: 43 people
const staffList = [
    { id: '1', name: 'Nguyễn Quốc Huy' },
    { id: '2', name: 'Đỗ Văn Nam' },
    { id: '3', name: 'Nguyễn Chí Thanh' },
    { id: '4', name: 'Đỗ Doãn Lộc' },
    { id: '5', name: 'Nguyễn Thị Như Quỳnh' },
    { id: '6', name: 'Nguyễn Thị Hòa' },
    { id: '7', name: 'Đàm Thị Thu Phương' },
    { id: '8', name: 'Trịnh Thị Hường' },
    { id: '9', name: 'Lê Thanh Xuân' },
    { id: '10', name: 'Nguyễn Thị Quyên' },
    { id: '11', name: 'Lê Nam Phượng' },
    { id: '12', name: 'Lê Thị Oanh' },
    { id: '13', name: 'Doãn Thị Dịu' },
    { id: '14', name: 'Nguyễn Diệu Linh' },
    { id: '15', name: 'Nguyễn Ngọc Tú' },
    { id: '16', name: 'Đỗ Quang Huy' },
    { id: '17', name: 'Nguyễn Văn Sơn' },
    { id: '18', name: 'Đỗ Tuấn Minh' },
    { id: '19', name: 'Hà Sĩ Dũng' },
    { id: '20', name: 'Lê Thị Giang' },
    { id: '21', name: 'Đỗ Tuấn Anh' },
    { id: '22', name: 'Vũ Xuân Trường' },
    { id: '23', name: 'Lê Thị Uyên' },
    { id: '24', name: 'Đỗ Thị Ngọc Anh' },
    { id: '25', name: 'Đỗ Thị Trang' },
    { id: '26', name: 'Nguyễn Trịnh Phương Thảo' },
    { id: '27', name: 'Lê Thu Phương' },
    { id: '28', name: 'Lê Thị Diễm Quỳnh' },
    { id: '29', name: 'Nguyễn Quốc Vương Linh' },
    { id: '30', name: 'Trịnh Ngọc Nam' },
    { id: '31', name: 'Trịnh Quang Dũng' },
    { id: '32', name: 'Nguyễn Thị Hạnh' },
    { id: '33', name: 'Lê Thị Nga' },
    { id: '34', name: 'Mai Thị Huyền' },
    { id: '35', name: 'Phùng Lê Diệu Linh' },
    { id: '36', name: 'Hoàng Thị Lê' },
    { id: '37', name: 'Lý Thị Ngọc Mai' },
    { id: '38', name: 'Hoàng Thị Minh' },
    { id: '39', name: 'Mai Thị Lan Anh' },
    { id: '40', name: 'Lê Xuân Quý' },
    { id: '41', name: 'Đặng Thị Hảo' },
    { id: '42', name: 'Trần Thị Hồ Lan' },
    { id: '43', name: 'Phạm Văn Khoa' }
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
    
    // No extra fields needed: users only pick their name from dropdown
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
    
    // Get staff information
    const staff = staffList.find(s => s.id === staffId);
    const fullName = staff ? staff.name : '';
    
    // Simulate upload process
    showStatus('Đang xử lý...', 'info');
    
    // In a real app, this would upload to a server
    setTimeout(() => {
        // Create submission
        const submission = {
            id: Date.now().toString(),
            eventId: eventId,
            fullName: fullName,
            timestamp: new Date().toISOString(),
            status: 'uploaded'
        };
        
        app.submissions.push(submission);
        saveToStorage();
        
        showStatus('Tải lên thành công! Cảm ơn bạn đã nộp kết quả thi.', 'success');
        
        // Reset form
        elements.uploadFile.value = '';
        elements.staffSelect.value = '';
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

// Check admin status
function checkAdminStatus() {
    // Always show admin entry; access is still protected by login credentials.
    elements.adminLink.style.display = 'inline-block';
    elements.adminLogin.style.display = 'block';
    elements.adminDashboard.style.display = 'none';
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
                timestamp: '2026-03-08T12:30:00Z',
                status: 'uploaded'
            },
            {
                id: 's2',
                eventId: '1',
                staffId: '2',
                fullName: 'Đỗ Văn Nam',
                timestamp: '2026-03-08T13:15:00Z',
                status: 'uploaded'
            },
            {
                id: 's3',
                eventId: '2',
                staffId: '3',
                fullName: 'Nguyễn Chí Thanh',
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