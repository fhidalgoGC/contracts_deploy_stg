import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { store } from "./app/store";
import { Toaster } from "@/components/ui/toaster";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useUser } from "@/contexts/UserContext";
import { UserProvider } from "@/contexts/UserContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import "./common/utils/i18n";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useStateRestoration } from "@/hooks/usePageState";
import { SessionValidator } from "@/components/SessionValidator";
import AppRoutes from "@/routes";

function StateRestorer() {
  useStateRestoration();
  return null;
}

function AppContent() {
  const { isLoadingOrganizations } = useUser();
  
  return (
    <SessionValidator>
      <StateRestorer />
      <Toaster />
      <AppRoutes />
      <LoadingOverlay isVisible={isLoadingOrganizations} message="Cambiando organización..." />
    </SessionValidator>
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
