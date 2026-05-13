import React from 'react';
import { Calendar } from 'lucide-react';

export interface EventItemProps {
    title?: string;
    price?: string | number;
    date?: string;
    status?: string;
    statusColor?: string;
    imageUrl?: string;
}

export const EventItem: React.FC<EventItemProps> = ({
    title = "HBAshow: Hoàng Hôn Rực Rỡ - Hoàng Hải & Bạch Công Khanh",
    price = "200.000đ",
    date = "20:30 - 30/04/2026",
    status = "Sắp diễn ra",
    statusColor = "text-[#ffe600]", // Default yellow
    imageUrl = "https://ticketbox.vn/images/default-event-cover.jpg" // Fallback placeholder
}) => {
    return (
        <div className="w-full max-w-[340px] bg-[#1a1a1b] rounded-xl overflow-hidden flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50">
            {/* Image Container */}
            <div className="relative w-full aspect-[16/10]">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover rounded-2xl"
                />
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-white text-[18px] font-bold leading-tight mb-2 line-clamp-2 min-h-[40px]">
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
