# API Interceptors Usage Guide

Este módulo proporciona un interceptor centralizado para el manejo de autenticación JWT y partition_key en las peticiones HTTP.

## Características Principales

- ✅ Inyección automática de JWT token y partition_key
- ✅ Exclusión inteligente de endpoints públicos
- ✅ Headers adicionales personalizables
- ✅ Utilidades para verificar estado de autenticación
- ✅ Soporte para fetch público y autenticado

## Uso Básico

### 1. Peticiones Autenticadas (CRM APIs)

```typescript
import { authenticatedFetch } from '@/utils/apiInterceptors';

// Ejemplo básico
const response = await authenticatedFetch('https://crm-develop.grainchain.io/api/v1/contracts/purchase-sub-contracts?contract_id=123', {
  method: 'GET'
});

// Con headers personalizados
const response = await authenticatedFetch('https://trm-develop.grainchain.io/api/v1/contracts/sp-sub-contracts', {
  method: 'POST',
  customHeaders: {
    'content-type': 'application/json',
    'priority': 'u=1, i'
  },
  body: JSON.stringify(data)
});
```

### 2. Peticiones Públicas (Sin autenticación)

```typescript
import { publicFetch } from '@/utils/apiInterceptors';

// Para endpoints de autenticación
const response = await publicFetch('https://un4grlwfx2.execute-api.us-west-2.amazonaws.com/dev/identity/customers', {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify(credentials)
});
```

### 3. Verificar Estado de Autenticación

```typescript
import { hasAuthTokens } from '@/utils/apiInterceptors';

const authCheck = hasAuthTokens();
console.log('Authenticated:', authCheck.isAuthenticated);
console.log('Has JWT:', authCheck.hasJwt);
console.log('Has Partition Key:', authCheck.hasPartition);

if (!authCheck.isAuthenticated) {
  // Manejar falta de autenticación
  return;
}
```

## Headers Automáticos

El interceptor agrega automáticamente los siguientes headers para peticiones autenticadas:

```typescript
{
  'authorization': `Bearer ${jwt}`,
  '_partitionkey': partition_key,
  'bt-organization': partition_key,
  'bt-uid': partition_key,
  'organization_id': partition_key,
  'accept': '*/*',
  'accept-language': 'es-419,es;q=0.9',
  'origin': 'https://contracts-develop.grainchain.io',
  'referer': 'https://contracts-develop.grainchain.io/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...'
}
```

## Endpoints Excluidos

Los siguientes endpoints NO reciben headers de autenticación automáticamente:

- `/identity/customers` - Token endpoint
- `/identity/v2/customers` - Customer endpoint  
- `/partition_keys` - Partition keys endpoint
- `/organizations` - Organization endpoint
- `/oauth/token` - Auth0 token endpoint

## Migración desde fetch() manual

### Antes (con headers manuales):
```typescript
const jwt = localStorage.getItem('jwt') || localStorage.getItem('id_token');
const partition_key = localStorage.getItem('partition_key');

const response = await fetch(url, {
  method: 'GET',
  headers: {
    '_partitionkey': partition_key,
    'authorization': `Bearer ${jwt}`,
    'bt-organization': partition_key,
    'bt-uid': partition_key,
    'organization_id': partition_key,
    // ... muchos más headers
  }
});
```

### Después (con interceptor):
```typescript
import { authenticatedFetch } from '@/utils/apiInterceptors';

const response = await authenticatedFetch(url, {
  method: 'GET'
});
```

## Beneficios

1. **DRY Principle**: Elimina la duplicación de código de headers
2. **Mantenimiento**: Cambios centralizados en un solo archivo
3. **Consistencia**: Mismos headers en todas las peticiones
4. **Seguridad**: Manejo centralizado de tokens
5. **Flexibilidad**: Headers personalizados cuando se necesiten

## Implementado en

- ✅ `PurchaseContractDetail.tsx` - Sub-contratos y dirección del participante
- ⏳ Próximos: Otras páginas que usen APIs del CRM

## Notas Importantes

- El interceptor obtiene tokens del `localStorage` automáticamente
- Los tokens se validan antes de cada petición
- Los endpoints públicos pueden usar `publicFetch` o `fetch` directamente
- Los headers personalizados se agregan a los headers automáticos (no los reemplazan)