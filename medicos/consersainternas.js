import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  // Image foi removido, pois não é mais usado no header
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- TEMA (Padrão Rosa consistente, com cor para iniciais) ---
const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#aaa',
    background: '#f7f7f7',
    border: '#eee',
    cardBackground: '#fff',
    userBubble: '#FFC0CB',
    doctorBubble: '#ECECEC',
    initialsBackground: '#FCE4EC', // Rosa bem claro para fundo das iniciais
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE INICIAIS (Mantidos para exemplo) ---
const initialMessages = [
  { id: 'msg4', text: 'Claro, pode perguntar.', sender: 'doctor', timestamp: '10:47' },
  { id: 'msg3', text: 'Oi Dra. Sofia, estou com algumas dúvidas sobre meu último exame.', sender: 'user', timestamp: '10:46' },
  { id: 'msg2', text: 'Olá! Como posso ajudar hoje?', sender: 'doctor', timestamp: '10:45' },
  { id: 'msg1', text: 'Consulta iniciada', sender: 'system', timestamp: '10:44' },
].sort((a, b) => new Date('1970/01/01 ' + b.timestamp) - new Date('1970/01/01 ' + a.timestamp));


// --- COMPONENTE DO ITEM DE MENSAGEM (Balão - Sem alterações) ---
const MessageItem = React.memo(({ item }) => {
  const isUser = item.sender === 'user';
  const isDoctor = item.sender === 'doctor';
  const isSystem = item.sender === 'system';

  if (isSystem) {
      return (
          <View style={styles.systemMessageContainer}>
              <Text style={styles.systemMessageText}>{item.text} - {item.timestamp}</Text>
          </View>
      );
  }

  return (
    <View style={[
      styles.messageRow,
      isUser ? styles.userMessageRow : styles.doctorMessageRow
    ]}>
      <View style={[
        styles.messageBubble,
        isUser ? styles.userMessageBubble : styles.doctorMessageBubble
      ]}>
        <Text style={isUser ? styles.userMessageText : styles.doctorMessageText}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestampText,
           isUser ? styles.userTimestamp : styles.doctorTimestamp
           ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );
});

// --- TELA PRINCIPAL DO CHAT INTERNO (MODIFICADA) ---
function ChatScreen({ route, navigation }) {
  // Pega os dados da navegação
  const doctorId = route?.params?.doctorId;
  const doctorName = route?.params?.doctorName;
  // doctorImage não é mais usado no header, mas pode ser mantido se necessário em outro lugar

  // Pega a inicial do nome para o cabeçalho
  const initial = doctorName ? doctorName.charAt(0).toUpperCase() : '?';

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Verifica se os dados essenciais (ID e Nome) foram recebidos
   if (!route || !route.params || !doctorId || !doctorName) {
    console.error("ChatScreen: Parâmetros de rota (ID/Nome do contato) ausentes!", route);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Não foi possível carregar o chat. Tente voltar e selecionar a conversa novamente.</Text>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
             <Text style={styles.backButtonText}>Voltar para Lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Funções handleSend, renderMessageItem, useEffect (Sem alterações na lógica)
  const handleSend = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    const newMessage = {
      id: `msg-${Date.now()}-user`,
      text: trimmedText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
    setInputText('');
    Keyboard.dismiss();

    setTimeout(() => {
      const doctorReply = {
        id: `msg-${Date.now()}-doc`,
        text: 'Entendido. Analisando sua mensagem.',
        sender: 'doctor',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [doctorReply, ...prevMessages]);
    }, 1500);

  }, [inputText]);

  const renderMessageItem = useCallback(({ item }) => <MessageItem item={item} />, []);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />

      {/* === CABEÇALHO DA CONVERSA (MODIFICADO) === */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Círculo com a Inicial (Substitui a Imagem) */}
        <View style={styles.headerInitialsCircle}>
          <Text style={styles.headerInitialsText}>{initial}</Text>
        </View>

        <Text style={styles.headerName} numberOfLines={1}>{doctorName}</Text>
        {/* Outros botões podem ir aqui */}
      </View>

      {/* === CONTAINER PRINCIPAL (LISTA + INPUT - Sem alterações) === */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
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

// --- ESTILOS (Atualizados para o header) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
      },
      keyboardAvoidingContainer: {
          flex: 1,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
      },
      backButton: {
        padding: 5,
        marginRight: 10, // Aumentado espaço após botão voltar
      },
      headerInitialsCircle: { // <<< NOVO ESTILO para círculo no header
        width: 40, // Mesmo tamanho que a imagem anterior
        height: 40,
        borderRadius: 20, // Metade para ser círculo
        backgroundColor: theme.colors.initialsBackground, // Fundo rosa claro
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10, // Espaço antes do nome
      },
      headerInitialsText: { // <<< NOVO ESTILO para letra no header
        fontSize: 18, // Tamanho da letra no header
        fontFamily: theme.fonts.bold,
        fontWeight: 'bold',
        color: theme.colors.primary, // Letra rosa principal
      },
      // headerImage foi REMOVIDO
      headerName: {
        flex: 1,
        fontSize: 17,
        fontFamily: theme.fonts.bold,
        fontWeight: Platform.OS === 'android' ? 'bold' : '600',
        color: theme.colors.text,
      },
      // ... (estilos de messageList, messageBubble, inputContainer, etc., permanecem os mesmos) ...
      messageList: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      messageListContent: {
          paddingHorizontal: 10,
          paddingVertical: 15,
          flexGrow: 1,
      },
       systemMessageContainer: {
        alignSelf: 'center',
        marginVertical: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: theme.colors.border,
        borderRadius: 15,
      },
      systemMessageText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
      },
      messageRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      userMessageRow: {
        justifyContent: 'flex-end',
        marginLeft: 50,
      },
      doctorMessageRow: {
        justifyContent: 'flex-start',
        marginRight: 50,
      },
      messageBubble: {
        maxWidth: '100%',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      userMessageBubble: {
        backgroundColor: theme.colors.userBubble,
        borderBottomRightRadius: 5,
      },
      doctorMessageBubble: {
        backgroundColor: theme.colors.doctorBubble,
        borderBottomLeftRadius: 5,
      },
      userMessageText: {
        fontSize: 15,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text,
      },
      doctorMessageText: {
        fontSize: 15,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text,
      },
      timestampText: {
        fontSize: 11,
        fontFamily: theme.fonts.regular,
        color: theme.colors.textMuted,
        marginTop: 5,
      },
       userTimestamp: {
          alignSelf: 'flex-end',
       },
       doctorTimestamp: {
          alignSelf: 'flex-start',
       },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
      },
      textInput: {
        flex: 1,
        minHeight: 42,
        maxHeight: 120,
        backgroundColor: theme.colors.background,
        borderRadius: 21,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 16,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text,
        marginRight: 8,
      },
      sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
      },
      sendButtonDisabled: {
         backgroundColor: theme.colors.primary + '80',
         elevation: 0,
      },
      errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: theme.colors.background,
        },
        errorText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 15,
        },
        backButtonText: {
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: 'bold',
        }
});

export default ChatScreen;