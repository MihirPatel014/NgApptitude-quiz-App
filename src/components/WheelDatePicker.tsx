import React, { useState, useRef, useEffect } from 'react';
import { WheelPicker } from '@ncdai/react-wheel-picker';
import { Calendar, X } from 'lucide-react';
import '@ncdai/react-wheel-picker/style.css';
import { useSingleDate } from '../hooks/useSingleDate';

interface WheelDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  id?: string;
  className?: string;
}

export const WheelDatePicker: React.FC<WheelDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select Date",
  error,
  id,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date>(value || new Date());

  const {
    dateState,
    months,
    days,
    years,
    updateDate,
    setDate,
  } = useSingleDate({
    initialDate: internalDate,
    onDateChange: setInternalDate // Only update local state on scroll
  });

  const handleSetDate = () => {
    onChange(internalDate); // Commit to main form
    setIsOpen(false);
  };

  const popupRef = useRef<HTMLDivElement>(null);
  const lastSyncedValue = useRef<number>(value?.getTime() || 0);

  // Sync state ONLY if value prop changes externally (e.g., from parent form reset)
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      if (value.getTime() !== lastSyncedValue.current) {
        lastSyncedValue.current = value.getTime();
        setDate(value);
        setInternalDate(value);
      }
    }
  }, [value, setDate]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const pickerStyle = {
    optionItemHeight: 45,
    visibleCount: 16,
    dragSensitivity: 1.8,
    scrollSensitivity: 1.8,
  };

  const formattedValue = value instanceof Date && !isNaN(value.getTime())
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  return (
    <div className={`relative space-y-2 ${className}`}>
      {/* Visual overrides for high-performance CSS animations */}
      <style>{`
        .wheel-picker-container {
          background: transparent !important;
        }
        .wheel-picker-item {
          font-family: inherit !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #94a3b8 !important;
          opacity: 0.3;
          transition: all 0.2s ease !important;
          height: 45px !important;
          line-height: 45px !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        /* Target the specific <li> identified by the user */
        li[data-rwp-highlight-item="true"],
        .wheel-picker-item-selected {
          color: #0d121f !important;
          font-weight: 400 !important;
          font-size: 14px !important;
          opacity: 1 !important;
          background-color: rgba(239, 246, 255, 0.3) !important;
        }
        .wheel-picker-column {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }

        /* Lightning fast CSS animations */
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.15s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.15s ease forwards;
        }
      `}</style>

      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 block ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-xl cursor-pointer flex items-center justify-between
            transition-all duration-200 outline-none
            ${isOpen ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-gray-300 hover:border-gray-400 shadow-sm'}
            ${error ? 'border-red-500 ring-red-200 shadow-none' : ''}
          `}
        >
          <span className={formattedValue ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {formattedValue || placeholder}
          </span>
          <Calendar className={`w-4 h-4 ${isOpen ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>

        {isOpen && (
          <>
            {/* Overlay for mobile */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998] md:hidden animate-fade-in"
              onClick={() => setIsOpen(false)}
            />

            <div
              ref={popupRef}
              className="absolute z-[999] left-0 mt-3 w-full md:w-[340px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-6 animate-slide-up"
            >
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-900/60 leading-none">{label || 'Select Date'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative bg-[#f8fafc] rounded-[2.5rem] overflow-hidden border border-gray-100 h-[225px]">
                <div className="relative flex w-full h-full justify-center px-4">
                  <WheelPicker
                    options={days}
                    value={dateState.day}
                    onValueChange={(val: any) => updateDate('day', val)}
                    infinite={true}
                    {...pickerStyle}
                  />
                  <WheelPicker
                    options={months}
                    value={dateState.month}
                    onValueChange={(val: any) => updateDate('month', val)}
                    infinite={true}
                    {...pickerStyle}
                  />
                  <WheelPicker
                    options={years}
                    value={dateState.year}
                    onValueChange={(val: any) => updateDate('year', val)}
                    infinite={true}
                    {...pickerStyle}
                  />

                  {/* Pro Centered Overlay - Matches Library Inner Math Exactly */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-[45px] border-y  text-[14px] border-blue-100/60 bg-blue-50/30" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSetDate}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-normal text-[14px] tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1.5 ml-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
