import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Button, message, Statistic, Typography, Space } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

// --- HELPER FUNCTIONS CHO NĂM HỌC ---

// Lấy ra năm học hiện tại (ví dụ: 2025-2026)
const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() trả về 0-11
    const currentYear = today.getFullYear();
    // Năm học bắt đầu từ tháng 8 hoặc 9
    return currentMonth >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
};

// Tạo danh sách các năm học để lựa chọn
const generateSchoolYears = () => {
    const years = [];
    const currentYearEnd = parseInt(getCurrentSchoolYear().split('-')[1]);
    for (let i = 0; i < 5; i++) {
        const end = currentYearEnd - i;
        const start = end - 1;
        years.push(`${start}-${end}`);
    }
    return years;
};

// Danh sách các tháng trong năm học
const schoolMonths = [
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' },
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }
];


const StatisticsPage = () => {
  const user = useAuth();
  // State mới cho năm học
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [month, setMonth] = useState(9); // Mặc định là tháng 9
  
  const [departmentId, setDepartmentId] = useState(user?.role === 'leader' ? user.departmentId : null);
  const [userId, setUserId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchDataForFilters = useCallback(async () => { /* ... code không đổi ... */ }, [user]);
  useEffect(() => { fetchDataForFilters(); }, [fetchDataForFilters]);

  const handleDepartmentChange = async (selectedDeptId) => { /* ... code không đổi ... */ };

  // Hàm xử lý logic chung cho thống kê và xuất file
  const handleAction = async (actionType) => {
    // Xác định năm (YYYY) để gửi lên backend
    const [startYear, endYear] = schoolYear.split('-').map(Number);
    const yearToSend = month >= 9 ? startYear : endYear;

    if (actionType === 'fetch') {
        setLoading(true);
        try {
            const params = { year: yearToSend, month, departmentId, userId };
            const response = await apiClient.get('/stats', { params });
            setStats(response.data);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    } else if (actionType === 'excel' || actionType === 'pdf') {
        if (!departmentId) {
            message.warning('Vui lòng chọn một tổ chuyên môn để xuất báo cáo.');
            return;
        }
        try {
            const response = await apiClient.get(`/export/${actionType}`, {
                params: { year: yearToSend, departmentId, userId: userId || '' },
                responseType: 'blob',
            });
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `BaoCao_${actionType}_${month}-${yearToSend}.${actionType === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch(e) {
            message.error("Xuất file thất bại!");
        }
    }
  };

  return (
    <Card>
      <Title level={3}>Thống kê và Báo cáo</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="bottom">
        {/* SỬA LỖI: Sử dụng state và danh sách năm học mới */}
        <Col>
            <Select value={schoolYear} onChange={setSchoolYear} style={{ width: 150 }}>
                {generateSchoolYears().map(year => <Option key={year} value={year}>Năm học {year}</Option>)}
            </Select>
        </Col>
        <Col>
            <Select value={month} onChange={setMonth} style={{ width: 120 }}>
                {schoolMonths.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
            </Select>
        </Col>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <Col>
              <Select placeholder="Chọn tổ chuyên môn" onChange={handleDepartmentChange} style={{ width: 200 }} allowClear>
                {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
              </Select>
            </Col>
            <Col>
              <Select placeholder="Chọn giáo viên" value={userId} onChange={setUserId} style={{ width: 200 }} allowClear loading={loadingUsers}>
                {filteredUsers.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
          </>
        )}

        {user?.role === 'leader' && (
            <Col>
              <Select placeholder="Chọn giáo viên trong tổ" onChange={setUserId} style={{ width: 200 }} allowClear loading={loadingUsers}>
                {filteredUsers.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
        )}

        <Col><Button type="primary" onClick={() => handleAction('fetch')} loading={loading}>Xem thống kê</Button></Col>
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
        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => handleAction('excel')}>
          Xuất file Excel
        </Button>
        <Button icon={<FilePdfOutlined />} onClick={() => handleAction('pdf')}>
          Xuất file PDF
        </Button>
      </Space>
    </Card>
  );
};

export default StatisticsPage;
