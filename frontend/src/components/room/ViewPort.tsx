import React, { useState } from 'react';
import Zone from './Zone';
import { SeatStatus } from './Seat';

const ViewPort: React.FC = () => {
    // Tạo dữ liệu ghế tĩnh dựa trên hình ảnh mô phỏng
    const initialSeats: SeatStatus[][] = Array.from({ length: 10 }, (_, rowIndex) => {
        return Array.from({ length: 20 }, (_, colIndex) => {
            // Logic để vẽ khu vực màu như trong hình:
            // Tổng cộng 20 cột, 10 hàng
            // - 3 hàng đầu (0, 1, 2) và 2 hàng cuối (8, 9) là xám (available)
            // - Các hàng 3, 4, 5, 6, 7 có khối màu ở giữa

            // Hàng 3: 6 xám, 8 xanh dương (selected), 6 xám
            if (rowIndex === 3 && colIndex >= 6 && colIndex <= 13) {
                return 'selected';
            }

            // Hàng 4, 5, 6, 7: 6 xám, 1 xanh, 6 vàng (vip), 1 xanh, 6 xám
            if (rowIndex >= 4 && rowIndex <= 7) {
                if (colIndex === 6 || colIndex === 13) {
                    return 'selected';
                }
                if (colIndex > 6 && colIndex < 13) {
                    return 'vip';
                }
            }

            return 'available';
        });
    });

    const [seats, setSeats] = useState<SeatStatus[][]>(initialSeats);

    const handleSeatClick = (rowIndex: number, colIndex: number) => {
        const newSeats = [...seats];
        const currentStatus = newSeats[rowIndex][colIndex];

        // Logic click đơn giản: available <-> selected (hoặc booked)
        // Bạn có thể tuỳ chỉnh theo logic thực tế của project
        if (currentStatus === 'available') {
            newSeats[rowIndex][colIndex] = 'selected';
        } else if (currentStatus === 'selected') {
            newSeats[rowIndex][colIndex] = 'available';
        }

        setSeats(newSeats);
    };

    return (
        <div className="absolute z-20 w-full h-full min-h-screen bg-[#121212] flex items-center justify-center p-4 overflow-auto">
            {/* Container ViewPort - Có thể thêm logic zoom/pan ở đây nếu cần */}
            <div className="transform scale-100 origin-center transition-transform duration-300">
                <Zone
                    name="Khu vực A"
                    seats={seats}
                    onSeatClick={handleSeatClick}
                />
            </div>
        </div>
    );
};

export default ViewPort;
