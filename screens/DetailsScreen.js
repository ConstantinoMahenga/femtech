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
  Platform,
  // Linking // Descomente se for usar os números de emergência da VBG para fazer ligações
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

//Definição do tema
const theme = {
  colors: {
    primary: '#E83E8C',
    background: '#F4F4F8',
    cardBackground: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
    consultButtonBackground: '#E83E8C',
    consultButtonText: '#FFFFFF',
  },
};

// Lista de categorias para a barra de navegação superior
const femtechCategories = [
  'Ciclo Menstrual', 'Gravidez', 'Fertilidade', 'Menopausa',
  'Bem-Estar Íntimo',
  'Saúde Mental', 'Nutrição', 'Exercícios',
  'Cancro da Mama', 'Cancro do Colo do Útero',
  'ITS',
  'HIV e SIDA',
  'Prevenção do HIV', 'Testagem de HIV', 'Tratamento (TARV)', 'Prevenção Transmissão Vertical (PTV)',
  'Sexualidade', 'Planeamento Familiar', 'Violência Baseada no Género (VBG)', 'Doenças Mais Comuns em Mulheres',
  'Grupos de Poupança e Empréstimos Acumulados (VSLA)',
  'Formação Profissional Hardware e Software',
  'Transformação em reciclagem de lixo eletrónico',
];


// Slider images
const sliderImageUrls = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

const { width: screenWidth } = Dimensions.get('window');
const SLIDE_WIDTH = screenWidth;

