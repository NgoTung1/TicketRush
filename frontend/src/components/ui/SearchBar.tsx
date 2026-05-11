import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Submit handler */
  onSubmit?: (value: string) => void;
  /** Additional CSS classes on the outer wrapper */
  className?: string;
  /** HTML id */
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

  // support both controlled & uncontrolled
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
        bg-tr-search rounded-lg overflow-hidden
        border transition-all duration-200
        ${isFocused ? 'border-tr-accent/50 ring-1 ring-tr-accent/20' : 'border-transparent'}
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
          w-full bg-transparent text-sm text-tr-text
          placeholder-tr-text-muted
          px-3 py-2 outline-none
        "
      />
    </form>
  );
};

export default SearchBar;
