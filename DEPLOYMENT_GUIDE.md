# 🚀 Deployment Guide - Huyen Huyen Backend

## Các thay đổi đã thực hiện để fix lỗi deployment:

### 1. ✅ Fix File Upload Path
- **Trước**: Upload vào `../../../HuyenHuyen/image/` (không tồn tại trên server)
- **Sau**: Upload vào `backend/uploads/` (tạo tự động nếu chưa có)
- **URL**: Từ `/HuyenHuyen/image/filename` → `/uploads/filename`

### 2. ✅ Cải thiện MongoDB Connection
- Tăng timeout từ 5s → 10s
- Thêm error handling và reconnection logic
- Bind server to `0.0.0.0` thay vì localhost
- Thêm detailed error messages

### 3. ✅ Environment Variables
- Thêm `NODE_ENV=production`
- Conditional static file serving

## 🔧 Cách deploy trên Render:

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Fix deployment issues - update file paths and MongoDB connection"
git push origin main
```

### Bước 2: Cấu hình trên Render
1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment Variables**:
   - `MONGO_URI`: `mongodb+srv://huyenhuyen:HuyenYeuTung2026!@cluster0.shmodiu.mongodb.net/huyenhuyen?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET`: `huyen-yeu-tung-2026-super-secret-jwt-key-for-love-app`
   - `NODE_ENV`: `production`
   - `PORT`: (để trống, Render sẽ tự set)

### Bước 3: MongoDB Atlas Network Access
Đảm bảo MongoDB Atlas cho phép kết nối từ Render:
1. Vào MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Chọn "Allow access from anywhere" (0.0.0.0/0)
4. Hoặc thêm IP ranges của Render

## 🧪 Test sau khi deploy:

### Health Check:
```
GET https://your-app.onrender.com/
GET https://your-app.onrender.com/health
```

### API Endpoints:
```
POST https://your-app.onrender.com/api/auth/login
POST https://your-app.onrender.com/api/images/upload
GET https://your-app.onrender.com/api/images
```

## 📁 File Structure sau khi deploy:
```
backend/
├── uploads/           # Thư mục lưu ảnh upload
│   └── .gitkeep
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routers/
└── package.json
```

## 🔄 Cập nhật Frontend:
Sau khi backend deploy thành công, cần update API URL trong frontend từ:
- `http://localhost:3000` → `https://your-app.onrender.com`