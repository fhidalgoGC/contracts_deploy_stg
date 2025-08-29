import { useState, useCallback, useRef, useEffect } from 'react';
import { environment } from '@/environment/environment';

// Types for city data structure
export interface City {
  _id: string;
  _partitionKey: string;
  active: boolean;
  code?: string;
  country: string;
  country_slug: string;
  state: string;
  created_at: string;
  etl: boolean;
  external: any[];
  extras: any[];
  name: string;
  status: string;
  names?: {
    es: string;
    en: string;
  };
}

export interface CitiesResponse {
  data: City[];
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

export interface CitiesParams {
  countrySlug: string;
  stateId: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}

// Demo cities data for fallback
const DEMO_CITIES: Record<string, Record<string, City[]>> = {
  COL: {
    'demo-state-amazonas': [
      { _id: 'demo-city-leticia', _partitionKey: 'public', active: true, country: 'demo-country-col', country_slug: 'COL', state: 'demo-state-amazonas', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'LETICIA', status: '' },
      { _id: 'demo-city-puerto-narino', _partitionKey: 'public', active: true, country: 'demo-country-col', country_slug: 'COL', state: 'demo-state-amazonas', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'PUERTO NARIÑO', status: '' }
    ],
    'demo-state-antioquia': [
      { _id: 'demo-city-medellin', _partitionKey: 'public', active: true, country: 'demo-country-col', country_slug: 'COL', state: 'demo-state-antioquia', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'MEDELLÍN', status: '' },
      { _id: 'demo-city-bello', _partitionKey: 'public', active: true, country: 'demo-country-col', country_slug: 'COL', state: 'demo-state-antioquia', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'BELLO', status: '' },
      { _id: 'demo-city-itagui', _partitionKey: 'public', active: true, country: 'demo-country-col', country_slug: 'COL', state: 'demo-state-antioquia', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'ITAGÜÍ', status: '' }
    ]
  },
  GTM: {
    'demo-state-guatemala': [
      { _id: 'demo-city-guatemala-city', _partitionKey: 'public', active: true, country: 'demo-country-gtm', country_slug: 'GTM', state: 'demo-state-guatemala', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'GUATEMALA CITY', status: '' },
      { _id: 'demo-city-mixco', _partitionKey: 'public', active: true, country: 'demo-country-gtm', country_slug: 'GTM', state: 'demo-state-guatemala', created_at: '2025-01-01T00:00:00Z', etl: true, external: [], extras: [], name: 'MIXCO', status: '' }
    ]
  }
};

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [meta, setMeta] = useState<CitiesResponse['_meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Refs for managing async operations
  const currentRequestRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCities = useCallback(async (params: CitiesParams) => {
    console.log('Cities API: Triggering fetch due to parameter change');
    console.log('Cities API: Starting fetch with params:', params);

    // Validate required parameters
    if (!params.countrySlug || !params.stateId) {
      console.log('Cities API: Missing required params (countrySlug or stateId), clearing cities');
      setCities([]);
      setMeta(null);
      setFetchError(null);
      return;
    }

    // Cancel any existing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setIsLoading(true);
    setFetchError(null);

    try {
      // Build the URL
      const baseUrl = environment.CRM_BASE_URL;
      const endpoint = '/crm-locations/cities/find-cities';
      
      // Build filter object
      const filter: any = {
        country_slug: params.countrySlug,
        state: params.stateId
      };

      // Add search filter if provided
      if (params.search && params.search.trim() !== '') {
        filter.name = {
          $regex: `.*${params.search.trim()}.*`,
          $options: 'i'
        };
      }

      // Build sort object
      const sort = {
        name: params.sortOrder === 'desc' ? -1 : 1
      };

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString(),
        filter: JSON.stringify(filter),
        sort: JSON.stringify(sort)
      });

      const url = `${baseUrl}${endpoint}?${queryParams.toString()}`;
      console.log('Cities API: Making request to:', url);
      console.log('Cities API: Filter configuration:', JSON.stringify(filter));
      console.log('Cities API: Sort configuration:', JSON.stringify(sort));

      // Check for authentication tokens
      const jwt = localStorage.getItem('jwt_token');
      const partitionKey = localStorage.getItem('partition_key');

      console.log('Cities API: Authentication check:', {
        jwt: jwt ? 'present' : 'missing',
        jwtLength: jwt?.length || 0,
        partitionKey: partitionKey ? 'present' : 'missing',
        partitionKeyValue: partitionKey
      });

      // Always try real API call first
      console.log('Cities API: Making real API call with headers:', Object.keys({
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
        },
        signal: abortController.signal
      });

      console.log('Cities API: Response status:', response.status);

      if (!response.ok) {
        console.error('Cities API: HTTP error! status:', response.status);
        const errorText = await response.text();
        console.error('Cities API: Error response:', errorText);
        
        // Fallback to demo data if API fails
        if (!jwt || jwt === 'demo-jwt-token' || !partitionKey || partitionKey === 'demo-partition-key') {
          console.warn('Cities API: Using demo fallback due to API error');
          
          let cities = DEMO_CITIES[params.countrySlug]?.[params.stateId] || [];
          
          if (params.search && params.search.trim() !== '') {
            const searchTerm = params.search.trim().toLowerCase();
            cities = cities.filter(city => 
              city.name.toLowerCase().includes(searchTerm)
            );
          }

          const demoResponse = {
            data: cities,
            _meta: {
              page_size: params.pageSize || 10,
              page_number: params.page || 1,
              total_elements: cities.length,
              total_pages: Math.ceil(cities.length / (params.pageSize || 10))
            },
            _links: {
              self: `/api/v1/crm-locations/cities/find-cities?page=${params.page || 1}`,
              first: '/api/v1/crm-locations/cities/find-cities?page=1',
              prev: `/api/v1/crm-locations/cities/find-cities?page=${Math.max(1, (params.page || 1) - 1)}`,
              next: `/api/v1/crm-locations/cities/find-cities?page=${(params.page || 1) + 1}`,
              last: `/api/v1/crm-locations/cities/find-cities?page=${Math.ceil(cities.length / (params.pageSize || 10))}`
            }
          };

          setCities(demoResponse.data);
          setMeta(demoResponse._meta);
          return demoResponse;
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: CitiesResponse = await response.json();
      console.log('Cities API: Success response with', data.data.length, 'cities');
      if (data.data.length > 0) {
        console.log('Cities API: Sample city:', data.data[0]);
      }
      
      setCities(data.data);
      setMeta(data._meta);
      return data;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Cities API: Request was aborted');
        return;
      }

      console.error('Cities API: Error fetching cities:', error);
      setFetchError(error.message || 'Failed to load cities');

      // Fallback to demo data if not using real auth
      const jwt = localStorage.getItem('jwt_token');
      const partitionKey = localStorage.getItem('partition_key');
      
      if (!jwt || jwt === 'demo-jwt-token' || !partitionKey || partitionKey === 'demo-partition-key') {
        console.warn('Cities API: Using demo fallback due to fetch error');
        
        let cities = DEMO_CITIES[params.countrySlug]?.[params.stateId] || [];
        
        if (params.search && params.search.trim() !== '') {
          const searchTerm = params.search.trim().toLowerCase();
          cities = cities.filter(city => 
            city.name.toLowerCase().includes(searchTerm)
          );
        }

        setCities(cities);
        setMeta({
          page_size: params.pageSize || 10,
          page_number: params.page || 1,
          total_elements: cities.length,
          total_pages: Math.ceil(cities.length / (params.pageSize || 10))
        });
        setFetchError(null);
      }
    } finally {
      setIsLoading(false);
      currentRequestRef.current = null;
    }
  }, []);

  const debouncedFetchCities = useCallback((params: CitiesParams) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchCities(params);
    }, 500); // 500ms debounce
  }, [fetchCities]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const clearCities = useCallback(() => {
    console.log('Cities API: Manually clearing cities');
    setCities([]);
    setMeta(null);
    setFetchError(null);
    setIsLoading(false);
    
    // Cancel any pending requests
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  return {
    cities,
    meta,
    isLoading,
    fetchError,
    fetchCities: debouncedFetchCities,
    clearCities
  };
}