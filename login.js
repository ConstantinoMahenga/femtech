// LoginScreen.jsx
import React, { useState, useRef } from 'react'; // Adicionado useRef
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';

// Importa o hook useAuth do contexto local (VERIFIQUE O CAMINHO!)
import { useAuth } from './context/AuthContext';

// Importa funções e instância do Firebase Auth (VERIFIQUE O CAMINHO!)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseconfig';

// Importa os estilos e o tema do arquivo separado
import styles, { theme } from './style/LoginScreen.styles.js';

// --- COMPONENTE HeaderIcon (movido para cá) ---
// Recebe estilos como prop para desacoplar
const HeaderIcon = ({ iconName, size = 60, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
  // Usa o estilo importado
  <View style={[styles.headerIconContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
    <IconFA5 name={iconName} size={size * 0.55} color={color} />
  </View>
);

// --- COMPONENTE PRINCIPAL ---
function LoginScreen({ navigation }) {
  // --- ESTADOS ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- REFERÊNCIAS ---
  const passwordInputRef = useRef(null); // Referência para o input de senha

  // --- CONTEXTO ---
  const { login: loginContext } = useAuth();

  // --- HANDLERS ---
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos Vazios', 'Por favor, preencha o e-mail e a senha.');
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      console.log('Login com Firebase bem-sucedido:', firebaseUser.uid);

      const userDataForContext = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Usuário(a)',
        email: firebaseUser.email,
      };

      await loginContext(userDataForContext);
      // Navegação implícita pelo AuthProvider

    } catch (error) {
      console.error("Erro no login com Firebase:", error.code, error.message);
      let friendlyMessage = 'Usuario ou senha incorreta. Tente novamente.';
      switch (error.code) {
        case 'auth/invalid-email': friendlyMessage = 'O endereço de e-mail não é válido.'; break;
        case 'auth/user-disabled': friendlyMessage = 'Este usuário foi desabilitado.'; break;
        case 'auth/user-not-found': friendlyMessage = 'Nenhum usuário encontrado com este e-mail.'; break;
        case 'auth/wrong-password': friendlyMessage = 'Senha incorreta. Por favor, verifique sua senha.'; break;
        case 'auth/too-many-requests': friendlyMessage = 'Acesso bloqueado devido a muitas tentativas. Tente mais tarde.'; break;
      }
      Alert.alert('Falha no Login', friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Clicou em "Esqueci a senha"');
    Alert.alert('Indisponível', 'A recuperação de senha ainda não foi implementada.');
    // navigation.navigate('ForgotPassword'); // Se existir a tela
  };

  const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register'); // Nome da rota de cadastro
    }
  };

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);

  // --- RENDERIZAÇÃO ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled" // Fecha teclado ao tocar fora
        >
          <View style={styles.container}>
            {/* Ícone (agora definido neste arquivo) */}
            <HeaderIcon iconName="briefcase-medical" />

            <Text style={styles.title}>Login</Text>

            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                  isLoading && styles.inputDisabled // Aplica estilo desabilitado
                ]}
                placeholder="E-mail"
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()} // Foca no próximo input
                editable={!isLoading} // Desabilita quando carregando
              />

              <TextInput
                ref={passwordInputRef} // Aplica a referência
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                  isLoading && styles.inputDisabled // Aplica estilo desabilitado
                ]}
                placeholder="Senha"
                placeholderTextColor={theme.colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                textContentType="password"
                autoComplete="password"
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                returnKeyType="done" // Botão "Concluído" ou similar no teclado
                onSubmitEditing={handleLogin} // Tenta logar ao pressionar "done"
                editable={!isLoading} // Desabilita quando carregando
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={isLoading} // Desabilita quando carregando
              >
                <Text style={[
                    styles.forgotPasswordText,
                    isLoading && styles.linkDisabled // Aplica estilo desabilitado
                ]}>
                    Esqueci a senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]} // Estilo desabilitado
                onPress={handleLogin}
                disabled={isLoading} // Desabilita toque
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                 style={styles.registerLinkContainer}
                 onPress={goToRegister}
                 disabled={isLoading} // Desabilita quando carregando
                >
                 <Text style={[
                    styles.registerLinkText,
                    isLoading && styles.linkDisabled // Aplica estilo desabilitado
                ]}>
                    Não tem uma conta? Cadastre-se
                 </Text>
               </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- EXPORTAÇÃO ---
export default LoginScreen;