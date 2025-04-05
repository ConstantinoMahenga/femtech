import React, { useState } from 'react';
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
  Alert, // Para mostrar mensagens simples
} from 'react-native';
// Importar o ícone específico de FontAwesome5
import IconFA5 from 'react-native-vector-icons/FontAwesome5';

// Definindo cores do tema (consistente com a tela de cadastro)
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa vibrante
    text: '#333',
    placeholder: '#888',
    background: '#fff',
    border: '#ccc',
    borderFocused: '#FF69B4', // Cor da borda focada (rosa)
    white: '#fff',
  },
};

// Componente reutilizado para o ícone principal (adaptado do AvatarIcon)
const HeaderIcon = ({ iconName, size = 60, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
  <View style={[styles.headerIconContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
    <IconFA5 name={iconName} size={size * 0.55} color={color} />
  </View>
);

function LoginScreen({ navigation }) { // Recebe navigation para poder navegar
  // --- ESTADOS ---
  const [email, setEmail] = useState(''); // Mudado de nome completo para email (mais comum para login)
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null); // Para controle de foco

  // --- HANDLERS ---
  const handleLogin = () => {
    // Validação básica
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    // --- Lógica de Login (Simulação) ---
    // Aqui você chamaria sua API de autenticação
    console.log('Tentativa de Login com:', { email, password });
    Alert.alert('Sucesso (Simulação)', 'Login realizado com sucesso!');

    // Exemplo: Navegar para a tela principal após o login
      if (navigation) {
         navigation.replace('Home'); // Usa replace para não poder voltar para Login
     }
     
    // --- Fim da Simulação ---
  };

  const handleForgotPassword = () => {
    console.log('Clicou em "Esqueci a senha"');
    // Aqui você navegaria para a tela de recuperação de senha
    // if (navigation) {
    //   navigation.navigate('ForgotPassword');
    // }
     Alert.alert('Info', 'Funcionalidade "Esqueci a senha" a ser implementada.');
  };

  // Função para ir para a tela de cadastro (Opcional, mas útil)
   const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register'); // Navega para a tela de Registro
    } else {
      console.warn("Navegação para Registro não disponível.");
    }
  };


  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {/* Ícone Médico (Mala com +) */}
            <HeaderIcon iconName="briefcase-medical" />

            <Text style={styles.title}>Login</Text>

            <View style={styles.form}>
              {/* Campo E-mail */}
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="E-mail" // Alterado de "Nome Completo"
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress" // Importante para autofill
                autoCapitalize="none"
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
              />

              {/* Campo Senha */}
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Senha"
                placeholderTextColor={theme.colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} // Esconde a senha
                textContentType="password" // Importante para autofill
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
              />

              {/* Link Esqueci a Senha */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Esqueci a senha?</Text>
              </TouchableOpacity>

              {/* Botão Entrar */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>

              {/* Link para Cadastro (Opcional) */}
               <TouchableOpacity style={styles.registerLinkContainer} onPress={goToRegister}>
                 <Text style={styles.registerLinkText}>Não tem uma conta? Cadastre-se</Text>
               </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
  },
  container: {
    alignItems: 'center', // Centraliza itens horizontalmente
    paddingHorizontal: 30, // Aumentei um pouco o padding lateral
    paddingVertical: 40,
  },
  headerIconContainer: {
    marginBottom: 25, // Espaço abaixo do ícone
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra sutil (opcional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    fontSize: 28, // Um pouco maior para destaque
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 30, // Mais espaço abaixo do título
  },
  form: {
    width: '100%', // Ocupa toda a largura do container
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
    borderColor: theme.colors.borderFocused, // Borda rosa ao focar
    borderWidth: 1.5,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end', // Alinha o link à direita
    marginBottom: 20, // Espaço antes do botão Entrar
  },
  forgotPasswordText: {
    color: theme.colors.primary, // Cor rosa
    fontSize: 14,
    textDecorationLine: 'underline', // Sublinhado para indicar link
  },
  button: {
    backgroundColor: theme.colors.primary, // Fundo rosa
    paddingVertical: 14, // Botão um pouco maior
    paddingHorizontal: 20,
    borderRadius: 25, // Bordas arredondadas
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Botão ocupa toda a largura
    marginBottom: 20, // Espaço abaixo do botão
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: theme.colors.white, // Texto branco
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLinkContainer: {
     marginTop: 15, // Espaço acima do link de cadastro
     alignItems: 'center',
  },
  registerLinkText: {
     color: theme.colors.primary, // Cor rosa
     fontSize: 14,
     textDecorationLine: 'underline',
  },
});

export default LoginScreen;