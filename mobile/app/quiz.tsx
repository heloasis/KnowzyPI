import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buscarPerguntasPorMateria, listarMaterias } from '../src/services/materiaService';
import { useAuth } from '../src/context/AuthContext';
import type { Materia, Pergunta } from '../src/types/quiz';

const buildConquistasDoUsuario = (
  xp = 0,
  totalQuizzes = 0,
  materiasExploradas: string[] = [],
  ultimaPontuacao = 0,
  conquistas: string[] = []
) => {
  const lista = Array.from(new Set((conquistas || []).filter(Boolean)));

  if (Number(xp || 0) >= 25) lista.push('primeiro_login');
  if (Number(totalQuizzes || 0) >= 50) lista.push('cinquenta_quizzes');
  if (Number(materiasExploradas?.length || 0) >= 5) lista.push('explorar_materias');
  if (Number(totalQuizzes || 0) >= 5) lista.push('cinco_quizzes');
  if (Number(ultimaPontuacao || 0) >= 100) lista.push('licao_perfeita');

  return Array.from(new Set(lista));
};

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ materia?: string; nome?: string }>();
  const { user, setUser } = useAuth();
  const materiaIdParam = typeof params.materia === 'string' ? params.materia : null;
  const materiaNomeParam = typeof params.nome === 'string' ? params.nome : 'Matéria';

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaId, setMateriaId] = useState<string | null>(materiaIdParam);
  const [materiaNome, setMateriaNome] = useState<string>(materiaNomeParam);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpAtualizado, setXpAtualizado] = useState(false);

  useEffect(() => {
    const carregarMaterias = async () => {
      try {
        const data = await listarMaterias();
        setMaterias(data);
      } catch (error) {
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    carregarMaterias();
  }, [materiaIdParam]);

  useEffect(() => {
    if (!materiaId) {
      setPerguntas([]);
      setFinished(false);
      setScore(0);
      setIndex(0);
      return;
    }

    const fetchQuiz = async () => {
      setLoading(true);
      const data = await buscarPerguntasPorMateria(materiaId);
      setPerguntas(data);
      setLoading(false);
    };

    fetchQuiz();
  }, [materiaId]);

  const perguntaAtual = perguntas[index];

  useEffect(() => {
    if (!finished || xpAtualizado || !user) return;

    const totalQuizzes = (Number(user.totalQuizzes || 0) + 1);
    const materiasExploradas = Array.from(
      new Set([...(user.materiasExploradas || []), materiaNome])
    );
    const ultimaPontuacao = perguntas.length > 0 ? Math.round((score / perguntas.length) * 100) : 0;
    const xpGanho = Math.max(10, Math.round((score / Math.max(1, perguntas.length)) * 20));
    const novoXp = Number(user.xp || 0) + xpGanho;

    setUser({
      ...user,
      xp: novoXp,
      totalQuizzes,
      materiasExploradas,
      ultimaPontuacao,
      conquistas: buildConquistasDoUsuario(
        novoXp,
        totalQuizzes,
        materiasExploradas,
        ultimaPontuacao,
        user.conquistas || []
      )
    });

    setXpAtualizado(true);
  }, [finished, xpAtualizado, user, score, perguntas.length, materiaNome, setUser]);

  const progresso = useMemo(() => {
    if (!perguntas.length) return 0;
    return ((index + 1) / perguntas.length) * 100;
  }, [index, perguntas.length]);

  const responder = (resposta: string) => {
    if (!perguntaAtual) return;
    setSelected(resposta);

    if (resposta === perguntaAtual.respostaCorreta) {
      setScore((value) => value + 1);
    }

    setTimeout(() => {
      if (index === perguntas.length - 1) {
        setFinished(true);
        return;
      }

      setIndex((value) => value + 1);
      setSelected(null);
    }, 500);
  };

  const restartQuiz = () => {
    setMateriaId(null);
    setMateriaNome('Matéria');
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setPerguntas([]);
  };

  const selecionarMateria = (item: Materia) => {
    const slug = String(item.slug || item.id || item.nome || 'matematica');
    setMateriaId(slug);
    setMateriaNome(item.nome || 'Matéria');
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (!materiaId) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.selectContainer}>
          <Text style={styles.header}>Escolha uma matéria</Text>
          <Text style={styles.subtitle}>Selecione a disciplina para começar o quiz.</Text>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#8C61FF" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.subjectList}>
              {materias.map((item) => (
                <TouchableOpacity
                  key={String(item.id || item.slug || item.nome)}
                  style={styles.subjectCard}
                  onPress={() => selecionarMateria(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.subjectEmoji}>{item.slug === 'matematica' ? '📐' : item.slug === 'portugues' ? '📖' : item.slug === 'historia' ? '🏛️' : item.slug === 'geografia' ? '🌍' : '🧬'}</Text>
                  <View style={styles.subjectTextWrap}>
                    <Text style={styles.subjectName}>{item.nome}</Text>
                    <Text style={styles.subjectMeta}>Começar quiz</Text>
                  </View>
                  <Text style={styles.subjectArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#8C61FF" />
          <Text style={styles.loadingText}>Carregando quiz...</Text>
        </View>
      </View>
    );
  }

  if (!perguntaAtual && !loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhuma pergunta encontrada</Text>
          <Text style={styles.emptyText}>Esta matéria ainda não possui questões cadastradas.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (finished) {
    const percentual = Math.round((score / perguntas.length) * 100);

    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <Text style={styles.header}>Quiz concluído</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{materiaNome}</Text>
            <Text style={styles.resultValue}>{score}/{perguntas.length}</Text>
            <Text style={styles.resultSubtitle}>{percentual}% de acertos</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={restartQuiz}>
            <Text style={styles.primaryButtonText}>Jogar novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/conquistas')}>
            <Text style={styles.secondaryButtonText}>Ir para conquistas</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>Pergunta {index + 1}/{perguntas.length}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progresso}%` }]} />
        </View>

        <Text style={styles.title}>{materiaNome}</Text>
        <Text style={styles.question}>{perguntaAtual.enunciado}</Text>

        <View style={styles.options}>
          {perguntaAtual.alternativas.map((alternativa) => {
            const isSelected = selected === alternativa;
            const isCorrect = alternativa === perguntaAtual.respostaCorreta;

            return (
              <TouchableOpacity
                key={alternativa}
                style={[
                  styles.option,
                  isSelected && !isCorrect && styles.optionWrong,
                  isCorrect && selected !== null && styles.optionCorrect,
                ]}
                onPress={() => responder(alternativa)}
                disabled={selected !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && !isCorrect && styles.optionTextWrong,
                    isCorrect && selected !== null && styles.optionTextCorrect,
                  ]}
                >
                  {alternativa}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060312',
  },
  selectContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    backgroundColor: '#060312',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060312',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060312',
    padding: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#b7c2ea',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  header: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#b7c2ea',
    fontSize: 15,
    marginBottom: 20,
  },
  subjectList: {
    paddingBottom: 32,
  },
  subjectCard: {
    backgroundColor: '#0d0f1f',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectEmoji: {
    fontSize: 30,
    marginRight: 14,
  },
  subjectTextWrap: {
    flex: 1,
  },
  subjectName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  subjectMeta: {
    color: '#b7c2ea',
    fontSize: 12,
    marginTop: 4,
  },
  subjectArrow: {
    color: '#8C61FF',
    fontSize: 28,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  counter: {
    color: '#b7c2ea',
    fontSize: 14,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 22,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8C61FF',
    borderRadius: 999,
  },
  question: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#11182d',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionCorrect: {
    backgroundColor: '#123e2e',
    borderColor: '#2ccf7c',
  },
  optionWrong: {
    backgroundColor: '#3e1f2d',
    borderColor: '#ff5c8a',
  },
  optionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#d9fff0',
  },
  optionTextWrong: {
    color: '#ffe5ee',
  },
  primaryButton: {
    backgroundColor: '#8C61FF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8C61FF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#8C61FF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#121a38',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(140,97,255,0.35)',
    padding: 22,
    marginTop: 20,
    marginBottom: 20,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultValue: {
    color: '#8C61FF',
    fontSize: 36,
    fontWeight: '800',
  },
  resultSubtitle: {
    color: '#b7c2ea',
    fontSize: 14,
    marginTop: 6,
  },
});
