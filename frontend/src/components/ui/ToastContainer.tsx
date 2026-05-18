import React from 'react';
import { X } from 'lucide-react';
import { useToastStore, ToastType } from '@/store/ToastStore';

const toastStyles: Record<ToastType, string> = {
  success: 'text-[#00E676]', // Xanh lá cây
  error: 'text-[#FF4D4D]',   // Đỏ
  warning: 'text-[#FFD700]', // Vàng
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 left-4 z-[30] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto relative w-[380px] bg-[#242424] rounded-[8px] p-4 pr-12 shadow-[0_4px_12px_rgba(0,0,0,0.5)] my-toast-enter"
        >
          {/* Nút đóng */}
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <X size={24} />
          </button>

          {/* Tiêu đề (Đổi màu theo Type) */}
          <h4 className={`text-[17px] font-bold mb-1 ${toastStyles[toast.type]}`}>
            {toast.title}
          </h4>

          {/* Nội dung */}
          <div className="text-[13px] text-gray-200 leading-relaxed">
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;