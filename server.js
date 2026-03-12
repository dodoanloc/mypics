require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'agribank2026';
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_PATH = path.resolve(process.env.DB_PATH || path.join(DATA_DIR, 'mypics.db'));
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  staffId TEXT NOT NULL,
  fullName TEXT NOT NULL,
  fileName TEXT NOT NULL,
  filePath TEXT NOT NULL,
  fileType TEXT NOT NULL,
  fileSize INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded',
  FOREIGN KEY (eventId) REFERENCES events(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_event_staff
ON submissions(eventId, staffId);
`);

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function migrateJsonToSqlite() {
  const eventCount = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
  const submissionCount = db.prepare('SELECT COUNT(*) AS count FROM submissions').get().count;

  if (eventCount === 0) {
    const events = readJsonArray(EVENTS_FILE);
    const insertEvent = db.prepare(`
      INSERT OR IGNORE INTO events (id, title, description, deadline, status, createdAt, updatedAt)
      VALUES (@id, @title, @description, @deadline, @status, @createdAt, @updatedAt)
    `);
    const tx = db.transaction((items) => {
      for (const event of items) {
        insertEvent.run({
          id: String(event.id),
          title: event.title,
          description: event.description || '',
          deadline: event.deadline,
          status: event.status || 'active',
          createdAt: event.createdAt || new Date().toISOString(),
          updatedAt: event.updatedAt || event.createdAt || new Date().toISOString()
        });
      }
    });
    tx(events);
  }

  if (submissionCount === 0) {
    const submissions = readJsonArray(SUBMISSIONS_FILE);
    const insertSubmission = db.prepare(`
      INSERT OR IGNORE INTO submissions
      (id, eventId, staffId, fullName, fileName, filePath, fileType, fileSize, timestamp, status)
      VALUES (@id, @eventId, @staffId, @fullName, @fileName, @filePath, @fileType, @fileSize, @timestamp, @status)
    `);
    const tx = db.transaction((items) => {
      for (const submission of items) {
        insertSubmission.run({
          id: String(submission.id),
          eventId: String(submission.eventId),
          staffId: String(submission.staffId),
          fullName: submission.fullName,
          fileName: submission.fileName || 'upload.jpg',
          filePath: submission.filePath || '',
          fileType: submission.fileType || 'image/jpeg',
          fileSize: submission.fileSize || 0,
          timestamp: submission.timestamp || new Date().toISOString(),
          status: submission.status || 'uploaded'
        });
      }
    });
    tx(submissions.filter(item => item.filePath));
  }
}

migrateJsonToSqlite();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

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

function getEvents() {
  return db.prepare('SELECT * FROM events ORDER BY deadline ASC, createdAt ASC').all();
}

function getSubmissions(eventId) {
  if (eventId) {
    return db.prepare('SELECT * FROM submissions WHERE eventId = ? ORDER BY timestamp DESC').all(String(eventId));
  }
  return db.prepare('SELECT * FROM submissions ORDER BY timestamp DESC').all();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

app.get('/api/events', (_req, res) => {
  res.json(getEvents());
});

app.post('/api/events', requireAdmin, (req, res) => {
  const { title, description, deadline, status } = req.body || {};
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = new Date().toISOString();
  const newEvent = {
    id: String(Date.now()),
    title,
    description: description || '',
    deadline,
    status: status || 'active',
    createdAt: now,
    updatedAt: now
  };

  db.prepare(`
    INSERT INTO events (id, title, description, deadline, status, createdAt, updatedAt)
    VALUES (@id, @title, @description, @deadline, @status, @createdAt, @updatedAt)
  `).run(newEvent);

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(String(id));
  if (!existing) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { title, description, deadline, status } = req.body || {};
  const updated = {
    ...existing,
    title: title || existing.title,
    description: description !== undefined ? description : existing.description,
    deadline: deadline || existing.deadline,
    status: status || existing.status,
    updatedAt: new Date().toISOString()
  };

  db.prepare(`
    UPDATE events
    SET title=@title, description=@description, deadline=@deadline, status=@status, updatedAt=@updatedAt
    WHERE id=@id
  `).run(updated);

  res.json(updated);
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(String(id));
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const files = db.prepare('SELECT filePath FROM submissions WHERE eventId = ?').all(String(id));
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM submissions WHERE eventId = ?').run(String(id));
    db.prepare('DELETE FROM events WHERE id = ?').run(String(id));
  });
  tx();

  for (const file of files) {
    const target = path.join(UPLOADS_DIR, file.filePath);
    if (file.filePath && fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  }

  res.json({ success: true });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  const { eventId, staffId, fullName } = req.body || {};
  const file = req.file;

  if (!eventId || !staffId || !fullName || !file) {
    return res.status(400).json({ error: 'Missing required fields or file' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(String(eventId));
  if (!event || event.status !== 'active') {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Event not found or inactive' });
  }

  const existing = db.prepare('SELECT * FROM submissions WHERE eventId = ? AND staffId = ?').get(String(eventId), String(staffId));
  const submission = {
    id: existing ? existing.id : String(Date.now()),
    eventId: String(eventId),
    staffId: String(staffId),
    fullName,
    fileName: file.originalname,
    filePath: file.filename,
    fileType: file.mimetype,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
    status: 'uploaded'
  };

  if (existing?.filePath) {
    const oldFile = path.join(UPLOADS_DIR, existing.filePath);
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  db.prepare(`
    INSERT INTO submissions (id, eventId, staffId, fullName, fileName, filePath, fileType, fileSize, timestamp, status)
    VALUES (@id, @eventId, @staffId, @fullName, @fileName, @filePath, @fileType, @fileSize, @timestamp, @status)
    ON CONFLICT(eventId, staffId) DO UPDATE SET
      fullName=excluded.fullName,
      fileName=excluded.fileName,
      filePath=excluded.filePath,
      fileType=excluded.fileType,
      fileSize=excluded.fileSize,
      timestamp=excluded.timestamp,
      status=excluded.status
  `).run(submission);

  res.json(submission);
});

app.get('/api/submissions', (req, res) => {
  res.json(getSubmissions(req.query.eventId));
});

app.get('/api/staff', (_req, res) => {
  res.json([
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
  ]);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), dbPath: DB_PATH });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
