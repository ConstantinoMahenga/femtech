// perfilPaciente.js (ou MyProfileScreen.js)
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext'; // <<< IMPORT useAuth

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

// --- REMOVIDO: DADOS FAKE DO USUÁRIO ---
// const currentUserData = { ... };

// --- COMPONENTE DA TELA MEU PERFIL (Atualizado) ---
function MyProfileScreen({ navigation }) {
  // <<< ACESSAR DADOS DO USUÁRIO DO CONTEXTO >>>
  const { user } = useAuth();

  // <<< RENDERIZAÇÃO CONDICIONAL ENQUANTO DADOS NÃO ESTÃO PRONTOS >>>
  if (!user) {
    // Se não houver usuário (pode acontecer brevemente durante o carregamento inicial)
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // <<< Renderização principal com dados do usuário do contexto >>>
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>

          {/* <<< USA user.name do contexto >>> */}
          <Text style={styles.profileName}>{user.name || 'Nome Indisponível'}</Text>

          <View style={styles.separator} />

          {/* <<< USA user.email do contexto >>> */}
          <ProfileDetailItem
            icon="mail"
            label="Email"
            value={user.email || 'Email Indisponível'}
            isLastItem={true} // Último item agora
          />
          <View style={styles.separator} />
          {/* Campo Telefone Removido por enquanto - Adicionar se/quando estiver no contexto ou for buscado */}
          {
          <ProfileDetailItem
            icon="phone"
            label="Telefone"
            value={user.phoneNumber || 'Não informado'} // Assumindo que 'phone' poderia existir no 'user'
            isLastItem={true}
          />
          }

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente Auxiliar para Item de Detalhe (Mantido) ---
const ProfileDetailItem = ({ icon, label, value, isLastItem = false }) => (
  <View style={[styles.detailItem, isLastItem && styles.lastDetailItem]}>
    <Icon name={icon} size={20} color={theme.colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable={true}>{value}</Text>
    </View>
  </View>
);


// --- ESTILOS (Adicionado loadingContainer, outros mantidos/ajustados) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // <<< Estilo para o estado de carregamento >>>
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
    paddingVertical: 30,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 18,
  },
  lastDetailItem: {
      marginBottom: 0,
  },
  detailIcon: {
    marginRight: 18,
    marginTop: 3,
    width: 20,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 22,
  },
});

export default MyProfileScreen;