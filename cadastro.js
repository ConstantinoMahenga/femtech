// RegisterScreen.jsx
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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { auth, db } from './firebaseconfig'; // <<< VERIFIQUE O CAMINHO

// --- TEMA ---
const theme = {
  colors: {
    primary: '#FF69B4', text: '#333', placeholder: '#888', background: '#fff',
    border: '#ccc', borderFocused: '#FF69B4', white: '#fff', lightGray: '#f0f0f0',
    iconColor: '#555', error: '#D32F2F',
  },
};

// --- LISTAS ---
const medicalAreasList = [
 'Ciclo Menstrual', 'Gravidez', 'Fertilidade', 'Menopausa',
  'Bem-Estar Íntimo', 'Doenças Comuns', 'Prevenção',
  'Saúde Mental', 'Nutrição', 'Exercícios',
];


//Outras areas
  const Area=['Ginecologia e Obstetrícia', 'Mastologia', 'Reprodução Humana', 'Uroginecologia',
  'Endocrinologia Ginecológica', 'Oncologia Ginecológica', 'Saúde Mental Perinatal',
  'Medicina Fetal', 'Sexologia Clínica',];

// --- COMPONENTES AUXILIARES ---
const AvatarIcon = ({ iconName, size = 50, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
    <Icon name={iconName} size={size * 0.6} color={color} />
  </View>
);

// --- COMPONENTE PRINCIPAL ---
function RegisterScreen({ navigation }) {
  // --- ESTADOS ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fetchedAddress, setFetchedAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [userType, setUserType] = useState('paciente');
  const [selectedAreas, setSelectedAreas] = useState(
    medicalAreasList.reduce((acc, area) => { acc[area] = false; return acc; }, {})
  );
  // <<< NOVO ESTADO PARA DESCRIÇÃO >>>
  const [description, setDescription] = useState('');
  // <<< FIM NOVO ESTADO >>>
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FUNÇÕES (Localização, etc. - Mantidas) ---
  const requestLocationPermission = async () => { /* ...código mantido... */
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permissão de localização negada.');
      Alert.alert("Permissão Negada", "É necessário permitir o acesso à localização.");
      return false;
    }
    return true;
  };
  const fetchAddress = async () => { /* ...código mantido... */
    setLocationLoading(true);
    setLocationError(null);
    setFetchedAddress('');
    setCoords(null);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) { setLocationLoading(false); return; }
    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const currentCoords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setCoords(currentCoords);
      let addressResponse = await Location.reverseGeocodeAsync(currentCoords);
      if (addressResponse && addressResponse.length > 0) {
        const first = addressResponse[0];
        const formatted = `${first.street || ''}${first.streetNumber ? ' ' + first.streetNumber : ''}, ${first.city || ''} - ${first.region || ''}, ${first.postalCode || ''}, ${first.country || ''}`;
        const cleanAddress = formatted.replace(/ ,/g, ',').replace(/^,|,$/g, '').trim();
        setFetchedAddress(cleanAddress || 'Endereço encontrado, formato desconhecido');
      } else { setFetchedAddress('Endereço não encontrado.'); }
    } catch (error) {
      console.error("Erro localização:", error);
      let message = 'Erro ao buscar localização.';
      if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') message = 'Serviços de localização desativados.';
      setLocationError(message); Alert.alert("Erro", message);
    } finally { setLocationLoading(false); }
  };

  // --- FUNÇÃO DE SUBMISSÃO (Cadastro - Atualizada) ---
  const handleSubmit = async () => {
    // Validações
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { Alert.alert('Erro', 'E-mail inválido.'); return; }
    if (!name || !email || !phoneNumber || !fetchedAddress || !password || !confirmPassword || !userType) { Alert.alert('Erro', 'Preencha todos os campos obrigatórios e busque o endereço.'); return; }
    if (password !== confirmPassword) { Alert.alert('Erro', 'As senhas não coincidem.'); return; }
    if (password.length < 6) { Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.'); return; }
    if (userType === 'medico' && !Object.values(selectedAreas).some(isSelected => isSelected)) { Alert.alert('Erro', 'Médico(a) deve selecionar ao menos uma área.'); return; }
    // <<< Opcional: Validar se a descrição foi preenchida para médico >>>
    // if (userType === 'medico' && !description.trim()) { Alert.alert('Erro', 'Médico(a) deve preencher a descrição profissional.'); return; }

    setIsSubmitting(true);

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Preparar dados para o Firestore
      const userData = {
        uid: user.uid,
        name,
        email: user.email,
        phoneNumber,
        address: {
          formatted: fetchedAddress,
          coordinates: coords ? new GeoPoint(coords.latitude, coords.longitude) : null,
        },
        role: userType, // Salva 'paciente' ou 'medico'
        createdAt: serverTimestamp(),
        // <<< ADICIONA DADOS DO MÉDICO CONDICIONALMENTE >>>
        ...(userType === 'medico' && {
          medicalAreas: Object.keys(selectedAreas).filter(area => selectedAreas[area]),
          description: description.trim(), // Salva a descrição (removendo espaços extras)
        }),
        // <<< FIM DADOS DO MÉDICO >>>
      };

      // 3. Salvar dados no Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userData);

      console.log('Usuário registrado com sucesso! UID:', user.uid, 'Role:', userType);
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
      navigation.navigate('Login');

    } catch (error) {
      console.error("Erro no cadastro:", error);
      let errorMessage = 'Erro inesperado no cadastro.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este e-mail já está em uso.';
      // ... outros tratamentos de erro ...
      Alert.alert('Erro no Cadastro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- OUTRAS FUNÇÕES (Mantidas) ---
  const goToLogin = () => navigation.navigate('Login');
  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);
  const toggleAreaSelection = (areaName) => {
    setSelectedAreas(prev => ({ ...prev, [areaName]: !prev[areaName] }));
  };

  // --- RENDERIZAÇÃO ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <AvatarIcon iconName="person-add-alt-1" />
            <Text style={styles.title}>Criar Conta</Text>

            <View style={styles.form}>
              {/* Nome */}
              <TextInput
                  style={[styles.input, focusedInput === 'name' && styles.inputFocused, isSubmitting && styles.disabledBackground]}
                  placeholder="Nome completo" value={name} onChangeText={setName}
                  onFocus={() => handleFocus('name')} onBlur={handleBlur} returnKeyType="next"
                  editable={!isSubmitting} autoCapitalize="words"
              />
              {/* E-mail */}
              <TextInput
                  style={[styles.input, focusedInput === 'email' && styles.inputFocused, isSubmitting && styles.disabledBackground]}
                  placeholder="E-mail" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                  onFocus={() => handleFocus('email')} onBlur={handleBlur} returnKeyType="next"
                  editable={!isSubmitting}
              />
              {/* Celular */}
              <TextInput
                  style={[styles.input, focusedInput === 'phoneNumber' && styles.inputFocused, isSubmitting && styles.disabledBackground]}
                  placeholder="Número de celular (com DDD)" value={phoneNumber} onChangeText={setPhoneNumber}
                  keyboardType="phone-pad" autoComplete="tel"
                  onFocus={() => handleFocus('phoneNumber')} onBlur={handleBlur} returnKeyType="next"
                  editable={!isSubmitting}
              />

              {/* Endereço Automático */}
              <View style={styles.addressContainer}>
                <Text style={styles.label}>Endereço:</Text>
                <TouchableOpacity
                    style={[styles.buttonOutline, (locationLoading || isSubmitting) && styles.buttonDisabled]}
                    onPress={fetchAddress} disabled={locationLoading || isSubmitting}
                >
                    {locationLoading ? <ActivityIndicator size="small" color={theme.colors.primary} />
                        : <><Icon name="my-location" size={20} color={theme.colors.primary} style={styles.buttonIcon} /><Text style={styles.buttonOutlineText}>Buscar Endereço Atual</Text></>}
                </TouchableOpacity>
                {fetchedAddress && !locationError && <Text style={styles.addressText}>{fetchedAddress}</Text>}
                {locationError && <Text style={styles.errorText}>{locationError}</Text>}
                {!locationLoading && !fetchedAddress && !locationError && <Text style={styles.placeholderText}>Clique para buscar seu endereço.</Text>}
              </View>

              {/* Tipo de Usuário */}
              <Text style={styles.label}>Eu sou:</Text>
              <View style={[styles.pickerContainer, isSubmitting && styles.disabledBackground]}>
                  <Picker
                      selectedValue={userType}
                      onValueChange={(itemValue) => setUserType(itemValue)}
                      style={styles.picker} dropdownIconColor={theme.colors.primary}
                      enabled={!isSubmitting}
                  >
                      <Picker.Item label="Paciente" value="paciente" />
                      <Picker.Item label="Médico(a)" value="medico" />
                  </Picker>
              </View>

              {/* Áreas Médicas (Condicional) */}
              {userType === 'medico' && (
                  <View style={[styles.checklistContainer, isSubmitting && styles.disabledBackground]}>
                      <Text style={styles.label}>Selecione suas áreas de atuação:</Text>
                      {Object.keys(selectedAreas).map((area) => (
                          <TouchableOpacity
                              key={area} style={styles.checklistItem}
                              onPress={() => !isSubmitting && toggleAreaSelection(area)}
                              activeOpacity={isSubmitting ? 1 : 0.7} disabled={isSubmitting}
                          >
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

              {/* <<< CAMPO DE DESCRIÇÃO (Condicional) >>> */}
              {userType === 'medico' && (
                <>
                  <Text style={styles.label}>Descrição Profissional (Opcional):</Text>
                  <TextInput
                      style={[
                          styles.input,
                          styles.textArea, // Estilo adicional para altura
                          focusedInput === 'description' && styles.inputFocused,
                          isSubmitting && styles.disabledBackground
                      ]}
                      placeholder="Descreva sua experiência, foco de atuação, etc."
                      value={description}
                      onChangeText={setDescription}
                      onFocus={() => handleFocus('description')}
                      onBlur={handleBlur}
                      multiline={true} // Permite múltiplas linhas
                      numberOfLines={4} // Sugestão inicial de altura
                      editable={!isSubmitting}
                      textAlignVertical="top" // Garante que o texto comece no topo em Android
                  />
                </>
              )}
              {/* <<< FIM CAMPO DE DESCRIÇÃO >>> */}


              {/* Senha */}
              <TextInput
                  style={[styles.input, focusedInput === 'password' && styles.inputFocused, isSubmitting && styles.disabledBackground]}
                  placeholder="Senha (mín. 6 caracteres)" value={password} onChangeText={setPassword}
                  secureTextEntry onFocus={() => handleFocus('password')} onBlur={handleBlur} returnKeyType="next"
                  editable={!isSubmitting}
              />
              {/* Confirmar Senha */}
              <TextInput
                  style={[styles.input, focusedInput === 'confirmPassword' && styles.inputFocused, isSubmitting && styles.disabledBackground]}
                  placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword}
                  secureTextEntry onFocus={() => handleFocus('confirmPassword')} onBlur={handleBlur} returnKeyType="done"
                  onSubmitEditing={handleSubmit} // Tenta submeter ao pressionar 'done' aqui
                  editable={!isSubmitting}
              />

              {/* Botão Criar Conta */}
              <TouchableOpacity
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSubmit} disabled={isSubmitting}
              >
                  {isSubmitting ? <ActivityIndicator size="small" color={theme.colors.white} /> : <Text style={styles.buttonText}>Criar Conta</Text>}
              </TouchableOpacity>
              {/* Link para Login */}
              <TouchableOpacity style={styles.linkContainer} onPress={goToLogin} disabled={isSubmitting}>
                  <Text style={[styles.linkText, isSubmitting && styles.linkDisabled]}>Já possui uma conta? Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  // ... (estilos anteriores mantidos)
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoiding: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center' },
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  avatar: { marginBottom: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  form: { width: '100%' },
  input: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: theme.colors.text, marginBottom: 15, width: '100%' },
  inputFocused: { borderColor: theme.colors.borderFocused, borderWidth: 1.5 },
  // <<< Estilo para Text Area (Descrição) >>>
  textArea: {
    minHeight: 100, // Define uma altura mínima
    textAlignVertical: 'top', // Alinha texto no topo (Android)
  },
  label: { fontSize: 16, color: theme.colors.text, marginBottom: 8, fontWeight: '500', alignSelf: 'flex-start' },
  addressContainer: { marginBottom: 15, width: '100%' },
  buttonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white, borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 10 },
  buttonOutlineText: { color: theme.colors.primary, fontSize: 16, fontWeight: '500' },
  buttonIcon: { marginRight: 8 },
  addressText: { fontSize: 15, color: theme.colors.text, marginTop: 5, paddingHorizontal: 5, fontStyle: 'italic' },
  placeholderText: { fontSize: 14, color: theme.colors.placeholder, marginTop: 5, paddingHorizontal: 5, fontStyle: 'italic', textAlign: 'center' },
  errorText: { fontSize: 14, color: theme.colors.error, marginTop: 5, paddingHorizontal: 5, fontWeight: 'bold' },
  pickerContainer: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, marginBottom: 15, backgroundColor: theme.colors.white, overflow: 'hidden' },
  picker: { width: '100%', height: Platform.OS === 'ios' ? 180 : 50, color: theme.colors.text },
  checklistContainer: { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 15, backgroundColor: theme.colors.lightGray },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checklistIcon: { marginRight: 10 },
  checklistLabel: { fontSize: 16, color: theme.colors.text, flex: 1 },
  button: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', marginTop: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5, height: 48, justifyContent: 'center' },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6, /* backgroundColor: theme.colors.lightGray */ }, // Opacidade já causa efeito visual
  disabledBackground: { backgroundColor: '#f5f5f5', opacity: 0.7 },
  linkContainer: { marginTop: 10, alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontSize: 14, textDecorationLine: 'underline' },
  linkDisabled: { color: theme.colors.placeholder, textDecorationLine: 'none' }, // Estilo para link desabilitado
});

// --- EXPORTAÇÃO ---
export default RegisterScreen;