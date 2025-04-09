import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import { db } from '../../firebaseconfig'; // Ajuste o caminho
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // <<< IMPORTADO O ÍCONE >>>

// --- TEMA ---
const theme = {
  colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#999', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', onlineStatus: '#FF69B4', unreadBadge: '#FF69B4', error: '#D32F2F'},
  fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' }
};

// --- Função auxiliar para formatar timestamp ---
const formatLastMessageTimestamp = (timestamp) => {
    if (!(timestamp instanceof Timestamp)) return '';
    const messageDate = timestamp.toDate();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === now.toDateString()) return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (messageDate.toDateString() === yesterday.toDateString()) return 'Ontem';
    return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

// --- COMPONENTE DO ITEM DA LISTA ---
const ChatListItem = React.memo(({ item, onPress }) => {
    const { otherParticipant, lastMessage } = item;
    const name = otherParticipant?.name || 'Desconhecido';
    const imageUrl = otherParticipant?.imageUrl || 'https://via.placeholder.com/55';
    const lastMessageText = lastMessage?.text || '';
    const timestamp = formatLastMessageTimestamp(lastMessage?.createdAt);
    // const unreadCount = item.unreadCount || 0; // Implementar depois
    // const isOnline = otherParticipant?.isOnline || false; // Implementar depois

    return (
        <TouchableOpacity style={styles.chatItemContainer} activeOpacity={0.6} onPress={() => onPress(item)}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.profileImage} />
                {/* {isOnline && <View style={styles.onlineIndicator} />} */}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.participantName}>{name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">{lastMessageText}</Text>
            </View>
            <View style={styles.metaContainer}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                {/* {unreadCount > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadCountText}>{unreadCount}</Text></View>} */}
            </View>
        </TouchableOpacity>
    );
});


// --- TELA PRINCIPAL DA LISTA DE CHATS ---
function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth(); // Pega o usuário logado
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      console.log("ChatList: Usuário não logado.");
      setChatList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`ChatList: Buscando chats para usuário ${user.uid}`);

    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessage.createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`ChatList: Snapshot recebido, ${querySnapshot.empty ? 'vazio' : querySnapshot.size + ' docs'}.`);
      const chats = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          const chatId = doc.id;
          console.log(`ChatList: Processando chat ${chatId}`);

          if (!data.participants || !data.participantInfo || !data.lastMessage) {
              console.warn(`ChatList: Chat ${chatId} com dados incompletos, pulando.`);
              return;
          }

          const participants = data.participants;
          const otherParticipantUid = participants.find(uid => uid !== user.uid);

          if (otherParticipantUid && data.participantInfo[otherParticipantUid]) {
              chats.push({
                  id: chatId,
                  otherParticipant: { id: otherParticipantUid, ...data.participantInfo[otherParticipantUid] },
                  lastMessage: data.lastMessage,
              });
          } else {
              console.warn(`ChatList: Não foi possível encontrar dados do outro participante para o chat ${chatId}.`, data.participantInfo);
          }
      });
      console.log(`ChatList: Lista final montada com ${chats.length} conversas.`);
      setChatList(chats);
      setLoading(false);
    }, (err) => {
        console.error("ChatList: Erro ao buscar lista de chats:", err);
        if (err.code === 'permission-denied') { setError("Permissão negada para ver as conversas."); }
        else { setError("Não foi possível carregar suas conversas."); }
        setLoading(false);
    });

    return () => { console.log("ChatList: Desinscrevendo listener."); unsubscribe(); };
  }, [user?.uid]);

  // Navega para a tela de chat individual
  const handlePressChat = useCallback((chatItem) => {
    const contact = chatItem.otherParticipant;
    if (!contact || !contact.id || !contact.name) { Alert.alert("Erro", "Dados do contato inválidos."); return; }
    navigation.navigate('ChatScreen', {
        doctorId: contact.id,
        doctorName: contact.name,
        doctorImage: contact.imageUrl
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <ChatListItem item={item} onPress={handlePressChat} />
  ), [handlePressChat]);

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        {/* Exemplo de ícone que PODE ser adicionado:
        <TouchableOpacity onPress={() => alert('Nova Conversa')}>
            <Icon name="add-circle-outline" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        */}
      </View>

      {/* Loading */}
       {loading && (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
       )}
      {/* Erro */}
       {error && !loading && (
           <View style={styles.centeredContainer}>
             {/* <<< USA O ÍCONE IMPORTADO >>> */}
             <Icon name="alert-circle-outline" size={40} color={theme.colors.error} style={{marginBottom: 10}}/>
             <Text style={styles.errorText}>{error}</Text>
           </View>
       )}

      {/* Lista */}
      {!loading && !error && (
          <FlatList
            data={chatList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Nenhuma conversa.</Text>
                  <Text style={styles.emptyListSubText}>Inicie uma conversa pela lista de especialistas.</Text>
              </View>
            }
          />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.cardBackground },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
  headerTitle: { fontSize: 24, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '700', color: theme.colors.text },
  listContainer: { paddingBottom: 20, flexGrow: 1 },
  chatItemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: theme.colors.cardBackground },
  imageContainer: { marginRight: 15, position: 'relative' },
  profileImage: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.border },
  onlineIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.onlineStatus, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: theme.colors.cardBackground },
  textContainer: { flex: 1, justifyContent: 'center' },
  participantName: { fontSize: 16, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.text, marginBottom: 3 },
  lastMessage: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textSecondary },
  metaContainer: { alignItems: 'flex-end', marginLeft: 10 },
  timestamp: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, marginBottom: 5 },
  unreadBadge: { backgroundColor: theme.colors.unreadBadge, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadCountText: { fontSize: 12, fontFamily: theme.fonts.bold, fontWeight: 'bold', color: theme.colors.white },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: 85 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, // Usado para Loading/Erro
  errorText: { fontSize: 16, color: theme.colors.error, textAlign: 'center'}, // Cor de erro para texto
  emptyListContainer: { flexGrow: 1, marginTop: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyListText: { fontSize: 18, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  emptyListSubText: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, textAlign: 'center' }
});

export default ChatListScreen;