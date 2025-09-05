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

    console.log('🔍 SESSION VALIDATOR: Verificando estado de sesión...');
    console.log('📅 Tiempo actual:', new Date(currentTime).toLocaleString());
    console.log('🔑 Login time:', loginTime ? new Date(parseInt(loginTime)).toLocaleString() : 'No encontrado');
    console.log('⚡ Last activity:', lastActivity ? new Date(parseInt(lastActivity)).toLocaleString() : 'No encontrado');

    // Si no hay datos de actividad o login, la sesión está expirada
    if (!lastActivity || !loginTime) {
      console.log('❌ SESSION EXPIRED: Datos de sesión faltantes');
      return { expired: true, reason: 'missing_session_data' };
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const loginTimeMs = parseInt(loginTime, 10);

    // Convertir minutos a milisegundos
    const maxSessionDurationMs = environment.MAX_SESSION_DURATION_MINUTES * 60 * 1000;
    const inactivityTimeoutMs = environment.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    console.log('⚙️ Configuración de timeouts:');
    console.log(`   Max session: ${environment.MAX_SESSION_DURATION_MINUTES} minutos (${maxSessionDurationMs}ms)`);
    console.log(`   Inactividad: ${environment.INACTIVITY_TIMEOUT_MINUTES} minutos (${inactivityTimeoutMs}ms)`);

    // Verificar timeout absoluto (desde el login)
    const timeSinceLogin = currentTime - loginTimeMs;
    const minutesSinceLogin = Math.floor(timeSinceLogin / (60 * 1000));
    const sessionExpiresAt = new Date(loginTimeMs + maxSessionDurationMs);
    
    console.log(`⏰ Tiempo desde login: ${minutesSinceLogin} minutos`);
    console.log(`🕐 Sesión expira absolutamente a: ${sessionExpiresAt.toLocaleString()}`);

    if (timeSinceLogin > maxSessionDurationMs) {
      console.log('❌ SESSION EXPIRED: Tiempo máximo de sesión excedido');
      console.log(`   Límite: ${environment.MAX_SESSION_DURATION_MINUTES} minutos`);
      console.log(`   Transcurrido: ${minutesSinceLogin} minutos`);
      return { expired: true, reason: 'max_session_duration' };
    }

    // Verificar timeout de inactividad
    const timeSinceActivity = currentTime - lastActivityTime;
    const minutesSinceActivity = Math.floor(timeSinceActivity / (60 * 1000));
    const inactivityExpiresAt = new Date(lastActivityTime + inactivityTimeoutMs);
    
    console.log(`💤 Tiempo desde última actividad: ${minutesSinceActivity} minutos`);
    console.log(`🕐 Sesión expira por inactividad a: ${inactivityExpiresAt.toLocaleString()}`);

    if (timeSinceActivity > inactivityTimeoutMs) {
      console.log('❌ SESSION EXPIRED: Timeout de inactividad excedido');
      console.log(`   Límite: ${environment.INACTIVITY_TIMEOUT_MINUTES} minutos`);
      console.log(`   Inactivo por: ${minutesSinceActivity} minutos`);
      return { expired: true, reason: 'inactivity_timeout' };
    }

    console.log('✅ SESSION VALID: Sesión activa y dentro de límites');
    return { expired: false };
  }, []);

  // Función para actualizar la última actividad
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    localStorage.setItem('last_activity', now.toString());
    console.log('⚡ ACTIVITY UPDATE: Última actividad actualizada a:', new Date(now).toLocaleString());
  }, []);

  // Función para limpiar la sesión
  const clearSessionData = useCallback(() => {
    if (isValidatingRef.current) return;
    isValidatingRef.current = true;

    console.log('🧹 SESSION CLEANUP: Iniciando limpieza de sesión...');

    try {
      // PRIMERO: Notificar a otros tabs ANTES de limpiar
      console.log('📡 Notificando a otros tabs sobre el logout...');
      localStorage.setItem('session_logout', Date.now().toString());
      
      // Esperar un poco para que el evento se propague
      setTimeout(() => {
        localStorage.removeItem('session_logout');
      }, 100);

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

      console.log('🗑️ Removiendo datos del localStorage:', keysToRemove);
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Limpiar contextos
      console.log('🔄 Limpiando contextos Redux y usuario...');
      clearSession();
      dispatch(logoutAction());

      if (showExpirationToast) {
        console.log('🔔 Mostrando notificación de sesión expirada');
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      }

      // Redirigir al login
      console.log('🏠 Redirigiendo al login...');
      setLocation('/');
      console.log('✅ LOGOUT COMPLETE: Limpieza de sesión completada');
    } finally {
      isValidatingRef.current = false;
    }
  }, [dispatch, clearSession, setLocation, toast, showExpirationToast]);

  // Función principal de validación
  const validateSession = useCallback((): boolean => {
    if (isValidatingRef.current) return false;

    console.log('🔐 SESSION VALIDATION: Iniciando validación de sesión...');

    // Verificar si hay tokens válidos
    const tokensValid = validateTokens();
    if (!tokensValid) {
      console.log('❌ VALIDATION FAILED: Tokens inválidos o faltantes');
      clearSessionData();
      return false;
    }

    // Verificar si la sesión ha expirado por tiempo
    const sessionStatus = isSessionExpired();
    if (sessionStatus.expired) {
      console.log(`❌ VALIDATION FAILED: Sesión expirada por ${sessionStatus.reason}`);
      clearSessionData();
      return false;
    }

    // Si llegamos aquí, la sesión es válida - actualizar última actividad
    console.log('✅ VALIDATION SUCCESS: Sesión válida, actualizando actividad...');
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

  // 2. Validación periódica cada 5 segundos para detectar cambios rápidamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log('⏰ PERIODIC CHECK: Validación periódica de sesión...');
      validateSession();
    }, 5000); // 5 segundos para detectar cambios más rápido

    return () => clearInterval(interval);
  }, [isAuthenticated, validateSession]);

  // 3. Escuchar cambios en localStorage más agresivamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokensExist = () => {
      const hasTokens = localStorage.getItem('access_token');
      if (!hasTokens && isAuthenticated) {
        console.log('🚨 TOKEN MISSING: Token removido, forzando logout...');
        clearSessionData();
      }
    };

    const interval = setInterval(checkTokensExist, 1000); // Cada segundo
    return () => clearInterval(interval);
  }, [isAuthenticated, clearSessionData]);

  // 4. Detección de cambios de visibilidad del tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // El tab volvió a ser visible - validar sesión
        console.log('👁️ TAB VISIBILITY: Tab visible de nuevo, validando sesión...');
        validateSession();
      } else if (document.hidden && isAuthenticated) {
        console.log('👁️ TAB VISIBILITY: Tab oculto (usuario cambió de pestaña)');
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
      console.log('🔗 STORAGE EVENT:', event.key, 'oldValue:', event.oldValue, 'newValue:', event.newValue);
      
      // Si otro tab removió los tokens, cerrar sesión aquí también
      if (event.key === 'access_token' && !event.newValue && isAuthenticated) {
        console.log('🔗 SYNC TABS: Token removido en otro tab, cerrando sesión aquí...');
        clearSessionData();
        return;
      }

      // Si otro tab removió cualquier token crítico
      if (['jwt', 'id_token', 'refresh_token'].includes(event.key as string) && !event.newValue && isAuthenticated) {
        console.log(`🔗 SYNC TABS: Token crítico ${event.key} removido en otro tab, cerrando sesión aquí...`);
        clearSessionData();
        return;
      }

      // Si se disparó un evento de logout desde otro tab
      if (event.key === 'session_logout' && event.newValue && isAuthenticated) {
        console.log('🔗 SYNC TABS: Logout detectado en otro tab, cerrando sesión aquí...');
        clearSessionData();
        return;
      }

      // Si se actualizó la última actividad en otro tab
      if (event.key === 'last_activity' && event.newValue) {
        console.log('🔗 SYNC TABS: Actividad actualizada en otro tab:', new Date(parseInt(event.newValue)).toLocaleString());
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