// --- FUNÇÃO getTopicDetails COM OS TEXTOS ATUALIZADOS ---
const getTopicDetails = (topicTitle) => {
  const explanations = {
    'Grupos de Poupança e Empréstimos Acumulados (VSLA)': 'O Grupo de Poupanças e Empréstimo (VSLA) é uma metodologia que permite que pessoas, especialmente em comunidades de baixa renda, poupem dinheiro e tenham acesso a pequenos empréstimos. Esta abordagem promove a inclusão financeira e o desenvolvimento comunitário, capacitando os membros a gerir melhor suas finanças e a investir em pequenas atividades geradoras de renda.',
    'Formação Profissional Hardware e Software': 'Aprenda sobre cursos e oportunidades em manutenção de computadores (hardware) e desenvolvimento de aplicações (software) para impulsionar sua carreira. A formação nestas áreas tecnológicas abre portas para o mercado de trabalho, permitindo a aquisição de competências valorizadas e a possibilidade de empreendedorismo no setor digital.',
    'Transformação em reciclagem de lixo eletrónico': 'Entenda o processo e a importância da reciclagem de lixo eletrônico, transformando resíduos em oportunidades e protegendo o meio ambiente. A reciclagem de e-lixo não só evita a contaminação ambiental por substâncias tóxicas, mas também permite a recuperação de materiais valiosos, fomentando uma economia circular e sustentável.',
    'Ciclo Menstrual': 'A menstruação ocorre para a maioria das mulheres uma vez por mês, e é por isso que é chamada de “período mensal”. Em geral dura entre três a sete dias. É um sinal de que a rapariga ou mulher pode engravidar se mantiver relações sexuais. Tal como algumas raparigas iniciam a puberdade mais cedo do que outras, o mesmo acontece com o período menstrual. Algumas raparigas podem começar a ter a menstruação aos nove ou dez anos de idade, enquanto outras podem começar o seu primeiro período até alguns anos mais tarde. Uma mulher sabe que começou a ter o período quando lhe começa a sair um pequeno fio de sangue pela vagina. O sangue não escorre como a água de uma torneira. Ele sai lentamente, como um gotejar. Geralmente, quando ela sente uma humidade não habitual, a sua roupa interior já absorveu qualquer sangramento que tenha ocorrido. É por isso que é importante antecipar em que altura do mês é que ela começará a sangrar, para que possa usar um penso ou outra protecção e evitar, assim, sujar a roupa interior. O espaço de tempo entre um período e o seguinte varia de mulher para mulher. Para algumas o ciclo dura 21 dias (ou menos). Para outras, dura 35 dias ou mesmo mais. Períodos irregulares são comuns nas raparigas que acabam de começar a menstruar.',
    'Gravidez': `A gravidez na adolescência traz consigo muitos riscos para a mãe e para o bebé. Algumas adolescentes morrem durante a gravidez e no parto porque o seu corpo ainda não está suficientemente desenvolvido para ter um bebé. Os bebés podem também nascer com problemas de saúde. Quando uma adolescente fica grávida, por vezes tem de abandonar a escola e, se o pai reconhece a criança, também passa a ter responsabilidades que podem impedi-lo de continuar os estudos.

O rapaz e a rapariga devem ser ambos responsáveis por prevenir a gravidez, usando um método contraceptivo que seja confortável para ambos.

Métodos de contraceptivos para evitar a gravidez:

1. *Preservativo Masculino e Feminino*: Protegem ao mesmo tempo da gravidez e das ITS, incluindo HIV.
2. *Pílula*: Pode ser tomada na adolescência, mas deve ser recomendada por um técnico de saúde.
3. *Injeção (DEPO)*: Pode ser tomada na adolescência desde que seja numa unidade sanitária.
4. *Implante*: Pode ser usado na adolescência desde que seja recomendado e colocado por um técnico de saúde. É muito discreto.
5. *DIU (Dispositivo Intrauterino)*: Pode ser usado na adolescência, mesmo que a rapariga ainda não tenha filhos.`,
    'Fertilidade':'Fertilidade refere-se à capacidade natural de uma mulher produzir descendentes. A fertilidade feminina é influenciada por muitos fatores, incluindo idade, saúde geral, estilo de vida e condições médicas. O período mais fértil ocorre durante a ovulação, quando um óvulo maduro é liberado do ovário.',
    'Menopausa':'A menopausa marca o fim dos ciclos menstruais da mulher. É diagnosticada após 12 meses sem período menstrual. A menopausa pode acontecer entre os 40 e 50 anos e traz sintomas como ondas de calor, alterações de humor e mudanças no metabolismo, devido à diminuição dos níveis de estrogênio e progesterona.',
    'Bem-Estar Íntimo':'Manter a saúde íntima envolve práticas de higiene adequadas, uso de produtos apropriados e atenção a sinais de desequilíbrio. A vagina tem um pH naturalmente ácido que ajuda a prevenir infecções. Usar sabonetes suaves, roupas íntimas de algodão e evitar duchas vaginares são práticas recomendadas.',
    'Saúde Mental':'A saúde mental das mulheres pode ser afetada por fatores hormonais (como TPM e depressão pós-parto), sociais e de vida. Reconhecer sinais de ansiedade, depressão e outros problemas de saúde mental é importante, assim como buscar ajuda profissional quando necessário.',
    'Nutrição':'As necessidades nutricionais das mulheres mudam ao longo da vida. O cálcio e a vitamina D são importantes para a saúde óssea, especialmente após a menopausa. O ácido fólico é crucial durante os anos reprodutivos. Uma dieta equilibrada com frutas, vegetais, grãos integrais e proteínas magras apoia a saúde geral.',
    'Exercícios':'A prática regular de exercícios físicos é essencial para a saúde da mulher em todas as fases da vida. Atividades como yoga, pilates, caminhada e musculação trazem benefícios como fortalecimento muscular, melhora da saúde cardiovascular e controle do estresse.',
    'Doenças Mais Comuns em Mulheres': 'As mulheres podem experimentar várias condições de saúde específicas, incluindo infecções por fungos, vaginose bacteriana, endometriose, síndrome dos ovários policísticos (SOP) e doença inflamatória pélvica (DIP). Reconhecer os sintomas e buscar tratamento precoce é essencial para a saúde a longo prazo. Além destas, o Cancro da Mama e o Cancro do Colo do Útero são preocupações significativas (ver secções específicas). Mulheres também têm maior risco para certas doenças como Osteoporose (especialmente pós-menopausa), doenças autoimunes (como Lúpus e Artrite Reumatoide) e algumas doenças cardíacas. Check-ups regulares ajudam na prevenção e manejo.',
    'HIV e SIDA': 'O HIV (Vírus da Imunodeficiência Humana) é um vírus que ataca o sistema imunológico, destruindo as células CD4 que são essenciais para a defesa do organismo. À medida que o vírus se multiplica, o sistema imunológico fica mais fraco, permitindo o aparecimento de doenças oportunistas. Quando o sistema imunológico está muito danificado, pode evoluir para SIDA (Síndrome da Imunodeficiência Adquirida).',
    'Prevenção do HIV': 'HIV (Vírus de Imunodeficiência Humana) é um vírus que causa fraqueza no sistema de defesa do corpo humano, pois mata as células de defesa chamadas CD4. À medida que o HIV aumenta a quantidade do vírus no sangue, há uma diminuição das células de defesa o que permite o aparecimento de doenças.\n\nComo se transmite o HIV?\nO HIV é transmitido através de três vias:\n1. Transmissão sexual\n2. Transmissão vertical (de mãe para filho)\n3. Transfusão de sangue\n\nVIA SEXUAL: Transmissão por contacto sexual\nVIA TRANSMISSÃO VERTICAL: Transmissão da mãe para o filho pela gravidez, pelo nascimento ou pela amamentação\nVIA SANGUÍNEA: Transmissão pela via sanguínea, através de instrumentos cortantes infectados e seringas, ou transfusão de sangue e transplante de órgãos\n\nO HIV NÃO é transmitido por:\n- Picada por mosquitos\n- Vasos sanitários\n- Partilha de utensílios domésticos\n- Beijos ou abraços\n\nComo se previne o HIV?\n\nTransmissão Sexual:\n- Usar o preservativo, de forma correcta e persistente em todas as relações sexuais\n- Existem preservativos masculinos, femininos e barreiras de látex para o sexo oral\n\nTransmissão Vertical:\n- Se estiver grávida (ou estiver a pensar em engravidar) e for HIV positiva, é melhor aderir a consulta pré-natal o mais sedo possível e ao tratamentos do HIV (PTV)\n- Este tratamento reduz eficazmente o risco de transmissão do vírus ao seu futuro filho durante a gravidez e o parto\n\nTransfusão de Sangue:\n- Evitar a transfusão de sangue contaminado\n\nUso de Objectos Perfuro-Cortantes:\n- Evitar o uso de objectos como seringas, lâminas, agulhas, facas, que estejam contaminados\n- Deve esterilizar antes de usa-los',
    'Testagem de HIV': 'A única forma de saber se tem HIV (seró estado) é mediante um teste, onde se usa umas gotas de sangue. Se o primeiro teste for positivo, repete-se um segundo teste para confirmar o resultado. Em total, demora 50 minutos. Se os 2 testes forem positivos, então é HIV positivo.\n\nO que fazer para evitar ficar DOENTES?\n1º Saber se tem HIV ou não (fazer teste)\n2º No caso de ser positivo, fazer imediatamente o tratamento do HIV (TARV)',
    'Tratamento (TARV)': 'O HIV tem um tratamento que não é cura mas permite que as pessoas infectadas tenham uma vida normal, chama-se TARV (Terapia Antirretroviral).\n\nO TARV é um tratamento para toda a vida. São usados comprimidos que se tomam todos os dias e a mesma hora chamados antirretrovirais (ARVs). Os ARVs lutam contra o HIV e fazem com que o HIV fique dormido/Escondido no corpo.\n\nNo inicio de tratamento, as pessoas podem ter algumas reações como vómitos, diarreia enxaqueca ou alergias, até o corpo se habituar, pode demorar dias, até 1 ou 2 meses.\n\nComo sabemos que o tratamento está a correr bem?\n- As pessoas com HIV precisam fazer seguimento, mensal, trimestral ou semestral no hospital\n- Todas as pessoas que iniciam o tratamento de HIV devem fazer analise da Carga Viral apois 6 meses\n\nA carga viral é uma medida de quanto o HIV existe no sangue. A carga viral fornece informações sobre o desempenho dos ARVs no organismo, uma vez que os ARVs impedem o HIV de produzir mais cópias do vírus.\n\n- Carga viral ALTA: +1.000 ou mais cópias do HIV por mililitro de sangue (TARV não está a correr bem)\n- Carga viral BAIXA: -1.000 cópias/ml de sangue (TARV está a funcionar muito bem - supressão da carga viral)',
    'Prevenção Transmissão Vertical (PTV)': 'Conjunto de intervenções médicas e de saúde pública destinadas a impedir a transmissão do vírus da mãe para o filho durante a gravidez, o parto ou a amamentação. O PTV garante que crianças nasçam livres do vírus, mesmo quando suas mães vivem com HIV.\n\nO PTV envolve:\n1. O diagnóstico precoce da infeção pelo HIV na gestante\n- Mulher grávida deve iniciar a consulta pré-natal na Unidade Sanitária o mais sedo possível\n2. A adesão ao TARV para reduzir a carga viral materna a níveis indetectáveis\n3. Amamentação exclusiva nos primeiros 6 meses (a criança se alimenta apenas do leite materno)',
    'Infeções de Transmissão Sexual (ITS)': 'As Infeções de Transmissão Sexual (ITS) são infeções transmissíveis através de contacto sexual. Podem ser sintomáticas ou assintomáticas.\n\nSe não diagnosticadas e/ou tratadas, as ITS podem causar complicações e sequelas, tais como:\n- Doença inflamatória pélvica (DIP)\n- Infertilidade\n- Gravidez ectópica\n- Cancro do colo uterino\n- Aborto espontâneo, morte fetal intrauterina, malformações congénitas\n\nPrevenção das ITS:\nPara jovens e adolescentes que já iniciaram a actividade sexual:\n- Usar regularmente o preservativo (masculino ou feminino)\n- Reduzir o número de parceiros sexuais\n\nPara adolescentes que ainda não iniciaram a actividade sexual:\n- Adiar o início de relações sexuais\n- Abstinência sexual\n- Vacinação HPV (quando estiver disponível)\n\nProcurar atempadamente os serviços de saúde e convidar sempre o parceiro para a US.',
    'Cancro da Mama': 'O cancro da mama tem origem na glândula mamária.\n\nO diagnóstico precoce do cancro da mama, antes de surgirem quaisquer sinais ou sintomas, é fundamental na medida em que o mesmo aumenta a probabilidade do tratamento ser mais eficaz e, em consequência, possibilitar um melhor prognóstico da doença.\n\nPara a deteção precoce do cancro da mama, é geralmente recomendado que:\n- As mulheres devem fazer uma mamografia anual ou em cada dois anos\n- A mamografia permite visualizar nódulos na mama, antes que este possa ser sentido ou palpado pela mulher\n- O autoexame da mama deve ser feito uma vez por mês, sendo a melhor altura a semana a seguir ao período menstrual\n\nComo fazer o Autoexame da mama?\nProceda à palpação das mamas para procurar alterações e/ou nódulos ou outros sinais da doença, em diferentes posições: de pé, sentada e deitada.\n\nSintomas do Cancro da Mama:\n- Nódulo na mama ou na zona da axila, detetável ao toque\n- Alterações no tamanho ou formato da mama\n- Dor na mama\n- Alterações na mama ou mamilo, visíveis ou ao toque\n- Sensibilidade no mamilo\n- Secreção ou perda de liquido do mamilo\n- Pele da mama com cor avermelhada ou inchaço\n\nFactores de risco:\n- Idade (maior risco após 60 anos)\n- Antecedentes familiares\n- Fatores hormonais (menarca precoce, menopausa tardia, etc.)\n- Alimentação e peso\n- Exposição a radiações ionizantes\n\nConversar com o seu médico acerca do seu risco pessoal de ter cancro de mama.',
    'Cancro do Colo do Útero': 'A nível global, o cancro cervical é o quarto tipo de cancro mais comum em mulheres. A sua etiologia está fortemente associada à infeção persistente pelo Vírus do Papiloma Humano (HPV), um vírus comummente transmitido por contacto sexual.\n\nFatores de risco:\n- Inicio precoce da actividade sexual (especialmente antes dos 18 anos)\n- Ter mais do que um parceiro sexual\n- Ter um parceiro sexual de alto risco (portador da infeção por HPV ou que tenha vários parceiros sexuais)\n- Tabagismo (duplica o risco)\n- Ter outras ITS (clamídia, herpes genital)\n- Primeira gravidez numa idade muito jovem (antes dos 20 anos)\n- Uso prolongado de contraceptivos orais\n- Dieta pobre em frutas e vegetais\n- História familiar de cancro do colo do útero',
    'Planeamento Familiar': `A Planificação Familiar é um conjunto de métodos e serviços que ajudam as pessoas a decidir quando e quantos filhos ter. Isso inclui o uso de contraceptivos, como pílulas, preservativos e DIUs, para evitar gravidezes indesejadas. Além disso, a planificação familiar também envolve o acesso a informações sobre saúde sexual e reprodutiva, permitindo que as pessoas façam escolhas informadas sobre sua vida reprodutiva.

Os métodos contraceptivos ajudam-nos a evitar uma gravidez não planeada e a regular a fecundidade. Nas consultas de planeamento familiar, a maior parte dos profissionais de saúde recomendam aos adolescentes e jovens a dupla protecção, um método contraceptivo e também o preservativo, porque para além de evitar a gravidez, evita também as ITS e o HIV.

Tens o direito de ter informação relevante sobre os vários métodos de planeamento familiar e de escolher livremente o método mais apropriado para ti. Ninguém pode obrigar-te a escolher determinado método.

É importante saber que existem métodos contraceptivos de longa duração que permitem uma maior prevenção contra a gravidez. Fazem parte destes, as Injecções, o Implante e Dispositivo Intra-Uterino.

As mulheres seropositivas devem ir às consultas pré-natais e receber aconselhamento sobre o PTV. Seguindo as instruções do profissional de saúde aumentam as chances dela ter um filho sem HIV.

Para saberes qual o método mais apropriado para ti, deves dirigir-te a um SAAJ ou unidade sanitária.`,
    'Sexualidade': 'A Organização Mundial da Saúde (OMS), define a sexualidade como a energia que nos motiva a encontrar o amor, contacto, ternura e intimidade; integra-se no modo como sentimos, movemos, tocamos e somos tocados, é ser se sensual e ao mesmo tempo ser-se sexual.  A sexualidade influencia pensamentos, sentimentos, acções e interacções e, por isso, influencia também a nossa saúde física e mental. Ou seja, a sexualidade tem tudo a ver com saúde. Sexo refere-se aos atributos biológicos que caracterizam homens e mulheres (por exemplo o homem pode fecundar e só a mulher pode amamentar). Sexualidade tem a ver com a forma como expressamos os nossos sentimentos, comportamentos crenças e atitudes. É algo mais abrangente que sexo e relações sexuais pois envolve aspectos como o afecto, a intimidade, prazer, comunicação, ternura e paixão. Todos temos direito de expressar e viver a nossa sexualidade livremente e de respeitar as opções dos outros.',
    'Violência Baseada no Género (VBG)': `A violência doméstica é um problema grave que afeta muitas pessoas, independentemente de idade, gênero ou classe social. Ela pode incluir abuso físico, emocional, psicológico, sexual ou financeiro. É importante saber que existem recursos disponíveis para ajudar as vítimas de violência doméstica.

Se você ou alguém que você conhece está enfrentando violência doméstica, procure ajuda imediatamente. Você pode entrar em contato com os seguintes números de emergência:

1. *Linha de Apoio à Mulher*: Ligue para 180
2. *Polícia*: Ligue para 190
3. *Serviço de Emergência*: Ligue para 192

Clique nos números acima para fazer a ligação diretamente e buscar ajuda. Lembre-se, você não está sozinho e há pessoas dispostas a ajudar.`,
  };

  const images = {
    'Grupos de Poupança e Empréstimos Acumulados (VSLA)': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2F2aW5nc3xlbnwwfHwwfHx8MA%3D%3D',
    'Formação Profissional Hardware e Software': 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kaW5nJTIwY2xhc3N8ZW58MHx8MHx8fDA%3D',
    'Transformação em reciclagem de lixo eletrónico': 'https://images.unsplash.com/photo-1611270419445-155ba4617581?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZSUyMHdhc3RlJTIwcmVjeWNsaW5nfGVufDB8fDB8fHww',
    'Ciclo Menstrual': 'https://plus.unsplash.com/premium_photo-1682309761340-3f6ea378bad3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVuc3RydWFsJTIwY3ljbGV8ZW58MHx8MHx8fDA%3D',
    'Gravidez': 'https://images.unsplash.com/photo-1580915411954-18ce54957c86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJlZ25hbmN5fGVufDB8fDB8fHww',
    'Fertilidade': 'https://images.unsplash.com/photo-1599660592604-6707005a45e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVydGlsaXR5fGVufDB8fDB8fHww',
    'Menopausa': 'https://images.unsplash.com/photo-1607602132700-0681204692c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Bem-Estar Íntimo': 'https://images.unsplash.com/photo-1599409666785-66a73006e76f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmFnaW5hbCUyMGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D',
    'Saúde Mental': 'https://images.unsplash.com/photo-1591228128574-1a67706b8b3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Nutrição': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Exercícios': 'https://images.unsplash.com/photo-1571019614243-c5cdb322f242?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    'Doenças Mais Comuns em Mulheres': 'https://images.unsplash.com/photo-1550831106-0994481a6f54?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGVhbHRoJTIwY2hlY2t1cHxlbnwwfHwwfHx8MA%3D%3D',
    'HIV e SIDA': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'Prevenção do HIV': 'https://images.unsplash.com/photo-1618042164219-62c820f16187?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJlcHxlbnwwfHwwfHx8MA%3D%3D',
    'Testagem de HIV': 'https://images.unsplash.com/photo-1606954471119-c76ba2517b8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGl2JTIwdGVzdGluZ3xlbnwwfHwwfHx8MA%3D%3D',
    'Tratamento (TARV)': 'https://images.unsplash.com/photo-1576765608866-5b5104043273?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVkaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D',
    'Prevenção Transmissão Vertical (PTV)': 'https://images.unsplash.com/photo-1560773632-196793694c0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW90aGVyJTIwYW5kJTIwY2hpbGR8ZW58MHx8MHx8fDA%3D%3D',
    'Infeções de Transmissão Sexual (ITS)': 'https://plus.unsplash.com/premium_photo-1661774706195-578300f61a5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RkJTIwcHJldmVudGlvbnxlbnwwfHwwfHx8MA%3D%3D',
    'Cancro da Mama': 'https://images.unsplash.com/photo-1580130873917-74f5349a751f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnJlYXN0JTIwY2FuY2VyfGVufDB8fDB8fHww',
    'Cancro do Colo do Útero': 'https://images.unsplash.com/photo-1624401299900-15c7975f141e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2VydmljYWwlMjBjYW5jZXJ8ZW58MHx8MHx8fDA%3D',
    'Planeamento Familiar': 'https://images.unsplash.com/photo-1584515933487-75980c156994?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29udHJhY2VwdGlvbnxlbnwwfHwwfHx8MA%3D%3D',
    'Sexualidade': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'Violência Baseada no Género (VBG)': 'https://images.unsplash.com/photo-1603052875000-4f2b8a5c3d1e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dm9sZW5jaWElMjB2aW9sZW5jaXxlbnwwfHwwfHx8MA%3D%3D',
  };

  return {
    explanation: explanations[topicTitle] || `Detalhes sobre ${topicTitle} ainda não disponíveis.`,
    image: images[topicTitle] || sliderImageUrls[0]
  };
};


