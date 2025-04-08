// screens/LoginScreen.js
import React, { useState, useRef } from 'react'; // Adicionado useRef
import {
  StyleSheet,
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

// Importar o hook useAuth do SEU contexto local
// <<< VERIFIQUE ESTE CAMINHO! Deve apontar para o seu context/AuthContext.js >>>
import { useAuth } from './context/AuthContext'; // Ajuste o caminho se necessário

// Importar funções de autenticação do Firebase e a instância 'auth' e 'db' do Firestore
// <<< VERIFIQUE ESTE CAMINHO! Deve apontar para o seu firebaseconfig.js >>>
// <<< CERTIFIQUE-SE QUE firebaseconfig.js EXPORTA 'auth' E 'db' >>>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseconfig'; // Ajuste o caminho se necessário
import { doc, getDoc } from 'firebase/firestore'; // Imports do Firestore

// --- TEMA ---
const theme = {
  colors: {
    primary: '#FF69B4',
    text: '#333',
    placeholder: '#888',
    background: '#fff',
    border: '#ccc',
    borderFocused: '#FF69B4',
    white: '#fff',
  },
};

// --- COMPONENTE HeaderIcon ---
const HeaderIcon = ({ iconName, size = 60, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
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

  // --- REF ---
  const passwordInputRef = useRef(null); // Usando useRef para a referência do input

  // --- CONTEXTO ---
  const { login } = useAuth(); // Usando 'login' diretamente do contexto

  // --- HANDLERS ---

  // Função para lidar com o processo de login (Firebase Auth + Firestore Role + Contexto Local)
  const handleLogin = async () => {
    // 1. Validação básica
    if (!email.trim() || !password) {
      Alert.alert('Campos Vazios', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    // 2. Inicia loading
    setIsLoading(true);

    try {
      // 3. Autentica com Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

     // console.log('Login com Firebase bem-sucedido:', firebaseUser.uid);

      // 4. *** NOVO: Buscar o role do usuário no Firestore ***
      let userRole = 'paciente'; // Default role
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid); // Referência ao documento do usuário
        const userDocSnap = await getDoc(userDocRef);         // Busca o documento

        if (userDocSnap.exists()) {
          // Se o documento existe, pega o role. Se o campo 'role' não existir no doc, usa 'paciente'
          userRole = userDocSnap.data()?.role || 'paciente';
       //   console.log('Role do usuário encontrado no Firestore:', userRole);
        } else {
          // Documento não encontrado no Firestore, usa o role padrão
         // console.warn(`Documento do usuário ${firebaseUser.uid} não encontrado no Firestore. Usando role padrão 'paciente'.`);
        }
      } catch (firestoreError) {
         // Erro ao buscar no Firestore, usa role padrão e loga o erro
         //console.error("Erro ao buscar role do usuário no Firestore:", firestoreError);
         Alert.alert('Erro Adicional', 'Não foi possível buscar as permissões do usuário. Usando permissões padrão.');
         // Continua com o role padrão 'paciente'
      }

      // 5. Prepara os dados do usuário para o Contexto (incluindo o role)
      const userDataForContext = {
        uid: firebaseUser.uid, // Usar 'uid' como no primeiro exemplo
        email: firebaseUser.email,
        // Lógica para nome (mantida do segundo exemplo, é mais robusta)
        name: firebaseUser.displayName || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Usuário(a)',
        role: userRole, // *** Adiciona o role aqui ***
        // photoURL: firebaseUser.photoURL // Exemplo se precisar da foto
      };

      // 6. Chama a função 'login' do AuthContext
      await login(userDataForContext);

      // A navegação deve ser tratada pelo StackNavigator principal
      // que observa o estado de autenticação do AuthContext.
      // Não é necessário chamar navigation.navigate aqui.

    } catch (error) {
      // 7. Tratamento de erros do Firebase Auth (mantido do segundo exemplo)
      //console.error("Erro no login com Firebase:", error.code, error.message);
      let friendlyMessage = 'Ocorreu um erro inesperado. Tente novamente.';
      switch (error.code) {
        case 'auth/invalid-email':
          friendlyMessage = 'O endereço de e-mail não é válido.';
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential': // Novo código de erro comum para email/senha inválidos
          friendlyMessage = 'E-mail ou senha incorretos.';
          break;
        case 'auth/wrong-password': // Pode ser substituído por invalid-credential em versões mais novas
          friendlyMessage = 'Senha incorreta. Por favor, verifique sua senha.';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'Este usuário foi desabilitado.';
          break;
        case 'auth/too-many-requests':
            friendlyMessage = 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.';
            break;
        default:
           // Se for um erro de rede ou outro não específico
           if (error.message.includes('network')) {
               friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
           }
           break; // Mantém a mensagem padrão para outros erros
      }
      Alert.alert('Falha no Login', friendlyMessage);

    } finally {
      // 8. Garante que o loading seja desativado
      setIsLoading(false);
    }
  };

  // Função para esqueci a senha (mantida)
  const handleForgotPassword = () => {
    console.log('Clicou em "Esqueci a senha"');
    Alert.alert('Indisponível', 'A recuperação de senha ainda não foi implementada.');
    // navigation.navigate('ForgotPassword'); // Se tiver a tela
  };

  // Função para ir ao cadastro (mantida)
   const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  // Funções de foco (mantidas)
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
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <HeaderIcon iconName="briefcase-medical" />
            <Text style={styles.title}>Login</Text>

            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                  isLoading && styles.inputDisabled // Desabilita visualmente
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
                onSubmitEditing={() => passwordInputRef.current?.focus()} // Usa a ref
                editable={!isLoading} // Impede edição durante o loading
              />

              <TextInput
                ref={passwordInputRef} // Atribui a ref
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                  isLoading && styles.inputDisabled // Desabilita visualmente
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
                returnKeyType="done"
                onSubmitEditing={handleLogin} // Tenta logar ao pressionar 'done'
                editable={!isLoading} // Impede edição durante o loading
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={isLoading} // Desabilita toque durante loading
              >
                <Text style={[styles.forgotPasswordText, isLoading && styles.linkDisabled]}>
                    Esqueci a senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading} // Desabilita toque durante loading
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
                 disabled={isLoading} // Desabilita toque durante loading
                >
                 <Text style={[styles.registerLinkText, isLoading && styles.linkDisabled]}>
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

// --- ESTILOS (mantidos do segundo exemplo, já incluem estados de loading/disabled) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  headerIconContainer: {
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 15,
    width: '100%',
  },
  inputFocused: {
    borderColor: theme.colors.borderFocused,
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#a0a0a0',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    minHeight: 50,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#FFB6C1',
    opacity: 0.7,
    elevation: 0,
    shadowOpacity: 0,
  },
  registerLinkContainer: {
     marginTop: 15,
     alignItems: 'center',
  },
  registerLinkText: {
     color: theme.colors.primary,
     fontSize: 14,
     textDecorationLine: 'underline',
  },
  linkDisabled: {
    color: '#a0a0a0',
    opacity: 0.7,
  },
});

// --- EXPORTAÇÃO ---
export default LoginScreen;

// A variável global para ref foi removida e substituída por useRef.