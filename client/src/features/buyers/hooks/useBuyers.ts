import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBuyers } from '@/services/crm-people.service';
import { BuyersResponse } from '../types';

interface UseBuyersParams {
  page?: number;
  limit?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

export function useBuyers(params: UseBuyersParams = {}) {
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState(params.limit || 10);
  const [sortKey, setSortKey] = useState(params.sortKey || 'full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(params.sortDirection || 'asc');
  const [searchValue, setSearchValue] = useState(params.search || '');

  const buildQueryOptions = useCallback(() => {
    // Build sort object
    const sort = {
      [sortKey]: sortDirection === 'asc' ? '1' as const : '-1' as const
    };

    return {
      page: currentPage,
      limit: pageSize,
      sort,
      search: searchValue.trim() || undefined
    };
  }, [currentPage, pageSize, sortKey, sortDirection, searchValue]);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buyers', currentPage, pageSize, sortKey, sortDirection, searchValue],
    queryFn: async () => {
      console.log('Executing getBuyers query with options:', buildQueryOptions());
      
      try {
        const response = await getBuyers(buildQueryOptions());
        
        // Transform the response to match expected BuyersResponse structure
        const transformedResult = {
          data: response.data || [],
          meta: {
            page_size: response._meta.page_size,
            page_number: response._meta.page_number,
            total_elements: response._meta.total_elements,
            total_pages: response._meta.total_pages
          }
        };
        
        console.log('Buyers hook - Transformed result:', transformedResult);
        return transformedResult;
      } catch (error) {
        console.error('Buyers hook - Query error:', error);
        throw error;
      }
    },
    enabled: true,
    retry: 1,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when changing sort
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchValue(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchValue,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchChange,
  };
}