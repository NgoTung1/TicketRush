import React, { useMemo, useState } from 'react';
import EventOfTicket from '@/components/TicketDetail/EventOfTicket';

interface CancelledSeatInfo {
	id: string;
	ticketCode: string;
	row: string;
	number: string;
	qrData: string;
}

const CancelledTicketDetail: React.FC = () => {
	const [clickedSeatId, setClickedSeatId] = useState<string | null>(null);

	const seats = useMemo<CancelledSeatInfo[]>(
		() => [
			{
				id: 't1',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j3',
			},
			{
				id: 't2',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j4',
			},
			{
				id: 't3',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j5',
			},
			{
				id: 't4',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j6',
			},
			{
				id: 't5',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j7',
			},
			{
				id: 't6',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j8',
			},
			{
				id: 't7',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12j9',
			},
			{
				id: 't8',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12ja',
			},
			{
				id: 't9',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12jb',
			},
			{
				id: 't10',
				ticketCode: 'eksiewp12j3',
				row: 'A',
				number: '1',
				qrData:
					'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TicketRush_CANCELLED_A1_eksiewp12jc',
			},
		],
		[],
	);

	return (
		<div className="w-full">
			<EventOfTicket variant="cancelled" />

			<div className="mb-10 w-full">
				<h2 className="text-2xl font-bold text-white mb-6 pt-4">Vé ngồi</h2>

				<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
					{seats.map((seat) => {
						const isClicked = clickedSeatId === seat.id;
						return (
							<div
								key={seat.id}
								className="bg-panel rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-600 transition-all duration-200 group w-full"
								onClick={() => setClickedSeatId((prev) => (prev === seat.id ? null : seat.id))}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										setClickedSeatId((prev) => (prev === seat.id ? null : seat.id));
									}
								}}
							>
								<div className="bg-white rounded-md p-1 mb-3 aspect-square flex items-center justify-center">
									<img
										src={seat.qrData}
										alt="QR Code"
										className="w-full h-full object-contain opacity-40 grayscale"
									/>
								</div>

								{isClicked && (
									<p className="text-sm font-semibold text-red-500 mb-2">Đã hủy</p>
								)}

								<div>
									<p className="text-xs text-gray-400 leading-snug">
										Mã vé: <span className="text-gray-300">{seat.ticketCode}</span>
									</p>
									<p className="text-xs text-gray-400 leading-snug">
										Vị trí ghế:{' '}
										<span className="text-gray-300">
											{seat.row}
											{seat.number}
										</span>
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default CancelledTicketDetail;

