import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search name or employee ID...",
  className = "w-[300px]"
}: SearchBarProps) {
  return (
    <div className={`relative ${className} group`}>
      <Search 
        size={18} 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[46px] pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}