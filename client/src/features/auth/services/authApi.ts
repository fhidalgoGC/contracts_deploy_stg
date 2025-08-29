import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginRequest, LoginResponse, IdentityResponse } from '../types/auth';
import { environment } from '@/environment/environment';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.AUTH0_URL,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          username: credentials.email,
          password: credentials.password,
          audience: environment.AUTH0_AUDIENCE,
          grant_type: environment.AUTH0_GRANT_TYPE,
          realm: environment.AUTH0_REALM,
          client_id: environment.AUTH0_CLIENT_ID,
          scope: environment.AUTH0_SCOPE,
        },
      }),
    }),
  }),
});

export const identityApi = createApi({
  reducerPath: 'identityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.IDENTITY_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('jwt');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getIdentity: builder.query<IdentityResponse, void>({
      query: () => '/identity/customers',
    }),
  }),
});

export const { useLoginMutation } = authApi;
export const { useGetIdentityQuery } = identityApi;
