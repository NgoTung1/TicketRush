import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import InvoiceDetails, { InvoiceItem } from '../components/checkout/InvoiceDetails';
import { orderApi } from '@/api/orderApi';
import { useRoomStore } from '@/store/RoomStore';

const Checkout: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    sessionId: string;
    seatIds: string[];
    invoiceData: InvoiceItem[];
    totalAmount: number;
  } | null;
  
  const [selectedMethod, setSelectedMethod] = useState<string>('bank');
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const { activeRoom, clearActiveRoom } = useRoomStore();

  useEffect(() => {
    if (!state) {
      navigate('/seats', { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!activeRoom) {
      // Time expired or room cleared
      navigate('/', { replace: true, state: { message: 'Thời gian thanh toán đã hết.' } });
    }
  }, [activeRoom, navigate]);

  const handleCancel = () => {
    clearActiveRoom();
    navigate('/');
  };

  const handlePayment = async () => {
    if (!state?.sessionId || !state?.seatIds) return;
    setIsLoadingPayment(true);
    try {
      const createRes = await orderApi.createOrder({
        sessionId: state.sessionId,
        seatIds: state.seatIds,
      });
      const newOrderId = createRes.data.orderId;

      await orderApi.payOrder(newOrderId);
      clearActiveRoom();
      navigate(`/checkout/success/${newOrderId}`, { replace: true });
    } catch (error) {
      console.error("Payment failed", error);
      alert('Thanh toán thất bại, vui lòng thử lại');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  return (
    <div className="w-full">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <div className="text-gray-300 font-medium italic">
            Vui lòng hoàn tất thanh toán trong: <span className="text-ticket-green not-italic ml-1 text-lg">{activeRoom?.timeLeft || '00:00'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col">
             <PaymentMethodSelector selectedMethod={selectedMethod} onSelect={setSelectedMethod} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-6 items-end">
            {state && (
              <InvoiceDetails 
                invoiceData={state.invoiceData} 
                totalAmount={state.totalAmount} 
              />
            )}
            
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleCancel}
                className="px-5 py-1 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors focus:outline-none"
              >
                Hủy
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoadingPayment}
                className="px-5 py-1 rounded-full bg-ticket-blue hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none shadow-[0_0_15px_rgba(33,150,243,0.5)] disabled:opacity-50"
              >
                {isLoadingPayment ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Checkout;
