import React, { useState } from 'react';
import { X, ArrowLeft, CalendarDays, MapPin, Armchair, Hash, ShieldCheck, CreditCard } from 'lucide-react';

interface SeatInfo {
  id: string;
  ticketCode: string;
  zone: string;
  row: string;
  number: string;
  status: 'valid' | 'used';
  price: string;
  qrData: string;
}

const DUMMY_SEATS: SeatInfo[] = [
  { id: 't1', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j3' },
  { id: 't2', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j4' },
  { id: 't3', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j5' },
  { id: 't4', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j6' },
  { id: 't5', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j7' },
  { id: 't6', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j8' },
  { id: 't7', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12j9' },
  { id: 't8', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12ja' },
  { id: 't9', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12jb' },
  { id: 't10', ticketCode: 'eksiewp12j3', zone: 'VIP A', row: 'A', number: '1', status: 'valid', price: '1.750.000 VNĐ', qrData: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_VIPA_A1_eksiewp12jc' },
];

const SeatsQr: React.FC = () => {
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);

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
              src={selectedSeat.qrData}
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
                <p className={`font-medium ${selectedSeat.status === 'valid' ? 'text-ticket-green' : 'text-gray-400'}`}>
                  {selectedSeat.status === 'valid' ? 'Hợp lệ' : 'Đã sử dụng'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Giá vé</p>
                <p className="text-white font-medium">{selectedSeat.price}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CalendarDays className="w-4 h-4 mr-3 mt-0.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Sự kiện</p>
                <p className="text-white font-medium">SPARK NITE: S.T SƠN THẠCH x NEKO LÊ</p>
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
        {DUMMY_SEATS.map((seat) => (
          <div
            key={seat.id}
            className="bg-panel rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-600 transition-all duration-200 group w-full"
            onClick={() => setSelectedSeat(seat)}
          >
            {/* QR Code */}
            <div className="bg-white rounded-md p-1 mb-3 aspect-square flex items-center justify-center">
              <img
                src={seat.qrData}
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
