import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { orderApi, EventCreateResponse } from '@/api/orderApi';

type EventOfTicketVariant = 'default' | 'cancelled';

interface EventOfTicketProps {
  variant?: EventOfTicketVariant;
}

const EventOfTicket: React.FC<EventOfTicketProps> = ({ variant = 'default' }) => {
  const isCancelled = variant === 'cancelled';
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventCreateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        console.log('EventOfTicket: id is undefined');
        return;
      }
      try {
        setLoading(true);
        console.log('EventOfTicket: fetching for orderId', id);
        const response = await orderApi.getEventByOrder(id);
        console.log('EventOfTicket: response is', response);
        setEventData(response as unknown as EventCreateResponse);
      } catch (error: any) {
        console.error('Failed to fetch event data:', error);
        console.error('Error response:', error.response);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="mb-10 w-full border-b border-gray-800 pb-10 text-white">Đang tải thông tin sự kiện...</div>;
  }

  if (!eventData) {
    return <div className="mb-10 w-full border-b border-gray-800 pb-10 text-white">Không tìm thấy thông tin sự kiện.</div>;
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} - ${day}`;
  };

  return (
    <div className="mb-10 w-full border-b border-gray-800 pb-10">
      <h2 className="text-2xl font-bold text-white mb-6">Sự kiện</h2>

      <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
        {/* Event Poster */}
        <div className="w-full md:w-[60%] shrink-0">
          <img
            src={eventData.bannerUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2bOb-8xFgTA9saEENGC3s-dt1fNxihede1g&s"}
            alt="Event Poster"
            className="w-full h-[260px] sm:h-[320px] md:h-[400px] object-contain object-center rounded-xl bg-[#1f2937]"
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
            {eventData.title}
          </h3>
          <p className="text-gray-400 text-base mb-6">
            Ban tổ chức: <span className="text-white font-medium">{eventData.organizer || 'Đang cập nhật'}</span>
          </p>

          {isCancelled ? (
            <p className="text-red-500 text-2xl font-extrabold -mt-4 mb-6">CANCELLED</p>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center text-gray-300 text-base">
              <CalendarDays className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
              <span>{eventData.startTime ? formatDateTime(eventData.startTime) : 'Đang cập nhật'}</span>
            </div>

            <div className="flex items-start text-gray-300 text-base">
              <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400 shrink-0" />
              <span>{eventData.address || 'Đang cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOfTicket;
