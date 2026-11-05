import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../api/api';
import type { AuthResponse, CadastroPayload, LoginPayload } from '../types/auth';

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/login', payload);
    if (response.data?.token) { await setAuthToken(response.data.token); await AsyncStorage.setItem('knowzy:token', response.data.token); }
    return response.data;
  } catch (error: any) {
    return {
      erro: error?.response?.data?.erro || 'Não foi possível entrar. Tente novamente.',
    };
  }
};

export const cadastroApi = async (payload: CadastroPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/cadastro', payload);
    if (response.data?.token) { await setAuthToken(response.data.token); await AsyncStorage.setItem('knowzy:token', response.data.token); }
    return response.data;
  } catch (error: any) {
    return {
      erro: error?.response?.data?.erro || 'Não foi possível concluir o cadastro.',
    };
  }
};
