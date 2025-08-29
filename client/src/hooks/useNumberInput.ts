import { useState, useCallback } from 'react';

interface UseNumberInputProps {
  value: number | string;
  onChange: (value: number) => void;
  formatOnBlur?: boolean;
}

export const useNumberInput = ({ value, onChange, formatOnBlur = true }: UseNumberInputProps) => {
  const [displayValue, setDisplayValue] = useState(() => {
    const numValue = Number(value);
    return isNaN(numValue) ? '' : String(numValue);
  });

  const handleChange = useCallback((inputValue: string) => {
    // Remove commas for processing
    const cleanValue = inputValue.replace(/,/g, '');
    
    // Allow empty string, numbers, and decimal point
    if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
      setDisplayValue(inputValue);
      
      // Update the actual value
      const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue);
      onChange(numericValue);
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (formatOnBlur) {
      const numValue = parseFloat(displayValue.replace(/,/g, '')) || 0;
      const formatted = numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setDisplayValue(formatted);
    }
  }, [displayValue, formatOnBlur]);

  const handleFocus = useCallback(() => {
    // Remove formatting when focusing to allow easy editing
    const numValue = parseFloat(displayValue.replace(/,/g, '')) || 0;
    setDisplayValue(String(numValue));
  }, [displayValue]);

  return {
    displayValue,
    handleChange,
    handleBlur,
    handleFocus
  };
};