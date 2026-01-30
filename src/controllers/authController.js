// Controller xử lý xác thực
export const login = (req, res) => {
  const { username, password } = req.body
  
  // Tài khoản fix cứng
  const validCredentials = {
    username: 'huyeniutung',
    password: 'tungiuhuyen'
  }
  
  if (username === validCredentials.username && password === validCredentials.password) {
    // Tạo token đơn giản (trong thực tế nên dùng JWT)
    const token = 'authenticated_' + Date.now()
    res.json({ 
      success: true, 
      message: 'Đăng nhập thành công!',
      token: token
    })
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
    })
  }
}