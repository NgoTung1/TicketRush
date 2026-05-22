import React from 'react';

interface LoadingProps {
  visible?: boolean;
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({ visible = true, size = 36 }) => {
  if (!visible) return null;

  return (
    <div
      id="loading-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]"
    >
      <svg
        className="animate-spin text-white/80"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Loading;
