// File: src/pages/DataManagementPage.js (File mới)

import React from 'react';
import { Card, Button, Space, Typography, Popconfirm, message, Divider } from 'antd';
import { DownloadOutlined, RedoOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';

const { Title, Paragraph, Text } = Typography;

const DataManagementPage = () => {

    const handleBackup = async () => {
        try {
            const response = await apiClient.post('/admin/backup', {}, {
                responseType: 'blob', // Yêu cầu server trả về file
            });
            const blob = new Blob([response.data], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            window.URL.revokeObjectURL(link.href);
            message.success('Sao lưu dữ liệu thành công!');
        } catch (error) {
            message.error('Lỗi khi sao lưu dữ liệu.');
        }
    };

    const handleNewYear = async () => {
        try {
            await apiClient.post('/admin/new-year');
            message.success('Khởi tạo năm học mới thành công!');
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi khởi tạo năm học mới.');
        }
    };

    return (
        <Card>
            <Title level={3}>Quản lý Dữ liệu Hệ thống</Title>
            
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Title level={4}>Sao lưu Dữ liệu</Title>
                    <Paragraph>
                        Hành động này sẽ tải về một file JSON chứa toàn bộ dữ liệu người dùng, tổ chuyên môn và các phiếu mượn hiện có.
                        <br />
                        <Text strong>Lưu ý:</Text> Đây là bản sao lưu logic, nên được thực hiện định kỳ (ví dụ: cuối mỗi học kỳ).
                    </Paragraph>
                    <Button icon={<DownloadOutlined />} onClick={handleBackup}>
                        Thực hiện Sao lưu
                    </Button>
                </div>

                <Divider />

                <div>
                    <Title level={4}>Khởi tạo Năm học mới</Title>
                    <Paragraph>
                        <Text strong type="danger">CẢNH BÁO:</Text> Hành động này không thể hoàn tác.
                        <br />
                        Nó sẽ di chuyển toàn bộ phiếu mượn của năm học hiện tại vào khu vực lưu trữ và xóa sạch dữ liệu phiếu mượn trên hệ thống để chuẩn bị cho năm học mới.
                        <br />
                        Bạn nên <Text strong>thực hiện Sao lưu</Text> trước khi tiến hành.
                    </Paragraph>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn khởi tạo năm học mới?"
                        description="Toàn bộ phiếu mượn sẽ được lưu trữ và làm trống."
                        onConfirm={handleNewYear}
                        okText="Có, tôi chắc chắn"
                        cancelText="Không"
                    >
                        <Button icon={<RedoOutlined />} danger>
                            Khởi tạo Năm học mới
                        </Button>
                    </Popconfirm>
                </div>
            </Space>
        </Card>
    );
};

export default DataManagementPage;