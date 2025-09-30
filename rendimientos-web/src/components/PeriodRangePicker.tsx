import { DatePicker } from './DatePicker';

interface PeriodRangePickerProps {
  value: string; // YYYY-MM to YYYY-MM format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PeriodRangePicker({ value, onChange, placeholder = "YYYY-MM to YYYY-MM", className = "", disabled = false }: PeriodRangePickerProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      mode="range"
    />
  );
}
