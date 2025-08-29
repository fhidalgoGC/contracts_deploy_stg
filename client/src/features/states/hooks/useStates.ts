import { useState, useEffect } from 'react';
import { StatesResponse, State } from '../types/state';
import { environment } from '@/environment/environment';

// Demo states data for testing
const DEMO_STATES: Record<string, State[]> = {
  'COL': [
    {
      _id: "68700d82ff4c8f3072430056",
      _partitionKey: "public",
      active: true,
      code: "91",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "AMAZONAS",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430057",
      _partitionKey: "public",
      active: true,
      code: "05",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "ANTIOQUIA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430058",
      _partitionKey: "public",
      active: true,
      code: "08",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "ATLÁNTICO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430059",
      _partitionKey: "public",
      active: true,
      code: "11",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "BOGOTÁ D.C.",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430060",
      _partitionKey: "public",
      active: true,
      code: "13",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "BOLÍVAR",
      status: ""
    }
  ],
  'GTM': [
    {
      _id: "68700d82ff4c8f3072430061",
      _partitionKey: "public",
      active: true,
      code: "01",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "GUATEMALA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430062",
      _partitionKey: "public",
      active: true,
      code: "02",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "EL PROGRESO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430063",
      _partitionKey: "public",
      active: true,
      code: "03",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "SACATEPÉQUEZ",
      status: ""
    }
  ],
  'USA': [
    {
      _id: "68700d82ff4c8f3072430064",
      _partitionKey: "public",
      active: true,
      code: "CA",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "CALIFORNIA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430065",
      _partitionKey: "public",
      active: true,
      code: "TX",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "TEXAS",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430066",
      _partitionKey: "public",
      active: true,
      code: "FL",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "FLORIDA",
      status: ""
    }
  ],
  'MEX': [
    {
      _id: "68700d82ff4c8f3072430067",
      _partitionKey: "public",
      active: true,
      code: "09",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "CIUDAD DE MÉXICO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430068",
      _partitionKey: "public",
      active: true,
      code: "19",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "NUEVO LEÓN",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430069",
      _partitionKey: "public",
      active: true,
      code: "15",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "MÉXICO",
      status: ""
    }
  ]
};

interface UseStatesParams {
  countrySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  language?: 'en' | 'es';
}

export function useStates(params: UseStatesParams) {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchStates = async (): Promise<StatesResponse | null> => {
    if (!params.countrySlug) {
      console.log('States API: No country slug provided, skipping request');
      return null;
    }

    console.log('States API: Starting fetch with params:', {
      countrySlug: params.countrySlug,
      search: params.search,
      page: params.page,
      pageSize: params.pageSize,
      sortOrder: params.sortOrder
    });

    setIsLoading(true);
    setError(null);

    try {
      // Use environment variable or default to the exact base URL from your example
      const baseUrl = environment.CRM_BASE_URL;
      
      // Build filter object exactly as shown in your example
      const filter: any = {
        country_slug: params.countrySlug
      };

      // Add search filter if provided - exactly as shown in your example
      if (params.search && params.search.trim() !== '') {
        filter.name = {
          $regex: `.*${params.search.trim()}.*`,
          $options: 'i'
        };
      }

      // Build query parameters exactly as shown in your example
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString(),
        filter: JSON.stringify(filter),
        sort: JSON.stringify({ name: params.sortOrder === 'desc' ? -1 : 1 })
      });

      // Construct the exact URL structure from your example
      const url = `${baseUrl}/crm-locations/states/find-states?${queryParams.toString()}`;
      console.log('States API: Making request to:', url);
      console.log('States API: Sort configuration:', JSON.stringify({ name: params.sortOrder === 'desc' ? -1 : 1 }));

      // Check for authentication tokens
      const jwt = localStorage.getItem('jwt_token');
      const partitionKey = localStorage.getItem('partition_key');

      console.log('States API: Authentication check:', {
        jwt: jwt ? 'present' : 'missing',
        jwtLength: jwt?.length || 0,
        partitionKey: partitionKey ? 'present' : 'missing',
        partitionKeyValue: partitionKey
      });

      // Always try real API call first
      console.log('States API: Making real API call with headers:', Object.keys({
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : 'Bearer demo-token',
        'X-Partition-Key': partitionKey || 'demo-partition'
      }));

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwt ? `Bearer ${jwt}` : 'Bearer demo-token',
          'X-Partition-Key': partitionKey || 'demo-partition'
        }
      });

      console.log('States API: Response status:', response.status);

      if (!response.ok) {
        console.error('States API: HTTP error! status:', response.status);
        const errorText = await response.text();
        console.error('States API: Error response:', errorText);
        
        // Fallback to demo data if API fails
        if (!jwt || jwt === 'demo-jwt-token' || !partitionKey || partitionKey === 'demo-partition-key') {
          console.warn('States API: Using demo fallback due to API error');
          
          let states = DEMO_STATES[params.countrySlug] || [];
          
          if (params.search && params.search.trim() !== '') {
            const searchTerm = params.search.trim().toLowerCase();
            states = states.filter(state => 
              state.name.toLowerCase().includes(searchTerm)
            );
          }

          const demoResponse = {
            data: states,
            _meta: {
              page_size: params.pageSize || 10,
              page_number: params.page || 1,
              total_elements: states.length,
              total_pages: Math.ceil(states.length / (params.pageSize || 10))
            },
            _links: {
              self: `/api/v1/crm-locations/states/find-states?page=${params.page || 1}`,
              first: '/api/v1/crm-locations/states/find-states?page=1',
              prev: `/api/v1/crm-locations/states/find-states?page=${Math.max(1, (params.page || 1) - 1)}`,
              next: `/api/v1/crm-locations/states/find-states?page=${(params.page || 1) + 1}`,
              last: `/api/v1/crm-locations/states/find-states?page=${Math.ceil(states.length / (params.pageSize || 10))}`
            }
          };

          setStates(demoResponse.data);
          setMeta(demoResponse._meta);
          return demoResponse;
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: StatesResponse = await response.json();
      console.log('States API: Success response with', data.data.length, 'states');
      if (data.data.length > 0) {
        console.log('States API: Sample state:', data.data[0]);
      }
      
      setStates(data.data);
      setMeta(data._meta);
      return data;

    } catch (error) {
      console.error('States API: Error fetching states:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when parameters change - only when countrySlug is present
  useEffect(() => {
    if (params.countrySlug && params.countrySlug.trim() !== '') {
      console.log('States API: Triggering fetch due to parameter change');
      fetchStates();
    } else {
      console.log('States API: No country slug, clearing states');
      setStates([]);
      setMeta(null);
    }
  }, [params.countrySlug, params.search, params.page, params.pageSize, params.sortOrder]);

  return {
    states,
    meta,
    fetchStates,
    isLoading,
    error
  };
}