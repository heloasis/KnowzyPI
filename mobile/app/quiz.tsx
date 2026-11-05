
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { api } from '../src/api/api';
import {
  buscarPerguntasPorMateria,
  listarMaterias,
} from '../src/services/materiaService';
import { useAuth } from '../src/context/AuthContext';
import type { Materia, Pergunta } from '../src/types/quiz';

type RespostaQuiz = {
  perguntaId: string;
  resposta: string;
};

type EstatisticasQuiz = {
  totalQuizzes: number;
  totalAcertos: number;
  totalPerguntas: number;
  percentualMedio: number;
  historico: {
    id: string;
    materiaId: string;
    acertos: number;
    totalPerguntas: number;
    percentual: number;
    criadoEm: string;
  }[];
};

const normalizarRespostaCorreta = (pergunta: Pergunta): number => {
  const alternativas = Array.isArray(pergunta.alternativas)
    ? pergunta.alternativas
    : [];

  const raw = pergunta.respostaCorreta ?? pergunta.resposta_correta;

  if (typeof raw === 'number') return raw;

  const resposta = String(raw ?? '').trim();

  if (/^[A-E]$/i.test(resposta)) {
    return resposta.toUpperCase().charCodeAt(0) - 65;
  }

  if (/^\d+$/.test(resposta)) {
    return Number(resposta);
  }

  return alternativas.findIndex(
    (alternativa) =>
      String(alternativa).trim().toLowerCase() === resposta.toLowerCase()
  );
};

const obterResultado = (percentual: number, materiaId: string) => {
  if (materiaId === 'portugues') {
    if (percentual === 100) {
      return {
        titulo: 'Perfeito! ✦',
        descricao: 'Você acertou todas as questões. Excelente trabalho!',
      };
    }

    if (percentual >= 70) {
      return {
        titulo: 'Mandou muito!',
        descricao: 'Você teve um ótimo desempenho. Continue assim!',
      };
    }

    if (percentual >= 40) {
      return {
        titulo: 'Muito bem!',
        descricao: 'Você está avançando. Continue praticando!',
      };
    }

    return {
      titulo: 'Continue tentando!',
      descricao: 'Revise os conteúdos de Português e tente novamente.',
    };
  }

  if (percentual < 40) {
    return {
      titulo: 'Vamos por partes!',
      descricao:
        materiaId === 'historia'
          ? 'Não desanime! Revise os conteúdos de História e tente novamente.'
          : 'Ainda há conteúdo para revisar. Não desanime! Retome os estudos e tente novamente.',
    };
  }

  if (percentual < 70) {
    return {
      titulo: 'Você está evoluindo!',
      descricao:
        materiaId === 'historia'
          ? 'Continue estudando para aprender ainda mais sobre História.'
          : 'Você já avançou em alguns pontos. Continue praticando para melhorar ainda mais.',
    };
  }

  if (percentual < 90) {
    return {
      titulo: 'Muito bem!',
      descricao:
        'Você demonstrou um bom domínio do conteúdo. Continue assim!',
    };
  }

  return {
    titulo: 'Incrível!',
    descricao:
      materiaId === 'geografia' || materiaId === 'biologia'
        ? 'Excelente desempenho! Você demonstrou um ótimo domínio dessa matéria.'
        : 'Excelente desempenho! Continue avançando nos estudos.',
  };
};

const obterEmojiMateria = (slug?: string) => {
  switch (slug) {
    case 'matematica':
      return '📐';
    case 'portugues':
      return '📖';
    case 'historia':
      return '🏛️';
    case 'geografia':
      return '🌍';
    case 'biologia':
      return '🧬';
    default:
      return '📚';
  }
};

const ESTATISTICAS_KEY = 'knowzy:quizEstatisticas';
const PENDENTES_KEY = 'knowzy:quizPendentes';

