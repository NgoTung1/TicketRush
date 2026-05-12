import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  id?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Tìm kiếm sự kiện...',
  value,
  onChange,
  onSubmit,
  className = '',
  id,
}) => {
  const [internal, setInternal] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const query = value !== undefined ? value : internal;
  const setQuery = (v: string) => {
    if (onChange) onChange(v);
    else setInternal(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSubmit) onSubmit(query.trim());
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`
        flex items-center
        bg-[1C1C1C] rounded-sm overflow-hidden
        border border-[#7B7B7B] transition-all duration-200
        ${className}
      `}
    >
      <span className="pl-3 text-tr-text-muted shrink-0">
        <Search size={16} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="
          w-full bg-transparent text-[14px] text-tr-text
          placeholder-tr-text-muted
          px-3 py-1 outline-none
        "
      />
    </form>
  );
};

export default SearchBar;
