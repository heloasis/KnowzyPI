import { api } from '../api/api';
import { normalizeUtf8Text } from '../utils/text';
import type { Materia } from '../types/quiz';

const materiasFallback: Materia[] = [
  { id: 'matematica', slug: 'matematica', nome: 'Matemática', descricao: 'Questões de números e lógica.' },
  { id: 'portugues', slug: 'portugues', nome: 'Português', descricao: 'Interpretação e gramática.' },
  { id: 'historia', slug: 'historia', nome: 'História', descricao: 'Temas históricos do Brasil e do mundo.' },
  { id: 'geografia', slug: 'geografia', nome: 'Geografia', descricao: 'Espaço, população e mapas.' },
  { id: 'biologia', slug: 'biologia', nome: 'Biologia', descricao: 'Vida, células e ecologia.' },
];

export const listarMaterias = async (): Promise<Materia[]> => {
  try {
    const response = await api.get('/api/materias');
    const lista = normalizeUtf8Text(response.data?.materias || response.data || []) as Materia[];
    return Array.isArray(lista) && lista.length > 0 ? lista : materiasFallback;
  } catch (error: any) {
    console.error('Erro ao listar matérias:', error);
    return materiasFallback;
  }
};

export const buscarPerguntasPorMateria = async (materiaId: string) => {
  try {
    const response = await api.get(`/api/quiz/${materiaId}`);
    const perguntas = normalizeUtf8Text(response.data?.perguntas || []) as any[];
    return perguntas;
  } catch (error: any) {
    console.error('Erro ao buscar perguntas:', error);
    return [];
  }
};
