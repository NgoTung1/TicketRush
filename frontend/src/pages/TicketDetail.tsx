import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventOfTicket from '../components/TicketDetail/EventOfTicket';
import SeatsQr from '../components/TicketDetail/SeatsQr';
import { orderApi } from '@/api/orderApi';
import NotifyForm from '@/components/ui/NotifyForm';
import { useToastStore } from '@/store/ToastStore';

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isCancelNotifyOpen, setIsCancelNotifyOpen] = useState(false);
    const { addToast } = useToastStore();

    const handleCancelInvoice = () => {
        if (!id) return;
        setIsCancelNotifyOpen(true);
    };

    const confirmCancelInvoice = async () => {
        if (!id) return;
        try {
            await orderApi.cancelOrder(id);
            addToast({ type: 'success', title: 'Thành công', message: 'Hủy hóa đơn thành công!' });
            navigate('/invoices'); // Go back to invoices
        } catch (err: any) {
            console.error("Cancel error", err);
            addToast({ type: 'error', title: 'Thất bại', message: err?.response?.data?.message || 'Lỗi khi hủy hóa đơn!' });
        } finally {
            setIsCancelNotifyOpen(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center mt-4">
            <EventOfTicket />
            <SeatsQr />
            <div className="w-full flex justify-end mt-4 mb-10">
                <button
                    onClick={handleCancelInvoice}
                    className="px-6 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full font-bold transition-colors"
                >
                    Hủy hóa đơn
                </button>
            </div>

            <NotifyForm
                isOpen={isCancelNotifyOpen}
                onClose={() => setIsCancelNotifyOpen(false)}
                title="Xác nhận"
                onConfirm={confirmCancelInvoice}
                confirmText="Hủy hóa đơn"
            >
                <p className="">
                    Bạn có chắc chắn muốn hủy hóa đơn này không? Hành động này không thể hoàn tác.
                </p>
            </NotifyForm>
        </div>
    )
};

export default TicketDetail;
