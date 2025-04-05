import React from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Usando Feather para ícones

// --- TEMA (Padrão Rosa consistente) ---
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa Principal
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#aaa',
    background: '#f7f7f7', // Fundo geral da tela
    border: '#eee',
    cardBackground: '#fff', // Fundo do card de perfil
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE DO MÉDICO LOGADO (Exemplo) ---
const doctorUserData = {
    name: 'Dra. Helena Martins',
    email: 'helena.martins.med@email.com',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/25.jpg', // Imagem do médico
    description: 'Médica Ginecologista e Obstetra com foco em acompanhamento pré-natal de alto risco e saúde da mulher. Mais de 10 anos de experiência clínica.',
    category: 'Ginecologia e Obstetrícia', // Especialidade
    location: 'São Paulo, SP - Próximo ao Metrô Paraíso', // Localização
};

// --- COMPONENTE DA TELA MEU PERFIL (MÉDICO) ---
function DoctorProfileScreen({ navigation }) {

  // Função placeholder para a ação de editar
  const handleEditProfile = () => {
    console.log("Navegar para a tela de Edição de Perfil do Médico");
    // Exemplo: navigation.navigate('EditDoctorProfileScreen', { doctorData: doctorUserData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal com Informações */}
        <View style={styles.profileCard}>

          {/* Imagem do Perfil */}
          <Image
            source={{ uri: doctorUserData.profileImageUrl }}
            style={styles.profileImage}
          />

          {/* Nome do Médico */}
          <Text style={styles.profileName}>{doctorUserData.name}</Text>

          {/* Linha Separadora */}
          <View style={styles.separator} />

          {/* Detalhes: Email, Categoria, Localização */}
          <ProfileDetailItem
            icon="mail" // Ícone de email
            label="Email de Contato"
            value={doctorUserData.email}
          />
          <ProfileDetailItem
            icon="briefcase" // Ícone de pasta/trabalho
            label="Especialidade"
            value={doctorUserData.category}
          />
           <ProfileDetailItem
            icon="map-pin" // Ícone de localização
            label="Localização Principal"
            value={doctorUserData.location}
          />

           {/* Linha Separadora */}
           <View style={styles.separator} />

           {/* Descrição */}
           <ProfileDetailItem
            icon="align-left" // Ícone de texto/descrição
            label="Sobre Mim / Descrição Profissional"
            value={doctorUserData.description}
            isDescription // Flag para talvez estilizar diferente se necessário
           />

          {/* Linha Separadora */}
          <View style={styles.separator} />

          {/* Botão Editar Perfil */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.7}>
            <Icon name="edit-2" size={18} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>Editar Meu Perfil</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente Auxiliar para Item de Detalhe ---
// Reutilizado da tela de perfil anterior, com adição opcional de 'isDescription'
const ProfileDetailItem = ({ icon, label, value, isDescription = false }) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={20} color={theme.colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, isDescription && styles.descriptionValue]} selectable={true}>
          {value}
      </Text>
    </View>
  </View>
);


// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    alignItems: 'center', // Centraliza imagem e nome
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
    alignItems: 'flex-start', // Alinha ícone no topo se texto for longo
    width: '100%', // Ocupa toda a largura do card
    marginBottom: 18,
  },
  detailIcon: {
    marginRight: 18,
    marginTop: 3, // Ajuste para alinhar com a primeira linha do texto
    width: 20, // Garante que o espaço do ícone seja consistente
    textAlign: 'center',
  },
  detailTextContainer: {
    flex: 1, // Para o texto ocupar o restante da linha
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 5, // Aumenta espaço entre label e valor
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 22, // Espaçamento entre linhas para melhor leitura
  },
  descriptionValue: { // Estilo específico para a descrição, se necessário
    // Ex: fontStyle: 'italic',
    lineHeight: 24, // Pode precisar de mais espaço
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Espaço acima do botão
    // paddingVertical: 10, // Removido - botão pode ser só texto/ícone clicável
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.primary, // Texto rosa
    marginLeft: 8,
  },
});

export default DoctorProfileScreen;