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
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../HuyenHuyen/image/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'uploaded-' + uniqueSuffix + path.extname(file.originalname))
  }
})

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