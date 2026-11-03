
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
const getBaseUrl = (): string => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri ?? 'localhost:3000';
    const host = hostUri.split(':')[0];

    return process.env.EXPO_PUBLIC_API_URL || `http://${host}:3000`;
  }

  return process.env.EXPO_PUBLIC_API_URL || 'https://api.seudominio.com';
};
export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = null;

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      authToken = null;
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  authToken = token;
};

export const clearAuthToken = async () => {
  authToken = null;
};

export const getAuthToken = async () => authToken;

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.log('========= ERRO API =========');
    console.log('URL:', error.config?.baseURL + error.config?.url);
    console.log('STATUS:', error.response?.status);
    console.log('RESPOSTA:', error.response?.data);
    console.log('MÉTODO:', error.config?.method);
    console.log('============================');

    return Promise.reject(error);
  }
);