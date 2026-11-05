
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const DEFAULT_CATALOG = [
  {
    id: 'primeiro_login',
    titulo: 'Primeiro Login',
    descricao: 'Acesse o sistema pela primeira vez.',
    meta: 1,
    xpRecompensa: 25,
    icone: '🚀',
  },
  {
    id: 'cinco_quizzes',
    titulo: 'Cinco Quizzes',
    descricao: 'Responda 5 quizzes com sucesso.',
    meta: 5,
    xpRecompensa: 100,
    icone: '🎯',
  },
  {
    id: 'explorar_materias',
    titulo: 'Explorador',
    descricao: 'Explore pelo menos 5 matérias.',
    meta: 5,
    xpRecompensa: 200,
    icone: '🧭',
  },
  {
    id: 'cinquenta_quizzes',
    titulo: 'Mestre dos Quizzes',
    descricao: 'Complete 50 quizzes.',
    meta: 50,
    xpRecompensa: 500,
    icone: '🏆',
  },
  {
    id: 'licao_perfeita',
    titulo: 'Lição Perfeita',
    descricao: 'Alcance 100 pontos em uma lição.',
    meta: 1,
    xpRecompensa: 50,
    icone: '✨',
  },
];

const petStages = [
  {
    key: 'iniciante',
    name: 'Iniciante',
    min: 0,
    max: 499,
    next: 'Aventureiro',
    image: require('../assets/mascotes/iniciante.png'),
  },
  {
    key: 'aventureiro',
    name: 'Aventureiro',
    min: 500,
    max: 999,
    next: 'Sábio',
    image: require('../assets/mascotes/aventureiro.png'),
  },
  {
    key: 'sabio',
    name: 'Sábio',
    min: 1000,
    max: 1499,
    next: 'Mestre',
    image: require('../assets/mascotes/sabio.png'),
  },
  {
    key: 'mestre',
    name: 'Mestre',
    min: 1500,
    max: 2999,
    next: 'Lenda',
    image: require('../assets/mascotes/mestre.png'),
  },
  {
    key: 'lenda',
    name: 'Lenda',
    min: 3000,
    max: Infinity,
    next: 'Máximo',
    image: require('../assets/mascotes/lenda.png'),
  },
];

const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString('pt-BR');

const formatXp = (value: number) => `${formatNumber(value)} XP`;

