import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView, // Mantido caso adicione mais info depois
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Ícones ainda usados para detalhes

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

// --- DADOS FAKE DO USUÁRIO (Sem a URL da imagem agora) ---
const currentUserData = {
    name: 'Maria Clara Santos',
    email: 'm.clara.santos@email.com',
    phone: '(11) 98765-4321',
};

// --- COMPONENTE DA TELA MEU PERFIL (Simplificado) ---
function MyProfileScreen({ navigation }) {
  // Botão e função de editar foram removidos

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

          {/* Nome do Usuário (agora no topo) */}
          <Text style={styles.profileName}>{currentUserData.name}</Text>

          {/* Linha Separadora Sutil */}
          <View style={styles.separator} />

          {/* Detalhes: Email e Telefone */}
          <ProfileDetailItem
            icon="mail"
            label="Email"
            value={currentUserData.email}
          />
          <ProfileDetailItem
            icon="phone"
            label="Telefone"
            value={currentUserData.phone}
            // Último item, podemos remover marginBottom se não houver mais nada abaixo
            isLastItem={true}
          />

          {/* Botão Editar Perfil REMOVIDO */}
          {/* Separador após o botão REMOVIDO */}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente Auxiliar para Item de Detalhe (Ícone, Label, Valor) ---
// Adicionado 'isLastItem' opcional para controlar margem inferior
const ProfileDetailItem = ({ icon, label, value, isLastItem = false }) => (
  <View style={[styles.detailItem, isLastItem && styles.lastDetailItem]}>
    <Icon name={icon} size={20} color={theme.colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable={true}>{value}</Text>
    </View>
  </View>
);


// --- ESTILOS (Ajustados) ---
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
    paddingVertical: 30, // Padding vertical mantido ou ajustado
    paddingHorizontal: 25, // Padding horizontal
    // alignItems removido pois não precisamos mais centralizar a imagem
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Estilo profileImage REMOVIDO
  profileName: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.text,
    marginBottom: 25, // Espaço antes do primeiro separador
    textAlign: 'center', // Mantém o nome centralizado
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginVertical: 20, // Espaço antes e depois dos detalhes
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 18, // Espaço padrão entre itens
  },
  lastDetailItem: { // Remove margem inferior do último item
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
  // Estilos editButton e editButtonText REMOVIDOS
});

export default MyProfileScreen;