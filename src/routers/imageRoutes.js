import express from 'express'
import { uploadImage, getImages, deleteImage, updateImage } from '../controllers/imageController.js'
import { upload } from '../middleware/auth.js'

const router = express.Router()

// GET /api/images - Lấy danh sách ảnh (không cần auth)
router.get('/', getImages)

// POST /api/images/upload - Upload ảnh (không cần auth)
router.post('/upload', upload.single('image'), uploadImage)

// DELETE /api/images/:filename - Xóa ảnh (không cần auth)
router.delete('/:filename', deleteImage)

// PUT /api/images/:filename - Cập nhật tên ảnh (không cần auth)
router.put('/:filename', updateImage)

export default router