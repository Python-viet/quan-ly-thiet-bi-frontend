// File: src/components/ProtectedRoute.js (File mới)
// Component này kiểm tra xem người dùng đã đăng nhập chưa

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Nếu không có token, chuyển hướng về trang đăng nhập
    return <Navigate to="/login" />;
  }

  // Nếu có token, hiển thị component con (trang được bảo vệ)
  return children;
};

export default ProtectedRoute;