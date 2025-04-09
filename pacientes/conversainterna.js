import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { /* ... imports padrão ... */ ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Image, AppState } from 'react-native'; // Adicionado AppState
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseconfig'; // Firestore DB
import {
    collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp as firestoreServerTimestamp, Timestamp,
    doc, setDoc, updateDoc, writeBatch // Importar writeBatch para atualizações em lote
} from 'firebase/firestore';

// --- Firebase Realtime Database Imports ---
import { getDatabase, ref, onValue, off, set, serverTimestamp as rtdbServerTimestamp, onDisconnect } from 'firebase/database';
import { getApp } from 'firebase/app';

// --- Expo Notifications (Mantido para contexto futuro) ---
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from "expo-constants";

// --- TEMA (Mantido) ---
const theme = { /* ... */ colors: { primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666', textMuted: '#888', placeholder: '#aaa', background: '#f7f7f7', border: '#eee', cardBackground: '#fff', userBubble: '#FFC0CB', doctorBubble: '#ECECEC', error: '#D32F2F', readReceipt: '#4FC3F7' /* Azul claro para visto */ }, fonts: { /* ... */ } };

// --- Notificações (Mantido) ---
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true, }), });

// --- Formatadores ---
const formatTimestamp = (timestamp) => { /* ... mantido ... */ if (timestamp instanceof Timestamp) { return timestamp.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } return ''; };
const formatLastSeen = (timestamp) => { /* ... função para lastSeen ... */ if (!timestamp) return 'offline'; const date = new Date(timestamp); const now = new Date(); const diffMs = now - date; const diffMins = Math.round(diffMs / 60000); if (diffMins < 1) return 'online'; if (diffMins < 60) return `Visto há ${diffMins} min`; const diffHours = Math.round(diffMins / 60); if (diffHours < 24) return `Visto há ${diffHours} h`; const diffDays = Math.round(diffHours / 24); return `Visto há ${diffDays} d`; };

// --- COMPONENTE DO ITEM DE MENSAGEM (com Recibo de Leitura) ---
const MessageItem = React.memo(({ item, currentUserId }) => {
  const isUser = item.senderId === currentUserId;
  const timeString = formatTimestamp(item.createdAt);

  return (
    <View style={[ styles.messageRow, isUser ? styles.userMessageRow : styles.doctorMessageRow ]}>
      <View style={[ styles.messageBubble, isUser ? styles.userMessageBubble : styles.doctorMessageBubble ]}>
        <Text style={isUser ? styles.userMessageText : styles.doctorMessageText}>{item.text}</Text>
        <View style={styles.footerContainer}>
             {timeString && <Text style={[ styles.timestampText, isUser ? styles.userTimestamp : styles.doctorTimestamp ]}>{timeString}</Text>}
             {/* Indicador de Visto (Checkmarks) para mensagens ENVIADAS pelo usuário */}
             {isUser && (
                <Icon
                    name={item.isRead ? "checkmark-done" : "checkmark"} // Ícone duplo se lido, simples se enviado
                    size={16}
                    color={item.isRead ? theme.colors.readReceipt : theme.colors.textMuted} // Cor diferente se lido
                    style={styles.readReceiptIcon}
                />
             )}
        </View>
      </View>
    </View>
  );
});

