import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image, // Mantido para ChatListItem, mesmo que header use iniciais
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import { db } from '../../firebaseconfig'; // Ajuste o caminho
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // Ícone para erro
import IconFA5 from 'react-native-vector-icons/FontAwesome5'; // Ícone para logout

// --- TEMA ---
const theme = { /* ... */ colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#999', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', onlineStatus: '#FF69B4', unreadBadge: '#FF69B4', initialsBackground: '#FCE4EC', iconColor: '#666', error: '#D32F2F'}, fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' } };

// --- Função auxiliar para formatar timestamp ---
const formatLastMessageTimestamp = (timestamp) => { /* ... */ }; // Mantida

// --- COMPONENTE DO ITEM DA LISTA DE CHAT ---
const ChatListItem = React.memo(({ item, onPress, currentUserId }) => {
    const patient = item.otherParticipant;
    const name = patient?.name || 'Paciente Desconhecido';
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const lastMessage = item.lastMessage;
    const lastMessageText = lastMessage?.text || '';
    const timestamp = formatLastMessageTimestamp(lastMessage?.createdAt);
    // --- CORREÇÃO AQUI: Verificar se currentUserId existe ---
    const prefix = lastMessage?.senderId === currentUserId ? 'Eu: ' : '';
    const displayMessage = `${prefix}${lastMessageText}`;

    return (
        <TouchableOpacity style={styles.chatItemContainer} activeOpacity={0.6} onPress={() => onPress(item)}>
            <View style={styles.avatarContainer}>
                <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{initial}</Text>
                </View>
                 {/* Adicionar lógica online depois, se necessário */}
                 {/* {patient?.isOnline && <View style={styles.onlineIndicator} />} */}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.patientName}>{name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">{displayMessage}</Text>
            </View>
            <View style={styles.metaContainer}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                 {/* Adicionar lógica não lidos depois, se necessário */}
                 {/* {item.unreadCount > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadCountText}>{item.unreadCount}</Text></View>} */}
            </View>
        </TouchableOpacity>
    );
});


// --- TELA PRINCIPAL DA LISTA DE CHATS (Médico) ---
function ChatListScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth(); // Pega user e logout
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // --- CORREÇÃO AQUI: Adicionada verificação inicial ---
    if (!user?.uid) {
      console.log("ChatList (Médico): Usuário não logado ou UID indisponível.");
      setChatList([]); // Limpa a lista
      setLoading(false); // Para de carregar
      // Não retorna um listener se não houver usuário
      return () => {}; // Retorna função vazia para limpeza
    }
    // --- Fim da Correção ---

    setLoading(true);
    setError(null);
    const doctorUid = user.uid;
    console.log(`ChatList (Médico): Buscando chats para ${doctorUid}`);

    const chatsRef = collection(db, 'chats');
    const q = query( chatsRef, where('participants', 'array-contains', doctorUid), orderBy('lastMessage.createdAt', 'desc') );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        // ... (lógica interna do snapshot mantida) ...
        console.log(`ChatList (Médico): Snapshot recebido...`);
        const chats = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data(); const chatId = doc.id;
            if (!data.participants || !data.participantInfo || !data.lastMessage) { console.warn(`Chat ${chatId} incompleto.`); return; }
            const patientUid = data.participants.find(uid => uid !== doctorUid);
            if (patientUid && data.participantInfo[patientUid]) {
                chats.push({ id: chatId, otherParticipant: { id: patientUid, ...data.participantInfo[patientUid] }, lastMessage: data.lastMessage });
            } else { console.warn(`Dados paciente não encontrados chat ${chatId}.`); }
        });
        console.log(`ChatList (Médico): Lista final ${chats.length} conversas.`);
        setChatList(chats); setLoading(false);
    }, (err) => {
        console.error("ChatList (Médico): Erro:", err);
        setError(err.code === 'permission-denied' ? "Permissão negada." : "Erro ao carregar conversas.");
        setLoading(false);
    });

    return () => { console.log("ChatList (Médico): Desinscrevendo."); unsubscribe(); };
    // A dependência user?.uid garante que o efeito re-execute se o usuário mudar (login/logout)
  }, [user?.uid]);

  const handlePressChat = useCallback((chatItem) => {
    // ... (lógica mantida)
    const patient = chatItem.otherParticipant;
    if (!patient?.id || !patient?.name) { Alert.alert("Erro", "Dados inválidos."); return; }
    navigation.navigate('ChatScreen', { doctorId: patient.id, doctorName: patient.name, doctorImage: patient.imageUrl });
  }, [navigation]);

  // --- CORREÇÃO AQUI: Verifica user.uid antes de passar para o item ---
  const renderItem = useCallback(({ item }) => (
    <ChatListItem
        item={item}
        onPress={handlePressChat}
        currentUserId={user?.uid ?? null} // Passa null se user não existir
    />
  ), [handlePressChat, user?.uid]); // Depende do user.uid

  const renderSeparator = () => <View style={styles.separator} />;
  const handleLogout = () => { /* ... (lógica mantida) ... */ Alert.alert( "Sair", "Tem certeza?", [{ text: "Não", style: "cancel" }, { text: "Sim", onPress: async () => { try { await logout(); } catch (error) { console.error(error); Alert.alert("Erro", "Falha ao sair."); }}, style: 'destructive' }], { cancelable: true }); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconFA5 name="sign-out-alt" size={24} color={theme.colors.iconColor} />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && ( <View style={styles.centeredContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View> )}
      {/* Erro */}
      {error && !loading && (
           <View style={styles.centeredContainer}>
             <Icon name="alert-circle-outline" size={40} color={theme.colors.error} style={{marginBottom: 10}}/>
             <Text style={styles.errorText}>{error}</Text>
           </View>
      )}
      {/* Lista */}
      {/* --- CORREÇÃO AQUI: Renderiza a lista apenas se tiver usuário --- */}
      {!loading && !error && user?.uid && (
          <FlatList
            data={chatList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>Nenhuma conversa.</Text><Text style={styles.emptyListSubText}>Aguarde contato.</Text></View> }
          />
      )}
      {/* Mensagem se não houver usuário (pós-logout, antes da navegação) */}
      {!user?.uid && !loading && (
          <View style={styles.centeredContainer}>
              <Text style={styles.emptyListText}>Sessão encerrada.</Text>
          </View>
      )}

    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.cardBackground },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
  headerTitle: { fontSize: 24, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '700', color: theme.colors.text },
  logoutButton: { padding: 5 },
  listContainer: { paddingBottom: 20, flexGrow: 1 },
  chatItemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: theme.colors.cardBackground },
  avatarContainer: { marginRight: 15, position: 'relative' },
  initialsCircle: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.initialsBackground, justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 22, fontFamily: theme.fonts.bold, fontWeight: 'bold', color: theme.colors.primary },
  onlineIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.onlineStatus, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: theme.colors.cardBackground },
  textContainer: { flex: 1, justifyContent: 'center' },
  patientName: { fontSize: 16, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.text, marginBottom: 3 },
  lastMessage: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textSecondary },
  metaContainer: { alignItems: 'flex-end', marginLeft: 10 },
  timestamp: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, marginBottom: 5 },
  unreadBadge: { backgroundColor: theme.colors.unreadBadge, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadCountText: { fontSize: 12, fontFamily: theme.fonts.bold, fontWeight: 'bold', color: theme.colors.white },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: 85 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: theme.colors.error, textAlign: 'center'},
  emptyListContainer: { flexGrow: 1, marginTop: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyListText: { fontSize: 18, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  emptyListSubText: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, textAlign: 'center' }
});

export default ChatListScreen;