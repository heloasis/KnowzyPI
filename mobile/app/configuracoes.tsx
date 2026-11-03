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

const opcoes = [
  { titulo: 'Notificações', descricao: 'Receber lembretes e alertas', icone: 'notifications-outline' },
  { titulo: 'Privacidade', descricao: 'Gerenciar dados e segurança', icone: 'shield-checkmark-outline' },
  { titulo: 'Tema', descricao: 'Visual escuro ou claro', icone: 'moon-outline' },
];

export default function ConfiguracoesScreen() {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
        </View>

        {opcoes.map((item) => (
          <View key={item.titulo} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icone as any} size={20} color="#8C61FF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardText}>{item.descricao}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9AA7D1" />
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10182c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(140,97,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    color: '#b7c2ea',
    fontSize: 12,
    marginTop: 4,
  },
});
