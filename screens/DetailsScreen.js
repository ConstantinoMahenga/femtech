
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet,

} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

//Definição do tema 
const theme = {
  colors: {
    primary: '#E83E8C', // Rosa cor idealizada
    background: '#F4F4F8',
    cardBackground: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
    consultButtonBackground: '#E83E8C', // Rosa
    consultButtonText: '#FFFFFF',
  },
};

// Lista de categorias (sem alterações, mas garantir que os títulos coincidem com os usados em `explanations` se possível)
const femtechCategories = [
  'Ciclo Menstrual', 'Gravidez', 'Fertilidade', 'Menopausa',
  'Bem-Estar Íntimo', 'Doenças Comuns', 'Prevenção e Contracepção',
  'Saúde Mental', 'Nutrição', 'Exercícios', 'Cancro da Mama', 'Cancro do Colo do Útero', // Mantido da versão anterior
  'ITS', // Título da barra, diferente da chave 'Infeções de Transmissão Sexual (ITS)' usada na explicação
  'HIV e SIDA', // Título da barra, coincide com a chave da explicação
  // Adicionar aqui outros sub-tópicos se quiser acesso rápido pela barra?
   'Prevenção do HIV', 'Testagem de HIV', 'Tratamento do HIV e SIDA – TARV', 'Prevenção da transmissão de HIV da Mãe para Filho (PTV)'
];


// Slider images (sem alterações)
const sliderImageUrls = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

// Dimensions and slide width (sem alterações)
const { width: screenWidth } = Dimensions.get('window');
const SLIDE_WIDTH = screenWidth;

