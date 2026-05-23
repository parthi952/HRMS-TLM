import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getYear, getMonth } from "date-fns";
import { Selection } from "./Selection";
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { inputTheme } from "../Themes/ComponentsThems/InputTheme";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

interface CustomDatePickerProps {
  name: string; 
  value: string; 
  Lable?: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  border?: boolean;
  iconOnly?: boolean;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

function ensurePortalRoot() {
  const id = "cdp-portal-root";
  if (document.getElementById(id)) return;
  const el = document.createElement("div");
  el.id = id;
  document.body.appendChild(el);
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  name, 
  value, 
  Lable, 
  onChange, 
  iconOnly = false,
  required = false,
  error,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;
  const years = range(1950, getYear(new Date()) + 10);

  useEffect(() => { ensurePortalRoot(); }, []);

  return (
    <div className={`w-full ${iconOnly ? 'w-auto' : ''}`}>
      <style>{`
        .cdp-portal { z-index: 9999 !important; }
        .cdp-portal .react-datepicker {
          font-family: 'Inter', sans-serif !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(var(--primary-hsl), 0.1) !important;
          border-radius: 28px !important;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.02) !important;
          padding: 12px;
          animation: cdp-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cdp-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cdp-portal .react-datepicker__header {
          background: transparent !important;
          border-bottom: none !important;
          padding: 0 !important;
        }
        .cdp-portal .react-datepicker__day-names {
          margin-top: 8px;
          margin-bottom: 2px;
        }
        .cdp-portal .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 800 !important;
          font-size: 9px !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          width: 32px;
          line-height: 32px;
        }
        .cdp-portal .react-datepicker__day {
          width: 32px;
          line-height: 32px;
          margin: 1px;
          border-radius: 10px !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #334155 !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cdp-portal .react-datepicker__day:hover {
          background-color: rgba(var(--primary-hsl), 0.08) !important;
          color: var(--primary-color) !important;
          transform: translateY(-1px);
        }
        .cdp-portal .react-datepicker__day--selected {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-color)) !important;
          color: white !important;
          box-shadow: 0 8px 16px -4px rgba(var(--primary-hsl), 0.4) !important;
        }
        .cdp-portal .react-datepicker__day--today {
          color: var(--primary-color) !important;
          position: relative;
        }
        .cdp-portal .react-datepicker__day--today::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--primary-color);
        }
        .cdp-portal .react-datepicker__day--outside-month {
          color: #cbd5e1 !important;
          opacity: 0.5;
        }
        .cdp-portal .react-datepicker__triangle {
          display: none !important;
        }
      `}</style>

      {!iconOnly && Lable && (
        <label className={`${inputTheme.label} ${isFocused ? 'text-primary' : ''} ${error ? 'text-rose-500' : ''}`}>
          {Lable}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {!iconOnly && (
          <CalendarIcon 
            size={16} 
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10 ${isFocused ? 'text-primary' : 'text-slate-400'} ${error ? 'text-rose-500' : ''}`} 
          />
        )}

        <DatePicker
          selected={value ? new Date(value + "T00:00:00") : null}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date..."
          onCalendarOpen={() => setIsFocused(true)}
          onCalendarClose={() => setIsFocused(false)}
          portalId="cdp-portal-root"
          popperClassName="cdp-portal"
          popperPlacement={iconOnly ? "bottom-end" : "bottom-start"}
          autoComplete="off"
          disabled={disabled}
          className={`${iconOnly ? 'w-10 h-10 p-0 text-transparent bg-primary/5 hover:bg-primary/10 border-primary/20' : `${inputTheme.base} pl-11`} ${error ? inputTheme.error : ''} ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''} transition-all cursor-pointer`}
          onChange={(date: Date | null) => {
            if (!date) return onChange({ target: { name, value: "" } });
            const y = date.getFullYear();
            const mo = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            onChange({ target: { name, value: `${y}-${mo}-${d}` } });
          }}
          renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
            <div className="flex flex-col gap-3 px-1 pt-1 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 tracking-tight">
                      {MONTHS[getMonth(date)]} {getYear(date)}
                    </span>
                    <Sparkles size={12} className="text-primary animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button 
                    className="p-1.5 rounded-lg hover:bg-white hover:text-primary text-slate-400 transition-all disabled:opacity-20 shadow-sm" 
                    onClick={decreaseMonth} 
                    disabled={prevMonthButtonDisabled} 
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    className="p-1.5 rounded-lg hover:bg-white hover:text-primary text-slate-400 transition-all disabled:opacity-20 shadow-sm" 
                    onClick={increaseMonth} 
                    disabled={nextMonthButtonDisabled} 
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Selection
                    name="month"
                    value={getMonth(date)}
                    compact={true}
                    usePortal={false}
                    options={MONTHS.map((m, i) => ({ label: m, value: i }))}
                    onChange={(e) => changeMonth(Number(e.target.value))}
                  />
                </div>
                <div className="w-[85px]">
                  <Selection
                    name="year"
                    value={getYear(date)}
                    compact={true}
                    usePortal={false}
                    options={years.map((y) => ({ label: String(y), value: y }))}
                    onChange={(e) => changeYear(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        />

        {iconOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-primary">
            <CalendarIcon size={18} />
          </div>
        )}

        {hasValue && !iconOnly && !disabled && (
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all z-10"
            onClick={() => onChange({ target: { name, value: "" } })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && !iconOnly && (
        <span className="text-[10px] font-bold text-rose-500 mt-1.5 px-1 uppercase tracking-wider block">
          {error}
        </span>
      )}
    </div>
  );
};