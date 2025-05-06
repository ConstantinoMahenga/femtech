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
  Alert, // Alert já está importado, ótimo!
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import { db } from '../../firebaseconfig'; // Ajuste o caminho
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    getDoc,
    GeoPoint
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';

// --- TEMA ---
const theme = { colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#999', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', onlineStatus: '#FF69B4', unreadBadge: '#FF69B4', initialsBackground: '#FCE4EC', iconColor: '#666', error: '#D32F2F', groupChatBackground: '#E0F7FA', infoBanner: '#FFF9C4'}, fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' } };

// --- Função auxiliar para formatar timestamp ---
const formatLastMessageTimestamp = (timestamp) => { if (!(timestamp instanceof Timestamp)) return ''; const messageDate = timestamp.toDate(); const now = new Date(); const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1); if (messageDate.toDateString() === now.toDateString()) return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); if (messageDate.toDateString() === yesterday.toDateString()) return 'Ontem'; return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };

// --- COMPONENTE ChatListItem ---
const ChatListItem = React.memo(({ item, onPress, currentUserId }) => {
    const patient = item.otherParticipant;
    const name = patient?.name || 'Paciente Desconhecido';
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const lastMessage = item.lastMessage;
    const lastMessageText = lastMessage?.text || '';
    const timestamp = formatLastMessageTimestamp(lastMessage?.createdAt);
    const prefix = lastMessage?.senderId === currentUserId ? 'Eu: ' : '';
    const displayMessage = `${prefix}${lastMessageText}`;
    return (
        <TouchableOpacity style={styles.chatItemContainer} activeOpacity={0.6} onPress={() => onPress(item)}>
            <View style={styles.avatarContainer}>
                {patient?.imageUrl ? ( <Image source={{ uri: patient.imageUrl }} style={styles.profileImage} /> ) : ( <View style={styles.initialsCircle}><Text style={styles.initialsText}>{initial}</Text></View> )}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.patientName}>{name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">{displayMessage}</Text>
            </View>
            <View style={styles.metaContainer}>
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
        </TouchableOpacity>
    );
});