// --- FUNÇÃO getTopicDetails COM OS TEXTOS ATUALIZADOS ---
const getTopicDetails = (topicTitle) => {
  // Objeto com as explicações detalhadas e completas (ATUALIZADO com seus textos)
  const explanations = {
    // Tópicos existentes mantidos como estavam na sua última versão
    'Ciclo Menstrual':'O ciclo menstrual é uma série de mudanças que o corpo da mulher passa para se preparar para uma possível gravidez. Cada mês, um dos ovários libera um óvulo - um processo chamado ovulação. Ao mesmo tempo, mudanças hormonais preparam o útero para a gravidez. Se a ovulação ocorre e o óvulo não é fertilizado, o revestimento do útero é eliminado através da vagina. Este é o período menstrual.',
    'Gravidez': 'A gravidez é o período de cerca de 9 meses em que uma mulher carrega um bebê em desenvolvimento em seu útero. Começa com a fertilização de um óvulo pelo espermatozoide e termina com o parto. Durante este tempo, o corpo da mulher passa por muitas mudanças físicas e hormonais para apoiar o crescimento do bebê.',
    'Fertilidade':'Fertilidade refere-se à capacidade natural de uma mulher produzir descendentes. A fertilidade feminina é influenciada por muitos fatores, incluindo idade, saúde geral, estilo de vida e condições médicas. O período mais fértil ocorre durante a ovulação, quando um óvulo maduro é liberado do ovário.',
    'Menopausa':'A menopausa marca o fim dos ciclos menstruais da mulher. É diagnosticada após 12 meses sem período menstrual. A menopausa pode acontecer entre os 40 e 50 anos e traz sintomas como ondas de calor, alterações de humor e mudanças no metabolismo, devido à diminuição dos níveis de estrogênio e progesterona.',
    'Bem-Estar Íntimo':'Manter a saúde íntima envolve práticas de higiene adequadas, uso de produtos apropriados e atenção a sinais de desequilíbrio. A vagina tem um pH naturalmente ácido que ajuda a prevenir infecções. Usar sabonetes suaves, roupas íntimas de algodão e evitar duchas vaginares são práticas recomendadas.',
    'Doenças Comuns':'As mulheres podem experimentar várias condições de saúde específicas, incluindo infecções por fungos, vaginose bacteriana, endometriose, síndrome dos ovários policísticos (SOP) e doença inflamatória pélvica (DIP). Reconhecer os sintomas e buscar tratamento precoce é essencial para a saúde a longo prazo. Além destas, o Cancro da Mama e o Cancro do Colo do Útero são preocupações significativas (ver secções específicas). Mulheres também têm maior risco para certas doenças como Osteoporose (especialmente pós-menopausa), doenças autoimunes (como Lúpus e Artrite Reumatoide) e algumas doenças cardíacas. Check-ups regulares ajudam na prevenção e manejo.',
    'Prevenção e Contracepção':'Medidas preventivas incluem exames ginecológicos regulares, como o Papanicolau para detecção precoce de câncer cervical, mamografias para câncer de mama, vacinação contra o HPV e uso de preservativos para prevenir infecções sexualmente transmissíveis (ISTs). Métodos contraceptivos disponíveis incluem pílulas, DIU, implantes, injeções, adesivos e métodos de barreira.',
    'Saúde Mental':'A saúde mental das mulheres pode ser afetada por fatores hormonais (como TPM e depressão pós-parto), sociais e de vida. Reconhecer sinais de ansiedade, depressão e outros problemas de saúde mental é importante, assim como buscar ajuda profissional quando necessário.',
    'Nutrição':'As necessidades nutricionais das mulheres mudam ao longo da vida. O cálcio e a vitamina D são importantes para a saúde óssea, especialmente após a menopausa. O ácido fólico é crucial durante os anos reprodutivos. Uma dieta equilibrada com frutas, vegetais, grãos integrais e proteínas magras apoia a saúde geral.',
    'Exercícios':'A prática regular de exercícios físicos é essencial para a saúde da mulher em todas as fases da vida. Atividades como yoga, pilates, caminhada e musculação trazem benefícios como fortalecimento muscular, melhora da saúde cardiovascular e controle do estresse.',
    'Doenças Mais Comuns em Mulheres': 'As mulheres podem experimentar várias condições de saúde específicas, incluindo infecções por fungos, vaginose bacteriana, endometriose, síndrome dos ovários policísticos (SOP) e doença inflamatória pélvica (DIP). Reconhecer os sintomas e buscar tratamento precoce é essencial para a saúde a longo prazo. Além destas, o Cancro da Mama e o Cancro do Colo do Útero são preocupações significativas (ver secções específicas). Mulheres também têm maior risco para certas doenças como Osteoporose (especialmente pós-menopausa), doenças autoimunes (como Lúpus e Artrite Reumatoide) e algumas doenças cardíacas. Check-ups regulares ajudam na prevenção e manejo.',

    // Textos ATUALIZADOS conforme solicitado
    'HIV e SIDA': 'O HIV (Vírus da Imunodeficiência Humana) é um vírus que ataca o sistema imunológico, destruindo as células CD4 que são essenciais para a defesa do organismo. À medida que o vírus se multiplica, o sistema imunológico fica mais fraco, permitindo o aparecimento de doenças oportunistas. Quando o sistema imunológico está muito danificado, pode evoluir para SIDA (Síndrome da Imunodeficiência Adquirida).',
    'Prevenção do HIV': 'HIV (Vírus de Imunodeficiência Humana) é um vírus que causa fraqueza no sistema de defesa do corpo humano, pois mata as células de defesa chamadas CD4. À medida que o HIV aumenta a quantidade do vírus no sangue, há uma diminuição das células de defesa o que permite o aparecimento de doenças.\n\nComo se transmite o HIV?\nO HIV é transmitido através de três vias:\n1. Transmissão sexual\n2. Transmissão vertical (de mãe para filho)\n3. Transfusão de sangue\n\nVIA SEXUAL: Transmissão por contacto sexual\nVIA TRANSMISSÃO VERTICAL: Transmissão da mãe para o filho pela gravidez, pelo nascimento ou pela amamentação\nVIA SANGUÍNEA: Transmissão pela via sanguínea, através de instrumentos cortantes infectados e seringas, ou transfusão de sangue e transplante de órgãos\n\nO HIV NÃO é transmitido por:\n- Picada por mosquitos\n- Vasos sanitários\n- Partilha de utensílios domésticos\n- Beijos ou abraços\n\nComo se previne o HIV?\n\nTransmissão Sexual:\n- Usar o preservativo, de forma correcta e persistente em todas as relações sexuais\n- Existem preservativos masculinos, femininos e barreiras de látex para o sexo oral\n\nTransmissão Vertical:\n- Se estiver grávida (ou estiver a pensar em engravidar) e for HIV positiva, é melhor aderir a consulta pré-natal o mais sedo possível e ao tratamentos do HIV (PTV)\n- Este tratamento reduz eficazmente o risco de transmissão do vírus ao seu futuro filho durante a gravidez e o parto\n\nTransfusão de Sangue:\n- Evitar a transfusão de sangue contaminado\n\nUso de Objectos Perfuro-Cortantes:\n- Evitar o uso de objectos como seringas, lâminas, agulhas, facas, que estejam contaminados\n- Deve esterilizar antes de usa-los',
    'Testagem de HIV': 'A única forma de saber se tem HIV (seró estado) é mediante um teste, onde se usa umas gotas de sangue. Se o primeiro teste for positivo, repete-se um segundo teste para confirmar o resultado. Em total, demora 50 minutos. Se os 2 testes forem positivos, então é HIV positivo.\n\nO que fazer para evitar ficar DOENTES?\n1º Saber se tem HIV ou não (fazer teste)\n2º No caso de ser positivo, fazer imediatamente o tratamento do HIV (TARV)',
    // Usando o título exato fornecido para o tratamento
    'Tratamento (TARV)': 'O HIV tem um tratamento que não é cura mas permite que as pessoas infectadas tenham uma vida normal, chama-se TARV (Terapia Antirretroviral).\n\nO TARV é um tratamento para toda a vida. São usados comprimidos que se tomam todos os dias e a mesma hora chamados antirretrovirais (ARVs). Os ARVs lutam contra o HIV e fazem com que o HIV fique dormido/Escondido no corpo.\n\nNo inicio de tratamento, as pessoas podem ter algumas reações como vómitos, diarreia enxaqueca ou alergias, até o corpo se habituar, pode demorar dias, até 1 ou 2 meses.\n\nComo sabemos que o tratamento está a correr bem?\n- As pessoas com HIV precisam fazer seguimento, mensal, trimestral ou semestral no hospital\n- Todas as pessoas que iniciam o tratamento de HIV devem fazer analise da Carga Viral apois 6 meses\n\nA carga viral é uma medida de quanto o HIV existe no sangue. A carga viral fornece informações sobre o desempenho dos ARVs no organismo, uma vez que os ARVs impedem o HIV de produzir mais cópias do vírus.\n\n- Carga viral ALTA: +1.000 ou mais cópias do HIV por mililitro de sangue (TARV não está a correr bem)\n- Carga viral BAIXA: -1.000 cópias/ml de sangue (TARV está a funcionar muito bem - supressão da carga viral)',
    // Usando o título exato fornecido para PTV
    'Prevenção Transmissão Vertical (PTV)': 'Conjunto de intervenções médicas e de saúde pública destinadas a impedir a transmissão do vírus da mãe para o filho durante a gravidez, o parto ou a amamentação. O PTV garante que crianças nasçam livres do vírus, mesmo quando suas mães vivem com HIV.\n\nO PTV envolve:\n1. O diagnóstico precoce da infeção pelo HIV na gestante\n- Mulher grávida deve iniciar a consulta pré-natal na Unidade Sanitária o mais sedo possível\n2. A adesão ao TARV para reduzir a carga viral materna a níveis indetectáveis\n3. Amamentação exclusiva nos primeiros 6 meses (a criança se alimenta apenas do leite materno)',
    // Usando o título exato fornecido para ITS
    'Infeções de Transmissão Sexual (ITS)': 'As Infeções de Transmissão Sexual (ITS) são infeções transmissíveis através de contacto sexual. Podem ser sintomáticas ou assintomáticas.\n\nSe não diagnosticadas e/ou tratadas, as ITS podem causar complicações e sequelas, tais como:\n- Doença inflamatória pélvica (DIP)\n- Infertilidade\n- Gravidez ectópica\n- Cancro do colo uterino\n- Aborto espontâneo, morte fetal intrauterina, malformações congénitas\n\nPrevenção das ITS:\nPara jovens e adolescentes que já iniciaram a actividade sexual:\n- Usar regularmente o preservativo (masculino ou feminino)\n- Reduzir o número de parceiros sexuais\n\nPara adolescentes que ainda não iniciaram a actividade sexual:\n- Adiar o início de relações sexuais\n- Abstinência sexual\n- Vacinação HPV (quando estiver disponível)\n\nProcurar atempadamente os serviços de saúde e convidar sempre o parceiro para a US.',
    'Cancro da Mama': 'O cancro da mama tem origem na glândula mamária.\n\nO diagnóstico precoce do cancro da mama, antes de surgirem quaisquer sinais ou sintomas, é fundamental na medida em que o mesmo aumenta a probabilidade do tratamento ser mais eficaz e, em consequência, possibilitar um melhor prognóstico da doença.\n\nPara a deteção precoce do cancro da mama, é geralmente recomendado que:\n- As mulheres devem fazer uma mamografia anual ou em cada dois anos\n- A mamografia permite visualizar nódulos na mama, antes que este possa ser sentido ou palpado pela mulher\n- O autoexame da mama deve ser feito uma vez por mês, sendo a melhor altura a semana a seguir ao período menstrual\n\nComo fazer o Autoexame da mama?\nProceda à palpação das mamas para procurar alterações e/ou nódulos ou outros sinais da doença, em diferentes posições: de pé, sentada e deitada.\n\nSintomas do Cancro da Mama:\n- Nódulo na mama ou na zona da axila, detetável ao toque\n- Alterações no tamanho ou formato da mama\n- Dor na mama\n- Alterações na mama ou mamilo, visíveis ou ao toque\n- Sensibilidade no mamilo\n- Secreção ou perda de liquido do mamilo\n- Pele da mama com cor avermelhada ou inchaço\n\nFactores de risco:\n- Idade (maior risco após 60 anos)\n- Antecedentes familiares\n- Fatores hormonais (menarca precoce, menopausa tardia, etc.)\n- Alimentação e peso\n- Exposição a radiações ionizantes\n\nConversar com o seu médico acerca do seu risco pessoal de ter cancro de mama.', // Adicionado parágrafo final aqui
    'Cancro do Colo do Útero': 'A nível global, o cancro cervical é o quarto tipo de cancro mais comum em mulheres. A sua etiologia está fortemente associada à infeção persistente pelo Vírus do Papiloma Humano (HPV), um vírus comummente transmitido por contacto sexual.\n\nFatores de risco:\n- Inicio precoce da actividade sexual (especialmente antes dos 18 anos)\n- Ter mais do que um parceiro sexual\n- Ter um parceiro sexual de alto risco (portador da infeção por HPV ou que tenha vários parceiros sexuais)\n- Tabagismo (duplica o risco)\n- Ter outras ITS (clamídia, herpes genital)\n- Primeira gravidez numa idade muito jovem (antes dos 20 anos)\n- Uso prolongado de contraceptivos orais\n- Dieta pobre em frutas e vegetais\n- História familiar de cancro do colo do útero',
  };

  // Objeto com as imagens (sem alterações na lógica, mas usa as novas chaves)
  const images = {
    'Ciclo Menstrual': 'https://plus.unsplash.com/premium_photo-1682309761340-3f6ea378bad3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVuc3RydWFsJTIwY3ljbGV8ZW58MHx8MHx8fDA%3D',
    'Gravidez': 'https://images.unsplash.com/photo-1580915411954-18ce54957c86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJlZ25hbmN5fGVufDB8fDB8fHww',
    'Fertilidade': 'https://images.unsplash.com/photo-1599660592604-6707005a45e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVydGlsaXR5fGVufDB8fDB8fHww',
    'Menopausa': 'https://images.unsplash.com/photo-1607602132700-0681204692c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Bem-Estar Íntimo': 'https://images.unsplash.com/photo-1599409666785-66a73006e76f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmFnaW5hbCUyMGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D',
    'Doenças Comuns': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbWVucyUyMGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D',
    'Prevenção e Contracepção': 'https://images.unsplash.com/photo-1584515933487-75980c156994?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29udHJhY2VwdGlvbnxlbnwwfHwwfHx8MA%3D%3D',
    'Saúde Mental': 'https://images.unsplash.com/photo-1591228128574-1a67706b8b3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Nutrição': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Exercícios': 'https://images.unsplash.com/photo-1571019614243-c5cdb322f242?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Doenças Mais Comuns em Mulheres': 'https://images.unsplash.com/photo-1550831106-0994481a6f54?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGVhbHRoJTIwY2hlY2t1cHxlbnwwfHwwfHx8MA%3D%3D',
    'HIV e SIDA': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', // Imagem genérica mantida
    'Prevenção do HIV': 'https://images.unsplash.com/photo-1618042164219-62c820f16187?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJlcHxlbnwwfHwwfHx8MA%3D%3D',
    'Testagem de HIV': 'https://images.unsplash.com/photo-1606954471119-c76ba2517b8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGl2JTIwdGVzdGluZ3xlbnwwfHwwfHx8MA%3D%3D',
    'Infeções de Transmissão Sexual (ITS)': 'https://plus.unsplash.com/premium_photo-1661774706195-578300f61a5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RkJTIwcHJldmVudGlvbnxlbnwwfHwwfHx8MA%3D%3D', // Chave corresponde ao título
    'Cancro da Mama': 'https://images.unsplash.com/photo-1580130873917-74f5349a751f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnJlYXN0JTIwY2FuY2VyfGVufDB8fDB8fHww',
    'Cancro do Colo do Útero': 'https://images.unsplash.com/photo-1624401299900-15c7975f141e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2VydmljYWwlMjBjYW5jZXJ8ZW58MHx8MHx8fDA%3D',
  };

  // Retorna a explicação completa e a imagem correspondente
  return {
    explanation: explanations[topicTitle] || `Detalhes sobre ${topicTitle} ainda não disponíveis.`,
    image: images[topicTitle] || sliderImageUrls[0] // Fallback para imagem genérica
  };
};