export default function ConquistasScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Permite ler campos opcionais sem alterar o tipo original do AuthContext.
  const userData = user as any;

  const xp = Math.max(
    0,
    Number(userData?.xp ?? userData?.xpTotal ?? 0) || 0
  );

  const currentUserName =
    userData?.nome?.trim()?.split(' ')[0] || 'Usuário';

  const userTag = userData?.tag || '#0001';

  const currentIndex = petStages.findIndex(
    (stage) => xp >= stage.min && xp <= stage.max
  );

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStage = petStages[safeIndex];
  const nextStage = petStages[safeIndex + 1] || null;

  const nextLevelName = nextStage?.name || 'Máximo';

  const progressPercent = nextStage
    ? Math.min(
        100,
        Math.max(
          0,
          ((xp - currentStage.min) /
            (nextStage.min - currentStage.min)) *
            100
        )
      )
    : 100;

  const unlockedIds: string[] = Array.isArray(userData?.conquistas)
    ? userData.conquistas
        .map((item: any) =>
          typeof item === 'string' ? item : item?.id
        )
        .filter(Boolean)
    : [];

  const getProgress = (quest: (typeof DEFAULT_CATALOG)[number]) => {
    return unlockedIds.includes(quest.id) ? quest.meta : 0;
  };

  const completedCount = DEFAULT_CATALOG.filter((quest) =>
    unlockedIds.includes(quest.id)
  ).length;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>JORNADA</Text>
            <Text style={styles.title}>Conquistas</Text>
            <Text style={styles.subtitle}>
              Cada conquista é um passo na sua jornada
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileMini}
            activeOpacity={0.8}
            onPress={() => router.push('/perfil')}
          >
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarLetter}>
                {currentUserName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {currentUserName}
              </Text>
              <Text style={styles.profileTag}>{userTag}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CARD DO MASCOTE */}
        <View style={styles.mascotCard}>
          <View style={styles.mascotCopy}>
            <Text style={styles.label}>MASCOTE</Text>

            <Text style={styles.levelName}>
              {currentStage.name}
            </Text>

            <View style={styles.levelMeta}>
              <Text style={styles.xpTotal}>
                {formatXp(xp)}
              </Text>

              <Text style={styles.metaDivider}>•</Text>

              <Text style={styles.nextLevelText}>
                {nextStage
                  ? `Próximo nível: ${nextLevelName}`
                  : 'Nível máximo alcançado'}
              </Text>
            </View>
          </View>

          <View style={styles.mascotVisualWrap}>
            <View style={styles.mascotVisual}>
              <Image
                source={currentStage.image as ImageSourcePropType}
                style={styles.petImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.nextLevelPanel}>
            <Text style={styles.miniLabel}>PRÓXIMO NÍVEL</Text>

            <Text style={styles.nextLevelName}>
              {nextStage ? nextStage.name : 'Nível máximo'}
            </Text>

            <Text style={styles.xpRange}>
              {nextStage
                ? formatXp(nextStage.min)
                : 'Todos desbloqueados'}
            </Text>
          </View>
        </View>

        {/* PAINEL DE CONQUISTAS */}
        <View style={styles.questsPanel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Conquistas</Text>

            <View style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver tudo</Text>
            </View>
          </View>

          <View style={styles.questsList}>
            {DEFAULT_CATALOG.map((quest) => {
              const progress = getProgress(quest);
              const safeMeta = Math.max(1, quest.meta);

              const percent = Math.min(
                100,
                (progress / safeMeta) * 100
              );

              const isComplete = unlockedIds.includes(quest.id);
              const isInProgress = !isComplete && progress > 0;

              return (
                <View
                  key={quest.id}
                  style={styles.questCard}
                >
                  <View style={styles.questIcon}>
                    <Text style={styles.questEmoji}>
                      {quest.icone}
                    </Text>
                  </View>

                  <View style={styles.questInfo}>
                    <View style={styles.questTitleRow}>
                      <Text style={styles.questTitle}>
                        {quest.titulo}
                      </Text>

                      <Text style={styles.questReward}>
                        +{quest.xpRecompensa} XP
                      </Text>
                    </View>

                    <Text style={styles.questDescription}>
                      {quest.descricao}
                    </Text>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${percent}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.progressMeta}>
                      <Text style={styles.progressMetaText}>
                        {isComplete
                          ? `${safeMeta}/${safeMeta}`
                          : `${progress}/${safeMeta}`}
                      </Text>

                      <Text style={styles.progressMetaText}>
                        {Math.round(percent)}%
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.questAction,
                      isComplete
                        ? styles.completed
                        : isInProgress
                          ? styles.inProgress
                          : styles.locked,
                    ]}
                  >
                    <Text style={styles.questActionText}>
                      {isComplete
                        ? '✓ Concluída'
                        : isInProgress
                          ? '→ Continuar'
                          : '🔒 Bloqueado'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.statusBar}>
          <View>
            <Text style={styles.statusLabel}>
              Conquistas desbloqueadas
            </Text>

            <Text style={styles.statusCount}>
              {completedCount} / {DEFAULT_CATALOG.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.returnButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.returnButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090B1C',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: '#A9B7DC',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: '#EEF3FF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  subtitle: {
    color: '#A9B7DC',
    fontSize: 13,
    marginTop: 7,
  },

  profileMini: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 17,
    paddingVertical: 9,
    paddingHorizontal: 12,
    minWidth: 145,
    maxWidth: '100%',
  },

  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8065D9',
  },

  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: '#EEF3FF',
    fontSize: 13,
    fontWeight: '700',
  },

  profileTag: {
    color: '#A9B7DC',
    fontSize: 11,
    marginTop: 3,
  },

  mascotCard: {
    backgroundColor: 'rgba(115,92,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(156,123,255,0.28)',
    borderRadius: 25,
    padding: 17,
    marginBottom: 19,
    gap: 16,
  },

  mascotCopy: {
    alignItems: 'center',
  },

  label: {
    color: '#A9B7DC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  levelName: {
    color: '#EEF3FF',
    fontSize: 28,
    fontWeight: '800',
  },

  levelMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },

  xpTotal: {
    color: '#A995FF',
    fontSize: 13,
    fontWeight: '800',
  },

  metaDivider: {
    color: '#A9B7DC',
    fontSize: 13,
  },

  nextLevelText: {
    color: '#A9B7DC',
    fontSize: 11,
  },

  mascotVisualWrap: {
    alignItems: 'center',
  },

  mascotVisual: {
    width: 145,
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(156,123,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  petImage: {
    width: '100%',
    height: '100%',
  },

  nextLevelPanel: {
    backgroundColor: 'rgba(9,14,26,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 17,
    padding: 14,
    alignItems: 'center',
  },

  miniLabel: {
    color: '#A9B7DC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  nextLevelName: {
    color: '#EEF3FF',
    fontSize: 18,
    fontWeight: '800',
  },

  xpRange: {
    color: '#A9B7DC',
    fontSize: 12,
    marginTop: 6,
  },

  questsPanel: {
    backgroundColor: 'rgba(14,19,34,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 23,
    padding: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#EEF3FF',
    fontSize: 19,
    fontWeight: '800',
  },

  viewAllButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  viewAllText: {
    color: '#EEF3FF',
    fontSize: 11,
    fontWeight: '600',
  },

  questsList: {
    gap: 12,
  },

  questCard: {
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },

  questIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(156,123,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  questEmoji: {
    fontSize: 23,
  },

  questInfo: {
    minWidth: 0,
  },

  questTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },

  questTitle: {
    flex: 1,
    color: '#EEF3FF',
    fontSize: 13,
    fontWeight: '800',
  },

  questReward: {
    color: '#FFC85D',
    fontSize: 11,
    fontWeight: '800',
  },

  questDescription: {
    color: '#A9B7DC',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 10,
  },

  progressTrack: {
    height: 9,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },

  progressBar: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#8065D9',
  },

  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  progressMetaText: {
    color: '#A9B7DC',
    fontSize: 10,
  },

  questAction: {
    alignSelf: 'flex-start',
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },

  completed: {
    backgroundColor: '#7156CF',
  },

  inProgress: {
    backgroundColor: '#3F73FF',
  },

  locked: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  questActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 17,
    marginTop: 17,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  statusLabel: {
    color: '#A9B7DC',
    fontSize: 11,
    marginBottom: 5,
  },

  statusCount: {
    color: '#EEF3FF',
    fontSize: 17,
    fontWeight: '800',
  },

  returnButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  returnButtonText: {
    color: '#EEF3FF',
    fontSize: 13,
    fontWeight: '700',
  },
});
