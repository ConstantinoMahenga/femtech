import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text, // <--- GARANTA QUE Text está importado
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native'; // <--- Verifique se Text está aqui
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '../../firebaseconfig'; // <<< AJUSTE O CAMINHO
import * as Location from 'expo-location';
import * as geolib from 'geolib';

// --- TEMA ---
const theme = { colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#999', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', error: '#D32F2F', hospitalText: '#FF69B4' }, fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' } };

// --- Função formatDistance (sem alterações) ---
const formatDistance = (distanceInMeters) => { if (distanceInMeters === null || distanceInMeters === undefined) return null; if (distanceInMeters < 1000) return `Há ${Math.round(distanceInMeters)} m de distância`; return `Há ${(distanceInMeters / 1000).toFixed(1)} km de distância`; };

// --- COMPONENTE DoctorListItem (JSX RETIFICADO) ---
const DoctorListItem = React.memo(({ item, navigation }) => {
    const primarySpecialty = item.medicalAreas?.[0] || 'Especialidade não informada';
    const description = item.profile?.bio || item.description || 'Sem descrição disponível.';
    const displayDistance = formatDistance(item.distance);
    const hospitalName = item.hospital || 'Hospital não informado';

    const handlePress = () => { /* ... (lógica handlePress sem alterações) ... */ if (!item?.id || !item?.name) { console.error("Dados incompletos chat:", item); Alert.alert("Erro", "Não foi possível abrir o chat."); return; } console.log(`Navegando ChatScreen: ID=${item.id}, Nome=${item.name}`); navigation.navigate('ChatScreen', { doctorId: item.id, doctorName: item.name, doctorHospital: hospitalName, doctorImage: item.profileImageUrl || null }); };

    return (
        // <<< RETIFICAÇÃO ESTRUTURA JSX >>>
        <TouchableOpacity style={styles.doctorCard} activeOpacity={0.7} onPress={handlePress}>
            <View style={styles.doctorCardContent}>
                {/* Coluna de Informações */}
                <View style={styles.doctorInfoContainer}>
                    <Text style={styles.doctorName}>{item.name || 'Nome não disponível'}</Text>
                    <Text style={styles.hospitalName}>{hospitalName}</Text>
                    <Text style={styles.doctorSpecialty}>{primarySpecialty}</Text>
                    {item.medicalAreas && item.medicalAreas.length > 1 && (<Text style={styles.doctorExtraSpecialties} numberOfLines={1}>+ {item.medicalAreas.slice(1).join(', ')}</Text>)}
                    <Text style={styles.doctorDescription} numberOfLines={2} ellipsizeMode="tail">{description}</Text>
                    {/* Renderiza distância condicionalmente DENTRO de um Text ou View */}
                    {displayDistance && (
                        <View style={styles.distanceContainer}>
                            <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.colors.textMuted} />
                            <Text style={styles.distanceText}>{displayDistance}</Text>
                        </View>
                    )}
                </View>
                {/* Coluna da Imagem/Placeholder */}
                <View style={styles.imageContainer}>
                  {item.profileImageUrl ? (
                      <Image source={{ uri: item.profileImageUrl }} style={styles.doctorImage} resizeMode="cover" onError={(e) => console.log("Erro img:", e.nativeEvent.error)}/>
                  ) : (
                      <View style={styles.doctorImagePlaceholder}><Icon name="user" size={30} color={theme.colors.placeholder} /></View>
                  )}
                </View>
            </View>
        </TouchableOpacity>
        // <<< FIM RETIFICAÇÃO >>>
    );
});

