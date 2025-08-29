import { useQuery } from '@tanstack/react-query';
import type { CountryApiResponse, UseCountriesParams } from '../types/country';
import { environment } from '@/environment/environment';
const colombiaFlag = '/assets/colombia_1753044330762.png';
const guatemalaFlag = '/assets/guatemala_1753044330764.png';

export function useCountries({ 
  page = 1, 
  limit = 10, 
  search = '', 
  language = 'en' 
}: UseCountriesParams = {}) {
  return useQuery({
    queryKey: ['countries', { page, limit, search, language }],
    queryFn: async (): Promise<CountryApiResponse> => {
      const crmUrl = environment.CRM_BASE_URL;
      const jwt = localStorage.getItem('jwt');
      
      if (!crmUrl) {
        throw new Error('CRM URL not configured');
      }

      // Build the URL with query parameters
      let url = `${crmUrl}/crm-locations/countries/find-countries?page=${page}&limit=${limit}`;
      
      // Add search filter if provided
      if (search && search.trim()) {
        const searchKey = language === 'es' ? 'names.es' : 'names.en';
        const filter = JSON.stringify({
          "$or": [{
            [searchKey]: {
              "$regex": `.*${search.trim()}`,
              "$options": "i"
            }
          }]
        });
        url += `&filter=${encodeURIComponent(filter)}`;
      }
      
      // Add sorting
      const sortKey = language === 'es' ? 'names.es' : 'names.en';
      const sort = JSON.stringify({ [sortKey]: 1 });
      url += `&sort=${encodeURIComponent(sort)}`;

      console.log('Countries API: Making request to:', url);

      // Check if we're in demo mode
      if (jwt === 'demo-jwt-token-for-testing') {
        console.log('Countries API: Demo mode - returning mock data');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock response data - including some with invalid flags to test fallback
        const mockCountries = [
          {
            _id: "demo-country-bra",
            slug: "BRA",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjI0IiBmaWxsPSIjMDA5NjM5Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMTYsMTIgMjgsMTggNCwxOCIgZmlsbD0iI0ZGRkYwMCIvPgo8cG9seWdvbiBwb2ludHM9IjE2LDEyIDI4LDYgNCw2IiBmaWxsPSIjRkZGRjAwIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTIiIHI9IjQiIGZpbGw9IiMwMDJCN0YiLz4KPC9zdmc+",
            names: {
              default: "Brazil",
              en: "Brazil",
              es: "Brasil",
              pt: "Brasil"
            },
            nationality: [],
            capital: "Brasília",
            currency: "BRL",
            currency_name: "Brazilian Real",
            currency_symbol: "R$",
            phone_settings: {
              calling_code: "+55",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "BRA",
            external: [],
            name: language === 'es' ? "Brasil" : "Brazil"
          },
          {
            _id: "demo-country-col-no-flag",
            slug: "COL", 
            flag: "", // Empty flag to test fallback
            names: {
              default: "Colombia",
              en: "Colombia", 
              es: "Colombia",
              pt: "Colômbia"
            },
            nationality: [],
            capital: "Bogotá",
            currency: "COP",
            currency_name: "Colombian Peso",
            currency_symbol: "$",
            phone_settings: {
              calling_code: "+57",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "COL",
            external: [],
            name: "Colombia"
          },
          {
            _id: "demo-country-usa",
            slug: "USA",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjI0IiBmaWxsPSIjQjIyMjM0Ii8+CjxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHk9IjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHk9IjgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHk9IjEyIiB3aWR0aD0iMzIiIGhlaWdodD0iMiIgZmlsbD0iI0ZGRkZGRiIvPgo8cmVjdCB5PSIxNiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeT0iMjAiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgZmlsbD0iIzNCMzc5MSIvPgo8L3N2Zz4K",
            names: {
              default: "United States",
              en: "United States",
              es: "Estados Unidos",
              pt: "Estados Unidos"
            },
            nationality: [],
            capital: "Washington D.C.",
            currency: "USD",
            currency_name: "US Dollar",
            currency_symbol: "$",
            phone_settings: {
              calling_code: "+1",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "USA",
            external: [],
            name: language === 'es' ? "Estados Unidos" : "United States"
          },
          {
            _id: "demo-country-gtm-no-flag",
            slug: "GTM",
            flag: "invalid-flag-url",  // Invalid flag to test fallback 
            names: {
              default: "Guatemala",
              en: "Guatemala",
              es: "Guatemala", 
              pt: "Guatemala"
            },
            nationality: [],
            capital: "Ciudad de Guatemala",
            currency: "GTQ",
            currency_name: "Guatemalan Quetzal",
            currency_symbol: "Q",
            phone_settings: {
              calling_code: "+502",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "GTM",
            external: [],
            name: "Guatemala"
          },
          {
            _id: "demo-country-hnd",
            slug: "HND",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDczQ0UiLz4KPHJlY3QgeT0iOCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjgiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSI4IiBmaWxsPSIjMDA3M0NFIi8+CjwhLS0gNSBzdGFycyBpbiBhIGNyb3NzIC0tPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSIxIiBmaWxsPSIjMDA3M0NFIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjEiIGZpbGw9IiMwMDczQ0UiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iIzAwNzNDRSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjE0IiByPSIxIiBmaWxsPSIjMDA3M0NFIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTQiIHI9IjEiIGZpbGw9IiMwMDczQ0UiLz4KPC9zdmc+",
            names: {
              default: "Honduras",
              en: "Honduras",
              es: "Honduras",
              pt: "Honduras"
            },
            nationality: [],
            capital: "Tegucigalpa",
            currency: "HNL",
            currency_name: "Honduran Lempira",
            currency_symbol: "L",
            phone_settings: {
              calling_code: "+504",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "HND",
            external: [],
            name: "Honduras"
          },
          {
            _id: "demo-country-mex",
            slug: "MEX",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwLjY3IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMDA2ODQ3Ii8+CjxyZWN0IHg9IjEwLjY3IiB3aWR0aD0iMTAuNjYiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeD0iMjEuMzMiIHdpZHRoPSIxMC42NyIgaGVpZ2h0PSIyNCIgZmlsbD0iI0NFMTEyNiIvPgo8L3N2Zz4K",
            names: {
              default: "Mexico",
              en: "Mexico",
              es: "México",
              pt: "México"
            },
            nationality: [],
            capital: "Ciudad de México",
            currency: "MXN",
            currency_name: "Mexican peso",
            currency_symbol: "$",
            phone_settings: {
              calling_code: "+52",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "MEX",
            external: [],
            name: language === 'es' ? "México" : "Mexico"
          }
        ];

        console.log('Countries API: Demo mode loaded', mockCountries.length, 'countries with flags');
        mockCountries.forEach(country => {
          console.log(`Country ${country.names.en}: flag source type:`, {
            slug: country.slug,
            hasFlag: !!country.flag,
            flagType: country.flag ? (country.flag.startsWith('data:') ? 'base64' : country.flag.startsWith('http') ? 'url' : 'asset') : 'none'
          });
        });

        // Filter by search if provided
        const filteredCountries = search 
          ? mockCountries.filter(country => 
              (language === 'es' ? country.names.es : country.names.en)
                .toLowerCase()
                .includes(search.toLowerCase())
            )
          : mockCountries;

        return {
          data: filteredCountries,
          _meta: {
            page_size: limit,
            page_number: page,
            total_elements: filteredCountries.length,
            total_pages: Math.ceil(filteredCountries.length / limit)
          },
          _links: {
            self: "",
            first: "",
            prev: "",
            next: "",
            last: ""
          }
        };
      }

      // Real API call
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Countries API request failed: ${response.status} ${response.statusText}`);
      }

      const data: CountryApiResponse = await response.json();
      
      console.log('Countries API: Success, received', data.data.length, 'countries');
      
      return data;
    },
    enabled: true,
  });
}