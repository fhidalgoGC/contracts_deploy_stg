import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Jerarquía de navegación - define qué páginas son "padre" de otras
export const NAVIGATION_HIERARCHY: Record<string, string[]> = {
  // Páginas principales (nivel 0)
  'dashboard': [],
  'purchaseContracts': [],
  'buyers': [],
  'sellers': [],
  'saleContracts': [],
  
  // Detalles de contratos (nivel 1 - hijos de purchaseContracts)
  'contractDetail': ['purchaseContracts'],
  
  // Crear sub-contrato (nivel 2 - hijo de contractDetail)
  'createSubContract': ['purchaseContracts', 'contractDetail'],
};

// Función para obtener el nivel jerárquico de una página
export const getPageLevel = (pageKey: string): number => {
  const hierarchy = NAVIGATION_HIERARCHY[pageKey] || [];
  return hierarchy.length;
};

// Función para verificar si una página es ancestro de otra
export const isAncestorPage = (ancestorPage: string, childPage: string): boolean => {
  const hierarchy = NAVIGATION_HIERARCHY[childPage] || [];
  return hierarchy.includes(ancestorPage);
};

// Definir tipos para el estado de cada página
interface ContractsPageState {
  searchTerm: string;
  filters: Record<string, any>;
  selectedItems: string[];
  sortOrder: string;
  currentPage: number;
  pageSize: number;
  contractsData: any[]; // Almacenar datos de contratos
}

interface ContractDetailState {
  activeTab: string;
  subContractFilters: Record<string, any>;
  expandedSections: string[];
  contractData?: any; // Datos del contrato actual
  lastRefresh?: number; // Timestamp del último refresh
}

interface CreateSubContractState {
  formData: Record<string, any>;
  selectedCommodity: string | null;
  selectedMeasurementUnit: string | null;
  pricingType: 'fixed' | 'basis';
  parentContractData: any | null; // Estado del contrato principal
  subContractsData: any[]; // Sub-contratos del contrato principal
  subContractKey: string | null; // Key from API for sub-contract creation
}

interface EditSubContractState {
  formData: Record<string, any>;
  selectedCommodity: string | null;
  selectedMeasurementUnit: string | null;
  pricingType: 'fixed' | 'basis';
  parentContractData: any | null; // Estado del contrato principal
  subContractsData: any[]; // Sub-contratos del contrato principal
  currentSubContractData: any | null; // Sub-contrato actual a editar
  subContractId: string | null; // ID del sub-contrato que se está editando
}

interface PageState {
  purchaseContracts: ContractsPageState;
  contractDetail: Record<string, ContractDetailState>; // Por ID de contrato
  createSubContract: Record<string, CreateSubContractState>; // Por ID de contrato
  editSubContract: Record<string, EditSubContractState>; // Por ID de contrato
  buyers: ContractsPageState;
  sellers: ContractsPageState;
  saleContracts: ContractsPageState;
  lastVisited: {
    path: string;
    timestamp: number;
  };
  // Navegación jerárquica
  currentPagePath: string[]; // Ruta actual de páginas [nivel0, nivel1, nivel2]
}

const initialContractsState: ContractsPageState = {
  searchTerm: '',
  filters: {},
  selectedItems: [],
  sortOrder: '',
  currentPage: 1,
  pageSize: 10,
  contractsData: [],
};

const initialContractDetailState: ContractDetailState = {
  activeTab: 'general',
  subContractFilters: {},
  expandedSections: [],
};

const initialCreateSubContractState: CreateSubContractState = {
  formData: {},
  selectedCommodity: null,
  selectedMeasurementUnit: null,
  pricingType: 'fixed',
  parentContractData: null,
  subContractsData: [],
  subContractKey: null,
};

const initialEditSubContractState: EditSubContractState = {
  formData: {},
  selectedCommodity: null,
  selectedMeasurementUnit: null,
  pricingType: 'fixed',
  parentContractData: null,
  subContractsData: [],
  currentSubContractData: null,
  subContractId: null,
};

const initialState: PageState = {
  purchaseContracts: initialContractsState,
  contractDetail: {},
  createSubContract: {},
  editSubContract: {},
  buyers: initialContractsState,
  sellers: initialContractsState,
  saleContracts: initialContractsState,
  lastVisited: {
    path: '/',
    timestamp: Date.now(),
  },
  currentPagePath: [],
};

