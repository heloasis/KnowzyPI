
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
import { Link, useRouter } from 'expo-router';
import { listarMaterias } from '../src/services/materiaService';
import type { Materia } from '../src/types/quiz';

const materiaIcons: Record<string, string> = {
  matematica: '📐',
  portugues: '📖',
  historia: '🏛️',
  geografia: '🌍',
  biologia: 'v',
};

export default function MateriasScreen() {
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await listarMaterias();
        setMaterias(data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as matérias.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const renderItem = ({ item }: { item: Materia }) => {
    const slug = item.slug || item.id || item.nome?.toLowerCase();

    return (
      <Link href={{ pathname: '/quiz', params: { materia: slug, nome: item.nome } }} asChild>
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <Text style={styles.icon}>
            {materiaIcons[String(slug).toLowerCase()] || '📘'}
          </Text>

          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.nome}</Text>
            <Text style={styles.subtitle}>
              {item.descricao || 'Continue sua jornada'}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </Link>
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
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
