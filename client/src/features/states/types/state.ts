export interface State {
  _id: string;
  _partitionKey: string;
  active: boolean;
  code: string;
  country: string;
  country_slug: string;
  created_at: string;
  etl: boolean;
  external: any[];
  extras: any[];
  name: string;
  status: string;
}

export interface StatesResponse {
  data: State[];
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