import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import AuthInput from '@/components/ui/AuthInput';
import { authApi } from '@/api/authApi';
import { Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập tên đầy đủ';
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6)
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({ email, password, fullName });
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setApiError(typeof message === 'string' ? message : 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center">
        <h2 className="text-2xl font-black mb-4">Đăng ký thành công!</h2>
        <p className="text-sm text-tr-text-secondary mb-6">
          Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.
        </p>
        <Link
          to="/auth?view=login"
          className="
            w-full py-2.5 rounded-lg
            bg-white text-black font-bold text-sm
            hover:bg-gray-200 transition-all duration-200
          "
        >
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Title */}
      <h2 className="text-[32px] font-black text-center mb-4 tracking-tight">
        Đăng ký
      </h2>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        {/* Full name */}
        <AuthInput
          id="register-fullname"
          label="Họ và tên"
          type="text"
          placeholder="Nhập tên đầy đủ"
          value={fullName}
          onChange={(v) => { setFullName(v); setErrors((p) => ({ ...p, fullName: '' })); }}
          error={errors.fullName}
          icon={<User size={16} />}
          autoComplete="name"
          disabled={loading}
        />

        {/* Email */}
        <AuthInput
          id="register-email"
          label="Email"
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
          error={errors.email}
          icon={<Mail size={16} />}
          autoComplete="email"
          disabled={loading}
        />

        {/* Password */}
        <AuthInput
          id="register-password"
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={password}
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })); }}
          error={errors.password}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          disabled={loading}
        />

        {/* Confirm Password */}
        <AuthInput
          id="register-confirm-password"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
          error={errors.confirmPassword}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          disabled={loading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full mt-6 py-3 rounded-lg
          bg-white text-black font-bold text-sm
          hover:bg-gray-200 transition-all duration-200
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
          'Đăng ký'
        )}
      </button>

      {/* Switch to Login */}
      <p className="mt-4 text-center text-[10px] text-tr-text-muted">
        Đã có tài khoản?{' '}
        <Link
          to="/auth?view=login"
          className="text-tr-text-secondary hover:text-tr-accent transition-colors duration-200 font-medium underline underline-offset-2"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
