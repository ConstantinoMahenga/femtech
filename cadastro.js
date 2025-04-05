import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
// --- ATUALIZADO: Importar Ícone do Expo ---
import { MaterialIcons as Icon } from '@expo/vector-icons'; // Use @expo/vector-icons
import { Picker } from '@react-native-picker/picker';
// --- ATUALIZADO: Importar expo-location ---
import * as Location from 'expo-location'; // Importa tudo de expo-location
// --- ATUALIZADO: Importar funções do Firebase JS SDK e a config ---
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { auth, db } from './firebaseconfig'; // Ajuste o caminho se necessário

// Definindo cores do tema (igual ao seu código)
const theme = {
  colors: {
    primary: '#FF69B4', text: '#333', placeholder: '#888', background: '#fff',
    border: '#ccc', borderFocused: '#FF69B4', white: '#fff', lightGray: '#f0f0f0',
    iconColor: '#555', error: '#D32F2F',
  },
};

// Áreas médicas (igual ao seu código)
const medicalAreasList = [
  'Ginecologia e Obstetrícia', 'Mastologia', 'Reprodução Humana', 'Uroginecologia',
  'Endocrinologia Ginecológica', 'Oncologia Ginecológica', 'Saúde Mental Perinatal',
  'Medicina Fetal', 'Sexologia Clínica',
];

