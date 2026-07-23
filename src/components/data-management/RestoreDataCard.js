import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Modal, Space, Typography, Upload, message } from 'antd';
import { InboxOutlined, SafetyCertificateOutlined, UploadOutlined } from '@ant-design/icons';
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

  return (
    <Card bordered={false} style={{ background: '#fafafa' }}>
      <Title level={4}>Khôi phục dữ liệu</Title>
      <Paragraph>
        Chọn tệp JSON đã tạo từ chức năng sao lưu. Hệ thống sẽ kiểm tra tệp trước khi cho phép khôi phục.
      </Paragraph>

      <Alert
        type="warning"
        showIcon
        message="Dữ liệu phiếu mượn hiện tại sẽ được thay thế"
        description="Tổ chuyên môn và tài khoản trong tệp sẽ được tạo mới hoặc cập nhật theo ID; các tổ và tài khoản khác đang có sẽ được giữ nguyên. Mọi thay đổi được thực hiện trong một giao dịch và tự hoàn tác nếu xảy ra lỗi."
        style={{ marginBottom: 16 }}
      />

      <Dragger
        accept=".json,application/json"
        maxCount={1}
        beforeUpload={(selectedFile) => {
          setFile(selectedFile);
          setValidation(null);
          return false;
        }}
        onRemove={() => {
          setFile(null);
          setValidation(null);
        }}
        fileList={file ? [file] : []}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Nhấp hoặc kéo tệp sao lưu JSON vào đây</p>
        <p className="ant-upload-hint">Dung lượng tối đa 10 MB</p>
      </Dragger>

      <Space wrap style={{ marginTop: 16 }}>
        <Button icon={<SafetyCertificateOutlined />} loading={checking} disabled={!file} onClick={handleValidate}>
          Kiểm tra tệp
        </Button>
        <Button
          type="primary"
          danger
          icon={<UploadOutlined />}
          disabled={!validation?.valid}
          onClick={() => setConfirmOpen(true)}
        >
          Khôi phục dữ liệu
        </Button>
      </Space>

      {validation?.valid && (
        <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
          <Descriptions.Item label="Ngày sao lưu">{backupDateText}</Descriptions.Item>
          <Descriptions.Item label="Tổ chuyên môn">{validation.summary.departments}</Descriptions.Item>
          <Descriptions.Item label="Tài khoản">{validation.summary.users}</Descriptions.Item>
          <Descriptions.Item label="Phiếu mượn">{validation.summary.borrowingForms}</Descriptions.Item>
        </Descriptions>
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
          Thao tác này sẽ thay thế toàn bộ phiếu mượn hiện tại bằng <Text strong>{validation?.summary?.borrowingForms || 0}</Text> phiếu trong bản sao lưu.
        </Paragraph>
        <Text strong type="danger">Bạn nên tải một bản sao lưu mới của dữ liệu hiện tại trước khi tiếp tục.</Text>
      </Modal>
    </Card>
  );
};

export default RestoreDataCard;
