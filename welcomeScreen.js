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
    LayoutAnimation,
    UIManager,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Habilitar LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Componente Header ---
const Header = () => (
    <View style={headerStyles.container}>
        <Text style={headerStyles.welcomeText}>Bem-vindo(a) ao TecMaia</Text>
        <Text style={headerStyles.subtitle}>Tecnologia para Mulher Atenta Inteligente Acolhida"</Text>
        <View style={headerStyles.decorativeLine} />
    </View>
);

// --- Componente TopicCard (Recursivo - sem alterações) ---
const TopicCard = ({ topic, onPress, onDetailsPress, level = 0 }) => {
    const rotationAnim = useRef(new Animated.Value(topic.isExpanded ? 1 : 0)).current;
    useEffect(() => { Animated.timing(rotationAnim, { toValue: topic.isExpanded ? 1 : 0, duration: 250, easing: Easing.ease, useNativeDriver: true, }).start(); }, [topic.isExpanded, rotationAnim]);
    const rotateInterpolate = rotationAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const handleHeaderPress = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); onPress(topic.id); };
    const cardStyle = [ styles.card, level > 0 && styles.subCard ];
    const headerStyle = [ styles.header, level > 0 && styles.subHeader ];
    return (
        <View style={cardStyle}>
            <TouchableOpacity onPress={handleHeaderPress} activeOpacity={0.8} style={styles.headerButton}>
                <View style={headerStyle}>
                    <Text style={styles.title}>{topic.title}</Text>
                    <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}><Icon name="chevron-down" size={20} color="#E83E8C" /></Animated.View>
                </View>
            </TouchableOpacity>
            {topic.isExpanded && (
                <View style={styles.contentContainer}>
                    {topic.subTopics ? ( <View style={styles.subTopicList}>{topic.subTopics.map(subTopic => ( <TopicCard key={subTopic.id} topic={subTopic} onPress={onPress} onDetailsPress={onDetailsPress} level={level + 1} /> ))}</View> )
                    : topic.description ? ( <View style={styles.content}><Text style={styles.description}>{topic.description}</Text><TouchableOpacity onPress={() => onDetailsPress({ topicId: topic.id, topicTitle: topic.title })} style={styles.button} activeOpacity={0.8}><Text style={styles.buttonText}>Saber mais</Text><Icon name="arrow-right" size={16} color="white" /></TouchableOpacity></View> )
                    : null}
                </View>
            )}
        </View>
    );
};

