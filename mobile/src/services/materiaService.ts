
import { api } from '../api/api';
import type { Materia } from '../types/quiz';

import conteudosLocais from '../data/conteudosEstudo.json';

import biologiaLocal from '../data/biologia.json';
import geografiaLocal from '../data/geografia.json';
import historiaLocal from '../data/historia.json';
import matematicaLocal from '../data/matematica.json';
import portuguesLocal from '../data/portugues.json';

const materiasFallback: Materia[] = [
  {
    id: 'matematica',
    slug: 'matematica',
    nome: 'Matemática',
    descricao: 'Questões de números e lógica.'
  },
  {
    id: 'portugues',
    slug: 'portugues',
    nome: 'Português',
    descricao: 'Interpretação e gramática.'
  },
  {
    id: 'historia',
    slug: 'historia',
    nome: 'História',
    descricao: 'Temas históricos do Brasil e do mundo.'
  },
  {
    id: 'geografia',
    slug: 'geografia',
    nome: 'Geografia',
    descricao: 'Espaço, população e mapas.'
  },
  {
    id: 'biologia',
    slug: 'biologia',
    nome: 'Biologia',
    descricao: 'Vida, células e ecologia.'
  }
];

const perguntasLocais: Record<string, any> = {
  biologia: biologiaLocal,
  geografia: geografiaLocal,
  historia: historiaLocal,
  matematica: matematicaLocal,
  portugues: portuguesLocal
};

const normalizarPerguntas = (dados: any): any[] => {
  if (!dados) return [];

  let lista: any[] = [];

  if (Array.isArray(dados)) {
    lista = dados;
  } else if (typeof dados === 'object') {
    lista = Object.entries(dados)
      .sort(([idA], [idB]) =>
        idA.localeCompare(idB, undefined, { numeric: true })
      )
      .map(([id, pergunta]: [string, any]) => ({
        ...pergunta,
        id: pergunta.id || id
      }));
  }

  return lista.map((pergunta, index) => ({
    ...pergunta,
    id: String(pergunta.id || `p${index + 1}`),
    respostaCorreta:
      pergunta.respostaCorreta ??
      pergunta.resposta_correta ??
      pergunta.correctAnswer ??
      pergunta.correct_answer
  }));
};

export const listarMaterias = async (): Promise<Materia[]> => {
  try {
    const response = await api.get('/api/materias');

    const lista = response.data?.materias || response.data || [];

    return Array.isArray(lista) && lista.length > 0
      ? lista
      : materiasFallback;
  } catch (error) {
    console.warn('Usando lista local de matérias:', error);
    return materiasFallback;
  }
};

export const buscarPerguntasPorMateria = async (materiaId: string) => {
  const materia = materiaId.toLowerCase();

  try {
    const response = await api.get(`/api/quiz/${materia}`);

    const perguntasApi = normalizarPerguntas(
      response.data?.perguntas || []
    );

    // Só utiliza a API quando ela retornar as 12 perguntas.
    if (perguntasApi.length >= 12) {
      return perguntasApi;
    }

    console.warn(
      `A API retornou ${perguntasApi.length} perguntas de ${materia}. Usando as 12 locais.`
    );
  } catch (error) {
    console.warn(
      `API indisponível para ${materia}. Usando perguntas locais.`,
      error
    );
  }

  // Os arquivos locais também possuem as 12 perguntas originais.
  return normalizarPerguntas(perguntasLocais[materia]);
};

export type TopicoEstudo = {
  id: string;
  titulo: string;
  explicacao: string;
  exemplo: string;
};

export type ConteudoMateria = {
  id: string;
  nome: string;
  descricao: string;
  topicos: TopicoEstudo[];
};

export const buscarConteudosMateria = async (
  materiaId: string
): Promise<ConteudoMateria | null> => {
  try {
    const response = await api.get(
      `/api/materias/${materiaId}/conteudos`
    );

    if (response.data?.materia) {
      return response.data.materia as ConteudoMateria;
    }
  } catch (error) {
    console.warn('Usando conteúdo local:', error);
  }

  const local = (conteudosLocais as Record<string, any>)[materiaId];

  if (!local) return null;

  return {
    id: materiaId,
    nome: local.nome,
    descricao: local.descricao,
    topicos: local.topicos.map(
      ([id, titulo, explicacao, exemplo]: string[]) => ({
        id,
        titulo,
        explicacao,
        exemplo
      })
    )
  };
};
