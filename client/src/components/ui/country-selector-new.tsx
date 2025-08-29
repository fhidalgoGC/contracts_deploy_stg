import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X, ChevronUp, ArrowLeft, ArrowRight, SkipBack, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Country } from '@/features/countries/types/country';
import { useCountries } from '@/features/countries/hooks/useCountriesNew';
import { FlagImage } from './flag-image';

interface CountrySelectorProps {
  value: string;
  onChange: (country: Country | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function CountrySelector({ 
  value, 
  onChange, 
  placeholder = "Select a country...", 
  disabled = false,
  error = false 
}: CountrySelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  const { fetchCountries, isLoading, error: fetchError } = useCountries({
    search: debouncedSearch,
    page: currentPage,
    pageSize,
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

  // Load countries when modal opens or debounced search/page/sort changes
  useEffect(() => {
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen, debouncedSearch, currentPage, sortOrder]);

  const loadCountries = async () => {
    const result = await fetchCountries();
    if (result) {
      setCountries(result.data);
      setTotalPages(result._meta.total_pages);
      setTotalElements(result._meta.total_elements);
    }
  };

  // Get display name for country based on current language
  const getCountryDisplayName = (country: Country): string => {
    if (country.names) {
      return i18n.language === 'es' ? country.names.es : country.names.en;
    }
    return country.name || '';
  };

  // Sorting functions - now triggers API call with sort parameter
  const sortCountriesByName = (ascending: boolean) => {
    setSortOrder(ascending ? 'asc' : 'desc');
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Pagination functions
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
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
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('countrySelect')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('search')}
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

          {/* Countries Table */}
          {!isLoading && !fetchError && countries.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="p-3 text-left w-16">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {t('flag')}
                      </span>
                    </th>
                    <th className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t('countryName')}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => sortCountriesByName(true)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => sortCountriesByName(false)}
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
                  {countries.map((country) => (
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
                      <td className="p-3">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {getCountryDisplayName(country)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !fetchError && countries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {search ? t('noCountriesFound') : t('noCountriesAvailable')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !fetchError && countries.length > 0 && totalPages > 1 && (
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