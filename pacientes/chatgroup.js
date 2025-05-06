import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Platform,
    Text,
    Alert,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Keyboard // <--- Importar Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Autenticação
import { db } from '../firebaseconfig'; // Firebase 
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc, // <--- Importar updateDoc
  Timestamp,
  FieldValue, // <--- Precisaremos disso (ou deleteField)
  deleteField // <--- Importar deleteField para remover o status
} from 'firebase/firestore';

// --- ID FIXO PARA O CHAT COLETIVO DE 5KM ---
const GROUP_CHAT_ID = 'GROUP_CHAT_NEARBY_5KM';
const GROUP_CHAT_MESSAGES_REF = collection(db, 'chats', GROUP_CHAT_ID, 'messages');
const GROUP_CHAT_DOC_REF = doc(db, 'chats', GROUP_CHAT_ID);

// --- TEMA ---
const theme = {
  colors: {
    primary: '#FF69B4', white: '#fff', text: '#333', textSecondary: '#666',
    background: '#f0f4f8', systemMessage: '#777', leftBubble: '#ffffff',
    rightBubble: '#e3f2fd', border: '#d0d0d0', placeholder: '#999',
    sendButton: '#FF69B4', error: '#D32F2F', infoBanner: '#FFF9C4',
    timestamp: '#888',
    typingIndicator: '#555' // <--- Cor para o indicador de digitação
   },
  fonts: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif' }
};

