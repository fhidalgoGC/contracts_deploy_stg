import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Search, MapPin, Loader2, ArrowLeft, ArrowRight, SkipBack, SkipForward, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useCities, City } from '../../features/cities/hooks/useCities';

interface Country {
  _id: string;
  slug: string;
  names: {
    es: string;
    en: string;
  };
  flag: string;
  status: string;
}

interface State {
  _id: string;
  name: string;
  code?: string;
  country_slug: string;
  names?: {
    es: string;
    en: string;
  };
}

interface CitySelectorProps {
  selectedCountry: Country | null;
  selectedState: State | null;
  selectedCity: City | null;
  onCityChange: (city: City | null) => void;
  disabled?: boolean;
}

export function CitySelector({ 
  selectedCountry, 
  selectedState, 
  selectedCity, 
  onCityChange, 
  disabled = false 
}: CitySelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    cities,
    meta,
    isLoading,
    fetchError,
    fetchCities,
    clearCities
  } = useCities();

  // Effect to trigger API calls when dependencies change
  useEffect(() => {
    console.log('CitySelector: Dependencies changed:', {
      countrySlug: selectedCountry?.slug,
      stateId: selectedState?._id,
      searchTerm,
      currentPage,
      pageSize,
      sortOrder
    });

    if (!selectedCountry?.slug || !selectedState?._id) {
      console.log('CitySelector: Missing country or state, clearing cities');
      clearCities();
      onCityChange(null);
      return;
    }

    // Trigger fetch with current parameters
    fetchCities({
      countrySlug: selectedCountry.slug,
      stateId: selectedState._id,
      search: searchTerm,
      page: currentPage,
      pageSize,
      sortOrder
    });
  }, [selectedCountry?.slug, selectedState?._id, searchTerm, currentPage, pageSize, sortOrder, fetchCities, clearCities, onCityChange]);

  // Clear city selection when country or state changes (but not on initial mount)
  const prevCountryRef = useRef(selectedCountry?.slug);
  const prevStateRef = useRef(selectedState?._id);
  
  useEffect(() => {
    const countryChanged = prevCountryRef.current !== selectedCountry?.slug;
    const stateChanged = prevStateRef.current !== selectedState?._id;
    
    if ((countryChanged || stateChanged) && (prevCountryRef.current !== undefined || prevStateRef.current !== undefined)) {
      console.log('CitySelector: Country or state actually changed, clearing city:', {
        country: selectedCountry?.slug,
        state: selectedState?._id,
        countryChanged,
        stateChanged
      });
      onCityChange(null);
    }
    
    prevCountryRef.current = selectedCountry?.slug;
    prevStateRef.current = selectedState?._id;
  }, [selectedCountry?.slug, selectedState?._id, onCityChange]);

  const handleCitySelect = (city: City) => {
    console.log('CitySelector: City selected:', city);
    onCityChange(city);
    setIsOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const sortCitiesByName = (ascending: boolean) => {
    setSortOrder(ascending ? 'asc' : 'desc');
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Helper function to normalize text (title case)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get city display name
  const getCityDisplayName = (city: City): string => {
    let displayName = '';
    if (city.names) {
      displayName = i18n.language === 'es' ? city.names.es : city.names.en;
    } else {
      displayName = city.name;
    }
    return normalizeText(displayName);
  };

  // Pagination calculations
  const totalElements = meta?.total_elements || 0;
  const totalPages = meta?.total_pages || 0;
  const startIndex = Math.min(((currentPage - 1) * pageSize) + 1, totalElements);
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Navigation functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || !selectedCountry || !selectedState}
          >
            <span className="text-gray-900 dark:text-white">
                {selectedCity ? getCityDisplayName(selectedCity) : 
                 !selectedCountry ? t('selectCountryFirst') :
                 !selectedState ? t('selectStateFirst') :
                 t('selectCity')}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              {selectedState ? 
                `${t('selectCityOf')} ${selectedState.names ? (i18n.language === 'es' ? selectedState.names.es : selectedState.names.en) : selectedState.name}` :
                t('citySelect')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Page Size Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('searchCities')}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
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
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#16a34a]" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading')}</span>
              </div>
            )}

            {/* Error State */}
            {fetchError && (
              <div className="flex items-center justify-center py-8">
                <p className="text-red-600 dark:text-red-400">{fetchError}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !fetchError && cities.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? t('noCitiesFound') : t('noCitiesAvailable')}
                </p>
              </div>
            )}

            {/* Cities Table */}
            {!isLoading && !fetchError && cities.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {t('cityName')}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => sortCitiesByName(true)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={t('sortAscending')}
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => sortCitiesByName(false)}
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
                      {cities.map((city) => (
                        <tr
                          key={city._id}
                          onClick={() => handleCitySelect(city)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-600"
                        >
                          <td className="p-3">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {getCityDisplayName(city)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !fetchError && cities.length > 0 && totalPages > 1 && (
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
        </DialogContent>
      </Dialog>
  );
}