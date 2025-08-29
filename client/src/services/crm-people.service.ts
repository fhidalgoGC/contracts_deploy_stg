import { authenticatedFetch } from "@/utils/apiInterceptors";
import { environment } from "@/environment/environment";

export interface CrmPerson {
  _id: string;
  _partitionKey: string;
  active: boolean;
  created_at: string;
  created_by: string;
  emails: Array<{
    _id: string;
    type: string;
    value: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
  }>;
  first_name?: string;
  last_name?: string;
  full_name: string;
  organization_name?: string;
  person_type: "juridical_person" | "natural_person";
  phones: Array<{
    _id: string;
    calling_code: string;
    phone_number: string;
    type: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
  }>;
  roles: Array<{
    slug: string;
    platforms: string[];
  }>;
  [key: string]: any;
}

export interface CrmPeopleResponse {
  data: CrmPerson[];
  _meta: {
    page_size: number;
    page_number: number;
    total_elements: number;
    total_pages: number;
    // Legacy fields for compatibility
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  _links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface GetPeopleFilters {
  roles?: string[]; // e.g., ['buyer', 'seller']
  search?: string;
  person_type?: "juridical_person" | "natural_person";
  active?: boolean;
}

export interface GetPeopleOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, "1" | "-1">;
  search?: string;
}

/**
 * Fetch people from CRM API with filters and pagination
 */
export const getPeople = async (
  filters: GetPeopleFilters = {},
  options: GetPeopleOptions = {},
): Promise<CrmPeopleResponse> => {
  const partitionKey = localStorage.getItem("partition_key");
  if (!partitionKey) {
    throw new Error("Partition key not found");
  }

  // Build filter object
  const filterObj: any = {
    _partitionKey: partitionKey,
    ...(filters.active !== undefined && { active: filters.active }),
  };

  if (filters.roles && filters.roles.length > 0) {
    filterObj["roles.slug"] = { $in: filters.roles };
  }

  if (filters.person_type) {
    filterObj.person_type = filters.person_type;
  }

  if (filters.search) {
    filterObj.$or = [
      { full_name: { $regex: filters.search, $options: "i" } },
      { organization_name: { $regex: filters.search, $options: "i" } },
      { "emails.value": { $regex: filters.search, $options: "i" } },
    ];
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("filter", JSON.stringify(filterObj));
  queryParams.append("page", (options.page || 1).toString());
  queryParams.append("limit", (options.limit || 10).toString());

  if (options.sort) {
    queryParams.append("sort", JSON.stringify(options.sort));
  } else {
    queryParams.append("sort", JSON.stringify({ full_name: "1" }));
  }

  const url = `${environment.CRM_BASE_URL}/crm-people/people?${queryParams.toString()}`;

  console.log("CRM People API URL:", url);

  try {
    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("CRM People API Response:", data);

    return data;
  } catch (error) {
    console.error("Error fetching people from CRM:", error);
    throw error;
  }
};

/**
 * Get a person by ID from CRM
 */
export const getPersonById = async (personId: string): Promise<CrmPerson> => {
  const url = `${environment.CRM_BASE_URL}/crm-people/people/${personId}`;
  
  console.log("CRM Person by ID API URL:", url);

  try {
    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("CRM Person by ID API Response:", data);

    return data.data;
  } catch (error) {
    console.error("Error fetching person by ID from CRM:", error);
    throw error;
  }
};

/**
 * Get sellers from CRM
 */
export const getSellers = async (
  options?: GetPeopleOptions,
): Promise<CrmPeopleResponse> => {
  console.log("no llega aqui");
  // Add search filter if provided
  const filters: GetPeopleFilters = {
    roles: ["seller"],
    active: true,
  };
  if (options?.search) {
    filters.search = options.search;
  }
  return getPeople(filters, options);
};

/**
 * Get buyers from CRM
 */
export const getBuyers = async (
  options?: GetPeopleOptions,
): Promise<CrmPeopleResponse> => {
  const filters: GetPeopleFilters = {
    roles: ["buyer"],
    active: true,
  };

  // Add search filter if provided
  if (options?.search) {
    filters.search = options.search;
  }

  return getPeople(filters, options);
};

/**
 * Create idempotent ID for a new person (buyer or seller)
 */
export const createPersonId = async (): Promise<string> => {
  const partitionKey = localStorage.getItem("partition_key");
  if (!partitionKey) {
    throw new Error("Partition key not found");
  }

  const response = await authenticatedFetch(`${environment.CRM_BASE_URL}/crm-people/people`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _partitionKey: `organization_id=${partitionKey}`
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Person ID created:", data.data.key);
  return data.data.key;
};

/**
 * Create a new buyer
 */
export const createBuyer = async (buyerId: string, buyerData: any): Promise<any> => {
  const response = await authenticatedFetch(
    `${environment.CRM_BASE_URL}/crm-people/people/${buyerId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buyerData),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create buyer: ${response.status}`);
  }

  const result = await response.json();
  console.log("Buyer created successfully:", result);
  return result;
};

/**
 * Create a new seller
 */
export const createSeller = async (sellerId: string, sellerData: any): Promise<any> => {
  const response = await authenticatedFetch(
    `${environment.CRM_BASE_URL}/crm-people/people/${sellerId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sellerData),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create seller: ${response.status}`);
  }

  const result = await response.json();
  console.log("Seller created successfully:", result);
  return result;
};

/**
 * Create location for a person
 */
export const createPersonLocation = async (locationData: any): Promise<any> => {
  const partitionKey = localStorage.getItem("partition_key");
  
  const response = await authenticatedFetch(`${environment.CRM_BASE_URL}/crm-locations/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "_partitionkey": partitionKey || "",
      "bt-organization": partitionKey || "",
      "bt-uid": partitionKey || "",
      "organization_id": partitionKey || "",
      "pk-organization": partitionKey || "",
    },
    body: JSON.stringify(locationData),
  });

  if (!response.ok) {
    console.warn('Location creation failed:', response.status, response.statusText);
    // Don't throw error - location creation is optional
    return null;
  }

  const result = await response.json();
  console.log('Location created successfully:', result);
  return result;
};

/**
 * Get contact vendors from CRM (assuming they have buyer role for now)
 */
export const getContactVendors = async (
  options?: GetPeopleOptions,
): Promise<CrmPeopleResponse> => {
  return getPeople({ roles: ["buyer"], active: true }, options);
};

/**
 * Get traders from CRM
 */
export const getTraders = async (
  options?: GetPeopleOptions,
): Promise<CrmPeopleResponse> => {
  return getPeople({ roles: ["buyer"], active: true }, options);
};

/**
 * Search people by term
 */
export const searchPeople = async (
  searchTerm: string,
  roles?: string[],
  options?: GetPeopleOptions,
): Promise<CrmPeopleResponse> => {
  return getPeople({ search: searchTerm, roles, active: true }, options);
};
