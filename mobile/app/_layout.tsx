import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#060312' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Knowzy' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="cadastro" options={{ title: 'Cadastro' }} />
          <Stack.Screen name="home" options={{ title: 'Home' }} />
          <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
          <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
          <Stack.Screen name="favoritos" options={{ title: 'Favoritos' }} />
          <Stack.Screen name="conquistas" options={{ title: 'Conquistas' }} />
          <Stack.Screen name="materias" options={{ title: 'Matérias' }} />
          <Stack.Screen name="quiz" options={{ title: 'Quiz' }} />
          <Stack.Screen name="tutor-ia" options={{ title: 'Tutor IA em breve' }} />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}