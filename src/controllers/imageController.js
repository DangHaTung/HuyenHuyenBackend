import cloudinary, { hasCloudinaryConfig } from '../config/cloudinary.js'
import Image from '../models/Image.js'

// Upload ảnh lên Cloudinary với URL fix
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload!' })
    }
    
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
    
    // Sử dụng secure_url từ Cloudinary response
    const imageUrl = result.secure_url
    const filename = result.public_id
    const cloudinaryId = result.public_id
    
    console.log('✅ Cloudinary upload success:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    })
    
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
    // Lấy từ database
    const images = await Image.find().sort({ uploadDate: -1 })
    
    const validImages = images.map(img => {
      let imageUrl = img.url
      
      // Fix URL cho ảnh Cloudinary cũ có version number
      if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/v1')) {
        // Loại bỏ version number từ URL
        const publicId = img.filename || img.cloudinaryId
        if (publicId) {
          imageUrl = `https://res.cloudinary.com/ddm4qzjmv/image/upload/${publicId}.jpg`
        }
      }
      
      return {
        id: img._id,
        filename: img.filename,
        originalName: img.originalName,
        description: img.description,
        url: imageUrl, // URL đã được fix
        uploadDate: img.uploadDate
      }
    })
    
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