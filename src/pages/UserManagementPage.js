import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    message,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    Typography,
    List,
    Popconfirm,
    Tag,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    SafetyCertificateOutlined,
    KeyOutlined
} from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import './UserManagementPage.css';

const { Option } = Select;
const { Text, Paragraph, Title } = Typography;

const ROLE_OPTIONS = [
    { id: 1, name: 'admin', label: 'Quản trị viên' },
    { id: 2, name: 'manager', label: 'Cán bộ quản lý' },
    { id: 3, name: 'leader', label: 'Tổ trưởng' },
    { id: 4, name: 'teacher', label: 'Giáo viên' }
];

const CHANGEABLE_ROLES = ROLE_OPTIONS.filter((role) => role.name !== 'admin');

const roleMeta = {
    admin: { label: 'Quản trị viên', color: 'red' },
    manager: { label: 'Cán bộ quản lý', color: 'purple' },
    leader: { label: 'Tổ trưởng', color: 'blue' },
    teacher: { label: 'Giáo viên', color: 'green' }
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleUpdating, setRoleUpdating] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
    const [bulkErrors, setBulkErrors] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [addForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [roleForm] = Form.useForm();
    const [departments, setDepartments] = useState([]);

    const selectedAddRole = Form.useWatch('role_id', addForm);
    const selectedChangeRole = Form.useWatch('role', roleForm);

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
            const payload = {
                ...values,
                department_id: values.role_id === 2 ? null : values.department_id
            };
            await apiClient.post('/admin/users', payload);
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
            await apiClient.put(`/admin/users/${selectedUser.id}/reset-password`, {
                newPassword: values.password
            });
            message.success('Reset mật khẩu thành công!');
            setIsResetModalVisible(false);
            resetForm.resetFields();
            setSelectedUser(null);
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi reset mật khẩu.');
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        roleForm.setFieldsValue({
            role: user.role,
            department_id: user.department_id || undefined
        });
        setIsRoleModalVisible(true);
    };

    const handleChangeRole = async (values) => {
        if (!selectedUser) return;

        setRoleUpdating(true);
        try {
            await apiClient.put(`/admin/users/${selectedUser.id}/role`, {
                role: values.role,
                department_id: values.role === 'manager' ? null : values.department_id
            });
            message.success('Thay đổi vai trò thành công!');
            setIsRoleModalVisible(false);
            roleForm.resetFields();
            setSelectedUser(null);
            await fetchData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Không thể thay đổi vai trò.');
        } finally {
            setRoleUpdating(false);
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
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            width: 150,
            fixed: 'left'
        },
        {
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
            width: 210
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role) => {
                const meta = roleMeta[role] || { label: role, color: 'default' };
                return <Tag color={meta.color}>{meta.label}</Tag>;
            }
        },
        {
            title: 'Tổ chuyên môn',
            dataIndex: 'department',
            key: 'department',
            width: 190,
            render: (department) => department || <Text type="secondary">Không áp dụng</Text>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 360,
            render: (_, record) => {
                const isAdminAccount = record.role === 'admin';
                return (
                    <Space wrap size={[8, 8]}>
                        <Tooltip title={isAdminAccount ? 'Không được thay đổi vai trò của tài khoản Admin' : ''}>
                            <Button
                                icon={<SafetyCertificateOutlined />}
                                onClick={() => openRoleModal(record)}
                                disabled={isAdminAccount}
                            >
                                Thay đổi vai trò
                            </Button>
                        </Tooltip>
                        <Button
                            icon={<KeyOutlined />}
                            onClick={() => {
                                setSelectedUser(record);
                                setIsResetModalVisible(true);
                            }}
                        >
                            Reset mật khẩu
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc muốn xóa tài khoản này?"
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Có"
                            cancelText="Không"
                            disabled={isAdminAccount}
                        >
                            <Button icon={<DeleteOutlined />} danger disabled={isAdminAccount}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    const uploadUrl = `${apiClient.defaults.baseURL}/admin/users/bulk-upload`;
    const uploadProps = {
        name: 'file',
        action: uploadUrl,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        accept: '.xlsx, .xls',
        showUploadList: false,
        onChange(info) {
            if (info.file.status === 'uploading') setLoading(true);
            if (info.file.status === 'done') {
                setLoading(false);
                const response = info.file.response;
                message.success(response.message);
                if (response.errors?.length) setBulkErrors(response.errors);
                else setIsBulkModalVisible(false);
                fetchData();
            } else if (info.file.status === 'error') {
                setLoading(false);
                message.error(info.file.response?.message || 'Tải tệp thất bại.');
            }
        }
    };

    return (
        <div className="user-management-page">
            <div className="user-management-header">
                <div>
                    <Title level={3}>Quản lý tài khoản</Title>
                    <Text type="secondary">Tạo tài khoản, phân quyền và quản lý người dùng trong hệ thống.</Text>
                </div>
                <Space wrap>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                        Thêm người dùng
                    </Button>
                    <Button icon={<UploadOutlined />} onClick={() => {
                        setBulkErrors([]);
                        setIsBulkModalVisible(true);
                    }}>
                        Nhập từ Excel
                    </Button>
                </Space>
            </div>

            <Table
                className="user-management-table"
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1060 }}
                pagination={{ pageSize: 10, showSizeChanger: false }}
            />

            <Modal
                title="Thêm người dùng mới"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    addForm.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Họ và tên" name="full_name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Vai trò" name="role_id" rules={[{ required: true }]}>
                        <Select placeholder="Chọn vai trò">
                            {ROLE_OPTIONS.map((role) => (
                                <Option key={role.id} value={role.id}>{role.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {(selectedAddRole === 3 || selectedAddRole === 4) && (
                        <Form.Item
                            label="Tổ chuyên môn"
                            name="department_id"
                            rules={[{ required: true, message: 'Vui lòng chọn tổ chuyên môn!' }]}
                        >
                            <Select placeholder="Chọn một tổ">
                                {departments.map((department) => (
                                    <Option key={department.id} value={department.id}>{department.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
                </Form>
            </Modal>

            <Modal
                title="Thay đổi vai trò"
                open={isRoleModalVisible}
                onCancel={() => {
                    setIsRoleModalVisible(false);
                    roleForm.resetFields();
                    setSelectedUser(null);
                }}
                footer={null}
                destroyOnClose
            >
                <div className="role-user-summary">
                    <Text type="secondary">Tài khoản</Text>
                    <Text strong>{selectedUser?.full_name} ({selectedUser?.username})</Text>
                </div>
                <Form form={roleForm} layout="vertical" onFinish={handleChangeRole}>
                    <Form.Item label="Vai trò mới" name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò.' }]}>
                        <Select placeholder="Chọn vai trò mới">
                            {CHANGEABLE_ROLES.map((role) => (
                                <Option key={role.name} value={role.name}>{role.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {(selectedChangeRole === 'leader' || selectedChangeRole === 'teacher') && (
                        <Form.Item
                            label="Tổ chuyên môn"
                            name="department_id"
                            rules={[{ required: true, message: 'Vui lòng chọn tổ chuyên môn.' }]}
                        >
                            <Select placeholder="Chọn tổ chuyên môn">
                                {departments.map((department) => (
                                    <Option key={department.id} value={department.id}>{department.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Paragraph type="secondary" className="role-change-note">
                        Không thể gán vai trò Admin. Người dùng cần đăng nhập lại để quyền mới có hiệu lực trên phiên của họ.
                    </Paragraph>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={roleUpdating}>
                            Lưu thay đổi
                        </Button>
                        <Button onClick={() => setIsRoleModalVisible(false)}>Hủy</Button>
                    </Space>
                </Form>
            </Modal>

            <Modal
                title="Thêm người dùng hàng loạt"
                open={isBulkModalVisible}
                onCancel={() => setIsBulkModalVisible(false)}
                footer={<Button onClick={() => setIsBulkModalVisible(false)}>Đóng</Button>}
            >
                <Paragraph>
                    Tải lên tệp Excel (.xlsx) theo thứ tự cột: <Text strong>A: username, B: password, C: full_name, D: role, E: department</Text>.
                    <br />
                    <Text type="secondary">Tên vai trò và tổ chuyên môn phải đúng với dữ liệu trong hệ thống.</Text>
                </Paragraph>
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={loading}>Chọn tệp Excel</Button>
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

            <Modal
                title={`Reset mật khẩu cho ${selectedUser?.username || ''}`}
                open={isResetModalVisible}
                onCancel={() => {
                    setIsResetModalVisible(false);
                    resetForm.resetFields();
                    setSelectedUser(null);
                }}
                footer={null}
                destroyOnClose
            >
                <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item label="Mật khẩu mới" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Xác nhận</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
