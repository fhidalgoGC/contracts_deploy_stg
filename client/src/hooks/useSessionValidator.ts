import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout as logoutAction } from '@/features/auth/slices/authSlice';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { environment } from '@/environment/environment';

interface SessionValidatorOptions {
  // Si se debe mostrar un toast cuando la sesión expira
  showExpirationToast?: boolean;
  // Si se debe validar al cargar la página
  validateOnMount?: boolean;
}

export const useSessionValidator = (options: SessionValidatorOptions = {}) => {
  const {
    showExpirationToast = true,
    validateOnMount = true
  } = options;

  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { clearSession } = useUser();
  const { toast } = useToast();
  const isValidatingRef = useRef(false);

  // Función para verificar si los tokens están presentes y son válidos
  const validateTokens = useCallback((): boolean => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const idToken = localStorage.getItem('id_token');
      
      if (!accessToken || !refreshToken || !idToken) {
        return false;
      }

      // Verificar si el token ID está expirado
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Verificar si el token ha expirado
        if (payload.exp && payload.exp < currentTime) {
          return false;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating tokens:', error);
      return false;
    }
  }, []);

  // Función para verificar si la sesión ha expirado por alguno de los dos timeouts
  const isSessionExpired = useCallback((): { expired: boolean; reason?: string } => {
    const lastActivity = localStorage.getItem('last_activity');
    const loginTime = localStorage.getItem('login_time');
    const currentTime = Date.now();

    // Si no hay datos de actividad o login, la sesión está expirada
    if (!lastActivity || !loginTime) {
      return { expired: true, reason: 'missing_session_data' };
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const loginTimeMs = parseInt(loginTime, 10);

    // Convertir minutos a milisegundos
    const maxSessionDurationMs = environment.MAX_SESSION_DURATION_MINUTES * 60 * 1000;
    const inactivityTimeoutMs = environment.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    // Verificar timeout absoluto (desde el login)
    const timeSinceLogin = currentTime - loginTimeMs;
    if (timeSinceLogin > maxSessionDurationMs) {
      return { expired: true, reason: 'max_session_duration' };
    }

    // Verificar timeout de inactividad
    const timeSinceActivity = currentTime - lastActivityTime;
    if (timeSinceActivity > inactivityTimeoutMs) {
      return { expired: true, reason: 'inactivity_timeout' };
    }

    return { expired: false };
  }, []);

  // Función para actualizar la última actividad
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  // Función para limpiar la sesión
  const clearSessionData = useCallback(() => {
    if (isValidatingRef.current) return;
    isValidatingRef.current = true;

    try {
      // Crear un evento personalizado para notificar a otros tabs
      const logoutEvent = new StorageEvent('storage', {
        key: 'session_logout',
        newValue: Date.now().toString(),
        oldValue: null
      });

      // Limpiar tokens y datos de usuario
      const keysToRemove = [
        'jwt', 'id_token', 'refresh_token', 'access_token',
        'user_name', 'user_lastname', 'user_id', 'user_email',
        'partition_key', 'representative_people_id',
        'representative_people_full_name', 'representative_people_first_name',
        'representative_people_last_name', 'representative_people_email',
        'representative_people_calling_code', 'representative_people_phone_number',
        'company_business_name', 'company_business_type',
        'company_calling_code', 'company_phone_number', 'company_address_line',
        'current_organization_id', 'current_organization_name', 'organization_details',
        'last_activity', 'login_time'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Limpiar contextos
      clearSession();
      dispatch(logoutAction());

      // Disparar evento para otros tabs
      window.dispatchEvent(logoutEvent);

      if (showExpirationToast) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      }

      // Redirigir al login
      setLocation('/');
    } finally {
      isValidatingRef.current = false;
    }
  }, [dispatch, clearSession, setLocation, toast, showExpirationToast]);

  // Función principal de validación
  const validateSession = useCallback((): boolean => {
    if (isValidatingRef.current) return false;

    // Verificar si hay tokens válidos
    const tokensValid = validateTokens();
    if (!tokensValid) {
      clearSessionData();
      return false;
    }

    // Verificar si la sesión ha expirado por tiempo
    const sessionStatus = isSessionExpired();
    if (sessionStatus.expired) {
      console.log(`Session expired: ${sessionStatus.reason}`);
      clearSessionData();
      return false;
    }

    // Si llegamos aquí, la sesión es válida - actualizar última actividad
    updateLastActivity();
    return true;
  }, [validateTokens, isSessionExpired, clearSessionData, updateLastActivity]);

  // 1. Validación automática al cargar la página
  useEffect(() => {
    if (!validateOnMount) return;

    const initializeSession = () => {
      const hasTokens = localStorage.getItem('access_token');
      
      if (hasTokens && !isAuthenticated) {
        // Hay tokens pero Redux no está autenticado - validar
        if (!validateSession()) {
          return;
        }
        // Aquí podrías restaurar el estado de Redux si es necesario
      } else if (!hasTokens && isAuthenticated) {
        // Redux dice que está autenticado pero no hay tokens - limpiar
        clearSessionData();
      } else if (hasTokens && isAuthenticated) {
        // Ambos tienen datos - validar sesión
        validateSession();
      }
    };

    initializeSession();
  }, [validateOnMount, isAuthenticated, validateSession, clearSessionData]);

  // 4. Detección de cambios de visibilidad del tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // El tab volvió a ser visible - validar sesión
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, validateSession]);

  // 5. Sincronización entre tabs usando storage events
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Si otro tab removió los tokens, cerrar sesión aquí también
      if (event.key === 'access_token' && !event.newValue && isAuthenticated) {
        clearSessionData();
        return;
      }

      // Si se disparó un evento de logout desde otro tab
      if (event.key === 'session_logout' && event.newValue && isAuthenticated) {
        clearSessionData();
        return;
      }

      // Si se actualizó la última actividad en otro tab
      if (event.key === 'last_activity' && event.newValue) {
        // No hacer nada especial, solo mantener sincronizada la actividad
        return;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, clearSessionData]);

  // Función expuesta para validar manualmente
  const forceValidateSession = useCallback(() => {
    return validateSession();
  }, [validateSession]);

  // Función expuesta para cerrar sesión manualmente
  const forceLogout = useCallback(() => {
    clearSessionData();
  }, [clearSessionData]);

  return {
    validateSession: forceValidateSession,
    logout: forceLogout,
    updateLastActivity,
    isSessionValid: isAuthenticated && validateTokens() && !isSessionExpired().expired
  };
};