export interface User {
  email: string;
  name?: string;
  picture?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: Tokens | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface IdentityResponse {
  data: {
    firstName: string;
    lastName: string;
    address: Record<string, any>;
    auth0: string;
    phone: Array<{
      callingCode: string;
      role: string;
      phoneNumber: string;
    }>;
    companyName: string;
    roles: string[];
    dateOfBirth: string;
    id: string;
    email: string;
    group: any;
  };
  meta: {
    links: {
      address: string;
    };
    id: string;
  };
}

export interface PartitionKeyResponse {
  data: Array<{
    role: string;
    partitionKey: string;
    organization: string;
    registered: string;
    id: string;
    externals: any[];
    type: string;
    idCustomer: string;
  }>;
}

export interface OrganizationResponse {
  data: Array<{
    _id: string;
    _partitionKey: string;
    active: boolean;
    addresses: Array<{
      _id: string;
      line: string;
      type: string;
    }>;
    applications: Array<{
      _id: string;
      slug: string;
    }>;
    business_name: string;
    business_type: string;
    configuration_set: {
      _id: string;
      name: string;
    };
    created_at: string;
    created_by: string;
    emails: Array<{
      _id: string;
      type: string;
      value: string;
      verified: boolean;
    }>;
    extras: Array<{
      key: string;
      values: Array<{
        value: string;
        value_id: string;
        value_type: string;
      }>;
    }>;
    name: string;
    phones: Array<{
      _id: string;
      calling_code: string;
      phone_number: string;
      type: string;
      verified: boolean;
    }>;
    status: string;
    type: string;
    updated_at: string;
    logs: Array<{
      executed_at: string;
      executed_by?: string;
      executed_name: string;
      action: string;
      _id: string;
    }>;
    images: any[];
    ids: any[];
    relationships: any[];
    reports: any[];
    externals: any[];
    id: string;
  }>;
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

export interface PeopleResponse {
  data: {
    _id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    birthdate: string;
    person_type: string;
    roles: Array<{
      slug: string;
      platforms: any[];
      created_at: string;
      updated_at: string;
    }>;
    emails: Array<{
      _id: string;
      type: string;
      value: string;
      verified: boolean;
      created_at: string;
      updated_at: string;
    }>;
    phones: Array<{
      _id: string;
      calling_code: string;
      phone_number: string;
      type: string;
      verified: boolean;
      created_at: string;
      updated_at: string;
    }>;
    externals: Array<{
      _id: string;
      platform: string;
      platform_id: string;
      registered_at: string;
    }>;
    created_by: string;
    active: boolean;
    status: string;
    _partitionKey: string;
    created_at: string;
    updated_at: string;
    related_people: any[];
    ids: any[];
    relationships: any[];
    extras: any[];
  };
}
