import React from 'react';
import DateIcon from '@/assets/images/Date.svg';
import FilterIcon from '@/assets/images/Filter.svg';

interface EventInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'datetime-local';
  options?: { value: string; label: string }[] | string[];
}

const EventInput: React.FC<EventInputProps> = ({ label, type = 'text', options, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-2 mb-5 ${className || ''}`}>
      <label className="text-white font-bold text-[20px]">{label}</label>

      {type === 'textarea' ? (
        <textarea
          className="bg-[#383838] text-[#868686] text-[16px] font-bold px-4 py-3 rounded-xl border border-transparent focus:border-white/20 outline-none w-full min-h-[100px] placeholder-gray-500 transition-colors"
          {...(props as any)}
        />

      ) : type === 'select' ? (
        <div className="relative w-full sm:w-1/3 lg:w-1/4">
          <img
            src={FilterIcon}
            alt=""
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain pointer-events-none z-10"
          />
          <select
            className={`bg-[#383838] ${props.value ? 'text-[#868686]' : 'text-gray-500'} text-[16px] font-bold pl-9 pr-8 py-3 rounded-xl border border-transparent focus:border-white/20 outline-none w-full appearance-none transition-colors cursor-pointer`}
            defaultValue=""
            {...(props as any)}
          >
            <option value="" disabled className="text-gray-500 bg-[#383838]">{props.placeholder}</option>
            {options?.map(opt => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return <option key={val} value={val} className="text-white bg-[#383838]">{lbl}</option>;
            })}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#868686]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

      ) : type === 'date' || type === 'datetime-local' ? (
        <div className="relative w-full sm:w-1/2 lg:w-1/3">
          <img
            src={DateIcon}
            alt=""
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain pointer-events-none z-10"
          />
          <input
            type={type}
            className={`bg-[#383838] ${props.value ? 'text-[#868686]' : 'text-transparent'} text-[16px] font-bold pl-9 pr-8 py-3 rounded-xl border border-transparent focus:border-white/20 outline-none w-full transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            {...(props as any)}
          />
          {!props.value && (
            <div className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-500 text-[16px] font-bold pointer-events-none">
              Chọn mốc thời gian
            </div>
          )}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

      ) : (
        <div className="relative w-full">
          <input
            type={type}
            className="bg-[#383838] text-[#868686] text-[16px] font-bold px-4 py-3 rounded-xl border border-transparent focus:border-white/20 outline-none w-full placeholder-gray-500 transition-colors"
            {...(props as any)}
          />
        </div>
      )}
    </div>
  );
};

export default EventInput;

