import React from 'react';
import { Calendar } from 'lucide-react';

export interface EventItemProps {
    title?: string;
    price?: string | number;
    date?: string;
    status?: string;
    statusColor?: string;
    imageUrl?: string;
    onClick?: () => void;
}

export const EventItem: React.FC<EventItemProps> = ({
    title = "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
    price = "200.000đ",
    date = "20:30 - 30/04/2026",
    status = "Sắp diễn ra",
    statusColor = "text-[#F7FF55]", // Default yellow
    imageUrl = "https://ticketbox.vn/images/default-event-cover.jpg", // Fallback placeholder
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className="w-full h-[330px] max-w-[340px] rounded-xl overflow-hidden flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        >

            {/* Image Container: Đã fix cứng chiều cao h-[190px] và thêm shrink-0 */}
            <div className="relative w-full h-[190px] shrink-0">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="px-2 py-3 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-white text-[18px] font-bold leading-tight mb-1 line-clamp-2">
                    {title}
                </h3>

                {/* Price */}
                <div className="text-[#19FF88] font-bold text-[14px] mb-6">
                    Giá vé: {price}
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-white text-[12px] font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-white" />
                        <span>{date}</span>
                    </div>
                    <div className={`${statusColor} text-[12px] font-bold italic`}>
                        {status}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventItem;