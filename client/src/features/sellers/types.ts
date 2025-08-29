import { CrmPerson, CrmPeopleResponse } from '@/services/crm-people.service';

// Seller types are the same as CrmPerson but with role: seller
export type Seller = CrmPerson;

export interface SellersResponse {
  data: Seller[];
  meta: {
    page_size: number;
    page_number: number;
    total_elements: number;
    total_pages: number;
  };
}

// Re-export specific types for sellers (same structure as CrmPerson)
export type SellerEmail = CrmPerson['emails'][0];
export type SellerPhone = CrmPerson['phones'][0];
export type SellerRole = CrmPerson['roles'][0];