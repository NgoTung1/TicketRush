import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-xs text-white mb-1.5 font-medium tracking-wide"
      >
        {label}
      </label>

      {/* Input wrapper */}
      <div
        className={`
          relative flex items-center w-full rounded-lg
          bg-[#606060] border transition-all duration-200
          ${error
            ? 'border-red-500/70 focus-within:border-red-500'
            : 'border-[#3a3a3a] focus-within:border-tr-accent/60'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Leading Icon */}
        {icon && (
          <span className="pl-3 text-white flex-shrink-0">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full bg-transparent text-[14px] text-tr-text
            placeholder:text-white/60
            outline-none py-3
            ${icon ? 'pl-2' : 'pl-3'}
            ${isPassword ? 'pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden' : 'pr-3'}
          `}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-tr-text transition-colors duration-200"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="absolute right-0 -top-1 mt-1 text-xs text-red-400 animate-[fadeIn_0.2s_ease-out]">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
