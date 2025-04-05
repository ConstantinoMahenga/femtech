import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ícones para voltar, enviar, etc.

// --- TEMA (Padrão Rosa consistente) ---
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa Principal
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    placeholder: '#aaa', // Placeholder do input
    background: '#f7f7f7', // Fundo da área de mensagens
    border: '#eee',
    cardBackground: '#fff', // Fundo do header e área de input
    userBubble: '#FFC0CB', // Rosa claro para o balão do usuário
    doctorBubble: '#ECECEC', // Cinza claro para o balão do médico
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  }
};

// --- DADOS FAKE INICIAIS (Só para exemplo dentro da tela) ---
const initialMessages = [
  { id: 'msg4', text: 'Claro, pode perguntar.', sender: 'doctor', timestamp: '10:47' },
  { id: 'msg3', text: 'Oi Dra. Sofia, estou com algumas dúvidas sobre meu último exame.', sender: 'user', timestamp: '10:46' },
  { id: 'msg2', text: 'Olá! Como posso ajudar hoje?', sender: 'doctor', timestamp: '10:45' },
  { id: 'msg1', text: 'Consulta iniciada', sender: 'system', timestamp: '10:44' },
].sort((a, b) => new Date('1970/01/01 ' + b.timestamp) - new Date('1970/01/01 ' + a.timestamp)); // Ordena por hora (simples)


// --- COMPONENTE DO ITEM DE MENSAGEM (Balão) ---
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

