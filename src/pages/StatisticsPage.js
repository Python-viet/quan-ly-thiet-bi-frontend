import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Button, message, Statistic, Typography, Space } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

const StatisticsPage = () => {
  const user = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState(user?.role === 'leader' ? user.departmentId : null);
  const [userId, setUserId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]); // Chỉ lưu danh sách user đã được lọc
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchDataForFilters = useCallback(async () => {
    // Admin và manager lấy danh sách tổ
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const deptsRes = await apiClient.get('/admin/departments');
        setDepartments(deptsRes.data);
      } catch (error) {
        message.error('Lỗi khi tải danh sách tổ chuyên môn.');
      }
    } 
    // Leader lấy danh sách giáo viên trong tổ
    else if (user?.role === 'leader') {
      try {
        setLoadingUsers(true);
        const response = await apiClient.get('/filters/users-in-department');
        setUsers(response.data);
      } catch (error) {
        message.error('Lỗi khi tải danh sách giáo viên trong tổ.');
      } finally {
        setLoadingUsers(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchDataForFilters();
  }, [fetchDataForFilters]);

  // SỬA LỖI: Hàm xử lý khi thay đổi tổ chuyên môn
  const handleDepartmentChange = async (selectedDeptId) => {
    setDepartmentId(selectedDeptId);
    setUserId(null); // Reset lựa chọn giáo viên khi đổi tổ

    if (!selectedDeptId) {
      setUsers([]); // Nếu không chọn tổ nào, danh sách giáo viên trống
      return;
    }

    try {
        setLoadingUsers(true);
        // Gọi API để lấy danh sách user theo tổ đã chọn
        const response = await apiClient.get(`/filters/users-by-department/${selectedDeptId}`);
        setUsers(response.data);
    } catch (error) {
        message.error('Lỗi khi tải danh sách giáo viên.');
    } finally {
        setLoadingUsers(false);
    }
  };

  const handleFetchStatistics = async () => {
    setLoading(true);
    try {
      const params = { year, month, departmentId, userId };
      const response = await apiClient.get('/stats', { params });
      setStats(response.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = (type) => {
    if (!departmentId) {
        message.warning('Vui lòng chọn một tổ chuyên môn để xuất báo cáo.');
        return;
    }
    const fetchFile = async () => {
        try {
            const response = await apiClient.get(`/export/${type}`, {
                params: { year, departmentId, userId: userId || '' },
                responseType: 'blob',
            });
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `BaoCao_${type}_${month}-${year}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch(e) {
            message.error("Xuất file thất bại!");
        }
    }
    fetchFile();
  };

  return (
    <Card>
      <Title level={3}>Thống kê và Báo cáo</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="bottom">
        <Col><Select value={year} onChange={setYear} style={{ width: 120 }}>{[...Array(5)].map((_, i) => <Option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</Option>)}</Select></Col>
        <Col><Select value={month} onChange={setMonth} style={{ width: 120 }}>{[...Array(12)].map((_, i) => <Option key={i+1} value={i+1}>Tháng {i+1}</Option>)}</Select></Col>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <Col>
              <Select placeholder="Chọn tổ chuyên môn" onChange={handleDepartmentChange} style={{ width: 200 }} allowClear>
                {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
              </Select>
            </Col>
            <Col>
              <Select placeholder="Chọn giáo viên" value={userId} onChange={setUserId} style={{ width: 200 }} allowClear loading={loadingUsers}>
                {users.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
          </>
        )}

        {user?.role === 'leader' && (
            <Col>
              <Select placeholder="Chọn giáo viên trong tổ" onChange={setUserId} style={{ width: 200 }} allowClear loading={loadingUsers}>
                {users.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
        )}

        <Col><Button type="primary" onClick={handleFetchStatistics} loading={loading}>Xem thống kê</Button></Col>
      </Row>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}><Statistic title="Tổng số phiếu mượn" value={stats.total_forms} /></Col>
          <Col span={8}><Statistic title="Tổng lượt sử dụng" value={stats.total_usage} /></Col>
          <Col span={8}><Statistic title="Tổng lượt ứng dụng CNTT" value={stats.total_it_usage} /></Col>
        </Row>
      )}

      <Title level={4}>Xuất báo cáo</Title>
      <Space>
        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
          Xuất file Excel
        </Button>
        <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
          Xuất file PDF
        </Button>
      </Space>
    </Card>
  );
};

export default StatisticsPage;
