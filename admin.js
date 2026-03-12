const app = {
    events: [],
    submissions: [],
    editingEventId: null,
    adminToken: localStorage.getItem('mypics-admin-token') || null
};

const elements = {
    adminLogin: document.getElementById('admin-login'),
    adminDashboard: document.getElementById('admin-dashboard'),
    adminPassword: document.getElementById('admin-password'),
    loginBtn: document.getElementById('login-btn'),
    loginMessage: document.getElementById('login-message'),
    logoutBtn: document.getElementById('logout-btn'),
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

const TOTAL_STAFF = 43;

async function apiFetch(endpoint, options = {}) {
    const headers = {
        ...(app.adminToken && { Authorization: `Bearer ${app.adminToken}` }),
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api${endpoint}`, {
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

function showAdmin() {
    elements.adminLogin.style.display = 'none';
    elements.adminDashboard.style.display = 'block';
}

function showLogin() {
    elements.adminLogin.style.display = 'block';
    elements.adminDashboard.style.display = 'none';
}

function setToken(token) {
    app.adminToken = token;
    if (token) localStorage.setItem('mypics-admin-token', token);
    else localStorage.removeItem('mypics-admin-token');
}

function showMessage(target, message, type) {
    target.textContent = message;
    target.className = `status-${type}`;
}

function clearEventForm() {
    app.editingEventId = null;
    elements.formTitle.textContent = 'Tạo Sự Kiện Mới';
    elements.formHint.textContent = 'Nhập thông tin sự kiện để tạo mới.';
    elements.eventTitle.value = '';
    elements.eventDescription.value = '';
    elements.eventDeadline.value = '';
    elements.eventStatus.value = 'active';
}

function startCreateEvent() {
    clearEventForm();
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
    clearEventForm();
    elements.createEventForm.style.display = 'none';
}

async function handleLogin() {
    try {
        const { token } = await apiFetch('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password: elements.adminPassword.value })
        });
        setToken(token);
        elements.adminPassword.value = '';
        showMessage(elements.loginMessage, 'Đăng nhập thành công!', 'success');
        await loadData();
        renderAll();
        showAdmin();
    } catch (error) {
        const message = String(error?.message || '');
        if (message.toLowerCase().includes('invalid password')) {
            showMessage(elements.loginMessage, 'Mật khẩu không đúng!', 'error');
            return;
        }

        showMessage(
            elements.loginMessage,
            'Không kết nối được backend hoặc máy chủ chưa chạy.',
            'error'
        );
    }
}

function handleLogout() {
    setToken(null);
    showLogin();
    cancelEventForm();
    showMessage(elements.loginMessage, 'Đã đăng xuất.', 'success');
}

async function saveEvent() {
    const title = elements.eventTitle.value.trim();
    const description = elements.eventDescription.value.trim();
    const deadline = elements.eventDeadline.value;
    const status = elements.eventStatus.value;

    if (!title) return alert('Vui lòng nhập tiêu đề sự kiện!');
    if (!deadline) return alert('Vui lòng chọn ngày hết hạn!');

    const method = app.editingEventId ? 'PUT' : 'POST';
    const endpoint = app.editingEventId ? `/events/${app.editingEventId}` : '/events';

    try {
        await apiFetch(endpoint, {
            method,
            body: JSON.stringify({ title, description, deadline, status })
        });
        await loadData();
        renderAll();
        cancelEventForm();
    } catch (error) {
        alert(`Lỗi khi lưu sự kiện: ${error.message}`);
    }
}

async function deleteEvent(eventId) {
    const event = app.events.find(item => item.id === eventId);
    if (!event) return;
    if (!window.confirm(`Xoá sự kiện "${event.title}"? Toàn bộ ảnh đã nộp theo sự kiện này cũng sẽ bị xoá.`)) return;

    try {
        await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
        await loadData();
        renderAll();
    } catch (error) {
        alert(`Lỗi khi xoá sự kiện: ${error.message}`);
    }
}

function downloadImagesByEvent(eventId) {
    const event = app.events.find(item => item.id === eventId);
    const eventSubmissions = app.submissions.filter(item => item.eventId === eventId && item.filePath);
    if (!eventSubmissions.length) {
        alert('Sự kiện này chưa có ảnh nào để tải.');
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
}

function downloadAllImages() {
    app.events.forEach(event => downloadImagesByEvent(event.id));
}

function renderAdminEvents() {
    if (!app.events.length) {
        elements.adminEventsList.innerHTML = '<p>Chưa có sự kiện nào.</p>';
        return;
    }

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
                            <span>${eventSubmissions.length}/${TOTAL_STAFF} người đã nộp</span>
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
    elements.progressCards.innerHTML = app.events.length
        ? [...app.events]
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .map(event => {
                const eventSubmissions = app.submissions.filter(item => item.eventId === event.id);
                const progress = Math.round((eventSubmissions.length / TOTAL_STAFF) * 100);
                return `
                    <div class="progress-card">
                        <div class="progress-header">
                            <h3 class="progress-title">${escapeHtml(event.title)}</h3>
                            <span class="progress-stats">${eventSubmissions.length}/${TOTAL_STAFF}</span>
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
                                <div class="stat-value">${TOTAL_STAFF - eventSubmissions.length}</div>
                                <div class="stat-label">Chưa nộp</div>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('')
        : '<p>Chưa có sự kiện nào để theo dõi tiến độ.</p>';
}

function renderAll() {
    renderAdminEvents();
    updateProgress();
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

document.addEventListener('DOMContentLoaded', async () => {
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.createEventBtn.addEventListener('click', startCreateEvent);
    elements.cancelEventBtn.addEventListener('click', cancelEventForm);
    elements.saveEventBtn.addEventListener('click', saveEvent);
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);

    try {
        await loadData();
        renderAll();
    } catch (error) {
        console.error(error);
    }

    if (app.adminToken) {
        showAdmin();
    } else {
        showLogin();
    }
});
