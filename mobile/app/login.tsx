import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';

import { loginApi } from '../src/services/authService';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const validarEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Informe e-mail e senha para continuar.'
      );
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginApi({
        email: email.trim().toLowerCase(),
        senha,
      });

      if (result.erro) {
        Alert.alert('Erro ao entrar', result.erro);
        return;
      }

      const usuario = result.usuario;

      if (!usuario) {
        Alert.alert(
          'Erro',
          'Dados do usuário não retornados pela API.'
        );
        return;
      }

      await signIn(usuario);
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Erro ao entrar',
        'Não foi possível realizar o login. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#10083d', '#06052b', '#04031f']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.background}>
        <View style={styles.arcOne} />
        <View style={styles.arcTwo} />
        <View style={styles.arcThree} />

        <View style={[styles.star, styles.starOne]} />
        <View style={[styles.star, styles.starTwo]} />
        <View style={[styles.star, styles.starThree]} />
        <View style={[styles.star, styles.starFour]} />
        <View style={[styles.star, styles.starFive]} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Image
                source={require('../assets/images/image.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Entrar</Text>

              <Text style={styles.subtitle}>
                Continue sua evolução no aprendizado.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>E-mail</Text>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor="rgba(223,230,255,0.52)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Senha</Text>

                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Digite sua senha"
                  placeholderTextColor="rgba(223,230,255,0.52)"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
                style={styles.buttonWrapper}
              >
                <LinearGradient
                  colors={['#b890ef', '#8d7ae1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#050814" />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Ainda não tem conta?
              </Text>

              <Link href="/cadastro" asChild>
                <Text style={styles.linkText}>Cadastre-se</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04031f',
  },

  container: {
    flex: 1,
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  arcOne: {
    position: 'absolute',
    width: 1800,
    height: 1800,
    borderRadius: 900,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.12)',
    top: -1000,
    right: -900,
  },

  arcTwo: {
    position: 'absolute',
    width: 2600,
    height: 2600,
    borderRadius: 1300,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.08)',
    top: -1450,
    right: -1300,
  },

  arcThree: {
    position: 'absolute',
    width: 2400,
    height: 2400,
    borderRadius: 1200,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.07)',
    bottom: -1400,
    left: -1700,
  },

  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#6b6dff',
    shadowColor: '#6b6dff',
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },

  starOne: {
    width: 6,
    height: 6,
    left: 120,
    top: 90,
  },

  starTwo: {
    width: 3,
    height: 3,
    left: 260,
    top: 140,
  },

  starThree: {
    width: 5,
    height: 5,
    right: 70,
    top: 180,
  },

  starFour: {
    width: 4,
    height: 4,
    right: 90,
    bottom: 200,
  },

  starFive: {
    width: 3,
    height: 3,
    left: 100,
    bottom: 160,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 24,
  },

  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: 'rgba(9,12,36,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(184,144,239,0.22)',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: '#04031f',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    elevation: 12,
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logo: {
    width: 150,
    height: 75,
    marginBottom: 10,
  },

  title: {
    color: '#f3ecff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    color: '#c2aae4',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },

  form: {
    gap: 14,
  },

  formGroup: {
    gap: 8,
  },

  label: {
    color: '#dfe6ff',
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(184,144,239,0.28)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f4f2ff',
    fontSize: 16,
  },

  buttonWrapper: {
    width: '100%',
    marginTop: 4,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8f70e6',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },

  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  buttonText: {
    color: '#050814',
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 5,
  },

  footerText: {
    color: '#d7c8ff',
    fontSize: 14,
  },

  linkText: {
    color: '#b890ef',
    fontSize: 14,
    fontWeight: '800',
  },
});