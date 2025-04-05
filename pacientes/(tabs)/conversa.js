import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  StatusBar,
  Platform,
} from 'react-native';

// --- TEMA (Ajustado para Padrão Rosa) ---
const theme = {
  colors: {
    primary: '#FF69B4', // Cor Rosa Principal
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#999',
    background: '#f7f7f7', // Fundo geral ligeiramente cinza
    border: '#eee',
    cardBackground: '#fff', // Fundo dos itens da lista e cabeçalho
    onlineStatus: '#FF69B4', // <<< Alterado para Rosa Principal
    unreadBadge: '#FF69B4', // <<< Alterado para Rosa Principal
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE DOS MÉDICOS (Mesma estrutura) ---
const chatListData = [
    { id: '1', name: 'Dra. Sofia Alves', specialty: 'Ginecologista e Obstetra', imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg', lastMessage: 'Olá! Como posso ajudar hoje?', timestamp: '10:45', unreadCount: 2, isOnline: true },
    { id: '2', name: 'Dr. Ricardo Mendes', specialty: 'Mastologista', imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg', lastMessage: 'Resultados dos exames chegaram.', timestamp: 'Ontem', unreadCount: 0, isOnline: false },
    { id: '3', name: 'Dra. Carolina Pinto', specialty: 'Especialista em Fertilidade', imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg', lastMessage: 'Agendamento confirmado para sexta.', timestamp: '15/07', unreadCount: 0, isOnline: true },
    { id: '4', name: 'Dr. André Faria', specialty: 'Uroginecologista', imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg', lastMessage: 'Perfeito, obrigado!', timestamp: '14/07', unreadCount: 1, isOnline: false }, // <= Exemplo com não lidas
    { id: '5', name: 'Dra. Beatriz Costa', specialty: 'Endocrinologia Ginecológica', imageUrl: 'https://randomuser.me/api/portraits/women/5.jpg', lastMessage: 'Você enviou a receita?', timestamp: '13/07', unreadCount: 0, isOnline: false },
    { id: '7', name: 'Dra. Inês Pereira', specialty: 'Sexologia Clínica', imageUrl: 'https://randomuser.me/api/portraits/women/7.jpg', lastMessage: 'Podemos marcar uma consulta online.', timestamp: '11:30', unreadCount: 0, isOnline: true }, // <= Exemplo online
    // Adicione mais médicos se necessário
];

// --- COMPONENTE DO ITEM DA LISTA DE CHAT (Sem alterações na lógica) ---
const ChatListItem = React.memo(({ item, onPress }) => (
    <TouchableOpacity
        style={styles.chatItemContainer}
        activeOpacity={0.6}
        onPress={() => onPress(item)}
    >
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.profileImage}
            />
            {/* Indicador de Online (Agora Rosa) */}
            {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.textContainer}>
            <Text style={styles.doctorName}>{item.name}</Text>
            <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                {item.lastMessage}
            </Text>
        </View>

        <View style={styles.metaContainer}>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {/* Badge de Não Lidas (Agora Rosa) */}
            {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
));

// --- COMPONENTE DA TELA DE LISTA DE CHATS (Sem alterações na lógica) ---
function ChatListScreen({ navigation }) {

  const handlePressChat = (doctor) => {
    console.log("Abrir chat com:", doctor.name);
    // Navegação para a tela de chat individual
    // navigation.navigate('ChatScreen', { doctorId: doctor.id, doctorName: doctor.name, doctorImage: doctor.imageUrl });
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
        {/* Poderia adicionar um botão de nova conversa com ícone rosa aqui */}
        {/* <TouchableOpacity>
            <Icon name="plus-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity> */}
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
              <Text style={styles.emptyListSubText}>Encontre um especialista e comece a conversar.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// --- ESTILOS (Cores de onlineIndicator e unreadBadge agora usam theme.colors atualizado) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground, // Fundo branco predominante
  },
  header: {
    flexDirection: 'row', // Para alinhar título e possíveis ícones
    justifyContent: 'space-between', // Alinha título à esquerda e ícones à direita
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
  imageContainer: {
    marginRight: 15,
    position: 'relative',
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: theme.colors.border,
  },
  onlineIndicator: { // <-- Estilo usa a cor do tema
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.onlineStatus, // Usa a cor rosa definida no tema
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.colors.cardBackground, // Contorno branco
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
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
  unreadBadge: { // <-- Estilo usa a cor do tema
    backgroundColor: theme.colors.unreadBadge, // Usa a cor rosa definida no tema
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
    color: theme.colors.white, // Texto branco sobre fundo rosa para contraste
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 85, // (15 padding + 55 imagem + 15 margem)
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