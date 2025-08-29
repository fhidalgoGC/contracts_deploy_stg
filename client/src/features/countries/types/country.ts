// Country API response types
export interface CountryNames {
  default: string;
  en: string;
  es: string;
  pt: string;
}

export interface CountryNationality {
  description: string;
  language: string;
  value: string;
}

export interface CountryPhoneSettings {
  calling_code: string;
  mask: string;
  max_lenght: string;
  min_lenght: string;
  pattern: string;
}

export interface CountryExtra {
  key: string;
  updated_at: string;
  values: Array<{
    value: string;
    value_type: string;
  }>;
}

export interface CountryExternal {
  platform: string;
  platform_id: string;
  registered_at: string;
}

export interface Country {
  _id: string;
  slug: string;
  flag: string; // base64 encoded image
  names: CountryNames;
  nationality: CountryNationality[];
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  phone_settings: CountryPhoneSettings;
  extras: CountryExtra[];
  status: string;
  created_at: string;
  active: boolean;
  _partitionKey: string;
  country_slug: string;
  external: CountryExternal[];
  name: string;
}

export interface CountryApiResponse {
  data: Country[];
  _meta: {
    page_size: number;
    page_number: number;
    total_elements: number;
    total_pages: number;
  };
  _links: {
    self: string;
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}

// Hook parameters
export interface UseCountriesParams {
  page?: number;
  limit?: number;
  search?: string;
  language?: 'en' | 'es';
}