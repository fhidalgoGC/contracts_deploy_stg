import { type CrmPerson } from '@/services/crm-people.service';
import { getSellers, getBuyers, getContactVendors, getTraders } from '@/services/crm-people.service';
import { PersonType, PersonTexts } from './PersonSelectionModal.types';

export const getServiceFunction = (personType: PersonType) => {
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

export const getDefaultTexts = (personType: PersonType, contractType: "purchase" | "sale" = "purchase"): PersonTexts => {
  switch (personType) {
    case 'sellers':
      return {
        triggerText: contractType === "sale" ? 'Seleccionar Comprador' : 'Seleccionar Vendedor',
        modalTitle: contractType === "sale" ? 'Seleccionar Comprador' : 'Seleccionar Vendedor',
        searchPlaceholder: contractType === "sale" ? 'Buscar compradores...' : 'Buscar vendedores...',
        noDataMessage: contractType === "sale" ? 'No se encontraron compradores' : 'No se encontraron vendedores',
        loadingMessage: contractType === "sale" ? "Cargando compradores..." : "Cargando vendedores...",
        searchingMessage: contractType === "sale" ? "Buscando compradores..." : "Buscando vendedores...",
      };
    case 'buyers':
      return {
        triggerText: 'Seleccionar Comprador',
        modalTitle: 'Seleccionar Comprador',
        searchPlaceholder: 'Buscar compradores...',
        noDataMessage: 'No se encontraron compradores',
        loadingMessage: "Cargando compradores...",
        searchingMessage: "Buscando compradores...",
      };
    case 'contactVendors':
      return {
        triggerText: 'Seleccionar Contact Vendor',
        modalTitle: 'Seleccionar Contact Vendor',
        searchPlaceholder: 'Buscar contact vendors...',
        noDataMessage: 'No se encontraron contact vendors',
        loadingMessage: "Cargando contact vendors...",
        searchingMessage: "Buscando contact vendors...",
      };
    case 'traders':
      return {
        triggerText: 'Seleccionar Trader',
        modalTitle: 'Seleccionar Trader',
        searchPlaceholder: 'Buscar traders...',
        noDataMessage: 'No se encontraron traders',
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

export const getDisplayName = (person: CrmPerson) => {
  return person.full_name || person.name || 'Sin nombre';
};

export const getOrganizationName = (person: CrmPerson) => {
  return person.organization_name || person.company_name || '';
};

export const getPrimaryEmail = (person: CrmPerson) => {
  if (person.emails?.length) {
    const principalEmail = person.emails.find(e => e.type === 'principal');
    return principalEmail?.value || person.emails[0].value;
  }
  return person.email || '';
};

export const getPersonType = (person: CrmPerson) => {
  return person.person_type || 'natural_person';
};