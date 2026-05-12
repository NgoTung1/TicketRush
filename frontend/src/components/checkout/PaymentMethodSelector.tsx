import React from 'react';

const paymentMethods = [
  { id: 'shopeepay', label: 'ShopeePay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ShopeePay-V.png' },
  { id: 'zalopay', label: 'ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png' },
  { id: 'qr', label: 'Mã QR', icon: 'https://cdn-icons-png.flaticon.com/512/134/134900.png' },
  { id: 'bank', label: 'Tài khoản ngân hàng', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png' },
  { id: 'card', label: 'Thẻ ghi nợ/Thẻ tín dụng', icon: 'https://cdn-icons-png.flaticon.com/512/6963/6963703.png' },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelect: (id: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onSelect }) => {
  return (
    <div className="bg-panel rounded-xl p-6 shadow-md w-full">
      <h2 className="text-xl font-bold text-white mb-6">Phương thức thanh toán</h2>
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => onSelect(method.id)}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-success' : 'border-gray-500'}`}>
              {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-success rounded-full"></div>}
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-md overflow-hidden p-1">
              <img src={method.icon} alt={method.label} className="max-w-full max-h-full object-contain" />
            </div>
            <span className={`text-base font-medium ${selectedMethod === method.id ? 'text-white' : 'text-gray-300'}`}>
              {method.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