// --- TELA PRINCIPAL DO CHAT ---
function ChatScreen({ route, navigation }) {
  const { user } = useAuth();
  const doctorId = route?.params?.doctorId;
  const doctorName = route?.params?.doctorName;
  const doctorImage = route?.params?.doctorImage ?? 'https://via.placeholder.com/40';
  const userName = user?.name || 'Usuário';
  const userImage = user?.profileImageUrl || 'https://via.placeholder.com/40';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [otherUserPresence, setOtherUserPresence] = useState({ isOnline: false, lastSeen: null }); // Estado de presença do outro usuário
  const flatListRef = useRef(null);
  const appState = useRef(AppState.currentState); // Para detectar foreground/background

  // --- Inicializa RTDB ---
  const rtdb = getDatabase(getApp());

  // Gera o ID da sala de chat
  const chatId = useMemo(() => {
    if (!user?.uid || !doctorId) return null;
    const ids = [user.uid, doctorId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  }, [user?.uid, doctorId]);

  // --- Validação Inicial ---
  if (!user?.uid || !doctorId || !doctorName) { /* ... */ }

  // --- Efeito para Gerenciar Presença (RTDB + Firestore) e AppState ---
  useEffect(() => {
    if (!user?.uid) return;

    const userStatusFirestoreRef = doc(db, 'users', user.uid);
    const userStatusRtdbRef = ref(rtdb, `/status/${user.uid}`);

    // Listener do status de conexão do RTDB
    const connectedRef = ref(rtdb, '.info/connected');
    const connectedListener = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("RTDB Conectado - Configurando presença online");
        // Define status online no RTDB
        set(userStatusRtdbRef, { isOnline: true, lastSeen: rtdbServerTimestamp() });
        // Configura o onDisconnect para offline
        onDisconnect(userStatusRtdbRef).set({ isOnline: false, lastSeen: rtdbServerTimestamp() });
        // Atualiza status online no Firestore
        updateDoc(userStatusFirestoreRef, { isOnline: true, lastSeen: firestoreServerTimestamp() }).catch(e => console.error("Erro ao atualizar Firestore online:", e));
      } else {
        console.log("RTDB Desconectado");
        // Firestore será atualizado pelo onDisconnect do RTDB ou pelo AppState
      }
    });

    // Listener do AppState (foreground/background)
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App veio para Foreground - Marcando online');
        set(userStatusRtdbRef, { isOnline: true, lastSeen: rtdbServerTimestamp() });
        updateDoc(userStatusFirestoreRef, { isOnline: true, lastSeen: firestoreServerTimestamp() }).catch(e => console.error("Erro ao atualizar Firestore (foreground):", e));
      } else if (nextAppState.match(/inactive|background/)) {
          console.log('App foi para Background/Inativo - Marcando offline (RTDB via onDisconnect)');
          // Tenta atualizar o Firestore imediatamente, onDisconnect é o fallback
          updateDoc(userStatusFirestoreRef, { isOnline: false, lastSeen: firestoreServerTimestamp() }).catch(e => console.error("Erro ao atualizar Firestore (background):", e));
          // Nota: A escrita no RTDB é feita pelo onDisconnect configurado acima
      }
      appState.current = nextAppState;
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Limpeza ao desmontar
    return () => {
      console.log("Limpando listeners de presença e AppState");
      off(connectedRef); // Desliga listener de conexão RTDB
      appStateSubscription?.remove();
       // **Importante:** Ao sair da tela, não removemos o onDisconnect do RTDB.
       // Idealmente, isso seria feito ao deslogar completamente do app.
       // Se removermos aqui, o status offline não será definido se o usuário só sair do chat.
       // Poderíamos marcar offline no Firestore aqui, mas o RTDB é mais confiável para tempo real.
       // Marcamos offline no Firestore via AppState ou onDisconnect.
    };
  }, [user?.uid, rtdb]);


  // --- Efeito para Ouvir Presença do OUTRO Usuário (RTDB) ---
  useEffect(() => {
    if (!doctorId) return;

    const otherUserStatusRef = ref(rtdb, `/status/${doctorId}`);
    console.log(`Ouvindo presença RTDB para: /status/${doctorId}`);

    const presenceListener = onValue(otherUserStatusRef, (snapshot) => {
        const presenceData = snapshot.val();
        if (presenceData) {
            console.log(`Presença recebida para ${doctorId}:`, presenceData);
            setOtherUserPresence({ // Atualiza estado local
                isOnline: presenceData.isOnline || false,
                lastSeen: presenceData.lastSeen || null,
            });
        } else {
            console.log(`Nenhum dado de presença para ${doctorId}`);
            setOtherUserPresence({ isOnline: false, lastSeen: null }); // Assume offline
        }
    }, (error) => {
        console.error(`Erro ao ouvir presença RTDB para ${doctorId}:`, error);
        setOtherUserPresence({ isOnline: false, lastSeen: null }); // Assume offline em caso de erro
    });

    // Limpeza
    return () => {
        console.log(`Desligando listener de presença RTDB para ${doctorId}`);
        off(otherUserStatusRef);
    };

  }, [doctorId, rtdb]);


  // --- Efeito para Carregar Mensagens (Firestore) e Marcar como Lidas ---
  useEffect(() => {
    if (!chatId) { setLoadingMessages(false); return; }

    setLoadingMessages(true); setErrorMessage(null);
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = [];
      const batch = writeBatch(db); // Cria um batch para atualizações
      let updatesNeeded = false;

      querySnapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() };
        fetchedMessages.push(messageData);

        // Marcar como lida SE: foi enviada pelo OUTRO usuário E ainda não está lida
        if (messageData.senderId === doctorId && // Veio do médico
            messageData.recipientId === user.uid && // Era para mim
            !messageData.isRead) {                  // E ainda não li
              console.log(`Marcando msg ${doc.id} como lida`);
              const messageRef = doc.ref; // Referência do documento da mensagem
              batch.update(messageRef, { isRead: true }); // Adiciona update ao batch
              updatesNeeded = true;
        }
      });

      console.log(`Msgs Firestore recebidas: ${fetchedMessages.length}. Updates no batch: ${updatesNeeded}`);
      setMessages(fetchedMessages);
      setLoadingMessages(false);

      // Executa o batch de atualizações se houver alguma
      if (updatesNeeded) {
        batch.commit()
          .then(() => console.log("Mensagens marcadas como lidas com sucesso."))
          .catch(error => console.error("Erro ao marcar mensagens como lidas:", error));
      }

    }, (error) => { /* ... tratamento de erro mantido ... */ console.error("Erro onSnapshot msgs:", error); setErrorMessage("Erro ao carregar."); setLoadingMessages(false); });

    return () => { console.log(`Desinscrevendo msgs Firestore: ${chatId}`); unsubscribe(); };
  }, [chatId, user?.uid, doctorId]); // Adiciona doctorId como dependência para marcar lidas corretamente


  // --- Função para Enviar Mensagem (Firestore - adiciona isRead: false) ---
  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !chatId || !user?.uid || !doctorId) return;

    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const chatDocRef = doc(db, 'chats', chatId);

    const newMessageData = {
      text: trimmedText,
      senderId: user.uid,
      recipientId: doctorId,
      createdAt: firestoreServerTimestamp(),
      isRead: false, // <<< NOVO CAMPO: Inicialmente não lida
    };

    const chatMetadata = {
        participants: [user.uid, doctorId].sort(),
        participantInfo: {
            [user.uid]: { name: userName, imageUrl: userImage },
            [doctorId]: { name: doctorName, imageUrl: doctorImage }
        },
        lastMessage: {
            text: trimmedText,
            createdAt: firestoreServerTimestamp(),
            senderId: user.uid,
            // isRead: false // Opcional: adicionar status de leitura aqui também
        }
    };

    setInputText(''); Keyboard.dismiss();

    try {
      console.log(`Enviando msg Firestore para ${chatId}:`, newMessageData);
      // Usar batch para garantir atomicidade (opcional, mas bom)
      const batch = writeBatch(db);
      const newMessageRef = doc(collection(db, 'chats', chatId, 'messages')); // Gera ref antes
      batch.set(newMessageRef, newMessageData); // Adiciona msg ao batch
      batch.set(chatDocRef, chatMetadata, { merge: true }); // Atualiza metadados no batch
      await batch.commit(); // Executa ambas as operações juntas

      console.log("Mensagem e metadados enviados/atualizados.");
    } catch (error) { /* ... tratamento de erro mantido ... */ console.error("Erro ao enviar:", error); Alert.alert("Erro", "Falha ao enviar."); setInputText(trimmedText); }
  }, [inputText, chatId, user, doctorId, doctorName, doctorImage, userName, userImage]); // Atualiza dependências


  // Renderiza item da mensagem
  const renderMessageItem = useCallback(({ item }) => (
    <MessageItem item={item} currentUserId={user.uid} />
  ), [user.uid]);

  // --- Renderização Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />
      {/* Cabeçalho com Status Online/Offline */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Image source={{ uri: doctorImage }} style={styles.headerImage} />
        <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>{doctorName}</Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
                {otherUserPresence.isOnline ? 'Online' : formatLastSeen(otherUserPresence.lastSeen)}
            </Text>
        </View>
      </View>

      {/* ... (Resto do KeyboardAvoidingView, Lista, Input como antes) ... */}
       <KeyboardAvoidingView style={styles.keyboardAvoidingContainer} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 65 : 0}>
         <View style={styles.messageListContainer}>
             {loadingMessages && ( <View style={styles.centeredMessageContainer}><ActivityIndicator size="small" color={theme.colors.primary} /><Text style={styles.loadingText}>Carregando...</Text></View> )}
             {errorMessage && !loadingMessages && ( <View style={styles.centeredMessageContainer}><Icon name="cloud-offline-outline" size={40} color={theme.colors.textMuted} /><Text style={styles.errorText}>{errorMessage}</Text></View> )}
             {!loadingMessages && !errorMessage && (
                 <FlatList ref={flatListRef} data={messages} renderItem={renderMessageItem} keyExtractor={item => item.id} style={styles.messageList} contentContainerStyle={styles.messageListContent} inverted showsVerticalScrollIndicator={false} ListEmptyComponent={ !loadingMessages && !errorMessage && messages.length === 0 ? (<View style={styles.centeredMessageContainer}><Text style={styles.emptyChatText}>Inicie a conversa!</Text></View>) : null }/>
             )}
         </View>
         <View style={styles.inputContainer}>
           <TextInput style={styles.textInput} placeholder="Digite sua mensagem..." placeholderTextColor={theme.colors.placeholder} value={inputText} onChangeText={setInputText} multiline editable={!loadingMessages} />
           <TouchableOpacity style={[styles.sendButton, (!inputText.trim() || loadingMessages) && styles.sendButtonDisabled]} onPress={handleSend} disabled={!inputText.trim() || loadingMessages}>
             <Icon name="send" size={20} color={theme.colors.white} />
           </TouchableOpacity>
         </View>
       </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// --- Função para Registrar Token (Mantida - salva no Firestore) ---