const pageStateSlice = createSlice({
  name: 'pageState',
  initialState,
  reducers: {
    // Acción para manejar navegación jerárquica
    navigateToPage: (state, action: PayloadAction<{ pageKey: string; contractId?: string }>) => {
      const { pageKey, contractId } = action.payload;
      const currentPath = [...state.currentPagePath];
      const newLevel = getPageLevel(pageKey);
      const currentLastPage = currentPath[currentPath.length - 1];
      
      console.log(`🚀 NAVEGACIÓN JERÁRQUICA: ${pageKey}, nivel: ${newLevel}, path actual:`, currentPath, `última página: ${currentLastPage}`);
      
      // Si navegamos a un nivel más profundo (hacia adentro), mantener el estado
      if (newLevel > currentPath.length) {
        // Navegación hacia adentro: mantener estado anterior
        const newPath = [...NAVIGATION_HIERARCHY[pageKey], pageKey];
        state.currentPagePath = newPath;
        console.log('Navegación hacia adentro - manteniendo estado. Nuevo path:', newPath);
      } 
      // Si navegamos al mismo nivel o hacia afuera, limpiar estados según la lógica
      else {
        const hierarchyForPage = NAVIGATION_HIERARCHY[pageKey] || [];
        const newPath = [...hierarchyForPage, pageKey];
        
        // Caso especial: navegación entre páginas hermanas del mismo nivel
        if (newLevel === 0 && currentPath.length > 0) {
          const isNavigatingBetweenTopLevelPages = ['purchaseContracts', 'buyers', 'sellers', 'saleContracts', 'dashboard'].includes(pageKey) && 
            ['purchaseContracts', 'buyers', 'sellers', 'saleContracts', 'dashboard'].includes(currentLastPage);
          
          if (isNavigatingBetweenTopLevelPages && pageKey !== currentLastPage) {
            console.log(`🔄 NAVEGACIÓN ENTRE PÁGINAS PRINCIPALES: ${currentLastPage} → ${pageKey}`);
            
            // Limpiar el estado de la página anterior Y de la página de destino
            if (currentLastPage === 'purchaseContracts') {
              console.log('🧹 Limpiando estado de purchaseContracts (página anterior)');
              state.purchaseContracts = { ...initialContractsState };
            } else if (currentLastPage === 'buyers') {
              console.log('🧹 Limpiando estado de buyers (página anterior)');
              state.buyers = { ...initialContractsState };
            } else if (currentLastPage === 'sellers') {
              console.log('🧹 Limpiando estado de sellers (página anterior)');
              state.sellers = { ...initialContractsState };
            } else if (currentLastPage === 'saleContracts') {
              console.log('🧹 Limpiando estado de saleContracts (página anterior)');
              state.saleContracts = { ...initialContractsState };
            }
            
            // IMPORTANTE: También limpiar el estado de la página de destino para comenzar limpio
            if (pageKey === 'purchaseContracts') {
              console.log('🧹 Limpiando estado de purchaseContracts (página destino)');
              state.purchaseContracts = { ...initialContractsState };
            } else if (pageKey === 'buyers') {
              console.log('🧹 Limpiando estado de buyers (página destino)');
              state.buyers = { ...initialContractsState };
            } else if (pageKey === 'sellers') {
              console.log('🧹 Limpiando estado de sellers (página destino)');
              state.sellers = { ...initialContractsState };
            } else if (pageKey === 'saleContracts') {
              console.log('🧹 Limpiando estado de saleContracts (página destino)');
              state.saleContracts = { ...initialContractsState };
            }
            
            // También limpiar estados de páginas más profundas
            state.contractDetail = {};
            state.createSubContract = {};
          }
        }
        
        // Identificar qué páginas se están abandonando (navegación hacia afuera)
        const abandonedPages = currentPath.slice(newLevel + 1);
        console.log('Páginas abandonadas:', abandonedPages);
        
        // Limpiar estados de las páginas abandonadas
        abandonedPages.forEach(abandonedPage => {
          console.log(`Limpiando estado de página abandonada: ${abandonedPage}`);
          
          if (abandonedPage === 'contractDetail' && contractId) {
            delete state.contractDetail[contractId];
          } else if (abandonedPage === 'createSubContract' && contractId) {
            delete state.createSubContract[contractId];
          }
        });
        
        state.currentPagePath = newPath;
        console.log('Navegación completada. Nuevo path:', newPath);
      }
      
      // Actualizar última página visitada
      state.lastVisited = {
        path: pageKey + (contractId ? `/${contractId}` : ''),
        timestamp: Date.now()
      };
    },
    // Acciones para página de contratos
    updateContractsState: (
      state,
      action: PayloadAction<{ 
        page: 'purchaseContracts' | 'buyers' | 'sellers' | 'saleContracts';
        updates: Partial<ContractsPageState> 
      }>
    ) => {
      state[action.payload.page] = {
        ...state[action.payload.page],
        ...action.payload.updates,
      };
    },
    updateSingleContractInArray: (
      state,
      action: PayloadAction<{ 
        page: 'purchaseContracts' | 'buyers' | 'sellers' | 'saleContracts';
        contractId: string;
        contractData: any;
      }>
    ) => {
      const { page, contractId, contractData } = action.payload;
      const currentData = state[page]?.contractsData || [];
      
      // Buscar y actualizar solo el contrato específico
      const updatedData = currentData.map((contract: any) => 
        contract._id === contractId ? contractData : contract
      );
      
      // Si no se encontró el contrato, agregarlo al array
      if (!currentData.some((contract: any) => contract._id === contractId)) {
        updatedData.push(contractData);
      }
      
      state[page] = {
        ...state[page],
        contractsData: updatedData,
      };
    },

    // Acciones para detalle de contrato
    updateContractDetailState: (
      state,
      action: PayloadAction<{ 
        contractId: string;
        updates: Partial<ContractDetailState> 
      }>
    ) => {
      const { contractId, updates } = action.payload;
      if (!state.contractDetail[contractId]) {
        state.contractDetail[contractId] = { ...initialContractDetailState };
      }
      state.contractDetail[contractId] = {
        ...state.contractDetail[contractId],
        ...updates,
      };
    },

    // Acciones para crear sub-contrato
    updateCreateSubContractState: (
      state,
      action: PayloadAction<{ 
        contractId: string;
        updates: Partial<CreateSubContractState> 
      }>
    ) => {
      const { contractId, updates } = action.payload;
      if (!state.createSubContract[contractId]) {
        state.createSubContract[contractId] = { ...initialCreateSubContractState };
      }
      state.createSubContract[contractId] = {
        ...state.createSubContract[contractId],
        ...updates,
      };
    },

    // Actualizar última página visitada
    setLastVisited: (state, action: PayloadAction<string>) => {
      state.lastVisited = {
        path: action.payload,
        timestamp: Date.now(),
      };
    },

    // Limpiar estado específico (opcional, para cuando ya no necesites datos)
    clearContractDetailState: (state, action: PayloadAction<string>) => {
      delete state.contractDetail[action.payload];
    },

    clearCreateSubContractState: (state, action: PayloadAction<string>) => {
      delete state.createSubContract[action.payload];
    },

    // Acciones para editar sub-contrato
    updateEditSubContractState: (
      state,
      action: PayloadAction<{ 
        contractId: string;
        updates: Partial<EditSubContractState> 
      }>
    ) => {
      const { contractId, updates } = action.payload;
      if (!state.editSubContract[contractId]) {
        state.editSubContract[contractId] = { ...initialEditSubContractState };
      }
      state.editSubContract[contractId] = {
        ...state.editSubContract[contractId],
        ...updates,
      };
    },

    clearEditSubContractState: (state, action: PayloadAction<string>) => {
      delete state.editSubContract[action.payload];
    },

    // Restaurar estado completo desde localStorage
    restoreState: (state, action: PayloadAction<Partial<PageState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  navigateToPage,
  updateContractsState,
  updateSingleContractInArray,
  updateContractDetailState,
  updateCreateSubContractState,
  updateEditSubContractState,
  setLastVisited,
  clearContractDetailState,
  clearCreateSubContractState,
  clearEditSubContractState,
  restoreState,
} = pageStateSlice.actions;

export default pageStateSlice.reducer;
export type { PageState, ContractsPageState, ContractDetailState, CreateSubContractState, EditSubContractState };