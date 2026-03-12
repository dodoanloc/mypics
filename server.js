const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve frontend files
app.use('/uploads', express.static('uploads'));

// File paths
const DATA_DIR = 'data';
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Đọc dữ liệu từ file
function readEvents() {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  const data = fs.readFileSync(EVENTS_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function readSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
  const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Ghi dữ liệu
function writeEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

function writeSubmissions(submissions) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

// Mật khẩu admin (có thể đổi trong tương lai)
const ADMIN_PASSWORD = 'agribank2026';

// Middleware kiểm tra đăng nhập admin
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.substring(7);
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

// API đăng nhập admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// API sự kiện (CRUD)
app.get('/api/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

app.post('/api/events', requireAdmin, (req, res) => {
  const { title, description, deadline, status } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const events = readEvents();
  const newEvent = {
    id: Date.now().toString(),
    title,
    description: description || '',
    deadline,
    status: status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  events.push(newEvent);
  writeEvents(events);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, status } = req.body;
  const events = readEvents();
  const eventIndex = events.findIndex(e => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const updatedEvent = {
    ...events[eventIndex],
    title: title || events[eventIndex].title,
    description: description !== undefined ? description : events[eventIndex].description,
    deadline: deadline || events[eventIndex].deadline,
    status: status || events[eventIndex].status,
    updatedAt: new Date().toISOString()
  };
  events[eventIndex] = updatedEvent;
  writeEvents(events);
  res.json(updatedEvent);
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const events = readEvents();
  const eventIndex = events.findIndex(e => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  // Xóa các submissions liên quan
  const submissions = readSubmissions();
  const updatedSubmissions = submissions.filter(s => s.eventId !== id);
  writeSubmissions(updatedSubmissions);
  // Xóa sự kiện
  events.splice(eventIndex, 1);
  writeEvents(events);
  res.json({ success: true });
});

// API upload ảnh
app.post('/api/upload', upload.single('image'), (req, res) => {
  const { eventId, staffId, fullName } = req.body;
  const file = req.file;
  if (!eventId || !staffId || !fullName || !file) {
    return res.status(400).json({ error: 'Missing required fields or file' });
  }
  const events = readEvents();
  const event = events.find(e => e.id === eventId);
  if (!event || event.status !== 'active') {
    return res.status(400).json({ error: 'Event not found or inactive' });
  }
  const submissions = readSubmissions();
  // Tìm submission đã tồn tại (cùng event và staff)
  const existingIndex = submissions.findIndex(s => s.eventId === eventId && s.staffId === staffId);
  const newSubmission = {
    id: existingIndex >= 0 ? submissions[existingIndex].id : Date.now().toString(),
    eventId,
    staffId,
    fullName,
    fileName: file.originalname,
    filePath: file.filename,
    fileType: file.mimetype,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
    status: 'uploaded'
  };
  if (existingIndex >= 0) {
    // Xóa file cũ nếu có
    const oldFile = submissions[existingIndex].filePath;
    if (oldFile && fs.existsSync(path.join('uploads', oldFile))) {
      fs.unlinkSync(path.join('uploads', oldFile));
    }
    submissions[existingIndex] = newSubmission;
  } else {
    submissions.push(newSubmission);
  }
  writeSubmissions(submissions);
  res.json(newSubmission);
});

// API lấy danh sách submissions theo event
app.get('/api/submissions', (req, res) => {
  const { eventId } = req.query;
  const submissions = readSubmissions();
  let filtered = submissions;
  if (eventId) {
    filtered = submissions.filter(s => s.eventId === eventId);
  }
  res.json(filtered);
});

// API lấy danh sách staff (cố định)
app.get('/api/staff', (req, res) => {
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
  res.json(staffList);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});