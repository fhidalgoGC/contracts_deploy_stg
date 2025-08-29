/**
 * API Interceptors para manejo centralizado de autenticación
 */

export interface InterceptorOptions {
  excludeAuth?: boolean; // Si true, no agregar headers de autenticación
  customHeaders?: Record<string, string>; // Headers adicionales personalizados
}

/**
 * Interceptor que agrega JWT token y partition key automáticamente
 * a las peticiones HTTP, excepto para endpoints específicos que no los necesitan
 */

export const addAuthInHeader = (
  url: string,
  options: RequestInit & InterceptorOptions = {},
): RequestInit => {
  const { excludeAuth = false, customHeaders = {}, ...fetchOptions } = options;

  // Lista de endpoints que NO deben usar autenticación JWT
  const excludedEndpoints = [
    "/oauth/token", // Auth0 token endpoint
  ];

  // Verificar si el URL debe ser excluido de autenticación
  const shouldExcludeAuth =
    excludeAuth || excludedEndpoints.some((endpoint) => url.includes(endpoint));

  // Preparar headers base
  const headers = new Headers(fetchOptions.headers);

  // Agregar headers personalizados
  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Solo agregar autenticación si no está excluida
  if (!shouldExcludeAuth) {
    // Obtener tokens del localStorage
    const jwt = localStorage.getItem("jwt") || localStorage.getItem("id_token");
    const partitionKey = localStorage.getItem("partition_key");

    // Agregar JWT token si está disponible
    if (jwt) {
      headers.set("authorization", `Bearer ${jwt}`);
    }

    // Agregar partition key si está disponible
  }

  return {
    ...fetchOptions,
    headers,
  };
};

export const addJwtPk = (
  url: string,
  options: RequestInit & InterceptorOptions = {},
): RequestInit => {
  const { excludeAuth = false, customHeaders = {}, ...fetchOptions } = options;

  // Lista de endpoints que NO deben usar autenticación JWT
  const excludedEndpoints = [
    "/oauth/token", // Auth0 token endpoint
  ];

  // Verificar si el URL debe ser excluido de autenticación
  const shouldExcludeAuth =
    excludeAuth || excludedEndpoints.some((endpoint) => url.includes(endpoint));

  // Preparar headers base
  const headers = new Headers(fetchOptions.headers);

  // Agregar headers personalizados
  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Solo agregar autenticación si no está excluida
  if (!shouldExcludeAuth) {
    // Obtener tokens del localStorage
    const jwt = localStorage.getItem("jwt") || localStorage.getItem("id_token");
    const partitionKey = localStorage.getItem("partition_key");

    // Agregar JWT token si está disponible
    if (jwt) {
      headers.set("authorization", `Bearer ${jwt}`);
    }

    // Agregar partition key si está disponible
    if (partitionKey) {
      headers.set("_partitionkey", partitionKey);
      headers.set("bt-organization", partitionKey);
      headers.set("bt-uid", partitionKey);
      headers.set("organization_id", partitionKey);
      headers.set("pk-organization", partitionKey);
    }
  }

  return {
    ...fetchOptions,
    headers,
  };
};

/**
 * Wrapper de fetch que aplica automáticamente el interceptor addJwtPk
 * y agrega created_by_id y created_by_name para métodos PUT y POST
 */
