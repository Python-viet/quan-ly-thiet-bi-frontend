// File: src/api/axiosConfig.js (Cập nhật)
// Thêm "interceptor" để tự động đính kèm token vào mỗi request

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://quan-ly-thiet-bi-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header của mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;