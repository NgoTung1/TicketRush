import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthInput from '@/components/ui/AuthInput';
import { authApi } from '@/api/authApi';
import { setAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/AuthStore';
import { getRoleFromToken } from '@/helpers/jwt';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile)

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res: any = await authApi.login({ email, password });
      const token = res.accessToken; // Lấy token ra

      setAccessToken(token);

      await fetchUserProfile();

      // Ưu tiên: 1) state từ ProtectedRoute  2) sessionStorage (global)  3) role-based default
      const from = location.state?.from?.pathname || sessionStorage.getItem('redirect_after_login');

      const role = getRoleFromToken(token);
      if (role?.toLowerCase() === 'admin') {
        navigate('/admin/event-list', { replace: true });
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setApiError('Email hoặc mật khẩu không chính xác.');
      } else if (status === 403) {
        setApiError('Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.');
      } else if (status === 400) {
        setApiError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (status === 429) {
        setApiError('Bạn đã thử quá nhiều lần. Vui lòng quay lại sau.');
      } else if (err.code === 'ERR_NETWORK') {
        setApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.');
      } else {
        setApiError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Lưu lại đường dẫn cũ để OAuthCallback redirect về sau khi thành công
    const from = location.state?.from?.pathname || sessionStorage.getItem('redirect_after_login');
    if (from) {
      localStorage.setItem('oauth_redirect_to', from);
      sessionStorage.removeItem('redirect_after_login');
    }

    // Redirect to Supabase OAuth
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Title */}
      <h2 className="text-[32px] font-black text-center mb-4 tracking-tight">
        Đăng nhập
      </h2>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        {/* Email */}
        <AuthInput
          id="login-email"
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
          error={errors.email}
          icon={<Mail size={16} />}
          autoComplete="email"
          disabled={loading}
        />

        {/* Password */}
        <div>
          <AuthInput
            id="login-password"
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
            error={errors.password}
            icon={<Lock size={16} />}
            autoComplete="current-password"
            disabled={loading}
          />
          {/* Forgot password link */}
          <div className="flex justify-end mt-1.5">
            <Link
              to="/auth?view=forgot"
              className="text-xs text-tr-text-muted hover:text-tr-accent transition-colors duration-200"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full mt-6 py-3 rounded-lg
          bg-white text-black font-bold text-sm
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-md
        "
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          'Đăng nhập'
        )}
      </button>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="
          w-full mt-3 py-3 rounded-lg
          text-white font-medium text-sm
          bg-[#333] hover:bg-[#3b3b3b] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Đăng nhập với Google
      </button>

      {/* Switch to Register */}
      <p className="mt-4 text-center text-[10px] text-tr-text-muted">
        Chưa có tài khoản?{' '}
        <Link
          to="/auth?view=register"
          className="text-tr-text-secondary hover:text-tr-accent transition-colors duration-200 font-medium underline underline-offset-2"
        >
          Bấm vào đây để đăng ký
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