export const authenticatedFetch = (
  url: string,
  options: RequestInit & InterceptorOptions = {},
): Promise<Response> => {
  const { excludeAuth = false, ...fetchOptions } = options;

  // Lista de endpoints que NO deben usar autenticación JWT (excluidos)
  const excludedEndpoints = [
    "/identity/customers", // Token endpoint
    "/identity/v2/customers", // Customer endpoint
    "/partition_keys", // Partition keys endpoint
    "/organizations", // Organization endpoint (some variations)
    "/oauth/token", // Auth0 token endpoint
  ];

  // Verificar si el URL debe ser excluido
  const shouldExcludeAuth =
    excludeAuth || excludedEndpoints.some((endpoint) => url.includes(endpoint));

  let modifiedOptions = addJwtPk(url, options);

  // Solo agregar created_by para métodos PUT/POST en endpoints no excluidos
  if (
    !shouldExcludeAuth &&
    (fetchOptions.method === "PUT" || fetchOptions.method === "POST")
  ) {
    try {
      // Obtener datos del usuario del localStorage
      const createdById = localStorage.getItem("user_id") || "";
      const createdByName = localStorage.getItem("user_name") || "";

      console.log(createdById);
      console.log(createdByName);

      // Si hay un body existente, parsearlo y agregar los campos
      if (modifiedOptions.body) {
        let bodyData: any = {};

        // Intentar parsear el body si es string
        if (typeof modifiedOptions.body === "string") {
          try {
            bodyData = JSON.parse(modifiedOptions.body);
          } catch (e) {
            // Si no se puede parsear, crear objeto nuevo
            bodyData = {};
          }
        }

        // Agregar created_by_id y created_by_name al body
        bodyData.created_by_id = createdById;
        bodyData.created_by_name = createdByName;

        // Agregar registered_by_id y registered_by_name al body
        bodyData.registered_by_id = createdById;
        bodyData.registered_by_name = createdByName;

        // Convertir de vuelta a string
        modifiedOptions.body = JSON.stringify(bodyData);

        // Asegurar Content-Type para JSON
        const headers = new Headers(modifiedOptions.headers);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        modifiedOptions.headers = headers;
      }
    } catch (error) {
      console.warn("⚠️ Error adding created_by fields:", error);
    }
  }

  return fetch(url, modifiedOptions);
};



export const authenticatedAddTokenFetch = (
  url: string,
  options: RequestInit & InterceptorOptions = {},
): Promise<Response> => {
  const { excludeAuth = false, ...fetchOptions } = options;

  // Lista de endpoints que NO deben usar autenticación JWT (excluidos)
  const excludedEndpoints = [
    "/oauth/token", // Auth0 token endpoint
  ];

  // Verificar si el URL debe ser excluido
  const shouldExcludeAuth =
    excludeAuth || excludedEndpoints.some((endpoint) => url.includes(endpoint));

  let modifiedOptions = addAuthInHeader(url, options);

  // Solo agregar created_by para métodos PUT/POST en endpoints no excluidos
  if (
    !shouldExcludeAuth &&
    (fetchOptions.method === "PUT" || fetchOptions.method === "POST")
  ) {
    try {
      // Obtener datos del usuario del localStorage
      const createdById = localStorage.getItem("user_id") || "";
      const createdByName = localStorage.getItem("user_name") || "";


      // Si hay un body existente, parsearlo y agregar los campos
      if (modifiedOptions.body) {
        let bodyData: any = {};

        // Intentar parsear el body si es string
        if (typeof modifiedOptions.body === "string") {
          try {
            bodyData = JSON.parse(modifiedOptions.body);
          } catch (e) {
            // Si no se puede parsear, crear objeto nuevo
            bodyData = {};
          }
        }

        // Agregar created_by_id y created_by_name al body
        bodyData.created_by_id = createdById;
        bodyData.created_by_name = createdByName;

        // Agregar registered_by_id y registered_by_name al body
        bodyData.registered_by_id = createdById;
        bodyData.registered_by_name = createdByName;

        // Convertir de vuelta a string
        modifiedOptions.body = JSON.stringify(bodyData);

        // Asegurar Content-Type para JSON
        const headers = new Headers(modifiedOptions.headers);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        modifiedOptions.headers = headers;
      }
    } catch (error) {
      console.warn("⚠️ Error adding created_by fields:", error);
    }
  }

  return fetch(url, modifiedOptions);
};

/**
 * Fetch sin autenticación para endpoints públicos
 */
export const publicFetch = (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  return fetch(url, { excludeAuth: true, ...options } as RequestInit &
    InterceptorOptions);
};

/**
 * Utilitie para verificar si hay tokens de autenticación disponibles
 */
export const hasAuthTokens = (): {
  hasJwt: boolean;
  hasPartition: boolean;
  isAuthenticated: boolean;
} => {
  const jwt = localStorage.getItem("jwt") || localStorage.getItem("id_token");
  const partitionKey = localStorage.getItem("partition_key");

  return {
    hasJwt: !!jwt,
    hasPartition: !!partitionKey,
    isAuthenticated: !!jwt && !!partitionKey,
  };
};

export default {
  addJwtPk,
  authenticatedFetch,
  publicFetch,
  hasAuthTokens,
};
