// Auth controller - đơn giản hóa, không cần authentication thực sự

export const login = (req, res) => {
  // Trả về token giả để tương thích với frontend cũ
  res.json({
    success: true,
    token: 'authenticated_huyen_yeuanh123',
    message: 'Đăng nhập thành công!'
  })
}

export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công!'
  })
}
