import React, { useState, useEffect, useRef } from 'react'; // Importa hooks necessários
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// --- TEMA ---
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa vibrante
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    placeholder: '#999',
    background: '#f7f7f7',
    border: '#eee',
    cardBackground: '#fff',
    activeCategoryText: '#fff', // Cor do texto da categoria ativa
    inactiveCategoryBackground: '#f0f0f0', // Fundo da categoria inativa
  },
  fonts: {
    // Verifique se os nomes das fontes estão corretos e configurados
    regular: 'WinkySans-Regular',
    bold: 'WinkySans-Bold',
    systemRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    systemBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS ---
const flagImageUrl = 'https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/SNc_bPaMeiw63zp8r/realistic-beautiful-mozambique-flag-4k_btb1ylatee_thumbnail-1080_01.png';
const userName = "Usuária"; // Virá do login/estado global

// Categorias Femtech (Exemplo)
const femtechCategories = [
    'Ciclo Menstrual',
    'Gravidez',
    'Fertilidade',
    'Menopausa',
    'Bem-Estar Íntimo',
    'Doenças Comuns',
    'Prevenção', // Nome mais curto
    'Saúde Mental',
    'Nutrição', // Adicionando mais exemplos
    'Exercícios',
];

// URLs das Imagens do Slider (Use URLs reais)
const sliderImageUrls = [
  'https://images.unsplash.com/photo-1581091019961-99f3380f5f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1607619056574-7b8f352a5d6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

// Dimensões da Tela
const { width: screenWidth } = Dimensions.get('window');

// --- COMPONENTE ---
function DashboardScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  // Estado para categoria ativa (inicia com a primeira)
  const [activeCategory, setActiveCategory] = useState(femtechCategories[0]);
  // Estado e Ref para o slider automático
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef(null); // Ref para controlar o ScrollView do slider

  // --- Efeito para Slider Automático ---
  useEffect(() => {
    if (sliderImageUrls.length <= 1) return; // Não faz nada se tiver 1 ou 0 imagens

    const intervalId = setInterval(() => {
      setActiveSlideIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % sliderImageUrls.length; // Calcula próximo índice com loop
        // Comando para rolar o ScrollView programaticamente
        if (sliderRef.current) {
          sliderRef.current.scrollTo({
            x: nextIndex * screenWidth, // Posição X da próxima imagem (largura da tela)
            animated: true, // Animação suave
          });
        }
        return nextIndex; // Atualiza o estado do índice
      });
    }, 5000); // Intervalo de 5 segundos

    // Função de limpeza que será executada quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [sliderImageUrls.length]); // Executa o efeito novamente se o número de imagens mudar

  // --- Handlers ---
  const handleSearch = () => {
    console.log('Pesquisando por:', searchText);
    // Adicionar lógica de busca
  };

  const handleCategoryPress = (category) => {
      console.log('Categoria selecionada:', category);
      setActiveCategory(category); // Define a categoria clicada como ativa
      // Adicionar navegação ou filtro baseado na categoria
  };

  // Função para atualizar o índice ativo se o usuário rolar o slider manualmente
  const onScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    if (newIndex !== activeSlideIndex) {
        setActiveSlideIndex(newIndex);
    }
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
             <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Olá, </Text>
                <Text style={[styles.greeting, styles.userName]}>{userName}!</Text>
             </View>
             <Image source={{ uri: flagImageUrl }} style={styles.flag} resizeMode="contain"/>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Procurar especialista"
                placeholderTextColor={theme.colors.placeholder}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
                <Icon name="search" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>

        {/* Seção de Categorias Rolável Horizontalmente */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollViewContent}
          >
            {femtechCategories.map((category, index) => {
                const isActive = activeCategory === category; // Verifica se é a categoria ativa
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryButton,
                      isActive ? styles.categoryButtonActive : styles.categoryButtonInactive // Aplica estilo condicional
                    ]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      isActive ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive // Aplica estilo condicional
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
            })}
          </ScrollView>
        </View>

        {/* Slider de Imagens Automático */}
        <View style={styles.sliderContainer}>
           <ScrollView
             ref={sliderRef} // Atribui a ref ao ScrollView
             horizontal={true}
             showsHorizontalScrollIndicator={false}
             pagingEnabled={true} // Faz o scroll parar exatamente em cada "página" (imagem)
             style={styles.sliderScrollView}
             onMomentumScrollEnd={onScrollEnd} // Atualiza índice no scroll manual
             scrollEventThrottle={16} // Opcional: Melhora performance do onScroll (se usar onScroll)
           >
             {sliderImageUrls.map((imageUrl, index) => (
               <View key={index} style={styles.slide}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.sliderImage}
                    resizeMode="cover" // Cobre a área designada
                  />
               </View>
             ))}
           </ScrollView>
           {/* Opcional: Indicador de pontos do slide */}
           <View style={styles.pagination}>
              {sliderImageUrls.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === activeSlideIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                    ]}
                />
              ))}
           </View>
        </View>

        {/* Outro Conteúdo do Dashboard pode vir aqui */}
        <View style={{height: 200, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: theme.colors.textSecondary}}>Mais conteúdo aqui...</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
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
        paddingBottom: 15, // Aumentei o padding inferior
        backgroundColor: theme.colors.cardBackground,
        // Removi a borda inferior para um look mais limpo com as categorias abaixo
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Alinha verticalmente
    },
    greeting: {
        fontSize: 20, // Ligeiramente menor
        fontFamily: theme.fonts.systemRegular, // Fallback
        color: theme.colors.textSecondary,
    },
    userName: {
        fontSize: 20, // Ligeiramente menor
        fontFamily: theme.fonts.systemBold, // Fallback
        fontWeight: Platform.OS === 'android' ? 'bold' : '600',
        color: theme.colors.text,
    },
    flag: {
        width: 32, // Ligeiramente menor
        height: 22, // Ligeiramente menor
        marginLeft: 10, // Espaço entre nome e bandeira
        backgroundColor: theme.colors.border,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 12, // Menos arredondado
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
        fontFamily: theme.fonts.systemRegular, // Fallback
        color: theme.colors.text,
        paddingVertical: 0,
    },
    searchIconContainer: {
        paddingLeft: 10,
    },
    categoriesSection: {
        // Sem padding horizontal aqui, o scroll vai de ponta a ponta
        paddingVertical: 10, // Espaço vertical para a seção
        backgroundColor: theme.colors.cardBackground, // Fundo branco para destacar
        marginBottom: 15,
    },
    categoriesScrollViewContent: {
      paddingHorizontal: 15, // Espaço nas laterais da lista de categorias
      alignItems: 'center', // Alinha verticalmente os botões
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20, // Botões arredondados
      marginRight: 10, // Espaço entre os botões
      borderWidth: 1, // Adiciona borda para inativos
      borderColor: theme.colors.border, // Cor da borda inativa
    },
    categoryButtonInactive: {
        backgroundColor: theme.colors.inactiveCategoryBackground, // Cor de fundo inativa
        borderColor: theme.colors.border,
    },
    categoryButtonActive: {
      backgroundColor: theme.colors.primary, // Cor primária (rosa) para ativo
      borderColor: theme.colors.primary, // Cor da borda ativa
    },
    categoryButtonText: {
      fontSize: 14,
      fontFamily: theme.fonts.systemRegular, // Fallback
      fontWeight: '500',
    },
    categoryButtonTextInactive: {
        color: theme.colors.textSecondary, // Cor do texto inativo
    },
    categoryButtonTextActive: {
      color: theme.colors.activeCategoryText, // Cor do texto ativo (branco)
      fontWeight: Platform.OS === 'android' ? 'bold' : '600', // Texto ativo em negrito
    },
    sliderContainer: {
        marginBottom: 20, // Espaço abaixo do slider
        // Não precisa de padding horizontal, o slide ocupa a tela toda
    },
    sliderScrollView: {
        // O ScrollView em si não precisa de estilo extra aqui
    },
    slide: {
      width: screenWidth, // Cada slide ocupa a largura total da tela
      // A altura é definida pela imagem interna
      // Adicionar padding horizontal se quiser margens visíveis nos lados do slide
      // paddingHorizontal: 15,
    },
    sliderImage: {
      width: '100%', // Imagem ocupa a largura do slide
      height: screenWidth * 0.5, // Altura do slider (ex: 50% da largura da tela)
      backgroundColor: theme.colors.border, // Placeholder
      // Remover borderRadius se o slide ocupa a tela toda sem padding
      // borderRadius: 15,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', // Posiciona sobre o slider
        bottom: 15, // Distância da base do slider
        left: 0,
        right: 0,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: theme.colors.primary, // Ponto ativo rosa
    },
    paginationDotInactive: {
        backgroundColor: theme.colors.white, // Ponto inativo branco
        opacity: 0.7,
    }
});

export default DashboardScreen;