// --- TELA PRINCIPAL DO CHAT INTERNO ---
function ChatScreen({ route, navigation }) {
  // Pega os dados do médico da navegação (ESSENCIAL)
  const doctorId = route?.params?.doctorId;
  const doctorName = route?.params?.doctorName;
  const doctorImage = route?.params?.doctorImage;

  const [messages, setMessages] = useState(initialMessages); // Estado para as mensagens
  const [inputText, setInputText] = useState(''); // Estado para o campo de texto
  const flatListRef = useRef(null); // Referência para a lista

  // Verifica se os dados do médico foram recebidos
   if (!route || !route.params || !doctorId || !doctorName) {
    console.error("ChatScreen: Parâmetros de rota (dados do médico) ausentes!", route);
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

  // Função para enviar mensagem
  const handleSend = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return; // Não envia vazio

    const newMessage = {
      id: `msg-${Date.now()}-user`, // ID único simples
      text: trimmedText,
      sender: 'user', // Remetente é o usuário
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // Adiciona a mensagem no início (FlatList invertida)
    setMessages(prevMessages => [newMessage, ...prevMessages]);
    setInputText(''); // Limpa input
    Keyboard.dismiss(); // Fecha teclado

    // SIMULAÇÃO de resposta do médico
    setTimeout(() => {
      const doctorReply = {
        id: `msg-${Date.now()}-doc`,
        text: 'Entendido. Analisando sua mensagem.',
        sender: 'doctor', // Remetente é o médico
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [doctorReply, ...prevMessages]);
    }, 1500);

  }, [inputText]); // Depende do inputText para pegar o valor atual

  // Renderiza cada balão de mensagem
  const renderMessageItem = useCallback(({ item }) => <MessageItem item={item} />, []);

  // Efeito para rolar a lista para baixo (mensagem mais recente)
  useEffect(() => {
    // A FlatList invertida rola para o início (offset 0) para mostrar o item mais recente
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages]); // Executa sempre que a lista de mensagens mudar

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBackground} />

      {/* === CABEÇALHO DA CONVERSA === */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Image source={{ uri: doctorImage || 'https://via.placeholder.com/40' }} style={styles.headerImage} />
        <Text style={styles.headerName} numberOfLines={1}>{doctorName}</Text>
        {/* Pode adicionar mais ícones aqui (ex: chamada) */}
      </View>

      {/* === CONTAINER PRINCIPAL (LISTA + INPUT) === */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0} // Ajuste conforme a altura do header/tabbar
      >
        {/* === LISTA DE MENSAGENS === */}
        <FlatList
          ref={flatListRef} // Associa a referência
          data={messages} // Array de mensagens
          renderItem={renderMessageItem} // Função que desenha cada balão
          keyExtractor={item => item.id} // Chave única
          style={styles.messageList} // Estilo da área da lista
          contentContainerStyle={styles.messageListContent} // Estilo do conteúdo interno
          inverted // **ESSENCIAL para chat (mostra de baixo para cima)**
          showsVerticalScrollIndicator={false}
        />

        {/* === ÁREA DE INPUT DE MENSAGEM === */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline // Permite quebrar linha
          />
          <TouchableOpacity
             style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} // Estilo muda se input vazio
             onPress={handleSend}
             disabled={!inputText.trim()} // Botão desabilitado se input vazio
          >
            <Icon name="send" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS (Mantidos da versão anterior, relevantes para o chat interno) ---
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
        marginRight: 5,
      },
      headerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: theme.colors.border,
      },
      headerName: {
        flex: 1,
        fontSize: 17,
        fontFamily: theme.fonts.bold,
        fontWeight: Platform.OS === 'android' ? 'bold' : '600',
        color: theme.colors.text,
      },
      messageList: {
        flex: 1,
        backgroundColor: theme.colors.background, // Fundo da lista
      },
      messageListContent: {
          paddingHorizontal: 10,
          paddingVertical: 15,
          flexGrow: 1, // Ajuda a ocupar espaço vertical
          // justifyContent: 'flex-end', // Com inverted, geralmente não necessário
      },
       systemMessageContainer: { // Estilo para mensagens do sistema
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
      messageRow: { // Linha de cada mensagem
        flexDirection: 'row',
        marginBottom: 10,
      },
      userMessageRow: { // Alinhamento para usuário
        justifyContent: 'flex-end',
        marginLeft: 50, // Espaço à esquerda para não colar na borda
      },
      doctorMessageRow: { // Alinhamento para médico
        justifyContent: 'flex-start',
        marginRight: 50, // Espaço à direita
      },
      messageBubble: { // Estilo base do balão
        maxWidth: '100%', // Usa o espaço dado pela margem da Row
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      userMessageBubble: { // Balão do usuário (Rosa)
        backgroundColor: theme.colors.userBubble,
        borderBottomRightRadius: 5, // Detalhe de estilo
      },
      doctorMessageBubble: { // Balão do médico (Cinza)
        backgroundColor: theme.colors.doctorBubble,
        borderBottomLeftRadius: 5, // Detalhe de estilo
      },
      userMessageText: { // Texto dentro do balão do usuário
        fontSize: 15,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text, // Preto sobre rosa claro funciona bem
      },
      doctorMessageText: { // Texto dentro do balão do médico
        fontSize: 15,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text,
      },
      timestampText: { // Estilo da hora/data da mensagem
        fontSize: 11,
        fontFamily: theme.fonts.regular,
        color: theme.colors.textMuted, // Cor suave
        marginTop: 5,
      },
       userTimestamp: { // Alinha hora no balão do usuário
          alignSelf: 'flex-end',
       },
       doctorTimestamp: { // Alinha hora no balão do médico
          alignSelf: 'flex-start',
       },
      inputContainer: { // Área do campo de texto e botão enviar
        flexDirection: 'row',
        alignItems: 'center', // Alinha input e botão verticalmente
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
      },
      textInput: { // Campo de texto
        flex: 1, // Ocupa espaço disponível
        minHeight: 42,
        maxHeight: 120, // Limita altura se multiline crescer muito
        backgroundColor: theme.colors.background, // Fundo cinza claro
        borderRadius: 21,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 16,
        fontFamily: theme.fonts.regular,
        color: theme.colors.text,
        marginRight: 8,
      },
      sendButton: { // Botão de enviar (habilitado)
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.primary, // Rosa
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
      },
      sendButtonDisabled: { // Botão de enviar (desabilitado)
         backgroundColor: theme.colors.primary + '80', // Rosa mais transparente
         elevation: 0,
      },
      // Estilos de erro (se falhar ao carregar dados do médico)
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: theme.colors.background,
        },
        errorText: {
            fontSize: 16, // Diminuí um pouco
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