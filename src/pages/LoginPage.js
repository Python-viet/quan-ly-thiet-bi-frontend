// File: src/pages/LoginPage.js (Cập nhật)
// Thêm chức năng "Ghi nhớ tài khoản"

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Tự động điền thông tin nếu người dùng đã chọn "Ghi nhớ" từ trước
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      form.setFieldsValue({
        username: rememberedUser,
        remember: true,
      });
    }
  }, [form]);

  const onFinish = async (values) => {
    try {
      const response = await apiClient.post('/auth/login', values);
      message.success('Đăng nhập thành công!');
      
      localStorage.setItem('token', response.data.token);

      // Xử lý logic "Ghi nhớ tài khoản"
      if (values.remember) {
        localStorage.setItem('rememberedUser', values.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }

      navigate('/app');

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error(error.response?.data?.error || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          HỆ THỐNG QUẢN LÝ ĐDDH
        </Title>
        <Form
          form={form}
          name="login_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* SỬA LỖI: Thêm ô Checkbox "Ghi nhớ tài khoản" */}
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Ghi nhớ tài khoản</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;