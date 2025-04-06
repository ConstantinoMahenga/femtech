// DashboardScreen.styles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

// Definição do Tema (movido para cá, pois é usado principalmente nos estilos)
export const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    placeholder: '#999',
    background: '#f7f7f7',
    border: '#eee',
    cardBackground: '#fff',
    activeCategoryText: '#fff',
    inactiveCategoryBackground: '#f0f0f0',
  },
  fonts: {
    regular: 'WinkySans-Regular', // Nota: Certifique-se que estas fontes estão configuradas no projeto
    bold: 'WinkySans-Bold',       // Nota: Certifique-se que estas fontes estão configuradas no projeto
    systemRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    systemBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// Largura da tela (usada nos estilos do slider)
const { width: screenWidth } = Dimensions.get('window');

// Definição dos Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 15,
    backgroundColor: theme.colors.cardBackground,
  },
  headerLeftContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  flag: {
    width: 32,
    height: 22,
    marginBottom: 5,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontFamily: theme.fonts.systemRegular,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontFamily: theme.fonts.systemBold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.text,
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.fonts.systemRegular,
    color: theme.colors.text,
    paddingVertical: 0, // Importante para alinhar texto no Android
  },
  searchIconContainer: {
    paddingLeft: 10,
  },
  categoriesSection: {
    paddingVertical: 10,
    backgroundColor: theme.colors.cardBackground,
    marginBottom: 15,
  },
  categoriesScrollViewContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonInactive: {
    backgroundColor: theme.colors.inactiveCategoryBackground,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.systemRegular,
    fontWeight: '500',
  },
  categoryButtonTextInactive: {
    color: theme.colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: theme.colors.activeCategoryText,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
  },
  sliderContainer: {
    marginBottom: 20,
    // A altura pode ser definida aqui ou no componente dependendo da necessidade
    // height: screenWidth * 0.5 + 40, // Ex: altura da imagem + altura da paginação
  },
  sliderScrollView: {
    // Estilos específicos do scroll view do slider, se necessário
  },
  slide: {
    width: screenWidth, // Garante que cada slide ocupe a largura da tela
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderImage: {
    width: '100%', // Imagem ocupa a largura do slide
    height: screenWidth * 0.5, // Altura proporcional à largura da tela
    backgroundColor: theme.colors.border, // Placeholder visual enquanto carrega
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Posiciona sobre o slider
    bottom: 15, // Distância do fundo do sliderContainer
    left: 0,
    right: 0,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)', // Opcional: fundo semi-transparente
    // paddingVertical: 5, // Opcional: espaçamento vertical
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
  },
  paginationDotInactive: {
    backgroundColor: theme.colors.white, // Pontos inativos brancos para contraste
    opacity: 0.7,
  },
  // Estilo para o container de "Mais conteúdo" (opcional, mas bom ter separado)
  moreContentContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreContentText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.systemRegular,
  }
});

export default styles; // Exporta os estilos para serem usados no componente