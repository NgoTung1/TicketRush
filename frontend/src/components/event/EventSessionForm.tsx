import React from 'react';

interface SessionProps {
  index: number;
  onRemove: () => void;
}

const EventSessionForm: React.FC<SessionProps> = ({ index, onRemove }) => {
  return (
    <div className="bg-[#2a2a2a] rounded-lg overflow-hidden mb-4 border border-white/5 shadow-sm">
      <div className="bg-[#333] px-4 py-2.5 flex justify-between items-center border-b border-white/5">
        <h4 className="text-white font-bold text-[13px]">Phiên sự kiện {index}</h4>
        <button 
          onClick={onRemove} 
          className="text-[11px] font-bold text-white bg-[#e53935] hover:bg-red-700 px-3 py-1 rounded transition-colors"
        >
          Xóa
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
           <label className="text-gray-300 text-[13px] font-medium w-24 shrink-0">Thời gian:</label>
           <input 
             type="text" 
             placeholder="Nhập khung thời gian..." 
             className="flex-1 bg-[#1a1a1a] text-white text-[13px] px-3 py-2.5 rounded border border-transparent focus:border-white/20 outline-none placeholder-gray-500 transition-colors" 
           />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
           <label className="text-gray-300 text-[13px] font-medium w-24 shrink-0">Ngày diễn ra:</label>
           <div className="flex-1 flex">
             <input 
               type="text" 
               placeholder="Chọn ngày diễn ra..." 
               className="bg-[#1a1a1a] text-white text-[13px] px-3 py-2.5 rounded border border-transparent focus:border-white/20 outline-none w-full sm:w-auto placeholder-gray-500 transition-colors" 
             />
           </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
           <label className="text-gray-300 text-[13px] font-medium w-24 shrink-0">Giá vé:</label>
           <input 
             type="text" 
             placeholder="Nhập mức giá..." 
             className="flex-1 bg-[#1a1a1a] text-white text-[13px] px-3 py-2.5 rounded border border-transparent focus:border-white/20 outline-none placeholder-gray-500 transition-colors" 
           />
        </div>
      </div>
    </div>
  );
};

export default EventSessionForm;