// --- Componente DetailsScreen (lógica do carrossel e resto sem alterações) ---
const DetailsScreen = ({ route, navigation }) => {
  const { topicId, topicTitle } = route.params;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef(null);

  // Busca os detalhes usando o título (agora com textos atualizados)
  const currentTopicDetails = getTopicDetails(topicTitle);
  const currentTopic = {
      id: topicId,
      title: topicTitle,
      explanation: currentTopicDetails.explanation,
      image: currentTopicDetails.image
  };

  // --- Efeito para Rolagem Automática (sem alterações na lógica) ---
  useEffect(() => {
    if (sliderImageUrls.length <= 1 || !sliderRef.current) {
        return;
    }
    const intervalId = setInterval(() => {
      const nextIndex = (activeSlideIndex + 1) % sliderImageUrls.length;
      if (sliderRef.current) {
          sliderRef.current.scrollTo({
              x: nextIndex * SLIDE_WIDTH,
              animated: true,
          });
      }
    }, 5000);
    return () => {
        clearInterval(intervalId);
    };
  }, [activeSlideIndex]);

  // --- Handler para Rolagem Manual (sem tipo TS) ---
  const handleScroll = (event) => {
    if (!event || !event.nativeEvent) {
        return;
    }
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SLIDE_WIDTH);
    if (index !== activeSlideIndex && index >= 0 && index < sliderImageUrls.length) {
        setActiveSlideIndex(index);
    }
  };

  // --- Outras Funções (Navegação, Categoria) (sem alterações) ---
  const handleGoBack = () => navigation.goBack();
  const handleConsultSpecialist = () => navigation.navigate('Login');
  const handleCategoryPress = (title) => {
      // Tenta encontrar um título correspondente na lista de explicações
      // (Pode ser necessário refinar esta lógica se os títulos da barra forem muito diferentes das chaves)
      let explanationKey = title; // Assume que o título da barra é a chave
      if (!getTopicDetails(title).explanation.includes('ainda não disponíveis')) {
         explanationKey = title;
      } else if (title === 'ITS' && getTopicDetails('Infeções de Transmissão Sexual (ITS)').explanation) {
         explanationKey = 'Infeções de Transmissão Sexual (ITS)';
      } // Adicionar mais mapeamentos se necessário

      const details = getTopicDetails(explanationKey);
      navigation.replace('Details', {
          topicId: title, // Mantém o ID/título da barra para consistência da barra
          topicTitle: explanationKey // Usa a chave da explicação para buscar o conteúdo correto
      });
  };

  // --- Renderização (sem alterações na estrutura, apenas o conteúdo de currentTopic.explanation e femtechCategories mudou) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          {/* O título no header continua sendo o `topicTitle` que veio da navegação */}
          <Text style={styles.headerTitle} numberOfLines={1}>{currentTopic.title}</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Barra de Categorias */}
        <View style={{ marginVertical: 15 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollViewContent}
          >
            {/* Mapeia sobre `femtechCategories` */}
            {femtechCategories.map((categoryTitle) => (
              <TouchableOpacity
                key={categoryTitle}
                style={[
                  styles.categoryButton,
                  // O destaque ainda compara com o `currentTopic.title` original
                  categoryTitle === currentTopic.title ? styles.categoryButtonActive : styles.categoryButtonInactive,
                ]}
                onPress={() => handleCategoryPress(categoryTitle)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  categoryTitle === currentTopic.title ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive,
                ]}>
                  {categoryTitle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Carrossel de Imagens (sem alterações na lógica) */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.sliderScrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {sliderImageUrls.map((imageUrl, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{ uri: imageUrl }} style={styles.sliderImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          {/* Paginação (sem alterações na lógica) */}
          <View style={styles.pagination}>
            {sliderImageUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeSlideIndex ? styles.paginationDotActive : styles.paginationDotInactive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Container de Detalhes (mostra os textos atualizados) */}
        <View style={styles.detailContainer}>
          <Text style={styles.sectionTitle}>Explicação Aprofundada</Text>
          <Text style={styles.detailExplanation}>{currentTopic.explanation}</Text>

          {currentTopic.image && (
            <Image
              source={{ uri: currentTopic.image }}
              style={styles.detailImage}
              resizeMode="cover"
            />
          )}

          <Text style={styles.disclaimer}>
            Importante: As informações são educativas e não substituem aconselhamento médico. Consulte um profissional.
          </Text>

          <TouchableOpacity
            style={styles.consultButton}
            onPress={handleConsultSpecialist}
            activeOpacity={0.8}
          >
            <Icon name="user" size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.consultButtonText}>Consultar Especialista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos (sem alterações) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 5,
    minWidth: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  categoriesScrollViewContent: {
    paddingHorizontal: 15,
    paddingVertical: 5
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonInactive: {
    backgroundColor: theme.colors.cardBackground,
    borderColor: theme.colors.border,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  categoryButtonTextActive: {
    color: '#FFFFFF'
  },
  categoryButtonTextInactive: {
    color: theme.colors.textSecondary
  },
  sliderScrollView: {
    height: screenWidth * 0.45,
  },
  slide: {
    width: SLIDE_WIDTH, // Slide takes full screen width
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderImage: {
    width: SLIDE_WIDTH - 30, // Image has horizontal padding (15px each side)
    height: '100%',
    borderRadius: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotInactive: {
       backgroundColor: 'rgba(0, 0, 0, 0.3)', // Style for inactive dot
   },
  paginationDotActive: {
    backgroundColor: theme.colors.primary // Style for active dot
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  detailContainer: {
    marginHorizontal: 15,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 5,
  },
  detailExplanation: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 15,
    textAlign: 'justify',
  },
  detailImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'center',
  },
  disclaimer: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consultButtonText: {
    color: theme.colors.consultButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailsScreen;