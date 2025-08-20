// File: src/pages/DashboardPage.js (Cập nhật)
// Thêm nút Đăng xuất để kiểm tra

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, message } from 'antd';

const { Title } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    message.success('Đăng xuất thành công!');
    // Chuyển về trang đăng nhập
    navigate('/login');
  };

  return (
    <div style={{ padding: '50px' }}>
      <Title>Chào mừng bạn đến với Trang quản lý</Title>
      <p>Đây là trang chính của ứng dụng sau khi đăng nhập thành công.</p>
      <Button type="primary" danger onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
};

export default DashboardPage;