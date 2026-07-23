import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckCircleFilled,
  FileSearchOutlined,
  InboxOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import apiClient from '../../api/axiosConfig';

const { Dragger } = Upload;
const { Paragraph, Text, Title } = Typography;

const RestoreDataCard = () => {
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [validation, setValidation] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const backupDateText = useMemo(() => {
    if (!validation?.backupDate) return 'Không có thông tin';
    const date = new Date(validation.backupDate);
    return Number.isNaN(date.getTime()) ? validation.backupDate : date.toLocaleString('vi-VN');
  }, [validation]);

  const createFormData = () => {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  };

  const getErrorMessage = (error, fallback) => error.response?.data?.error || fallback;

  const handleValidate = async () => {
    if (!file) {
      message.warning('Vui lòng chọn tệp sao lưu JSON.');
      return;
    }

    setChecking(true);
    setValidation(null);
    try {
      const response = await apiClient.post('/admin/restore/validate', createFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValidation(response.data);
      message.success('Tệp sao lưu hợp lệ.');
    } catch (error) {
      message.error(getErrorMessage(error, 'Không thể kiểm tra tệp sao lưu.'));
    } finally {
      setChecking(false);
    }
  };

  const handleRestore = async () => {
    if (!file || !validation?.valid) return;

    setRestoring(true);
    try {
      const response = await apiClient.post('/admin/restore', createFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setConfirmOpen(false);
      setFile(null);
      setValidation(null);
      message.success(response.data?.message || 'Khôi phục dữ liệu thành công.');
    } catch (error) {
      message.error(getErrorMessage(error, 'Không thể khôi phục dữ liệu.'));
    } finally {
      setRestoring(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setValidation(null);
  };

  return (
    <Card className="management-action-card restore-card" bordered={false}>
      <div className="management-action-card__header">
        <div className="management-action-card__icon restore-icon">
          <ReloadOutlined />
        </div>
        <div>
          <Text className="management-action-card__eyebrow">PHỤC HỒI HỆ THỐNG</Text>
          <Space size={8} wrap>
            <Title level={3}>Khôi phục dữ liệu</Title>
            {validation?.valid && <Tag color="success" icon={<CheckCircleFilled />}>Tệp hợp lệ</Tag>}
          </Space>
        </div>
      </div>

      <Paragraph className="management-action-card__description">
        Chọn tệp JSON đã tạo từ chức năng sao lưu. Hệ thống sẽ kiểm tra cấu trúc và hiển thị thông tin trước khi cho phép khôi phục.
      </Paragraph>

      <Alert
        type="warning"
        showIcon
        message="Phiếu mượn hiện tại sẽ được thay thế"
        description="Tài khoản và tổ chuyên môn được thêm mới hoặc cập nhật theo ID; các tài khoản khác đang có vẫn được giữ nguyên."
        className="restore-warning"
      />

      <Dragger
        className="restore-uploader"
        accept=".json,application/json"
        maxCount={1}
        beforeUpload={(selectedFile) => {
          setFile(selectedFile);
          setValidation(null);
          return false;
        }}
        onRemove={resetFile}
        fileList={file ? [file] : []}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Nhấp hoặc kéo tệp sao lưu vào đây</p>
        <p className="ant-upload-hint">Chỉ nhận tệp JSON, dung lượng tối đa 10 MB</p>
      </Dragger>

      <Row gutter={[12, 12]} className="restore-actions">
        <Col xs={24} sm={validation?.valid ? 12 : 24}>
          <Button
            size="large"
            block
            icon={<FileSearchOutlined />}
            loading={checking}
            disabled={!file}
            onClick={handleValidate}
          >
            Kiểm tra tệp sao lưu
          </Button>
        </Col>
        {validation?.valid && (
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              danger
              size="large"
              block
              icon={<UploadOutlined />}
              onClick={() => setConfirmOpen(true)}
            >
              Khôi phục dữ liệu
            </Button>
          </Col>
        )}
      </Row>

      {validation?.valid && (
        <div className="restore-summary">
          <div className="restore-summary__title">
            <CheckCircleFilled /> Thông tin bản sao lưu
          </div>
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} colon={false}>
            <Descriptions.Item label="Ngày sao lưu" span={2}>{backupDateText}</Descriptions.Item>
            <Descriptions.Item label="Tổ chuyên môn"><Text strong>{validation.summary.departments}</Text></Descriptions.Item>
            <Descriptions.Item label="Tài khoản"><Text strong>{validation.summary.users}</Text></Descriptions.Item>
            <Descriptions.Item label="Phiếu mượn"><Text strong>{validation.summary.borrowingForms}</Text></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color="success">Sẵn sàng</Tag></Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Modal
        title="Xác nhận khôi phục dữ liệu"
        open={confirmOpen}
        okText="Khôi phục ngay"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: restoring }}
        cancelButtonProps={{ disabled: restoring }}
        closable={!restoring}
        maskClosable={!restoring}
        onOk={handleRestore}
        onCancel={() => setConfirmOpen(false)}
      >
        <Paragraph>
          Hệ thống sẽ thay thế toàn bộ phiếu mượn hiện tại bằng <Text strong>{validation?.summary?.borrowingForms || 0}</Text> phiếu trong bản sao lưu.
        </Paragraph>
        <Alert
          type="warning"
          showIcon
          message="Nên sao lưu dữ liệu hiện tại trước khi tiếp tục."
        />
      </Modal>
    </Card>
  );
};

export default RestoreDataCard;
