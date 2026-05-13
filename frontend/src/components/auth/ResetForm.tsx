import React, { useState } from 'react';
import { KeyRound, Lock } from 'lucide-react';
import AuthInput from '@/components/ui/AuthInput';
import { authApi } from '@/api/authApi';
import { Link } from 'react-router-dom';

interface ResetFormProps {
  email: string;
}

const ResetForm: React.FC<ResetFormProps> = ({ email }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Vui lòng nhập mã OTP';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu mới';
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
      await authApi.resetPassword({ email, code, password });
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      setApiError(typeof message === 'string' ? message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center">
        <h2 className="text-2xl font-black mb-4">Đổi mật khẩu thành công!</h2>
        <p className="text-sm text-tr-text-secondary mb-6">
          Bạn có thể đăng nhập bằng mật khẩu mới.
        </p>
        <Link
          to="/auth?view=login"
          className="
            w-full py-2.5 px-3 rounded-[12px]
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
      <h2 className="text-[32px] font-black text-center tracking-tight">
        Đặt lại mật khẩu
      </h2>
      <p className="text-xs text-tr-text-muted text-center mb-6">
        Mã OTP đã được gửi đến <span className="text-tr-text-secondary font-medium">{email}</span>
      </p>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {apiError}
        </div>
      )}

      <div className="space-y-4">
        {/* OTP Code */}
        <AuthInput
          id="reset-code"
          label="Mã OTP"
          type="text"
          placeholder="Nhập mã OTP từ email"
          value={code}
          onChange={(v) => { setCode(v); setErrors((p) => ({ ...p, code: '' })); }}
          error={errors.code}
          icon={<KeyRound size={16} />}
          autoComplete="one-time-code"
          disabled={loading}
        />

        {/* New Password */}
        <AuthInput
          id="reset-password"
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={password}
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })); }}
          error={errors.password}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          disabled={loading}
        />

        {/* Confirm New Password */}
        <AuthInput
          id="reset-confirm-password"
          label="Xác nhận mật khẩu mới"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
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
          'Đặt lại mật khẩu'
        )}
      </button>

      {/* Back to login */}
      <p className="mt-6 text-center text-[10px] text-tr-text-muted">
        <Link
          to="/auth?view=login"
          className="text-tr-text-secondary hover:text-tr-accent transition-colors duration-200 font-medium underline underline-offset-2"
        >
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default ResetForm;
