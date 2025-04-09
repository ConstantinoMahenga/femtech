import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import { collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '../../firebaseconfig'; // Ajuste o caminho
// Ajuste o caminho para seus estilos, se for diferente
import externalStyles, { theme } from '../../style/DashboardScreen.styles';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

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
  'https://www.jsi.com/wp-content/uploads/2022/06/A-breastfeeding-mother-receives-her-COVID-19-vaccine-certificate-after-being-vaccinated-at-a-USAID-DISCOVER-Health-mobile-site-in-Ndola.-1024x683.jpg',
];

const { width: screenWidth } = Dimensions.get('window');

// --- Função auxiliar para formatar a distância ---
const formatDistance = (distanceInMeters) => {
    if (distanceInMeters === null || distanceInMeters === undefined) return null;
    if (distanceInMeters < 1000) return `Há ${Math.round(distanceInMeters)} m de distância`;
    return `Há ${(distanceInMeters / 1000).toFixed(1)} km de distância`;
};


function DashboardScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(femtechCategories[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);

  const sliderRef = useRef(null);
  const { user, logout } = useAuth();
  const userName = user?.name || 'Usuário(a)';

  // Efeito para buscar localização e depois médicos
  useEffect(() => {
    const initializeDashboard = async () => {
        setLoading(true);
        setError(null);
        setDoctors([]);
        let currentError = null;
        let locationResult = null;

        // 1. Obter Localização
        console.log("Iniciando busca de localização...");
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermissionStatus(status);
            if (status !== 'granted') {
                currentError = 'Permissão de localização negada.';
                console.warn(currentError);
            } else {
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                locationResult = { latitude: location.coords.latitude, longitude: location.coords.longitude };
                setUserLocation(locationResult);
                console.log("Localização obtida:", locationResult);
            }
        } catch (locErr) {
            console.error('Erro ao obter localização:', locErr);
            currentError = 'Não foi possível obter a localização.';
        }

        // 2. Buscar Médicos
        console.log(`Buscando médicos para categoria: ${activeCategory}...`);
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'medico'),
                where('medicalAreas', 'array-contains', activeCategory)
            );
            const querySnapshot = await getDocs(q);
            const doctorsList = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const coordinates = data.address?.coordinates;
                let distance = null;

                if (locationResult && coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number') {
                    try {
                        distance = geolib.getDistance(locationResult, { latitude: coordinates.latitude, longitude: coordinates.longitude });
                    } catch (distErr) { distance = null; }
                } else if (!coordinates) {
                    console.warn(`Médico ${doc.id} (${data.name}) sem GeoPoint válido em 'address.coordinates'.`);
                }
                doctorsList.push({ id: doc.id, ...data, distance });
            });

            doctorsList.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });

            setDoctors(doctorsList);
            setError(currentError);
            console.log(`Médicos encontrados e processados: ${doctorsList.length}`);

        } catch (fetchErr) {
            console.error('Erro ao buscar médicos:', fetchErr);
            setError('Erro ao carregar médicos.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };
    initializeDashboard();
  }, [activeCategory]);

  // Efeito para auto-scroll do slider
  useEffect(() => {
    if (sliderImageUrls.length <= 1) return;
    const intervalId = setInterval(() => {
      setActiveSlideIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % sliderImageUrls.length;
        sliderRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
        return nextIndex;
      });
    }, 5000);
    return () => clearInterval(intervalId);
  }, [sliderImageUrls.length]);

  // Handlers
  const handleSearch = () => { if (searchText.trim()) Alert.alert('Pesquisa', `Busca por "${searchText}" não implementada.`); };
  const handleCategoryPress = (category) => { setActiveCategory(category); };
  const onScrollEnd = (event) => { const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth); if (newIndex !== activeSlideIndex) setActiveSlideIndex(newIndex); };
  const handleLogout = () => { Alert.alert( "Sair", "Tem certeza?", [{ text: "Cancelar", style: "cancel" }, { text: "Sair", onPress: async () => { try { await logout(); } catch (e) { console.error(e); Alert.alert("Erro", "Falha ao sair."); }}, style: "destructive" }], { cancelable: true }); };
  const navigateToChat = (doctor) => {
    if (!doctor?.id || !doctor?.name) { Alert.alert("Erro", "Dados incompletos para iniciar chat."); return; }
    navigation.navigate('ChatScreen', { doctorId: doctor.id, doctorName: doctor.name, doctorImage: doctor.profileImageUrl || null });
  };

  // Renderiza a seção de médicos
  const renderDoctorsSection = () => {
    if (loading) return <View style={localStyles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={localStyles.loadingText}>Carregando...</Text></View>;
    if (error && error === 'Erro ao carregar médicos.') return <View style={localStyles.centered}><Icon name="alert-circle" size={30} color={theme.colors.error} /><Text style={localStyles.errorText}>{error}</Text></View>;
    if (doctors.length === 0) return <View style={localStyles.centered}><Icon name="info" size={30} color={theme.colors.textSecondary} /><Text style={localStyles.noDoctorsText}>Nenhum médico encontrado para "{activeCategory}" {userLocation ? 'perto de você' : ''}.</Text></View>;

    return doctors.map((doctor) => {
      const displayDistance = formatDistance(doctor.distance);
      return (
          <TouchableOpacity key={doctor.id} style={localStyles.doctorCard} onPress={() => navigateToChat(doctor)} activeOpacity={0.7}>
            <View style={localStyles.doctorImageContainer}>
              {doctor.profileImageUrl ? <Image source={{ uri: doctor.profileImageUrl }} style={localStyles.doctorImage} /> : <Icon name="user" size={24} color={theme.colors.primary} />}
            </View>
            <View style={localStyles.doctorInfo}>
              <Text style={localStyles.doctorName} numberOfLines={1}>{doctor.name || 'Nome não disponível'}</Text>
              {/* Renderiza especialidade apenas se existir */}
              {doctor.medicalAreas && doctor.medicalAreas.length > 0 && (
                <Text style={localStyles.doctorSpecialty} numberOfLines={1}>
                    {doctor.medicalAreas[0]}
                    {doctor.medicalAreas.length > 1 ? ` +${doctor.medicalAreas.length - 1}` : ''}
                </Text>
              )}
              {/* Renderiza distância apenas se existir */}
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerLeftContainer}>
            <Image source={{ uri: flagImageUrl }} style={styles.flag} resizeMode="contain"/>
            <View style={styles.greetingContainer}>
              {/* Separado para evitar o erro */}
              <Text style={styles.greeting}>Olá, </Text>
              <Text style={[styles.greeting, styles.userName]}>{userName}!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="log-out" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Procurar especialista" placeholderTextColor={theme.colors.placeholder} value={searchText} onChangeText={setSearchText} onSubmitEditing={handleSearch} returnKeyType="search"/>
          <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
            <Icon name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categorias */}
        <View style={{ marginBottom: 20 }}>
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

        {/* Banner de Erro/Info de Localização */}
         {!loading && error && error !== 'Erro ao carregar médicos.' && (
            <View style={localStyles.infoBanner}>
                <Icon name="info" size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }}/>
                {/* --- CORREÇÃO AQUI --- */}
                {/* Garante que 'error' seja uma string antes de renderizar */}
                {typeof error === 'string' && (
                    <Text style={localStyles.infoBannerText}>{error}</Text>
                )}
                {/* --- FIM DA CORREÇÃO --- */}
                {locationPermissionStatus === 'denied' && (
                    <TouchableOpacity style={localStyles.settingsLink} onPress={() => Linking.openSettings()}>
                        <Text style={localStyles.settingsLinkText}>Abrir Config.</Text>
                    </TouchableOpacity>
                )}
            </View>
         )}

        {/* Seção de Médicos */}
        <View style={{ marginTop: !loading && error && error !== 'Erro ao carregar médicos.' ? 5 : 20 }}>
          <View style={localStyles.doctorsSection}>
            {/* Título da seção */}
            <Text style={styles.sectionTitle}>
                Médicos de {activeCategory} {userLocation ? 'próximos' : ''}
            </Text>
            {/* Renderiza os cards */}
            {renderDoctorsSection()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos Locais (incluindo distância e banner)
const localStyles = StyleSheet.create({
  doctorsSection: { marginBottom: 30, paddingHorizontal: 15 },
  centered: { marginVertical: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  loadingText: { marginTop: 10, color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' },
  errorText: { marginTop: 10, color: theme.colors.error, fontSize: 16, textAlign: 'center' },
  noDoctorsText: { marginTop: 10, color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' },
  doctorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardBackground || '#FFF', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  doctorImageContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  doctorImage: { width: '100%', height: '100%' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 3 },
  doctorSpecialty: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  distanceText: { fontSize: 13, color: theme.colors.primary, marginLeft: 4, fontWeight: '500' }, // Distância em rosa
  infoBanner: { backgroundColor: '#FFFBEA', borderColor: '#FEEABC', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoBannerText: { flex: 1, fontSize: 13, color: '#856404', marginRight: 10 },
  settingsLink: { paddingLeft: 5 },
  settingsLinkText: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
});

// Combina estilos locais e externos (se houver)
const styles = { ...externalStyles, ...localStyles };

export default DashboardScreen;