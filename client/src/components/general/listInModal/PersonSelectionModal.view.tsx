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
import './PersonSelectionModal.css';

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
          className={`person-selection-trigger ${
            error ? 'error' : ''
          } ${selectedPersonName ? 'selected' : 'placeholder'}`}
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
      <DialogContent className="person-selection-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{modalTitle || defaultTexts.modalTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="person-selection-container">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder || defaultTexts.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="person-selection-search"
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
            <div className="person-selection-loading">
              <div className="person-selection-loading-spinner"></div>
              <p className="person-selection-loading-text">{defaultTexts.loadingMessage}</p>
              <p className="person-selection-loading-subtext">{t('loadingData')}</p>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <div className="person-selection-results" onScroll={handleScroll}>
              {/* Search loading overlay */}
              {searchLoading && (
                <div className="person-selection-search-overlay">
                  <div className="person-selection-search-loading">
                    <div className="person-selection-search-spinner"></div>
                    <p className="person-selection-search-text">
                      {defaultTexts.searchingMessage}
                    </p>
                  </div>
                </div>
              )}
              {people.length === 0 ? (
                <div className="person-selection-empty">
                  <User className="person-selection-empty-icon" />
                  <p>{noDataMessage || defaultTexts.noDataMessage}</p>
                </div>
              ) : (
                <div className="person-selection-grid">
                  {people.map((person, index) => (
                    <div
                      key={`${person._id || person.id}-${index}`}
                      className="person-selection-card"
                      onClick={() => handleSelectPerson(person)}
                      data-testid={`card-${personType}-${person._id || person.id}`}
                    >
                      <div className="person-selection-card-content">
                        <div className="person-selection-avatar">
                          {getPersonType(person) === 'juridical_person' ? (
                            <Building2 className="person-selection-avatar-icon" />
                          ) : (
                            <User className="person-selection-avatar-icon" />
                          )}
                        </div>
                        
                        <div className="person-selection-info">
                          <div className="person-selection-header">
                            <h3 className="person-selection-name">
                              {getDisplayName(person, t)}
                            </h3>
                            <Badge variant={getPersonType(person) === 'juridical_person' ? 'default' : 'secondary'}>
                              {getPersonType(person) === 'juridical_person' ? t('company') : t('person')}
                            </Badge>
                          </div>
                          
                          {getOrganizationName(person) && (
                            <p className="person-selection-organization">
                              <Building2 className="inline h-3 w-3 mr-1" />
                              {getOrganizationName(person)}
                            </p>
                          )}
                          
                          {getPrimaryEmail(person) && (
                            <p className="person-selection-email">
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
                <div className="person-selection-load-more">
                  <div className="person-selection-load-more-spinner"></div>
                  <span className="person-selection-load-more-text">{t('loadingMore')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};