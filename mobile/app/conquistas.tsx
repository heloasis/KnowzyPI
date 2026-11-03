
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const petStages = [
  {
    key: 'iniciante',
    name: 'Iniciante',
    min: 0,
    max: 499,
    image: require('../assets/mascotes/iniciante.png'),
  },
  {
    key: 'aventureiro',
    name: 'Aventureiro',
    min: 500,
    max: 999,
    image: require('../assets/mascotes/aventureiro.png'),
  },
  {
    key: 'sabio',
    name: 'Sábio',
    min: 1000,
    max: 1499,
    image: require('../assets/mascotes/sabio.png'),
  },
  {
    key: 'mestre',
    name: 'Mestre',
    min: 1500,
    max: 2999,
    image: require('../assets/mascotes/mestre.png'),
  },
  {
    key: 'lenda',
    name: 'Lenda',
    min: 3000,
    max: Infinity,
    image: require('../assets/mascotes/lenda.png'),
  },
];

const conquistas = [
  {
    id: 'primeiro_login',
    titulo: 'Faça seu primeiro login ou acesse a plataforma',
    descricao: 'Entre pela primeira vez no app.',
    meta: 25,
    xp: 25,
    icone: 'log-in-outline',
    cor: '#B34DFF',
    tipo: 'xp',
  },
  {
    id: 'cinquenta_quizzes',
    titulo: 'Complete 50 quizzes',
    descricao: 'Finalize 50 atividades.',
    meta: 50,
    xp: 500,
    icone: 'trophy-outline',
    cor: '#FFC400',
    tipo: 'quizzes',
  },
  {
    id: 'explorar_materias',
    titulo: 'Explore todas as matérias',
    descricao: 'Acesse todas as matérias disponíveis.',
    meta: 5,
    xp: 200,
    icone: 'compass-outline',
    cor: '#00D6C0',
    tipo: 'materias',
  },
  {
    id: 'cinco_quizzes',
    titulo: 'Complete 5 quizzes',
    descricao: 'Conclua 5 quizzes.',
    meta: 5,
    xp: 100,
    icone: 'school-outline',
    cor: '#258BFF',
    tipo: 'quizzes',
  },
  {
    id: 'licao_perfeita',
    titulo: 'Faça uma lição perfeita',
    descricao: 'Alcance 100% de acertos em uma lição.',
    meta: 100,
    xp: 50,
    icone: 'checkmark-done-outline',
    cor: '#FF8A00',
    tipo: 'score',
  },
];

const formatXp = (value: number) =>
  `${Number(value || 0).toLocaleString('pt-BR')} XP`;

