import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import type { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';

// Standardized data structure for inspections, proteins, and weights fields
const INSPECTION_PROTEINS_WEIGHTS_OPTIONS = [
  { key: 'destination', value: 'Destination', label: 'Destination' },
  { key: 'origin', value: 'Origin', label: 'Origin' },
  { key: 'submitCc', value: 'Submit Cc', label: 'Submit Cc' },
  { key: 'notAppliance', value: 'Not Appliance', label: 'Not Appliance' },
  { key: 'firstCertification', value: 'First Certification', label: 'First Certification' }
];

// Standardized data structure for transport field
const TRANSPORT_OPTIONS = [
  { key: 'truck', value: 'Truck', label: 'Truck' },
  { key: 'rail', value: 'Rail', label: 'Rail' },
  { key: 'barge', value: 'Barge', label: 'Barge' },
  { key: 'vessel', value: 'Vessel', label: 'Vessel' },
  { key: 'truckRail', value: 'Truck/Rail', label: 'Truck/Rail' },
  { key: 'bus', value: 'BUS', label: 'BUS' },
  { key: 'container', value: 'Container', label: 'Container' },
  { key: 'drum', value: 'Drum', label: 'Drum' }
];

// Standardized data structure for delivered field
const DELIVERED_OPTIONS = [
  { key: 'dlvdAdmCcTx', value: 'Dlvd ADM CC, Tx', label: 'Dlvd ADM CC, Tx' },
  { key: 'dlvdPortOfBrownsville', value: 'Dlvd Port of Brownsville', label: 'Dlvd Port of Brownsville' },
  { key: 'dlvdToCorpusChristiTx', value: 'Dlvd to Corpus Christi Tx', label: 'Dlvd to Corpus Christi Tx' },
  { key: 'pickedUp', value: 'PICKED UP', label: 'PICKED UP' },
  { key: 'inStore', value: 'In Store', label: 'In Store' },
  { key: 'dlvdToJrFeedlotLlc', value: 'Dlvd to J&R FeedLot, LLC', label: 'Dlvd to J&R FeedLot, LLC' },
  { key: 'dlvdKinRanchFeedyarn', value: 'Dlvd Kin RanchFeedyarn', label: 'Dlvd Kin RanchFeedyarn' },
  { key: 'fobMcCook', value: 'FOB MCCook', label: 'FOB MCCook' },
  { key: 'dlvdProgresso', value: 'Dlvd Progresso', label: 'Dlvd Progresso' },
  { key: 'fobProgreso', value: 'FOB Progreso', label: 'FOB Progreso' },
  { key: 'pickupProgreso', value: 'PICKUP Progreso', label: 'PICKUP Progreso' },
  { key: 'importerProgreso', value: 'IMPORTER Progreso', label: 'IMPORTER Progreso' },
  { key: 'dlvdToCustomer', value: 'Dlvd to Customer', label: 'Dlvd to Customer' }
];

export function ShipmentSection() {
  const { t } = useTranslation();
  const { register, formState: { errors }, watch, setValue, setError, clearErrors, control } = useFormContext<PurchaseSaleContract>();
  const [dateValidationError, setDateValidationError] = useState<string>('');

  // Date validation logic
  const handleStartDateChange = (date: string) => {
    // Clear any previous date validation errors
    setDateValidationError('');
    clearErrors(['shipping_start_date', 'shipping_end_date']);
    
    // Always set the selected start date
    setValue('shipping_start_date', date);
    
    const endDate = watch('shipping_end_date');
    // If start date is greater than existing end date, clear start date and show error
    if (endDate && date > endDate) {
      setValue('shipping_start_date', '');
      setDateValidationError(t('startDateAfterEndDate'));
      setError('shipping_start_date', {
        type: 'custom',
        message: t('startDateAfterEndDate')
      });
    }
  };

  const handleEndDateChange = (date: string) => {
    // Clear any previous date validation errors
    setDateValidationError('');
    clearErrors(['shipping_start_date', 'shipping_end_date']);
    
    // Always set the selected end date
    setValue('shipping_end_date', date);
    
    const startDate = watch('shipping_start_date');
    // If end date is less than existing start date, clear start date and show error
    if (startDate && date < startDate) {
      setValue('shipping_start_date', '');
      setDateValidationError(t('endDateBeforeStartDate'));
      setError('shipping_start_date', {
        type: 'custom',
        message: t('endDateBeforeStartDate')
      });
    }
  };

  // Clear validation error when dates become valid
  useEffect(() => {
    const startDate = watch('shipping_start_date');
    const endDate = watch('shipping_end_date');
    
    if (startDate && endDate && startDate <= endDate) {
      setDateValidationError('');
      clearErrors(['shipping_start_date', 'shipping_end_date']);
    }
  }, [watch('shipping_start_date'), watch('shipping_end_date'), clearErrors]);



  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Package className="w-5 h-5" />
          {t('shipment')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_start_date" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('shippingStartDate')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Controller
              name="shipping_start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="shipping_start_date"
                  value={field.value}
                  onChange={(date) => {
                    // Clear any previous date validation errors
                    setDateValidationError('');
                    clearErrors(['shipping_start_date', 'shipping_end_date']);
                    
                    // Always set the selected start date
                    field.onChange(date);
                    
                    const endDate = watch('shipping_end_date');
                    // If start date is greater than existing end date, clear start date and show error
                    if (endDate && date > endDate) {
                      field.onChange('');
                      setDateValidationError(t('startDateAfterEndDate'));
                      setError('shipping_start_date', {
                        type: 'custom',
                        message: t('startDateAfterEndDate')
                      });
                    }
                  }}
                  placeholder={t('shippingStartDate')}
                  error={!!errors.shipping_start_date}
                />
              )}
            />
            {errors.shipping_start_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.shipping_start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_end_date" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('shippingEndDate')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Controller
              name="shipping_end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="shipping_end_date"
                  value={field.value}
                  onChange={(date) => {
                    // Clear any previous date validation errors
                    setDateValidationError('');
                    clearErrors(['shipping_start_date', 'shipping_end_date']);
                    
                    // Always set the selected end date
                    field.onChange(date);
                    
                    const startDate = watch('shipping_start_date');
                    // If end date is less than existing start date, clear start date and show error
                    if (startDate && date < startDate) {
                      setValue('shipping_start_date', '');
                      setDateValidationError(t('endDateBeforeStartDate'));
                      setError('shipping_start_date', {
                        type: 'custom',
                        message: t('endDateBeforeStartDate')
                      });
                    }
                  }}
                  placeholder={t('shippingEndDate')}
                  error={!!errors.shipping_end_date}
                />
              )}
            />
            {errors.shipping_end_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.shipping_end_date.message}</p>
            )}
          </div>
        </div>

        {/* Date validation error message */}
        {dateValidationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {dateValidationError}
            </p>
          </div>
        )}

        {/* Application Priority and Delivered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="application_priority" className="text-sm font-medium text-gray-900 dark:text-white">
              Application Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('application_priority')?.toString() || ''}
              onValueChange={(value) => {
                setValue('application_priority', parseInt(value));
                clearErrors('application_priority');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.application_priority ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
              </SelectContent>
            </Select>
            {errors.application_priority && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.application_priority.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivered" className="text-sm font-medium text-gray-900 dark:text-white">
              Delivered <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('delivered')}
              onValueChange={(value) => {
                setValue('delivered', value);
                clearErrors('delivered');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.delivered ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select delivery terms" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERED_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.delivered && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.delivered.message}</p>
            )}
          </div>
        </div>

        {/* Transport and Weights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transport" className="text-sm font-medium text-gray-900 dark:text-white">
              Transport <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('transport')}
              onValueChange={(value) => {
                setValue('transport', value);
                clearErrors('transport');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.transport ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select transport" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transport && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.transport.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weights" className="text-sm font-medium text-gray-900 dark:text-white">
              Weights <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('weights')}
              onValueChange={(value) => {
                setValue('weights', value);
                clearErrors('weights');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.weights ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select weights" />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_PROTEINS_WEIGHTS_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.weights && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.weights.message}</p>
            )}
          </div>
        </div>

        {/* Inspections and Proteins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inspections" className="text-sm font-medium text-gray-900 dark:text-white">
              Inspections <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('inspections')}
              onValueChange={(value) => {
                setValue('inspections', value);
                clearErrors('inspections');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.inspections ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select inspections" />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_PROTEINS_WEIGHTS_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.inspections && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.inspections.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteins" className="text-sm font-medium text-gray-900 dark:text-white">
              Proteins <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('proteins')}
              onValueChange={(value) => {
                setValue('proteins', value);
                clearErrors('proteins');
              }}
            >
              <SelectTrigger className={`h-10 ${errors.proteins ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select proteins" />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_PROTEINS_WEIGHTS_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.proteins && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.proteins.message}</p>
            )}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}