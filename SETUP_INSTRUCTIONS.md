# Hướng dẫn Thiết Lập Repository GitHub

## Bước 1: Tạo Repository trên GitHub

1. Đăng nhập vào GitHub tại https://github.com
2. Nhấn "New" để tạo repository mới
3. Đặt tên repository là: `mypics`
4. Chọn visibility: Public (để deploy lên GitHub Pages)
5. Không cần initialize với README, .gitignore, hoặc license
6. Nhấn "Create repository"

## Bước 2: Cài đặt Git và đẩy code lên

Trên máy tính của bạn, chạy các lệnh sau:

```bash
# Vào thư mục project
cd /home/locdodoan/.openclaw/workspace/mypics

# Khởi tạo git repository
git init

# Thêm tất cả file
git add .

# Commit ban đầu
git commit -m "Initial commit - Agribank Thọ Xuân photo submission system"

# Liên kết với repository GitHub (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/mypics.git

# Đẩy lên branch main
git branch -M main
git push -u origin main
```

## Bước 3: Kích hoạt GitHub Pages

1. Vào repository trên GitHub
2. Nhấn vào tab "Settings"
3. Cuộn xuống phần "Pages"
4. Trong "Source", chọn:
   - Branch: `main`
   - Folder: `/root`
5. Nhấn "Save"
6. Sau vài phút, trang web sẽ được deploy tại: `https://YOUR_USERNAME.github.io/mypics`

## Bước 4: Quản trị hệ thống

- **Tài khoản admin**: 
  - Username: `admin`
  - Password: `agribank2026`
- Truy cập phần "Quản Trị" để tạo sự kiện và quản lý ảnh

## Lưu ý bảo mật

- Trong môi trường production, nên thay đổi mật khẩu admin và sử dụng hệ thống xác thực mạnh hơn
- Hiện tại hệ thống lưu dữ liệu trong localStorage (chỉ cho demo), trong production cần kết nối với server database

---
Đã hoàn thành thiết lập cơ bản cho hệ thống nộp ảnh Agribank Thọ Xuân!