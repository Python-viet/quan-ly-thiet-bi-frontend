import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';

const { Title } = Typography;

const DepartmentManagementPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [form] = Form.useForm();

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/departments');
            setDepartments(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách tổ chuyên môn.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleShowModal = (department = null) => {
        setEditingDepartment(department);
        form.setFieldsValue({ name: department ? department.name : '' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingDepartment(null);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingDepartment) {
                // Chế độ Sửa
                await apiClient.put(`/admin/departments/${editingDepartment.id}`, values);
                message.success('Cập nhật tổ chuyên môn thành công!');
            } else {
                // SỬA LỖI: Kích hoạt Chế độ Thêm mới
                await apiClient.post('/admin/departments', values);
                message.success('Thêm tổ chuyên môn thành công!');
            }
            handleCancel();
            fetchDepartments(); // Tải lại dữ liệu
        } catch (error) {
            message.error(error.response?.data?.error || 'Đã có lỗi xảy ra.');
        }
    };
    
    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/admin/departments/${id}`);
            message.success('Xóa tổ chuyên môn thành công!');
            fetchDepartments();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi xóa tổ chuyên môn.');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '10%' },
        { title: 'Tên Tổ chuyên môn', dataIndex: 'name', key: 'name' },
        {
            title: 'Hành động',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa tổ này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Quản lý Tổ chuyên môn</Title>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleShowModal()}
                style={{ marginBottom: 16 }}
            >
                Thêm Tổ chuyên môn
            </Button>
            <Table
                columns={columns}
                dataSource={departments}
                loading={loading}
                rowKey="id"
                bordered
            />
            <Modal
                title={editingDepartment ? 'Chỉnh sửa Tổ chuyên môn' : 'Thêm Tổ chuyên môn mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên Tổ chuyên môn"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tổ!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DepartmentManagementPage;