export default function ConquistasScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const xp = Math.max(0, Number(user?.xp ?? 0) || 0);
  const totalQuizzes = Number(user?.totalQuizzes ?? 0) || 0;
  const materiasExploradas = Array.isArray(user?.materiasExploradas) ? user.materiasExploradas : [];
  const ultimaPontuacao = Number(user?.ultimaPontuacao ?? 0) || 0;

  const getQuestProgress = (quest: (typeof conquistas)[number]) => {
    switch (quest.tipo) {
      case 'xp':
        return xp;
      case 'quizzes':
        return totalQuizzes;
      case 'materias':
        return materiasExploradas.length;
      case 'score':
        return ultimaPontuacao;
      default:
        return 0;
    }
  };

  const isUnlocked = (quest: (typeof conquistas)[number]) => {
    const atual = getQuestProgress(quest);
    if (quest.tipo === 'score') {
      return atual >= quest.meta;
    }
    if (quest.tipo === 'materias') {
      return atual >= quest.meta;
    }
    return atual >= quest.meta;
  };

  // Identifica automaticamente o mascote atual
  const currentIndex = petStages.findIndex(
    (stage) => xp >= stage.min && xp <= stage.max
  );

  const currentStage = petStages[currentIndex] || petStages[0];

  // Identifica o próximo mascote
  const nextStage = petStages[currentIndex + 1] || null;

  // Calcula o progresso para o próximo nível
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

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#10002D" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.menuButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Conquistas</Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          Cada conquista é um passo na sua jornada
        </Text>

        {/* CARD DOS MASCOTES */}
        <View style={styles.heroCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              {nextStage
                ? 'Seu nível atual'
                : 'Nível máximo alcançado'}
            </Text>
          </View>

          <Text style={styles.petName}>{currentStage.name}</Text>

          <View style={styles.petsContainer}>
            {/* MASCOTE ATUAL */}
            <View style={styles.petColumn}>
              <Image
                source={currentStage.image as ImageSourcePropType}
                style={styles.currentPet}
                resizeMode="contain"
              />

              <Text style={styles.currentPetXp}>
                {currentStage.min === 0
                  ? '0-499 XP'
                  : `${currentStage.min.toLocaleString('pt-BR')}-${currentStage.max.toLocaleString('pt-BR')} XP`}
              </Text>
            </View>

            {/* SETA */}
            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#C18AFF"
              />
            </View>

            {/* PRÓXIMO MASCOTE */}
            <View style={styles.petColumn}>
              {nextStage ? (
                <>
                  <View style={styles.nextPetWrapper}>
                    <Image
                      source={nextStage.image as ImageSourcePropType}
                      style={styles.nextPet}
                      resizeMode="contain"
                    />
                    <View style={styles.questionMark}>
                      <Text style={styles.questionText}>?</Text>
                    </View>
                  </View>

                  <Text style={styles.nextPetXp}>
                    {nextStage.min.toLocaleString('pt-BR')}-{nextStage.max === Infinity
                      ? '∞'
                      : nextStage.max.toLocaleString('pt-BR')} XP
                  </Text>
                </>
              ) : (
                <>
                  <Image
                    source={currentStage.image as ImageSourcePropType}
                    style={styles.nextPet}
                    resizeMode="contain"
                  />
                  <Text style={styles.nextPetXp}>Nível máximo</Text>
                </>
              )}
            </View>
          </View>

          <Text style={styles.totalXp}>
            {formatXp(xp)}
          </Text>
        </View>

        {/* PROGRESSO DO PET */}
        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {nextStage
                ? `Próximo nível: ${nextStage.name}`
                : 'Você chegou ao topo!'}
            </Text>

            <Text style={styles.progressPercent}>
              {Math.floor(progressPercent)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          <Text style={styles.progressDescription}>
            {nextStage
              ? `${formatXp(xp)} / ${formatXp(nextStage.min)}`
              : 'Todos os mascotes desbloqueados!'}
          </Text>
        </View>

        {/* LISTA DE CONQUISTAS */}
        <View style={styles.achievementsHeader}>
          <Text style={styles.sectionTitle}>Suas conquistas</Text>
          <Text style={styles.sectionSubtitle}>
            Continue evoluindo!
          </Text>
        </View>

        {conquistas.map((item) => {
          const current = Math.min(getQuestProgress(item), item.meta);
          const unlocked = isUnlocked(item);
          const itemProgress = Math.min(
            100,
            (current / item.meta) * 100
          );

          return (
            <View
              key={item.titulo}
              style={[
                styles.achievementCard,
                unlocked && styles.achievementUnlocked,
              ]}
            >
              {/* ÍCONE */}
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: item.cor },
                ]}
              >
                <Ionicons
                  name={item.icone as any}
                  size={23}
                  color={item.cor}
                />
              </View>

              {/* INFORMAÇÕES */}
              <View style={styles.achievementInfo}>
                <Text style={styles.cardTitle}>
                  {item.titulo}
                </Text>

                <Text style={styles.cardDescription}>
                  {item.descricao}
                </Text>

                <View style={styles.smallProgressTrack}>
                  <View
                    style={[
                      styles.smallProgressFill,
                      {
                        width: `${itemProgress}%`,
                        backgroundColor: item.cor,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.cardMeta}>
                  {unlocked
                    ? 'Conquista desbloqueada!'
                    : `${current} / ${item.meta}${item.tipo === 'xp' ? ' XP' : item.tipo === 'score' ? '%' : ''}`}
                </Text>
              </View>

              {/* STATUS */}
              <View style={styles.statusContainer}>
                {unlocked ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#A84DFF"
                  />
                ) : (
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="#776A9B"
                  />
                )}

                <Text
                  style={[
                    styles.rewardText,
                    { color: item.cor },
                  ]}
                >
                  +{item.xp} XP
                </Text>
              </View>
            </View>
          );
        })}

        {/* BOTÃO VOLTAR */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.primaryButtonText}>
            Voltar para home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09031D',
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  subtitle: {
    color: '#D7CBEA',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 12,
  },

  heroCard: {
    backgroundColor: '#160B40',
    borderColor: '#7835DC',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 25,
    paddingBottom: 15,
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },

  levelBadge: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#792DEB',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 5,
  },

  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  petName: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 1,
    marginBottom: 0,
  },

  petsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 0,
  },

  petColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currentPet: {
    width: 145,
    height: 140,
  },

  nextPetWrapper: {
    width: 145,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextPet: {
    width: 135,
    height: 135,
    opacity: 0.55,
  },

  questionMark: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  questionText: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    textShadowColor: '#6D35FF',
    textShadowRadius: 12,
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#A66AFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currentPetXp: {
    color: '#C58AFF',
    fontSize: 16,
    fontWeight: '800',
  },

  nextPetXp: {
    color: '#E7DFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  totalXp: {
    color: '#B982FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 7,
  },

  progressBox: {
    backgroundColor: '#130A30',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#392064',
    padding: 13,
    marginBottom: 18,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  progressPercent: {
    color: '#BD81FF',
    fontWeight: '800',
    fontSize: 13,
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#292044',
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#8B3DFF',
    borderRadius: 20,
  },

  progressDescription: {
    color: '#B8A8D7',
    fontSize: 11,
    marginTop: 8,
  },

  achievementsHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#A99BC7',
    fontSize: 12,
    marginTop: 3,
  },

  achievementCard: {
    backgroundColor: '#100A29',
    borderWidth: 1,
    borderColor: '#292044',
    borderRadius: 17,
    padding: 11,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  achievementUnlocked: {
    borderColor: '#7134C4',
    backgroundColor: '#190D36',
  },

  iconCircle: {
    width: 39,
    height: 39,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: '#1D1240',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  achievementInfo: {
    flex: 1,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  cardDescription: {
    color: '#B4A9CF',
    fontSize: 10,
    marginTop: 3,
  },

  smallProgressTrack: {
    height: 5,
    backgroundColor: '#292044',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 9,
  },

  smallProgressFill: {
    height: '100%',
    borderRadius: 10,
  },

  cardMeta: {
    color: '#B9ACD5',
    fontSize: 9,
    marginTop: 5,
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
    minWidth: 48,
  },

  rewardText: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: '#7835DC',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
