import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';

// <<< CONFIGURAÇÃO  >>>
const sendMessageToOpenAI = async (message) => {
  const apiKey = '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';
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  try {
    const response = await axios.post(
      endpoint,
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://meuapp.com', 
          'X-Title': 'MeuAppChatBot'
        },
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    return reply;
  } catch (error) {
    console.error('Erro na API OpenRouter:', error.response?.data || error.message);
    throw new Error('Erro ao se comunicar com o modelo via OpenRouter.');
  }
};

// <<< CORES DO TEMA >>>
const themePink = '#E83E8C';
const themePinkLight = '#F4A5C7';
const themeGray = '#E5E5EA';
const backgroundColor = '#F9F9F9';
const headerBackgroundColor = '#FFFFFF';
const inputBackgroundColor = '#F0F0F0';
const textColorLight = '#FFFFFF';
const textColorDark = '#000000';
const headerTextColor = '#333';
const borderColor = '#E0E0E0';

function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '0', text: 'Olá! Sou Maia seu assistente. Como posso ajudar?', sender: 'bot' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage || loading) return;

    const newUserMessage = { id: Date.now().toString(), text: trimmedMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserMessage('');
    Keyboard.dismiss();
    setLoading(true);

    try {
      const chatResponse = await sendMessageToOpenAI(trimmedMessage);
      const botMessage = { id: (Date.now() + 1).toString(), text: chatResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao enviar a mensagem.',
        sender: 'bot',
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [userMessage, loading]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessageItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
        item.isError ? styles.errorBubble : null
      ]}
    >
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistente Virtual</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={userMessage}
            onChangeText={setUserMessage}
            multiline
            editable={!loading}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={textColorLight} />
            ) : (
              <Icon name="send" size={20} color={textColorLight} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
    backgroundColor: headerBackgroundColor,
  },
  backButton: {
    padding: 5,
    minWidth: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themePink,
  },
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: themePink,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: themeGray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#FFDDDD',
    borderColor: '#FF9999',
    borderWidth: 1,
  },
  userText: {
    color: textColorLight,
    fontSize: 16,
  },
  botText: {
    color: textColorDark,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: borderColor,
    backgroundColor: headerBackgroundColor,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: inputBackgroundColor,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    marginRight: 10,
    color: textColorDark,
  },
  sendButton: {
    backgroundColor: themePink,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: themePinkLight,
  },
});

export default ChatbotScreen;
