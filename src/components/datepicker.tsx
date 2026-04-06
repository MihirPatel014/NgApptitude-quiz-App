import React from "react";

interface CommonDatePickerProps {
  id: string;
  name: string;
  label?: string;
  value: Date | string;
  onChange: (date: Date) => void;
  error?: string;
  min?: string;
  max?: string;
}

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  min,
  max,
}) => {

  const formattedValue =
  value instanceof Date && !isNaN(value.getTime())
    ? value.toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type="date"
        id={id}
        name={name}
        value={formattedValue}
        min={min}
        max={max}
        onChange={(e) => {
            if (!e.target.value) {
              onChange(new Date("")); 
              return;
            }
            onChange(new Date(e.target.value));
          }}
        className="px-3 py-2 w-full rounded-md border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default CommonDatePicker;
