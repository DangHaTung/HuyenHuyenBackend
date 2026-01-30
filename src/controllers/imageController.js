import cloudinary, { hasCloudinaryConfig } from '../config/cloudinary.js'
import Image from '../models/Image.js'

// Upload ảnh - với fallback nếu không có Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload!' })
    }
    
    let imageUrl, filename, cloudinaryId = null
    
    if (hasCloudinaryConfig()) {
      // Upload lên Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'huyen-huyen-gallery',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(req.file.buffer)
      })
      
      imageUrl = result.secure_url
      filename = result.public_id
      cloudinaryId = result.public_id
    } else {
      // Fallback: Trả về base64 (tạm thời)
      const base64 = req.file.buffer.toString('base64')
      imageUrl = `data:${req.file.mimetype};base64,${base64}`
      filename = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Lưu metadata vào database
    const imageDoc = new Image({
      filename: filename,
      originalName: req.file.originalname,
      description: '',
      url: imageUrl,
      cloudinaryId: cloudinaryId
    })
    
    await imageDoc.save()
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: filename,
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
    // Lấy từ database - không cần kiểm tra file tồn tại vì dùng Cloudinary
    const images = await Image.find().sort({ uploadDate: -1 })
    
    const validImages = images.map(img => ({
      id: img._id,
      filename: img.filename,
      originalName: img.originalName,
      description: img.description,
      url: img.url, // URL từ Cloudinary
      uploadDate: img.uploadDate
    }))
    
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
    
    // Tìm ảnh trong database
    const imageDoc = await Image.findOne({ filename })
    if (!imageDoc) {
      return res.status(404).json({ error: 'Không tìm thấy ảnh!' })
    }
    
    // Xóa ảnh trên Cloudinary
    if (imageDoc.cloudinaryId) {
      await cloudinary.uploader.destroy(imageDoc.cloudinaryId)
    }
    
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
    
    // Tìm record trong database
    const imageDoc = await Image.findOne({ filename })
    if (!imageDoc) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin ảnh!' })
    }
    
    // Cập nhật database (không cần rename file vì dùng Cloudinary)
    imageDoc.originalName = newName || imageDoc.originalName
    imageDoc.description = description || imageDoc.description
    
    await imageDoc.save()
    
    res.json({ 
      success: true, 
      message: 'Cập nhật thông tin ảnh thành công!',
      newFilename: imageDoc.filename,
      newUrl: imageDoc.url,
      originalName: imageDoc.originalName,
      description: imageDoc.description
    })
  } catch (error) {
    console.error('Error updating image:', error)
    res.status(500).json({ error: 'Lỗi khi cập nhật ảnh!' })
  }
}