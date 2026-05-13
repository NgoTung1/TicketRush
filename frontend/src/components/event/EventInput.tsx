import React from 'react';

interface EventInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date';
  options?: string[];
}

const EventInput: React.FC<EventInputProps> = ({ label, type = 'text', options, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-2 mb-5 ${className || ''}`}>
      <label className="text-white font-bold text-[15px]">{label}</label>
      {type === 'textarea' ? (
        <textarea 
          className="bg-[#2a2a2a] text-white text-sm px-4 py-3 rounded-md border border-transparent focus:border-white/20 outline-none w-full min-h-[100px] placeholder-gray-500 transition-colors"
          {...(props as any)}
        />
      ) : type === 'select' ? (
        <div className="relative w-full sm:w-1/3 lg:w-1/4">
          <select 
            className="bg-[#2a2a2a] text-white text-sm px-4 py-3 rounded-md border border-transparent focus:border-white/20 outline-none w-full appearance-none placeholder-gray-500 transition-colors cursor-pointer"
            defaultValue=""
            {...(props as any)}
          >
            <option value="" disabled>{props.placeholder}</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <input 
            type={type}
            className={`bg-[#2a2a2a] text-white text-sm px-4 py-3 rounded-md border border-transparent focus:border-white/20 outline-none placeholder-gray-500 transition-colors ${type === 'date' ? 'w-full sm:w-1/3 lg:w-1/4' : 'w-full'}`}
            {...(props as any)}
          />
        </div>
      )}
    </div>
  );
};

export default EventInput;
