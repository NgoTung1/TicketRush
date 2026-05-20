import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventOfTicket from '../components/TicketDetail/EventOfTicket';
import SeatsQr from '../components/TicketDetail/SeatsQr';
import { orderApi } from '@/api/orderApi';

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleCancelInvoice = async () => {
        if (!id) return;
        if (window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) {
            try {
                await orderApi.cancelOrder(id);
                alert("Hủy thành công!");
                navigate('/invoices'); // Go back to invoices
            } catch (err: any) {
                console.error("Cancel error", err);
                alert(err?.response?.data?.message || "Lỗi khi hủy hóa đơn!");
            }
        }
    };

    return(
        <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
                <div></div>
                <button
                    onClick={handleCancelInvoice}
                    className="px-6 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full font-bold transition-colors"
                >
                    Hủy hóa đơn
                </button>
            </div>
            <EventOfTicket />
            <SeatsQr />
        </div>
    )
};

export default TicketDetail;
