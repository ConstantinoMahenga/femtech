// DashboardScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Dimensions, // Mantido aqui para calcular o índice do slide, se necessário
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';

// Importa os estilos e o tema do arquivo separado
import styles, { theme } from '../../style/DashboardScreen.styles';

// Constantes específicas do componente (URLs, categorias)
const flagImageUrl = 'https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/SNc_bPaMeiw63zp8r/realistic-beautiful-mozambique-flag-4k_btb1ylatee_thumbnail-1080_01.png';

const femtechCategories = [
  'Ciclo Menstrual', 'Gravidez', 'Fertilidade', 'Menopausa',
  'Bem-Estar Íntimo', 'Doenças Comuns', 'Prevenção',
  'Saúde Mental', 'Nutrição', 'Exercícios',
];

const sliderImageUrls = [
  'https://th.bing.com/th/id/OIP.DQVPwPyKfwa7sbZHCGgsRQHaEK?rs=1&pid=ImgDetMain',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1607619056574-7b8f352a5d6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

// Pega a largura da tela para cálculos de scroll do slider
const { width: screenWidth } = Dimensions.get('window');

function DashboardScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(femtechCategories[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef(null);

  const { user, logout } = useAuth();
  const userName = user?.name || 'Usuário(a)'; // Nome padrão caso user seja null/undefined

  // Efeito para auto-scroll do slider
  useEffect(() => {
    if (sliderImageUrls.length <= 1) return; // Não faz auto-scroll se tiver 1 ou 0 imagens

    const intervalId = setInterval(() => {
      setActiveSlideIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % sliderImageUrls.length;
        if (sliderRef.current) {
          // Anima o scroll para o próximo slide
          sliderRef.current.scrollTo({ x: nextIndex * screenWidth, animated: true });
        }
        return nextIndex; // Atualiza o índice ativo
      });
    }, 5000); // Muda a cada 5 segundos

    // Limpa o intervalo quando o componente desmontar
    return () => clearInterval(intervalId);
  }, [sliderImageUrls.length]); // Dependência: reexecuta se o número de imagens mudar

  // Função para lidar com a pesquisa (ação de submit ou clique no ícone)
  const handleSearch = () => {
    if (searchText.trim()) { // Só pesquisa se houver texto (ignorando espaços em branco)
        console.log('Pesquisando por:', searchText);
        // Aqui você implementaria a lógica de navegação ou busca real
        // Ex: navigation.navigate('SearchResults', { query: searchText });
    } else {
        console.log('Campo de pesquisa vazio.');
    }
  };

  // Função para lidar com o clique numa categoria
  const handleCategoryPress = (category) => {
    console.log('Categoria selecionada:', category);
    setActiveCategory(category);
    // Aqui você poderia carregar conteúdo específico da categoria, etc.
  };

  // Função chamada ao final do scroll manual do slider
  const onScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // Calcula o novo índice baseado na posição do scroll e largura da tela
    const newIndex = Math.round(contentOffsetX / screenWidth);
    if (newIndex !== activeSlideIndex) {
      setActiveSlideIndex(newIndex); // Atualiza o índice ativo se mudou
    }
  };

  // Função para mostrar confirmação e fazer logout
  const handleLogout = () => {
    Alert.alert(
      "Sair", // Título do Alerta
      "Tem certeza que deseja sair da sua conta?", // Mensagem
      [
        {
          text: "Cancelar",
          style: "cancel" // Estilo padrão para cancelar (geralmente botão à esquerda/menos destacado)
        },
        {
          text: "Sair",
          onPress: async () => { // Ação ao pressionar "Sair"
            try {
              await logout(); // Chama a função de logout do contexto
              // Navegação para a tela de login/inicial ocorreria automaticamente pelo AuthProvider,
              // ou você pode forçar aqui se necessário: navigation.navigate('Login');
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          },
          style: "destructive" // Estilo que indica uma ação destrutiva (vermelho no iOS)
        }
      ],
      { cancelable: true } // Permite fechar o alerta tocando fora dele (no Android)
    );
  };

  return (
    // Usa SafeAreaView para evitar conteúdo sob notches e status bar
    <SafeAreaView style={styles.safeArea}>
      {/* Configura a aparência da Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false} // Oculta a barra de rolagem vertical
        contentContainerStyle={styles.scrollViewContent} // Estilo para o container interno do ScrollView
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerLeftContainer}>
             {/* Imagem da Bandeira */}
            <Image source={{ uri: flagImageUrl }} style={styles.flag} resizeMode="contain"/>
             {/* Saudação */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Olá, </Text>
              <Text style={[styles.greeting, styles.userName]}>{userName}!</Text>
            </View>
          </View>
          {/* Botão de Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="log-out" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar especialista"
            placeholderTextColor={theme.colors.placeholder} // Cor do placeholder
            value={searchText}
            onChangeText={setSearchText} // Atualiza o estado a cada caractere digitado
            onSubmitEditing={handleSearch} // Chama handleSearch ao pressionar "Enter" no teclado
            returnKeyType="search" // Define o botão de retorno do teclado como "Search"
          />
          {/* Ícone de Pesquisa (clicável) */}
          <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
            <Icon name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Seção de Categorias */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal={true} // Habilita scroll horizontal
            showsHorizontalScrollIndicator={false} // Oculta barra de scroll horizontal
            contentContainerStyle={styles.categoriesScrollViewContent} // Estilo para o container interno
          >
            {/* Mapeia o array de categorias para criar os botões */}
            {femtechCategories.map((category, index) => {
              const isActive = activeCategory === category; // Verifica se é a categoria ativa
              return (
                <TouchableOpacity
                  key={index} // Chave única para cada item da lista
                  style={[ // Aplica estilos condicionais
                    styles.categoryButton,
                    isActive ? styles.categoryButtonActive : styles.categoryButtonInactive
                  ]}
                  onPress={() => handleCategoryPress(category)} // Define a categoria ativa ao clicar
                  activeOpacity={0.8} // Feedback visual ao pressionar
                >
                  <Text style={[ // Aplica estilos de texto condicionais
                    styles.categoryButtonText,
                    isActive ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Slider de Imagens */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={sliderRef} // Referência para controlar o scroll programaticamente
            horizontal={true} // Scroll horizontal
            showsHorizontalScrollIndicator={false} // Oculta barra de scroll
            pagingEnabled={true} // Faz o scroll parar exatamente em cada slide
            style={styles.sliderScrollView}
            onMomentumScrollEnd={onScrollEnd} // Detecta quando o scroll manual termina
            scrollEventThrottle={16} // Frequência de eventos de scroll (importante para onScrollEnd)
          >
            {/* Mapeia as URLs das imagens para criar os slides */}
            {sliderImageUrls.map((imageUrl, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={{ uri: imageUrl }} // Fonte da imagem
                  style={styles.sliderImage} // Estilo da imagem
                  resizeMode="cover" // Modo de redimensionamento da imagem
                />
              </View>
            ))}
          </ScrollView>
          {/* Paginação do slider (pontos indicadores) */}
          <View style={styles.pagination}>
            {/* Mapeia as URLs para criar os pontos */}
            {sliderImageUrls.map((_, index) => (
              <View
                key={index} // Chave única
                style={[ // Estilos condicionais para o ponto ativo/inativo
                  styles.paginationDot,
                  index === activeSlideIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Placeholder para Outro Conteúdo do Dashboard */}
        <View style={styles.moreContentContainer}>
          <Text style={styles.moreContentText}>Mais conteúdo aqui...</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default DashboardScreen;