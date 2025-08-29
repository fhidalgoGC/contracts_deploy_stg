import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import React from 'react';
import { RootState } from '../app/store';
import { 
  navigateToPage,
  updateContractsState, 
  updateContractDetailState, 
  updateCreateSubContractState,
  setLastVisited,
  restoreState,
  type ContractsPageState,
  type ContractDetailState, 
  type CreateSubContractState 
} from '../store/slices/pageStateSlice';

// Hook para estado de páginas de contratos (lista)
export const useContractsPageState = (page: 'purchaseContracts' | 'buyers' | 'sellers' | 'saleContracts') => {
  const dispatch = useDispatch();
  const pageState = useSelector((state: RootState) => state.pageState[page]);
  const currentPagePath = useSelector((state: RootState) => state.pageState.currentPagePath);
  
  // Detectar si necesitamos limpiar el estado al cargar la página
  React.useEffect(() => {
    const lastPage = currentPagePath[currentPagePath.length - 1];
    console.log(`🔍 ${page.toUpperCase()} STATE: Última página en path:`, lastPage, 'Path completo:', currentPagePath);
    
    // Si la última página no es la página actual, significa que venimos de otra página
    // y necesitamos limpiar el estado solo si es una navegación entre páginas del mismo nivel
    const topLevelPages = ['purchaseContracts', 'buyers', 'sellers', 'saleContracts', 'dashboard'];
    const isTopLevelNavigation = topLevelPages.includes(lastPage) && topLevelPages.includes(page);
    
    if (lastPage && lastPage !== page && isTopLevelNavigation) {
      console.log(`🧹 LIMPIANDO ESTADO: Navegación ${lastPage} → ${page}, limpiando estado`);
      dispatch(updateContractsState({ 
        page, 
        updates: {
          searchTerm: '',
          filters: {},
          selectedItems: [],
          sortOrder: '',
          currentPage: 1,
          pageSize: 10,
        }
      }));
    }
  }, []); // Solo ejecutar una vez al montar el componente

  const updateState = (updates: Partial<ContractsPageState>) => {
    dispatch(updateContractsState({ page, updates }));
  };

  return { pageState, updateState };
};

// Hook para estado de detalle de contrato
export const useContractDetailState = (contractId: string) => {
  const dispatch = useDispatch();
  const contractState = useSelector((state: RootState) => 
    state.pageState.contractDetail[contractId]
  );

  const updateState = (updates: Partial<ContractDetailState>) => {
    dispatch(updateContractDetailState({ contractId, updates }));
  };

  return { 
    contractState: contractState || { activeTab: 'general', subContractFilters: {}, expandedSections: [] }, 
    updateState 
  };
};

// Hook para estado de crear sub-contrato
export const useCreateSubContractState = (contractId: string) => {
  const dispatch = useDispatch();
  const formState = useSelector((state: RootState) => 
    state.pageState.createSubContract[contractId]
  );

  const updateState = (updates: Partial<CreateSubContractState>) => {
    dispatch(updateCreateSubContractState({ contractId, updates }));
  };

  return { 
    createSubContractState: formState || { 
      formData: {}, 
      selectedCommodity: null, 
      selectedMeasurementUnit: null, 
      pricingType: 'fixed',
      subContractKey: null
    }, 
    updateState 
  };
};

// Hook para restaurar estado desde localStorage
export const useStateRestoration = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restaurar estado al cargar la aplicación
    const savedState = localStorage.getItem('pageState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch(restoreState(parsedState));
      } catch (error) {
        console.error('Error restaurando estado:', error);
      }
    }
  }, [dispatch]);
};

// Hook para trackear última página visitada
export const usePageTracking = (currentPath: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLastVisited(currentPath));
  }, [currentPath, dispatch]);
};

// Hook para manejar navegación jerárquica
export const useNavigationHandler = () => {
  const dispatch = useDispatch();
  
  const handleNavigateToPage = (pageKey: string, contractId?: string) => {
    console.log(`Hook de navegación: ${pageKey}${contractId ? ` con contractId: ${contractId}` : ''}`);
    dispatch(navigateToPage({ pageKey, contractId }));
  };
  
  return { handleNavigateToPage };
};