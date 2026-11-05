import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.screen}>
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

      <View style={styles.content}>
        <Image
          source={require('../assets/images/image.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Knowzy"
        />
        <Text style={styles.subtitle}>
          Seu próximo passo na jornada de aprendizado!
        </Text>

        <View style={styles.actions}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/cadastro" asChild>
            <TouchableOpacity style={styles.signupButton} activeOpacity={0.85}>
              <Text style={styles.signupButtonText}>Cadastro</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#04031f',
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  arcOne: {
    position: 'absolute',
    width: 1800,
    height: 1800,
    top: -1000,
    right: -900,
    borderRadius: 900,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.12)',
  },
  arcTwo: {
    position: 'absolute',
    width: 2600,
    height: 2600,
    top: -1450,
    right: -1300,
    borderRadius: 1300,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.08)',
  },
  arcThree: {
    position: 'absolute',
    width: 2400,
    height: 2400,
    left: -1700,
    bottom: -1400,
    borderRadius: 1200,
    borderWidth: 1,
    borderColor: 'rgba(124,98,255,0.08)',
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#6b6dff',
    shadowColor: '#6b6dff',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 3,
  },
  starOne: { width: 6, height: 6, left: '28%', top: '12%' },
  starTwo: { width: 3, height: 3, left: '61%', top: '19%' },
  starThree: { width: 5, height: 5, right: '16%', top: '25%' },
  starFour: { width: 4, height: 4, right: '24%', bottom: '20%' },
  starFive: { width: 3, height: 3, left: '38%', bottom: '16%' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: '85%',
    maxWidth: 350,
    height: 190,
    marginBottom: 12,
  },
  subtitle: {
    color: '#c2aae4',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 18,
  },
  actions: {
    width: 200,
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#b890ef',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  signupButton: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#b890ef',
    borderRadius: 20,
    backgroundColor: '#000128',
  },
  signupButtonText: {
    color: '#b890ef',
    fontSize: 16,
    fontWeight: '500',
  },
});
