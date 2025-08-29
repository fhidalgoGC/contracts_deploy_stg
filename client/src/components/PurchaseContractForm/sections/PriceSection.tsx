import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign, X } from 'lucide-react';
import type { PurchaseSaleContract, PriceSchedule } from '@/types/purchaseSaleContract.types';
import { APP_CONFIG, CURRENCY_OPTIONS, NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { formatNumber } from '@/lib/numberFormatter';

// Standardized exchange options
const EXCHANGE_OPTIONS = [
  {
    key: "chicagoBoardOfTrade",
    value: "Chicago Board of Trade",
    label: "Chicago Board of Trade"
  },
  {
    key: "kansasCityBoardOfTrade", 
    value: "Kansas City Board of Trade",
    label: "Kansas City Board of Trade"
  }
];

interface PriceSectionProps {
  addPriceSchedule: () => void;
  removePriceSchedule: (index: number) => void;
  updatePriceSchedule: (index: number, field: keyof PriceSchedule, value: any) => void;
  disabled?: boolean;
}

export function PriceSection({ 
  addPriceSchedule, 
  removePriceSchedule, 
  updatePriceSchedule,
  disabled = false
}: PriceSectionProps) {
  const { t } = useTranslation();
  const { formState: { errors }, watch, setValue, control, clearErrors } = useFormContext<PurchaseSaleContract>();
  
  const priceSchedule = watch('price_schedule') || [];
  const currentSchedule = priceSchedule[0] || {};

  // Watch para los cálculos automáticos basados en state
  const watchedBasis = watch('price_schedule.0.basis');
  const watchedFuture = watch('price_schedule.0.future_price');
  const watchedPricingType = watch('price_schedule.0.pricing_type');

  // Cálculos automáticos: price = basis + future (donde basis incluye el signo del botón +/-)
  React.useEffect(() => {
    if (watchedPricingType === 'fixed' && watchedBasis !== undefined && watchedFuture !== undefined) {
      const calculatedPrice = watchedBasis + watchedFuture;
      
      // Solo actualizar si el valor calculado es diferente al actual
      const currentPrice = watch('price_schedule.0.price');
      if (currentPrice !== calculatedPrice) {
        setValue('price_schedule.0.price', calculatedPrice, { shouldValidate: false });
      }
    }
  }, [watchedBasis, watchedFuture, watchedPricingType, setValue, watch]);



  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5" />
          {t('priceContract')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Schedule Fields */}
        <div className="space-y-6">
          {/* Pricing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('pricingType')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.pricing_type || 'fixed'}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  const currentItem = { ...updatedSchedule[0] };
                  
                  // Update pricing type
                  currentItem.pricing_type = value as 'fixed' | 'basis';
                  
                  // Initialize values based on pricing type
                  if (value === 'fixed') {
                    // For fixed: reset all fields to null for empty appearance
                    (currentItem as any).price = null;
                    (currentItem as any).basis = null;
                    (currentItem as any).future_price = null;
                  } else if (value === 'basis') {
                    // For basis: reset all fields to null for empty appearance
                    (currentItem as any).price = null;
                    (currentItem as any).basis = null;
                    (currentItem as any).future_price = null;
                  }
                  
                  updatedSchedule[0] = currentItem;
                  setValue('price_schedule', updatedSchedule);
                  clearErrors('price_schedule.0.pricing_type');
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.pricing_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="basis">Basis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Type Error Row */}
          <div className="min-h-[20px]">
            {errors.price_schedule?.[0]?.pricing_type && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].pricing_type.message}</p>
            )}
          </div>

          {/* Price Fields - Conditional rendering based on state value */}
          {watchedPricingType === 'basis' ? (
            /* Basis Type: Show only Basis field with +/- button */
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Basis <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {/* Basis Sign Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                  onClick={() => {
                    const currentPriceSchedule = watch('price_schedule') || [{}];
                    const updatedSchedule = [...currentPriceSchedule];
                    const currentItem = { ...updatedSchedule[0] };
                    const currentBasis = currentItem.basis || 0;
                    
                    // Toggle sign
                    currentItem.basis = -currentBasis;
                    
                    updatedSchedule[0] = currentItem;
                    setValue('price_schedule', updatedSchedule);
                  }}
                >
                  {(currentSchedule.basis || 0) >= 0 ? '+' : '-'}
                </Button>
                {/* Basis Input Field with Controller */}
                <Controller
                  name="price_schedule.0.basis"
                  control={control}
                  render={({ field }) => {
                    const [displayValue, setDisplayValue] = React.useState(() => {
                      if (field.value !== null && field.value !== undefined && field.value !== 0) {
                        const absValue = Math.abs(field.value);
                        return formatNumber({
                          minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
                          maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
                          value: absValue,
                          formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
                          roundMode: NUMBER_FORMAT_CONFIG.roundMode
                        });
                      }
                      return '';
                    });
                    
                    const [isFocused, setIsFocused] = React.useState(false);

                    // Sync display value only when component initializes
                    React.useEffect(() => {
                      if (field.value !== null && field.value !== undefined && field.value !== 0) {
                        setDisplayValue(Math.abs(field.value).toString());
                      }
                    }, []); // Empty dependency array - only run on mount

                    return (
                      <Input
                        key={`basis-${currentSchedule.pricing_type || 'fixed'}`}
                        type="text"
                        inputMode="decimal"
                        value={displayValue}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                          setIsFocused(false);
                          if (displayValue && !isNaN(parseFloat(displayValue))) {
                            const numericValue = parseFloat(displayValue);
                            const sign = (currentSchedule.basis || 0) >= 0 ? 1 : -1;
                            field.onChange(numericValue * sign);
                            
                            // Format the display value with proper thousands separators and decimals
                            const formatted = formatNumber({
                              minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
                              maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
                              value: numericValue,
                              formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
                              roundMode: NUMBER_FORMAT_CONFIG.roundMode
                            });
                            setDisplayValue(formatted);
                          }
                        }}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          setDisplayValue(inputValue);
                          
                          if (inputValue === '') {
                            field.onChange(0);
                            return;
                          }
                          
                          // Remove commas before parsing
                          const cleanValue = inputValue.replace(/,/g, '');
                          const numericValue = parseFloat(cleanValue);
                          if (!isNaN(numericValue)) {
                            const sign = (currentSchedule.basis || 0) >= 0 ? 1 : -1;
                            field.onChange(numericValue * sign);
                          }
                        }}
                        onKeyDown={(e) => {
                        const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`h-10 flex-1 ${errors.price_schedule?.[0]?.basis ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                      placeholder="0.00"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                    );
                  }}
                />
              </div>
              {/* Basis Error */}
              {errors.price_schedule?.[0]?.basis && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].basis.message}</p>
              )}
            </div>
          ) : (
            /* Fixed Type: Show all fields with calculations */
            <div className="space-y-4">
              {/* Basis and Futures Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basis Field with +/- Button */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Basis
                  </Label>
                  <div className="flex items-center gap-2">
                    {/* Basis Sign Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => {
                        const currentPriceSchedule = watch('price_schedule') || [{}];
                        const updatedSchedule = [...currentPriceSchedule];
                        const currentItem = { ...updatedSchedule[0] };
                        const currentBasis = currentItem.basis || 0;
                        
                        // Toggle sign
                        currentItem.basis = -currentBasis;
                        

                        
                        updatedSchedule[0] = currentItem;
                        setValue('price_schedule', updatedSchedule);
                      }}
                    >
                      {(currentSchedule.basis || 0) >= 0 ? '+' : '-'}
                    </Button>
                    {/* Basis Input Field with Controller */}
                    <Controller
                      name="price_schedule.0.basis"
                      control={control}
                      render={({ field }) => {
                        const [displayValue, setDisplayValue] = React.useState(() => {
                          if (field.value !== null && field.value !== undefined && field.value !== 0) {
                            return Math.abs(field.value).toString();
                          }
                          return '';
                        });
                        
                        const [isFocused, setIsFocused] = React.useState(false);

                        // Sync display value only when component initializes
                        React.useEffect(() => {
                          if (field.value !== null && field.value !== undefined && field.value !== 0) {
                            setDisplayValue(Math.abs(field.value).toString());
                          }
                        }, []); // Empty dependency array - only run on mount

                        return (
                          <Input
                            key={`basis-fixed-${currentSchedule.pricing_type || 'fixed'}`}
                            type="text"
                            inputMode="decimal"
                            value={displayValue}
                            onFocus={() => {
                              setIsFocused(true);
                              // Show raw number when focused for easier editing
                              if (field.value !== null && field.value !== undefined && field.value !== 0) {
                                setDisplayValue(Math.abs(field.value).toString());
                              }
                            }}
                            onBlur={() => {
                              setIsFocused(false);
                              if (displayValue && !isNaN(parseFloat(displayValue))) {
                                const numericValue = parseFloat(displayValue);
                                const sign = (currentSchedule.basis || 0) >= 0 ? 1 : -1;
                                field.onChange(numericValue * sign);
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
                                field.onChange(0);
                                return;
                              }
                              
                              const numericValue = parseFloat(inputValue);
                              if (!isNaN(numericValue)) {
                                const sign = (currentSchedule.basis || 0) >= 0 ? 1 : -1;
                                field.onChange(numericValue * sign);
                              }
                            }}
                            onKeyDown={(e) => {
                              const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                              if (!allowedKeys.includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className={`h-10 flex-1 ${errors.price_schedule?.[0]?.basis ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                            placeholder="0.00"
                            style={{
                              MozAppearance: 'textfield'
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                  {/* Basis Error */}
                  {errors.price_schedule?.[0]?.basis && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].basis.message}</p>
                  )}
                </div>

                {/* Future Price Field - Editable */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Futures <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="price_schedule.0.future_price"
                    control={control}
                    render={({ field }) => {
                      const [displayValue, setDisplayValue] = React.useState(() => {
                        return field.value ? field.value.toString() : '';
                      });
                      
                      const [isFocused, setIsFocused] = React.useState(false);

                      // Update display value when field value changes externally
                      React.useEffect(() => {
                        if (!isFocused) {
                          if (field.value) {
                            setDisplayValue(formatNumber({
                              minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
                              maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
                              value: field.value,
                              formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
                              roundMode: NUMBER_FORMAT_CONFIG.roundMode
                            }));
                          } else {
                            setDisplayValue('');
                          }
                        }
                      }, [field.value, isFocused]);

                      return (
                        <Input
                          key={`future-price-${currentSchedule.pricing_type || 'fixed'}`}
                          type="text"
                          inputMode="decimal"
                          value={displayValue}
                          onFocus={() => {
                            setIsFocused(true);
                            // Show raw number when focused for easier editing
                            if (field.value) {
                              setDisplayValue(field.value.toString());
                            }
                          }}
                          onBlur={() => {
                            setIsFocused(false);
                            if (displayValue && !isNaN(parseFloat(displayValue.replace(/,/g, '')))) {
                              const numericValue = parseFloat(displayValue.replace(/,/g, ''));
                              field.onChange(numericValue);
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
                              field.onChange(0);
                              return;
                            }
                            
                            const numericValue = parseFloat(inputValue.replace(/,/g, ''));
                            if (!isNaN(numericValue)) {
                              field.onChange(numericValue);
                            }
                          }}
                          onKeyDown={(e) => {
                            const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                            if (!allowedKeys.includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className={`h-10 ${errors.price_schedule?.[0]?.future_price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                          placeholder="0.00"
                          style={{
                            MozAppearance: 'textfield'
                          }}
                        />
                      );
                    }}
                  />
                  {/* Future Price Error */}
                  {errors.price_schedule?.[0]?.future_price && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].future_price.message}</p>
                  )}
                </div>
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="price_schedule.0.price"
                  control={control}
                  render={({ field }) => {
                    const [displayValue, setDisplayValue] = React.useState(() => {
                      return field.value ? field.value.toString() : '';
                    });
                    
                    const [isFocused, setIsFocused] = React.useState(false);

                    // Update display value when field value changes externally
                    React.useEffect(() => {
                      if (!isFocused) {
                        if (field.value) {
                          setDisplayValue(formatNumber({
                            minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
                            maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
                            value: field.value,
                            formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
                            roundMode: NUMBER_FORMAT_CONFIG.roundMode
                          }));
                        } else {
                          setDisplayValue('');
                        }
                      }
                    }, [field.value, isFocused]);

                    return (
                      <Input
                        key={`price-${currentSchedule.pricing_type || 'fixed'}`}
                        type="text"
                        inputMode="decimal"
                        value={displayValue}
                        onFocus={() => {
                          setIsFocused(true);
                          // Show raw number when focused for easier editing
                          if (field.value) {
                            setDisplayValue(field.value.toString());
                          }
                        }}
                        onBlur={() => {
                          setIsFocused(false);
                          if (displayValue && !isNaN(parseFloat(displayValue.replace(/,/g, '')))) {
                            const numericValue = parseFloat(displayValue.replace(/,/g, ''));
                            field.onChange(numericValue);
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
                            field.onChange(0);
                            return;
                          }
                          
                          const numericValue = parseFloat(inputValue.replace(/,/g, ''));
                          if (!isNaN(numericValue)) {
                            field.onChange(numericValue);
                          }
                        }}
                        onKeyDown={(e) => {
                        const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`h-10 ${errors.price_schedule?.[0]?.price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                      placeholder="0.00"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                    );
                  }}
                />
                {/* Price Error */}
                {errors.price_schedule?.[0]?.price && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].price.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Option Month */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Month <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.option_month || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], option_month: value };
                  setValue('price_schedule', updatedSchedule);
                  clearErrors('price_schedule.0.option_month');
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.option_month ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Year <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.option_year?.toString() || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], option_year: parseInt(value) };
                  setValue('price_schedule', updatedSchedule);
                  clearErrors('price_schedule.0.option_year');
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.option_year ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Option Month and Year Error Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[20px]">
            <div>
              {errors.price_schedule?.[0]?.option_month && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_month.message}</p>
              )}
            </div>
            <div>
              {errors.price_schedule?.[0]?.option_year && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_year.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('paymentCurrency')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.payment_currency || APP_CONFIG.defaultCurrency}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], payment_currency: value };
                  setValue('price_schedule', updatedSchedule);
                  clearErrors('price_schedule.0.payment_currency');
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.payment_currency ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.key} value={currency.key}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Exchange <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.exchange || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], exchange: value };
                  setValue('price_schedule', updatedSchedule);
                  clearErrors('price_schedule.0.exchange');
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.exchange ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGE_OPTIONS.map((exchange) => (
                    <SelectItem key={exchange.key} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Currency and Exchange Error Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[20px]">
            <div>
              {errors.price_schedule?.[0]?.payment_currency && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].payment_currency.message}</p>
              )}
            </div>
            <div>
              {errors.price_schedule?.[0]?.exchange && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].exchange.message}</p>
              )}
            </div>
          </div>

          {/* Price Schedule Level Error */}
          <div className="min-h-[20px]">
            {errors.price_schedule && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule.message}</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}