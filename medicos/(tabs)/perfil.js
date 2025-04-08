// perfilmedico.js (ou DoctorProfileScreen.js)
import React, { useState, useEffect } from 'react'; // <<< IMPORT useState, useEffect
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator, // <<< IMPORT ActivityIndicator
  Alert, // <<< IMPORT Alert for potential errors
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext'; // <<< IMPORT useAuth
// <<< IMPORT FIRESTORE FUNCTIONS and DB INSTANCE >>>
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig'; // <<< VERIFIQUE ESTE CAMINHO!

// --- TEMA (Mantido) ---
const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#aaa',
    background: '#f7f7f7',
    border: '#eee',
    cardBackground: '#fff',
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- REMOVIDO: DADOS FAKE DO MÉDICO ---

// --- COMPONENTE DA TELA MEU PERFIL (MÉDICO - Atualizado) ---
function DoctorProfileScreen({ navigation }) {
  // <<< ACESSAR USUÁRIO BÁSICO DO CONTEXTO >>>
  const { user } = useAuth();

  // <<< ESTADOS PARA DADOS DO FIRESTORE E CARREGAMENTO >>>
  const [doctorDetails, setDoctorDetails] = useState(null); // Armazena dados do Firestore
  const [isLoading, setIsLoading] = useState(true); // Controla o estado de carregamento

  // <<< EFEITO PARA BUSCAR DADOS DO FIRESTORE QUANDO O COMPONENTE MONTA OU user.uid MUDA >>>
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!user || !user.uid) {
        setIsLoading(false); // Não há usuário para buscar, para o loading
        console.log("Usuário não encontrado no contexto para buscar detalhes.");
        return;
      }

      setIsLoading(true); // Inicia o carregamento
      try {
        console.log(`Buscando detalhes do médico com UID: ${user.uid}`);
        const docRef = doc(db, "users", user.uid); // Referência ao documento do usuário
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Dados do médico encontrados:", docSnap.data());
          setDoctorDetails(docSnap.data()); // Armazena os dados encontrados no estado
        } else {
          // Documento não existe no Firestore
          console.warn(`Documento para o médico UID ${user.uid} não encontrado no Firestore.`);
          setDoctorDetails({}); // Define como objeto vazio para evitar erros de `null`
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do médico no Firestore:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes do perfil. Tente novamente mais tarde.");
        setDoctorDetails({}); // Define como objeto vazio em caso de erro
      } finally {
        setIsLoading(false); // Finaliza o carregamento (sucesso ou falha)
      }
    };

    fetchDoctorDetails();
  }, [user]); // Dependência: re-executa se o objeto 'user' (principalmente user.uid) mudar

  // --- Função de Edição (Placeholder) ---
  const handleEditProfile = () => {
    console.log("Navegar para a tela de Edição de Perfil do Médico");
    navigation.navigate('EditDoctorProfileScreen', {
       doctorData: { ...user, ...doctorDetails } // Combina dados do contexto e do firestore
    });
  };

  // --- RENDERIZAÇÃO ---

  // Estado de Carregamento Inicial (contexto ou firestore)
  if (isLoading || !user) {
     return (
       <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color={theme.colors.primary} />
         </View>
       </SafeAreaView>
     );
   }

  // Renderização Principal (Após carregamento)
  // Usar dados do 'user' (contexto) como fallback se 'doctorDetails' não tiver o campo
  const profileName = doctorDetails?.name || user.name || 'Nome Indisponível';
  const profileEmail = doctorDetails?.email || user.email || 'Email Indisponível';
  const profileImageUrl = doctorDetails?.profileImageUrl;
  const location = doctorDetails?.address?.formatted || 'Localização não informada'; // Acesso seguro
  const description = doctorDetails?.description || 'Sem descrição disponível.';

  // --- MODIFICAÇÃO AQUI ---
  // Processar as especialidades (medicalAreas) para exibição
  let category = 'Especialidade não informada'; // Valor padrão
  const areas = doctorDetails?.medicalAreas;

  if (Array.isArray(areas) && areas.length > 0) {
    // Se for um array não vazio, junte com quebra de linha
    category = areas.join('\n');
  } else if (typeof areas === 'string' && areas.trim() !== '') {
    // Se for uma string não vazia, use-a diretamente
    category = areas;
  }
  // Se for null, undefined, array vazio ou string vazia, mantém o valor padrão.
  // --- FIM DA MODIFICAÇÃO ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>

          {/* Imagem do Perfil */}
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Icon name="user" size={50} color={theme.colors.primary} />
            </View>
          )}

          {/* Nome */}
          <Text style={styles.profileName}>{profileName}</Text>
          <View style={styles.separator} />

          {/* Detalhes */}
          <ProfileDetailItem icon="mail" label="Email de Contato" value={profileEmail} />
          {/* Usa a variável 'category' processada */}
          <ProfileDetailItem icon="briefcase" label="Especialidade(s)" value={category} />
          <ProfileDetailItem icon="map-pin" label="Localização Principal" value={location} />

          <View style={styles.separator} />

          {/* Descrição */}
          <ProfileDetailItem icon="align-left" label="Sobre Mim / Descrição Profissional" value={description} isDescription />

          <View style={styles.separator} />

          {/* Botão Editar */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.7}>
            <Icon name="edit-2" size={18} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>Editar Meu Perfil</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente Auxiliar ProfileDetailItem (Mantido sem alterações) ---
const ProfileDetailItem = ({ icon, label, value, isDescription = false }) => (
    <View style={styles.detailItem}>
      <Icon name={icon} size={20} color={theme.colors.primary} style={styles.detailIcon} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        {/* O componente Text do React Native interpreta '\n' como quebra de linha */}
        <Text style={[styles.detailValue, isDescription && styles.descriptionValue]} selectable={true}>
            {value}
        </Text>
      </View>
    </View>
  );

// --- ESTILOS (Mantidos sem alterações) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  profileCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
    backgroundColor: theme.colors.border,
    borderWidth: 4,
    borderColor: theme.colors.primary + '60',
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCE4EC', // Cor placeholder um pouco mais específica
  },
  profileName: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginVertical: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Alinha no topo para caso o texto quebre linha
    width: '100%',
    marginBottom: 18,
  },
  detailIcon: {
    marginRight: 18,
    marginTop: 3, // Ajuste fino para alinhar com a primeira linha de texto
    width: 20,
    textAlign: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 22, // Garante espaço entre as linhas se houver quebra
  },
  descriptionValue: {
    lineHeight: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.primary,
    marginLeft: 8,
  },
});

export default DoctorProfileScreen;