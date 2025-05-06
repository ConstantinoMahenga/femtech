import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,   
  Image,
  StatusBar,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext'; 
import { collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import externalStyles, { theme } from '../../style/DashboardScreen.styles';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

const flagImageUrl = 'https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/SNc_bPaMeiw63zp8r/realistic-beautiful-mozambique-flag-4k_btb1ylatee_thumbnail-1080_01.png';
const chatbotIconUrl = 'https://th.bing.com/th/id/OIP.b9KFTM4OzhyDiHXGm0wvLgHaH_?w=183&h=198&c=7&r=0&o=5&dpr=1.3&pid=1.7';

const femtechCategories = [
  'Ciclo Menstrual', 'Gravidez', 'Fertilidade', 'Menopausa',
  'Bem-Estar Íntimo', 'Doenças Comuns', 'Prevenção', 'Saúde Mental','Nutrição', 'Exercícios','Infeções de Transmissão Sexual (ITS)','Cancro da Mama','HIV SIDA'                            
];
const sliderImageUrls = [ /* ...URLs de imagens... */ 'https://th.bing.com/th/id/OIP.DQVPwPyKfwa7sbZHCGgsRQHaEK?rs=1&pid=ImgDetMain', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', 'https://www.jsi.com/wp-content/uploads/2022/06/A-breastfeeding-mother-receives-her-COVID-19-vaccine-certificate-after-being-vaccinated-at-a-USAID-DISCOVER-Health-mobile-site-in-Ndola.-1024x683.jpg' ];

const { width: screenWidth } = Dimensions.get('window');

// --- Função auxiliar para formatar a distância ---
const formatDistance = (distanceInMeters) => { if (distanceInMeters === null || distanceInMeters === undefined) return null; if (distanceInMeters < 1000) return `Há ${Math.round(distanceInMeters)} m`; return `Há ${(distanceInMeters / 1000).toFixed(1)} km`; };


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// --- Componente do Item da Lista de Médicos (com Hospital) ---
const DoctorListItem = React.memo(({ item, navigation }) => {
    const primarySpecialty = item.medicalAreas?.[0] || 'Especialidade não informada';
    const displayDistance = formatDistance(item.distance);
    const hospitalName = item.hospital || 'Hospital não informado'; 

    const handlePress = () => {
        if (!item?.id || !item?.name) { Alert.alert("Erro", "Dados incompletos."); return; }
        navigation.navigate('ChatScreen', {
            doctorId: item.id,
            doctorName: item.name,
            doctorHospital: hospitalName, 
            doctorImage: item.profileImageUrl || null
        });
    };

    return (
        <TouchableOpacity style={localStyles.doctorCard} onPress={handlePress} activeOpacity={0.7}>
            <View style={localStyles.doctorImageContainer}>
              {item.profileImageUrl ? <Image source={{ uri: item.profileImageUrl }} style={localStyles.doctorImage} /> : <Icon name="user" size={24} color={theme.colors.primary} />}
            </View>
            <View style={localStyles.doctorInfo}>
              <Text style={localStyles.doctorName} numberOfLines={1}>{item.name || 'Nome não disponível'}</Text>
              {/* <<< Exibe o Hospital >>> */}
              <Text style={localStyles.hospitalName} numberOfLines={1}>{hospitalName}</Text>
              <Text style={localStyles.doctorSpecialty} numberOfLines={1}>{primarySpecialty} {item.medicalAreas && item.medicalAreas.length > 1 ? `+${item.medicalAreas.length - 1}` : ''}</Text>
              {displayDistance && (
                 <View style={localStyles.distanceContainer}>
                    <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.colors.primary} />
                    <Text style={localStyles.distanceText}>{displayDistance}</Text>
                 </View>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
    );
});

// --- COMPONENTE PRINCIPAL DA TELA ---
function DashboardScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(femtechCategories[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [doctors, setDoctors] = useState([]); // Lista de médicos *renderizada*
  const [allDoctors, setAllDoctors] = useState([]); // Guarda *todos* os médicos para filtro/distância
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // Para pull-to-refresh

  const sliderRef = useRef(null);
  const { user, logout } = useAuth();
  const userName = user?.name || 'Usuário(a)';
  const animatedValueX = useRef(new Animated.Value(0)).current;

  // --- Animação Flutuante (sem alterações) ---
  useEffect(() => {
    const startFloatingAnimation = () => { /* ... (código da animação igual) ... */ animatedValueX.setValue(0); Animated.loop( Animated.sequence([ Animated.timing(animatedValueX, { toValue: -20, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true, }), Animated.timing(animatedValueX, { toValue: -15, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true, }), Animated.timing(animatedValueX, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true, }), ]) ).start(); };
    startFloatingAnimation();
  }, [animatedValueX]);

  // --- Função para Buscar Localização ---
  const fetchLocation = useCallback(async () => {
    console.log("Buscando localização..."); setError(null); // Limpa erro anterior
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionStatus(status);
        if (status !== 'granted') { throw new Error('Permissão de localização negada.'); }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setUserLocation(coords); console.log("Localização obtida:", coords);
        return coords; // Retorna as coordenadas
    } catch (locErr) {
        console.error('Erro ao obter localização:', locErr);
        setError(locErr.message || 'Não foi possível obter a localização.');
        setUserLocation(null); // Garante que a localização seja nula em caso de erro
        return null; // Retorna nulo em caso de erro
    }
  }, []);

  // --- Função para Buscar Médicos (filtrando por categoria) ---
  const fetchDoctorsByCategory = useCallback(async (category, currentLocation) => {
    console.log(`Buscando médicos para: ${category}`);
    setLoading(true); // Inicia loading principal
    setError(null); // Limpa erro anterior
    setDoctors([]); // Limpa lista renderizada
    let currentError = null; // Variável para erro de localização

    // Tenta obter localização se ainda não tiver
    if (!currentLocation && !userLocation) {
       currentLocation = await fetchLocation();
       if(!currentLocation) {
           // Guarda o erro de localização, mas continua para buscar médicos
           currentError = error || 'Localização não disponível para cálculo de distância.';
       }
    } else {
        currentLocation = currentLocation || userLocation;
    }


    try {
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'medico'),
            where('medicalAreas', 'array-contains', category)
        );
        const querySnapshot = await getDocs(q);
        const doctorsList = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const coordinates = data.address?.coordinates;
            let distance = null;

            if (currentLocation && coordinates instanceof GeoPoint) {
                try { distance = geolib.getDistance(currentLocation, { latitude: coordinates.latitude, longitude: coordinates.longitude }); }
                catch (distErr) { distance = null; }
            } else if (!coordinates) { console.warn(`Médico ${doc.id} sem GeoPoint.`); }

            doctorsList.push({
                id: doc.id,
                ...data,
                hospital: data.hospital || null, // <<< Inclui hospital
                distance
            });
        });

        // Ordena por distância (null no final)
        doctorsList.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

        setAllDoctors(doctorsList); // Guarda todos para filtro futuro
        setDoctors(doctorsList);    // Define a lista inicial renderizada
        setError(currentError); // Define erro de localização, se houver
        console.log(`Médicos encontrados para ${category}: ${doctorsList.length}`);

    } catch (fetchErr) {
        console.error('Erro ao buscar médicos:', fetchErr);
        setError('Erro ao carregar médicos.');
        setAllDoctors([]);
        setDoctors([]);
    } finally {
        setLoading(false); // Finaliza loading principal
        setIsRefreshing(false); // Finaliza refresh se aplicável
    }
  }, [userLocation, fetchLocation, error]); // Depende da localização e da função fetchLocation


  // --- Efeito Inicial e ao Mudar Categoria ---
  useEffect(() => {
    fetchDoctorsByCategory(activeCategory, userLocation);
  }, [activeCategory, fetchDoctorsByCategory]); // Executa ao montar e quando a categoria ativa muda


  // Efeito para auto-scroll do slider (sem alterações)
  useEffect(() => { /* ... (código do slider igual) ... */ if (sliderImageUrls.length <= 1) return; const intervalId = setInterval(() => { setActiveSlideIndex(prevIndex => { const nextIndex = (prevIndex + 1) % sliderImageUrls.length; sliderRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true }); return nextIndex; }); }, 5000); return () => clearInterval(intervalId); }, [sliderImageUrls.length]);

  // --- Filtro de Busca (Agora usa allDoctors) ---
  const filteredDoctors = useMemo(() => {
    if (!searchText.trim()) return allDoctors; // <<< Filtra a partir de TODOS os médicos
    const lowerCaseSearch = searchText.toLowerCase();
    return allDoctors.filter(doctor => {
        const nameMatch = doctor.name?.toLowerCase().includes(lowerCaseSearch);
        const hospitalMatch = doctor.hospital?.toLowerCase().includes(lowerCaseSearch); // <<< Filtra por hospital
        const specialtyMatch = doctor.medicalAreas?.some(area => area.toLowerCase().includes(lowerCaseSearch));
        return nameMatch || hospitalMatch || specialtyMatch;
      });
  }, [searchText, allDoctors]); // <<< Depende de allDoctors

  // --- Handlers (maioria igual, exceto handleCategoryPress) ---
  const handleSearch = () => { /* ... (pode aplicar o filtro aqui se quiser em vez de useMemo) ... */ };
  const handleCategoryPress = (category) => {
      setActiveCategory(category);
      // A busca será refeita pelo useEffect que depende de activeCategory
  };
  const onScrollEnd = (event) => { /* ... */ const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth); if (newIndex !== activeSlideIndex) setActiveSlideIndex(newIndex); };
  const handleLogout = () => { /* ... */ Alert.alert( "Sair", "Tem certeza?", [{ text: "Cancelar", style: "cancel" }, { text: "Sair", onPress: async () => { try { await logout(); } catch (e) { console.error(e); Alert.alert("Erro", "Falha ao sair."); }}, style: "destructive" }], { cancelable: true }); };
  const handleChatbotPress = () => { navigation.navigate('ChatbotScreen'); };

  // --- Handler para Pull-to-Refresh ---
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Busca localização novamente E busca médicos da categoria ativa
    const currentLocation = await fetchLocation(); // Busca localização primeiro
    await fetchDoctorsByCategory(activeCategory, currentLocation);
    // setLoading(false) e setIsRefreshing(false) são feitos dentro de fetchDoctorsByCategory
  }, [activeCategory, fetchLocation, fetchDoctorsByCategory]);

  // Renderiza item da lista de médicos (passando navigation)
  const renderDoctorItem = useCallback(({ item }) => (
    <DoctorListItem item={item} navigation={navigation} />
  ), [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* <<< MUDANÇA: FlatList agora é o container principal para permitir Pull-to-Refresh >>> */}
      <FlatList
        data={filteredDoctors} // <<< USA A LISTA FILTRADA AQUI
        renderItem={renderDoctorItem}
        keyExtractor={item => item.id}
        // --- CABEÇALHO DA LISTA (Contém todo o conteúdo que não é a lista de médicos) ---
        ListHeaderComponent={
          <>
            {/* Cabeçalho Pessoal */}
            <View style={styles.header}>
              <View style={styles.headerLeftContainer}><Image source={{ uri: flagImageUrl }} style={styles.flag} resizeMode="contain"/><View style={styles.greetingContainer}><Text style={styles.greeting}>Olá, </Text><Text style={[styles.greeting, styles.userName]}>{userName}!</Text></View></View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}><Icon name="log-out" size={22} color={theme.colors.primary} /></TouchableOpacity>
            </View>

            {/* Barra de pesquisa */}
            <View style={styles.searchContainer}>
              <TextInput style={styles.searchInput} placeholder="Procurar por nome, hospital, área..." placeholderTextColor={theme.colors.placeholder} value={searchText} onChangeText={setSearchText} returnKeyType="search" clearButtonMode="while-editing"/>
              <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}><Icon name="search" size={20} color={theme.colors.primary} /></TouchableOpacity>
            </View>

             {/* Banner de Erro/Info de Localização (MOVido para header da lista) */}
             {!loading && error && (
                <View style={localStyles.infoBanner}>
                    <Icon name="info" size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }}/>
                    {typeof error === 'string' && (<Text style={localStyles.infoBannerText}>{error}</Text>)}
                    {locationPermissionStatus === 'denied' && ( <TouchableOpacity style={localStyles.settingsLink} onPress={() => Linking.openSettings()}><Text style={localStyles.settingsLinkText}>Abrir Config.</Text></TouchableOpacity> )}
                </View>
             )}


            {/* Categorias */}
            <View style={{ marginVertical: 20 }}>
              <View style={styles.sectionContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollViewContent}>
                  {femtechCategories.map((category, index) => (
                    <TouchableOpacity key={index} style={[styles.categoryButton, activeCategory === category ? styles.categoryButtonActive : styles.categoryButtonInactive]} onPress={() => handleCategoryPress(category)} activeOpacity={0.8}>
                      <Text style={[styles.categoryButtonText, activeCategory === category ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive]}>{category}</Text>
                    </TouchableOpacity>))}
                </ScrollView>
              </View>
            </View>

            {/* Slider */}
            <View style={{ marginVertical: 1 }}>
              <View style={styles.sectionContainer}>
                <ScrollView ref={sliderRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd} scrollEventThrottle={16} style={styles.sliderScrollView}>
                  {sliderImageUrls.map((imageUrl, index) => (<View key={index} style={styles.slide}><Image source={{ uri: imageUrl }} style={styles.sliderImage} resizeMode="cover" /></View>))}
                </ScrollView>
                <View style={styles.pagination}>
                  {sliderImageUrls.map((_, index) => (<View key={index} style={[styles.paginationDot, index === activeSlideIndex ? styles.paginationDotActive : styles.paginationDotInactive]} />))}
                </View>
              </View>
            </View>

            {/* Título da Seção de Médicos */}
            <View style={localStyles.doctorsSectionHeader}>
                <Text style={styles.sectionTitle}>
                    Médicos de {activeCategory} {userLocation ? 'próximos' : ''}
                </Text>
            </View>
          </>
        }
        // --- COMPONENTE PARA LISTA VAZIA OU LOADING ---
        ListEmptyComponent={
            loading ? (
                // <<< Mostra loading DENTRO da área da lista >>>
                <View style={localStyles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={localStyles.loadingText}>Carregando médicos...</Text></View>
            ) : (
                // <<< Mostra mensagem de vazio DENTRO da área da lista >>>
                <View style={localStyles.centered}><Icon name="info" size={30} color={theme.colors.textSecondary} /><Text style={localStyles.noDoctorsText}>Nenhum médico encontrado {searchText ? 'para sua busca' : `para "${activeCategory}"`}.</Text></View>
            )
        }
        // --- FIM ListEmptyComponent ---

        // --- Props para Pull-to-Refresh ---
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        // --- FIM Props Pull-to-Refresh ---

        // --- Outras Props da FlatList ---
        contentContainerStyle={styles.listContentContainer} // Padding inferior na lista
        showsVerticalScrollIndicator={false}
        initialNumToRender={5} // Renderiza menos inicialmente
        maxToRenderPerBatch={5}
        windowSize={10}
      />
      {/* <<< FIM DA MUDANÇA PARA FlatList >>> */}


      {/* Botão Flutuante Animado (sem alterações) */}
      <AnimatedTouchable
        style={[localStyles.floatingChatButton, { transform: [{ translateX: animatedValueX }] }]}
        onPress={handleChatbotPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: chatbotIconUrl }} style={localStyles.floatingChatIconImage} resizeMode="contain" />
      </AnimatedTouchable>

    </SafeAreaView>
  );
}

