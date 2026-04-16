import { useState, useMemo, useEffect, useCallback } from 'react';
import { getDaysInMonth, isValid } from 'date-fns';

export interface DateRangeState {
  year: number;
  month: number;
  day: number;
}

interface UseSingleDateProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function useSingleDate({
  initialDate = new Date(),
  onDateChange,
}: UseSingleDateProps) {
  const [dateState, setDateState] = useState<DateRangeState>({
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
    day: initialDate.getDate(),
  });

  // Generate Years
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    // For registration, we might want a range covering school students and adults
    return Array.from({ length: 101 }, (_, i) => {
      const year = currentYear - 80 + i; // Back to 80 years ago
      return { label: year.toString(), value: year };
    });
  }, []);

  // Generate Months
  const months = useMemo(() => [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Apr', value: 3 },
    { label: 'May', value: 4 },
    { label: 'Jun', value: 5 },
    { label: 'Jul', value: 6 },
    { label: 'Aug', value: 7 },
    { label: 'Sep', value: 8 },
    { label: 'Oct', value: 9 },
    { label: 'Nov', value: 10 },
    { label: 'Dec', value: 11 },
  ], []);

  // Helper to get days for a specific month/year
  const days = useMemo(() => {
    const daysCount = getDaysInMonth(new Date(dateState.year, dateState.month));
    return Array.from({ length: daysCount }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
    }));
  }, [dateState.year, dateState.month]);

  // Sync days if they exceed the current month's limit
  useEffect(() => {
    const maxDays = getDaysInMonth(new Date(dateState.year, dateState.month));
    if (dateState.day > maxDays) {
      setDateState(prev => ({ ...prev, day: maxDays }));
    }
  }, [dateState.year, dateState.month, dateState.day]);

  // Callback
  useEffect(() => {
    const date = new Date(dateState.year, dateState.month, dateState.day);
    if (isValid(date) && onDateChange) {
      onDateChange(date);
    }
  }, [dateState.year, dateState.month, dateState.day, onDateChange]);

  const updateDate = useCallback((key: keyof DateRangeState, value: number) => {
    setDateState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setDate = useCallback((date: Date) => {
    setDateState({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    });
  }, []);

  return {
    dateState,
    years,
    months,
    days,
    updateDate,
    setDate,
  };
}
