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
} from 'react-native';

// --- TEMA (Padrão Rosa consistente) ---
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
    initialsBackground: '#FCE4EC', // Um rosa bem claro para o fundo das iniciais
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE (Estrutura mantida, imageUrl não será usado nesta tela) ---
const chatListData = [
    // Adicionando um campo `lastMessageSender` para o exemplo de prévia "Eu:"
    { id: '1', name: 'Sofia Alves', specialty: 'Ginecologista', imageUrl: '...', lastMessage: 'Olá! Como posso ajudar hoje?', lastMessageSender:'doctor', timestamp: '10:45', unreadCount: 2, isOnline: true },
    { id: '2', name: 'Ricardo Mendes', specialty: 'Mastologista', imageUrl: '...', lastMessage: 'Resultados dos exames chegaram.', lastMessageSender:'doctor', timestamp: 'Ontem', unreadCount: 0, isOnline: false },
    { id: '3', name: 'Carolina Pinto', specialty: 'Fertilidade', imageUrl: '...', lastMessage: 'Agendamento confirmado para sexta.', lastMessageSender:'doctor', timestamp: '15/07', unreadCount: 0, isOnline: true },
    { id: '4', name: 'André Faria', specialty: 'Uroginecologista', imageUrl: '...', lastMessage: 'Estou com alguns problemas.', lastMessageSender:'user', timestamp: '14/07', unreadCount: 1, isOnline: false },
    { id: '5', name: 'Beatriz Costa', specialty: 'Endocrinologia', imageUrl: '...', lastMessage: 'Você enviou a receita?', lastMessageSender:'doctor', timestamp: '13/07', unreadCount: 0, isOnline: false },
    { id: '7', name: 'Inês Pereira', specialty: 'Sexologia', imageUrl: '...', lastMessage: 'Ok, muito obrigada!', lastMessageSender:'user', timestamp: '11:30', unreadCount: 0, isOnline: true },
];

// --- COMPONENTE DO ITEM DA LISTA DE CHAT (CORRIGIDO) ---
const ChatListItem = React.memo(({ item, onPress }) => {
    // Pega a primeira letra do nome, ou '?' se não houver nome
    const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';

    // Define o prefixo para a última mensagem
    const prefix = item.lastMessageSender === 'user' ? 'Eu: ' : '';

    // <<< --- CORREÇÃO AQUI --- >>>
    // Criar a string completa ANTES de usar no JSX
    const displayMessage = `${prefix}${item.lastMessage}`;
    // <<< --- FIM DA CORREÇÃO --- >>>

    return (
        <TouchableOpacity
            style={styles.chatItemContainer}
            activeOpacity={0.6}
            onPress={() => onPress(item)}
        >
            {/* Container da Inicial e Indicador Online */}
            <View style={styles.avatarContainer}>
                <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{initial}</Text>
                </View>
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            {/* Container de Texto */}
            <View style={styles.textContainer}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                    {/* <<< --- CORREÇÃO AQUI --- >>> */}
                    {/* Usar a variável pré-construída */}
                    {displayMessage}
                    {/* <<< --- FIM DA CORREÇÃO --- >>> */}
                </Text>
            </View>

            {/* Container de Metadados */}
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

  const handlePressChat = (patient) => {
    console.log("Abrir chat com:", patient.name);
    // Navegação para ChatScreen (ajuste os parâmetros conforme necessário)
    navigation.navigate('ChatScreen', {
        doctorId: patient.id,
        doctorName: patient.name,
        doctorImage: patient.imageUrl // Mesmo se não usado na lista, pode ser útil no chat
    });
  };

  const renderItem = ({ item }) => (
    <ChatListItem item={item} onPress={handlePressChat} />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
      </View>

      {/* Lista de Chats */}
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

// --- ESTILOS (Com estilos para iniciais) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginLeft: 85, // (15 padding + 55 avatar + 15 margem)
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

// Certifique-se que o nome do componente exportado aqui
// corresponde ao nome usado na importação no seu AppNavigator.js
export default ChatListScreen;