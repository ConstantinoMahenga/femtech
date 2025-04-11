import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert, // Para simular a ação do botão "Saber Mais"
  StatusBar,
  LayoutAnimation, // Para animação
  Platform,        // Para ajustes de OS
  UIManager,       // Para habilitar LayoutAnimation no Android
  // Removido Animated e useRef para simplificar (sem rotação de ícone suave)
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Ícone para expandir/contrair

// Habilitar LayoutAnimation no Android (faça isso uma vez, idealmente no App.js)
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Dados dos Tópicos ---
const healthTopicsData = [
  {
    id: '1',
    title: 'Ciclo Menstrual',
    description: 'O ciclo menstrual é um processo natural no corpo feminino que envolve alterações hormonais e prepara o útero para uma possível gravidez. Entender suas fases pode ajudar no autoconhecimento e bem-estar.',
  },
  {
    id: '2',
    title: 'Gravidez',
    description: 'A gravidez é o período de desenvolvimento de um ou mais descendentes no útero da mulher. Acompanhamento médico regular (pré-natal) é essencial para a saúde da mãe e do bebê.',
  },
  {
    id: '3',
    title: 'Fertilidade',
    description: 'Fertilidade refere-se à capacidade natural de produzir descendência. Existem períodos mais férteis no ciclo menstrual e diversos fatores podem influenciar a fertilidade masculina e feminina.',
  },
  {
    id: '4',
    title: 'Menopausa',
    description: 'A menopausa marca o fim dos ciclos menstruais e da fertilidade feminina, geralmente ocorrendo entre 45 e 55 anos. Pode vir acompanhada de sintomas que podem ser gerenciados com orientação médica.',
  },
  {
    id: '5',
    title: 'Bem-Estar Íntimo',
    description: 'Cuidar da saúde íntima envolve higiene adequada, uso de produtos apropriados e atenção a sinais como corrimentos anormais, coceira ou odor, buscando orientação médica quando necessário.',
  },
  {
    id: '6',
    title: 'Doenças Comuns',
    description: 'Informações sobre condições ginecológicas comuns como candidíase, vaginose bacteriana, endometriose, SOP (Síndrome dos Ovários Policísticos), e a importância do diagnóstico precoce.',
  },
  {
    id: '7',
    title: 'Prevenção',
    description: 'A prevenção em saúde da mulher inclui exames regulares (Papanicolau, mamografia), vacinação (HPV), uso de preservativos para ISTs e adoção de hábitos de vida saudáveis.',
  },
  {
    id: '8',
    title: 'Saúde Mental',
    description: 'A saúde mental é fundamental em todas as fases da vida. Fatores hormonais, sociais e de vida podem impactá-la. Buscar apoio psicológico é um ato de autocuidado.',
  },
  
];

// --- Componente Principal da Tela ---
const HealthTopicsSingleScreen = ({ navigation }) => { // Recebe navigation se precisar
  // Estado para controlar quais cards estão expandidos (ID do tópico como chave)
  const [expandedStates, setExpandedStates] = useState({});

  // Função para alternar a expansão de um card específico
  const toggleExpand = useCallback((topicId) => {
    // Configura a animação ANTES de mudar o estado
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedStates(prevStates => ({
      ...prevStates, // Mantém o estado dos outros cards
      [topicId]: !prevStates[topicId] // Inverte o estado do card clicado
    }));
  }, []); // useCallback para otimização

  // Função chamada quando o botão "Saber Mais" é pressionado
  const handleLearnMorePress = useCallback((topicTitle) => {
    Alert.alert(
      `Saber Mais sobre ${topicTitle}`,
      `Aqui você navegaria para uma tela com informações detalhadas sobre ${topicTitle}.`
    );
    // Exemplo: navigation.navigate('TopicDetail', { title: topicTitle });
  }, []); // useCallback se não depender de estado que muda frequentemente

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
      <ScrollView style={styles.container}>
        <Text style={styles.screenTitle}>Bem vindo(a)! a Maia</Text>

        {/* Mapeia os dados para renderizar cada card */}
        {healthTopicsData.map((topic) => {
          // Verifica se o card atual está expandido
          const isExpanded = !!expandedStates[topic.id];

          return (
            <View key={topic.id} style={styles.cardContainer}>
              {/* Cabeçalho Clicável */}
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleExpand(topic.id)} // Chama toggle com o ID
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>{topic.title}</Text>
                {/* Ícone muda baseado no estado (sem animação de rotação suave) */}
                <Icon
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#E83E8C"
                />
              </TouchableOpacity>

              {/* Corpo Expansível */}
              {isExpanded && (
                <View style={styles.cardBody}>
                  <Text style={styles.cardDescription}>{topic.description}</Text>
                  <TouchableOpacity
                    style={styles.learnMoreButton}
                    onPress={() => handleLearnMorePress(topic.title)}
                  >
                    <Text style={styles.learnMoreButtonText}>Saber Mais</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F8', // Fundo da tela
  },
  container: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  // Estilos do Card (anteriormente em ExpandableCard.js)
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 15,
    overflow: 'hidden', // Essencial para LayoutAnimation e borderRadius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1, // Ocupa espaço
    marginRight: 10,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  cardDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 21,
    marginBottom: 15,
  },
  learnMoreButton: {
    backgroundColor: '#E83E8C', // Cor rosa
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  learnMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HealthTopicsSingleScreen; 