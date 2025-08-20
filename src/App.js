import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Guards
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BorrowingFormPage from './pages/BorrowingFormPage';
import HistoryPage from './pages/HistoryPage';
import StatisticsPage from './pages/StatisticsPage';
import UserManagementPage from './pages/UserManagementPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import DataManagementPage from './pages/DataManagementPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Các route bên trong ứng dụng sẽ dùng MainLayout */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Trang mặc định sau khi đăng nhập */}
          <Route path="home" element={<HomePage />} />
          <Route path="new-form" element={<BorrowingFormPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="department-management" element={<DepartmentManagementPage />} />
          <Route path="data-management" element={<DataManagementPage />} />
          
          {/* Nếu vào /app, tự động chuyển đến /app/home */}
          <Route index element={<Navigate to="home" />} />
        </Route>

        {/* Route gốc sẽ chuyển đến login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;