import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
  Alert, // <<< Import Alert
} from 'react-native';
// <<< Importe o ícone e o hook useAuth >>>
import IconFA5 from 'react-native-vector-icons/FontAwesome5'; // Ajuste se usar outra biblioteca
import { useAuth } from '../../context/AuthContext'; // <<< VERIFIQUE ESTE CAMINHO!

// --- TEMA (Mantido) ---
const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#999',
    background: '#f7f7f7',
    border: '#eee',
    cardBackground: '#fff',
    onlineStatus: '#FF69B4',
    unreadBadge: '#FF69B4',
    initialsBackground: '#FCE4EC',
    iconColor: '#666', // Cor para o ícone de logout
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE (Mantido) ---
const chatListData = [
    { id: '1', name: 'Sofia Alves', specialty: 'Ginecologista', imageUrl: '...', lastMessage: 'Olá! Como posso ajudar hoje?', lastMessageSender:'doctor', timestamp: '10:45', unreadCount: 2, isOnline: true },
    { id: '2', name: 'Ricardo Mendes', specialty: 'Mastologista', imageUrl: '...', lastMessage: 'Resultados dos exames chegaram.', lastMessageSender:'doctor', timestamp: 'Ontem', unreadCount: 0, isOnline: false },
    { id: '3', name: 'Carolina Pinto', specialty: 'Fertilidade', imageUrl: '...', lastMessage: 'Agendamento confirmado para sexta.', lastMessageSender:'doctor', timestamp: '15/07', unreadCount: 0, isOnline: true },
    { id: '4', name: 'André Faria', specialty: 'Uroginecologista', imageUrl: '...', lastMessage: 'Estou com alguns problemas.', lastMessageSender:'user', timestamp: '14/07', unreadCount: 1, isOnline: false },
    { id: '5', name: 'Beatriz Costa', specialty: 'Endocrinologia', imageUrl: '...', lastMessage: 'Você enviou a receita?', lastMessageSender:'doctor', timestamp: '13/07', unreadCount: 0, isOnline: false },
    { id: '7', name: 'Inês Pereira', specialty: 'Sexologia', imageUrl: '...', lastMessage: 'Ok, muito obrigada!', lastMessageSender:'user', timestamp: '11:30', unreadCount: 0, isOnline: true },
];

// --- COMPONENTE DO ITEM DA LISTA DE CHAT (Mantido) ---
const ChatListItem = React.memo(({ item, onPress }) => {
    const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';
    const prefix = item.lastMessageSender === 'user' ? 'Eu: ' : '';
    const displayMessage = `${prefix}${item.lastMessage}`;

    return (
        <TouchableOpacity
            style={styles.chatItemContainer}
            activeOpacity={0.6}
            onPress={() => onPress(item)}
        >
            <View style={styles.avatarContainer}>
                <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{initial}</Text>
                </View>
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                    {displayMessage}
                </Text>
            </View>
            <View style={styles.metaContainer}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

// --- COMPONENTE DA TELA DE LISTA DE CHATS ---
function ChatListScreen({ navigation }) {

  // <<< Obtenha a função logout do contexto >>>
  const { logout } = useAuth();

  const handlePressChat = (patient) => {
    console.log("Abrir chat com:", patient.name);
    navigation.navigate('ChatScreen', {
        doctorId: patient.id,
        doctorName: patient.name,
        doctorImage: patient.imageUrl
    });
  };

  // <<< Função para lidar com o logout >>>
  const handleLogout = () => {
    Alert.alert(
      "Sair", // Título
      "Tem certeza que deseja sair da sua conta?", // Mensagem
      [
        {
          text: "Não", // Botão Cancelar
          style: "cancel"
        },
        {
          text: "Sim", // Botão Confirmar
          onPress: async () => {
            try {
              console.log('Iniciando processo de logout...');
              await logout(); // Chama a função logout do contexto
              console.log('Logout realizado com sucesso.');
              // A navegação de volta para a tela de Login deve ser
              // tratada automaticamente pelo seu StackNavigator principal
              // que observa o estado de autenticação do AuthContext.
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          },
          style: 'destructive' // Estilo para indicar ação destrutiva (iOS)
        }
      ],
      { cancelable: true } // Permite fechar o alerta tocando fora dele (Android)
    );
  };


  const renderItem = ({ item }) => (
    <ChatListItem item={item} onPress={handlePressChat} />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />

      {/* Cabeçalho Atualizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        {/* <<< Botão de Logout >>> */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconFA5 name="sign-out-alt" size={24} color={theme.colors.iconColor} />
        </TouchableOpacity>
      </View>

      {/* Lista de Chats (Mantido) */}
      <FlatList
        data={chatListData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>Nenhuma conversa iniciada.</Text>
              <Text style={styles.emptyListSubText}>Aguarde o contato dos pacientes.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// --- ESTILOS (Adicionado estilo para o botão de logout) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Mantém o título à esquerda e o botão à direita
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '700',
    color: theme.colors.text,
  },
  // <<< Estilo para o botão de logout (ajuste padding se necessário) >>>
  logoutButton: {
      padding: 5, // Adiciona uma pequena área de toque ao redor do ícone
  },
  listContainer: {
    paddingBottom: 20,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: theme.colors.cardBackground,
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  initialsCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: theme.colors.initialsBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.onlineStatus,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.colors.cardBackground,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.text,
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  metaContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: theme.colors.unreadBadge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 85,
  },
  emptyListContainer: {
    flexGrow: 1,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyListText: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyListSubText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: 'center',
  }
});

export default ChatListScreen;