async function registerForPushNotificationsAsync(userId) { /* ... código mantido como na resposta anterior (salvando no Firestore) ... */ if (!Device.isDevice) { console.log('Notificações só funcionam em dispositivos físicos.'); return null; } try { const { status: existingStatus } = await Notifications.getPermissionsAsync(); let finalStatus = existingStatus; if (existingStatus !== 'granted') { const { status } = await Notifications.requestPermissionsAsync(); finalStatus = status; } if (finalStatus !== 'granted') { console.log('Permissão para notificações não concedida.'); return null; } const projectId = Constants.expoConfig?.extra?.eas?.projectId; if (!projectId) { console.error("EAS project ID não encontrado."); Alert.alert("Erro", "ID do projeto não encontrado para token."); return null;} const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data; console.log('Expo Push Token:', token); if (userId && token) { const userDocRef = doc(db, 'users', userId); try { await setDoc(userDocRef, { pushToken: token }, { merge: true }); console.log(`Token salvo/atualizado no Firestore para: ${userId}`); } catch (dbError) { console.error("Erro ao salvar token no Firestore:", dbError); } } if (Platform.OS === 'android') { await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250], lightColor: theme.colors.primary + 'FF', }); } return token; } catch (error) { console.error("Erro ao registrar para notificações:", error); Alert.alert("Erro", "Falha ao configurar notificações."); return null; } }

