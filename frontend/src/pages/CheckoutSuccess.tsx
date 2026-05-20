import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CheckoutSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-[#00ff00] rounded-full p-4 mb-6 shadow-[0_0_20px_rgba(0,255,0,0.4)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h1>
      <p className="text-gray-300 mb-6 text-lg">Cảm ơn bạn đã đặt vé. Hóa đơn của bạn đã được thanh toán.</p>
      
      <div className="bg-[#1E1E1E] rounded-xl p-4 shadow-md w-full max-w-md mb-8 border border-[#333]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Mã hóa đơn:</span>
          <span className="text-white font-mono font-bold text-sm break-all">{id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Trạng thái:</span>
          <span className="text-[#00ff00] font-bold uppercase">PAID</span>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-full border border-gray-500 hover:bg-gray-700 text-white font-medium transition-colors focus:outline-none"
        >
          Về trang chủ
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="px-6 py-2 rounded-full bg-[#0088ff] hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none shadow-[0_0_15px_rgba(0,136,255,0.5)]"
        >
          Xem hóa đơn
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
