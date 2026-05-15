import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/AuthStore';
import { getRoleFromToken } from '@/helpers/jwt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  // Nếu trang yêu cầu đăng nhập (profile, hoặc các trang user-only) mà không có token
  if (!token && requiredRole) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const role = token ? getRoleFromToken(token).toLowerCase() : null;

  // 1. Nếu trang yêu cầu ADMIN mà người dùng không phải ADMIN
  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 2. Nếu trang yêu cầu USER mà người dùng là ADMIN (Chặn Admin vào trang User)
  if (requiredRole === 'user' && role === 'admin') {
    return <Navigate to="/admin/event-list" replace />;
  }

  // 3. Nếu mọi thứ OK -> Render nội dung bên trong
  return <>{children}</>;
};

export default ProtectedRoute;
