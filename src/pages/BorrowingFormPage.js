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
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import dayjs from 'dayjs';
import './BorrowingFormPage.css';

const { Title, Text } = Typography;
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
    <div className="borrowing-form-page">
      <Card className="borrowing-form-card" bordered={false}>
        <div className="borrowing-form-heading">
          <Title level={3}>Nhập phiếu mượn thiết bị</Title>
          <Text type="secondary">Điền đầy đủ thông tin mượn và sử dụng thiết bị dạy học.</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
          initialValues={{ borrow_date: dayjs() }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Tuần (1–35)" name="week" rules={[{ required: true, message: 'Vui lòng nhập tuần.' }]}>
                <InputNumber min={1} max={35} inputMode="numeric" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Ngày mượn" name="borrow_date" rules={[{ required: true, message: 'Vui lòng chọn ngày mượn.' }]}>
                <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày mượn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Ngày trả" name="return_date" rules={[{ required: true, message: 'Vui lòng chọn ngày trả.' }]}>
                <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày trả" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <Form.Item label="Thiết bị mượn sử dụng" name="device_name" rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị.' }]}>
                <Input placeholder="Ví dụ: Bộ thí nghiệm quang học" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng.' }]}>
                <InputNumber min={1} inputMode="numeric" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tên bài dạy" name="lesson_name" rules={[{ required: true, message: 'Vui lòng nhập tên bài dạy.' }]}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="Nhập tên bài dạy" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Dạy tiết" name="teaching_period" rules={[{ required: true, message: 'Vui lòng nhập tiết dạy!' }]}>
                <Input placeholder="Ví dụ: 1, 2, 4" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Dạy lớp" name="class_name" rules={[{ required: true, message: 'Vui lòng nhập lớp dạy!' }]}>
                <Input placeholder="Ví dụ: 6A3, 9A2" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Số lượt sử dụng" name="usage_count" rules={[{ required: true, message: 'Vui lòng nhập số lượt.' }]}>
                <InputNumber min={1} inputMode="numeric" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]} align="bottom">
            <Col xs={24} lg={16}>
              <Form.Item label="Tình trạng thiết bị khi mượn/trả" name="device_status" rules={[{ required: true, message: 'Vui lòng chọn tình trạng.' }]}>
                <Select placeholder="Chọn tình trạng thiết bị">
                  <Option value="Bình thường">Bình thường</Option>
                  <Option value="Tự trang bị">Tự trang bị</Option>
                  <Option value="Hao hụt hóa chất">Hao hụt hóa chất</Option>
                  <Option value="Hỏng">Hỏng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name="uses_it" valuePropName="checked" className="uses-it-field">
                <Checkbox>Có ứng dụng công nghệ thông tin</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <div className="borrowing-form-actions">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
              Lưu phiếu mượn
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default BorrowingFormPage;
