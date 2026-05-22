import { useState } from 'react';
import { X } from 'lucide-react';

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, rows: number, cols: number) => void;
}

export function AddZoneModal({ isOpen, onClose, onAdd }: AddZoneModalProps) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState('');
  const [cols, setCols] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name || !rows || !cols) return;
    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    if (r <= 0 || c <= 0) return;
    
    onAdd(name, r, c);
    
    setName('');
    setRows('');
    setCols('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2a2a2a] w-[480px] p-6 rounded-xl relative shadow-2xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white"
        >
          <X size={28} />
        </button>
        <h2 className="text-[28px] font-bold mb-6 text-center text-white">Thêm khu vực</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[20px] font-bold text-white mb-1">Tên khu vực</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên khu vực"
              className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[20px] font-bold text-white mb-1">Số hàng</label>
              <input
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={e => setRows(e.target.value)}
                placeholder="Nhập số hàng"
                className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[20px] font-bold text-white mb-1">Số cột</label>
              <input
                type="number"
                min={1}
                max={50}
                value={cols}
                onChange={e => setCols(e.target.value)}
                placeholder="Nhập số cột"
                className="w-full bg-[#383838] rounded-lg px-4 py-2 text-white font-bold text-[16px] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 bg-[#0090FF] hover:bg-blue-600 text-white font-bold py-2 rounded-full px-8 mx-auto block transition-colors"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
