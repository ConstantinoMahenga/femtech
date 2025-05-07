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
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseconfig'; 
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    getDoc,
    getDocs, 
    GeoPoint
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

// --- TEMA ---
const theme = { colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#999', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', onlineStatus: '#FF69B4', unreadBadge: '#FF69B4', initialsBackground: '#E3F2FD', iconColor: '#666', error: '#D32F2F', groupChatBackground: '#E0F7FA', infoBanner: '#FFF9C4'}, fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' } };

// --- Função auxiliar para formatar timestamp ---
const formatLastMessageTimestamp = (timestamp) => { if (!(timestamp instanceof Timestamp)) return ''; const messageDate = timestamp.toDate(); const now = new Date(); const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1); if (messageDate.toDateString() === now.toDateString()) return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); if (messageDate.toDateString() === yesterday.toDateString()) return 'Ontem'; return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };

// --- Função Haversine (mantida) ---
const calculateDistance = (coords1, coords2) => { if (!coords1 || !coords2) return Infinity; const toRad = (value) => (value * Math.PI) / 180; const R = 6371; const dLat = toRad(coords2.latitude - coords1.latitude); const dLon = toRad(coords2.longitude - coords1.longitude); const lat1 = toRad(coords1.latitude); const lat2 = toRad(coords2.latitude); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); const distance = R * c; return distance; };

// --- COMPONENTE ChatListItem (RETIFICADO ESTRUTURA JSX) ---
const ChatListItem = React.memo(({ item, onPress, currentUserId }) => {
    const otherParticipant = item.otherParticipant;
    const name = otherParticipant?.name || 'Usuário Desconhecido';
    const imageUrl = otherParticipant?.imageUrl;
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const lastMessage = item.lastMessage;
    const lastMessageText = lastMessage?.text || '';
    const timestamp = formatLastMessageTimestamp(lastMessage?.createdAt);
    const prefix = lastMessage?.senderId === currentUserId ? 'Eu: ' : '';
    const displayMessage = `${prefix}${lastMessageText}`;

    return (
       
        <TouchableOpacity style={styles.chatItemContainer} activeOpacity={0.6} onPress={() => onPress(item)}>
            <View style={styles.avatarContainer}>
                {imageUrl ? (<Image source={{ uri: imageUrl }} style={styles.profileImage} />) : (<View style={[styles.initialsCircle, styles.userInitialsCircle]}><Text style={[styles.initialsText, styles.userInitialsText]}>{initial}</Text></View>)}
            </View><View style={styles.textContainer}>
                <Text style={styles.participantName}>{String(name)}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">{String(displayMessage)}</Text>
            </View><View style={styles.metaContainer}>
                <Text style={styles.timestamp}>{String(timestamp)}</Text>
            </View>
        </TouchableOpacity>
        // <<< FIM DA RETIFICAÇÃO >>>
    );
});