const DetailsScreen = ({ route, navigation }) => {
  const { topicId, topicTitle } = route.params;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef(null);

  const currentTopicDetails = getTopicDetails(topicTitle);
  const currentTopic = {
      id: topicId,
      title: topicTitle,
      explanation: currentTopicDetails.explanation,
      image: currentTopicDetails.image
  };

  const financialLiteracyTitles = [
    'Grupos de Poupança e Empréstimos Acumulados (VSLA)',
    'Formação Profissional Hardware e Software',
    'Transformação em reciclagem de lixo eletrónico'
  ];

  const isFinancialLiteracyTopic = financialLiteracyTitles.includes(currentTopic.title);

  const mainButtonText = isFinancialLiteracyTopic ? "Contacte-nos" : "Consultar Especialista";
  const mainButtonIcon = isFinancialLiteracyTopic ? "send" : "user";

  const handleMainButtonPress = () => {
    if (isFinancialLiteracyTopic) {
      navigation.navigate('ContactForm', {
        topicTitle: currentTopic.title,
        topicDescription: currentTopic.explanation,
        // O formContext pode ser usado pelo ContactFormScreen para saber a origem.
        // Se o ContactFormScreen sempre mostra o Picker de cursos, esse formContext
        // não é mais crucial para a visibilidade do Picker, mas pode ser útil para outras lógicas.
        formContext: 'financial_literacy_contact'
      });
    } else {
      // Quando NÃO é Literacia Financeira (botão "Consultar Especialista")
      // NAVEGA PARA A TELA DE LOGIN
      navigation.navigate('Login'); // <<--- CORREÇÃO APLICADA AQUI
    }
  };

  useEffect(() => {
    if (sliderImageUrls.length <= 1 || !sliderRef.current) return;
    const intervalId = setInterval(() => {
      const nextIndex = (activeSlideIndex + 1) % sliderImageUrls.length;
      sliderRef.current?.scrollTo({ x: nextIndex * SLIDE_WIDTH, animated: true });
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeSlideIndex]);

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SLIDE_WIDTH);
    if (index !== activeSlideIndex && index >= 0 && index < sliderImageUrls.length) {
        setActiveSlideIndex(index);
    }
  };

  const handleGoBack = () => navigation.goBack();

  const handleCategoryPress = (categoryTitleFromBar) => {
      let explanationKey = categoryTitleFromBar;
      const detailsFromKey = getTopicDetails(explanationKey);

      if (detailsFromKey.explanation.includes('ainda não disponíveis')) {
        if (categoryTitleFromBar === 'ITS' && getTopicDetails('Infeções de Transmissão Sexual (ITS)').explanation && !getTopicDetails('Infeções de Transmissão Sexual (ITS)').explanation.includes('ainda não disponíveis')) {
           explanationKey = 'Infeções de Transmissão Sexual (ITS)';
        }
        // Adicione mais mapeamentos 'else if' aqui se os títulos da barra de categorias
        // forem diferentes das chaves no objeto 'explanations'.
      }

      const finalDetails = getTopicDetails(explanationKey);

      if (!finalDetails.explanation.includes('ainda não disponíveis')) {
        navigation.replace('Details', {
            topicId: categoryTitleFromBar, // Mantém o ID/título da barra para consistência
            topicTitle: explanationKey     // Usa a chave correta para buscar o conteúdo
        });
      } else {
        console.warn(`Detalhes para "${explanationKey}" (originado de "${categoryTitleFromBar}") não encontrados via barra de categoria.`);
        // Poderia mostrar um Alert aqui se desejado
      }
  };

  if (!currentTopic.title || currentTopic.explanation.includes('ainda não disponíveis.')) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <View style={styles.header}>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <Icon name="arrow-left" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>Informação Indisponível</Text>
              <View style={styles.headerButton} />
            </View>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
                <Text style={{fontSize: 18, textAlign: 'center', color: theme.colors.textSecondary}}>
                    Oops! Os detalhes para este tópico não foram encontrados ou ainda não estão disponíveis.
                </Text>
                <Text style={{fontSize: 14, textAlign: 'center', color: theme.colors.textSecondary, marginTop:10}}>
                    Título recebido: {topicTitle || "Nenhum título fornecido"}
                </Text>
                <TouchableOpacity onPress={handleGoBack} style={{marginTop: 20, paddingVertical:10, paddingHorizontal:20, backgroundColor: theme.colors.primary, borderRadius: 5}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{currentTopic.title}</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={{ marginVertical: 15 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollViewContent}
          >
            {femtechCategories.map((categoryTitleInBar) => {
              let isActive = categoryTitleInBar === currentTopic.title;
              if (!isActive && categoryTitleInBar === 'ITS' && currentTopic.title === 'Infeções de Transmissão Sexual (ITS)') {
                isActive = true;
              }
              // Adicione mais condições de mapeamento para o estado ativo da categoria se necessário
              return (
                <TouchableOpacity
                  key={categoryTitleInBar}
                  style={[
                    styles.categoryButton,
                    isActive ? styles.categoryButtonActive : styles.categoryButtonInactive,
                  ]}
                  onPress={() => handleCategoryPress(categoryTitleInBar)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    isActive ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive,
                  ]}>
                    {categoryTitleInBar}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
            onPress={handleMainButtonPress}
            activeOpacity={0.8}
          >
            <Icon name={mainButtonIcon} size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.consultButtonText}>{mainButtonText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 15, backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 10,
  },
  headerButton: { padding: 5, minWidth: 30, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, textAlign: 'center', flex: 1, marginHorizontal: 10 },
  categoriesScrollViewContent: { paddingHorizontal: 15, paddingVertical: 5 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  categoryButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryButtonInactive: { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
  categoryButtonText: { fontSize: 14, fontWeight: '500' },
  categoryButtonTextActive: { color: '#FFFFFF' },
  categoryButtonTextInactive: { color: theme.colors.textSecondary },
  sliderScrollView: { height: screenWidth * 0.45 },
  slide: { width: SLIDE_WIDTH, justifyContent: 'center', alignItems: 'center' },
  sliderImage: { width: SLIDE_WIDTH - 30, height: '100%', borderRadius: 10 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  paginationDotInactive: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  paginationDotActive: { backgroundColor: theme.colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  detailContainer: { marginHorizontal: 15, backgroundColor: theme.colors.cardBackground, borderRadius: 8, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginTop: 5 },
  detailExplanation: { fontSize: 16, lineHeight: 24, color: theme.colors.text, marginBottom: 15, textAlign: 'justify' },
  detailImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 15, alignSelf: 'center' },
  disclaimer: { fontSize: 13, fontStyle: 'italic', color: theme.colors.textSecondary, marginTop: 10, textAlign: 'center', paddingHorizontal: 10, marginBottom: 20 },
  consultButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignSelf: 'center', marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  consultButtonText: { color: theme.colors.consultButtonText, fontSize: 16, fontWeight: 'bold' },
});

export default DetailsScreen;