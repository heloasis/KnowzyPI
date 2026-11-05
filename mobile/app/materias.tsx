import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { listarMaterias } from '../src/services/materiaService';
import { useAuth } from '../src/context/AuthContext';
import type { Materia } from '../src/types/quiz';

const materiaIcons: Record<string, string> = {
  matematica: '📐',
  portugues: '📖',
  história: '🏛️',
  historia: '🏛️',
  geografia: '🌍',
  biologia: '🧬',
};

const corrigirTexto = (texto: any): string => {
  if (typeof texto !== 'string') return '';

  let resultado = texto.normalize('NFC');

  const substituicoes: Record<string, string> = {
    'MatemÃ¡tica': 'Matemática',
    'matemÃ¡tica': 'matemática',
    'PortuguÃªs': 'Português',
    'português': 'português',
    'HistÃ³ria': 'História',
    'histÃ³ria': 'história',
    'Geografia': 'Geografia',
    'Biologia': 'Biologia',
    'Lngua': 'Língua',
    'comunicao': 'comunicação',
    'funo': 'função',
    'sÃ£o': 'são',
    'so': 'são',
    'substantivo': 'substantivo',
    'preposio': 'preposição',
    'conjuno': 'conjunção',
    'interjeio': 'interjeição',
    'Interpretao': 'Interpretação',
    'interpretao': 'interpretação',
    'informaes': 'informações',
    'explcitas': 'explícitas',
    'implcitas': 'implícitas',
    'pblico': 'público',
  };

  Object.entries(substituicoes).forEach(([incorreto, correto]) => {
    resultado = resultado.split(incorreto).join(correto);
  });

  return resultado.replace(/\uFFFD/g, '');
};

export default function MateriasScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const favoritesKey = `knowzy:favoritos:${user?.id || 'local'}`;

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [favoritos, setFavoritos] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [data, saved] = await Promise.all([
          listarMaterias(),
          AsyncStorage.getItem(favoritesKey),
        ]);

        if (!ativo) return;

        setMaterias(Array.isArray(data) ? data : []);

        if (saved) {
          const parsed = JSON.parse(saved);
          setFavoritos(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as matérias.');
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [favoritesKey]);

  const isFavorite = (id: string) =>
    favoritos.some((item) => String(item.id) === id);

  const toggleFavorite = async (item: Materia) => {
    const id = String(item.id || item.slug || item.nome);

    const next = isFavorite(id)
      ? favoritos.filter((fav) => String(fav.id) !== id)
      : [...favoritos, { ...item, id }];

    setFavoritos(next);

    try {
      await AsyncStorage.setItem(favoritesKey, JSON.stringify(next));
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar os favoritos.');
    }
  };

  const renderItem = ({ item }: { item: Materia }) => {
    const slug = String(item.slug || item.id || item.nome?.toLowerCase());

    const nomeCorrigido = corrigirTexto(item.nome);
    const descricaoCorrigida = corrigirTexto(item.descricao);

    const favorito = isFavorite(
      String(item.id || item.slug || item.nome)
    );

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/estudo/[materia]' as any,
              params: {
                materia: slug,
                nome: nomeCorrigido,
              },
            })
          }
        >
          <Text style={styles.icon}>
            {materiaIcons[slug.toLowerCase()] || '📘'}
          </Text>

          <View style={styles.textWrap}>
            <Text style={styles.title}>{nomeCorrigido}</Text>

            <Text style={styles.subtitle}>
              {descricaoCorrigida || 'Continue sua jornada'}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
          accessibilityLabel={
            favorito
              ? 'Remover dos favoritos'
              : 'Adicionar aos favoritos'
          }
        >
          <Ionicons
            name={favorito ? 'heart' : 'heart-outline'}
            size={22}
            color="#ff8fcb"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>

          <Text style={styles.header}>Matérias</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#8C61FF" />
          </View>
        ) : (
          <FlatList
            data={materias}
            keyExtractor={(item) => String(item.id || item.nome)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060312',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 52,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingTop: 8,
  },
  backButton: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginRight: 12,
  },
  header: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#0d0f1f',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#b7c2ea',
    fontSize: 12,
    marginTop: 4,
  },
  arrow: {
    color: '#8C61FF',
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 8,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});