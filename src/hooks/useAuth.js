import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Kiểm tra xem token có hết hạn không (tùy chọn nhưng nên có)
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return null;
      }
      return decodedToken.user; // Trả về payload chứa thông tin user
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      return null;
    }
  }
  return null;
};

export default useAuth;