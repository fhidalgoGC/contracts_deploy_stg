// Response type for creating idempotent seller ID
export interface CreateSellerIdResponse {
  data: {
    key: string;
    location: string;
  };
}

// Email object structure
export interface SellerEmail {
  value: string;
  type: 'principal';
  verified: false;
}

// Phone object structure
export interface SellerPhone {
  calling_code: string;
  phone_number: string;
  type: 'principal';
  verified: false;
}

// Role object structure
export interface SellerRole {
  slug: 'seller';
}

// Complete seller creation payload
export interface CreateSellerPayload {
  first_name: string;
  last_name: string;
  full_name: string;
  organization_name?: string;
  roles: SellerRole[];
  emails: SellerEmail[];
  phones: SellerPhone[];
  _partitionKey: string;
  active: true;
  person_type: 'natural_person' | 'juridical_person';
}

// Form data structure
export interface SellerFormData {
  person_type: 'natural_person' | 'juridical_person';
  organization_name: string;
  first_name: string;
  last_name: string;
  email: string;
  calling_code: string;
  phone_number: string;
  country: string;
  state: string;
  // Location fields for address creation
  address?: string;
  postalCode?: string;
  selectedCountry?: {
    _id: string;
    names: { en: string; es: string };
    slug: string;
  };
  selectedState?: {
    _id: string;
    name: string;
  };
  selectedCity?: {
    _id: string;
    name: string;
  };
}

// Country codes for phone selector
export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}