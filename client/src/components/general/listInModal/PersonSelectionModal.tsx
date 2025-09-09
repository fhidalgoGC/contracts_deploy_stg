import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSellers, getBuyers, getContactVendors, getTraders, type CrmPerson } from '@/services/crm-people.service';
import { User, Building2, Search, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PersonType = 'sellers' | 'buyers' | 'contactVendors' | 'traders';

interface PersonSelectionModalProps {
  onSelect: (person: { id: string; name: string; [key: string]: any }) => void;
  selectedPersonId?: string;
  selectedPersonName?: string;
  personType: PersonType;
  error?: boolean;
  triggerButtonText?: string;
  modalTitle?: string;
  searchPlaceholder?: string;
  noDataMessage?: string;
  contractType?: "purchase" | "sale";
}

export const PersonSelectionModal: React.FC<PersonSelectionModalProps> = ({
  onSelect,
  selectedPersonId,
  selectedPersonName,
  personType,
  error = false,
  triggerButtonText,
  modalTitle,
  searchPlaceholder,
  noDataMessage,
  contractType = "purchase"
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [people, setPeople] = useState<CrmPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Service mapping
  const getServiceFunction = () => {
    switch (personType) {
      case 'sellers':
        return getSellers;
      case 'buyers':
        return getBuyers;
      case 'contactVendors':
        return getContactVendors;
      case 'traders':
        return getTraders;
      default:
        return getSellers;
    }
  };

  // Default text configurations
  const getDefaultTexts = () => {
    switch (personType) {
      case 'sellers':
        return {
          triggerText: contractType === "sale" ? t('selectBuyer') : t('selectSeller'),
          modalTitle: contractType === "sale" ? t('selectBuyer') : t('selectSeller'),
          searchPlaceholder: contractType === "sale" ? t('searchBuyers') : t('searchSellers'),
          noDataMessage: contractType === "sale" ? t('noBuyersFound') : t('noSellersFound'),
          loadingMessage: contractType === "sale" ? "Cargando compradores..." : "Cargando vendedores...",
          searchingMessage: contractType === "sale" ? "Buscando compradores..." : "Buscando vendedores...",
        };
      case 'buyers':
        return {
          triggerText: t('selectBuyer'),
          modalTitle: t('selectBuyer'),
          searchPlaceholder: t('searchBuyers'),
          noDataMessage: t('noBuyersFound'),
          loadingMessage: "Cargando compradores...",
          searchingMessage: "Buscando compradores...",
        };
      case 'contactVendors':
        return {
          triggerText: t('selectContactVendor'),
          modalTitle: t('selectContactVendor'),
          searchPlaceholder: t('searchContactVendors'),
          noDataMessage: t('noContactVendorsFound'),
          loadingMessage: "Cargando contacto vendedores...",
          searchingMessage: "Buscando contacto vendedores...",
        };
      case 'traders':
        return {
          triggerText: t('selectTrader'),
          modalTitle: t('selectTrader'),
          searchPlaceholder: t('searchTraders'),
          noDataMessage: t('noTradersFound'),
          loadingMessage: "Cargando traders...",
          searchingMessage: "Buscando traders...",
        };
      default:
        return {
          triggerText: 'Seleccionar',
          modalTitle: 'Seleccionar',
          searchPlaceholder: 'Buscar...',
          noDataMessage: 'No se encontraron datos',
          loadingMessage: "Cargando...",
          searchingMessage: "Buscando...",
        };
    }
  };

  const defaultTexts = getDefaultTexts();

  // Load people when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log(`🔄 PersonModal: Modal opened for ${personType}, loading fresh data...`);
      setLoading(true);
      setPeople([]);
      setCurrentPage(1);
      setHasMore(true);
      setSearchTerm('');
      setLoadingMore(false);
      setSearchLoading(false);
      
      loadPeople(1, true);
    } else {
      setPeople([]);
      setLoading(false);
      setLoadingMore(false);
      setSearchLoading(false);
    }
  }, [isOpen]);

  // Debounce search with 200ms delay
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const trimmedSearch = searchTerm.trim();
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (trimmedSearch.length >= 2) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        console.log(`🔍 Debounced search triggered for ${personType}:`, trimmedSearch);
        setCurrentPage(1);
        setHasMore(true);
        loadPeople(1, true);
      }, 200);
    } else if (trimmedSearch.length === 0) {
      setCurrentPage(1);
      setHasMore(true);
      loadPeople(1, true);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const loadPeople = async (page: number = 1, reset: boolean = false) => {
    try {
      console.log(`🚀 PersonModal: Loading ${personType} - Page ${page}, Reset: ${reset}`);
      
      if (!reset) {
        setLoadingMore(true);
      }

      const searchOptions = {
        page, 
        limit: 5,
        ...(searchTerm.trim().length >= 2 && { search: searchTerm.trim() })
      };

      // Add sort for traders
      if (personType === 'traders') {
        (searchOptions as any).sort = { full_name: '1' };
      }

      const serviceFunction = getServiceFunction();
      const response = await serviceFunction(searchOptions);
      
      console.log(`✅ PersonModal: Loaded ${response.data.length} ${personType}`);
      console.log(`📊 PersonModal: Pagination - Page ${response._meta.page_number}/${response._meta.total_pages}, Total: ${response._meta.total_elements}`);
      
      if (reset) {
        setPeople(response.data);
      } else {
        setPeople(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response._meta.page_number < response._meta.total_pages);
      setCurrentPage(response._meta.page_number);
      
    } catch (error) {
      console.error(`❌ PersonModal: Error fetching ${personType}:`, error);
      if (reset) {
        setPeople([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearchLoading(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loadingMore && !loading && !searchLoading) {
      loadPeople(currentPage + 1, false);
    }
  };

  const handleSelectPerson = (person: CrmPerson) => {
    const personId = person._id || person.id;
    const personName = person.full_name || person.name;
    
    const personData = {
      id: personId,
      name: personName,
      ...person
    };

    onSelect(personData);
    setIsOpen(false);
    setSearchTerm('');
    console.log(`${personType} selected:`, personData);
  };

  const getDisplayName = (person: CrmPerson) => {
    return person.full_name || person.name || 'Sin nombre';
  };

  const getOrganizationName = (person: CrmPerson) => {
    return person.organization_name || person.company_name || '';
  };

  const getPrimaryEmail = (person: CrmPerson) => {
    if (person.emails?.length) {
      const principalEmail = person.emails.find(e => e.type === 'principal');
      return principalEmail?.value || person.emails[0].value;
    }
    return person.email || '';
  };

  const getPersonType = (person: CrmPerson) => {
    return person.person_type || 'natural_person';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full justify-start text-left font-normal ${
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/10' : ''
          } ${selectedPersonName ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
          data-testid={`button-select-${personType}`}
        >
          <User className="mr-2 h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm">
              {selectedPersonName || triggerButtonText || defaultTexts.triggerText}
            </span>
            {selectedPersonName && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {triggerButtonText || defaultTexts.triggerText}
              </span>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-full max-w-4xl h-[80vh] max-h-[80vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{modalTitle || defaultTexts.modalTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder || defaultTexts.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              data-testid={`input-search-${personType}`}
            />
            {/* Search loading indicator */}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-lg font-medium">{defaultTexts.loadingMessage}</p>
              <p className="mt-2 text-sm text-gray-500">Obteniendo datos del CRM</p>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <div className="relative flex-1 min-h-0 overflow-y-auto pr-2" onScroll={handleScroll}>
              {/* Search loading overlay */}
              {searchLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {defaultTexts.searchingMessage}
                    </p>
                  </div>
                </div>
              )}
              {people.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{noDataMessage || defaultTexts.noDataMessage}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {people.map((person, index) => (
                    <div
                      key={`${person._id || person.id}-${index}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700"
                      onClick={() => handleSelectPerson(person)}
                      data-testid={`card-${personType}-${person._id || person.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          {getPersonType(person) === 'juridical_person' ? (
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {getDisplayName(person)}
                            </h3>
                            <Badge variant={getPersonType(person) === 'juridical_person' ? 'default' : 'secondary'}>
                              {getPersonType(person) === 'juridical_person' ? 'Empresa' : 'Persona'}
                            </Badge>
                          </div>
                          
                          {getOrganizationName(person) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                              <Building2 className="inline h-3 w-3 mr-1" />
                              {getOrganizationName(person)}
                            </p>
                          )}
                          
                          {getPrimaryEmail(person) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              <Mail className="inline h-3 w-3 mr-1" />
                              {getPrimaryEmail(person)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Indicator */}
              {loadingMore && (
                <div className="flex justify-center items-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Cargando más...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};