import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, message, Spin } from 'antd';
import { UserOutlined, FileTextOutlined, ApartmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/axiosConfig';

const { Title, Paragraph } = Typography;

const iconMapping = {
    'Tổng số người dùng': <UserOutlined style={{ fontSize: 24, color: '#1890ff' }}/>,
    'Phiếu mượn trong tháng': <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }}/>,
    'Tổng số Tổ CM': <ApartmentOutlined style={{ fontSize: 24, color: '#faad14' }}/>,
    'Phiếu mượn của bạn (tháng này)': <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }}/>,
    'Thiết bị quá hạn trả': <ClockCircleOutlined style={{ fontSize: 24, color: '#f5222d' }}/>,
    'Phiếu mượn của tổ (tháng này)': <ApartmentOutlined style={{ fontSize: 24, color: '#1890ff' }}/>,
};

const HomePage = () => {
  const user = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        message.error('Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
      
    <div>
      <Title level={2}>
                {/* SỬA LỖI: Hiển thị fullName thay vì username */}
                Chào mừng, {auth.user?.fullName || auth.user?.username}!
            </Title>
            <Paragraph>
                Bạn đã đăng nhập với vai trò <Text strong>{auth.user.role}</Text>. Dưới đây là tổng quan nhanh về hệ thống.
            </Paragraph>
     // <Title>Chào mừng, {user?.username}!</Title>
      //<Paragraph>
        //Bạn đã đăng nhập với vai trò: <strong>{user?.role}</strong>. Dưới đây là tổng quan nhanh về hệ thống.
     // </Paragraph>
      
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={16}>
          {stats?.stat1 && (
            <Col span={8}>
              <Card>
                <Statistic
                  title={stats.stat1.title}
                  value={stats.stat1.value}
                  prefix={iconMapping[stats.stat1.title]}
                />
              </Card>
            </Col>
          )}
          {stats?.stat2 && (
            <Col span={8}>
              <Card>
                <Statistic
                  title={stats.stat2.title}
                  value={stats.stat2.value}
                  prefix={iconMapping[stats.stat2.title]}
                />
              </Card>
            </Col>
          )}
          {stats?.stat3 && (
            <Col span={8}>
              <Card>
                <Statistic
                  title={stats.stat3.title}
                  value={stats.stat3.value}
                  prefix={iconMapping[stats.stat3.title]}
                />
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default HomePage;
