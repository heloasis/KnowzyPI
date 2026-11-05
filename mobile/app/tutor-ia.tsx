import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
export default function TutorIAScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>← Voltar</Text>
      </TouchableOpacity>
      <View style={styles.panel}>
        <Text style={styles.badge}>EM BREVE</Text>
        <Text style={styles.title}>✦ Tutor IA</Text>
        <Text style={styles.message}>
          Estamos preparando uma nova forma de apoiar seus estudos. Em breve,
          você poderá tirar dúvidas e receber explicações e exemplos
          personalizados.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#060312' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  link: { color: '#a99bff' },
  panel: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#303c70',
    backgroundColor: '#111936',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#251b55',
    color: '#d7ceff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 20 },
  message: { color: '#b8bfdc', lineHeight: 23, marginTop: 10 },
});
