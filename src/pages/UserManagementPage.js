import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Select, Upload, Typography, List, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';

const { Option } = Select;
const { Text, Paragraph } = Typography;

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
    const [bulkErrors, setBulkErrors] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [addForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    
    const [departments, setDepartments] = useState([]);
    const roles = [{id: 1, name: 'admin'}, {id: 2, name: 'manager'}, {id: 3, name: 'leader'}, {id: 4, name: 'teacher'}];
    const selectedRole = Form.useWatch('role_id', addForm);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersResponse, departmentsResponse] = await Promise.all([
                apiClient.get('/admin/users'),
                apiClient.get('/admin/departments')
            ]);
            setUsers(usersResponse.data);
            setDepartments(departmentsResponse.data);
        } catch (error) {
            message.error('Không thể tải dữ liệu trang quản lý.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddUser = async (values) => {
        try {
            await apiClient.post('/admin/users', values);
            message.success('Tạo người dùng thành công!');
            setIsAddModalVisible(false);
            addForm.resetFields();
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi tạo người dùng.');
        }
    };

    const handleResetPassword = async (values) => {
        try {
            await apiClient.put(`/admin/users/${selectedUser.id}/reset-password`, { newPassword: values.password });
            message.success('Reset mật khẩu thành công!');
            setIsResetModalVisible(false);
            resetForm.resetFields();
            setSelectedUser(null);
        } catch (error) {
            message.error('Lỗi khi reset mật khẩu.');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            message.success('Xóa người dùng thành công!');
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi xóa người dùng.');
        }
    };

    const columns = [
        { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
        { title: 'Họ và Tên', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Vai trò', dataIndex: 'role', key: 'role' },
        { title: 'Tổ chuyên môn', dataIndex: 'department', key: 'department' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => { setSelectedUser(record); setIsResetModalVisible(true); }}>Reset Mật khẩu</Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa tài khoản này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const uploadProps = {
        name: 'file',
        action: 'http://localhost:3001/api/admin/users/bulk-upload',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        accept: ".xlsx, .xls",
        showUploadList: false,
        onChange(info) {
            if (info.file.status === 'uploading') {
                setLoading(true);
            }
            if (info.file.status === 'done') {
                setLoading(false);
                const response = info.file.response;
                message.success(response.message);
                if (response.errors && response.errors.length > 0) {
                    setBulkErrors(response.errors);
                } else {
                    setIsBulkModalVisible(false);
                }
                fetchData();
            } else if (info.file.status === 'error') {
                setLoading(false);
                message.error(info.file.response?.message || `${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                    Thêm người dùng mới
                </Button>
                <Button icon={<UploadOutlined />} onClick={() => { setBulkErrors([]); setIsBulkModalVisible(true); }}>
                    Thêm hàng loạt từ Excel
                </Button>
            </Space>
            
            <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />

            <Modal title="Thêm người dùng mới" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null}>
                <Form form={addForm} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}><Input.Password /></Form.Item>
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Vai trò" name="role_id" rules={[{ required: true }]}>
                        <Select>{roles.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}</Select>
                    </Form.Item>
                    {(selectedRole === 3 || selectedRole === 4) && (
                        <Form.Item label="Tổ chuyên môn" name="department_id" rules={[{ required: true, message: 'Vui lòng chọn tổ chuyên môn!' }]}>
                            <Select placeholder="Chọn một tổ">{departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}</Select>
                        </Form.Item>
                    )}
                    <Button type="primary" htmlType="submit">Tạo</Button>
                </Form>
            </Modal>

            <Modal 
                title="Thêm người dùng hàng loạt" 
                open={isBulkModalVisible} 
                onCancel={() => setIsBulkModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsBulkModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
            >
                <Paragraph>
                    Vui lòng tải lên file Excel (.xlsx) theo đúng định dạng.
                    Các cột phải theo thứ tự: <Text strong>A: username, B: password, C: full_name, D: role, E: department</Text>.
                    <br/>
                    <Text type="secondary">(Tên vai trò và tổ chuyên môn phải viết chính xác như trong hệ thống, không phân biệt hoa thường).</Text>
                </Paragraph>
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={loading}>Chọn file để tải lên</Button>
                </Upload>
                {bulkErrors.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong type="danger">Chi tiết lỗi:</Text>
                        <List
                            size="small"
                            bordered
                            dataSource={bulkErrors}
                            renderItem={(item) => <List.Item>{item}</List.Item>}
                            style={{ maxHeight: 200, overflowY: 'auto' }}
                        />
                    </div>
                )}
            </Modal>

            <Modal title={`Reset mật khẩu cho ${selectedUser?.username}`} open={isResetModalVisible} onCancel={() => setIsResetModalVisible(false)} footer={null}>
                <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item label="Mật khẩu mới" name="password" rules={[{ required: true }]}><Input.Password /></Form.Item>
                    <Button type="primary" htmlType="submit">Xác nhận</Button>
                </Form>
            </Modal>
        </>
    );
};

export default UserManagementPage;