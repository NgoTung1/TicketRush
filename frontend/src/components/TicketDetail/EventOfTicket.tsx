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
            src="https://scontent.fhan17-1.fna.fbcdn.net/v/t39.30808-6/672683903_1261289466164437_4958276160696733075_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHTAH_NjmSc_q_lS7_h_sDsYwu2SsVzGTRjC7ZKxXMZNNy_-pCz4bg-kIXWSJ5QDFwO2dLcJrlPP-pE09kYneMq&_nc_ohc=d_U_7Cvoo-IQ7kNvwH3An95&_nc_oc=Ado0HzRuwoj_-n2WsxpBVdQqaz3Utva9M5F4pKWcUHkRi22cd2YlWHcjjGgnrQxjiLM&_nc_zt=23&_nc_ht=scontent.fhan17-1.fna&_nc_gid=CPw3UNYJur1BMHkDbSBvog&_nc_ss=7b2a8&oh=00_Af4V3AzzkyKWQMAjYyKNuG9XN0p-X9bsVLDWOFny-l1y9Q&oe=6A09D045"
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
