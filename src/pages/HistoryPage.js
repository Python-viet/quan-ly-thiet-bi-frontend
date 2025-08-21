import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, DatePicker, InputNumber, Select, Checkbox, Card, Typography } from 'antd';
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
    // Khi đổi bộ lọc, không cần tìm kiếm lại ngay, useEffect sẽ xử lý
  };

  const handleDelete = async (id) => { /* ... code không đổi ... */ };
  const handleEdit = (record) => { /* ... code không đổi ... */ };
  const handleModalOk = async () => { /* ... code không đổi ... */ };

  // SỬA LỖI: Thêm cột "Tên Giáo Viên"
  const columns = [
    // Hiển thị cột này nếu là admin, manager hoặc leader
    (user?.role !== 'teacher' && { 
        title: 'Tên Giáo Viên', 
        dataIndex: 'full_name', 
        key: 'full_name',
        // Lọc theo tên giáo viên
        filters: departmentUsers.map(u => ({ text: u.full_name, value: u.id })),
        onFilter: (value, record) => record.user_id === value,
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
  ].filter(Boolean); // Lọc ra các giá trị false (cột Tên Giáo Viên khi là teacher)

  return (
    <Card>
      <Title level={3}>Lịch sử mượn trả thiết bị</Title>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên thiết bị hoặc bài dạy..."
          onSearch={handleSearch}
          style={{ width: 300 }}
          allowClear
          enterButton
        />
        {/* SỬA LỖI: Hiển thị bộ lọc cho leader */}
        {user?.role === 'leader' && (
          <Select
            placeholder="Lọc theo giáo viên"
            style={{ width: 200 }}
            onChange={handleTeacherFilterChange}
            allowClear
          >
            {departmentUsers.map(u => (
              <Option key={u.id} value={u.id}>{u.full_name}</Option>
            ))}
          </Select>
        )}
      </Space>

      <Table columns={columns} dataSource={forms} loading={loading} rowKey="id" bordered />

      <Modal
        title="Chỉnh sửa Phiếu Mượn"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        {/* ... Form chỉnh sửa không đổi ... */}
      </Modal>
    </Card>
  );
};

export default HistoryPage;
