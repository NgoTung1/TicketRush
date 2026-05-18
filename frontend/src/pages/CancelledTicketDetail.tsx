import React, { useState, useEffect } from 'react';
import EventOfTicket from '@/components/TicketDetail/EventOfTicket';
import { useParams } from 'react-router-dom';
import { orderApi, TicketInOrderResponse } from '@/api/orderApi';
import { Loader2 } from 'lucide-react';

const CancelledTicketDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [tickets, setTickets] = useState<TicketInOrderResponse[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchTickets = async () => {
			if (!id) return;
			try {
				setLoading(true);
				const response: any = await orderApi.getTicketsByOrder(id);
				const ticketsData = Array.isArray(response) ? response : response.data || [];
				setTickets(ticketsData);
			} catch (error) {
				console.error('Failed to fetch cancelled tickets', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTickets();
	}, [id]);

	return (
		<div className="w-full">
			<EventOfTicket variant="cancelled" />

			<div className="mb-10 w-full">
				<h2 className="text-2xl font-bold text-white mb-6 pt-4">Vé ngồi</h2>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<Loader2 className="w-8 h-8 text-primary animate-spin" />
					</div>
				) : !tickets || tickets.length === 0 ? (
					<div className="text-center py-10 text-gray-400">
						Không có vé nào trong hóa đơn này.
					</div>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
						{tickets.map((seat) => {
							return (
								<div
									key={seat.id}
									className="bg-panel rounded-lg border border-gray-800 p-3 cursor-default group w-full"
								>
									<div className="bg-white rounded-md p-1 mb-3 aspect-square flex items-center justify-center">
										<img
											src={`data:image/png;base64,${seat.qrCodeImageBase64}`}
											alt="QR Code"
											className="w-full h-full object-contain opacity-40 grayscale"
										/>
									</div>

									<p className="text-sm font-semibold text-red-500 mb-2">Đã hủy</p>

									<div>
										<p className="text-xs text-gray-400 leading-snug">
											Mã vé: <span className="text-gray-300">{seat.ticketCode}</span>
										</p>
										<p className="text-xs text-gray-400 leading-snug">
											Vị trí ghế:{' '}
											<span className="text-gray-300">
												{seat.row}{seat.number}
											</span>
										</p>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default CancelledTicketDetail;

