import React from 'react';

export interface InvoiceItem {
  type: string;
  price: number;
  quantity: number;
  seats: string[];
}

interface InvoiceDetailsProps {
  invoiceData: InvoiceItem[];
  totalAmount: number;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceData, totalAmount }) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="bg-panel rounded-xl p-4 shadow-md w-full">
      <h2 className="text-lg font-bold text-white mb-4">Thông tin hóa đơn</h2>
      
      <div className="space-y-4">
        {invoiceData.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-bold text-sm mb-0.5">{item.type}</h3>
              <p className="text-white font-bold text-sm mb-1.5 italic">{formatCurrency(item.price)}</p>
              <div className="flex space-x-1.5">
                {item.seats.map((seat) => (
                  <span key={seat} className="bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    {seat}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold italic text-sm mb-1">Số lượng: {item.quantity}</p>
              <p className="text-ticket-green font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex justify-start items-center space-x-1.5">
          <span className="text-white font-bold text-base">Tổng hóa đơn:</span>
          <span className="text-ticket-green font-bold text-base">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;