const estatisticasIniciais: EstatisticasQuiz = {
  totalQuizzes: 0,
  totalAcertos: 0,
  totalPerguntas: 0,
  percentualMedio: 0,
  historico: [],
};

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ materia?: string; nome?: string }>();
  const { user, setUser } = useAuth();

  const materiaIdParam =
    typeof params.materia === 'string' ? params.materia : null;

  const materiaNomeParam =
    typeof params.nome === 'string' ? params.nome : 'Matéria';

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaId, setMateriaId] = useState<string | null>(materiaIdParam);
  const [materiaNome, setMateriaNome] = useState(materiaNomeParam);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [respostas, setRespostas] = useState<RespostaQuiz[]>([]);
  const [sincronizacao, setSincronizacao] = useState<
    'aguardando' | 'sincronizado' | 'pendente' | null
  >(null);

  // Impede que um mesmo clique finalize e contabilize o quiz duas vezes.
  const finalizacaoRef = useRef(false);

  useEffect(() => {
    let ativo = true;

    const carregarMaterias = async () => {
      try {
        const data = await listarMaterias();
        if (ativo) setMaterias(data);
      } catch (error) {
        console.warn('Erro ao carregar matérias:', error);
      } finally {
        if (ativo && !materiaIdParam) setLoading(false);
      }
    };

    carregarMaterias();

    return () => {
      ativo = false;
    };
  }, [materiaIdParam]);

  useEffect(() => {
    if (!materiaId) {
      setPerguntas([]);
      setFinished(false);
      setScore(0);
      setIndex(0);
      setLoading(false);
      return;
    }

    let ativo = true;

    const carregarQuiz = async () => {
      setLoading(true);
      setPerguntas([]);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
      setRespostas([]);
      setSincronizacao(null);
      finalizacaoRef.current = false;

      try {
        const data = await buscarPerguntasPorMateria(materiaId);

        if (ativo) {
          setPerguntas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        if (ativo) setPerguntas([]);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregarQuiz();

    return () => {
      ativo = false;
    };
  }, [materiaId]);

  const perguntaAtual = perguntas[index];

  const progresso = useMemo(() => {
    if (!perguntas.length) return 0;
    return ((index + 1) / perguntas.length) * 100;
  }, [index, perguntas.length]);

  // Salva a tentativa no celular e tenta sincronizar com o servidor.
  const concluirQuiz = async () => {
    if (finalizacaoRef.current || !materiaId || !perguntas.length) {
      return;
    }

    finalizacaoRef.current = true;

    const percentual = Math.round((score / perguntas.length) * 100);
    const criadoEm = new Date().toISOString();
    const tentativaId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    setFinished(true);
    setSincronizacao('aguardando');

    let estatisticasAtualizadas = estatisticasIniciais;

    // 1. Registra cada tentativa concluída no armazenamento do celular.
    try {
      const salvo = await AsyncStorage.getItem(ESTATISTICAS_KEY);

      const anteriores: EstatisticasQuiz = salvo
        ? { ...estatisticasIniciais, ...JSON.parse(salvo) }
        : { ...estatisticasIniciais };

      const totalQuizzes = Number(anteriores.totalQuizzes || 0) + 1;
      const totalAcertos =
        Number(anteriores.totalAcertos || 0) + score;
      const totalPerguntas =
        Number(anteriores.totalPerguntas || 0) + perguntas.length;

      estatisticasAtualizadas = {
        totalQuizzes,
        totalAcertos,
        totalPerguntas,
        percentualMedio: totalPerguntas
          ? Math.round((totalAcertos / totalPerguntas) * 100)
          : 0,
        historico: [
          ...(Array.isArray(anteriores.historico)
            ? anteriores.historico
            : []),
          {
            id: tentativaId,
            materiaId,
            acertos: score,
            totalPerguntas: perguntas.length,
            percentual,
            criadoEm,
          },
        ].slice(-100),
      };

      await AsyncStorage.setItem(
        ESTATISTICAS_KEY,
        JSON.stringify(estatisticasAtualizadas)
      );
    } catch (error) {
      console.warn('Não foi possível salvar as estatísticas locais:', error);
    }

    // 2. Guarda a tentativa na fila até conseguir sincronizar.
    const tentativa = {
      tentativaId,
      materiaId,
      respostas,
      criadoEm,
    };

    let pendentes: typeof tentativa[] = [tentativa];

    try {
      const filaSalva = await AsyncStorage.getItem(PENDENTES_KEY);
      const filaAnterior: typeof tentativa[] = filaSalva
        ? JSON.parse(filaSalva)
        : [];

      pendentes = [
        ...filaAnterior.filter(
          (item) => item.tentativaId !== tentativaId
        ),
        tentativa,
      ];

      await AsyncStorage.setItem(
        PENDENTES_KEY,
        JSON.stringify(pendentes)
      );
    } catch (error) {
      console.warn('Não foi possível guardar a fila de sincronização:', error);
    }

    // 3. Envia as tentativas pendentes para o backend.
    let falhou = false;
    let usuarioAtual = user;

    for (let i = 0; i < pendentes.length; i++) {
      const item = pendentes[i];

      try {
        const response = await api.post('/quiz/finalizar', {
          materiaId: item.materiaId,
          respostas: item.respostas,
        });

        const atualizado = response.data?.usuario;
        const serverXp = Number(
          response.data?.xpTotal ?? atualizado?.xp ?? 0
        );

        if (atualizado && usuarioAtual) {
          usuarioAtual = {
            ...usuarioAtual,
            ...atualizado,
            xp: Math.max(Number(usuarioAtual.xp || 0), serverXp),
          };

          await setUser(usuarioAtual);
        }

        pendentes.splice(i, 1);
        i--;

        await AsyncStorage.setItem(
          PENDENTES_KEY,
          JSON.stringify(pendentes)
        );
      } catch (error) {
        falhou = true;
        console.warn('Resultado aguardando sincronização:', error);
        break;
      }
    }

    setSincronizacao(falhou ? 'pendente' : 'sincronizado');
  };

  const responder = (alternativa: string) => {
    if (!perguntaAtual || selected !== null || finished) return;

    setSelected(alternativa);

    const alternativas = perguntaAtual.alternativas || [];
    const selectedIndex = alternativas.indexOf(alternativa);
    const correctIndex = normalizarRespostaCorreta(perguntaAtual);
    const correta = selectedIndex === correctIndex;

    setRespostas((atuais) => [
      ...atuais,
      {
        perguntaId: String(perguntaAtual.id),
        resposta: String(selectedIndex),
      },
    ]);

    if (correta) {
      setScore((atual) => atual + 1);
    }
  };

  // Só avança quando a pessoa aperta o botão.
  const proximaPergunta = () => {
    if (selected === null) return;

    if (index === perguntas.length - 1) {
      concluirQuiz();
      return;
    }

    setIndex((atual) => atual + 1);
    setSelected(null);
  };

  const reiniciarQuiz = () => {
    finalizacaoRef.current = false;
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setRespostas([]);
    setSincronizacao(null);
  };

  const selecionarMateria = (item: Materia) => {
    finalizacaoRef.current = false;

    const slug = String(item.slug || item.id || item.nome || 'matematica');

    setMateriaId(slug);
    setMateriaNome(item.nome || 'Matéria');
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setRespostas([]);
    setSincronizacao(null);
  };

  if (!materiaId) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.selectContainer}>
          <Text style={styles.eyebrow}>KNOWZY</Text>
          <Text style={styles.header}>Escolha uma matéria</Text>
          <Text style={styles.subtitle}>
            Selecione uma disciplina e teste seus conhecimentos.
          </Text>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#8C61FF" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.subjectList}
              showsVerticalScrollIndicator={false}
            >
              {materias.map((item) => {
                const slug = String(item.slug || item.id || '');

                return (
                  <TouchableOpacity
                    key={String(item.id || item.slug || item.nome)}
                    style={styles.subjectCard}
                    onPress={() => selecionarMateria(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.subjectEmoji}>
                      {obterEmojiMateria(slug)}
                    </Text>

                    <View style={styles.subjectTextWrap}>
                      <Text style={styles.subjectName}>{item.nome}</Text>
                      <Text style={styles.subjectMeta}>Começar quiz</Text>
                    </View>

                    <Text style={styles.subjectArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#8C61FF" />
          <Text style={styles.loadingText}>Carregando quiz...</Text>
        </View>
      </View>
    );
  }

  if (perguntas.length === 0) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>
            Nenhuma pergunta encontrada
          </Text>
          <Text style={styles.emptyText}>
            Esta matéria ainda não possui questões cadastradas.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (finished) {
    const percentual = Math.round((score / perguntas.length) * 100);
    const resultado = obterResultado(percentual, materiaId);

    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={styles.resultContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>QUIZ FINALIZADO</Text>
          <Text style={styles.header}>Seu resultado</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {percentual >= 70 ? '🏆' : '✨'}
            </Text>

            <Text style={styles.resultTitle}>{resultado.titulo}</Text>
            <Text style={styles.resultDescription}>
              {resultado.descricao}
            </Text>

            <View style={styles.resultDivider} />

            <Text style={styles.resultSubject}>{materiaNome}</Text>
            <Text style={styles.resultValue}>
              {score}/{perguntas.length}
            </Text>
            <Text style={styles.resultSubtitle}>
              {percentual}% de acertos
            </Text>

            <View style={styles.resultProgressTrack}>
              <View
                style={[
                  styles.resultProgressFill,
                  { width: `${percentual}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.syncBox}>
            {sincronizacao === 'aguardando' && (
              <>
                <ActivityIndicator color="#B99AFF" size="small" />
                <Text style={styles.syncText}>
                  Salvando seu resultado...
                </Text>
              </>
            )}

            {sincronizacao === 'sincronizado' && (
              <>
                <Text style={styles.syncIcon}>✓</Text>
                <Text style={styles.syncText}>
                  Resultado sincronizado com sua conta.
                </Text>
              </>
            )}

            {sincronizacao === 'pendente' && (
              <>
                <Text style={styles.syncIcon}>⌁</Text>
                <Text style={styles.syncText}>
                  Resultado salvo no celular e aguardando conexão para sincronizar.
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={reiniciarQuiz}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Jogar novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/conquistas')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>
              Ir para conquistas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.textButtonText}>Voltar ao início</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (!perguntaAtual) return null;

  const alternativas = perguntaAtual.alternativas || [];
  const correctIndex = normalizarRespostaCorreta(perguntaAtual);
  const ultimaPergunta = index === perguntas.length - 1;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonArea}
          >
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.counter}>
            Pergunta {index + 1}/{perguntas.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progresso}%` },
            ]}
          />
        </View>

        <Text style={styles.eyebrow}>{materiaNome.toUpperCase()}</Text>

        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            QUESTÃO {String(index + 1).padStart(2, '0')}
          </Text>

          <Text style={styles.question}>
            {perguntaAtual.enunciado}
          </Text>
        </View>

        <Text style={styles.optionsTitle}>
          Escolha uma alternativa:
        </Text>

        <View style={styles.options}>
          {alternativas.map((alternativa, alternativaIndex) => {
            const isSelected = selected === alternativa;
            const isCorrect = alternativaIndex === correctIndex;
            const showCorrect = selected !== null && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={`${alternativaIndex}-${alternativa}`}
                style={[
                  styles.option,
                  showWrong && styles.optionWrong,
                  showCorrect && styles.optionCorrect,
                ]}
                onPress={() => responder(alternativa)}
                disabled={selected !== null}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionLetter,
                    showWrong && styles.optionLetterWrong,
                    showCorrect && styles.optionLetterCorrect,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      showWrong && styles.optionLetterTextWrong,
                      showCorrect && styles.optionLetterTextCorrect,
                    ]}
                  >
                    {String.fromCharCode(65 + alternativaIndex)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optionText,
                    showWrong && styles.optionTextWrong,
                    showCorrect && styles.optionTextCorrect,
                  ]}
                >
                  {alternativa}
                </Text>

                {showCorrect && (
                  <Text style={styles.answerIcon}>✓</Text>
                )}

                {showWrong && (
                  <Text style={styles.answerIcon}>✕</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selected !== null && (
          <View
            style={[
              styles.feedbackBox,
              alternativas.indexOf(selected) === correctIndex
                ? styles.feedbackCorrect
                : styles.feedbackWrong,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {alternativas.indexOf(selected) === correctIndex
                ? 'Resposta correta! ✦'
                : 'Não foi dessa vez!'}
            </Text>

            <Text style={styles.feedbackText}>
              {alternativas.indexOf(selected) === correctIndex
                ? 'Muito bem! Continue assim.'
                : 'Continue tentando e aprendendo.'}
            </Text>
          </View>
        )}

        {selected !== null ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={proximaPergunta}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {ultimaPergunta ? 'Finalizar quiz' : 'Próxima pergunta'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.bottomHint}>
            Selecione uma alternativa para responder.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080719',
  },
  selectContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 36,
    backgroundColor: '#080719',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingTop: 35,
    paddingBottom: 40,
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
    backgroundColor: '#080719',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 15,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080719',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#B8B4D0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  eyebrow: {
    color: '#B99AFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B8B4D0',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 26,
  },
  subjectList: {
    paddingBottom: 32,
  },
  subjectCard: {
    backgroundColor: '#17152D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(185,154,255,0.16)',
    padding: 17,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectEmoji: {
    fontSize: 29,
    marginRight: 15,
  },
  subjectTextWrap: {
    flex: 1,
  },
  subjectName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  subjectMeta: {
    color: '#A9A4C5',
    fontSize: 12,
    marginTop: 5,
  },
  subjectArrow: {
    color: '#B99AFF',
    fontSize: 28,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  backButtonArea: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '500',
  },
  counter: {
    color: '#C7C2DE',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#25223D',
    overflow: 'hidden',
    marginBottom: 27,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9B70FF',
    borderRadius: 999,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 21,
    marginBottom: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  questionNumber: {
    color: '#7953D6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  question: {
    color: '#211D35',
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '800',
  },
  optionsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  options: {
    gap: 11,
  },
  option: {
    backgroundColor: '#171A35',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(117,153,255,0.22)',
    paddingVertical: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
  },
  optionLetter: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#25264A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterWrong: {
    backgroundColor: '#6A293B',
  },
  optionLetterCorrect: {
    backgroundColor: '#176448',
  },
  optionLetterText: {
    color: '#B8B4D0',
    fontSize: 13,
    fontWeight: '900',
  },
  optionLetterTextWrong: {
    color: '#FFFFFF',
  },
  optionLetterTextCorrect: {
    color: '#FFFFFF',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: '#C9FFE7',
  },
  optionTextWrong: {
    color: '#FFD5DF',
  },
  optionCorrect: {
    backgroundColor: '#123E31',
    borderColor: '#35D69A',
  },
  optionWrong: {
    backgroundColor: '#472333',
    borderColor: '#FF668A',
  },
  answerIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginLeft: 8,
  },
  feedbackBox: {
    borderRadius: 14,
    padding: 15,
    marginTop: 18,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: '#123E31',
    borderColor: '#35D69A',
  },
  feedbackWrong: {
    backgroundColor: '#472333',
    borderColor: '#FF668A',
  },
  feedbackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 5,
  },
  feedbackText: {
    color: '#F1EAFB',
    fontSize: 13,
    lineHeight: 19,
  },
  bottomHint: {
    color: '#8F8AAE',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#8659E8',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9B70FF',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#C6ACFF',
    fontSize: 14,
    fontWeight: '800',
  },
  textButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 5,
  },
  textButtonText: {
    color: '#AAA4C8',
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#17152D',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(185,154,255,0.3)',
    padding: 22,
    marginTop: 17,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 9,
  },
  resultDescription: {
    color: '#C2BDD8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  resultSubject: {
    color: '#B99AFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 43,
    fontWeight: '900',
  },
  resultSubtitle: {
    color: '#B8B4D0',
    fontSize: 13,
    marginTop: 4,
  },
  resultProgressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: '#302B4A',
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginTop: 18,
  },
  resultProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#9B70FF',
  },
  syncBox: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  syncText: {
    color: '#BDB7D4',
    fontSize: 11,
    flexShrink: 1,
    textAlign: 'center',
  },
  syncIcon: {
    color: '#B99AFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
