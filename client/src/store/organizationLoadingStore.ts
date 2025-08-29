// Simple global store for organization loading state
let isChangingOrganization = false;
const listeners: Set<() => void> = new Set();

export const organizationLoadingStore = {
  getState: () => isChangingOrganization,
  
  setState: (newState: boolean) => {
    console.log('Setting organization loading state to:', newState);
    isChangingOrganization = newState;
    listeners.forEach(listener => listener());
  },
  
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

import React from 'react';

// Hook to use the loading state
export function useOrganizationLoading() {
  const [state, setState] = React.useState(organizationLoadingStore.getState());
  
  React.useEffect(() => {
    const unsubscribe = organizationLoadingStore.subscribe(() => {
      setState(organizationLoadingStore.getState());
    });
    return unsubscribe;
  }, []);
  
  return state;
}