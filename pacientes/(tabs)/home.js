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
  Dimensions,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import styles, { theme } from '../../style/DashboardScreen.styles';
import * as Location from 'expo-location'; // 📍 Importação da API de localização do Expo

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

function DashboardScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(femtechCategories[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sliderRef = useRef(null);
  const { user, logout } = useAuth();
  const userName = user?.name || 'Usuário(a)';

  // 📍 Localização + filtro por proximidade
  useEffect(() => {
    const fetchNearbyDoctors = async () => {
      setLoading(true);
      setError(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização negada.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;

        const q = query(
          collection(db, 'users'),
          where('role', '==', 'medico'),
          where('medicalAreas', 'array-contains', activeCategory)
        );

        const querySnapshot = await getDocs(q);
        const doctorsList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const coordinates = data?.address?.coordinates;

          if (coordinates) {
            const doctorLat = coordinates.latitude;
            const doctorLon = coordinates.longitude;

            const distance = getDistanceFromLatLonInKm(userLat, userLon, doctorLat, doctorLon);
            
            //Distancia em km
            if (distance <= 50) {
              doctorsList.push({ id: doc.id, ...data, distance });
            }
          }
        });

        doctorsList.sort((a, b) => a.distance - b.distance);
        setDoctors(doctorsList);
      } catch (err) {
        console.error('Erro ao buscar médicos:', err);
        setError('Erro ao carregar médicos próximos.');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyDoctors();
  }, [activeCategory]);

  // Funções de distância
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

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

  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert('Pesquisa', `Funcionalidade de pesquisa por "${searchText}" ainda não implementada.`);
    }
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
  };

  const onScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    if (newIndex !== activeSlideIndex) {
      setActiveSlideIndex(newIndex);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: async () => {
            try { await logout(); }
            catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair.");
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const navigateToDoctorProfile = (doctorId) => {
    navigation.navigate('ViewDoctorProfileScreen', { doctorId });
  };

  const renderDoctorsSection = () => {
    if (loading) {
      return (
        <View style={localStyles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={localStyles.loadingText}>Carregando médicos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={localStyles.centered}>
          <Icon name="alert-circle" size={30} color={theme.colors.error} />
          <Text style={localStyles.errorText}>{error}</Text>
        </View>
      );
    }

    if (doctors.length === 0) {
      return (
        <View style={localStyles.centered}>
          <Icon name="info" size={30} color={theme.colors.textSecondary} />
          <Text style={localStyles.noDoctorsText}>
            Nenhum médico encontrado para "{activeCategory}" perto de você.
          </Text>
        </View>
      );
    }

    return doctors.map((doctor) => (
      <TouchableOpacity
        key={doctor.id}
        style={localStyles.doctorCard}
        onPress={() => navigateToDoctorProfile(doctor.id)}
        activeOpacity={0.7}
      >
        <View style={localStyles.doctorImageContainer}>
          {doctor.profileImageUrl ? (
            <Image 
              source={{ uri: doctor.profileImageUrl }} 
              style={localStyles.doctorImage} 
            />
          ) : (
            <Icon name="user" size={24} color={theme.colors.primary} />
          )}
        </View>

        <View style={localStyles.doctorInfo}>
          <Text style={localStyles.doctorName} numberOfLines={1}>
            {doctor.name || 'Nome não disponível'}
          </Text>
          {doctor.medicalAreas && doctor.medicalAreas.length > 0 && (
            <Text style={localStyles.doctorSpecialty} numberOfLines={1}>
              {doctor.medicalAreas[0]}
              {doctor.medicalAreas.length > 1 ? ` +${doctor.medicalAreas.length - 1}` : ''}
            </Text>
          )}
        </View>

        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    ));
  };

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
          <View style={styles.headerLeftContainer}>
            <Image source={{ uri: flagImageUrl }} style={styles.flag} resizeMode="contain"/>
            <View style={styles.greetingContainer}>
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
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar especialista"
            placeholderTextColor={theme.colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
            <Icon name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categorias */}
       {/* Categorias */}
<View style={{ marginBottom: 20 }}>
  <View style={styles.sectionContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesScrollViewContent}
    >
      {femtechCategories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.categoryButton,
            activeCategory === category
              ? styles.categoryButtonActive
              : styles.categoryButtonInactive
          ]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.categoryButtonText,
            activeCategory === category
              ? styles.categoryButtonTextActive
              : styles.categoryButtonTextInactive
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
</View>

{/* Slider */}
<View style={{ marginVertical: 1 }}>
  <View style={styles.sectionContainer}>
    <ScrollView
      ref={sliderRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onScrollEnd}
      scrollEventThrottle={16}
      style={styles.sliderScrollView}
    >
      {sliderImageUrls.map((imageUrl, index) => (
        <View key={index} style={styles.slide}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.sliderImage}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>

    <View style={styles.pagination}>
      {sliderImageUrls.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeSlideIndex
              ? styles.paginationDotActive
              : styles.paginationDotInactive
          ]}
        />
      ))}
    </View>
  </View>
</View>

{/* Médicos */}
<View style={{ marginTop: 1 }}>
  <View style={localStyles.doctorsSection}>
    <Text style={styles.sectionTitle}>
      Médicos de {activeCategory}
    </Text>
    {renderDoctorsSection()}
  </View>
</View>

      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  doctorsSection: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  centered: {
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: theme.colors.error,
    fontSize: 16,
  },
  noDoctorsText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground || '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default DashboardScreen;
