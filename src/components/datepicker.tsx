import React, { useState } from "react";
import Datepicker from "tailwind-datepicker-react";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
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
  const [show, setShow] = useState<boolean>(false);

  const handleChange = (selectedDate: Date) => {
    onChange(selectedDate);
  };

  const handleClose = (state: boolean) => {
    setShow(state);
  };

  const options = {
    title: label || "Select Date",
    autoHide: true,
    todayBtn: false,
    clearBtn: true,
    clearBtnText: "Clear",
    maxDate: max ? new Date(max) : new Date("2020-01-01"),
    minDate: min ? new Date(min) : new Date("1995-01-01"),
    theme: {
      background: "bg-white dark:bg-gray-800",
      todayBtn: "",
      clearBtn: "",
      icons: "",
      text: "",
      disabledText: "bg-grey-100",
      input: "",
      inputIcon: "",
      selected: "",
    },
    icons: {
      prev: () => <span> <FaArrowLeft/> </span>,
      next: () => <span><FaArrowRight /></span>,
    },
    datepickerClassNames: "top-12",
    defaultDate: typeof value === "string" ? new Date(value) : (value as Date),
    language: "en",
    disabledDates: [],
    weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    inputNameProp: name,
    inputIdProp: id,
    inputPlaceholderProp: label || "Select Date",
    inputDateFormatProp: {
      day: "numeric",
      month: "long",
      year: "numeric",
    } as const,

  };

  return (
    <Datepicker
      options={options}
      onChange={handleChange}
      show={show}
      setShow={handleClose}
    />
  );
};

export default CommonDatePicker;