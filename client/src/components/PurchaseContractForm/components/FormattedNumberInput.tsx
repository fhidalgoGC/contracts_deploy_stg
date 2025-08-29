import React from 'react';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';

interface FormattedNumberInputProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function FormattedNumberInput({ 
  value, 
  onChange, 
  placeholder = "0.00", 
  className = "", 
  error = false 
}: FormattedNumberInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => {
    if (value && value !== 0) {
      return formatNumber({
        minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
        maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
        value: value,
        formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
        roundMode: NUMBER_FORMAT_CONFIG.roundMode
      });
    }
    return '';
  });
  
  const [isFocused, setIsFocused] = React.useState(false);

  // Update display value when field value changes externally
  React.useEffect(() => {
    if (!isFocused) {
      if (value && value !== 0) {
        setDisplayValue(formatNumber({
          minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
          maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
          value: value,
          formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
          roundMode: NUMBER_FORMAT_CONFIG.roundMode
        }));
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isFocused]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={() => {
        setIsFocused(true);
        // Show raw number when focused for easier editing
        if (value && value !== 0) {
          setDisplayValue(value.toString());
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        if (displayValue && !isNaN(parseFloat(displayValue.replace(/,/g, '')))) {
          const numericValue = parseFloat(displayValue.replace(/,/g, ''));
          onChange(numericValue);
          setDisplayValue(formatNumber({
            minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
            maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
            value: numericValue,
            formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
            roundMode: NUMBER_FORMAT_CONFIG.roundMode
          }));
        }
      }}
      onChange={(e) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);
        
        if (inputValue === '') {
          onChange(0);
          return;
        }
        
        const numericValue = parseFloat(inputValue.replace(/,/g, ''));
        if (!isNaN(numericValue)) {
          onChange(numericValue);
        }
      }}
      onKeyDown={(e) => {
        const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
        if (!allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      }}
      className={`h-10 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'} ${className}`}
      placeholder={placeholder}
      style={{
        MozAppearance: 'textfield'
      }}
    />
  );
}