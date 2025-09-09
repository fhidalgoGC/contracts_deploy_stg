import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Building2, Search, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type CrmPerson } from '@/services/crm-people.service';
import { PersonSelectionModalProps } from './PersonSelectionModal.types';
import { usePersonSelection } from './PersonSelectionModal.hooks';
import { useTranslation } from 'react-i18next';
import { getDefaultTexts, getDisplayName, getOrganizationName, getPrimaryEmail, getPersonType } from './PersonSelectionModal.utils';

export const PersonSelectionModalView: React.FC<PersonSelectionModalProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { people, loading, loadingMore, searchLoading, hasMore, handleLoadMore } = usePersonSelection(
    personType, 
    isOpen, 
    searchTerm
  );

  const { t } = useTranslation();
  const defaultTexts = getDefaultTexts(personType, contractType, t);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop === clientHeight) {
      handleLoadMore();
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
              <p className="mt-2 text-sm text-gray-500">{t('loadingData')}</p>
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
                              {getDisplayName(person, t)}
                            </h3>
                            <Badge variant={getPersonType(person) === 'juridical_person' ? 'default' : 'secondary'}>
                              {getPersonType(person) === 'juridical_person' ? t('company') : t('person')}
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
                  <span className="ml-2 text-sm text-gray-500">{t('loadingMore')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};