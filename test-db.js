import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const testConnection = async () => {
  try {
    console.log('🔄 Đang test kết nối MongoDB Atlas...')
    console.log('📍 URI:', process.env.MONGO_URI?.replace(/\/\/.*@/, '//***:***@'))
    
    await mongoose.connect(process.env.MONGO_URI)
    
    console.log('✅ Kết nối thành công!')
    console.log('📊 Database:', mongoose.connection.name)
    console.log('🌐 Host:', mongoose.connection.host)
    console.log('🔌 Ready State:', mongoose.connection.readyState)
    
    // Test tạo collection
    const testSchema = new mongoose.Schema({ test: String })
    const TestModel = mongoose.model('Test', testSchema)
    
    const testDoc = new TestModel({ test: 'Hello MongoDB Atlas!' })
    await testDoc.save()
    console.log('✅ Test document created:', testDoc._id)
    
    // Xóa test document
    await TestModel.deleteOne({ _id: testDoc._id })
    console.log('🗑️ Test document deleted')
    
    await mongoose.connection.close()
    console.log('👋 Connection closed')
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message)
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 Kiểm tra username/password trong MongoDB Atlas')
    } else if (error.message.includes('network')) {
      console.error('💡 Kiểm tra Network Access trong MongoDB Atlas')
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Kiểm tra cluster URL trong MONGO_URI')
    }
    
    process.exit(1)
  }
}

testConnection()