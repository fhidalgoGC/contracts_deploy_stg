// Response type for creating idempotent buyer ID
export interface CreateBuyerIdResponse {
  data: {
    key: string;
    location: string;
  };
}

// Email object structure
export interface BuyerEmail {
  value: string;
  type: 'principal';
  verified: false;
}

// Phone object structure
export interface BuyerPhone {
  calling_code: string;
  phone_number: string;
  type: 'principal';
  verified: false;
}

// Role object structure
export interface BuyerRole {
  slug: 'buyer';
}

// Complete buyer creation payload
export interface CreateBuyerPayload {
  first_name: string;
  last_name: string;
  full_name: string;
  organization_name?: string;
  roles: BuyerRole[];
  emails: BuyerEmail[];
  phones: BuyerPhone[];
  _partitionKey: string;
  active: true;
  person_type: 'natural_person' | 'juridical_person';
}

// Form data structure
export interface BuyerFormData {
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