import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import AuthInput from '@/components/ui/AuthInput';
import { authApi } from '@/api/authApi';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ForgotForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      navigate(`/auth?view=reset&email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Không thể gửi mã OTP. Vui lòng thử lại.';
      setApiError(typeof message === 'string' ? message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Title */}
      <h2 className="text-[32px] font-black text-center tracking-tight">
        Xác thực
      </h2>
      <p className="text-xs text-tr-text-muted text-center mb-6">
        Nhập email để nhận mã OTP đặt lại mật khẩu
      </p>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <AuthInput
          id="forgot-email"
          label="Email đăng ký"
          type="email"
          placeholder="Nhập email xác thực"
          value={email}
          onChange={(v) => { setEmail(v); setError(''); }}
          error={error}
          icon={<Mail size={16} />}
          autoComplete="email"
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
            Đang gửi...
          </span>
        ) : (
          'Xác thực'
        )}
      </button>

      {/* Back to login */}
      <p className="mt-4 text-center text-[10px] text-tr-text-muted">
        <Link
          to="/auth?view=login"
          className="text-tr-text-secondary hover:text-tr-accent transition-colors duration-200 font-medium"
        >
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default ForgotForm;
