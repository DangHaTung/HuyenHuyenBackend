import Image from '../models/Image.js'
import cloudinary from '../config/cloudinary.js'

// Upload ảnh lên Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload!' })
    }
    
    // Cloudinary tự động upload, lấy URL và public_id
    const imageUrl = req.file.path // URL từ Cloudinary
    const cloudinaryId = req.file.filename // Public ID để xóa sau
    
    // Lưu metadata vào database
    const imageDoc = new Image({
      filename: cloudinaryId,
      originalName: req.file.originalname,
      description: '',
      url: imageUrl,
      cloudinaryId: cloudinaryId
    })
    
    await imageDoc.save()
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: cloudinaryId,
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
    // Lấy từ database - Cloudinary lưu vĩnh viễn nên không cần check file
    const images = await Image.find().sort({ uploadDate: -1 })
    
    const validImages = images.map(img => ({
      id: img._id,
      filename: img.filename,
      originalName: img.originalName,
      description: img.description,
      url: img.url,
      uploadDate: img.uploadDate
    }))
    
    res.json({ images: validImages })
  } catch (error) {
    console.error('Get images error:', error)
    res.status(500).json({ error: 'Lỗi server!' })
  }
}

// Xóa ảnh từ Cloudinary và database
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params
    
    // Tìm ảnh trong database
    const imageDoc = await Image.findOne({ filename })
    
    if (!imageDoc) {
      return res.status(404).json({ error: 'Không tìm thấy ảnh!' })
    }
    
    // Xóa từ Cloudinary
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

// Cập nhật thông tin ảnh (chỉ metadata, không đổi file trên Cloudinary)
export const updateImage = async (req, res) => {
  try {
    const { filename } = req.params
    const { newName, description } = req.body
    
    // Tìm record trong database
    const imageDoc = await Image.findOne({ filename })
    if (!imageDoc) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin ảnh!' })
    }
    
    // Cập nhật metadata (không đổi file trên Cloudinary)
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