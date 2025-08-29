import { z } from 'zod';
import { CURRENCY_OPTIONS } from '@/environment/environment';

// Purchase contract validation schema with i18n support
export const createPurchaseContractSchema = (t: (key: string) => string) => {
  return z.object({
    // Contract Info Section
    folio: z.string().optional(),
    type: z.enum(['purchase', 'sale']).default('purchase'),
    sub_type: z.string().min(1, t('fieldRequired')).refine(
      (val) => ['direct', 'imported', 'importedFreight'].includes(val),
      t('selectOption')
    ),
    commodity: z.object({
      commodity_id: z.string().min(1, t('fieldRequired')),
      name: z.string().min(1, t('fieldRequired'))
    }),
    characteristics: z.object({
      configuration_id: z.string().min(1, t('fieldRequired')),
      configuration_name: z.string().min(1, t('fieldRequired'))
    }),
    grade: z.number({ required_error: t('fieldRequired') }).min(1, t('positiveNumber')).max(10, t('positiveNumber')),
    quantity: z.number({ required_error: t('fieldRequired') }).min(1, t('positiveNumber')),
    reference_number: z.string().optional(),
    measurement_unit_id: z.string().optional(),
    measurement_unit: z.string().min(1, t('fieldRequired')),
    contract_date: z.string().min(1, t('validDate')),
    thresholds: z.object({
      min_thresholds_percentage: z.number({ required_error: t('fieldRequired') }).min(0, t('positiveNumber')).max(100, t('positiveNumber')),
      min_thresholds_weight: z.number().min(0).optional(),
      max_thresholds_percentage: z.number({ required_error: t('fieldRequired') }).min(0, t('positiveNumber')).max(100, t('positiveNumber')),
      max_thresholds_weight: z.number().min(0).optional()
    }),
    // Individual participant fields removed - validation via participants array

    // Participants validation - minimum 2, must include 1 buyer and 1 seller
    participants: z
      .array(
        z.object({
          people_id: z.string().min(1, t('fieldRequired')),
          name: z.string().min(1, t('fieldRequired')),
          role: z.string().min(1, t('selectOption')).refine(
            (val) => ['buyer', 'seller', 'trader', 'contactVendor'].includes(val),
            t('selectOption')
          ),
        })
      )
      // Temporarily removed min(2) validation - participants will be processed automatically at submit
      .optional()
      .default([]),

    // Price Schedule validation - minimum 1
    price_schedule: z
      .array(
        z.object({
          pricing_type: z.string().min(1, t('fieldRequired')).refine(
            (val: string) => ['fixed', 'basis'].includes(val),
            t('selectOption')
          ).default('fixed'),
          price: z.union([z.number(), z.null()]).optional(),
          basis: z.union([z.number(), z.null()]).optional(),
          basis_operation: z.enum(['add', 'subtract']).default('add'),
          future_price: z.union([z.number(), z.null()]).optional(),
          option_month: z.string().min(1, t('fieldRequired')),
          option_year: z.number({ required_error: t('fieldRequired') }).min(new Date().getFullYear(), t('validDate')),
          payment_currency: z.string().min(1, t('fieldRequired')).refine(
            (val) => CURRENCY_OPTIONS.map(c => c.key).includes(val),
            t('fieldRequired')
          ),
          exchange: z.string().min(1, t('fieldRequired')),
        }).superRefine((data, ctx) => {
          // Conditional validation based on pricing_type
          if (data.pricing_type === 'fixed') {
            // For fixed type: price and future_price are required, basis is optional
            if (data.price === null || data.price === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['price'],
              });
            } else if (data.price <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('positiveNumber'),
                path: ['price'],
              });
            }
            
            if (data.future_price === null || data.future_price === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['future_price'],
              });
            }
            // Note: future_price can be negative, so no positive number validation
          } else if (data.pricing_type === 'basis') {
            // For basis type: basis is required, price and future_price are optional
            if (data.basis === null || data.basis === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['basis'],
              });
            }
            // Note: basis can be negative, so no positive number validation
          }
        })
      )
      .min(1, t('minimumPrices')),

    // Logistic Schedule validation - minimum 1
    logistic_schedule: z
      .array(
        z.object({
          logistic_payment_responsability: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            t('fieldRequired')
          ),
          logistic_coordination_responsability: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            t('fieldRequired')
          ),
          freight_cost: z.object({
            type: z.string().min(1, t('fieldRequired')).refine(
              (val: string) => ['none', 'fixed', 'variable'].includes(val),
              t('fieldRequired')
            ).default('none'),
            min: z.number().min(0, t('positiveNumber')).default(0),
            max: z.number().min(0, t('positiveNumber')).default(0),
            cost: z.number().min(0, t('positiveNumber')).default(0),
          }),
          freight_cost_measurement_unit_id: z.string().optional(),
          freight_cost_measurement_unit: z.string().optional(),
          payment_currency: z.string().min(1, t('fieldRequired')).refine(
            (val) => CURRENCY_OPTIONS.map(c => c.key).includes(val),
            t('fieldRequired')
          ),
        }).superRefine((data, ctx) => {
          // Conditional validation based on freight_cost.type
          if (data.freight_cost.type === 'fixed') {
            // For fixed type: cost and measurement unit are required
            if (data.freight_cost.cost === null || data.freight_cost.cost === undefined || data.freight_cost.cost <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['freight_cost', 'cost'],
              });
            }
            
            if (!data.freight_cost_measurement_unit || data.freight_cost_measurement_unit.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['freight_cost_measurement_unit'],
              });
            }
          } else if (data.freight_cost.type === 'variable') {
            // For variable type: min_cost, max_cost, and measurement unit are required
            if (data.freight_cost.min === null || data.freight_cost.min === undefined || data.freight_cost.min <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['freight_cost', 'min'],
              });
            }
            
            if (data.freight_cost.max === null || data.freight_cost.max === undefined || data.freight_cost.max <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['freight_cost', 'max'],
              });
            }
            
            if (!data.freight_cost_measurement_unit || data.freight_cost_measurement_unit.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['freight_cost_measurement_unit'],
              });
            }
            
            // Additional validation: max should be greater than min
            if (data.freight_cost.min && data.freight_cost.max && data.freight_cost.max <= data.freight_cost.min) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('maxGreaterThanMin'),
                path: ['freight_cost', 'max'],
              });
            }
          }
        })
      )
      .min(1, t('minimumLogistics')),

    // Shipment & Delivery Section
    shipping_start_date: z.string().min(1, t('fieldRequired')),
    shipping_end_date: z.string().min(1, t('fieldRequired')),
    application_priority: z.number({ required_error: t('fieldRequired') }).min(1, t('fieldRequired')).max(10, t('fieldRequired')),
    delivered: z.string().min(1, t('fieldRequired')),
    transport: z.string().min(1, t('fieldRequired')),
    weights: z.string().min(1, t('fieldRequired')),
    inspections: z.string().min(1, t('fieldRequired')),
    proteins: z.string().min(1, t('fieldRequired')),

    // Remarks Section
    remarks: z.array(z.string()).default([]),
  }).refine(
    (data) => {
      if (!data.shipping_start_date || !data.shipping_end_date) return true;
      return new Date(data.shipping_end_date) >= new Date(data.shipping_start_date);
    },
    {
      message: t('endDateAfterStart'),
      path: ['shipping_end_date'],
    }
  );
};

export type PurchaseContractFormData = z.infer<ReturnType<typeof createPurchaseContractSchema>>;