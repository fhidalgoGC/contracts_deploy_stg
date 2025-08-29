import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface UserData {
  userName: string;
  userId: string;
  // Add other user fields as needed
}

export interface OrganizationData {
  role: string;
  partitionKey: string;
  organization?: string;
  registered: string;
  id: string;
  externals: any[];
  type: string;
  idCustomer: string;
}

export interface UserContextType {
  // User data
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  
  // Available organizations for the current user
  availableOrganizations: OrganizationData[];
  setAvailableOrganizations: (orgs: OrganizationData[]) => void;
  
  // Current selected organization
  currentOrganization: OrganizationData | null;
  setCurrentOrganization: (org: OrganizationData | null) => void;
  
  // Loading states
  isLoadingOrganizations: boolean;
  setIsLoadingOrganizations: (loading: boolean) => void;
  
  // Clear all session data
  clearSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<OrganizationData[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationData | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('user_name');
    const storedUserId = localStorage.getItem('user_id');
    
    if (storedUserName && storedUserId) {
      setUserData({
        userName: storedUserName,
        userId: storedUserId
      });
    }
  }, []);

  // Clear all session data
  const clearSession = () => {
    setUserData(null);
    setAvailableOrganizations([]);
    setCurrentOrganization(null);
    setIsLoadingOrganizations(false);
  };

  const value: UserContextType = {
    userData,
    setUserData,
    availableOrganizations,
    setAvailableOrganizations,
    currentOrganization,
    setCurrentOrganization,
    isLoadingOrganizations,
    setIsLoadingOrganizations,
    clearSession
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}