// --- Componente HomeScreen (ESTADO `topics` REESTRUTURADO) ---
const HomeScreen = ({ navigation }) => {
    const [topics, setTopics] = useState([
        // 1. Saúde Sexual e Reprodutiva para Adolescentes, Jovens e Mulheres
        {
            id: 'saude-sexual-reprodutiva', // Usando ID mais descritivo, original era 6
            title: 'Saúde Sexual e Reprodutiva para Adolescentes, Jovens e Mulheres',
            isExpanded: false,
            subTopics: [
                { id: 1, title: 'Ciclo Menstrual', description: 'O ciclo menstrual é o intervalo de tempo entre o primeiro dia da menstruação e o dia anterior à menstruação seguinte. Compreender o seu ciclo é fundamental para a saúde e bem-estar.', isExpanded: false },
                { id: 5, title: 'Bem-Estar Íntimo', description: 'Dicas para manter a saúde vaginal, incluindo higiene adequada, identificação de sinais de infecção e quando procurar ajuda médica.', isExpanded: false },
                { id: 2, title: 'Gravidez', description: 'Informações sobre sinais de gravidez, cuidados pré-natais, desenvolvimento fetal, parto e pós-parto.', isExpanded: false },
                { id: 7, title: 'Planeamento Familiar', description: 'Os métodos contraceptivos ajudam-nos a evitar uma gravidez não planeada e a regular a fecundidade. Conheça as opções disponíveis e escolha a mais adequada para si.', isExpanded: false },
                { id: 3, title: 'Fertilidade', description: 'Principais causas da infertilidade na mulher, opções de tratamento e quando procurar um especialista.', isExpanded: false },
                { id: 4, title: 'Menopausa', description: 'Sintomas comuns da menopausa, como ondas de calor e alterações de humor, e formas de gerir esta fase da vida com saúde.', isExpanded: false },
            ]
        },
        // 2. HIV e ITS
        {
            id: 11, // Mantendo ID original
            title: 'HIV e ITS', // Título atualizado conforme solicitado
            isExpanded: false,
            subTopics: [
                { id: 12, title: 'Infeções de Transmissão Sexual (ITS)', description: 'Conheça as ITS mais comuns, como clamídia, gonorreia, sífilis e HPV, incluindo sintomas, prevenção e tratamento.', isExpanded: false },
                { id: 'hiv-prev', title: 'Prevenção do HIV', description: 'Informações detalhadas sobre métodos de prevenção do HIV, como o uso de preservativos, PrEP (Profilaxia Pré-Exposição) e PEP (Profilaxia Pós-Exposição).', isExpanded: false },
                { id: 'hiv-test', title: 'Testagem de HIV', description: 'Tipos de testes disponíveis para o diagnóstico do HIV, importância da testagem regular e onde realizar o teste.', isExpanded: false },
                { id: 'hiv-tarv', title: 'Tratamento (TARV)', description: 'Como funciona a Terapia Antirretroviral (TARV) para pessoas vivendo com HIV, seus benefícios e a importância da adesão ao tratamento.', isExpanded: false },
                { id: 'hiv-ptv', title: 'Prevenção Transmissão Vertical (PTV)', description: 'Cuidados durante a gravidez, parto e amamentação para prevenir a transmissão do HIV da mãe para o bebé.', isExpanded: false },
            ]
        },
        // 3. Violência Baseada no Género (VBG)
        {
            id: 14, // Mantendo ID original
            title: 'Violência Baseada no Género (VBG)',
            description: 'É um termo usado para descrever qualquer ato prejudicial perpetrado contra a vontade de uma pessoa, e que é baseado nas diferenças socialmente atribuídas (género) entre homens e mulheres. Inclui violência física, sexual, psicológica e económica.',
            isExpanded: false
        },
        // 4. Doenças Mais Comuns em Mulheres
        {
            id: 13, // Mantendo ID original
            title: 'Doenças Mais Comuns em Mulheres',
            description: 'Informações sobre doenças como Endometriose, Síndrome do Ovário Policístico (SOP), miomas uterinos, infeções urinárias recorrentes, e cancro ginecológico.',
            isExpanded: false
        },
        // 5. Saúde Mental
        {
            id: 8, // Mantendo ID original
            title: 'Saúde Mental',
            description: 'Importância do cuidado com a saúde mental, reconhecendo sinais de alerta para depressão, ansiedade e outros transtornos. Onde procurar ajuda e dicas para o bem-estar emocional.',
            isExpanded: false
        },
        // 6. Nutrição
        {
            id: 9, // Mantendo ID original
            title: 'Nutrição',
            description: 'Dicas de alimentação saudável para as diferentes fases da vida da mulher, incluindo gestação, amamentação e menopausa. Importância de uma dieta equilibrada para a prevenção de doenças.',
            isExpanded: false
        },
        // 7. Literacia Financeira
        {
            id: 15, // Mantendo ID original
            title:'Literacia Financeira',
            description: 'A literacia financeira é a capacidade de entender e usar eficazmente várias habilidades financeiras, incluindo gestão financeira pessoal, orçamento e investimento.',
            isExpanded: false,
            subTopics: [
                { id: 'lf-vsla', title: 'Grupos de Poupança e Empréstimos Acumulados (VSLA)', description: 'O Grupo de Poupanças e Empréstimo (VSLA) é uma metodologia que permite que pessoas, especialmente em comunidades de baixa renda, poupem dinheiro e tenham acesso a pequenos empréstimos.', isExpanded: false },
                { id: 'lf-formacao', title: 'Formação Profissional Hardware e Software', description: 'Aprenda sobre cursos e oportunidades em manutenção de computadores (hardware) e desenvolvimento de aplicações (software) para impulsionar sua carreira.', isExpanded: false },
                { id: 'lf-reciclagem', title: 'Transformação em reciclagem de lixo eletrónico', description: 'Entenda o processo e a importância da reciclagem de lixo eletrônico, transformando resíduos em oportunidades e protegendo o meio ambiente.', isExpanded: false },
            ]
        }
        // Removido o .sort() para manter a ordem manual definida acima
    ]);

    // Função toggleExpand (sem alterações)
    const toggleExpand = (topicIdToToggle) => {
        let itemToggledLevel = -1;
        const findAndUpdate = (items, currentLevel) => {
            let toggledInChildren = false;
            const updated = items.map(item => {
                let newItem = {...item};
                if(item.id === topicIdToToggle) {
                    newItem.isExpanded = !item.isExpanded;
                    itemToggledLevel = currentLevel;
                    toggledInChildren = true;
                }
                if (item.subTopics) {
                    const subResult = findAndUpdate(item.subTopics, currentLevel + 1);
                    newItem.subTopics = subResult.updatedItems;
                    if (subResult.toggledInChildren) toggledInChildren = true;
                }
                return newItem;
            });
            return { updatedItems: updated, toggledInChildren };
        };

        const closeOthers = (items, currentLevel) => {
            return items.map(item => {
                let newItem = {...item};
                // Apenas fecha outros tópicos do mesmo nível se o item clicado for de nível 0 (principal)
                if (itemToggledLevel === 0 && item.id !== topicIdToToggle && currentLevel === 0) {
                    newItem.isExpanded = false;
                }
                 if (newItem.isExpanded === false && newItem.subTopics) {
                    newItem.subTopics = closeSubTopics(newItem.subTopics); // Função auxiliar para fechar todos os subníveis
                } else if (newItem.subTopics) { // Continua a recursão para outros casos (ex: fechar irmãos de subníveis)
                    newItem.subTopics = closeOthers(newItem.subTopics, currentLevel + 1);
                }
                return newItem;
            });
        };

        // Função auxiliar para fechar recursivamente todos os sub-tópicos
        const closeSubTopics = (subItems) => {
            return subItems.map(subItem => {
                let newSubItem = {...subItem, isExpanded: false};
                if (newSubItem.subTopics) {
                    newSubItem.subTopics = closeSubTopics(newSubItem.subTopics);
                }
                return newSubItem;
            });
        };

        setTopics(currentTopics => {
            const { updatedItems: toggledItems, toggledInChildren } = findAndUpdate(currentTopics, 0);
        
            const finalItems = closeOthers(toggledItems, 0);
            return finalItems;
        });
    };


    // Função de navegação (sem alterações)
    const handleNavigateDetails = (params) => { navigation.navigate('Details', params); };

    // Renderização (sem alterações)
    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} onPress={toggleExpand} onDetailsPress={handleNavigateDetails} level={0}/>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};


// --- Estilos (sem alterações) ---
const headerStyles = StyleSheet.create({ container: { backgroundColor: '#E83E8C', paddingTop: 30, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 }, welcomeText: { fontSize: 24, fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: 5 }, subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 }, decorativeLine: { height: 3, width: '40%', backgroundColor: 'rgba(255,255,255,0.6)', alignSelf: 'center', borderRadius: 3 } });
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: '#F4F4F8' }, container: { flex: 1, paddingHorizontal: 12 }, card: { backgroundColor: 'white', marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2, overflow: 'hidden' }, subCard: { marginLeft: 15, marginRight: 0, marginBottom: 8, elevation: 1, shadowOpacity: 0.04, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }, headerButton: { width: '100%' }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white' }, subHeader: { paddingVertical: 12, backgroundColor: '#fdfdfd' }, title: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 10 }, contentContainer: {}, subTopicList: { paddingTop: 5, paddingBottom: 5, backgroundColor: '#f9f9f9' }, content: { paddingTop: 12, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: '#FAFAFF' }, description: { fontSize: 14, lineHeight: 21, color: '#555', marginBottom: 16 }, button: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', backgroundColor: '#E83E8C', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, elevation: 2 }, buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14, marginRight: 8 } });

export default HomeScreen;