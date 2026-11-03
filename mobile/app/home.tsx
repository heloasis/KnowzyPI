
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

const stars = [
  { x: 8, y: 12, size: 3 },
  { x: 25, y: 24, size: 2 },
  { x: 85, y: 18, size: 3 },
  { x: 92, y: 32, size: 2 },
  { x: 15, y: 42, size: 2 },
  { x: 73, y: 46, size: 3 },
  { x: 95, y: 60, size: 2 },
  { x: 6, y: 72, size: 3 },
  { x: 28, y: 85, size: 2 },
  { x: 82, y: 79, size: 3 },
  { x: 52, y: 92, size: 2 },
  { x: 44, y: 38, size: 2 },
  { x: 64, y: 13, size: 2 },
  { x: 12, y: 93, size: 2 },
  { x: 90, y: 94, size: 3 },
];

const featureCards = [
  {
    title: 'Favoritos',
    icon: 'heart-outline' as const,
    route: '/favoritos',
  },
  {
    title: 'Quiz',
    icon: 'locate-outline' as const,
    route: '/quiz',
  },
  {
    title: 'Conquistas',
    icon: 'star-outline' as const,
    route: '/conquistas',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const firstName = user?.nome?.split(' ')[0] ?? 'Usuário';

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>

        {/* FUNDO ESPACIAL */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">

          <View style={styles.purpleGlow} />
          <View style={styles.blueGlow} />

          {stars.map((star, index) => (
            <View
              key={index}
              style={[
                styles.star,
                {
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size,
                },
              ]}
            />
          ))}

          <View style={styles.orbitOne} />
          <View style={styles.orbitTwo} />

          <Text style={styles.decorativeStar}>✦</Text>
          <Text style={styles.decorativeStarTwo}>✧</Text>
          <Text style={styles.decorativeStarThree}>✦</Text>
        </View>

        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileArea}
            activeOpacity={0.8}
            onPress={() => router.push('/perfil')}
          >
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={23} color="#5269A5" />
            </View>

            <Text style={styles.greeting}>
              Olá, {firstName}!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            activeOpacity={0.7}
            onPress={() => router.push('/configuracoes')}
          >
            <Ionicons
              name="settings-outline"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* CARTÕES */}
        <View style={styles.mainContent}>
          <View style={styles.grid}>

            {featureCards.map((card) => (
              <TouchableOpacity
                key={card.title}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(card.route as any)}
              >
                <Ionicons
                  name={card.icon}
                  size={30}
                  color="#FFFFFF"
                  strokeWidth={1.6}
                />

                <Text style={styles.cardTitle}>
                  {card.title}
                </Text>
              </TouchableOpacity>
            ))}

          </View>
        </View>

      </View>
    </View>
  );
}

const CARD_WIDTH = Math.min((width - 64) / 2, 160);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030522',
  },

  container: {
    flex: 1,
    backgroundColor: '#030522',
    overflow: 'hidden',
  },


  purpleGlow: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width,
    backgroundColor: '#10052F',
    opacity: 0.65,
    top: height * 0.25,
    left: width * 0.35,
  },

  blueGlow: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width,
    backgroundColor: '#21105B',
    opacity: 0.22,
    top: height * 0.65,
    left: -width * 0.35,
  },

  star: {
    position: 'absolute',
    backgroundColor: '#8589C9',
    opacity: 0.85,
  },

  orbitOne: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 0.65,
    borderRadius: width,
    borderWidth: 1,
    borderColor: 'rgba(119,117,210,0.13)',
    top: height * 0.38,
    left: -width * 0.2,
    transform: [{ rotate: '-25deg' }],
  },

  orbitTwo: {
    position: 'absolute',
    width: width * 1.3,
    height: width * 0.5,
    borderRadius: width,
    borderWidth: 1,
    borderColor: 'rgba(133,137,201,0.10)',
    top: height * 0.67,
    left: -width * 0.15,
    transform: [{ rotate: '25deg' }],
  },

  decorativeStar: {
    position: 'absolute',
    color: '#7775D2',
    fontSize: 23,
    top: height * 0.25,
    left: width * 0.84,
  },

  decorativeStarTwo: {
    position: 'absolute',
    color: '#8589C9',
    fontSize: 28,
    top: height * 0.62,
    left: width * 0.08,
  },

  decorativeStarThree: {
    position: 'absolute',
    color: '#7775D2',
    fontSize: 17,
    top: height * 0.88,
    left: width * 0.78,
  },

  header: {
    height: 98,
    backgroundColor: '#5269A5',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 2,
  },

  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  profileIcon: {
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },

  settingsButton: {
    padding: 8,
  },

  mainContent: {
    flex: 1,
    paddingTop: 45,
    paddingHorizontal: 17,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 25,
  },

  card: {
    width: CARD_WIDTH,
    height: 138,
    backgroundColor: '#203F8C',
    borderRadius: 27,
    padding: 20,
    justifyContent: 'space-between',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '400',
  },
});