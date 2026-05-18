import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Armchair, Hash, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { orderApi, TicketInOrderResponse } from '@/api/orderApi';

const SeatsQr: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSeat, setSelectedSeat] = useState<TicketInOrderResponse | null>(null);
  const [tickets, setTickets] = useState<TicketInOrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response: any = await orderApi.getTicketsByOrder(id);
        // If response is the array directly (due to interceptor)
        const ticketsData = Array.isArray(response) ? response : response.data || [];
        setTickets(ticketsData);
      } catch (error) {
        console.error('Failed to fetch tickets', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        Không có vé nào trong hóa đơn này.
      </div>
    );
  }

  // Detail view when a seat is selected
  if (selectedSeat) {
    return (
      <div className="mb-10">
        {/* Back button */}
        <button
          onClick={() => setSelectedSeat(null)}
          className="flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách vé
        </button>

        {/* Large QR Code */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-white p-5 rounded-xl w-[280px] h-[280px] flex items-center justify-center shadow-lg">
            <img
              src={`data:image/png;base64,${selectedSeat.qrCodeImageBase64}`}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Ticket detail info */}
        <div className="bg-panel rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-5 pb-4 border-b border-gray-800">
            Thông tin vé
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
            <div className="flex items-start">
              <Hash className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Mã vé</p>
                <p className="text-white font-medium">{selectedSeat.ticketCode}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Armchair className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Vị trí ghế</p>
                <p className="text-white font-medium">{selectedSeat.row}{selectedSeat.number}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Khu vực</p>
                <p className="text-white font-medium">{selectedSeat.zone}</p>
              </div>
            </div>

            <div className="flex items-start">
              <ShieldCheck className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Trạng thái</p>
                <p className={`font-medium ${selectedSeat.status === 'VALID' ? 'text-ticket-green' : 'text-gray-400'}`}>
                  {selectedSeat.status === 'VALID' ? 'Hợp lệ' : selectedSeat.status === 'USED' ? 'Đã sử dụng' : 'Đã hủy'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Giá vé</p>
                <p className="text-white font-medium">{selectedSeat.price.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>

            <div className="flex items-start">
              <CalendarDays className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Sự kiện</p>
                <p className="text-white font-medium">{selectedSeat.eventTitle}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 italic">
              * Vui lòng xuất trình mã QR khi vào cổng. Không chia sẻ mã QR cho người khác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - list of all QR tickets
  return (
    <div className="mb-10 w-full">
      <h2 className="text-2xl font-bold text-white mb-6 pt-4">Vé ngồi</h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
        {tickets.map((seat) => (
          <div
            key={seat.id}
            className="bg-panel rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-600 transition-all duration-200 group w-full"
            onClick={() => setSelectedSeat(seat)}
          >
            {/* QR Code */}
            <div className="bg-white rounded-md p-1 mb-3 aspect-square flex items-center justify-center">
              <img
                src={`data:image/png;base64,${seat.qrCodeImageBase64}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Ticket info below QR */}
            <div>
              <p className="text-xs text-gray-400 leading-snug">
                Mã vé: <span className="text-gray-300">{seat.ticketCode}</span>
              </p>
              <p className="text-xs text-gray-400 leading-snug">
                Vị trí ghế: <span className="text-gray-300">{seat.row}{seat.number}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatsQr;