// --- TELA PRINCIPAL DA LISTA DE CHATS (Médico) ---
function ChatListScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [loadingIndividualChats, setLoadingIndividualChats] = useState(true);
  const [errorLoadingChats, setErrorLoadingChats] = useState(null);

  // Estados para chat de grupo (elegibilidade simplificada)
  const [userCoords, setUserCoords] = useState(null);
  const [isEligibleForGroupChat, setIsEligibleForGroupChat] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // --- Efeito para Buscar Perfil e Definir Elegibilidade SIMPLIFICADA ---
  useEffect(() => {
    // ... (lógica interna sem alterações) ...
    let isMounted = true; setLoadingProfile(true); setProfileError(null);
    setIsEligibleForGroupChat(false); setUserCoords(null);
    if (!user?.uid) { console.log("ChatList (Médico): Usuário não logado."); setLoadingProfile(false); return; }
    const fetchDoctorProfile = async () => {
      console.log(`ChatList (Médico): Buscando perfil (para elegibilidade simplificada) ${user.uid}`);
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (!isMounted) return;
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData?.address?.coordinates instanceof GeoPoint) {
             setUserCoords(userData.address.coordinates); setIsEligibleForGroupChat(true);
             console.log("ChatList (Médico): Coordenadas encontradas, habilitando chat de grupo (lógica simplificada).");
             setProfileError(null);
          } else { setProfileError("Complete seu endereço no perfil para ver o Chat Próximo."); setIsEligibleForGroupChat(false); }
        } else { setProfileError("Perfil não encontrado."); setIsEligibleForGroupChat(false); }
      } catch (error) { console.error("ChatList (Médico): Erro ao buscar perfil:", error); if(isMounted) { setProfileError("Erro ao verificar seu perfil."); setIsEligibleForGroupChat(false); }
      } finally { if(isMounted) { setLoadingProfile(false); } }
    };
    fetchDoctorProfile();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // --- Efeito para buscar Chats INDIVIDUAIS ---
  useEffect(() => {
    // ... (lógica interna sem alterações) ...
    if (!user?.uid || loadingProfile) { setLoadingIndividualChats(loadingProfile); return () => {}; }
    setLoadingIndividualChats(true); setErrorLoadingChats(null);
    const doctorUid = user.uid; console.log(`ChatList (Médico): Buscando chats individuais para ${doctorUid}`);
    const chatsRef = collection(db, 'chats');
    const q = query( chatsRef, where('participants', 'array-contains', doctorUid), orderBy('lastMessage.createdAt', 'desc') );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chats = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data(); const chatId = doc.id;
            if (chatId === 'GROUP_CHAT_NEARBY_5KM' || data.isGroup === true) return;
            if (!data.participants || !data.participantInfo || !data.lastMessage) { console.warn(`Chat ${chatId} incompleto.`); return; }
            const patientUid = data.participants.find(uid => uid !== doctorUid);
            if (patientUid && data.participantInfo[patientUid]) { chats.push({ id: chatId, otherParticipant: { id: patientUid, ...data.participantInfo[patientUid] }, lastMessage: data.lastMessage });
            } else { console.warn(`Dados paciente não encontrados chat ${chatId}.`); }
        });
        setChatList(chats); setLoadingIndividualChats(false);
    }, (err) => { console.error("ChatList (Médico): Erro chats individuais:", err); setErrorLoadingChats(err.code === 'permission-denied' ? "Permissão negada." : "Erro ao carregar conversas."); setLoadingIndividualChats(false); });
    return () => { unsubscribe(); };
  }, [user?.uid, loadingProfile]);

  // --- Handlers ---
  const handlePressChat = useCallback((chatItem) => { const patient = chatItem.otherParticipant; if (!patient?.id || !patient?.name) { Alert.alert("Erro", "Dados inválidos."); return; } navigation.navigate('ChatScreen', { doctorId: patient.id, doctorName: patient.name, doctorImage: patient.imageUrl }); }, [navigation]);

  // --- MODIFICADO: handlePressGroupChat agora mostra o Alert ---
  const handlePressGroupChat = useCallback(() => {
      Alert.alert(
          "Entrar na Comunidade?", // Título do Alerta
          "Aqui a conversa será pública e todos terão acesso à conversa e ao seu nome.", // Mensagem do Alerta
          [
              // Botão "Não"
              {
                  text: "Não",
                  onPress: () => console.log("Usuário cancelou a entrada na comunidade."), // Ação opcional
                  style: "cancel" // Estilo padrão de cancelamento (no iOS fica à esquerda ou destacado)
              },
              // Botão "Sim"
              {
                  text: "Sim",
                  onPress: () => {
                      console.log("Usuário confirmou, navegando para GroupChatScreen...");
                      // Navega para a tela de grupo APENAS se clicar em "Sim"
                      navigation.navigate('GroupChatScreen', { userCoords: userCoords });
                  }
                  // style: 'destructive' // Use se a ação for perigosa (não é o caso aqui)
              }
          ],
          { cancelable: true } // Permite fechar o alerta tocando fora (no Android)
      );
  }, [navigation, userCoords]); // Dependências: navigation e userCoords

  const handleLogout = () => { Alert.alert( "Sair", "Tem certeza?", [{ text: "Não", style: "cancel" }, { text: "Sim", onPress: async () => { try { await logout(); } catch (error) { console.error(error); Alert.alert("Erro", "Falha ao sair."); }}, style: 'destructive' }], { cancelable: true }); };
  const renderItem = useCallback(({ item }) => ( <ChatListItem item={item} onPress={handlePressChat} currentUserId={user?.uid ?? null} /> ), [handlePressChat, user?.uid]);
  const renderSeparator = () => <View style={styles.separator} />;

  // --- Renderiza item do Chat de Grupo ---
  const renderGroupChatItem = () => {
      if (loadingProfile || !isEligibleForGroupChat) return null;
      // O onPress agora chama a função modificada com o Alert
      return (
          <View>
              <TouchableOpacity style={[styles.chatItemContainer, styles.groupChatItemContainer]} activeOpacity={0.7} onPress={handlePressGroupChat}>
                  <View style={styles.avatarContainer}><View style={styles.groupIconContainer}><Icon name="people-circle-outline" size={35} color={theme.colors.primary} /></View></View>
                  <View style={styles.textContainer}>
                      <Text style={styles.patientName}>Comunidade (Área)</Text>{/* Nome ajustado */}
                      <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">Converse com pessoas na sua área</Text>
                  </View>
                  <View style={styles.metaContainer}><Icon name="chevron-forward-outline" size={22} color={theme.colors.textMuted} /></View>
              </TouchableOpacity>
              <View style={styles.fullSeparator} />
          </View>
       );
  };

  // Loading combinado
  const isLoading = loadingProfile || loadingIndividualChats;
  // Erro combinado
  const combinedError = profileError || errorLoadingChats;

  // --- Renderização Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconFA5 name="sign-out-alt" size={24} color={theme.colors.iconColor} />
        </TouchableOpacity>
      </View>

      {!loadingProfile && profileError && ( <View style={styles.infoBanner}><Icon name="information-circle-outline" size={18} color={theme.colors.textSecondary} style={{marginRight: 8}}/><Text style={styles.infoBannerText}>{profileError}</Text></View> )}
      {isLoading && ( <View style={styles.centeredContainer}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.loadingText}>{loadingProfile ? 'Verificando perfil...' : 'Carregando...'}</Text></View> )}
      {!isLoading && combinedError && !profileError && ( <View style={styles.centeredContainer}><Icon name="cloud-offline-outline" size={40} color={theme.colors.error} style={{marginBottom: 10}}/><Text style={styles.errorText}>{combinedError}</Text></View> )}
      {!isLoading && !combinedError && user?.uid && (
          <FlatList
            ListHeaderComponent={renderGroupChatItem}
            data={chatList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ chatList.length === 0 ? ( <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>Nenhuma conversa individual.</Text><Text style={styles.emptyListSubText}>Aguarde o contato.</Text></View> ) : null }
          />
      )}
      {!user?.uid && !isLoading && ( <View style={styles.centeredContainer}><Text style={styles.emptyListText}>Sessão encerrada.</Text></View> )}

    </SafeAreaView>
  );
}

// --- ESTILOS ---
// Use os estilos completos da versão anterior
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.cardBackground },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
    headerTitle: { fontSize: 24, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '700', color: theme.colors.text },
    logoutButton: { padding: 5 },
    listContainer: { paddingBottom: 20, flexGrow: 1 },
    chatItemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: theme.colors.cardBackground },
    avatarContainer: { marginRight: 15, position: 'relative' },
    profileImage: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.border },
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
    groupChatItemContainer: { backgroundColor: theme.colors.groupChatBackground },
    groupIconContainer: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    fullSeparator: { height: 1, backgroundColor: theme.colors.border },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, fontSize: 14, color: theme.colors.textSecondary },
    errorText: { fontSize: 16, color: theme.colors.error, textAlign: 'center'},
    emptyListContainer: { flexGrow: 1, marginTop: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    emptyListText: { fontSize: 18, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 8 },
    emptyListSubText: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textMuted, textAlign: 'center' },
    infoBanner: { backgroundColor: theme.colors.infoBanner, paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    infoBannerText: { color: theme.colors.textSecondary, fontSize: 13, fontFamily: theme.fonts.regular, flexShrink: 1, marginLeft: 8 },
});

export default ChatListScreen;