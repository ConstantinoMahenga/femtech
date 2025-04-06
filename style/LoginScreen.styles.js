// LoginScreen.styles.js
import { StyleSheet } from 'react-native';

// Definição do Tema (usado nos estilos)
export const theme = {
  colors: {
    primary: '#FF69B4', // Rosa vibrante
    text: '#333',
    placeholder: '#888',
    background: '#fff',
    border: '#ccc',
    borderFocused: '#FF69B4', // Cor da borda focada (rosa)
    white: '#fff',
    disabledBackground: '#f0f0f0', // Cor de fundo para inputs desabilitados
    disabledText: '#a0a0a0',      // Cor de texto para inputs/links desabilitados
    disabledButtonBackground: '#FFB6C1', // Cor de fundo para botão desabilitado
  },
};

// Definição dos Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, // Garante que o conteúdo possa crescer e centralizar
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40, // Espaçamento vertical
  },
  // Estilos para o HeaderIcon (usados pelo componente HeaderIcon no .jsx)
  headerIconContainer: {
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6, // Sombra para Android
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 30,
  },
  form: {
    width: '100%', // Garante que o formulário ocupe a largura do container
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
    borderWidth: 1.5, // Um pouco mais grosso para destacar
  },
  inputDisabled: {
    backgroundColor: theme.colors.disabledBackground,
    color: theme.colors.disabledText,
    borderColor: theme.colors.border, // Mantém a borda padrão ou pode clarear
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end', // Alinha à direita
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
    borderRadius: 25, // Botão mais arredondado
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Sombra para Android
    minHeight: 50, // Altura mínima para consistência com/sem ActivityIndicator
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabledButtonBackground,
    opacity: 0.7, // Levemente transparente
    elevation: 0, // Remove sombra
    shadowOpacity: 0,
  },
  registerLinkContainer: {
     marginTop: 15, // Espaço acima do link de cadastro
     alignItems: 'center', // Centraliza o texto do link
  },
  registerLinkText: {
     color: theme.colors.primary,
     fontSize: 14,
     textDecorationLine: 'underline',
  },
  linkDisabled: {
    color: theme.colors.disabledText,
    opacity: 0.7,
    textDecorationLine: 'none', // Remove sublinhado quando desabilitado
  },
});

export default styles;