"use client";

import { useState } from "react";

interface PasswordFieldProps {
  name: string;
  placeholder: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function PasswordField({ name, placeholder, disabled, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy-400 pointer-events-none">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
      <input
        className="input pr-10 pl-20 border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 w-full"
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        required
        disabled={disabled}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          setVisible((current) => !current);
        }}
        className="absolute inset-y-1 left-1 px-3 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors disabled:text-slate-400"
        disabled={disabled}
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={visible}
      >
        {visible ? "إخفاء" : "إظهار"}
      </button>
    </div>
  );
}
