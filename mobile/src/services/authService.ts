import { api } from '../api/api';
import type { AuthResponse, CadastroPayload, LoginPayload } from '../types/auth';

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/login', payload);
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
    return response.data;
  } catch (error: any) {
    return {
      erro: error?.response?.data?.erro || 'Não foi possível concluir o cadastro.',
    };
  }
};