// --- ESTILOS (Adicionados/Modificados) ---
const styles = StyleSheet.create({
    // ... (safeArea, keyboardAvoidingContainer mantidos)
    safeArea: { flex: 1, backgroundColor: theme.colors.cardBackground },
    keyboardAvoidingContainer: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBackground },
    backButton: { padding: 5, marginRight: 5 },
    headerImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: theme.colors.border },
    headerTextContainer: { // Novo container para nome e status
        flex: 1,
        justifyContent: 'center',
    },
    headerName: { /* ... mantido ... */ flex: 0, /* Remove flex: 1 */ fontSize: 17, fontFamily: theme.fonts.bold, fontWeight: Platform.OS === 'android' ? 'bold' : '600', color: theme.colors.text },
    headerStatus: { // Novo estilo para status online/offline
        fontSize: 12,
        fontFamily: theme.fonts.regular,
        color: theme.colors.textSecondary,
    },
    // ... (messageListContainer, messageList, messageListContent, system... mantidos)
    messageListContainer:{flex:1,backgroundColor:theme.colors.background},messageList:{flex:1},messageListContent:{paddingHorizontal:10,paddingVertical:15,flexGrow:1},systemMessageContainer:{alignSelf:'center',marginVertical:10,paddingHorizontal:12,paddingVertical:6,backgroundColor:theme.colors.border,borderRadius:15},systemMessageText:{fontSize:12,color:theme.colors.textSecondary,fontStyle:'italic',textAlign:'center'},messageRow:{flexDirection:'row',marginBottom:10},userMessageRow:{justifyContent:'flex-end',marginLeft:50},doctorMessageRow:{justifyContent:'flex-start',marginRight:50},messageBubble:{maxWidth:'100%',paddingVertical:10,paddingHorizontal:14,borderRadius:18,elevation:1,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:1},userMessageBubble:{backgroundColor:theme.colors.userBubble,borderBottomRightRadius:5},doctorMessageBubble:{backgroundColor:theme.colors.doctorBubble,borderBottomLeftRadius:5},userMessageText:{fontSize:15,fontFamily:theme.fonts.regular,color:theme.colors.text},doctorMessageText:{fontSize:15,fontFamily:theme.fonts.regular,color:theme.colors.text},
    footerContainer: { // Container para timestamp e recibo
        flexDirection: 'row',
        justifyContent: 'flex-end', // Alinha à direita por padrão
        alignItems: 'center',
        marginTop: 5,
    },
    timestampText: { /* ... mantido ... */ fontSize: 11, color: theme.colors.textMuted },
    userTimestamp: { marginRight: 5 }, // Espaço antes do checkmark
    doctorTimestamp: { alignSelf: 'flex-start' }, // Mantém timestamp à esquerda para médico
    readReceiptIcon: { // Estilo para o ícone de visto
        marginLeft: 3, // Pequeno espaço após timestamp
    },
    // ... (inputContainer, textInput, sendButton, sendButtonDisabled mantidos)
    inputContainer:{flexDirection:'row',alignItems:'center',paddingHorizontal:8,paddingVertical:8,borderTopWidth:1,borderTopColor:theme.colors.border,backgroundColor:theme.colors.cardBackground},textInput:{flex:1,minHeight:42,maxHeight:120,backgroundColor:theme.colors.background,borderRadius:21,paddingHorizontal:15,paddingVertical:Platform.OS==='ios'?10:8,fontSize:16,fontFamily:theme.fonts.regular,color:theme.colors.text,marginRight:8},sendButton:{width:42,height:42,borderRadius:21,backgroundColor:theme.colors.primary,justifyContent:'center',alignItems:'center',elevation:2},sendButtonDisabled:{backgroundColor:theme.colors.primary+'80',elevation:0},
    // ... (centeredMessageContainer, loadingText, errorContainer, errorText, emptyChatText, backButtonText mantidos)
    centeredMessageContainer:{flex:1,justifyContent:'center',alignItems:'center',padding:20},loadingText:{marginTop:10,fontSize:14,color:theme.colors.textSecondary},errorContainer:{flex:1,justifyContent:'center',alignItems:'center',padding:20,backgroundColor:theme.colors.background},errorText:{fontSize:16,color:theme.colors.textSecondary,textAlign:'center',marginBottom:15},emptyChatText:{fontSize:16,color:theme.colors.textMuted,textAlign:'center'},backButtonText:{fontSize:16,color:theme.colors.primary,fontWeight:'bold'}
});

export default ChatScreen;