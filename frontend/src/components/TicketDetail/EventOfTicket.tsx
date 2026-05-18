import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';

type EventOfTicketVariant = 'default' | 'cancelled';

interface EventOfTicketProps {
  variant?: EventOfTicketVariant;
}

const EventOfTicket: React.FC<EventOfTicketProps> = ({ variant = 'default' }) => {
  const isCancelled = variant === 'cancelled';

  return (
    <div className="mb-10 w-full border-b border-gray-800 pb-10">
      <h2 className="text-2xl font-bold text-white mb-6">Sự kiện</h2>

      <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
        {/* Event Poster */}
        <div className="w-full md:w-[60%] shrink-0">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2bOb-8xFgTA9saEENGC3s-dt1fNxihede1g&s"
            alt="Event Poster"
            className="w-full h-[260px] sm:h-[320px] md:h-[400px] object-contain object-center rounded-xl"
          />
        </div>

        {/* Event Info */}
        <div className="flex flex-col justify-start md:w-[35%] py-4">
          <h3
            className={
              `text-3xl lg:text-4xl font-bold mb-4 leading-tight ` +
              (isCancelled ? 'text-gray-400' : 'text-white')
            }
          >
            SPARK NITE: S.T SƠN THẠCH x NEKO LÊ
          </h3>
          <p className="text-gray-400 text-base mb-6">
            Ban tổ chức: <span className="text-white font-medium">S.T SƠN THẠCH x NEKO LÊ</span>
          </p>

          {isCancelled ? (
            <p className="text-red-500 text-2xl font-extrabold -mt-4 mb-6">CANCELLED</p>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center text-gray-300 text-base">
              <CalendarDays className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
              <span>20:30 - 30/04/2026</span>
            </div>

            <div className="flex items-start text-gray-300 text-base">
              <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400 shrink-0" />
              <span>Lầu 1, Nhà hát Bến Thành Số 6 Mạc Đĩnh Chi, Phường Sài Gòn, Thành phố Hồ Chí Minh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOfTicket;
