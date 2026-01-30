// Middleware xác thực
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization
  
  if (!token || !token.startsWith('authenticated_')) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập!' })
  }
  
  next()
}

// Middleware upload file
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'huyen-huyen-memories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1500, height: 1500, crop: 'limit' }]
  }
})

console.log('📁 Using Cloudinary storage')

export const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ được upload file ảnh!'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
})