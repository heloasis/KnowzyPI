import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function PerfilScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const nome = user?.nome || 'Usuário';
  const email = user?.email || 'usuario@email.com';
  const xp = Number(user?.xp ?? 0);
  const xpText = `${xp.toLocaleString('pt-BR')} XP`;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Perfil</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={36} color="#5269A5" />
          </View>

          <Text style={styles.name}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.xpBox}>
            <Text style={styles.xpLabel}>Total de XP</Text>
            <Text style={styles.xpValue}>{xpText}</Text>
          </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#10182c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  email: {
    color: '#b7c2ea',
    fontSize: 14,
    marginBottom: 22,
  },
  xpBox: {
    width: '100%',
    backgroundColor: 'rgba(140,97,255,0.12)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  xpLabel: {
    color: '#dfe8ff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  xpValue: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
});
