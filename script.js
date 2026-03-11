const STORAGE_KEY = 'agribank-mypics-data';

const app = {
    events: [],
    submissions: [],
    isAdmin: false,
    editingEventId: null,
    adminCredentials: {
        password: 'agribank2026'
    }
};

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
    progressCards: document.getElementById('progress-cards'),
    adminEventsList: document.getElementById('admin-events-list'),
    formTitle: document.getElementById('admin-form-title'),
    formHint: document.getElementById('admin-form-hint')
};

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

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    populateStaffSelect();
    setupEventListeners();
    renderAll();
    checkAdminStatus();
});

function setupEventListeners() {
    elements.uploadFile.addEventListener('change', handleFileSelect);
    elements.submitBtn.addEventListener('click', handleUpload);
    elements.loginBtn.addEventListener('click', handleAdminLogin);
    elements.createEventBtn.addEventListener('click', startCreateEvent);
    elements.cancelEventBtn.addEventListener('click', cancelEventForm);
    elements.saveEventBtn.addEventListener('click', saveEvent);
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

function populateStaffSelect() {
    let options = '<option value="">-- Chọn cán bộ --</option>';
    staffList.forEach(staff => {
        options += `<option value="${staff.id}">${staff.name}</option>`;
    });
    elements.staffSelect.innerHTML = options;
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    elements.fileInfo.textContent = file
        ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        : 'Chưa chọn tệp';
}

function handleUpload() {
    const eventId = elements.eventSelect.value;
    const file = elements.uploadFile.files[0];
    const staffId = elements.staffSelect.value;

    if (!eventId) return showStatus('Vui lòng chọn sự kiện!', 'error');
    if (!file) return showStatus('Vui lòng chọn ảnh để tải lên!', 'error');
    if (!staffId) return showStatus('Vui lòng chọn cán bộ!', 'error');

    const event = app.events.find(item => item.id === eventId);
    if (!event || event.status !== 'active') {
        return showStatus('Sự kiện này hiện không còn nhận ảnh!', 'error');
    }

    const staff = staffList.find(s => s.id === staffId);
    const reader = new FileReader();
    showStatus('Đang tải ảnh lên...', 'info');

    reader.onload = () => {
        const existingIndex = app.submissions.findIndex(
            submission => submission.eventId === eventId && submission.staffId === staffId
        );

        const submission = {
            id: existingIndex >= 0 ? app.submissions[existingIndex].id : Date.now().toString(),
            eventId,
            staffId,
            fullName: staff?.name || '',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            imageData: reader.result,
            timestamp: new Date().toISOString(),
            status: 'uploaded'
        };

        if (existingIndex >= 0) {
            app.submissions[existingIndex] = submission;
        } else {
            app.submissions.push(submission);
        }

        saveToStorage();
        renderAll();
        showStatus('Tải ảnh thành công!', 'success');

        elements.uploadFile.value = '';
        elements.staffSelect.value = '';
        elements.eventSelect.value = '';
        elements.fileInfo.textContent = 'Chưa chọn tệp';
    };

    reader.onerror = () => showStatus('Không thể đọc tệp ảnh. Vui lòng thử lại.', 'error');
    reader.readAsDataURL(file);
}

function showStatus(message, type, target = elements.uploadStatus) {
    target.textContent = message;
    target.className = `status-${type}`;
    setTimeout(() => {
        if (target.textContent === message) {
            target.textContent = '';
            target.className = '';
        }
    }, 5000);
}

function renderAll() {
    renderEvents();
    renderEventSelect();
    updateProgress();
    renderAdminEvents();
}

function renderEvents() {
    const totalStaff = staffList.length;
    let html = '';

    app.events
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .forEach(event => {
            const eventSubmissions = app.submissions.filter(s => s.eventId === event.id);
            const progress = Math.round((eventSubmissions.length / totalStaff) * 100);

            html += `
                <div class="event-card">
                    <div class="event-header">
                        <h3>${escapeHtml(event.title)}</h3>
                        <div class="event-meta">
                            <span>${event.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}</span>
                            <span>${formatDate(event.deadline)}</span>
                        </div>
                    </div>
                    <div class="event-body">
                        <p class="event-description">${escapeHtml(event.description || 'Không có mô tả')}</p>
                        <div class="event-status ${event.status}">
                            <span class="status-${event.status}">${event.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}</span>
                        </div>
                        <div class="event-deadline">
                            <span>📅 Hạn cuối:</span>
                            <span>${formatDate(event.deadline)}</span>
                        </div>
                        <div class="event-summary">
                            <span>✅ Đã nộp: ${eventSubmissions.length}/${totalStaff}</span>
                            <span>${progress}% hoàn thành</span>
                        </div>
                    </div>
                </div>
            `;
        });

    elements.eventsList.innerHTML = html || '<p>Hiện chưa có sự kiện nào. Vui lòng chờ quản trị viên tạo sự kiện.</p>';
}

function renderEventSelect() {
    let options = '<option value="">-- Chọn sự kiện --</option>';
    app.events
        .filter(event => event.status === 'active')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .forEach(event => {
            options += `<option value="${event.id}">${escapeHtml(event.title)} - Hạn ${formatDate(event.deadline)}</option>`;
        });
    elements.eventSelect.innerHTML = options;
}

function checkAdminStatus() {
    elements.adminLink.style.display = 'inline-block';
    elements.adminLogin.style.display = 'block';
    elements.adminDashboard.style.display = 'none';
}

function handleAdminLogin() {
    const password = elements.adminPassword.value;

    if (password === app.adminCredentials.password) {
        app.isAdmin = true;
        elements.loginMessage.textContent = 'Đăng nhập thành công!';
        elements.loginMessage.className = 'status-success';
        elements.adminLogin.style.display = 'none';
        elements.adminDashboard.style.display = 'block';
        elements.adminPassword.value = '';
        renderAdminEvents();
        updateProgress();
        return;
    }

    elements.loginMessage.textContent = 'Mật khẩu không đúng!';
    elements.loginMessage.className = 'status-error';
}

function startCreateEvent() {
    app.editingEventId = null;
    elements.formTitle.textContent = 'Tạo Sự Kiện Mới';
    elements.formHint.textContent = 'Nhập thông tin sự kiện để tạo mới.';
    elements.eventTitle.value = '';
    elements.eventDescription.value = '';
    elements.eventDeadline.value = '';
    elements.eventStatus.value = 'active';
    elements.createEventForm.style.display = 'block';
}

function startEditEvent(eventId) {
    const event = app.events.find(item => item.id === eventId);
    if (!event) return;

    app.editingEventId = eventId;
    elements.formTitle.textContent = 'Chỉnh Sửa Sự Kiện';
    elements.formHint.textContent = 'Cập nhật nội dung rồi nhấn Lưu Sự Kiện.';
    elements.eventTitle.value = event.title;
    elements.eventDescription.value = event.description || '';
    elements.eventDeadline.value = event.deadline;
    elements.eventStatus.value = event.status;
    elements.createEventForm.style.display = 'block';
    elements.createEventForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEventForm() {
    app.editingEventId = null;
    elements.createEventForm.style.display = 'none';
}

function saveEvent() {
    const title = elements.eventTitle.value.trim();
    const description = elements.eventDescription.value.trim();
    const deadline = elements.eventDeadline.value;
    const status = elements.eventStatus.value;

    if (!title) return showStatus('Vui lòng nhập tiêu đề sự kiện!', 'error');
    if (!deadline) return showStatus('Vui lòng chọn ngày hết hạn!', 'error');

    if (app.editingEventId) {
        const event = app.events.find(item => item.id === app.editingEventId);
        if (!event) return;

        event.title = title;
        event.description = description;
        event.deadline = deadline;
        event.status = status;
        event.updatedAt = new Date().toISOString();
        showStatus('Đã cập nhật sự kiện thành công!', 'success');
    } else {
        app.events.push({
            id: Date.now().toString(),
            title,
            description,
            deadline,
            status,
            createdAt: new Date().toISOString()
        });
        showStatus('Đã tạo sự kiện thành công!', 'success');
    }

    saveToStorage();
    renderAll();
    cancelEventForm();
}

function deleteEvent(eventId) {
    const event = app.events.find(item => item.id === eventId);
    if (!event) return;

    const confirmed = window.confirm(`Xoá sự kiện "${event.title}"? Toàn bộ ảnh đã nộp theo sự kiện này cũng sẽ bị xoá.`);
    if (!confirmed) return;

    app.events = app.events.filter(item => item.id !== eventId);
    app.submissions = app.submissions.filter(item => item.eventId !== eventId);
    saveToStorage();
    renderAll();
    showStatus('Đã xoá sự kiện thành công!', 'success');
}

function renderAdminEvents() {
    if (!elements.adminEventsList) return;

    if (!app.events.length) {
        elements.adminEventsList.innerHTML = '<p>Chưa có sự kiện nào.</p>';
        return;
    }

    const totalStaff = staffList.length;
    elements.adminEventsList.innerHTML = app.events
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .map(event => {
            const eventSubmissions = app.submissions.filter(item => item.eventId === event.id);
            return `
                <div class="admin-event-card">
                    <div>
                        <h4>${escapeHtml(event.title)}</h4>
                        <p>${escapeHtml(event.description || 'Không có mô tả')}</p>
                        <div class="admin-event-meta">
                            <span>Hạn: ${formatDate(event.deadline)}</span>
                            <span>${event.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}</span>
                            <span>${eventSubmissions.length}/${totalStaff} người đã nộp</span>
                        </div>
                    </div>
                    <div class="admin-event-actions">
                        <button class="btn btn-outline btn-small" data-action="edit" data-id="${event.id}">Sửa</button>
                        <button class="btn btn-danger btn-small" data-action="delete" data-id="${event.id}">Xoá</button>
                        <button class="btn btn-success btn-small" data-action="download" data-id="${event.id}">Tải ảnh</button>
                    </div>
                </div>
            `;
        })
        .join('');

    elements.adminEventsList.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const { action, id } = button.dataset;
            if (action === 'edit') startEditEvent(id);
            if (action === 'delete') deleteEvent(id);
            if (action === 'download') downloadImagesByEvent(id);
        });
    });
}

