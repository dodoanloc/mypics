const app = {
    events: [],
    submissions: []
};

const elements = {
    eventsList: document.getElementById('events-list'),
    eventSelect: document.getElementById('event-select'),
    uploadFile: document.getElementById('upload-file'),
    fileInfo: document.getElementById('file-info'),
    staffSelect: document.getElementById('staff-select'),
    submitBtn: document.getElementById('submit-btn'),
    uploadStatus: document.getElementById('upload-status')
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
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`/api${endpoint}`, { ...options, headers });
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

function setupEventListeners() {
    elements.uploadFile.addEventListener('change', handleFileSelect);
    elements.submitBtn.addEventListener('click', handleUpload);

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
        await apiFetch('/upload', { method: 'POST', body: formData });
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

function renderAll() {
    renderEvents();
    renderEventSelect();
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

function showStatus(message, type) {
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `status-${type}`;
    setTimeout(() => {
        if (elements.uploadStatus.textContent === message) {
            elements.uploadStatus.textContent = '';
            elements.uploadStatus.className = '';
        }
    }, 5000);
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('vi-VN');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', async () => {
    populateStaffSelect();
    setupEventListeners();
    try {
        await loadData();
        renderAll();
    } catch (error) {
        console.error(error);
        showStatus('Không thể tải dữ liệu từ server.', 'error');
    }
});
