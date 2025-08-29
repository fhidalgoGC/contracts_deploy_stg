import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X, ChevronUp, ArrowLeft, ArrowRight, SkipBack, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { State } from '@/features/states/types/state';
import { useStates } from '@/features/states/hooks/useStates';

interface StateSelectorProps {
  value: string;
  countrySlug?: string;
  onChange: (state: State | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function StateSelector({ 
  value, 
  countrySlug, 
  onChange, 
  placeholder = "Select a state...", 
  disabled = false,
  error = false 
}: StateSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const { fetchStates, isLoading, error: fetchError } = useStates({
    countrySlug,
    search,
    page: currentPage,
    pageSize
  });

  // Load states when modal opens or search/page changes
  useEffect(() => {
    if (isOpen && countrySlug) {
      loadStates();
    }
  }, [isOpen, countrySlug, search, currentPage]);

  // Reset when country changes
  useEffect(() => {
    if (!countrySlug) {
      setSelectedState(null);
      onChange(null);
      setStates([]);
    }
  }, [countrySlug]);

  const loadStates = async () => {
    if (!countrySlug) return;
    
    const result = await fetchStates();
    if (result) {
      setStates(result.data);
      setTotalPages(result._meta.total_pages);
      setTotalElements(result._meta.total_elements);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen && countrySlug) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Sorting functions
  const sortStatesByName = (ascending: boolean) => {
    const sorted = [...states].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
    setStates(sorted);
  };

  // Pagination functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Handle state selection
  const handleStateSelect = (state: State) => {
    console.log('StateSelector: State selected:', {
      name: state.name,
      code: state.code,
      countrySlug: state.country_slug
    });
    
    setSelectedState(state);
    onChange(state);
    setIsOpen(false);
    // Reset search and pagination
    setSearch('');
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            placeholder={disabled ? t('selectCountryFirst') : placeholder}
            readOnly
            disabled={disabled}
            className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer pr-10 ${
              error ? 'border-red-500 dark:border-red-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('selectState')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('searchStates')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          )}

          {/* Error State */}
          {fetchError && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{fetchError}</p>
            </div>
          )}

          {/* States Table */}
          {!isLoading && !fetchError && states.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t('stateName')}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => sortStatesByName(true)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => sortStatesByName(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => (
                    <tr
                      key={state._id}
                      onClick={() => handleStateSelect(state)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-600"
                    >
                      <td className="p-3">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {state.name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !fetchError && states.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {search ? t('noStatesFound') : t('noStatesAvailable')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !fetchError && states.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('showingResults', { start: startIndex, end: endIndex, total: totalElements })}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3">
                  {t('pageOfPages', { current: currentPage, total: totalPages })}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}