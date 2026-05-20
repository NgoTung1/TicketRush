import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import InvoiceDetails, { InvoiceItem } from '../components/checkout/InvoiceDetails';
import { useRoomStore } from '@/store/RoomStore';

const CheckoutSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    invoiceData: InvoiceItem[];
    totalAmount: number;
  } | null;

  const { clearActiveRoom } = useRoomStore();

  useEffect(() => {
    // Clear room state so timer stops, seats are freed locally if needed, etc.
    clearActiveRoom();

    if (!state) {
      navigate('/invoices', { replace: true });
    }
  }, [state, navigate, clearActiveRoom]);

  return (
    <div className="w-full">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold">Hoàn tất đơn hàng</h1>
          <div className="text-[#00ff00] font-medium text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Thanh toán thành công!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Success message & actions */}
          <div className="flex flex-col space-y-6">
            <div className="bg-[#1E1E1E] rounded-xl p-8 border border-[#333] flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="bg-[#00ff00] rounded-full p-4 mb-6 shadow-[0_0_20px_rgba(0,255,0,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Đặt vé thành công!</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của TicketRush.<br />
                Mã hóa đơn của bạn: <span className="text-[#00ff00] font-mono font-bold break-all ml-1">{id}</span>
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors focus:outline-none"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => navigate('/invoices')}
                  className="px-6 py-2.5 rounded-full bg-ticket-blue hover:bg-blue-600 text-white font-bold transition-colors focus:outline-none shadow-[0_0_15px_rgba(33,150,243,0.5)]"
                >
                  Xem hóa đơn
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Details */}
          <div className="flex flex-col space-y-6 items-end">
            {state && (
              <div className="w-full">
                <InvoiceDetails 
                  invoiceData={state.invoiceData} 
                  totalAmount={state.totalAmount} 
                />
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default CheckoutSuccess;
