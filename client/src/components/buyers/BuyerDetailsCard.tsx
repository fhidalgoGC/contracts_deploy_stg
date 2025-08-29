import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Buyer } from '@/features/buyers/types';
import { 
  formatBuyerId, 
  formatDate, 
  formatPersonType,
  getBuyerEmails, 
  getBuyerPhones 
} from '@/lib/formatters';
import * as Portal from '@radix-ui/react-portal';

interface BuyerDetailsCardProps {
  buyer: Buyer;
}

export default function BuyerDetailsCard({ buyer }: BuyerDetailsCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const emails = getBuyerEmails(buyer.emails);
  const phones = getBuyerPhones(buyer.phones);

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.right + 10,
      y: rect.top + (rect.height / 2) - 140
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        className="cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Avatar className="w-8 h-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors">
          <AvatarFallback className="bg-transparent">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      {isVisible && (
        <Portal.Root>
          <div
            className="fixed w-80 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-lg z-[9999]"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 bg-gray-100 dark:bg-gray-800">
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                    {buyer.full_name ? buyer.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {buyer.full_name || t('unknownBuyer')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('buyerId')}: {formatBuyerId(buyer._id)}
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-200/50 dark:bg-gray-700/50" />

              {/* Details */}
              <div className="space-y-2">
                {/* Registration Date */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                    {t('registrationDate')}:
                  </span>
                  <span className="text-xs text-gray-900 dark:text-white ml-2 text-right">
                    {formatDate(buyer.created_at, currentLanguage)}
                  </span>
                </div>

                {/* Person Type */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                    {t('personType')}:
                  </span>
                  <span className="text-xs text-gray-900 dark:text-white ml-2 text-right">
                    {formatPersonType(buyer.person_type, currentLanguage)}
                  </span>
                </div>

                {/* Email(s) */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                    {t('email')}:
                  </span>
                  <div className="ml-2 text-right">
                    {emails.length > 0 ? (
                      emails.map((email, index) => (
                        <div key={index} className="text-xs text-gray-900 dark:text-white">
                          {email}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>

                {/* Phone(s) */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                    {t('phoneNumber')}:
                  </span>
                  <div className="ml-2 text-right">
                    {phones.length > 0 ? (
                      phones.map((phone, index) => (
                        <div key={index} className="text-xs text-gray-900 dark:text-white">
                          {phone}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal.Root>
      )}
    </>
  );
}