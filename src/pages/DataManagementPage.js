import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  RedoOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import RestoreDataCard from '../components/data-management/RestoreDataCard';
import './DataManagementPage.css';

const { Title, Paragraph, Text } = Typography;

const DataManagementPage = () => {
  const [backingUp, setBackingUp] = useState(false);
  const [creatingNewYear, setCreatingNewYear] = useState(false);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await apiClient.post('/admin/backup', {}, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      message.success('Sao lưu dữ liệu thành công!');
    } catch (error) {
      message.error(error.response?.data?.error || 'Lỗi khi sao lưu dữ liệu.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleNewYear = async () => {
    setCreatingNewYear(true);
    try {
      await apiClient.post('/admin/new-year');
      message.success('Đã khởi tạo năm học mới và xóa toàn bộ phiếu mượn cũ.');
    } catch (error) {
      message.error(error.response?.data?.error || 'Lỗi khi khởi tạo năm học mới.');
    } finally {
      setCreatingNewYear(false);
    }
  };

  return (
    <div className="data-management-page">
      <section className="data-management-hero">
        <div className="data-management-hero__icon">
          <DatabaseOutlined />
        </div>
        <div className="data-management-hero__content">
          <Space size={8} wrap>
            <Title level={2}>Quản lý dữ liệu</Title>
            <Tag color="blue">Dành cho quản trị viên</Tag>
          </Space>
          <Paragraph>
            Sao lưu, khôi phục và chuẩn bị dữ liệu cho năm học mới tại một nơi. Nên tạo bản sao lưu trước mọi thao tác làm thay đổi dữ liệu.
          </Paragraph>
        </div>
      </section>

      <Alert
        className="data-management-guidance"
        type="info"
        showIcon
        message="Quy trình được khuyến nghị"
        description="Sao lưu dữ liệu hiện tại → lưu tệp JSON ở nơi an toàn → chỉ khôi phục hoặc khởi tạo năm học mới khi thật sự cần thiết."
      />

      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} xl={10}>
          <Card className="management-action-card backup-card" bordered={false}>
            <div className="management-action-card__header">
              <div className="management-action-card__icon backup-icon">
                <CloudDownloadOutlined />
              </div>
              <div>
                <Text className="management-action-card__eyebrow">BẢO VỆ DỮ LIỆU</Text>
                <Title level={3}>Sao lưu dữ liệu</Title>
              </div>
            </div>

            <Paragraph className="management-action-card__description">
              Tải xuống một tệp JSON chứa tài khoản, tổ chuyên môn và toàn bộ phiếu mượn hiện có. Tệp này dùng để khôi phục khi cần.
            </Paragraph>

            <div className="management-feature-list">
              <div><SafetyCertificateOutlined /> Không làm thay đổi dữ liệu hiện tại</div>
              <div><SafetyCertificateOutlined /> Có thể lưu trên máy tính hoặc đám mây</div>
              <div><SafetyCertificateOutlined /> Nên thực hiện định kỳ và trước khi xóa dữ liệu</div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              icon={<CloudDownloadOutlined />}
              loading={backingUp}
              onClick={handleBackup}
            >
              Tải bản sao lưu
            </Button>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <RestoreDataCard />
        </Col>
      </Row>

      <Card className="danger-zone-card" bordered={false}>
        <div className="danger-zone-card__content">
          <div className="danger-zone-card__icon">
            <RedoOutlined />
          </div>
          <div className="danger-zone-card__text">
            <Space size={8} wrap>
              <Title level={3}>Khởi tạo năm học mới</Title>
              <Tag color="red">Thao tác không thể hoàn tác trực tiếp</Tag>
            </Space>
            <Paragraph>
              Xóa vĩnh viễn toàn bộ phiếu mượn đang sử dụng và đã lưu trữ để bắt đầu năm học mới. Tài khoản giáo viên và tổ chuyên môn vẫn được giữ nguyên.
            </Paragraph>
            <Text type="secondary">
              Dữ liệu đã xóa chỉ có thể lấy lại từ tệp sao lưu đã tải xuống trước đó.
            </Text>
          </div>
          <div className="danger-zone-card__action">
            <Popconfirm
              title="Khởi tạo năm học mới?"
              description="Toàn bộ phiếu mượn hiện hành và đã lưu trữ sẽ bị xóa vĩnh viễn."
              onConfirm={handleNewYear}
              okText="Đồng ý xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: creatingNewYear }}
              disabled={creatingNewYear}
            >
              <Button
                danger
                type="primary"
                size="large"
                icon={<RedoOutlined />}
                loading={creatingNewYear}
              >
                Khởi tạo năm học mới
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataManagementPage;
