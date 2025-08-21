import React from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Checkbox,
  message,
  Card,
  Typography,
  Row,
  Col
} from 'antd';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const BorrowingFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const formattedValues = {
      ...values,
      borrow_date: values.borrow_date.format('YYYY-MM-DD'),
      return_date: values.return_date.format('YYYY-MM-DD'),
      uses_it: values.uses_it || false,
      school_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    };

    try {
      await apiClient.post('/forms', formattedValues);
      message.success('Tạo phiếu mượn thành công!');
      form.resetFields();
      navigate('/app/history');
    } catch (error) {
      message.error(error.response?.data?.error || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    <Card>
      <Title level={3}>Tạo Phiếu Mượn Thiết Bị Mới</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          borrow_date: dayjs() 
        }}
      >
        <Row gutter={16}>
          {/* SỬA LỖI: Thêm thuộc tính responsive (xs, md) */}
          <Col xs={24} md={8}>
            <Form.Item label="Tuần (1-35)" name="week" rules={[{ required: true }]}>
              <InputNumber min={1} max={35} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Ngày mượn" name="borrow_date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Ngày trả" name="return_date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item label="Thiết bị mượn sử dụng" name="device_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Tên bài dạy" name="lesson_name" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Dạy tiết" name="teaching_period">
              <Input placeholder="Ví dụ: 1, 2, 4" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Dạy lớp" name="class_name">
              <Input placeholder="Ví dụ: 6A3, 9A2" />
            </Form.Item>
          </Col>
           <Col xs={24} md={8}>
            <Form.Item label="Số lượt sử dụng" name="usage_count" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item label="Tình trạng thiết bị khi mượn/trả" name="device_status" rules={[{ required: true }]}>
              <Select>
                <Option value="Bình thường">Bình thường</Option>
                <Option value="Tự trang bị">Tự trang bị</Option>
                <Option value="Hao hụt hóa chất">Hao hụt hóa chất</Option>
                <Option value="Hỏng">Hỏng</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Item name="uses_it" valuePropName="checked">
              <Checkbox>Có ứng dụng CNTT</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Lưu phiếu mượn
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BorrowingFormPage;
