export interface BuyerEmail {
  _id: string;
  type: string;
  value: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerPhone {
  _id: string;
  calling_code: string;
  phone_number: string;
  type: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerRole {
  slug: string;
  platforms: any[];
  created_at: string;
  updated_at: string;
}

export interface BuyerExternal {
  platform: string;
  platform_id: string;
  registered_at: string;
}

export interface BuyerExtra {
  key: string;
  values: Array<{
    value_type: string;
    value: string;
  }>;
}

export interface Buyer {
  _id: string;
  _partitionKey: string;
  active: boolean;
  created_at: string;
  created_by: string;
  emails: BuyerEmail[];
  etl: boolean;
  externals: BuyerExternal[];
  extras: BuyerExtra[];
  first_name: string;
  full_name: string;
  ids: any[];
  is_clone: boolean;
  last_name: string;
  organization_name: string;
  person_type: string;
  phones: BuyerPhone[];
  related_people: any[];
  relationships: any[];
  roles: BuyerRole[];
  updated_at: string;
}

export interface BuyersResponse {
  data: Buyer[];
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