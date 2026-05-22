import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PRESET_COLORS = [
  '#b0b0b0', '#ff5757', '#ffe359', '#8e3a3a', '#2a0808', '#00e676', '#0d6132',
  '#2979ff', '#152e66', '#d500f9', '#7b1fa2', '#ff6d00', '#5d4037', '#1de9b6',
  '#00e5ff', '#ff1744', '#c6ff00', '#ffea00'
];

interface SeatTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, price: number, color: string) => void;
  initialData: { label: string, price: number, color: string } | null;
}

export function SeatTypeModal({ isOpen, onClose, onSave, initialData }: SeatTypeModalProps) {
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLabel(initialData.label);
        setPrice(initialData.price.toString());
        setColor(initialData.color);
      } else {
        setLabel('');
        setPrice('');
        setColor(PRESET_COLORS[0]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!label || !price || !color) return;
    const p = parseInt(price.toString(), 10);
    if (isNaN(p) || p < 0) return;
    onSave(label, p, color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-[480px] rounded-2xl p-6 relative shadow-2xl border border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X size={28} />
        </button>
        <h2 className="text-[28px] font-bold mb-6 text-center text-white">
          {initialData ? 'Chỉnh sửa loại ghế' : 'Thêm loại ghế'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[20px] font-bold text-white mb-1">Tên loại ghế</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Nhập tên loại ghế"
              className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[20px] font-bold text-white mb-1">Giá tiền (đ)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Nhập giá tiền"
              className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[20px] font-bold text-white mb-1">Màu đại diện</label>
            <div className="grid grid-cols-10 gap-2">
              {PRESET_COLORS.map(c => {
                const isSelected = color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg transition-all relative ${isSelected
                        ? 'ring-2 ring-[#0066ff] scale-110 border border-white'
                        : 'hover:scale-105 border border-transparent'
                      }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                );
              })}
              {/* Custom color picker */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                <input
                  type="color"
                  value={PRESET_COLORS.includes(color.toLowerCase()) ? '#ffffff' : color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Chọn màu khác"
                />
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-500 hover:border-white transition-colors ${!PRESET_COLORS.includes(color.toLowerCase())
                      ? 'ring-2 ring-[#0066ff] scale-110 border-solid border-white'
                      : ''
                    }`}
                  style={!PRESET_COLORS.includes(color.toLowerCase()) ? { backgroundColor: color } : {}}
                >
                  <span className="text-xs font-bold text-gray-400 hover:text-white">+</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-4 bg-[#0090FF] hover:bg-blue-600 text-white font-bold py-2 rounded-full px-12 mx-auto block transition-colors"
          >
            {initialData ? 'Lưu thay đổi' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}
