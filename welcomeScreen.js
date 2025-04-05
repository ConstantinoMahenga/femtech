import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';

const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    textLight: '#f0f0f0',
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
};

const backgroundImage = require('./assets/background.jpg');

function WelcomeScreen({ navigation }) {
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Bem-vindo(a) à TeleMedicina!</Text>
            <Text style={styles.descriptionText}>
              Acesse médicos especialistas e cuide do seu bem-estar de forma prática e segura.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={goToLogin}>
                <Text style={[styles.buttonText, styles.loginButtonText]}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={goToRegister}>
                <Text style={[styles.buttonText, styles.registerButtonText]}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  loginButton: {
    backgroundColor: theme.colors.white,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonText: {
    color: theme.colors.primary,
  },
  registerButtonText: {
    color: theme.colors.white,
  },
});

export default WelcomeScreen;
