import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createPurchaseContractSchema } from '@/validation/purchaseContract.schema';
import type { PurchaseSaleContract, Participant, PriceSchedule, LogisticSchedule } from '@/types/purchaseSaleContract.types';
import { APP_CONFIG, CURRENCY_OPTIONS } from '@/environment/environment';

interface UsePurchaseContractFormOptions {
  initialData?: Partial<PurchaseSaleContract>;
  contractType?: 'purchase' | 'sale';
  mode?: 'create' | 'edit' | 'view';
  representativeRole?: 'buyer' | 'seller' | 'trader' | 'contactVendor' | 'purchase' | 'sale';
  contractId?: string;
  onSuccess?: () => void;
  onSubmitContract?: (contractId: string, data: any) => Promise<void>;
}

export function usePurchaseContractForm(options: UsePurchaseContractFormOptions = {}) {

  
  const { initialData = {}, contractType = 'purchase', mode = 'create', representativeRole = 'buyer', contractId, onSuccess, onSubmitContract } = options;

  // console.log("contractId",contractId);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create reactive resolver that updates when language changes
  const resolver = useMemo(() => {
    return zodResolver(createPurchaseContractSchema(t));
  }, [t]);

  // Merge default values with initial data
  const defaultValues = useMemo(() => {
    const baseDefaults = {
      folio: '',
      type: contractType,
      sub_type: '' as any,
      commodity: { commodity_id: '', name: '' },
      characteristics: { configuration_id: '', configuration_name: '' },
      grade: 1,
      quantity: undefined,
      reference_number: '',
      measurement_unit_id: '',
      measurement_unit: '',
      contract_date: new Date().toISOString().split('T')[0],
      thresholds: {
        min_thresholds_percentage: APP_CONFIG.PRICE_THRESHOLD_MIN,
        min_thresholds_weight: 0,
        max_thresholds_percentage: APP_CONFIG.PRICE_THRESHOLD_MAX,
        max_thresholds_weight: 0
      },
      // Individual participant fields removed - managed via participants array
      participants: [],
      price_schedule: [{
        pricing_type: 'fixed',
        price: 0,
        basis: 0,
        basis_operation: 'add',
        future_price: 0,
        option_month: '',
        option_year: new Date().getFullYear(),
        payment_currency: APP_CONFIG.defaultCurrency,
        exchange: '',
      }],
      logistic_schedule: [{
        logistic_payment_responsability: '' as any,
        logistic_coordination_responsability: '' as any,
        freight_cost: {
          type: 'none',
          min: 0,
          max: 0,
          cost: 0,
        },
        freight_cost_measurement_unit_id: '',
        freight_cost_measurement_unit: '',
        payment_currency: APP_CONFIG.defaultCurrency,
      }],
      shipping_start_date: new Date().toISOString().split('T')[0],
      shipping_end_date: new Date().toISOString().split('T')[0],
      application_priority: 1,
      delivered: '',
      transport: '',
      weights: '',
      inspections: '',
      proteins: '',
      remarks: [],
      adjustments: [],
    };
    
    // Deep merge initial data with defaults, giving priority to initialData
    const mergeData = (defaults: any, data: any): any => {
      const result = { ...defaults };
      
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            result[key] = data[key];
          } else if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
            result[key] = mergeData(result[key] || {}, data[key]);
          } else {
            result[key] = data[key];
          }
        }
      });
      
      return result;
    };
    
    return mergeData(baseDefaults, initialData);
  }, [initialData]);
  
  const form = useForm<PurchaseSaleContract>({
    resolver,
    mode: 'onSubmit', // Initial validation only on submit
    reValidateMode: 'onChange', // Re-validate on change after first submit
    defaultValues,
  });

  // Auto-save removido - no más drafts

  // Auto-update participants when seller or contact vendor changes
  // Note: Using simplified approach - we'll let the form handle participant validation
  // and add participants during submit processing instead of real-time updates

  // Update validation messages when language changes
  useEffect(() => {
    // Only revalidate if form has been touched to avoid showing errors on initial load
    if (form.formState.isSubmitted || Object.keys(form.formState.touchedFields).length > 0) {
      form.trigger();
    }
  }, [t, form]);

  // Participant management
  const addParticipant = () => {
    const currentParticipants = form.getValues('participants');
    const newParticipant: Participant = {
      people_id: '',
      name: '',
      role: 'buyer',
    };
    form.setValue('participants', [...currentParticipants, newParticipant]);
  };

  const removeParticipant = (index: number) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.filter((_, i) => i !== index);
    form.setValue('participants', updatedParticipants);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    );
    form.setValue('participants', updatedParticipants);
  };

  // Price Schedule management
  const addPriceSchedule = () => {
    const currentSchedule = form.getValues('price_schedule');
    const newSchedule: PriceSchedule = {
      pricing_type: 'fixed',
      price: null as any,
      basis: null as any,
      basis_operation: 'add',
      future_price: null as any,
      option_month: '',
      option_year: new Date().getFullYear(),
      payment_currency: APP_CONFIG.defaultCurrency as any,
      exchange: '',
    };
    form.setValue('price_schedule', [...currentSchedule, newSchedule]);
  };

  const removePriceSchedule = (index: number) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('price_schedule', updatedSchedule);
  };

  const updatePriceSchedule = (index: number, field: keyof PriceSchedule, value: any) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    form.setValue('price_schedule', updatedSchedule);
  };

  // Logistic Schedule management
  const addLogisticSchedule = () => {
    const currentSchedule = form.getValues('logistic_schedule');
    const newSchedule: LogisticSchedule = {
      logistic_payment_responsability: '' as any,
      logistic_coordination_responsability: '' as any,
      freight_cost: {
        type: 'none',
        min: 0,
        max: 0,
        cost: 0,
      },
      freight_cost_measurement_unit_id: '',
      freight_cost_measurement_unit: '',
      payment_currency: APP_CONFIG.defaultCurrency as any,
    };
    form.setValue('logistic_schedule', [...currentSchedule, newSchedule]);
  };

  const removeLogisticSchedule = (index: number) => {
    const currentSchedule = form.getValues('logistic_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('logistic_schedule', updatedSchedule);
  };

  const updateLogisticSchedule = (index: number, field: string, value: any) => {
    const currentSchedule = form.getValues('logistic_schedule');
    const updatedSchedule = currentSchedule.map((schedule, i) => {
      if (i === index) {
        if (field.startsWith('freight_cost.')) {
          const freightField = field.split('.')[1];
          return {
            ...schedule,
            freight_cost: {
              ...schedule.freight_cost,
              [freightField]: value,
            },
          };
        }
        return { ...schedule, [field]: value };
      }
      return schedule;
    });
    form.setValue('logistic_schedule', updatedSchedule);
  };

  // Remarks management
  const addRemark = () => {
    const currentRemarks = form.getValues('remarks') || [];
    form.setValue('remarks', [...currentRemarks, '']);
  };

  const removeRemark = (index: number) => {
    const currentRemarks = form.getValues('remarks') || [];
    const updatedRemarks = currentRemarks.filter((_, i) => i !== index);
    form.setValue('remarks', updatedRemarks);
  };

  const updateRemark = (index: number, value: string) => {
    const currentRemarks = form.getValues('remarks') || [];
    const updatedRemarks = currentRemarks.map((remark, i) =>
      i === index ? value : remark
    );
    form.setValue('remarks', updatedRemarks);
  };

  // Helper function to recursively remove empty string fields from objects (keep empty arrays)
  const removeEmptyFields = (obj: any): any => {
    // Return null/undefined as-is to be filtered out at parent level
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      // Clean array contents first, then filter out null/undefined/empty
      const cleanedArray = obj
        .map(item => removeEmptyFields(item))
        .filter(item => {
          // Remove null, undefined
          if (item === null || item === undefined) return false;
          // Remove empty strings
          if (typeof item === 'string' && item.trim() === '') return false;
          // Remove empty objects (but keep empty arrays)
          if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) return false;
          return true;
        });
      
      return cleanedArray;
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Recursively clean nested objects/arrays first
        const cleanedValue = removeEmptyFields(value);
        
        // Skip null or undefined values (including those returned from cleaning)
        if (cleanedValue === null || cleanedValue === undefined) {
          continue;
        }
        
        // Skip empty strings
        if (typeof cleanedValue === 'string' && cleanedValue.trim() === '') {
          continue;
        }
        
        // Skip empty objects (but keep empty arrays)
        if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) {
          continue;
        }
        
        // Keep the cleaned value
        cleaned[key] = cleanedValue;
      }
      
      return cleaned;
    }
    
    // For primitive values, return as-is (strings, numbers, booleans)
    return obj;
  };

  // Generate final JSON
  const generateContractJSON = (formData: PurchaseSaleContract): PurchaseSaleContract => {
    const partitionKey = localStorage.getItem('partition_key') || '';
    const userId = localStorage.getItem('user_id') || '';
    

    
    // Helper function to find label by value (kept for future use if needed)
    const findLabel = (options: any[], value: string) => {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : '';
    };
    
    // Helper function to convert currency key to value for API
    const findCurrencyValue = (key: string) => {
      const option = CURRENCY_OPTIONS.find(opt => opt.key === key);
      return option ? option.key : key;
    };
    
    // Process participants - use existing participants from form selections
    let processedParticipants = [...(formData.participants || [])];
    
    // console.log('🔍 Processing participants from form selections:', processedParticipants);
    
    // Add representative for all contract types
    const representativePeopleId = localStorage.getItem('representative_people_id');
    const representativePeopleFullName = localStorage.getItem('representative_people_full_name');
    
    // Determine correct representative role based on contract type
    let correctRepresentativeRole = representativeRole;
    if (contractType === 'purchase' && representativeRole !== 'buyer') {
      correctRepresentativeRole = 'buyer';
      // console.log(`🔧 Contract type is '${contractType}', correcting representative role from '${representativeRole}' to 'buyer'`);
    } else if (contractType === 'sale' && representativeRole !== 'seller') {
      correctRepresentativeRole = 'seller';
      // console.log(`🔧 Contract type is '${contractType}', correcting representative role from '${representativeRole}' to 'seller'`);
    }
    
    // console.log('🔍 Representative info from localStorage:', { representativePeopleId, representativePeopleFullName, representativeRole, correctRepresentativeRole, contractType });
    
    if (representativePeopleId && representativePeopleFullName) {
      // Check if representative is not already in participants
      const existingRepresentative = processedParticipants.find(p => p.people_id === representativePeopleId);
      
      if (!existingRepresentative) {
        processedParticipants.push({
          people_id: representativePeopleId,
          name: representativePeopleFullName,
          role: correctRepresentativeRole
        });
        // console.log(`✅ Representative added with role '${correctRepresentativeRole}' for ${contractType} contract:`, { representativePeopleId, representativePeopleFullName, correctRepresentativeRole });
      } else {
        // console.log('ℹ️ Representative already exists in participants, skipping.');
      }
    } else {
      // console.log('⚠️ No representative info found in localStorage.');
    }
    
    // Función para eliminar participantes con roles trader y contactVendor
    const removeTraderAndContactVendor = (participants: any[]) => {
      return participants.filter(participant => 
        participant.role !== 'trader' && participant.role !== 'contactVendor'
      );
    };
    
    // Aplicar filtro para eliminar trader y contactVendor
    processedParticipants = removeTraderAndContactVendor(processedParticipants);
    // console.log('🗑️ Participants after removing trader and contactVendor:', processedParticipants);
    
    // console.log('✅ Final processed participants:', processedParticipants);
    
    // Calculate thresholds weights based on quantity and percentages (handle null/undefined)
    const quantity = formData.quantity || 0;
    const price = formData.price_schedule[0]?.price || 0;
    
    // Calculate threshold weights based on percentage and quantity
    const minThresholdWeight = quantity > 0 ? quantity - (quantity * (formData.thresholds?.min_thresholds_percentage || 0) / 100) : 0;
    const maxThresholdWeight = quantity > 0 ? quantity + (quantity * (formData.thresholds?.max_thresholds_percentage || 0) / 100) : 0;
    
    // Update formData.thresholds with calculated weights
    if (formData.thresholds) {
      formData.thresholds.min_thresholds_weight = minThresholdWeight;
      formData.thresholds.max_thresholds_weight = maxThresholdWeight;
    }

    // Calculate inventory values (simplified calculation)
    const totalValue = quantity > 0 && price > 0 ? quantity * price : 0;

    const contractJSON: PurchaseSaleContract = {
      _partitionKey: partitionKey,
      active: true,
      created_by: userId,
      created_at: new Date().toISOString(),
      ...(formData.folio && formData.folio.trim() !== '' && { folio: formData.folio }),
      type: contractType,
      sub_type: formData.sub_type,
      commodity: {
        commodity_id: formData.commodity?.commodity_id || '',
        name: formData.commodity?.name || '',
      },
      characteristics: {
        configuration_id: formData.characteristics?.configuration_id || '',
        configuration_name: formData.characteristics?.configuration_name || '',
      },
      grade: formData.grade,
      participants: processedParticipants,
      price_schedule: (formData.price_schedule || []).map(ps => ({
        ...ps,
        payment_currency: findCurrencyValue(ps.payment_currency)
      })),
      logistic_schedule: (formData.logistic_schedule || []).map(ls => ({
        ...ls,
        payment_currency: findCurrencyValue(ls.payment_currency)
      })),
      quantity: quantity,
      reference_number: formData.reference_number,
      measurement_unit_id: formData.measurement_unit_id, // Use the ID from form selection
      measurement_unit: formData.measurement_unit,
      shipping_start_date: new Date(formData.shipping_start_date).toISOString(),
      shipping_end_date: new Date(formData.shipping_end_date).toISOString(),
      application_priority: formData.application_priority,
      delivered: formData.delivered,
      transport: formData.transport,
      weights: formData.weights,
      inspections: formData.inspections,
      proteins: formData.proteins,
      thresholds: {
        min_thresholds_percentage: formData.thresholds?.min_thresholds_percentage || 0,
        min_thresholds_weight: formData.thresholds?.min_thresholds_weight || minThresholdWeight,
        max_thresholds_percentage: formData.thresholds?.max_thresholds_percentage || 0,
        max_thresholds_weight: formData.thresholds?.max_thresholds_weight || maxThresholdWeight,
      },
      status: 'created',
      contract_date: new Date(formData.contract_date).toISOString(),
      notes: [],
      remarks: (formData.remarks || []).filter(remark => remark.trim() !== ''),
      ...(formData.adjustments && formData.adjustments.length > 0 && { 
        adjustments: formData.adjustments 
      }),
    };

    // Debug: Log before cleaning
    // console.log('🔍 Contract JSON Before Cleaning:', JSON.stringify(contractJSON, null, 2));
    
    // Remove all empty fields from the final JSON
    const cleanedJSON = removeEmptyFields(contractJSON);
    
    // Debug: Log after cleaning
    // console.log('✨ Contract JSON After Cleaning:', JSON.stringify(cleanedJSON, null, 2));
    
    return cleanedJSON;
  };

  const onSubmit = async (data: PurchaseSaleContract) => {
    try {
      setIsSubmitting(true);
      // console.log('🚀 HOOK onSubmit called - Form validation passed');
      // console.log('📊 onSubmitContract function available:', !!onSubmitContract);
      // console.log('📋 Form data received:', data);
      
      // Process participants before JSON generation to ensure they exist
      const processedData = { ...data };
      let processedParticipants = [...(data.participants || [])];
      
      // Participants will be processed by the form submission flow
      // The real seller/contact vendor data is already available in the form
      // and will be handled by the generateContractJSON function
      // Individual participant fields removed - using participants array only
      // console.log('📋 Current participants:', processedParticipants);
      
      processedData.participants = processedParticipants;
      // console.log('👥 Processed participants:', processedParticipants);
      
      const contractJSON = generateContractJSON(processedData);
      // console.log('✨ Generated Contract JSON (After Cleaning):', JSON.stringify(contractJSON, null, 2));
      
      // Call external submit function if provided, otherwise show alert
      if (onSubmitContract) {
        // console.log('🌐 Calling external onSubmitContract function...');
        await onSubmitContract(contractId || '', contractJSON);
        // console.log('✅ onSubmitContract completed successfully');
      } else {
        // console.log('⚠️ No onSubmitContract function provided, showing alert');
        alert('Contrato creado exitosamente!\nRevisa la consola para ver el JSON generado.');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error; // Re-throw to let the page handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    // Reset form to default values without specifying arrays to avoid extensibility errors
    form.reset();
    
    // Clear arrays manually by setting them to new arrays
    form.setValue('participants', []);
    form.setValue('price_schedule', []);
    form.setValue('logistic_schedule', []);
    form.setValue('adjustments', []);
    form.setValue('remarks', []);
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit as any),
    onCancel,
    generateContractJSON, // Export for debug button
    // Participant methods
    addParticipant,
    removeParticipant,
    updateParticipant,
    // Price schedule methods
    addPriceSchedule,
    removePriceSchedule,
    updatePriceSchedule,
    // Logistic schedule methods
    addLogisticSchedule,
    removeLogisticSchedule,
    updateLogisticSchedule,
    // Remarks methods
    addRemark,
    removeRemark,
    updateRemark,
  };
}