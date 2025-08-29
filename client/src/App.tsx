import { Switch, Route } from "wouter";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { store } from "./app/store";
import { Toaster } from "@/components/ui/toaster";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useUser } from "@/contexts/UserContext";
import { UserProvider } from "@/contexts/UserContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import "./common/utils/i18n";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useStateRestoration } from "@/hooks/usePageState";
import Login from "@/pages/Login";
// Lazy load heavy pages for better code splitting
const Home = lazy(() => import("@/pages/Home"));
const Buyers = lazy(() => import("@/pages/Buyers"));
const CreateBuyer = lazy(() => import("@/pages/CreateBuyer"));
const CreateSeller = lazy(() => import("@/pages/CreateSeller"));
const Sellers = lazy(() => import("@/pages/Sellers"));
const PurchaseContracts = lazy(() => import("@/pages/PurchaseContracts"));
const CreatePurchaseContract = lazy(() => import("@/pages/CreatePurchaseContract"));
const CreateSubContract = lazy(() => import("@/pages/CreateSubContract"));
const EditSubContract = lazy(() => import("@/pages/EditSubContract"));
const ViewSubContract = lazy(() => import("@/pages/ViewSubContract"));
const ViewContract = lazy(() => import("@/pages/ViewContract"));
const EditContract = lazy(() => import("@/pages/EditContract"));
const SaleContracts = lazy(() => import("@/pages/SaleContracts"));
const CreateSaleContract = lazy(() => import("@/pages/CreateSaleContract"));
const ContractDetail = lazy(() => import("@/pages/ContractDetail"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/buyers" component={Buyers} />
        <Route path="/buyers/create" component={CreateBuyer} />
        <Route path="/sellers" component={Sellers} />
        <Route path="/sellers/create" component={CreateSeller} />
        <Route path="/purchase-contracts" component={PurchaseContracts} />
        <Route path="/purchase-contracts/create/:contractId?" component={CreatePurchaseContract} />
        <Route path="/purchase-contracts/:contractId/sub-contracts/create" component={CreateSubContract} />
        <Route path="/purchase-contracts/:contractId/sub-contracts/:subContractId/edit" component={EditSubContract} />
        <Route path="/purchase-contracts/:contractId/sub-contracts/:subContractId/view" component={ViewSubContract} />
        <Route path="/purchase-contracts/:contractId/view" component={ViewContract} />
        <Route path="/purchase-contracts/:contractId/edit" component={EditContract} />
        <Route path="/purchase-contracts/:id" component={ContractDetail} />
        <Route path="/sale-contracts" component={SaleContracts} />
        <Route path="/sale-contracts/create/:contractId?" component={CreateSaleContract} />
        <Route path="/sale-contracts/:contractId/sub-contracts/create" component={CreateSubContract} />
        <Route path="/sale-contracts/:contractId/sub-contracts/:subContractId/edit" component={EditSubContract} />
        <Route path="/sale-contracts/:contractId/sub-contracts/:subContractId/view" component={ViewSubContract} />
        <Route path="/sale-contracts/:contractId/view" component={ViewContract} />
        <Route path="/sale-contracts/:contractId/edit" component={EditContract} />
        <Route path="/sale-contracts/:id" component={ContractDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function StateRestorer() {
  useStateRestoration();
  return null;
}

function AppContent() {
  const { isLoadingOrganizations } = useUser();
  
  return (
    <>
      <StateRestorer />
      <Toaster />
      <Router />
      <LoadingOverlay isVisible={isLoadingOrganizations} message="Cambiando organización..." />
    </>
  );
}

function App() {
  useEffect(() => {
    // Set document language based on detected language
    const savedLanguage = localStorage.getItem('language') || 'es';
    document.documentElement.lang = savedLanguage;
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ThemeProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
