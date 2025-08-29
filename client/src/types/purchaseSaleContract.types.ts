// Purchase and Sale Contract Types based on JSON structure
import { CURRENCY_OPTIONS } from '@/environment/environment';

// Dynamic currency type based on CURRENCY_OPTIONS - use key for data storage
export type Currency = typeof CURRENCY_OPTIONS[number]['key'];

export interface Commodity {
  commodity_id: string;
  name: string;
}

export interface Characteristics {
  configuration_id: string;
  configuration_name: string;
}

export interface Participant {
  people_id: string;
  name: string;
  role: 'buyer' | 'seller' | 'trader' | 'contactVendor' | 'purchase' | 'sale';
}

export interface PriceSchedule {
  pricing_type: 'fixed' | 'basis';
  price: number;
  basis: number;
  basis_operation: 'add' | 'subtract';
  future_price: number;
  option_month: string;
  option_year: number;
  payment_currency: Currency;
  exchange: string;
}

export interface FreightCost {
  type: 'none' | 'fixed' | 'variable';
  min: number;
  max: number;
  cost: number;
}

export interface LogisticSchedule {
  logistic_payment_responsability: 'buyer' | 'seller' | 'other';
  logistic_coordination_responsability: 'buyer' | 'seller' | 'other';
  freight_cost: FreightCost;
  freight_cost_measurement_unit_id?: string;
  freight_cost_measurement_unit?: string;
  payment_currency: Currency;
}

export interface Inventory {
  total: number;
  open: number;
  fixed: number;
  unsettled: number;
  settled: number;
  reserved: number;
}

export interface InventoryValue {
  total: number;
  open: number;
  fixed: number;
  unsettled: number;
  settled: number;
}

export interface Thresholds {
  min_thresholds_percentage: number;
  min_thresholds_weight: number;
  max_thresholds_percentage: number;
  max_thresholds_weight: number;
}

export interface PurchaseSaleContract {
  _id?: string;
  _partitionKey?: string;
  active?: boolean;
  created_by?: string;
  created_at?: string;
  folio?: string;
  type: 'purchase' | 'sale';
  sub_type: 'direct' | 'imported' | 'importedFreight';
  
  // Commodity - object format only
  commodity?: Commodity;
  
  // Characteristics - object format only
  characteristics?: Characteristics;
  
  grade: number;
  participants: Participant[];
  price_schedule: PriceSchedule[];
  logistic_schedule: LogisticSchedule[];
  inventory?: Inventory;
  inventory_value?: InventoryValue;
  quantity: number;
  reference_number: string;
  measurement_unit_id: string;
  measurement_unit: string;
  shipping_start_date: string;
  shipping_end_date: string;
  application_priority: number;
  delivered: string;
  transport: string;
  weights: string;
  inspections: string;
  proteins: string;
  purchase_orders?: any[];
  
  // Thresholds - object format only
  thresholds?: Thresholds;
  
  status?: string;
  contract_date: string;
  extras?: any[];
  externals?: any[];
  schedule?: any[];
  sub_contracts?: any[];
  notes?: any[];
  remarks?: string[];
  
  // Form-specific fields
  
  // Adjustments - array of selected adjustments, no duplicates allowed
  adjustments?: Array<{
    _id: string;
    name: string;
  }>;
}


// Backward compatibility aliases
export type PurchaseContract = PurchaseSaleContract;
export type PurchaseContractFormData = PurchaseSaleContract;