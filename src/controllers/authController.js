// Controller xử lý đăng nhập
export const login = (req, res) => {
  const { username, password } = req.body
  
  // Đăng nhập fix cứng
  if (username === 'huyen' && password === 'yeuanh123') {
    // Tạo token đơn giản
    const token = 'authenticated_' + username + '_' + password
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token
    })
  } else {
    res.status(401).json({
      success: false,
      error: 'Sai tên đăng nhập hoặc mật khẩu!'
    })
  }
}
