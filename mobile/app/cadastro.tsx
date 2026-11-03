import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import { cadastroApi } from '../src/services/authService';

const validarEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validarSenha = (value: string) => {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z\d]/.test(value);
};

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha para continuar.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }

    if (!validarSenha(senha)) {
      Alert.alert(
        'Senha inválida',
        'A senha deve ter pelo menos 8 caracteres, com letras, números e símbolo.'
      );
      return;
    }

    setLoading(true);

    const result = await cadastroApi({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
    });

    if (result.erro) {
      Alert.alert('Erro no cadastro', result.erro);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert('Sucesso', result.mensagem || 'Cadastro concluído com sucesso!');
    router.replace('/login');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>Knowzy</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Acompanhe sua jornada de aprendizado em um só lugar.</Text>

            <Input
              label="Nome completo"
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
            />

            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="Crie uma senha segura"
              secureTextEntry
            />

            <Button title="Cadastrar" onPress={handleCadastro} loading={loading} />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui uma conta?</Text>
            <Link href="/login" asChild>
              <Text style={styles.linkText}>Entrar</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#060312',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#0d0f1f',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#b7c2ea',
    fontSize: 14,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#dfe8ff',
    fontSize: 14,
    marginRight: 6,
  },
  linkText: {
    color: '#9c7bff',
    fontWeight: '700',
    fontSize: 14,
  },
});
