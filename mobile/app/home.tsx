import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const CHAVE_ESTATISTICAS = 'knowzy:estatisticasQuizzes';

type EstatisticaQuiz = {
  id?: string;
  percentual?: number;
  acertos?: number;
  totalPerguntas?: number;
  materiaId?: string;
  materia?: string;
  criadoEm?: string;
};

const links = [
  {
    title: 'Matérias',
    subtitle:
      'Explore diferentes disciplinas e aprenda novos assuntos no seu ritmo.',
    icon: 'book-outline' as const,
    route: '/materias',
    color: '#9ed4ff',
    background: 'rgba(93,155,220,0.16)',
    tag: 'DESCUBRA NOVOS CONTEÚDOS',
  },
  {
    title: 'Quizzes',
    subtitle:
      'Teste seus conhecimentos e descubra o quanto você já aprendeu.',
    icon: 'bulb-outline' as const,
    route: '/quiz',
    color: '#bcb2ff',
    background: 'rgba(127,101,217,0.19)',
    tag: 'APRENDA E PRATIQUE',
  },
  {
    title: 'Favoritos',
    subtitle:
      'Encontre facilmente os conteúdos que você salvou para estudar depois.',
    icon: 'heart-outline' as const,
    route: '/favoritos',
    color: '#e3a5ff',
    background: 'rgba(172,101,217,0.15)',
    tag: 'SEU CONTEÚDO',
  },
  {
    title: 'Conquistas',
    subtitle:
      'Acompanhe seus pontos, níveis, recompensas e evolução no Knowzy.',
    icon: 'trophy-outline' as const,
    route: '/conquistas',
    color: '#e3c1ff',
    background: 'rgba(141,101,217,0.18)',
    tag: 'SUA EVOLUÇÃO',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [mediaAcertos, setMediaAcertos] = useState(0);
  const [ultimoResultado, setUltimoResultado] = useState('—');
  const [ultimaMateria, setUltimaMateria] = useState('');

  const userData = user as any;

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregarEstatisticas = async () => {
        try {
          const dadosSalvos = await AsyncStorage.getItem(
            CHAVE_ESTATISTICAS
          );

          const registros: EstatisticaQuiz[] = dadosSalvos
            ? JSON.parse(dadosSalvos)
            : [];

          if (!Array.isArray(registros)) {
            if (ativo) {
              setTotalQuizzes(0);
              setMediaAcertos(0);
              setUltimoResultado('—');
              setUltimaMateria('');
            }
            return;
          }

          const registrosValidos = registros.filter(
            (item) =>
              typeof item.percentual === 'number' &&
              Number.isFinite(item.percentual)
          );

          const total = registrosValidos.length;

          const media =
            total > 0
              ? registrosValidos.reduce(
                  (soma, item) => soma + Number(item.percentual),
                  0
                ) / total
              : 0;

          const ordenados = [...registrosValidos].sort((a, b) => {
            const dataA = a.criadoEm
              ? new Date(a.criadoEm).getTime()
              : 0;
            const dataB = b.criadoEm
              ? new Date(b.criadoEm).getTime()
              : 0;

            return dataB - dataA;
          });

          const ultimo = ordenados[0];

          let resultado = '—';

          if (ultimo) {
            if (
              typeof ultimo.acertos === 'number' &&
              typeof ultimo.totalPerguntas === 'number'
            ) {
              resultado = `${ultimo.acertos}/${ultimo.totalPerguntas}`;
            } else {
              resultado = `${Math.round(ultimo.percentual ?? 0)}%`;
            }
          }

          if (ativo) {
            setTotalQuizzes(total);
            setMediaAcertos(Math.round(media));
            setUltimoResultado(resultado);
            setUltimaMateria(ultimo?.materia || ultimo?.materiaId || '');
          }
        } catch (error) {
          console.warn(
            'Erro ao carregar estatísticas dos quizzes:',
            error
          );

          if (ativo) {
            setTotalQuizzes(0);
            setMediaAcertos(0);
            setUltimoResultado('—');
            setUltimaMateria('');
          }
        }
      };

      carregarEstatisticas();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const xp = Math.max(
    0,
    Number(userData?.xp ?? userData?.xpTotal ?? 0) || 0
  );

  const firstName =
    userData?.nome?.split(' ')[0] || 'Estudante';

  const level =
    xp >= 3000
      ? 'Lenda'
      : xp >= 1500
        ? 'Mestre'
        : xp >= 1000
          ? 'Sábio'
          : xp >= 500
            ? 'Aventureiro'
            : 'Iniciante';

  const columns = width > 650 ? 2 : 1;

  function navigate(route: string) {
    router.push(route as any);
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* FUNDO ESPACIAL */}
      <View pointerEvents="none" style={styles.background}>
        <View style={[styles.star, styles.starOne]} />
        <View style={[styles.star, styles.starTwo]} />
        <View style={[styles.star, styles.starThree]} />
        <View style={[styles.star, styles.starFour]} />
        <View style={[styles.star, styles.starFive]} />
        <View style={styles.backgroundGlow} />
        <View style={styles.backgroundGlowTwo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>knowzy</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigate('/perfil')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* BOAS-VINDAS */}
        <View style={styles.welcome}>
          <View style={styles.welcomeContent}>
            <Text style={styles.eyebrow}>
              ✦ SEU ESPAÇO DE APRENDIZADO
            </Text>

            <Text style={styles.welcomeTitle}>
              Olá, <Text style={styles.nameHighlight}>{firstName}!</Text>
            </Text>

            <Text style={styles.welcomeHighlight}>
              Que tal aprender algo novo hoje?
            </Text>

            <Text style={styles.welcomeDescription}>
              Explore novos conhecimentos, pratique o que aprendeu e
              transforme cada descoberta em uma conquista.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigate('/materias')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                Explorar matérias
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <View pointerEvents="none" style={styles.planetArea}>
            <View style={styles.orbit} />
            <View style={styles.planet} />
            <View style={styles.smallPlanet} />

            <Ionicons
              name="star"
              size={23}
              color="#f4d9ff"
              style={styles.planetStar}
            />

            <Ionicons
              name="sparkles"
              size={24}
              color="#c2b5ff"
              style={styles.planetSparkle}
            />
          </View>
        </View>

        {/* CONTINUE ESTUDANDO */}
        <View style={styles.continueCard}>
          <View style={styles.continueContent}>
            <Text style={styles.sectionLabel}>
              SUA JORNADA DE APRENDIZADO
            </Text>

            <Text style={styles.continueTitle}>
              Continue de onde parou!
            </Text>

            <Text style={styles.continueDescription}>
              Sua última matéria acessada aparecerá aqui.
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigate('/materias')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Escolher uma matéria
              </Text>
              <Ionicons
                name="arrow-forward"
                size={15}
                color="#d8dcff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.continueIcon}>
            <Ionicons
              name="book-outline"
              size={34}
              color="#c4b8ff"
            />
            <Ionicons
              name="star"
              size={14}
              color="#f4d9a0"
              style={styles.tinyStar}
            />
          </View>
        </View>

        {/* PROGRESSO DOS ESTUDOS */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionLabel}>
            ACOMPANHE SUA EVOLUÇÃO
          </Text>

          <Text style={styles.sectionTitle}>
            Seu progresso nos estudos
          </Text>

          <Text style={styles.sectionDescription}>
            Veja como está seu desempenho nos quizzes.
          </Text>
        </View>

        <View style={styles.progressGrid}>
          <View style={styles.progressCard}>
            <View style={styles.progressCardIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color="#bcb2ff"
              />
            </View>

            <View style={styles.progressText}>
              <Text style={styles.progressLabel}>
                Quizzes concluídos
              </Text>
              <Text style={styles.progressValue}>
                {totalQuizzes}
              </Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressCardIcon}>
              <Ionicons
                name="trending-up-outline"
                size={22}
                color="#9ed4ff"
              />
            </View>

            <View style={styles.progressText}>
              <Text style={styles.progressLabel}>
                Média de acertos
              </Text>
              <Text style={styles.progressValue}>
                {mediaAcertos}%
              </Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressCardIcon}>
              <Ionicons
                name="trophy-outline"
                size={22}
                color="#e3c1ff"
              />
            </View>

            <View style={styles.progressText}>
              <Text style={styles.progressLabel}>
                Último resultado
              </Text>
              <Text style={styles.progressValue}>
                {ultimoResultado}
              </Text>
              {ultimaMateria ? (
                <Text style={styles.progressExtra}>
                  {ultimaMateria}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressCardIcon}>
              <Ionicons
                name="flash-outline"
                size={22}
                color="#f4d9a0"
              />
            </View>

            <View style={styles.progressText}>
              <Text style={styles.progressLabel}>
                XP total · {level}
              </Text>
              <Text style={styles.progressValue}>
                {xp}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.progressNote}>
          Seus resultados aparecerão aqui depois que você concluir um quiz.
        </Text>

        {/* ÁREA DE ESTUDOS */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionLabel}>
            EXPLORE O KNOWZY
          </Text>

          <Text style={styles.sectionTitle}>
            Seu espaço de estudos
          </Text>

          <Text style={styles.sectionDescription}>
            Tudo o que você precisa para aprender em um só lugar.
          </Text>
        </View>

        <View style={styles.grid}>
          {links.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.featureCard,
                { width: columns === 2 ? '48%' : '100%' },
              ]}
              activeOpacity={0.82}
              onPress={() => navigate(item.route)}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.background },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.color}
                />
              </View>

              <Text style={styles.cardTag}>
                {item.tag}
              </Text>

              <Text style={styles.cardTitle}>
                {item.title}
              </Text>

              <Text style={styles.cardDescription}>
                {item.subtitle}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#9aa6ff"
                style={styles.cardArrow}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* TUTOR IA EM BREVE */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={25}
              color="#d5c7ff"
            />
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.sectionLabel}>
              NOVIDADE EM BREVE
            </Text>

            <Text style={styles.aiTitle}>
              O Tutor IA está chegando!
            </Text>

            <Text style={styles.aiDescription}>
              Em breve, você poderá tirar dúvidas e receber explicações e
              exemplos para apoiar seus estudos.
            </Text>

            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>
                EM BREVE
              </Text>
            </View>
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © Knowzy — Aprender pode ser uma aventura.
          </Text>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigate('/configuracoes')}
          >
            <Ionicons
              name="settings-outline"
              size={15}
              color="#aeb8ed"
            />
            <Text style={styles.footerLinkText}>
              Configurações
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#070b24',
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  backgroundGlow: {
    position: 'absolute',
    top: 100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: 'rgba(73,75,170,0.16)',
  },

  backgroundGlowTwo: {
    position: 'absolute',
    top: 550,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 150,
    backgroundColor: 'rgba(100,62,180,0.13)',
  },

  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#c5caff',
    shadowColor: '#a5afff',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 3,
  },

  starOne: {
    top: '12%',
    left: '8%',
  },

  starTwo: {
    top: '28%',
    right: '8%',
  },

  starThree: {
    top: '57%',
    left: '12%',
  },

  starFour: {
    top: '78%',
    right: '15%',
  },

  starFive: {
    top: '90%',
    left: '48%',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 35,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 19,
    paddingVertical: 12,
    backgroundColor: 'rgba(16,23,53,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.14)',
    borderRadius: 20,
    marginBottom: 25,
  },

  brand: {
    justifyContent: 'center',
  },

  brandName: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1.5,
  },

  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: 'rgba(112,126,225,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcome: {
    minHeight: 330,
    position: 'relative',
    overflow: 'hidden',
    padding: 25,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(157,153,255,0.23)',
    backgroundColor: '#202052',
    justifyContent: 'center',
  },

  welcomeContent: {
    zIndex: 2,
  },

  eyebrow: {
    color: '#c2b5ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  welcomeTitle: {
    color: '#ffffff',
    fontSize: 35,
    fontWeight: '900',
    marginTop: 19,
    letterSpacing: -1.2,
  },

  nameHighlight: {
    color: '#b8b1ff',
  },

  welcomeHighlight: {
    color: '#b8b1ff',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 5,
  },

  welcomeDescription: {
    color: '#c3c9e7',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 23,
    maxWidth: 310,
  },

  primaryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7189e8',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  planetArea: {
    position: 'absolute',
    width: 130,
    height: 130,
    right: -15,
    bottom: -8,
    opacity: 0.7,
  },

  planet: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 40,
    backgroundColor: '#8065d9',
    right: 20,
    top: 25,
    borderWidth: 2,
    borderColor: '#a995ff',
  },

  smallPlanet: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#a9c4ff',
    right: 0,
    top: 5,
  },

  orbit: {
    position: 'absolute',
    width: 140,
    height: 58,
    borderWidth: 1,
    borderColor: 'rgba(205,197,255,0.6)',
    borderRadius: 70,
    top: 40,
    right: -5,
    transform: [{ rotate: '-28deg' }],
  },

  planetStar: {
    position: 'absolute',
    left: 0,
    top: 5,
  },

  planetSparkle: {
    position: 'absolute',
    right: 5,
    bottom: 0,
  },

  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.2)',
    backgroundColor: '#151f47',
  },

  continueContent: {
    flex: 1,
  },

  sectionLabel: {
    color: '#a995ff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  continueTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 9,
  },

  continueDescription: {
    color: '#a3acce',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 17,
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: 'rgba(113,137,245,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.2)',
  },

  secondaryButtonText: {
    color: '#d8dcff',
    fontSize: 11,
    fontWeight: '700',
  },

  continueIcon: {
    width: 65,
    height: 65,
    borderRadius: 19,
    backgroundColor: 'rgba(127,101,217,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(177,160,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '5deg' }],
  },

  tinyStar: {
    position: 'absolute',
    top: 7,
    right: 7,
  },

  sectionHeading: {
    marginTop: 39,
    marginBottom: 19,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },

  sectionDescription: {
    color: '#a3acce',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  progressGrid: {
    gap: 13,
  },

  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 95,
    padding: 19,
    backgroundColor: '#151e43',
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.14)',
    borderRadius: 18,
  },

  progressCardIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 15,
    backgroundColor: 'rgba(127,101,217,0.19)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressText: {
    flex: 1,
  },

  progressLabel: {
    color: '#a3acce',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },

  progressValue: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
  },

  progressExtra: {
    color: '#a3acce',
    fontSize: 10,
    marginTop: 3,
  },

  progressNote: {
    color: '#a3acce',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 13,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },

  featureCard: {
    minHeight: 185,
    padding: 21,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(151,166,255,0.14)',
    backgroundColor: '#151e43',
    position: 'relative',
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  cardTag: {
    color: '#a995ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  cardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 7,
  },

  cardDescription: {
    color: '#a3acce',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
    paddingRight: 5,
  },

  cardArrow: {
    position: 'absolute',
    right: 17,
    top: 23,
  },

  aiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 40,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(153,130,255,0.25)',
    backgroundColor: '#151b3b',
  },

  aiIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,101,217,0.22)',
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 9,
    lineHeight: 25,
  },

  aiDescription: {
    color: '#a3acce',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(128,101,217,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(178,155,255,0.3)',
    marginTop: 14,
  },

  aiBadgeText: {
    color: '#c7b8ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  footer: {
    marginTop: 42,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(151,166,255,0.14)',
    gap: 13,
  },

  footerText: {
    color: '#818bab',
    fontSize: 11,
  },

  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  footerLinkText: {
    color: '#aeb8ed',
    fontSize: 11,
  },
});