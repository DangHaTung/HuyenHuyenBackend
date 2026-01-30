import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  originalName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true // ID để xóa ảnh trên Cloudinary
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.model('Image', imageSchema)