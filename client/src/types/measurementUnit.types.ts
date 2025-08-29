export interface MeasurementUnit {
  _id: string;
  _partitionKey: string;
  active: boolean;
  conversions: Record<string, number>;
  created_at: string;
  names: {
    default: string;
    es?: string;
    en?: string;
    pt?: string;
  };
  slug: string;
  type: 'weight' | 'volume';
  extras?: Array<{
    key: string;
    values: Array<{
      value_type: string;
      value: string;
    }>;
  }>;
}

export interface MeasurementUnitOption {
  key: string;
  value: string;
  label: string;
  type: 'weight' | 'volume';
}

export interface MeasurementUnitsResponse {
  data: MeasurementUnit[];
  total: number;
}