import express from 'express'
import { uploadImage, getImages, deleteImage, updateImage } from '../controllers/imageController.js'
import { requireAuth, upload } from '../middleware/auth.js'

const router = express.Router()

// GET /api/images - Lấy danh sách ảnh
router.get('/', requireAuth, getImages)

// POST /api/images/upload - Upload ảnh
router.post('/upload', requireAuth, upload.single('image'), uploadImage)

// DELETE /api/images/:filename - Xóa ảnh
router.delete('/:filename', requireAuth, deleteImage)

// PUT /api/images/:filename - Cập nhật tên ảnh
router.put('/:filename', requireAuth, updateImage)

export default router