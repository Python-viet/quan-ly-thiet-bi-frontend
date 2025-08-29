import React from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import {
  HomeOutlined,
  FormOutlined,
  HistoryOutlined,
  BarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import useAuth from '../hooks/useAuth';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const getMenuItems = (role) => {
  if (role === 'teacher') {
    return [
      { key: '/app/home', icon: <HomeOutlined />, label: <Link to="/app/home">Trang chủ</Link> },
      { key: '/app/new-form', icon: <FormOutlined />, label: <Link to="/app/new-form">Nhập phiếu mượn</Link> },
      { key: '/app/history', icon: <HistoryOutlined />, label: <Link to="/app/history">Lịch sử mượn</Link> },
    ];
  }

  if (role === 'leader') {
    return [
      { key: '/app/home', icon: <HomeOutlined />, label: <Link to="/app/home">Trang chủ</Link> },
      { key: '/app/new-form', icon: <FormOutlined />, label: <Link to="/app/new-form">Nhập phiếu mượn</Link> },
      { key: '/app/history', icon: <HistoryOutlined />, label: <Link to="/app/history">Lịch sử mượn</Link> },
      { key: '/app/statistics', icon: <BarChartOutlined />, label: <Link to="/app/statistics">Thống kê</Link> },
    ];
  }

  if (role === 'manager') {
    return [
      { key: '/app/statistics', icon: <BarChartOutlined />, label: <Link to="/app/statistics">Thống kê & Báo cáo</Link> },
    ];
  }

  if (role === 'admin') {
    return [
      { key: '/app/home', icon: <HomeOutlined />, label: <Link to="/app/home">Trang chủ</Link> },
      { key: '/app/user-management', icon: <TeamOutlined />, label: <Link to="/app/user-management">Quản lý tài khoản</Link> },
      { key: '/app/department-management', icon: <ApartmentOutlined />, label: <Link to="/app/department-management">Quản lý Tổ CM</Link> },
      { key: '/app/statistics', icon: <BarChartOutlined />, label: <Link to="/app/statistics">Thống kê & Báo cáo</Link> },
      { key: '/app/data-management', icon: <DatabaseOutlined />, label: <Link to="/app/data-management">Quản lý Dữ liệu</Link> },
    ];
  }
  return [];
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = getMenuItems(user?.role);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ padding: '16px 8px', textAlign: 'center' }}>
            <Title level={5} style={{ color: 'white', margin: 0, textTransform: 'uppercase' }}>
                Hệ thống QLTB
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                {user?.role}
            </Text>
        </div>
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Space align="center">
             {/* SỬA LỖI: Hiển thị fullName thay vì username */}
             <Text>Xin chào, <strong>{user?.fullName || user?.username}</strong></Text>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
