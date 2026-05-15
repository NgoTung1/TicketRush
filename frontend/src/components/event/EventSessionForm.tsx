import React from 'react';
import DateIcon from '@/assets/images/Date.svg';

export interface SessionFormData {
  name: string;
  startAt: string; // ISO datetime-local string
  endAt: string;
}

interface SessionProps {
  index: number;
  data: SessionFormData;
  onChange: (data: SessionFormData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const inputCls =
  'bg-black/20 text-white text-[12px] font-bold px-3 py-1.5 rounded-md border border-transparent focus:border-white/20 outline-none placeholder-white/40 transition-colors w-full';

const EventSessionForm: React.FC<SessionProps> = ({ index, data, onChange, onRemove, canRemove }) => {
  const handle = (field: keyof SessionFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="bg-[#383838] rounded-lg p-3 mb-2 shadow-sm">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-white font-bold text-[16px]">Phiên sự kiện {index}:</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[12px] font-bold text-white bg-[#FF0000] hover:bg-red-700 px-3 py-1 rounded-2xl transition-colors"
          >
            Xóa
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Tên phiên */}
        <div className="flex items-center gap-3">
          <label className="text-white text-[14px] font-bold w-24 shrink-0">Tên phiên:</label>
          <div className="flex-1">
            <input
              type="text"
              value={data.name}
              onChange={handle('name')}
              placeholder="Nhập tên sự kiện"
              className={inputCls}
            />
          </div>
        </div>

        {/* Bắt đầu lúc */}
        <div className="flex items-center gap-3">
          <label className="text-white text-[14px] font-bold w-24 shrink-0">Bắt đầu lúc:</label>
          <div className="flex-1 sm:max-w-[220px] relative">
            <img
              src={DateIcon}
              alt=""
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 object-contain pointer-events-none z-10"
            />
            <input
              type="datetime-local"
              value={data.startAt}
              onChange={handle('startAt')}
              className={`${inputCls} pl-8 pr-8 ${data.startAt ? '' : 'text-transparent'} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            />
            {!data.startAt && (
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 text-[12px] font-bold pointer-events-none">
                Chọn mốc thời gian
              </div>
            )}
            {/* Chevron bên phải */}
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
              <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kết thúc lúc */}
        <div className="flex items-center gap-3">
          <label className="text-white text-[14px] font-bold w-24 shrink-0">Kết thúc lúc:</label>
          <div className="flex-1 sm:max-w-[220px] relative">
             <img
              src={DateIcon}
              alt=""
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 object-contain pointer-events-none z-10"
            />
            <input
              type="datetime-local"
              value={data.endAt}
              onChange={handle('endAt')}
              className={`${inputCls} pl-8 pr-8 ${data.endAt ? '' : 'text-transparent'} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            />
            {!data.endAt && (
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 text-[12px] font-bold pointer-events-none">
                Chọn mốc thời gian
              </div>
            )}
            {/* Chevron bên phải */}
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
              <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSessionForm;