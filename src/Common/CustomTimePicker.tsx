import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronDown } from "lucide-react";
import { inputTheme } from "../Themes/ComponentsThems/InputTheme";

type TimePickerProps = {
  label?: string;
  name: string;
  value: string; // HH:mm format
  onChange: (e: { target: { name: string; value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
};

export const CustomTimePicker = ({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value or default to 09:00
  const [hours, minutes] = (value || "09:00").split(":");
  const hNum = parseInt(hours) || 9;
  const mNum = parseInt(minutes) || 0;

  const displayHours = hNum > 12 ? hNum - 12 : hNum === 0 ? 12 : hNum;
  const ampm = hNum >= 12 ? "PM" : "AM";

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const el = dropdownRef.current;
    const dropdownWidth = 320;
    
    // Check if it would overflow the right side
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) {
      left = rect.right - dropdownWidth;
    }
    
    // Check if it would overflow the left side (rare but possible)
    if (left < 0) left = 16;

    el.style.top = `${rect.bottom + 12}px`;
    el.style.left = `${left}px`;
    el.style.width = `${dropdownWidth}px`;
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const setTime = (h: number, m: number, p: string) => {
    let finalH = h;
    if (p === "PM" && h < 12) finalH += 12;
    if (p === "AM" && h === 12) finalH = 0;
    
    const formattedH = String(finalH).padStart(2, "0");
    const formattedM = String(m).padStart(2, "0");
    onChange({ target: { name, value: `${formattedH}:${formattedM}` } });
  };

  const dropdown = createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden transition-all duration-300 ease-out ${
        open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
      }`}
      style={{
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Clock In</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
              <span className="text-sm font-black text-primary font-mono tabular-nums">
                {String(displayHours).padStart(2, "0")}:{String(mNum).padStart(2, "0")} <span className="text-[9px] uppercase ml-0.5">{ampm}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 h-[140px]">
          {/* Hours */}
          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar p-0.5">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center mb-1.5">Hr</p>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <button
                key={h}
                onClick={() => setTime(h, mNum, ampm)}
                className={`flex items-center justify-center min-h-[28px] rounded-lg text-[12px] font-bold transition-all ${
                  displayHours === h 
                    ? "bg-primary text-white shadow-md shadow-primary/30" 
                    : "hover:bg-primary/5 text-slate-600"
                }`}
              >
                {String(h).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Minutes */}
          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar p-0.5 border-x border-slate-50">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center mb-1.5">Min</p>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <button
                key={m}
                onClick={() => setTime(displayHours, m, ampm)}
                className={`flex items-center justify-center min-h-[28px] rounded-lg text-[12px] font-bold transition-all ${
                  mNum === m 
                    ? "bg-primary text-white shadow-md shadow-primary/30" 
                    : "hover:bg-primary/5 text-slate-600"
                }`}
              >
                {String(m).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* AM/PM */}
          <div className="w-[60px] flex flex-col gap-1.5 p-0.5 justify-center">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                onClick={() => setTime(displayHours, mNum, p)}
                className={`h-9 flex items-center justify-center rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  ampm === p 
                    ? "bg-primary text-white shadow-md shadow-primary/30" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
,
    document.body
  );

  return (
    <div className="w-full">
      {label && (
        <label className={`${inputTheme.label} ${focused || open ? "text-primary" : ""}`}>
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={triggerRef}
        className={`${inputTheme.select.trigger} ${open ? "border-primary ring-4 ring-primary/10 shadow-sm" : "hover:border-slate-500"} transition-all cursor-pointer group relative`}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setFocused(true);
          }
        }}
      >
        <Clock 
          size={16} 
          className={`mr-3 transition-colors duration-300 ${open ? "text-primary scale-110" : "text-slate-400"}`} 
        />
        <span className={`flex-1 text-sm font-bold ${!value ? "text-slate-300" : "text-slate-900"}`}>
          {value ? `${String(displayHours).padStart(2, "0")}:${String(mNum).padStart(2, "0")} ${ampm}` : "Select time…"}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} 
        />
      </div>

      {dropdown}
    </div>
  );
};