// Componente Avatar (igual ao seu código, mas usa Icon do Expo)
const AvatarIcon = ({ iconName, size = 50, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
    <Icon name={iconName} size={size * 0.6} color={color} />
  </View>
);

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fetchedAddress, setFetchedAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [coords, setCoords] = useState(null); // { latitude, longitude }

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [userType, setUserType] = useState('paciente');
  const [selectedAreas, setSelectedAreas] = useState(
    medicalAreasList.reduce((acc, area) => { acc[area] = false; return acc; }, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ATUALIZADO: Função de permissão usando expo-location ---
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permissão de localização negada.');
      Alert.alert(
         "Permissão Negada",
         "Não é possível obter o endereço sem permissão de localização. Por favor, habilite a permissão nas configurações do seu dispositivo."
       );
      return false;
    }
    return true;
  };

  // --- ATUALIZADO: Função de busca de endereço usando expo-location ---
  const fetchAddress = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setFetchedAddress('');
    setCoords(null);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationLoading(false);
      return;
    }

    try {
      // Pega a localização atual
      let location = await Location.getCurrentPositionAsync({
         accuracy: Location.Accuracy.High, // Pode ajustar a precisão
      });
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoords(currentCoords);

      // Geocodificação Reversa: Coordenadas para Endereço
      let addressResponse = await Location.reverseGeocodeAsync(currentCoords);

      if (addressResponse && addressResponse.length > 0) {
        const firstAddress = addressResponse[0];
        // Formata o endereço (ajuste conforme necessário)
        const formatted = `${firstAddress.street || ''}${firstAddress.streetNumber ? ' ' + firstAddress.streetNumber : ''}, ${firstAddress.city || ''} - ${firstAddress.region || ''}, ${firstAddress.postalCode || ''}, ${firstAddress.country || ''}`;
        // Remove vírgulas extras ou espaços no início/fim se algum campo for nulo
        const cleanAddress = formatted.replace(/ ,/g, ',').replace(/^,|,$/g, '').trim();
        setFetchedAddress(cleanAddress || 'Endereço encontrado, mas formato desconhecido');
        setLocationError(null);
      } else {
        setFetchedAddress('Endereço não encontrado para estas coordenadas.');
        setLocationError(null); // Não é um erro de permissão/busca, apenas não achou
      }

    } catch (error) {
      console.error("Erro ao buscar localização/endereço:", error);
      let message = 'Ocorreu um erro ao buscar sua localização.';
      if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
          message = 'Serviços de localização estão desativados. Por favor, ative-os.'
      }
      setLocationError(message);
      Alert.alert("Erro", message);
      setFetchedAddress('');
    } finally {
      setLocationLoading(false);
    }
  };

  // --- ATUALIZADO: handleSubmit com Firebase JS SDK ---
  const handleSubmit = async () => {
    // Validações (iguais às anteriores)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro de Validação', 'Por favor, insira um endereço de e-mail válido.');
      return;
    }
    if (!name || !email || !phoneNumber || !fetchedAddress || !password || !confirmPassword || !userType) {
      Alert.alert('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios e busque seu endereço.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro de Validação', 'As senhas não coincidem.');
      return;
    }
     if (password.length < 6) {
       Alert.alert('Erro de Validação', 'A senha deve ter pelo menos 6 caracteres.');
       return;
    }
    if (userType === 'medico') {
      const anyAreaSelected = Object.values(selectedAreas).some(isSelected => isSelected);
      if (!anyAreaSelected) {
        Alert.alert('Erro de Validação', 'Médico deve selecionar pelo menos uma área de atuação.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Criar usuário no Firebase Authentication (usando SDK JS)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Usa 'auth' importado
      const user = userCredential.user;

      // 2. Preparar dados para o Firestore
      const userData = {
        uid: user.uid,
        name,
        email,
        phoneNumber,
        address: {
          formatted: fetchedAddress,
          // --- ATUALIZADO: Salvar coordenadas usando GeoPoint do Firestore ---
          coordinates: coords ? new GeoPoint(coords.latitude, coords.longitude) : null,
        },
        userType,
        createdAt: serverTimestamp(), // Função do SDK JS
        ...(userType === 'medico' && {
          medicalAreas: Object.keys(selectedAreas).filter(area => selectedAreas[area])
        }),
      };

      // 3. Salvar dados do usuário no Firestore (usando SDK JS)
      // Cria uma referência ao documento: collection(db, 'users'), id do documento (user.uid)
      const userDocRef = doc(db, "users", user.uid); // Usa 'db' importado
      await setDoc(userDocRef, userData); // Usa setDoc para criar/sobrescrever

      console.log('Usuário registrado e dados salvos no Firestore!');
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
      // navigation.navigate('Home'); // Ou para onde desejar ir

    } catch (error) {
      console.error("Erro no cadastro:", error);
      // Tratamento de erros do Firebase JS SDK (códigos podem ser similares)
      let errorMessage = 'Ocorreu um erro inesperado durante o cadastro.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este endereço de e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O endereço de e-mail fornecido é inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca (mínimo 6 caracteres).';
      } else if (error.code) {
          errorMessage = `Erro: ${error.message}`;
      }
      Alert.alert('Erro no Cadastro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções goToLogin, handleFocus, handleBlur, toggleAreaSelection (iguais)
  const goToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else {
      console.warn("Navegação não disponível.");
    }
  };
  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);
  const toggleAreaSelection = (areaName) => {
    setSelectedAreas(prevAreas => ({
      ...prevAreas,
      [areaName]: !prevAreas[areaName],
    }));
  };

  // JSX (igual ao anterior, apenas o import do Icon mudou implicitamente)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {/* Usa AvatarIcon que agora usa Icon do Expo */}
            <AvatarIcon iconName="person-add-alt-1" />
            <Text style={styles.title}>Criar Conta</Text>

            <View style={styles.form}>
              {/* Nome */}
              <TextInput
                style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
                placeholder="Nome completo" placeholderTextColor={theme.colors.placeholder}
                value={name} onChangeText={setName} autoCapitalize="words"
                textContentType="name" onFocus={() => handleFocus('name')} onBlur={handleBlur}
                editable={!isSubmitting}
              />

              {/* E-mail */}
              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="E-mail" placeholderTextColor={theme.colors.placeholder}
                value={email} onChangeText={setEmail} keyboardType="email-address"
                textContentType="emailAddress" autoCapitalize="none"
                onFocus={() => handleFocus('email')} onBlur={handleBlur}
                editable={!isSubmitting}
              />

              {/* Celular */}
              <TextInput
                style={[styles.input, focusedInput === 'phoneNumber' && styles.inputFocused]}
                placeholder="Número de celular (com DDD)" placeholderTextColor={theme.colors.placeholder}
                value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad"
                textContentType="telephoneNumber" onFocus={() => handleFocus('phoneNumber')} onBlur={handleBlur}
                editable={!isSubmitting}
              />

              {/* --- SEÇÃO DE ENDEREÇO AUTOMÁTICO --- */}
              <View style={styles.addressContainer}>
                <Text style={styles.label}>Endereço:</Text>
                <TouchableOpacity
                  style={[styles.buttonOutline, locationLoading && styles.buttonDisabled]}
                  onPress={fetchAddress}
                  disabled={locationLoading || isSubmitting}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      {/* Icon do Expo */}
                      <Icon name="my-location" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
                      <Text style={styles.buttonOutlineText}>Buscar Endereço Atual</Text>
                    </>
                  )}
                </TouchableOpacity>

                {fetchedAddress && !locationError && (
                  <Text style={styles.addressText}>{fetchedAddress}</Text>
                )}
                {locationError && (
                  <Text style={styles.errorText}>{locationError}</Text>
                )}
                 {!locationLoading && !fetchedAddress && !locationError && (
                     <Text style={styles.placeholderText}>Clique no botão acima para buscar seu endereço.</Text>
                 )}
              </View>
              {/* --- FIM DA SEÇÃO DE ENDEREÇO --- */}


              {/* Tipo de Usuário */}
              <Text style={styles.label}>Eu sou:</Text>
              <View style={[styles.pickerContainer, isSubmitting && styles.disabledBackground]}>
                <Picker
                  selectedValue={userType}
                  onValueChange={(itemValue) => setUserType(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={theme.colors.primary}
                  enabled={!isSubmitting}
                >
                  <Picker.Item label="Paciente" value="paciente" />
                  <Picker.Item label="Médico(a)" value="medico" />
                </Picker>
              </View>

              {/* Checklist Condicional */}
              {userType === 'medico' && (
                <View style={[styles.checklistContainer, isSubmitting && styles.disabledBackground]}>
                  <Text style={styles.label}>Selecione suas áreas de atuação:</Text>
                  {Object.keys(selectedAreas).map((area) => (
                    <TouchableOpacity
                      key={area} style={styles.checklistItem}
                      onPress={() => !isSubmitting && toggleAreaSelection(area)}
                      activeOpacity={isSubmitting ? 1 : 0.7}
                    >
                      {/* Icon do Expo */}
                      <Icon
                        name={selectedAreas[area] ? 'check-box' : 'check-box-outline-blank'}
                        size={24} color={selectedAreas[area] ? theme.colors.primary : theme.colors.iconColor}
                        style={styles.checklistIcon}
                      />
                      <Text style={styles.checklistLabel}>{area}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Senha */}
              <TextInput
                style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                placeholder="Senha (mín. 6 caracteres)" placeholderTextColor={theme.colors.placeholder}
                value={password} onChangeText={setPassword} secureTextEntry={true}
                textContentType="newPassword" onFocus={() => handleFocus('password')} onBlur={handleBlur}
                editable={!isSubmitting}
              />
              {/* Confirmar Senha */}
              <TextInput
                style={[styles.input, focusedInput === 'confirmPassword' && styles.inputFocused]}
                placeholder="Confirmar Senha" placeholderTextColor={theme.colors.placeholder}
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true}
                textContentType="newPassword" onFocus={() => handleFocus('confirmPassword')} onBlur={handleBlur}
                editable={!isSubmitting}
              />

              {/* Botão de Cadastro */}
              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={goToLogin}
                disabled={isSubmitting}
              >
                <Text style={styles.linkText}>Já possui uma conta? Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Estilos (permanecem os mesmos, pois os componentes base são compatíveis) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoiding: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center' },
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  avatar: {
    marginBottom: 15, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  form: { width: '100%' },
  input: {
    backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: theme.colors.text, marginBottom: 15, width: '100%',
  },
  inputFocused: { borderColor: theme.colors.borderFocused, borderWidth: 1.5 },
  label: { fontSize: 16, color: theme.colors.text, marginBottom: 8, fontWeight: '500', alignSelf: 'flex-start' },
  addressContainer: { marginBottom: 15, width: '100%' },
  buttonOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white,
    borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15,
    marginBottom: 10,
  },
  buttonOutlineText: { color: theme.colors.primary, fontSize: 16, fontWeight: '500' },
  buttonIcon: { marginRight: 8 },
  addressText: {
    fontSize: 15, color: theme.colors.text, marginTop: 5, paddingHorizontal: 5, fontStyle: 'italic',
  },
   placeholderText: {
     fontSize: 14, color: theme.colors.placeholder, marginTop: 5, paddingHorizontal: 5,
     fontStyle: 'italic', textAlign: 'center',
   },
  errorText: {
    fontSize: 14, color: theme.colors.error, marginTop: 5, paddingHorizontal: 5, fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, marginBottom: 15,
    backgroundColor: theme.colors.white, overflow: 'hidden',
  },
  picker: { width: '100%', height: 50, color: theme.colors.text },
  checklistContainer: {
    width: '100%', marginBottom: 15, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
    padding: 15, backgroundColor: theme.colors.lightGray,
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checklistIcon: { marginRight: 10 },
  checklistLabel: { fontSize: 16, color: theme.colors.text, flex: 1 },
  button: {
    backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25,
    alignItems: 'center', marginTop: 20, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
    height: 48, justifyContent: 'center',
  },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6, backgroundColor: theme.colors.lightGray },
  disabledBackground: { backgroundColor: '#e0e0e0', opacity: 0.7 },
  linkContainer: { marginTop: 10, alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontSize: 14, textDecorationLine: 'underline' },
});

export default RegisterScreen;