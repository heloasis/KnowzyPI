import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Button from '../src/components/Button';

export default function Index() {
  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.logo}>Knowzy</Text>
        <Text style={styles.subtitle}>Aprenda de forma leve e divertida.</Text>

        <View style={styles.actions}>
          <Link href="/login" asChild>
            <Button title="Login" onPress={() => undefined} style={styles.primaryButton} />
          </Link>

          <Link href="/cadastro" asChild>
            <Button
              title="Cadastro"
              onPress={() => undefined}
              variant="secondary"
              style={styles.secondaryButton}
            />
          </Link>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#060312',
  },
  logo: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#dfe8ff',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});