import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

/**
 * Formats a buyer ID by taking the last 6 characters and converting to uppercase
 */
export function formatBuyerId(id: string): string {
  return id.toUpperCase().slice(-6);
}

export function formatSellerId(id: string): string {
  return id.toUpperCase().slice(-6);
}

/**
 * Formats a date string to a readable format based on locale
 */
export function formatDate(dateString: string, locale: string = 'es'): string {
  try {
    const date = new Date(dateString);
    const dateLocale = locale === 'es' ? es : enUS;
    
    return format(date, 'PPP', { locale: dateLocale });
  } catch (error) {
    return dateString;
  }
}

/**
 * Formats person type from API value to display text
 */
export function formatPersonType(personType: string, locale: string = 'es'): string {
  const translations = {
    es: {
      juridical_person: 'Persona Jurídica',
      natural_person: 'Persona Moral'
    },
    en: {
      juridical_person: 'Legal Entity',
      natural_person: 'Natural Person'
    }
  };
  
  const localeTranslations = translations[locale as keyof typeof translations] || translations.es;
  return localeTranslations[personType as keyof typeof localeTranslations] || personType;
}

/**
 * Extracts and formats email from buyer emails array
 */
export function formatBuyerEmail(emails: any[]): string {
  if (!emails || emails.length === 0) {
    return '-';
  }
  
  const primaryEmail = emails.find(email => email.value);
  return primaryEmail?.value || '-';
}

/**
 * Extracts and formats phone from buyer phones array
 */
export function formatBuyerPhone(phones: any[]): string {
  if (!phones || phones.length === 0) {
    return '-';
  }
  
  const primaryPhone = phones.find(phone => phone.calling_code && phone.phone_number);
  if (!primaryPhone) {
    return '-';
  }
  
  return `${primaryPhone.calling_code} ${primaryPhone.phone_number}`;
}

/**
 * Extracts all emails from buyer emails array
 */
export function getBuyerEmails(emails: any[]): string[] {
  if (!emails || emails.length === 0) {
    return [];
  }
  
  return emails.filter(email => email.value).map(email => email.value);
}

/**
 * Extracts all phones from buyer phones array
 */
export function getBuyerPhones(phones: any[]): string[] {
  if (!phones || phones.length === 0) {
    return [];
  }
  
  return phones
    .filter(phone => phone.calling_code && phone.phone_number)
    .map(phone => `${phone.calling_code} ${phone.phone_number}`);
}