// --- ESTILOS ---

// Estilos Locais (adicionado hospitalName e doctorsSectionHeader)
const localStyles = StyleSheet.create({
  doctorsSectionHeader: { // Container para o título dos médicos
      paddingHorizontal: 15,
      marginTop: 25, // Espaço acima do título
      marginBottom: 15, // Espaço abaixo do título
  },
  centered: { marginVertical: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  loadingText: { marginTop: 10, color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' },
  errorText: { marginTop: 10, color: theme.colors.error, fontSize: 16, textAlign: 'center' }, // Mantido para debug, mas erro principal vai para o Banner
  noDoctorsText: { marginTop: 10, color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' },
  doctorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardBackground || '#FFF', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 15, marginBottom: 12, marginHorizontal: 15, /* <<< Adiciona margem horizontal */ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  doctorImageContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  doctorImage: { width: '100%', height: '100%' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 2 },

  hospitalName: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.primary, marginBottom: 4, fontWeight: '500', },
  doctorSpecialty: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }, 
  distanceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  distanceText: { fontSize: 13, color: theme.colors.primary, marginLeft: 4, fontWeight: '500' },
  infoBanner: { backgroundColor: '#FFFBEA', borderColor: '#FEEABC', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 15, marginHorizontal: 15, marginVertical: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoBannerText: { flex: 1, fontSize: 13, color: '#856404', marginRight: 10 },
  settingsLink: { paddingLeft: 5 },
  settingsLinkText: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
  floatingChatButton: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  floatingChatIconImage: { width: 50, height: 50 }
});

// Combina estilos locais e externos (mantido)
const combinedExternalStyles = { ...externalStyles };
delete combinedExternalStyles.safeArea; 
const styles = {
    ...combinedExternalStyles, // Estilos externos (header, search, categorias, slider, etc.)
    ...localStyles, // Estilos locais (cards de médico, mensagens, etc.)
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    // Estilos para a FlatList principal
    listContentContainer: { paddingBottom: 90 }, // Padding inferior para não cobrir com botão flutuante
    header: externalStyles.header,
    headerLeftContainer: externalStyles.headerLeftContainer,
    flag: externalStyles.flag,
    greetingContainer: externalStyles.greetingContainer,
    greeting: externalStyles.greeting,
    userName: externalStyles.userName,
    logoutButton: externalStyles.logoutButton,
    searchContainer: externalStyles.searchContainer,
    searchInput: externalStyles.searchInput,
    searchIconContainer: externalStyles.searchIconContainer,
    sectionContainer: externalStyles.sectionContainer,
    categoriesScrollViewContent: externalStyles.categoriesScrollViewContent,
    categoryButton: externalStyles.categoryButton,
    categoryButtonActive: externalStyles.categoryButtonActive,
    categoryButtonInactive: externalStyles.categoryButtonInactive,
    categoryButtonText: externalStyles.categoryButtonText,
    categoryButtonTextActive: externalStyles.categoryButtonTextActive,
    categoryButtonTextInactive: externalStyles.categoryButtonTextInactive,
    sliderScrollView: externalStyles.sliderScrollView,
    slide: externalStyles.slide,
    sliderImage: externalStyles.sliderImage,
    pagination: externalStyles.pagination,
    paginationDot: externalStyles.paginationDot,
    paginationDotActive: externalStyles.paginationDotActive,
    paginationDotInactive: externalStyles.paginationDotInactive,
    sectionTitle: externalStyles.sectionTitle, 
};


export default DashboardScreen;