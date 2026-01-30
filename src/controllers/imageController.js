import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Image from '../models/Image.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Upload ảnh
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload!' })
    }
    
    const imageUrl = `/HuyenHuyen/image/${req.file.filename}`
    
    // Lưu metadata vào database
    const imageDoc = new Image({
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: '',
      url: imageUrl
    })
    
    await imageDoc.save()
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename,
      id: imageDoc._id
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Lỗi khi upload ảnh!' })
  }
}

// Lấy danh sách ảnh
export const getImages = async (req, res) => {
  try {
    // Lấy từ database
    const images = await Image.find().sort({ uploadDate: -1 })
    
    // Kiểm tra file có tồn tại không
    const imagePath = path.join(__dirname, '../../../HuyenHuyen/image/')
    const validImages = []
    
    for (const img of images) {
      const filePath = path.join(imagePath, img.filename)
      if (fs.existsSync(filePath)) {
        validImages.push({
          id: img._id,
          filename: img.filename,
          originalName: img.originalName,
          description: img.description,
          url: img.url,
          uploadDate: img.uploadDate
        })
      } else {
        // Xóa record nếu file không tồn tại
        await Image.findByIdAndDelete(img._id)
      }
    }
    
    res.json({ images: validImages })
  } catch (error) {
    console.error('Get images error:', error)
    res.status(500).json({ error: 'Lỗi server!' })
  }
}

// Xóa ảnh
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params
    
    // Kiểm tra filename có hợp lệ không
    if (!filename || !filename.startsWith('uploaded-')) {
      return res.status(400).json({ error: 'Tên file không hợp lệ!' })
    }
    
    const imagePath = path.join(__dirname, '../../../HuyenHuyen/image/', filename)
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Không tìm thấy ảnh!' })
    }
    
    // Xóa file
    fs.unlinkSync(imagePath)
    
    // Xóa record trong database
    await Image.findOneAndDelete({ filename })
    
    res.json({ 
      success: true, 
      message: 'Xóa ảnh thành công!' 
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ error: 'Lỗi khi xóa ảnh!' })
  }
}

// Cập nhật thông tin ảnh (tên + mô tả)
export const updateImage = async (req, res) => {
  try {
    const { filename } = req.params
    const { newName, description } = req.body
    
    // Kiểm tra input
    if (!filename || !filename.startsWith('uploaded-')) {
      return res.status(400).json({ error: 'Tên file không hợp lệ!' })
    }
    
    const imagePath = path.join(__dirname, '../../../HuyenHuyen/image/')
    const oldPath = path.join(imagePath, filename)
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ error: 'Không tìm thấy ảnh!' })
    }
    
    // Tìm record trong database
    const imageDoc = await Image.findOne({ filename })
    if (!imageDoc) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin ảnh!' })
    }
    
    let newFilename = filename
    let newUrl = imageDoc.url
    
    // Nếu có đổi tên
    if (newName && newName.trim() !== '') {
      const fileExtension = path.extname(filename)
      const timestamp = Date.now()
      newFilename = `uploaded-${newName.trim().replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}${fileExtension}`
      const newPath = path.join(imagePath, newFilename)
      
      // Rename file
      fs.renameSync(oldPath, newPath)
      newUrl = `/HuyenHuyen/image/${newFilename}`
    }
    
    // Cập nhật database
    imageDoc.filename = newFilename
    imageDoc.originalName = newName || imageDoc.originalName
    imageDoc.description = description || imageDoc.description
    imageDoc.url = newUrl
    
    await imageDoc.save()
    
    res.json({ 
      success: true, 
      message: 'Cập nhật thông tin ảnh thành công!',
      newFilename: newFilename,
      newUrl: newUrl,
      originalName: imageDoc.originalName,
      description: imageDoc.description
    })
  } catch (error) {
    console.error('Error updating image:', error)
    res.status(500).json({ error: 'Lỗi khi cập nhật ảnh!' })
  }
}