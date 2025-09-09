import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Building2, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTraders, type CrmPeopleResponse } from '@/services/crm-people.service';

interface Trader {
  _id: string;
  full_name: string;
  organization_name?: string;
  person_type: 'natural_person' | 'juridical_person';
  emails?: Array<{ value: string }>;
  phones?: Array<{ calling_code: string; phone_number: string }>;
  [key: string]: any;
}

interface TraderSelectionModalProps {
  onSelect: (trader: { id: string; name: string; [key: string]: any }) => void;
  selectedTrader?: string;
  selectedTraderName?: string; // Add name for display
  error?: boolean;
}

export const TraderSelectionModal: React.FC<TraderSelectionModalProps> = ({
  onSelect,
  selectedTrader,
  selectedTraderName,
  error = false
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTraders = async (page: number, reset: boolean = false) => {
    try {
      setLoading(true);
      console.log(`🚀 TraderModal: Loading traders - Page ${page}, Reset: ${reset}`);

      const response: CrmPeopleResponse = await getTraders({
        page,
        limit: 5,
        sort: { full_name: '1' }
      });

      const newTraders = response.data || [];
      const totalPages = response._meta?.total_pages || response._meta?.totalPages || 1;
      const total = response._meta?.total_elements || response._meta?.totalCount || 0;
      
      if (reset) {
        setTraders(newTraders);
      } else {
        setTraders(prev => [...prev, ...newTraders]);
      }

      setCurrentPage(page);
      setTotalPages(totalPages);
      setHasMore(page < totalPages);

      console.log(`✅ TraderModal: Loaded ${newTraders.length} traders`);
      console.log(`📊 TraderModal: Pagination - Page ${page}/${totalPages}, Total: ${total}`);
    } catch (error) {
      console.error('❌ TraderModal: Error fetching traders:', error);
      setTraders([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      console.log('🔄 TraderModal: Modal opened, loading fresh data...');
      setCurrentPage(1);
      setSearchTerm('');
      loadTraders(1, true);
    }
  };

  const handleSelectTrader = (trader: Trader) => {
    const traderData = {
      id: trader._id,
      name: trader.full_name,
      ...trader
    };

    onSelect(traderData);
    setIsOpen(false);
    setSearchTerm('');
    console.log('Trader selected:', traderData);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      loadTraders(nextPage, false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Trigger load more when scrolled near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      handleLoadMore();
    }
  };

  const filteredTraders = useMemo(() => {
    if (!searchTerm.trim()) return traders;
    
    const search = searchTerm.toLowerCase();
    return traders.filter(trader =>
      trader.full_name?.toLowerCase().includes(search) ||
      trader.organization_name?.toLowerCase().includes(search)
    );
  }, [traders, searchTerm]);

  // Use the stored name from form state for display, or find in current data
  const selectedTraderData = selectedTraderName 
    ? { _id: selectedTrader, full_name: selectedTraderName, person_type: 'natural_person' as const, organization_name: undefined }
    : traders.find(trader => trader._id === selectedTrader);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`w-full h-12 justify-start text-left font-normal ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
          } hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          <div className="flex items-center gap-2 w-full">
            <Search className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-2 flex-1">
              {selectedTraderData ? (
                <>                
                  {selectedTraderData.person_type === 'juridical_person' ? (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-green-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{selectedTraderData.full_name}</span>
                    {selectedTraderData.organization_name && (
                      <span className="text-xs text-gray-500">
                        {selectedTraderData.organization_name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Select Trader</span>
              )}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Trader</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div 
            className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2"
            onScroll={handleScroll}
          >
            {loading && traders.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading traders...</span>
              </div>
            ) : filteredTraders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {traders.length === 0 ? 'No traders found in CRM' : 'No traders match your search'}
              </div>
            ) : (
              <>
                {filteredTraders.map((trader) => (
                  <div
                    key={trader._id}
                    onClick={() => handleSelectTrader(trader)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {trader.person_type === 'juridical_person' ? (
                            <Building2 className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-green-500" />
                          )}
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {trader.full_name}
                          </h3>
                          <Badge variant={trader.person_type === 'juridical_person' ? 'default' : 'secondary'}>
                            {trader.person_type === 'juridical_person' ? 'Company' : 'Individual'}
                          </Badge>
                        </div>
                        
                        {trader.organization_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {trader.organization_name}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {trader.emails && trader.emails.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{trader.emails[0].value}</span>
                            </div>
                          )}
                          {trader.phones && trader.phones.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{trader.phones[0].calling_code} {trader.phones[0].phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading more indicator */}
                {loading && traders.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="ml-2 text-sm text-gray-600">Loading more...</span>
                  </div>
                )}

                {/* Load more button */}
                {!loading && hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLoadMore}
                      className="text-sm"
                    >
                      Load More ({currentPage}/{totalPages})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TraderSelectionModal;