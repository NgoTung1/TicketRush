import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;           // Trạng thái bật/tắt modal
  onClose: () => void;       // Hàm chạy khi bấm dấu X hoặc bấm ra ngoài
  title: string;             // Tiêu đề của thông báo
  children: ReactNode;       // Phần body tùy chỉnh (truyền HTML/Component vào đây)
  onConfirm?: () => void;    // Sự kiện khi bấm nút xác nhận
  confirmText?: string;      // Tên nút xác nhận (mặc định là "Xác nhận")
}

const NotifyForm: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Xác nhận',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] bg-[#242424] rounded-[8px] px-7 py-5 animate-[fadeInUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-4"
        >
          <X size={32} />
        </button>

        <h2 className="text-[28px] font-bold text-center text-white mb-4 tracking-wide">
          {title}
        </h2>

        <div className="text-[16px] font-bold leading-relaxed">
          {children}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onConfirm || onClose} // Nếu không truyền onConfirm thì mặc định sẽ đóng
            className="px-5 py-1.5 bg-[#777777] hover:bg-[#727272] text-white text-[12px] font-medium rounded-full transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifyForm;