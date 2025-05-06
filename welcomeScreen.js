import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    LayoutAnimation, // Importar para animação de layout mais simples (alternativa)
    UIManager, // Necessário para LayoutAnimation no Android
    Platform // Para verificar a plataforma
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Habilitar LayoutAnimation no Android (opcional, mas pode simplificar animações de layout)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Componente Header (sem alterações) ---
const Header = () => (
    <View style={headerStyles.container}>
        <Text style={headerStyles.welcomeText}>Bem-vindo(a) ao TecMaia</Text>
        <Text style={headerStyles.subtitle}>Tecnologia para Mulher Atenta Inteligente Acolhida"</Text>
        <View style={headerStyles.decorativeLine} />
    </View>
);

// --- Componente TopicCard (MODIFICADO para ser Recursivo/Aninhado) ---
const TopicCard = ({
    topic,
    onPress, // Função para lidar com o clique no *cabeçalho* deste card
    onDetailsPress, // Função para lidar com o clique no botão "Saber mais"
    level = 0 // Nível de aninhamento (0 = principal, 1 = sub-tópico, etc.)
}) => {
    // Usaremos LayoutAnimation para simplificar a animação de altura neste caso,
    // em vez de Animated API manual para o conteúdo interno.
    // A animação do chevron ainda usa Animated.
    const rotationAnim = useRef(new Animated.Value(topic.isExpanded ? 1 : 0)).current;

    useEffect(() => {
        // Animação apenas para o ícone de rotação
        Animated.timing(rotationAnim, {
            toValue: topic.isExpanded ? 1 : 0,
            duration: 250,
            easing: Easing.ease,
            useNativeDriver: true, // Rotação pode usar native driver
        }).start();
    }, [topic.isExpanded]);

    const rotateInterpolate = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const handleHeaderPress = () => {
        // Configura a animação de layout *antes* da mudança de estado
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onPress(topic.id); // Chama a função passada para atualizar o estado
    };

    // Estilo de indentação para sub-tópicos
    const cardStyle = [
        styles.card,
        level > 0 && styles.subCard // Aplica margem se for sub-tópico
    ];

    const headerStyle = [
      styles.header,
      level > 0 && styles.subHeader // Estilo opcional para header de sub-tópico
    ];

    return (
        <View style={cardStyle}>
            {/* Cabeçalho Clicável (Título + Chevron) */}
            <TouchableOpacity
                onPress={handleHeaderPress} // Usa a função com LayoutAnimation
                activeOpacity={0.8}
                style={styles.headerButton}
            >
                <View style={headerStyle}>
                    <Text style={styles.title}>{topic.title}</Text>
                    <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                        <Icon name="chevron-down" size={20} color="#E83E8C" />
                    </Animated.View>
                </View>
            </TouchableOpacity>

            {/* Conteúdo Expansível */}
            {topic.isExpanded && (
                <View style={styles.contentContainer}>
                    {topic.subTopics ? (
                        // Se tiver sub-tópicos, renderiza uma lista deles usando TopicCard recursivamente
                        <View style={styles.subTopicList}>
                            {topic.subTopics.map(subTopic => (
                                <TopicCard
                                    key={subTopic.id}
                                    topic={subTopic}
                                    onPress={onPress} // Passa a *mesma* função onPress para os filhos
                                    onDetailsPress={onDetailsPress} // Passa a função de detalhes
                                    level={level + 1} // Incrementa o nível de aninhamento
                                />
                            ))}
                        </View>
                    ) : topic.description ? (
                        // Se NÃO tiver sub-tópicos mas tiver descrição, mostra descrição e botão
                        <View style={styles.content}>
                            <Text style={styles.description}>{topic.description}</Text>
                            <TouchableOpacity
                                // Chama onDetailsPress com o ID e título deste tópico específico
                                onPress={() => onDetailsPress({ topicId: topic.id, topicTitle: topic.title })}
                                style={styles.button}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Saber mais</Text>
                                <Icon name="arrow-right" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : null /* Caso não tenha nem sub-tópico nem descrição (pouco provável) */}
                </View>
            )}
        </View>
    );
};


// --- Componente HomeScreen (MODIFICADO) ---
const HomeScreen = ({ navigation }) => {
    const [topics, setTopics] = useState([
        // Tópicos Principais
        { id: 1, title: 'Ciclo Menstrual', description: 'O ciclo menstrual é o intervalo de tempo entre o primeiro dia da menstruação e o...', isExpanded: false },
        { id: 2, title: 'Gravidez', description: 'Informações sobre sinais de gravidez, desenvolvimento fetal, cuidados pré-natais e parto.', isExpanded: false },
        { id: 3, title: 'Fertilidade', description: 'Principais causas da infertilidade na mulher, opções de tratamento e dicas para aumentar a fertilidade.', isExpanded: false },
        { id: 4, title: 'Menopausa', description: 'Sintomas comuns da menopausa e como aliviar esses sintomas.', isExpanded: false },
        { id: 5, title: 'Bem-Estar Íntimo', description: 'Dicas para manter a saúde vaginal, higiene íntima adequada e prevenção de infecções.', isExpanded: false },

        // --- HIV e SIDA com Sub-tópicos Aninhados ---
        {
            id: 11,
            title: 'HIV e SIDA',
            isExpanded: false,
            // Este tópico principal NÃO tem descrição direta, apenas sub-tópicos
            subTopics: [
                { id: 'hiv-prev', title: 'Prevenção do HIV', description: 'Informações detalhadas sobre métodos de prevenção combinada: preservativos, PrEP, PEP, etc.', isExpanded: false },
                { id: 'hiv-test', title: 'Testagem de HIV', description: 'Tipos de testes disponíveis (rápidos, laboratoriais), onde e quando fazer o teste.', isExpanded: false },
                { id: 'hiv-tarv', title: 'Tratamento (TARV)', description: 'Como funciona a Terapia Antirretroviral (TARV), importância da adesão e carga viral indetectável.', isExpanded: false },
                { id: 'hiv-ptv', title: 'Prevenção Transmissão Vertical (PTV)', description: 'Cuidados durante a gravidez, parto e amamentação para evitar a transmissão do HIV da mãe para o bebé.', isExpanded: false },
                 ]
        },
        // --- Outros Tópicos Principais ---
         {
            id: 12,
            title: 'Infeções de Transmissão Sexual (ITS)',
            description: 'Conheça as ITS mais comuns (Clamídia, Gonorreia, Sífilis, HPV, Herpes), prevenção, sintomas e tratamento.',
            isExpanded: false
        },
        {
            id: 13,
            title: 'Doenças Mais Comuns em Mulheres',
            description: 'Informações sobre Endometriose, SOP, Cancro do Colo do Útero e da Mama, Osteoporose.',
            isExpanded: false
        },
         { id: 7, title: 'Prevenção e Contracepção', description: 'Métodos contraceptivos disponíveis, como pílulas, DIU, preservativos e outros.', isExpanded: false },
        { id: 8, title: 'Saúde Mental', description: 'Importância do cuidado com a saúde mental, como lidar com stress, ansiedade e depressão.', isExpanded: false },
        { id: 9, title: 'Nutrição', description: 'Dicas de alimentação saudável para mulheres em diferentes fases da vida.', isExpanded: false },
      

        {
          id: 10, title:'Cancro da Mama', description: 'Informações sobre sinais de alerta, autoexame e mamografia.', isExpanded: false,
        }


    ].sort((a, b) => a.id - b.id)); // Ordenar por ID para garantir a ordem

    // Função para atualizar o estado de expansão (funciona para N níveis)
    const toggleExpand = (topicIdToToggle) => {
        const updateExpansionState = (items) => {
            return items.map(item => {
                let newItem = { ...item }; // Copia o item
                let wasToggled = false;

                if (newItem.id === topicIdToToggle) {
                    // Encontrou o item a ser alternado
                    newItem.isExpanded = !newItem.isExpanded;
                    wasToggled = true;
                    // Opcional: Se está abrindo este, feche os irmãos diretos?
                    // (Implementação abaixo foca em fechar *outros* ramos principais ao abrir um principal)

                } else {
                     // Opcional: Fechar outros itens no mesmo nível?
                     // Se desejar fechar irmãos diretos, a lógica precisaria ser ajustada aqui
                     // newItem.isExpanded = false; // Exemplo simples (fecharia todos os outros)
                }

                // Se o item tem sub-tópicos, chama a função recursivamente para eles
                if (newItem.subTopics) {
                    const result = updateExpansionState(newItem.subTopics);
                    newItem.subTopics = result.updatedItems;
                    // Se um dos filhos foi alternado, marca este ramo como ativo (não fecha ele)
                    if (result.toggledInChildren) {
                        wasToggled = true;
                    }
                }

                return newItem; // Retorna o item (potencialmente modificado)
            });
        };


        setTopics(currentTopics => {
             let itemToggledLevel = -1; // Nível do item que foi clicado

             // Função recursiva para encontrar o nível e atualizar
            const findAndUpdate = (items, currentLevel) => {
                 let toggledInChildren = false;
                 const updated = items.map(item => {
                     let newItem = {...item};
                     let toggledHere = false;

                     if(item.id === topicIdToToggle) {
                         newItem.isExpanded = !item.isExpanded;
                         itemToggledLevel = currentLevel; // Marca o nível que foi clicado
                         toggledHere = true;
                          toggledInChildren = true; // Marca que houve alteração neste ramo
                     }

                     if (item.subTopics) {
                         const subResult = findAndUpdate(item.subTopics, currentLevel + 1);
                         newItem.subTopics = subResult.updatedItems;
                         if (subResult.toggledInChildren) {
                             toggledInChildren = true; // Propaga a informação que houve alteração
                         }
                     }
                     return newItem;
                 });
                  return { updatedItems: updated, toggledInChildren };
            }

            // Função recursiva para fechar outros itens
             const closeOthers = (items, currentLevel) => {
                  return items.map(item => {
                       let newItem = {...item};
                       // Só fecha se:
                       // 1. O clique foi num item de nível superior (itemToggledLevel === 0)
                       // 2. Este item NÃO é o que foi clicado
                       // 3. Este item ESTÁ no nível superior (currentLevel === 0)
                       if (itemToggledLevel === 0 && item.id !== topicIdToToggle && currentLevel === 0) {
                            newItem.isExpanded = false;
                       }

                       // Fecha recursivamente os filhos dos itens que foram fechados
                       if (newItem.isExpanded === false && newItem.subTopics) {
                            newItem.subTopics = closeOthers(newItem.subTopics, currentLevel + 1);
                       } else if (newItem.subTopics) { // Se não foi fechado, continua a recursão
                            newItem.subTopics = closeOthers(newItem.subTopics, currentLevel + 1);
                       }
                       return newItem;
                  });
             }

             // 1. Executa a busca e atualização
              const { updatedItems: toggledItems } = findAndUpdate(currentTopics, 0);

              // 2. Se um item de nível superior foi clicado, fecha os outros de nível superior
               const finalItems = closeOthers(toggledItems, 0);


            return finalItems;
        });
    };


    // Função unificada para navegar para detalhes
    const handleNavigateDetails = (params) => {
        // A tela 'Details' precisará verificar se recebeu 'topicId'
        // (que pode ser de um item principal ou de um subitem final)
        navigation.navigate('Details', params);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {topics.map((topic) => (
                    <TopicCard
                        key={topic.id} // Chave única para cada card
                        topic={topic}
                        onPress={toggleExpand} // Passa a função de toggle
                        onDetailsPress={handleNavigateDetails} // Passa a função de navegação
                        level={0} // Começa no nível 0
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};


// --- Estilos (com adições para sub-tópicos) ---
const headerStyles = StyleSheet.create({
    // ... (estilos do header iguais aos anteriores)
    container: {
        backgroundColor: '#E83E8C', // Cor principal mantida
        paddingTop: 30, // Aumentado para dar mais espaço, especialmente com safe area
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 25, // Suavizado
        borderBottomRightRadius: 25, // Suavizado
        marginBottom: 15, // Aumentado ligeiramente
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6, // Aumentado ligeiramente
    },
    welcomeText: {
        fontSize: 24, // Mantido
        fontWeight: '700', // Mantido
        color: 'white',
        textAlign: 'center',
        marginBottom: 5, // Mantido
    },
    subtitle: {
        fontSize: 15, // Ligeiramente menor para diferenciar mais
        color: 'rgba(255,255,255,0.9)', // Mantido
        textAlign: 'center',
        marginBottom: 15, // Aumentado
        paddingHorizontal: 10, // Adicionado para evitar quebra em telas menores
    },
    decorativeLine: {
        height: 3, // Mantido
        width: '40%', // Mantido
        backgroundColor: 'rgba(255,255,255,0.6)', // Ligeiramente mais opaco
        alignSelf: 'center',
        borderRadius: 3, // Mantido
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F4F8',
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 10, // Espaçamento entre cards
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden', // Importante para o borderRadius no conteúdo
    },
    subCard: { // Estilo para card aninhado
        marginLeft: 15, // Indentação
        marginRight: 0, // Remove margem direita se houver
        marginBottom: 8, // Menor espaçamento entre subitens
        elevation: 1, // Menor sombra
        shadowOpacity: 0.04,
        borderWidth: 1, // Borda sutil para diferenciar
        borderColor: '#eee',
        backgroundColor: '#fff' // Fundo branco explícito
    },
    headerButton: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14, // Um pouco menos padding vertical
        backgroundColor: 'white', // Garante fundo branco
    },
     subHeader: { // Estilo opcional para header de sub-tópico
        paddingVertical: 12, // Ainda menor
        backgroundColor: '#fdfdfd', // Fundo ligeiramente diferente
     },
    title: {
        fontSize: 16, // Tamanho ligeiramente menor
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    contentContainer: {
        // O container que aparece/desaparece com LayoutAnimation
        // Pode ter um padding se necessário, ou deixar para o conteúdo interno
    },
    subTopicList: {
        // Container para a lista de TopicCards aninhados
        paddingTop: 5, // Pequeno espaço acima do primeiro subitem
        paddingBottom: 5, // Pequeno espaço abaixo do último subitem
         backgroundColor: '#f9f9f9', // Fundo diferente para a área de sub-tópicos
         // Não precisa de padding horizontal aqui, pois subCard já tem margem
    },
    content: { // Estilos para descrição e botão (quando não há sub-tópicos)
        paddingTop: 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FAFAFF'
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: '#555',
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        backgroundColor: '#E83E8C',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 8,
    },
});

export default HomeScreen;