// --- COMPONENTE PRINCIPAL DA TELA ---
function DoctorsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [processedDoctors, setProcessedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [errorDoctors, setErrorDoctors] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorLocation, setErrorLocation] = useState(null);

  // --- Lógica de busca e processamento (sem alterações) ---
  const fetchDoctors = useCallback(async () => { /* ... (igual) ... */ setLoadingDoctors(true); setErrorDoctors(null); setDoctors([]); setProcessedDoctors([]); console.log("Buscando médicos..."); try { const q = query( collection(db, "users"), where("role", "==", "medico") ); const querySnapshot = await getDocs(q); const doctorsList = []; querySnapshot.forEach((doc) => { const data = doc.data(); const locationData = (data.address?.coordinates instanceof GeoPoint) ? data.address.coordinates : null; if (!locationData) { console.warn(`Médico ${doc.id} (${data.name}) sem GeoPoint.`); } doctorsList.push({ id: doc.id, ...data, location: locationData, hospital: data.hospital || null }); }); console.log(`Encontrados ${doctorsList.length} médicos.`); setDoctors(doctorsList); } catch (err) { console.error("Erro buscar médicos: ", err); setErrorDoctors("Não foi possível carregar médicos."); } finally { setLoadingDoctors(false); } }, []);
  useEffect(() => { const requestLocation = async () => { setLoadingLocation(true); setErrorLocation(null); console.log("Solicitando permissão..."); try { let { status } = await Location.requestForegroundPermissionsAsync(); setLocationPermissionStatus(status); console.log("Permissão:", status); if (status !== 'granted') { setErrorLocation('Permissão necessária.'); setLoadingLocation(false); return; } console.log("Obtendo posição..."); let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }); setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude }); console.log("Localização obtida:", location.coords); setErrorLocation(null); } catch (err) { console.error('Erro localização:', err); setErrorLocation('Não foi possível obter localização.'); } finally { setLoadingLocation(false); } }; requestLocation(); }, []);
  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { if (loadingLocation) return; if (doctors.length > 0) { console.log("Processando distâncias..."); const doctorsWithDistance = doctors.map(doctor => { let distance = null; if (userLocation && doctor.location) { try { distance = geolib.getDistance( userLocation, { latitude: doctor.location.latitude, longitude: doctor.location.longitude } ); } catch(calcError) { console.error(`Erro calc dist ${doctor.id}:`, calcError); distance = null; } } return { ...doctor, distance }; }).sort((a, b) => { if (a.distance === null && b.distance === null) return 0; if (a.distance === null) return 1; if (b.distance === null) return -1; return a.distance - b.distance; }); console.log("Distâncias processadas."); setProcessedDoctors(doctorsWithDistance); } else { setProcessedDoctors([]); } }, [userLocation, doctors, loadingLocation]);
  const filteredDoctors = useMemo(() => { const listToFilter = processedDoctors; if (!searchText.trim()) return listToFilter; const lowerCaseSearch = searchText.toLowerCase(); return listToFilter.filter(doctor => { const nameMatch = doctor.name?.toLowerCase().includes(lowerCaseSearch); const hospitalMatch = doctor.hospital?.toLowerCase().includes(lowerCaseSearch); const specialtyMatch = doctor.medicalAreas?.some(area => area.toLowerCase().includes(lowerCaseSearch)); const descriptionMatch = doctor.profile?.bio?.toLowerCase().includes(lowerCaseSearch) || doctor.description?.toLowerCase().includes(lowerCaseSearch); return nameMatch || hospitalMatch || specialtyMatch || descriptionMatch; }); }, [searchText, processedDoctors]);
  const renderItem = useCallback(({ item }) => ( <DoctorListItem item={item} navigation={navigation} /> ), [navigation]);

  const isLoading = loadingLocation || loadingDoctors;

  // --- Lógica de Renderização do Conteúdo Principal (RETIFICADA) ---
  const renderContent = () => {
    // <<< RETIFICAÇÃO: Envolve textos de loading/erro em <Text> >>>
    if (isLoading) {
        return (
            <View style={styles.centeredMessageContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                    {loadingLocation ? 'Obtendo localização...' : 'Carregando médicos...'}
                </Text>
            </View>
        );
    }
    if (errorDoctors) {
        return (
            <View style={styles.centeredMessageContainer}>
                <Icon name="alert-circle" size={40} color={theme.colors.error} />
                <Text style={styles.errorText}>{errorDoctors}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // <<< FIM RETIFICAÇÃO >>>

    // Renderiza FlatList normalmente
    return (
        <FlatList
          data={filteredDoctors}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
                {/* <<< RETIFICAÇÃO: Garante que textos estão em <Text> >>> */}
                <Text style={styles.emptyListText}>
                    {processedDoctors.length === 0 ? 'Nenhum médico disponível' : 'Nenhum médico encontrado'}
                </Text>
                {processedDoctors.length > 0 && searchText.trim() && (
                    <Text style={styles.emptyListSubText}>
                        Verifique o termo pesquisado.
                    </Text>
                )}
                {/* <<< FIM RETIFICAÇÃO >>> */}
            </View>}
          initialNumToRender={10} maxToRenderPerBatch={5} windowSize={10}
        />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Procurar por nome, hospital, área..." placeholderTextColor={theme.colors.placeholder} value={searchText} onChangeText={setSearchText} returnKeyType="search" clearButtonMode="while-editing" editable={!isLoading} />
          <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
      </View>
      {/* Banner de Informação/Erro de Localização */}
      {/* <<< RETIFICAÇÃO: Garante que errorLocation (string) está em <Text> >>> */}
      {!loadingLocation && errorLocation && (
        <View style={styles.infoBanner}>
            <Icon name="info" size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }}/>
            {/* Renderiza o texto de erro DENTRO de um Text */}
            <Text style={styles.infoBannerText}>{typeof errorLocation === 'string' ? errorLocation : 'Erro de localização.'}</Text>
            {locationPermissionStatus === 'denied' && (
                <TouchableOpacity style={styles.settingsLink} onPress={() => Linking.openSettings()}>
                    <Text style={styles.settingsLinkText}>Abrir Config.</Text>
                </TouchableOpacity>
            )}
        </View>
      )}
      {/* <<< FIM RETIFICAÇÃO >>> */}

      {/* Área Principal de Conteúdo */}
      {renderContent()}
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardBackground, borderRadius: 10, marginHorizontal: 15, marginTop: 15, marginBottom: 10, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 9, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: theme.fonts.regular, color: theme.colors.text, paddingVertical: 0, marginRight: 8 },
  searchIcon: { },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20, flexGrow: 1 },
  doctorCard: { backgroundColor: theme.colors.cardBackground, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  doctorCardContent: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  doctorInfoContainer: { flex: 1, marginRight: 15 },
  doctorName: { fontSize: 17, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.text, marginBottom: 2 },
  hospitalName: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.hospitalText, marginBottom: 5, fontWeight: '500' },
  doctorSpecialty: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.primary, marginBottom: 2, fontWeight: '500' },
  doctorExtraSpecialties: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, marginBottom: 6, fontStyle: 'italic' },
  doctorDescription: { fontSize: 13, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, lineHeight: 18, marginTop: 4, marginBottom: 8 },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  distanceText: { fontSize: 13, fontFamily: theme.fonts.regular, color: theme.colors.primary, marginLeft: 5, fontWeight: '500' },
  imageContainer: { /* Adicionado para envolver imagem/placeholder */ },
  doctorImage: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: theme.colors.border },
  doctorImagePlaceholder: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  centeredMessageContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  loadingText: { marginTop: 15, fontSize: 16, fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, textAlign: 'center' },
  errorText: { marginTop: 15, fontSize: 16, fontFamily: theme.fonts.regular, color: theme.colors.error, textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
  retryButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  emptyListContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30, paddingHorizontal: 20 },
  emptyListText: { fontSize: 18, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  emptyListSubText: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, textAlign: 'center' },
  infoBanner: { backgroundColor: '#FFFBEA', borderColor: '#FEEABC', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoBannerText: { flex: 1, fontSize: 13, color: '#856404', marginRight: 10 },
  settingsLink: { paddingLeft: 5 },
  settingsLinkText: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
});

export default DoctorsScreen;