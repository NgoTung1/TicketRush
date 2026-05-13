import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import InvoiceDetails from '../components/checkout/InvoiceDetails';

const Checkout: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('bank');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock fetching order expiration time
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Mocking API call: GET orders/{orderId}
        // In a real app: const response = await axios.get(`/api/orders/${orderId}`);
        // Let's pretend the API returns an expiration time 10 minutes from now
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
        
        const now = new Date();
        const expirationDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
        
        const diffInSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
        setTimeLeft(diffInSeconds);
      } catch (error) {
        console.error("Failed to fetch order details", error);
        // Fallback to 10 minutes
        setTimeLeft(10 * 60);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // Time expired, redirect to seat selection
      navigate('/seats', { replace: true, state: { message: 'Thời gian thanh toán đã hết. Vui lòng chọn lại ghế.' } });
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    navigate('/seats');
  };

  const handlePayment = () => {
    alert(`Processing payment via ${selectedMethod}...`);
    // API call to process payment
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ticket-blue"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <div className="text-gray-300 font-medium italic">
            Vui lòng hoàn tất thanh toán trong: <span className="text-ticket-green not-italic ml-1 text-lg">{timeLeft !== null ? formatTime(timeLeft) : '00:00'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col">
             <PaymentMethodSelector selectedMethod={selectedMethod} onSelect={setSelectedMethod} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-6 items-end">
            <InvoiceDetails />
            
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleCancel}
                className="px-5 py-1 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors focus:outline-none"
              >
                Hủy
              </button>
              <button
                onClick={handlePayment}
                className="px-5 py-1 rounded-full bg-ticket-blue hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none shadow-[0_0_15px_rgba(33,150,243,0.5)]"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Checkout;
