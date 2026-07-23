import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Button, message, Statistic, Typography, Space } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';
import { getCurrentSchoolYear, generateSchoolYears } from '../utils/schoolYear';

const { Title } = Typography;
const { Option } = Select;

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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDataForFilters = useCallback(async () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const deptsRes = await apiClient.get('/admin/departments');
        setDepartments(deptsRes.data);
      } catch (error) {
        message.error('Lỗi khi tải danh sách tổ chuyên môn.');
      }
    } 
    else if (user?.role === 'leader') {
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
    if (user?.role !== 'teacher') {
        fetchDataForFilters();
    }
  }, [fetchDataForFilters, user?.role]);

  const handleDepartmentChange = async (selectedDeptId) => {
    setDepartmentId(selectedDeptId);
    setUserId(null); 
    if (!selectedDeptId) {
      setFilteredUsers([]);
      return;
    }
    try {
        setLoadingUsers(true);
        const response = await apiClient.get(`/filters/users-by-department/${selectedDeptId}`);
        setFilteredUsers(response.data);
    } catch (error) {
        message.error('Lỗi khi tải danh sách giáo viên.');
        setFilteredUsers([]);
    } finally {
        setLoadingUsers(false);
    }
  };

  const handleAction = async (actionType) => {
    const [startYear, endYear] = schoolYear.split('-').map(Number);
    const yearToSend = month >= 9 ? startYear : endYear;

    let params;

    if (user.role === 'teacher') {
        params = {
            year: yearToSend,
            month,
            departmentId: user.departmentId,
            userId: user.id
        };
    } else {
        params = {
            year: yearToSend,
            month,
            departmentId: departmentId,
            userId: userId,
        };
    }
    
    if (actionType === 'fetch') {
        setLoading(true);
        try {
            const response = await apiClient.get('/stats', { params });
            setStats(response.data);
            if(response.data.total_forms === 0) {
              message.info('Không có dữ liệu thống kê cho lựa chọn này.');
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    } else if (actionType === 'excel' || actionType === 'pdf') {
        // *** SỬA LỖI QUAN TRỌNG TẠI ĐÂY ***
        // Chỉ kiểm tra departmentId nếu người dùng không phải là teacher
        if (!params.departmentId && user.role !== 'teacher') {
            message.warning('Vui lòng chọn một tổ chuyên môn để xuất báo cáo.');
            return;
        }
        // Thêm kiểm tra cho teacher nếu tài khoản chưa có tổ
        if (!params.departmentId && user.role === 'teacher') {
            message.error('Tài khoản của bạn chưa được gán vào tổ chuyên môn. Vui lòng liên hệ Admin.');
            return;
        }

        try {
            const response = await apiClient.get(`/export/${actionType}`, {
                params: { ...params, userId: params.userId || '' },
                responseType: 'blob',
            });
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const fileName = user.role === 'teacher' ? `BaoCao_${user.username}` : 'BaoCao';
            link.download = `${fileName}_${month}-${yearToSend}.${actionType === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch(e) {
            // Hiển thị lỗi nếu không có dữ liệu để xuất
            if (e.response && e.response.status === 404) {
                 message.warning('Không có dữ liệu để xuất file báo cáo.');
            } else {
                 message.error("Xuất file thất bại!");
            }
        }
    }
  };

  return (
    <Card>
      <Title level={3}>Thống kê và Báo cáo</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="bottom">
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
              <Select placeholder="Chọn tổ chuyên môn" value={departmentId} onChange={handleDepartmentChange} style={{ width: 200 }} allowClear>
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
              <Select placeholder="Chọn giáo viên trong tổ" value={userId} onChange={setUserId} style={{ width: 200 }} allowClear loading={loadingUsers}>
                {filteredUsers.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
              </Select>
            </Col>
        )}

        <Col><Button type="primary" onClick={() => handleAction('fetch')} loading={loading}>Xem thống kê</Button></Col>
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
