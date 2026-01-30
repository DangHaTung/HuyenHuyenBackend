# Huyen Huyen Backend API

Backend API cho ứng dụng ảnh kỷ niệm Huyen Huyen.

## 🚀 Features

- ✅ Authentication (Login/Logout)
- ✅ Image Upload & Management
- ✅ CRUD Operations (Create, Read, Update, Delete)
- ✅ MongoDB Atlas Integration
- ✅ File Storage Management

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **File Upload:** Multer
- **Authentication:** JWT
- **Environment:** dotenv

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret-key
```

## 🏃‍♂️ Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Test Database Connection
```bash
npm run test-db
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Images
- `GET /api/images` - Get all images (requires auth)
- `POST /api/images/upload` - Upload image (requires auth)
- `PUT /api/images/:filename` - Update image info (requires auth)
- `DELETE /api/images/:filename` - Delete image (requires auth)

## 🚀 Deployment

This backend is ready to deploy on:
- Railway
- Render
- Vercel
- Heroku

## 📝 Notes

- Images are stored in `/HuyenHuyen/image/` directory
- Database: MongoDB Atlas
- Authentication: Simple token-based auth
- File uploads limited to 5MB per image