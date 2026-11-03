export type Usuario = {
  id: string;
  nome: string;
  email: string;
  xp?: number;
  conquistas?: string[];
  totalQuizzes?: number;
  materiasExploradas?: string[];
  ultimaPontuacao?: number;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type CadastroPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type AuthResponse = {
  mensagem?: string;
  usuario?: Usuario;
  erro?: string;
};