// --- Componente MessageItem (sem alterações) ---
const MessageItem = React.memo(({ item, currentUserId }) => {
    const isCurrentUser = item.user?._id === currentUserId;
    const formatTime = (timestamp) => { /* ... sem alterações ... */ if (!timestamp) return ''; try { const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch (e) { console.error("Error formatting time:", e, timestamp); return ''; } };
    return (
        <View style={[styles.messageRow, isCurrentUser ? styles.currentUserMessageRow : styles.otherUserMessageRow]}>
            <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                {!isCurrentUser && (<Text style={styles.senderName}>{item.user?.name || 'Usuário'}</Text>)}
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={[styles.timestampText, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>{formatTime(item.createdAt)}</Text>
            </View>
        </View>
    );
});


// --- Componente Principal da Tela ---
function GroupChatScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // --- Estados e Refs para "Digitando..." ---
  const [typingUsers, setTypingUsers] = useState([]); // Armazena { uid: string, name: string }
  const isTypingRef = useRef(false); // Ref para controlar se o usuário local *está* marcado como digitando
  const typingTimeoutRef = useRef(null); // Ref para o timeout que marca como "parou de digitar"

  // --- Nome do usuário logado (para reutilizar) ---
  const currentUserName = user?.displayName || user?.name || 'Usuário';

  // --- Efeito para Configuração Inicial e Listener de Typing ---
  useEffect(() => {
    navigation.setOptions({ title: 'Chat Próximo (5km)' });
    if (!user?.uid) {
      console.error("GroupChatScreen: Usuário não autenticado!");
      Alert.alert("Erro", "Você precisa estar logado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      return;
    }

    // Garante doc do chat de grupo
    setDoc(GROUP_CHAT_DOC_REF, { name: 'Chat Próximo (5km)', isGroup: true, createdAt: serverTimestamp() }, { merge: true })
      .catch(err => console.log("Erro ao criar/atualizar doc do chat de grupo:", err));

    // --- Listener para o documento principal do chat (para o campo 'typing') ---
    const unsubscribeTyping = onSnapshot(GROUP_CHAT_DOC_REF, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const typingMap = data.typing || {}; // Pega o mapa 'typing', ou um objeto vazio
            const now = Date.now();
            const activeTypers = [];

            // Itera sobre os UIDs no mapa 'typing'
            for (const uid in typingMap) {
                // Verifica se não é o usuário atual E se o timestamp é recente (ex: últimos 10 segundos)
                if (uid !== user.uid && typingMap[uid]?.timestamp?.toDate && (now - typingMap[uid].timestamp.toDate().getTime()) < 10000) {
                    activeTypers.push({ uid: uid, name: typingMap[uid].name || 'Alguém' });
                }
            }
            // Atualiza o estado com os usuários que estão digitando ativamente
            setTypingUsers(activeTypers);
        }
    }, (err) => {
        console.error("Erro ao ouvir status de digitação:", err);
        // Não define erro principal aqui para não sobrescrever erro de msg
    });

    // Função de limpeza
    return () => {
        unsubscribeTyping(); // Para o listener de digitação
        // Limpa o status de digitação do usuário atual ao sair da tela
        if (user?.uid) {
            updateDoc(GROUP_CHAT_DOC_REF, {
                [`typing.${user.uid}`]: deleteField() // Remove a entrada do usuário
            }).catch(err => console.log("Erro ao limpar status de digitação ao sair:", err));
        }
        // Limpa qualquer timeout pendente
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

  }, [navigation, user?.uid]); // Depende de user.uid para a limpeza

  // --- Efeito para Buscar Mensagens (sem alterações na lógica de busca) ---
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true); setError(null);
    const q = query(GROUP_CHAT_MESSAGES_REF, orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setMessages(fetchedMessages); setLoading(false);
    }, (err) => { console.error("GroupChatScreen (FlatList): Erro:", err); setError("Não foi possível carregar mensagens."); setLoading(false); });
    return () => unsubscribeMessages();
  }, [user?.uid]);

  // --- Função para Atualizar Status de Digitação no Firestore ---
  const updateTypingStatus = useCallback((isCurrentlyTyping) => {
    if (!user?.uid) return;

    // Limpa o timeout anterior que marcaria como "parou de digitar"
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }

    if (isCurrentlyTyping) {
        // Só atualiza se não estiver já marcado como digitando
        if (!isTypingRef.current) {
            console.log("Atualizando para: DIGITANDO");
            isTypingRef.current = true;
            updateDoc(GROUP_CHAT_DOC_REF, {
                [`typing.${user.uid}`]: { // Usa notação de ponto para campo aninhado
                    name: currentUserName, // Inclui o nome
                    timestamp: serverTimestamp() // Marca com timestamp atual
                }
            }).catch(err => console.error("Erro ao marcar como digitando:", err));
        }
        // Define um novo timeout para marcar como "parou" após um período (ex: 3 segundos)
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false); // Chama esta mesma função para marcar como não digitando
        }, 3000); // 3 segundos de inatividade

    } else {
        // Só atualiza se *estava* marcado como digitando
        if (isTypingRef.current) {
            console.log("Atualizando para: PAROU DE DIGITAR");
            isTypingRef.current = false;
            updateDoc(GROUP_CHAT_DOC_REF, {
                [`typing.${user.uid}`]: deleteField() // Remove a entrada do usuário do mapa
            }).catch(err => console.error("Erro ao remover status de digitação:", err));
        }
    }
  }, [user?.uid, currentUserName]); // Depende do uid e nome

  // --- Manipulador de Mudança no Texto Input ---
  const handleTextInputChange = (text) => {
      setInputText(text);
      // Atualiza o status para 'digitando' (a função updateTypingStatus lida com timeouts)
      updateTypingStatus(true);
  };

  // --- Função para Enviar Mensagem ---
  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !user?.uid) return;

    // MARCA COMO NÃO DIGITANDO antes de enviar
    updateTypingStatus(false); // Limpa o status de digitação

    const userAvatar = user.photoURL || user.profileImageUrl || 'https://www.bing.com/images/search?q=user+pink&id=BBE7287C36D97CCA70636B8C44A40063E667EB63&FORM=IQFRBA';
    const messageData = {
      text: trimmedText,
      createdAt: serverTimestamp(),
      user: { _id: user.uid, name: currentUserName, avatar: userAvatar },
    };

    setInputText(''); // Limpa o input AQUI
    Keyboard.dismiss(); // Fecha o teclado

    console.log(`GroupChatScreen (FlatList): Enviando:`, messageData);
    try {
      await addDoc(GROUP_CHAT_MESSAGES_REF, messageData);
      console.log("GroupChatScreen (FlatList): Mensagem adicionada.");
      await setDoc(GROUP_CHAT_DOC_REF, {
          lastMessage: { text: messageData.text, createdAt: messageData.createdAt, user: messageData.user }
      }, { merge: true });
    } catch (error) {
        console.error("GroupChatScreen (FlatList): Erro ao enviar:", error);
        Alert.alert("Erro", "Não foi possível enviar.");
        setInputText(trimmedText); // Restaura texto em caso de erro
    }
  }, [user, inputText, currentUserName, updateTypingStatus]); // Adiciona updateTypingStatus às dependências

  // --- Função para renderizar cada item na FlatList ---
  const renderMessage = useCallback(({ item }) => (
      <MessageItem item={item} currentUserId={user?.uid} />
  ), [user?.uid]);

  // --- Função para formatar o texto do indicador "digitando..." ---
  const renderTypingIndicator = () => {
      if (typingUsers.length === 0) {
          return null; 
      }
      if (typingUsers.length === 1) {
          return `${typingUsers[0].name} digitando...`;
      }
      if (typingUsers.length === 2) {
          return `${typingUsers[0].name} e ${typingUsers[1].name} digitando...`;
      }
      // Mais de 2 pessoas
      //return `Várias pessoas digitando...`;
      return `${typingUsers[0].name}, ${typingUsers[1].name} e outros digitando...`;
  };

  // --- Renderização Principal ---
  if (!user?.uid) {
      return ( <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.centerLoading} size="large" color={theme.colors.primary} /></SafeAreaView> );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // <<-- Ajuste este valor se necessário (altura do header)
        >
            {/* Exibição de Erro */}
            {error && ( <View style={styles.errorDisplay}><Text style={styles.errorDisplayText}>{error}</Text></View> )}

            {/* Lista de Mensagens */}
            {loading ? (
                <ActivityIndicator style={styles.centerLoading} size="large" color={theme.colors.primary} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    ListEmptyComponent={ /* ... sem alterações ... */ <View style={styles.emptyContainer}><Icon name="chatbubbles-outline" size={50} color={theme.colors.textMuted}/><Text style={styles.emptyText}>Nenhuma mensagem ainda.</Text><Text style={styles.emptySubText}>Seja o primeiro a enviar!</Text></View> }
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} // Rola ao mudar tamanho
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} // Rola ao carregar inicial
                />
            )}

            {/* Indicador "Digitando..." */}
            <View style={styles.typingIndicatorContainer}>
                <Text style={styles.typingIndicatorText}>
                    {renderTypingIndicator()}
                </Text>
                {/* Poderia adicionar animação aqui se Reanimated estivesse funcionando */}
            </View>

            {/* Área de Input */}
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={inputText}
                    onChangeText={handleTextInputChange} // <--- USA O NOVO HANDLER
                    multiline
                    onBlur={() => updateTypingStatus(false)} // <--- Para de digitar se perder o foco
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Icon name="send" size={20} color={theme.colors.white} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  // ... (Estilos anteriores: safeArea, keyboardAvoidingContainer, centerLoading, errorDisplay, etc.) ...
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoidingContainer: { flex: 1 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorDisplay: { backgroundColor: theme.colors.error, padding: 10, alignItems: 'center' },
  errorDisplayText: { color: theme.colors.white, fontSize: 14 },
  messageList: { flex: 1, paddingHorizontal: 10 },
  messageListContent: { paddingBottom: 5, paddingTop:10 }, // Diminui padding bottom
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: '30%' },
  emptyText: { marginTop: 15, fontSize: 18, fontWeight: '600', color: theme.colors.textSecondary },
  emptySubText: { marginTop: 5, fontSize: 14, color: theme.colors.textMuted },

  // --- NOVO: Estilo para o container do indicador "digitando" ---
  typingIndicatorContainer: {
      height: 25, // Altura fixa para o indicador
      justifyContent: 'center',
      paddingHorizontal: 15, // Mesmo padding da lista
      paddingBottom: 5, // Pequeno espaço acima do input
  },
  typingIndicatorText: {
      fontSize: 13,
      fontStyle: 'italic',
      color: theme.colors.typingIndicator, // Cor definida no tema
  },
  // --- FIM NOVO ---

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  textInput: { /* ... sem alterações ... */ flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: '#f0f0f0', borderRadius: 21, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 16, marginRight: 10, },
  sendButton: { /* ... sem alterações ... */ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.sendButton, justifyContent: 'center', alignItems: 'center', },
  sendButtonDisabled: { /* ... sem alterações ... */ backgroundColor: theme.colors.sendButton + '80', },

  // --- Estilos para MessageItem (sem alterações) ---
  messageRow: { marginVertical: 5, maxWidth: '80%', },
  currentUserMessageRow: { alignSelf: 'flex-end', },
  otherUserMessageRow: { alignSelf: 'flex-start', },
  messageBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15, },
  currentUserBubble: { backgroundColor: theme.colors.rightBubble, borderBottomRightRadius: 5, },
  otherUserBubble: { backgroundColor: theme.colors.leftBubble, borderBottomLeftRadius: 5, },
  senderName: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold', marginBottom: 3, },
  messageText: { fontSize: 15, color: theme.colors.text, },
  timestampText: { fontSize: 11, color: theme.colors.timestamp, marginTop: 4, },
  currentUserTimestamp: { alignSelf: 'flex-end', },
  otherUserTimestamp: { alignSelf: 'flex-start', },
});

export default GroupChatScreen;