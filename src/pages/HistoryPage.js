import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, DatePicker, InputNumber, Select, Checkbox, Card, Typography, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import useAuth from '../hooks/useAuth'; // Import hook để lấy thông tin người dùng
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const HistoryPage = () => {
  const user = useAuth(); // Lấy thông tin người dùng hiện tại
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [form] = Form.useForm();

  // State mới cho bộ lọc của leader
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // Lấy danh sách giáo viên trong tổ nếu người dùng là leader
  useEffect(() => {
    if (user?.role === 'leader') {
      const fetchDepartmentUsers = async () => {
        try {
          const response = await apiClient.get('/filters/users-in-department');
          setDepartmentUsers(response.data);
        } catch (error) {
          message.error('Lỗi khi tải danh sách giáo viên trong tổ.');
        }
      };
      fetchDepartmentUsers();
    }
  }, [user]);

  const fetchForms = useCallback(async (searchTerm = '', teacherId = null) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/forms', {
        params: {
          search: searchTerm,
          teacherId: teacherId, // Gửi ID giáo viên cần lọc lên backend
        },
      });
      setForms(response.data);
    } catch (error) {
      message.error('Không thể tải lịch sử phiếu mượn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Tải dữ liệu lần đầu (lọc theo giáo viên nếu đã chọn)
    fetchForms('', selectedTeacherId);
  }, [fetchForms, selectedTeacherId]);

  const handleSearch = (value) => {
    fetchForms(value, selectedTeacherId);
  };

  const handleTeacherFilterChange = (teacherId) => {
    setSelectedTeacherId(teacherId);
    // Khi đổi bộ lọc, useEffect sẽ tự động tải lại dữ liệu
  };

  const handleDelete = async (id) => {
    try {
        await apiClient.delete(`/forms/${id}`);
        message.success('Xóa phiếu mượn thành công!');
        fetchForms('', selectedTeacherId);
    } catch (error) {
        message.error('Lỗi khi xóa phiếu mượn.');
    }
  };

  const handleEdit = (record) => {
    setEditingForm(record);
    form.setFieldsValue({
        ...record,
        borrow_date: dayjs(record.borrow_date),
        return_date: dayjs(record.return_date),
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
        const values = await form.validateFields();
        const formattedValues = {
            ...values,
            borrow_date: values.borrow_date.format('YYYY-MM-DD'),
            return_date: values.return_date.format('YYYY-MM-DD'),
            uses_it: values.uses_it || false,
            school_year: editingForm.school_year
        };
        await apiClient.put(`/forms/${editingForm.id}`, formattedValues);
        message.success('Cập nhật phiếu mượn thành công!');
        setIsModalVisible(false);
        setEditingForm(null);
        fetchForms('', selectedTeacherId);
    } catch (error) {
        message.error('Lỗi khi cập nhật phiếu mượn.');
    }
  };

  const columns = [
    (user?.role !== 'teacher' && { 
        title: 'Tên Giáo Viên', 
        dataIndex: 'full_name', 
        key: 'full_name',
    }),
    { title: 'Tuần', dataIndex: 'week', key: 'week' },
    { title: 'Ngày Mượn', dataIndex: 'borrow_date', key: 'borrow_date', render: (text) => dayjs(text).format('DD/MM/YYYY') },
    { title: 'Ngày Trả', dataIndex: 'return_date', key: 'return_date', render: (text) => dayjs(text).format('DD/MM/YYYY') },
    { title: 'Tên Thiết Bị', dataIndex: 'device_name', key: 'device_name' },
    { title: 'Tên Bài Dạy', dataIndex: 'lesson_name', key: 'lesson_name' },
    { title: 'Lớp', dataIndex: 'class_name', key: 'class_name' },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', // Giữ cột hành động cố định khi cuộn ngang
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa phiếu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <Card>
      <Title level={3}>Lịch sử mượn trả thiết bị</Title>
      {/* SỬA LỖI: Sử dụng Row và Col để làm responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Input.Search
            placeholder="Tìm theo tên thiết bị hoặc bài dạy..."
            onSearch={handleSearch}
            style={{ width: '100%' }}
            allowClear
            enterButton
          />
        </Col>
        {user?.role === 'leader' && (
          <Col xs={24} md={12} lg={8}>
            <Select
              placeholder="Lọc theo giáo viên"
              style={{ width: '100%' }}
              onChange={handleTeacherFilterChange}
              allowClear
            >
              {departmentUsers.map(u => (
                <Option key={u.id} value={u.id}>{u.full_name}</Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>

      <Table 
        columns={columns} 
        dataSource={forms} 
        loading={loading} 
        rowKey="id" 
        bordered 
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang trên màn hình nhỏ
      />

      <Modal
        title="Chỉnh sửa Phiếu Mượn"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        {/* Form chỉnh sửa cũng cần được làm responsive */}
        <Form form={form} layout="vertical">
           <Row gutter={16}>
                <Col xs={24} md={8}><Form.Item label="Tuần (1-35)" name="week" rules={[{ required: true }]}><InputNumber min={1} max={35} style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item label="Ngày mượn" name="borrow_date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item label="Ngày trả" name="return_date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
           </Row>
           {/* ... Các trường Form.Item khác cũng nên được đặt trong Row/Col tương tự ... */}
        </Form>
      </Modal>
    </Card>
  );
};

export default HistoryPage;
