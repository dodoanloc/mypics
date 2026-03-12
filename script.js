const API_BASE = '';

const app = {
    events: [],
    submissions: [],
    isAdmin: false,
    editingEventId: null,
    adminToken: null
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

async function apiFetch(endpoint, options = {}) {
    const headers = {
        ...(app.adminToken && { Authorization: `Bearer ${app.adminToken}` }),
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}/api${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        let errorMessage = `API error ${response.status}`;
        try {
            const data = await response.json();
            errorMessage = data.error || data.message || errorMessage;
        } catch {
            errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

async function loadData() {
    const [events, submissions] = await Promise.all([
        apiFetch('/events'),
        apiFetch('/submissions')
    ]);
    app.events = events;
    app.submissions = submissions;
}

async function uploadImage(formData) {
    return apiFetch('/upload', {
        method: 'POST',
        body: formData
    });
}

async function loginAdmin(password) {
    const response = await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
    });
    return response.token;
}

document.addEventListener('DOMContentLoaded', async () => {
    populateStaffSelect();
    setupEventListeners();
    checkAdminStatus();

    try {
        await loadData();
        renderAll();
    } catch (error) {
        console.error(error);
        showStatus('Không thể tải dữ liệu từ server.', 'error');
    }
});

function setupEventListeners() {
    elements.uploadFile.addEventListener('change', handleFileSelect);
    elements.submitBtn.addEventListener('click', handleUpload);
    elements.loginBtn.addEventListener('click', handleAdminLogin);
    elements.createEventBtn.addEventListener('click', startCreateEvent);
    elements.cancelEventBtn.addEventListener('click', cancelEventForm);
    elements.saveEventBtn.addEventListener('click', saveEventHandler);
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

async function handleUpload() {
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
    const formData = new FormData();
    formData.append('image', file);
    formData.append('eventId', eventId);
    formData.append('staffId', staffId);
    formData.append('fullName', staff?.name || '');

    showStatus('Đang tải ảnh lên...', 'info');

    try {
        await uploadImage(formData);
        app.submissions = await apiFetch('/submissions');
        renderAll();
        showStatus('Tải ảnh thành công!', 'success');
        elements.uploadFile.value = '';
        elements.staffSelect.value = '';
        elements.eventSelect.value = '';
        elements.fileInfo.textContent = 'Chưa chọn tệp';
    } catch (error) {
        showStatus(`Upload thất bại: ${error.message}`, 'error');
    }
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
    const html = [...app.events]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .map(event => {
            const eventSubmissions = app.submissions.filter(s => s.eventId === event.id);
            const progress = Math.round((eventSubmissions.length / totalStaff) * 100);
            return `
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
        })
        .join('');

    elements.eventsList.innerHTML = html || '<p>Hiện chưa có sự kiện nào. Vui lòng chờ quản trị viên tạo sự kiện.</p>';
}

function renderEventSelect() {
    let options = '<option value="">-- Chọn sự kiện --</option>';
    [...app.events]
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

async function handleAdminLogin() {
    const password = elements.adminPassword.value;
    try {
        app.adminToken = await loginAdmin(password);
        app.isAdmin = true;
        elements.loginMessage.textContent = 'Đăng nhập thành công!';
        elements.loginMessage.className = 'status-success';
        elements.adminLogin.style.display = 'none';
        elements.adminDashboard.style.display = 'block';
        elements.adminPassword.value = '';
        renderAdminEvents();
        updateProgress();
    } catch {
        elements.loginMessage.textContent = 'Mật khẩu không đúng!';
        elements.loginMessage.className = 'status-error';
    }
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

async function saveEventHandler() {
    const title = elements.eventTitle.value.trim();
    const description = elements.eventDescription.value.trim();
    const deadline = elements.eventDeadline.value;
    const status = elements.eventStatus.value;

    if (!title) return showStatus('Vui lòng nhập tiêu đề sự kiện!', 'error');
    if (!deadline) return showStatus('Vui lòng chọn ngày hết hạn!', 'error');

    try {
        const method = app.editingEventId ? 'PUT' : 'POST';
        const endpoint = app.editingEventId ? `/events/${app.editingEventId}` : '/events';
        await apiFetch(endpoint, {
            method,
            body: JSON.stringify({ title, description, deadline, status })
        });
        await loadData();
        renderAll();
        showStatus(app.editingEventId ? 'Đã cập nhật sự kiện thành công!' : 'Đã tạo sự kiện thành công!', 'success');
        cancelEventForm();
    } catch (error) {
        showStatus(`Lỗi khi lưu sự kiện: ${error.message}`, 'error');
    }
}

async function deleteEventHandler(eventId) {
    const event = app.events.find(item => item.id === eventId);
    if (!event) return;
    const confirmed = window.confirm(`Xoá sự kiện "${event.title}"? Toàn bộ ảnh đã nộp theo sự kiện này cũng sẽ bị xoá.`);
    if (!confirmed) return;

    try {
        await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
        await loadData();
        renderAll();
        showStatus('Đã xoá sự kiện thành công!', 'success');
    } catch (error) {
        showStatus(`Lỗi khi xoá sự kiện: ${error.message}`, 'error');
    }
}

function renderAdminEvents() {
    if (!elements.adminEventsList) return;
    if (!app.events.length) {
        elements.adminEventsList.innerHTML = '<p>Chưa có sự kiện nào.</p>';
        return;
    }

    const totalStaff = staffList.length;
    elements.adminEventsList.innerHTML = [...app.events]
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
            if (action === 'delete') deleteEventHandler(id);
            if (action === 'download') downloadImagesByEvent(id);
        });
    });
}

function updateProgress() {
    if (!elements.progressCards) return;
    const totalStaff = staffList.length;
    elements.progressCards.innerHTML = app.events.length
        ? [...app.events]
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
    const eventSubmissions = app.submissions.filter(item => item.eventId === eventId && item.filePath);
    if (!event || !eventSubmissions.length) {
        if (!silent) showStatus('Sự kiện này chưa có ảnh nào để tải!', 'error');
        return;
    }

    eventSubmissions.forEach((submission, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = `/uploads/${submission.filePath}`;
            link.download = `${slugify(event.title)}-${slugify(submission.fullName)}-${index + 1}.${getExtension(submission.fileName, submission.fileType)}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }, index * 200);
    });

    if (!silent) showStatus(`Đang tải ${eventSubmissions.length} ảnh của sự kiện "${event.title}".`, 'success');
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
