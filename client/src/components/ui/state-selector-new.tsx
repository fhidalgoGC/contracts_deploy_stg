import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Search, X, ChevronUp, ArrowLeft, ArrowRight, SkipBack, SkipForward, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { State } from '@/features/states/types/state';
import { useStates } from '@/features/states/hooks/useStates';
import { Country } from '@/features/countries/types/country';

interface StateSelectorProps {
  value: string;
  onChange: (state: State | null) => void;
  selectedCountry: Country | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function StateSelector({ 
  value, 
  onChange, 
  selectedCountry,
  placeholder = "Select a state...", 
  disabled = false,
  error = false 
}: StateSelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Always pass countrySlug when country is selected, regardless of modal state
  const { states: hookStates, meta, isLoading, error: fetchError } = useStates({
    search: debouncedSearch,
    page: currentPage,
    pageSize,
    countrySlug: selectedCountry?.slug || '',
    sortOrder,
    language: i18n.language === 'es' ? 'es' : 'en'
  });

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Update local state when hook data changes
  useEffect(() => {
    if (hookStates) {
      setStates(hookStates);
    }
    if (meta) {
      setTotalPages(meta.total_pages);
      setTotalElements(meta.total_elements);
    }
  }, [hookStates, meta]);

  // Reset states when country changes
  useEffect(() => {
    console.log('StateSelector: Country change detected:', selectedCountry?.slug);
    if (selectedCountry) {
      setStates([]);
      setSelectedState(null);
      setCurrentPage(1);
      setSearch('');
      setDebouncedSearch('');
      onChange(null); // Clear selected state when country changes
    }
  }, [selectedCountry?.slug]);

  // Helper function to normalize text (title case)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get display name for state - State type only has 'name' property
  const getStateDisplayName = (state: State): string => {
    const displayName = state.name || '';
    return normalizeText(displayName);
  };

  // Sorting functions - triggers API call with sort parameter
  const sortStatesByName = (ascending: boolean) => {
    setSortOrder(ascending ? 'asc' : 'desc');
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Pagination functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Handle state selection
  const handleStateSelect = (state: State) => {
    console.log('StateSelector: State selected:', {
      name: getStateDisplayName(state),
      countrySlug: state.country_slug,
      code: state.code
    });
    
    setSelectedState(state);
    onChange(state);
    setIsOpen(false);
    // Reset search and pagination
    setSearch('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  const isDisabled = disabled || !selectedCountry;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            placeholder={selectedCountry ? placeholder : t('selectCountryFirst')}
            readOnly
            disabled={isDisabled}
            className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer pl-3 pr-10 ${
              error ? 'border-red-500 dark:border-red-500' : ''
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            {selectedCountry ? 
              `${t('selectStateOf')} ${i18n.language === 'es' ? selectedCountry.names.es : selectedCountry.names.en}` :
              t('stateSelect')
            }
          </DialogTitle>
        </DialogHeader>

        {!selectedCountry ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('selectCountryFirst')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Page Size Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
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

              {/* Page Size Selector */}
              <div className="flex items-center gap-2 min-w-fit">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('show')}:
                </span>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="10" className="hover:bg-gray-50 dark:hover:bg-gray-700">10</SelectItem>
                    <SelectItem value="25" className="hover:bg-gray-50 dark:hover:bg-gray-700">25</SelectItem>
                    <SelectItem value="50" className="hover:bg-gray-50 dark:hover:bg-gray-700">50</SelectItem>
                    <SelectItem value="100" className="hover:bg-gray-50 dark:hover:bg-gray-700">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
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
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
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
                                title={t('sortAscending')}
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => sortStatesByName(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={t('sortDescending')}
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
                              {getStateDisplayName(state)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !fetchError && states.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                    className="p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
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
                    className="p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}