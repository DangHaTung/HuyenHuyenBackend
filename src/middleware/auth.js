// Middleware xác thực - đơn giản hóa
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization
  
  if (!token || !token.startsWith('authenticated_')) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập!' })
  }
  
  next()
}

// Middleware upload file
import multer from 'multer'

// Sử dụng memory storage cho Cloudinary
const storage = multer.memoryStorage()

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
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})
