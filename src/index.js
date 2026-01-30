import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routers/authRoutes.js'
import imageRoutes from './routers/imageRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)

// Middleware
app.use(express.json())
app.use(cors())

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Serve static files từ thư mục HuyenHuyen (cho local development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/HuyenHuyen', express.static(path.join(__dirname, '../../HuyenHuyen')))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/images', imageRoutes)

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '💕 Huyen Huyen Backend API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Backward compatibility routes (để không phá code cũ)
app.post('/api/login', (req, res) => {
  // Redirect to new auth route
  req.url = '/login'
  authRoutes(req, res)
})

app.post('/api/upload', (req, res) => {
  // Redirect to new image route
  req.url = '/upload'
  imageRoutes(req, res)
})

//  Kết nối DB với options tối ưu cho production
const mongoOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout sau 10s
  socketTimeoutMS: 45000, // Close sockets sau 45s không hoạt động
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true,
  w: 'majority'
}

// Thêm error handling cho MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected')
})

mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ Kết nối MongoDB Atlas thành công!')
    console.log('📍 Database:', mongoose.connection.name)
    console.log('🌐 Host:', mongoose.connection.host)
    
    const PORT = process.env.PORT || 3000
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server đang chạy tại cổng: ${PORT}`)
      console.log(`🌐 Local: http://localhost:${PORT}`)
      console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`)
    })
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message)
    console.error('💡 Kiểm tra lại:')
    console.error('   - MONGO_URI trong file .env')
    console.error('   - Network access trong MongoDB Atlas')
    console.error('   - Username/password chính xác')
    process.exit(1)
  })