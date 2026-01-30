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

// Serve static files từ thư mục HuyenHuyen
app.use('/HuyenHuyen', express.static(path.join(__dirname, '../../HuyenHuyen')))

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

//  Kết nối DB với options tối ưu
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout sau 5s
  socketTimeoutMS: 45000, // Close sockets sau 45s không hoạt động
  maxPoolSize: 10, // Maintain up to 10 socket connections
}

mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ Kết nối MongoDB Atlas thành công!')
    console.log('📍 Database:', mongoose.connection.name)
    console.log('🌐 Host:', mongoose.connection.host)
    
    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng: ${PORT}`)
      console.log(`🌐 Local: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message)
    console.error('💡 Kiểm tra lại MONGO_URI trong file .env')
    process.exit(1)
  })