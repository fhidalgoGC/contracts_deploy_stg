import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountries } from '@/features/countries/hooks/useCountriesNew';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, Loader2, X, ArrowUpDown } from 'lucide-react';
import type { Country } from '@/features/countries/types/country';
import { FlagImage } from './flag-image';

interface CountrySelectorProps {
  value?: string;
  onChange: (country: Country | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function CountrySelector({ value, onChange, placeholder, disabled, error }: CountrySelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const language = i18n.language === 'es' ? 'es' : 'en';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [countries, setCountries] = useState<Country[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { fetchCountries, isLoading, error: fetchError } = useCountries({
    search: debouncedSearch,
    page: currentPage,
    pageSize
  });

  // Load countries when modal opens or search/page changes
  useEffect(() => {
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen, debouncedSearch, currentPage]);

  const loadCountries = async () => {
    const result = await fetchCountries();
    if (result) {
      setCountries(result.data);
      setTotalPages(result._meta.total_pages);
      setTotalElements(result._meta.total_elements);
    }
  };
  const startElement = totalElements > 0 ? ((currentPage - 1) * pageSize) + 1 : 0;
  const endElement = Math.min(currentPage * pageSize, totalElements);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    console.log('CountrySelector: Country selected:', {
      name: getCountryDisplayName(country),
      slug: country.slug,
      hasFlag: !!country.flag,
      flagSrc: country.flag
    });
    
    setSelectedCountry(country);
    onChange(country);
    setIsOpen(false);
    // Reset search and pagination
    setSearch('');
    setCurrentPage(1);
  };

  // Display name based on language
  const getCountryDisplayName = (country: Country) => {
    return language === 'es' ? country.names.es : country.names.en;
  };

  // Clear selection
  const handleClear = () => {
    setSelectedCountry(null);
    onChange(null);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch('');
  };

  // Toggle sort order
  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Sort countries locally for demo mode or when API doesn't handle sorting
  const sortedCountries = useMemo(() => {
    if (!countries) return [];
    
    return [...countries].sort((a, b) => {
      const aName = getCountryDisplayName(a);
      const bName = getCountryDisplayName(b);
      
      if (sortOrder === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    });
  }, [countries, sortOrder, language]);

  return (
    <>
      {/* Country Input Field */}
      <div className="space-y-1">
        <div className="relative">
          <Input
            value={selectedCountry ? getCountryDisplayName(selectedCountry) : ''}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(true)}
            className={`h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer pr-10 ${
              selectedCountry ? 'pl-12' : 'pl-4'
            } ${error ? 'border-red-500 dark:border-red-500' : ''}`}
          />
          {selectedCountry && (
            <FlagImage
              key={`flag-input-${selectedCountry._id}`}
              src={selectedCountry.flag}
              alt={getCountryDisplayName(selectedCountry)}
              countrySlug={selectedCountry.slug}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-4 object-cover rounded border border-gray-200 dark:border-gray-600 pointer-events-none"
            />
          )}
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        
        {selectedCountry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-0 h-auto"
          >
            {t('clear', 'Clear selection')}
          </Button>
        )}
      </div>

      {/* Country Selection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              {t('countrySelect', 'Select Country')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full space-y-4 pt-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('search', 'Search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`pl-10 h-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                    search ? 'pr-10' : 'pr-4'
                  }`}
                />
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </Button>
                )}
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t('rowsPerPage', 'Rows per page')}:
                </Label>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Countries Table */}
            <div className="flex-1 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('loading', 'Loading...')}
                  </div>
                </div>
              ) : apiError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <p className="font-medium">Error loading countries</p>
                    <p className="text-sm mt-1">{apiError.message}</p>
                  </div>
                </div>
              ) : countries.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="font-medium">{t('noResults', 'No results found')}</p>
                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 w-16">
                          Flag
                        </th>
                        <th className="text-left p-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                          <Button
                            variant="ghost"
                            onClick={handleSort}
                            className="flex items-center gap-2 p-0 h-auto font-medium hover:bg-transparent"
                          >
                            {t('countryName', 'Country Name')}
                            <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCountries.map((country) => (
                        <tr 
                          key={country._id}
                          onClick={() => handleCountrySelect(country)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-600"
                        >
                          <td className="p-3">
                            <FlagImage
                              key={`flag-table-${country._id}`}
                              src={country.flag}
                              alt={getCountryDisplayName(country)}
                              countrySlug={country.slug}
                              className="w-8 h-6 object-cover rounded border border-gray-200 dark:border-gray-600"
                            />
                          </td>
                          <td className="p-3 text-gray-900 dark:text-white font-medium">
                            {getCountryDisplayName(country)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination and Info */}
            {!isLoading && !apiError && countries.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Results Info */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('showing', 'Showing')} {startElement} {t('to', 'to')} {endElement} {t('of', 'of')} {totalElements} {t('results', 'results')}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                    {t('page', 'Page')} {currentPage} {t('of', 'of')} {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}