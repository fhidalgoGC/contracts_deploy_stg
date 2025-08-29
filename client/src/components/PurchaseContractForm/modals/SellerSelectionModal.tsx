import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSellers, getBuyers, type CrmPerson } from '@/services/crm-people.service';
import { User, Building2, Search, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SellerSelectionModalProps {
  onSelect: (seller: { id: string; name: string; [key: string]: any }) => void;
  selectedSeller?: string;
  selectedSellerName?: string; // Add name for display
  error?: boolean;
  contractType?: "purchase" | "sale"; // Determine which service to call
}

export const SellerSelectionModal: React.FC<SellerSelectionModalProps> = ({
  onSelect,
  selectedSeller,
  selectedSellerName,
  error = false,
  contractType = "purchase"
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sellers, setSellers] = useState<CrmPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load sellers when modal opens - always fresh data
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 SellerModal: Modal opened, loading fresh data...');
      // Reset state immediately when modal opens
      setLoading(true);
      setSellers([]);
      setCurrentPage(1);
      setHasMore(true);
      setSearchTerm('');
      setLoadingMore(false);
      
      // Load fresh data
      loadSellers(1, true);
    } else {
      // Reset everything when modal closes
      setSellers([]);
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isOpen]);

  // Reset search
  useEffect(() => {
    if (searchTerm.trim()) {
      // When searching, reset pagination and load first page
      setCurrentPage(1);
      setHasMore(true);
      loadSellers(1, true);
    }
  }, [searchTerm]);

  const loadSellers = async (page: number = 1, reset: boolean = false) => {
    try {
      const participantType = contractType === "sale" ? "buyers" : "sellers";
      console.log(`🚀 SellerModal: Loading ${participantType} - Page ${page}, Reset: ${reset}`);
      
      if (!reset) {
        setLoadingMore(true);
      }
      // Note: loading state is already set in useEffect for reset case

      // Call the appropriate service based on contract type
      const response = contractType === "sale" 
        ? await getBuyers({ page, limit: 5 })
        : await getSellers({ page, limit: 5 });
      console.log(`✅ SellerModal: Loaded ${response.data.length} ${participantType}`);
      console.log(`📊 SellerModal: Pagination - Page ${response._meta.page_number}/${response._meta.total_pages}, Total: ${response._meta.total_elements}`);
      
      if (reset) {
        setSellers(response.data);
      } else {
        setSellers(prev => [...prev, ...response.data]);
      }
      
      // Check if there are more pages using the correct pagination structure
      setHasMore(response._meta.page_number < response._meta.total_pages);
      setCurrentPage(response._meta.page_number);
      
    } catch (error) {
      const participantType = contractType === "sale" ? "buyers" : "sellers";
      console.error(`❌ SellerModal: Error fetching ${participantType}:`, error);
      if (reset) {
        setSellers([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // When user scrolls to bottom and there are more items to load
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loadingMore && !loading) {
      loadSellers(currentPage + 1, false);
    }
  };

  // Filter sellers based on search term
  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return sellers;
    
    const search = searchTerm.toLowerCase();
    return sellers.filter(seller => {
      const fullName = seller.full_name?.toLowerCase() || '';
      const orgName = seller.organization_name?.toLowerCase() || '';
      const email = seller.emails?.find(e => e.type === 'principal')?.value?.toLowerCase() || '';
      
      return fullName.includes(search) || 
             orgName.includes(search) || 
             email.includes(search);
    });
  }, [sellers, searchTerm]);

  const handleSelectSeller = (seller: CrmPerson) => {
    onSelect({
      id: seller._id,
      name: seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
      ...seller
    });
    setIsOpen(false);
  };

  // Use the stored name from form state for display, or find in current data
  const selectedSellerData = selectedSellerName 
    ? { _id: selectedSeller, full_name: selectedSellerName } 
    : sellers.find(seller => seller._id === selectedSeller);

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              error ? 'border-red-500 focus:border-red-500' : ''
            } ${
              selectedSellerData
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center space-x-2 w-full">
              {selectedSellerData ? (
                <>
                  {selectedSellerData.person_type === 'juridical_person' ? (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-green-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{selectedSellerData.full_name}</span>
                    {selectedSellerData.organization_name && (
                      <span className="text-xs text-gray-500">
                        {selectedSellerData.organization_name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{contractType === "sale" ? t('selectBuyer') : t('selectSeller')}</span>
                </>
              )}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{contractType === "sale" ? t('selectBuyer') : t('selectSeller')}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={contractType === "sale" ? t('searchBuyers') : t('searchSellers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg font-medium">{contractType === "sale" ? "Cargando compradores..." : "Cargando vendedores..."}</p>
                <p className="mt-2 text-sm text-gray-500">Obteniendo datos del CRM</p>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <div className="max-h-96 overflow-y-auto" onScroll={handleScroll}>
                {filteredSellers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{contractType === "sale" ? t('noBuyersFound') : t('noSellersFound')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSellers.map((seller) => {
                      const primaryEmail = seller.emails?.find(e => e.type === 'principal')?.value;
                      const isSelected = seller._id === selectedSeller;
                      
                      return (
                        <div
                          key={seller._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => handleSelectSeller(seller)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {seller.person_type === 'juridical_person' ? (
                                <Building2 className="h-8 w-8 text-blue-500" />
                              ) : (
                                <User className="h-8 w-8 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                  {seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim()}
                                </h3>
                                <Badge variant={seller.person_type === 'juridical_person' ? 'default' : 'secondary'}>
                                  {seller.person_type === 'juridical_person' ? 'Empresa' : 'Individual'}
                                </Badge>
                              </div>
                              
                              {seller.organization_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {seller.organization_name}
                                </p>
                              )}
                              
                              {primaryEmail && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Mail className="h-4 w-4" />
                                  <span>{primaryEmail}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Loading more indicator */}
                    {loadingMore && (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando más...</p>
                      </div>
                    )}
                    
                    {/* End of results indicator */}
                    {!hasMore && sellers.length > 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No hay más resultados
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{t('selectSeller')}</p>
      )}
    </div>
  );
};