function updateProgress() {
    if (!elements.progressCards) return;
    const totalStaff = staffList.length;

    elements.progressCards.innerHTML = app.events.length
        ? app.events
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .map(event => {
                const eventSubmissions = app.submissions.filter(item => item.eventId === event.id);
                const progress = Math.round((eventSubmissions.length / totalStaff) * 100);
                return `
                    <div class="progress-card">
                        <div class="progress-header">
                            <h3 class="progress-title">${escapeHtml(event.title)}</h3>
                            <span class="progress-stats">${eventSubmissions.length}/${totalStaff}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="progress-grid">
                            <div class="stat-item">
                                <div class="stat-value">${progress}%</div>
                                <div class="stat-label">Tiến độ</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${eventSubmissions.length}</div>
                                <div class="stat-label">Đã nộp</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${totalStaff - eventSubmissions.length}</div>
                                <div class="stat-label">Chưa nộp</div>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('')
        : '<p>Chưa có sự kiện nào để theo dõi tiến độ.</p>';
}

function downloadAllImages() {
    if (!app.submissions.length) return showStatus('Chưa có ảnh nào để tải xuống!', 'error');
    app.events.forEach(event => downloadImagesByEvent(event.id, true));
    showStatus('Đã bắt đầu tải ảnh theo từng sự kiện.', 'success');
}

function downloadImagesByEvent(eventId, silent = false) {
    const event = app.events.find(item => item.id === eventId);
    const eventSubmissions = app.submissions.filter(item => item.eventId === eventId && item.imageData);

    if (!event || !eventSubmissions.length) {
        if (!silent) showStatus('Sự kiện này chưa có ảnh nào để tải!', 'error');
        return;
    }

    eventSubmissions.forEach((submission, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = submission.imageData;
            const extension = getExtension(submission.fileName, submission.fileType);
            link.download = `${slugify(event.title)}-${slugify(submission.fullName)}-${index + 1}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }, index * 200);
    });

    if (!silent) {
        showStatus(`Đang tải ${eventSubmissions.length} ảnh của sự kiện "${event.title}".`, 'success');
    }
}

function loadFromStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            app.events = Array.isArray(data.events) ? data.events : [];
            app.submissions = Array.isArray(data.submissions) ? data.submissions : [];
            return;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }

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

    app.submissions = [];
    saveToStorage();
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        events: app.events,
        submissions: app.submissions
    }));
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('vi-VN');
}

function slugify(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getExtension(fileName = '', fileType = '') {
    const fromName = fileName.split('.').pop();
    if (fromName && fromName !== fileName) return fromName;
    if (fileType.includes('png')) return 'png';
    if (fileType.includes('jpeg')) return 'jpg';
    if (fileType.includes('webp')) return 'webp';
    return 'jpg';
}
