// RegisterScreen_Patient.jsx (Renomeie o ficheiro se desejar)
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
// Removido: import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { auth, db } from './firebaseconfig'; // <<< VERIFIQUE O CAMINHO

// --- TEMA (Mantido) ---
const theme = {
  colors: {
    primary: '#FF69B4', text: '#333', placeholder: '#888', background: '#fff',
    border: '#ccc', borderFocused: '#FF69B4', white: '#fff', lightGray: '#f0f0f0',
    iconColor: '#555', error: '#D32F2F',
  },
};


// --- COMPONENTES AUXILIARES (Mantido) ---
const AvatarIcon = ({ iconName, size = 50, color = theme.colors.white, backgroundColor = theme.colors.primary }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
    <Icon name={iconName} size={size * 0.6} color={color} />
  </View>
);

// --- COMPONENTE PRINCIPAL (Foco em Paciente) ---
function RegisterScreenPatient({ navigation }) { // Nome do componente atualizado
  // --- ESTADOS (Removido userType, selectedAreas, description) ---
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FUNÇÕES (Localização - Mantidas) ---
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permissão de localização negada.');
      Alert.alert("Permissão Negada", "É necessário permitir o acesso à localização.");
      return false;
    }
    return true;
  };
  const fetchAddress = async () => {
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

  // --- FUNÇÃO DE SUBMISSÃO (Cadastro de Paciente) ---
  const handleSubmit = async () => {
    // Validações
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { Alert.alert('Erro', 'E-mail inválido.'); return; }
    // Removido !userType da validação
    if (!name || !email || !phoneNumber || !fetchedAddress || !password || !confirmPassword) { Alert.alert('Erro', 'Preencha todos os campos obrigatórios e busque o endereço.'); return; }
    if (password !== confirmPassword) { Alert.alert('Erro', 'As senhas não coincidem.'); return; }
    if (password.length < 6) { Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.'); return; }
    // Removida validação de áreas médicas

    setIsSubmitting(true);

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Preparar dados para o Firestore (APENAS Paciente)
      const userData = {
        uid: user.uid,
        name,
        email: user.email,
        phoneNumber,
        address: {
          formatted: fetchedAddress,
          coordinates: coords ? new GeoPoint(coords.latitude, coords.longitude) : null,
        },
        role: 'paciente', // Define diretamente como paciente
        createdAt: serverTimestamp(),
        // Removida a parte condicional de médico
      };

      // 3. Salvar dados no Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userData);

      console.log('Paciente registrado com sucesso! UID:', user.uid);
      Alert.alert('Sucesso!', 'Conta de paciente criada com sucesso!');
      navigation.navigate('Login'); // Ou para uma tela de confirmação/dashboard de paciente

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

  // --- OUTRAS FUNÇÕES (Mantidas, exceto toggleAreaSelection) ---
  const goToLogin = () => navigation.navigate('Login');
  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Ícone pode ser diferente se quiser: e.g., 'person-add' */}
            <AvatarIcon iconName="person-add" />
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

              {/* Endereço Automático (Mantido) */}
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
                  onSubmitEditing={handleSubmit}
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

// --- ESTILOS (Mantidos - remover estilos não usados se quiser otimizar) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoiding: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center' },
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  avatar: { marginBottom: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20, textAlign: 'center' }, // Centralizado
  form: { width: '100%' },
  input: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: theme.colors.text, marginBottom: 15, width: '100%' },
  inputFocused: { borderColor: theme.colors.borderFocused, borderWidth: 1.5 },
  textArea: { minHeight: 100, textAlignVertical: 'top' }, // Mantido caso use em outro lugar, mas não usado aqui
  label: { fontSize: 16, color: theme.colors.text, marginBottom: 8, fontWeight: '500', alignSelf: 'flex-start' },
  addressContainer: { marginBottom: 15, width: '100%' },
  buttonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white, borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 10 },
  buttonOutlineText: { color: theme.colors.primary, fontSize: 16, fontWeight: '500' },
  buttonIcon: { marginRight: 8 },
  addressText: { fontSize: 15, color: theme.colors.text, marginTop: 5, paddingHorizontal: 5, fontStyle: 'italic' },
  placeholderText: { fontSize: 14, color: theme.colors.placeholder, marginTop: 5, paddingHorizontal: 5, fontStyle: 'italic', textAlign: 'center' },
  errorText: { fontSize: 14, color: theme.colors.error, marginTop: 5, paddingHorizontal: 5, fontWeight: 'bold' },
  // Removido: pickerContainer, picker, checklistContainer, checklistItem, checklistIcon, checklistLabel
  button: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', marginTop: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5, height: 48, justifyContent: 'center' },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6 },
  disabledBackground: { backgroundColor: '#f5f5f5', opacity: 0.7 },
  linkContainer: { marginTop: 10, alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontSize: 14, textDecorationLine: 'underline' },
  linkDisabled: { color: theme.colors.placeholder, textDecorationLine: 'none' },
});

// --- EXPORTAÇÃO ---
export default RegisterScreenPatient; // Nome do componente atualizado