// --- TELA PRINCIPAL DA LISTA DE CHATS (Usuário Geral/Paciente) ---
function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth(); // Removido logout se não usar
  const [chatList, setChatList] = useState([]);
  const [loadingIndividualChats, setLoadingIndividualChats] = useState(true);
  const [errorLoadingChats, setErrorLoadingChats] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [isEligibleForGroupChat, setIsEligibleForGroupChat] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingNearbyCheck, setLoadingNearbyCheck] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [nearbyError, setNearbyError] = useState(null);

  // <<< Definição do raio >>>
  const NEARBY_RADIUS_KM = 5.0;

  // --- Efeito 1: Buscar Perfil do Usuário Logado ---
  useEffect(() => {
    // ... (lógica interna sem alterações) ...
    let isMounted = true; setLoadingProfile(true); setProfileError(null); setUserCoords(null); setIsEligibleForGroupChat(false);
    if (!user?.uid) { console.log("ChatList: Usuário não logado."); setLoadingProfile(false); return; }
    const fetchUserProfile = async () => {
        console.log(`ChatList: Buscando perfil ${user.uid}`); const userDocRef = doc(db, 'users', user.uid);
        try { const userDocSnap = await getDoc(userDocRef); if (!isMounted) return; if (userDocSnap.exists()) { const userData = userDocSnap.data(); if (userData?.address?.coordinates instanceof GeoPoint) { setUserCoords(userData.address.coordinates); console.log("ChatList: Coords próprias encontradas."); setProfileError(null); } else { setProfileError("Complete seu endereço no perfil para ver a Comunidade."); } } else { setProfileError("Perfil não encontrado."); }
        } catch (error) { console.error("ChatList: Erro ao buscar perfil:", error); if(isMounted) { setProfileError("Erro ao verificar seu perfil."); }
        } finally { if(isMounted) { setLoadingProfile(false); } } };
    fetchUserProfile(); return () => { isMounted = false; };
  }, [user?.uid]);

  // --- Efeito 2: Verificar Proximidade ---
  useEffect(() => {
    // ... (lógica interna sem alterações) ...
    if (!userCoords || !user?.uid || loadingProfile) { if(!loadingProfile && !userCoords) setIsEligibleForGroupChat(false); return; }
    let isMounted = true; setLoadingNearbyCheck(true); setNearbyError(null); setIsEligibleForGroupChat(false);
    console.log("ChatList: Iniciando verificação de proximidade..."); 
    const checkNearbyUsers = async () => {
        try { const usersCollectionRef = collection(db, 'users'); const querySnapshot = await getDocs(usersCollectionRef); if (!isMounted) return; let foundNearby = false; console.log(`ChatList: Verificando proximidade com ${querySnapshot.size - 1} outros usuários.`);
            for (const docSnap of querySnapshot.docs) { if (docSnap.id === user.uid) continue; const otherUserData = docSnap.data(); const otherCoords = otherUserData?.address?.coordinates; if (otherCoords instanceof GeoPoint) { const distance = calculateDistance(userCoords, otherCoords); if (distance <= NEARBY_RADIUS_KM) { console.log(`ChatList: Usuário ${docSnap.id} encontrado dentro de ${NEARBY_RADIUS_KM}km!`); foundNearby = true; break; } } }
            setIsEligibleForGroupChat(foundNearby); if (!foundNearby) { console.log(`ChatList: Nenhum usuário encontrado nos ${NEARBY_RADIUS_KM}km.`); }
        } catch (error) { console.error("ChatList: Erro ao buscar/verificar usuários próximos:", error); if (isMounted) { setNearbyError("Erro ao verificar proximidade."); setIsEligibleForGroupChat(false); }
        } finally { if (isMounted) { setLoadingNearbyCheck(false); } } };
    checkNearbyUsers(); return () => { isMounted = false; };
  }, [userCoords, user?.uid, loadingProfile, NEARBY_RADIUS_KM]);

  // --- Efeito 3: Buscar Chats Individuais ---
  useEffect(() => {
    // ... (lógica interna sem alterações) ...
    if (!user?.uid || loadingProfile) { setLoadingIndividualChats(loadingProfile); return () => {}; }
    setLoadingIndividualChats(true); setErrorLoadingChats(null); const currentUserId = user.uid; console.log(`ChatList: Buscando chats individuais para ${currentUserId}`); const chatsRef = collection(db, 'chats'); const q = query( chatsRef, where('participants', 'array-contains', currentUserId), orderBy('lastMessage.createdAt', 'desc') ); const unsubscribe = onSnapshot(q, (querySnapshot) => { const chats = []; querySnapshot.forEach((doc) => { const data = doc.data(); const chatId = doc.id; if (chatId === 'GROUP_CHAT_NEARBY_5KM' || data.isGroup === true) return; if (!data.participants || !data.participantInfo || !data.lastMessage) { console.warn(`Chat ${chatId} incompleto.`); return; } const otherParticipantUid = data.participants.find(uid => uid !== currentUserId); if (otherParticipantUid && data.participantInfo[otherParticipantUid]) { chats.push({ id: chatId, otherParticipant: { id: otherParticipantUid, ...data.participantInfo[otherParticipantUid] }, lastMessage: data.lastMessage }); } else { console.warn(`Dados do outro participante não encontrados chat ${chatId}.`); } }); setChatList(chats); setLoadingIndividualChats(false); }, (err) => { console.error("ChatList: Erro chats individuais:", err); setErrorLoadingChats(err.code === 'permission-denied' ? "Permissão negada." : "Erro ao carregar conversas."); setLoadingIndividualChats(false); }); return () => { unsubscribe(); };
  }, [user?.uid, loadingProfile]);

  // --- Handlers ---
  const handlePressChat = useCallback((chatItem) => { const contact = chatItem.otherParticipant; if (!contact?.id || !contact?.name) { Alert.alert("Erro", "Dados inválidos."); return; } navigation.navigate('ChatScreen', { doctorId: contact.id, doctorName: contact.name, doctorImage: contact.imageUrl }); }, [navigation]);
  const handlePressGroupChat = useCallback(() => { Alert.alert( "Entrar na Comunidade?", "Aqui a conversa será pública e todos terão acesso à conversa e ao seu nome.", [ { text: "Não", style: "cancel" }, { text: "Sim", onPress: () => { console.log("Confirmou, navegando para GroupChatScreen..."); navigation.navigate('GroupChatScreen', { userCoords: userCoords }); } } ], { cancelable: true } ); }, [navigation, userCoords]);
  // Removido handleLogout se não houver botão
  const renderItem = useCallback(({ item }) => ( <ChatListItem item={item} onPress={handlePressChat} currentUserId={user?.uid ?? null} /> ), [handlePressChat, user?.uid]);
  const renderSeparator = () => <View style={styles.separator} />;

  // --- Renderiza item do Chat de Grupo (RETIFICADO ESTRUTURA JSX) ---
  const renderGroupChatItem = () => {
      if (loadingProfile || loadingNearbyCheck || !isEligibleForGroupChat) return null;
      return (
          // <<< RETIFICAÇÃO: Remove espaços/quebras de linha entre os Views filhos >>>
          <View>
              <TouchableOpacity style={[styles.chatItemContainer, styles.groupChatItemContainer]} activeOpacity={0.7} onPress={handlePressGroupChat}>
                  <View style={styles.avatarContainer}><View style={styles.groupIconContainer}><Icon name="people-circle-outline" size={35} color={theme.colors.primary} /></View></View>
                  <View style={styles.textContainer}><Text style={styles.participantName}>Comunidade Próxima ({NEARBY_RADIUS_KM}km)</Text><Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">Converse com pessoas na sua área</Text></View>
                  <View style={styles.metaContainer}><Icon name="chevron-forward-outline" size={22} color={theme.colors.textMuted} /></View>
              </TouchableOpacity>
              <View style={styles.fullSeparator} />
          </View>
          // <<< FIM DA RETIFICAÇÃO >>>
       );
  };

  // --- Renderização Principal (lógica combinada de loading/erro mantida) ---
  const isLoading = loadingProfile || loadingNearbyCheck || loadingIndividualChats;
  const combinedError = profileError || nearbyError || errorLoadingChats;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        {/* Adicione botão logout aqui se esta tela precisar */}
      </View>

      {!isLoading && (profileError || nearbyError) && ( <View style={styles.infoBanner}><Icon name="information-circle-outline" size={18} color={theme.colors.textSecondary} style={{marginRight: 8}}/><Text style={styles.infoBannerText}>{profileError || nearbyError}</Text></View> )}
      {isLoading && ( <View style={styles.centeredContainer}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.loadingText}>{loadingProfile ? 'Verificando perfil...' : (loadingNearbyCheck ? 'Verificando proximidade...' : 'Carregando...')}</Text></View> )}
      {!isLoading && errorLoadingChats && !profileError && !nearbyError && ( <View style={styles.centeredContainer}><Icon name="cloud-offline-outline" size={40} color={theme.colors.error} style={{marginBottom: 10}}/><Text style={styles.errorText}>{errorLoadingChats}</Text></View> )}
      {!isLoading && !combinedError && user?.uid && (
          <FlatList
            ListHeaderComponent={renderGroupChatItem}
            data={chatList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ chatList.length === 0 ? ( <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>Nenhuma conversa.</Text><Text style={styles.emptyListSubText}>Inicie uma conversa ou entre na comunidade.</Text></View> ) : null }
          />
      )}
      {!user?.uid && !isLoading && ( <View style={styles.centeredContainer}><Text style={styles.emptyListText}>Sessão encerrada.</Text></View> )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.cardBackground },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
    headerTitle: { fontSize: 24, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '700', color: theme.colors.text },
    // logoutButton: { padding: 5 },
    listContainer: { paddingBottom: 20, flexGrow: 1 },
    chatItemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: theme.colors.cardBackground },
    avatarContainer: { marginRight: 15, position: 'relative' },
    profileImage: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.border },
    initialsCircle: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.initialsBackground, justifyContent: 'center', alignItems: 'center' },
    initialsText: { fontSize: 22, fontFamily: theme.fonts.bold, fontWeight: 'bold', color: theme.colors.primary },
    userInitialsCircle: { backgroundColor: '#E3F2FD' },
    userInitialsText: { color: '#1976D2' },
    onlineIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.onlineStatus, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: theme.colors.cardBackground },
    textContainer: { flex: 1, justifyContent: 'center' },
    participantName: { fontSize: 16, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.text, marginBottom: 3 },
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