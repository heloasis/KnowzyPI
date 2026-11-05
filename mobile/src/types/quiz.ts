export type Materia = {
  id: string;
  nome: string;
  slug?: string;
  descricao?: string;
};

export type Pergunta = {
  id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta?: string | number;
  resposta_correta?: string | number;
  materiaId?: string;
};

export type QuizResponse = {
  materia: string;
  perguntas: Pergunta[];
};
