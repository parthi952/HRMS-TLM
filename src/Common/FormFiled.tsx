import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputTheme } from "../Themes/ComponentsThems/InputTheme";

type FormProps = {
  Lable?: string;
  in_PlaceHolder: string;
  value: string | number;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  PrivacyInput?: boolean;
  disabled?: boolean;
  type?: string;
  error?: string;
  required?: boolean;
  onBlur?: () => void;
};

export const FormFiled = ({
  Lable,
  icon,
  name,
  value,
  onChange,
  in_PlaceHolder,
  PrivacyInput,
  disabled,
  type = "text",
  error,
  required,
  onBlur,
}: FormProps) => {
  const [showValue, setShowValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputType = PrivacyInput && !showValue ? "password" : type;

  return (
    <div className="w-full flex flex-col">
      {Lable && (
        <label
          className={`${inputTheme.label} ${isFocused ? 'text-primary' : ''} ${error ? 'text-rose-500' : ''}`}
          htmlFor={name}
        >
          {Lable}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className={`absolute left-3.5 text-slate-400 transition-colors ${isFocused ? 'text-primary' : ''}`}>
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={in_PlaceHolder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          className={`${inputTheme.base} ${icon ? 'pl-10' : ''} ${PrivacyInput ? 'pr-10' : ''} ${error ? inputTheme.error : ''}`}
        />

        {PrivacyInput && (
          <button
            type="button"
            className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-primary transition-all"
            onClick={() => setShowValue(!showValue)}
          >
            {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[10px] font-bold text-rose-500 mt-1.5 px-1 uppercase tracking-wider">
          {error}
        </span>
      )}
    </div>
  );
};
