import React from 'react';
import { ExternalLink, Loader2, X } from 'lucide-react';

interface QueueMiniWidgetProps {
  imageUrl: string;
  eventName: string;
  status: 'waiting' | 'ready'; // 'waiting': đang xếp hàng | 'ready': đã đến lượt
  position?: number;           // Vị trí xếp hàng (dùng cho status 'waiting')
  timeLeft?: string;           // Thời gian còn lại (dùng cho status 'ready', VD: '09:56')
  onNavigate?: () => void;     // Hàm xử lý khi bấm nút chuyển trang (chỉ dùng khi 'ready')
  onCancel?: () => void;       // Hàm xử lý khi hủy hàng đợi (status 'waiting')
}

const QueueMiniWidget: React.FC<QueueMiniWidgetProps> = ({
  imageUrl,
  eventName,
  status,
  position,
  timeLeft,
  onNavigate,
  onCancel,
}) => {
  return (
    <div className="w-[280px] bg-[#2a2a2a] rounded-xl overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
      <div className="relative h-[140px] w-full">
        <img
          src={imageUrl}
          alt={eventName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] via-transparent to-transparent opacity-60"></div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        {status === 'waiting' ? (
          <>
            <span className="text-white text-sm font-medium italic">
              Vị trí hiện tại của bạn: <span className="text-[#00E676] font-bold not-italic">{position || '...'}</span>
            </span>
            <div className="flex items-center gap-1">
              <Loader2 size={18} className="text-gray-400 animate-spin" />
              <button onClick={onCancel} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Hủy xếp hàng">
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-white text-sm font-bold italic">
              Còn lại: {timeLeft}
            </span>
            <button
              onClick={onNavigate}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
              title="Đi tới trang đặt vé"
            >
              <ExternalLink size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QueueMiniWidget;