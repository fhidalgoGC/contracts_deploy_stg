import React, { forwardRef } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

const countries: CountryOption[] = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
];

export interface PhoneInputProps {
  callingCode: string;
  phoneNumber: string;
  onCallingCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ 
    callingCode, 
    phoneNumber, 
    onCallingCodeChange, 
    onPhoneNumberChange, 
    className, 
    placeholder = "1234567890",
    disabled = false,
    error = false,
    ...props 
  }, ref) => {
    const selectedCountry = countries.find(c => c.code === callingCode);

    return (
      <div 
        ref={ref}
        className={cn(
          "relative flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200",
          error && "border-red-500 dark:border-red-500 focus-within:ring-red-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {/* Country Code Selector */}
        <div className="relative">
          <select
            value={callingCode}
            onChange={(e) => onCallingCodeChange(e.target.value)}
            disabled={disabled}
            className="appearance-none h-full px-3 pr-8 bg-transparent border-0 border-r border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-0 text-sm font-medium text-gray-900 dark:text-white rounded-l-lg cursor-pointer"
            style={{ minWidth: '80px' }}
          >
            <option value="" disabled className="text-gray-500">
              Country
            </option>
            {countries.map((country) => (
              <option key={country.code} value={country.code} className="bg-white dark:bg-gray-700">
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={15}
            className="w-full h-full px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-r-lg"
          />
          {!phoneNumber && !callingCode && (
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };