import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Button, message, Statistic, Typography, Space } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

// --- HELPER FUNCTIONS CHO NĂM HỌC ---

const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    return currentMonth >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
};

// SỬA LỖI: Chỉ hiển thị năm học hiện tại và năm học trước đó
const generateSchoolYears = () => {
    const years = [];
    const [currentStart, currentEnd] = getCurrentSchoolYear().split('-').map(Number);

    // Thêm năm học hiện tại
    years.push(`${currentStart}-${currentEnd}`);
    // Thêm năm học trước đó
    years.push(`${currentStart - 1}-${currentEnd - 1}`);
    
    return years;
};

const schoolMonths = [
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' },
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }
];


const StatisticsPage = () => {
  const user = useAuth();
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [month, setMonth] = useState(9);
  
  const [departmentId, setDepartmentId] = useState(user?.role === 'leader' ? user.departmentId : null);
  const [userId, setUserId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchDataForFilters = useCallback(async () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const [usersRes, deptsRes] = await Promise.all([
            apiClient.get('/admin/users'),
            apiClient.get('/admin/departments')
        ]);
        const relevantUsers = usersRes.data.filter(u => u.role === 'teacher' || u.role === 'leader');
        setAllUsers(relevantUsers);
        setFilteredUsers(relevantUsers);
        setDepartments(deptsRes.data);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu cho bộ lọc.');
      }
    } else if (user?.role === 'leader') {
      try {
        setLoadingUsers(true);
        const response = await apiClient.get('/filters/users-in-department');
        setFilteredUsers(response.data);
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

  const handleDepartmentChange = (selectedDeptId) => {
    setDepartmentId(selectedDeptId);
    setUserId(null);

    if (!selectedDeptId) {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(allUsers.filter(u => u.department_id === selectedDeptId));
    }
  };

  const handleAction = async (actionType) => {
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
                params: { year: yearToSend, month, departmentId, userId: userId || '' },
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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* SỬA LỖI: Thêm thuộc tính responsive cho Col */}
        <Col xs={24} sm={12} md={8} lg={6}>
            <Select value={schoolYear} onChange={setSchoolYear} style={{ width: '100%' }}>
                {generateSchoolYears().map(year => <Option key={year} value={year}>Năm học {year}</Option>)}
            </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
            <Select value={month} onChange={setMonth} style={{ width: '100%' }}>
                {schoolMonths.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
            </Select>
        </Col>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select placeholder="Chọn tổ chuyên môn" onChange={handleDepartmentChange} style={{ width: '100%' }} allowClear>
                {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select placeholder="Chọn giáo viên" value={userId} onChange={setUserId} style={{ width: '100%' }} allowClear loading={loadingUsers}>
                {filteredUsers.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
          </>
        )}

        {user?.role === 'leader' && (
            <Col xs={24} sm={24} md={8} lg={6}>
              <Select placeholder="Chọn giáo viên trong tổ" onChange={setUserId} style={{ width: '100%' }} allowClear loading={loadingUsers}>
                {filteredUsers.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
        )}

        <Col xs={24} sm={24} md={8} lg={6}>
            <Button type="primary" onClick={() => handleAction('fetch')} loading={loading} style={{ width: '100%' }}>
                Xem thống kê
            </Button>
        </Col>
      </Row>

      {stats && (
        <Row gutter={[16, 24]}>
          <Col xs={24} md={8}>
            <Statistic title="Tổng số phiếu mượn" value={stats.total_forms} />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Tổng lượt sử dụng" value={stats.total_usage} />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Tổng lượt ứng dụng CNTT" value={stats.total_it_usage} />
          </Col>
        </Row>
      )}

      <Title level={4} style={{marginTop: 24}}>Xuất báo cáo</Title>
      <Space wrap>
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
