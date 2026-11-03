import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const materiasBase = [
  { id: 'matematica', nome: 'MatemÃ¡tica', descricao: 'NÃºmeros, fÃ³rmulas e lÃ³gica.', icone: 'ðŸ“' },
  { id: 'portugues', nome: 'PortuguÃªs', descricao: 'Leitura, interpretaÃ§Ã£o e gramÃ¡tica.', icone: 'ðŸ“–' },
  { id: 'historia', nome: 'HistÃ³ria', descricao: 'Fatos, personagens e contextos.', icone: 'ðŸ›ï¸' },
  { id: 'geografia', nome: 'Geografia', descricao: 'Mapas, territÃ³rio e sociedade.', icone: 'ðŸŒ' },
  { id: 'biologia', nome: 'Biologia', descricao: 'CÃ©lulas, ecologia e vida.', icone: 'ðŸ§¬' },
];

export default function FavoritosScreen() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<typeof materiasBase>([]);

  useEffect(() => {
    const lista = JSON.parse(String(globalThis.localStorage?.getItem?.('favoritos') ?? '[]'));
    const salvos = Array.isArray(lista) && lista.length > 0 ? lista : materiasBase.slice(0, 3);
    setFavoritos(salvos);
  }, []);

  const removerFavorito = (id: string) => {
    const novaLista = favoritos.filter((item) => item.id !== id);
    setFavoritos(novaLista);
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.setItem('favoritos', JSON.stringify(novaLista));
    }
  };

  const abrirMateria = (materia: (typeof materiasBase)[number]) => {
    router.push({ pathname: '/quiz', params: { materia: materia.id, nome: materia.nome } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Favoritos</Text>
        </View>

        {favoritos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>â™¡</Text>
            <Text style={styles.emptyTitle}>Nenhuma matÃ©ria favoritada</Text>
            <Text style={styles.emptyText}>Salve as matÃ©rias que vocÃª quiser revisar depois.</Text>
          </View>
        ) : (
          favoritos.map((materia) => (
            <TouchableOpacity
              key={materia.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => abrirMateria(materia)}
            >
              <Text style={styles.icon}>{materia.icone}</Text>

              <View style={styles.textWrap}>
                <Text style={styles.cardTitle}>{materia.nome}</Text>
                <Text style={styles.cardText}>{materia.descricao}</Text>
              </View>

              <TouchableOpacity onPress={() => removerFavorito(materia.id)} style={styles.removeButton}>
                <Ionicons name="heart-dislike" size={18} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060312',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
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
    backgroundColor: '#10182c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  icon: {
    fontSize: 30,
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardText: {
    color: '#b7c2ea',
    fontSize: 12,
    lineHeight: 18,
  },
  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#8C61FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#10182c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 26,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 42,
    color: '#8C61FF',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#b7c2ea',
    fontSize: 13,
    textAlign: 'center',
  },
});

