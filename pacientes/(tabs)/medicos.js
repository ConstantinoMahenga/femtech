import React, { useState, useMemo } from 'react'; // useMemo para otimizar filtro
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList, // Usar FlatList para listas longas
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Ícone de pesquisa
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Para ícone de distância

// --- TEMA (Reutilizado) ---
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa característico
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888', // Cor mais suave para distância/descrição
    placeholder: '#999',
    background: '#f7f7f7', // Fundo ligeiramente cinza
    border: '#eee',
    cardBackground: '#fff',
  },
  fonts: {
    // Verifique os nomes corretos ou use fallbacks do sistema
    regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Fallback
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold', // Fallback
    // Se WinkySans estiver configurada:
    // regular: 'WinkySans-Regular',
    // bold: 'WinkySans-Bold',
  }
};

// --- DADOS FAKE DOS MÉDICOS (Exemplo com 10) ---
const doctorsListData = [
  { id: '1', name: 'Dra. Sofia Alves', specialty: 'Ginecologista e Obstetra', description: 'Acompanhamento completo da saúde feminina, pré-natal e pós-parto.', distance: '5km', imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Dr. Ricardo Mendes', specialty: 'Mastologista', description: 'Diagnóstico precoce e tratamento de condições mamárias.', distance: '8km', imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '3', name: 'Dra. Carolina Pinto', specialty: 'Especialista em Fertilidade', description: 'Avaliação e tratamento para casais com dificuldade para engravidar.', distance: '12km', imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '4', name: 'Dr. André Faria', specialty: 'Uroginecologista', description: 'Tratamento de incontinência urinária e prolapsos pélvicos.', distance: '3km', imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: '5', name: 'Dra. Beatriz Costa', specialty: 'Endocrinologia Ginecológica', description: 'Manejo de distúrbios hormonais, SOP, menopausa e tireoide.', distance: '15km', imageUrl: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', name: 'Dr. João Moreira', specialty: 'Oncologia Ginecológica', description: 'Tratamento cirúrgico e clínico de cânceres ginecológicos.', distance: '25km', imageUrl: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { id: '7', name: 'Dra. Inês Pereira', specialty: 'Sexologia Clínica', description: 'Aconselhamento e terapia para questões de saúde sexual feminina.', distance: '7km', imageUrl: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { id: '8', name: 'Dr. Miguel Santos', specialty: 'Medicina Fetal', description: 'Monitoramento detalhado da saúde fetal durante a gravidez.', distance: '18km', imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
  { id: '9', name: 'Dra. Laura Nunes', specialty: 'Ginecologista Infanto-Puberal', description: 'Cuidados ginecológicos específicos para crianças e adolescentes.', distance: '10km', imageUrl: 'https://randomuser.me/api/portraits/women/9.jpg' },
  { id: '10', name: 'Dr. David Gomes', specialty: 'Cirurgia Ginecológica Minimamente Invasiva', description: 'Procedimentos como laparoscopia e histeroscopia.', distance: '22km', imageUrl: 'https://randomuser.me/api/portraits/men/10.jpg' },
];

// --- COMPONENTE DO ITEM DA LISTA ---
// Criado como um componente separado para clareza e performance
const DoctorListItem = React.memo(({ item, navigation }) => (
    <TouchableOpacity
        style={styles.doctorCard}
        activeOpacity={0.7} // Feedback visual ao tocar
        onPress={() => {
            console.log("Clicou no médico:", item.name);
            // Navegar para a tela de detalhes do médico (descomentar quando a tela existir):
            // navigation.navigate('DoctorDetail', { doctorId: item.id });
        }}
    >
        {/* Container Principal do Card (Linha) */}
        <View style={styles.doctorCardContent}>
            {/* Coluna Esquerda: Informações de Texto e Distância */}
            <View style={styles.doctorInfoContainer}>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                <Text style={styles.doctorDescription} numberOfLines={2} ellipsizeMode="tail">
                    {item.description}
                </Text>
                <View style={styles.distanceContainer}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
            </View>

            {/* Coluna Direita: Imagem */}
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.doctorImage}
                resizeMode="cover" // Garante que a imagem cubra a área sem distorcer
            />
        </View>
    </TouchableOpacity>
));

// --- COMPONENTE DA TELA ---
function DoctorsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  // Filtra a lista de médicos baseado no texto de pesquisa (otimizado com useMemo)
  const filteredDoctors = useMemo(() => {
    if (!searchText.trim()) { // Verifica se a busca está vazia ou só tem espaços
      return doctorsListData; // Retorna todos se a busca estiver vazia
    }
    const lowerCaseSearch = searchText.toLowerCase();
    return doctorsListData.filter(doctor =>
      doctor.name.toLowerCase().includes(lowerCaseSearch) ||
      doctor.specialty.toLowerCase().includes(lowerCaseSearch) ||
      (doctor.description && doctor.description.toLowerCase().includes(lowerCaseSearch)) // Busca na descrição (opcional)
    );
  }, [searchText]); // Recalcula apenas quando searchText muda

  // Função para renderizar cada item usando o componente DoctorListItem
  const renderItem = ({ item }) => (
    <DoctorListItem item={item} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Barra de Pesquisa Fixa no Topo */}
      <View style={styles.searchContainer}>
          <TextInput
              style={styles.searchInput}
              placeholder="Procurar especialista..."
              placeholderTextColor={theme.colors.placeholder}
              value={searchText}
              onChangeText={setSearchText} // Atualiza o estado a cada caractere digitado
              returnKeyType="search" // Tecla de retorno vira "Buscar" no teclado
              clearButtonMode="while-editing" // Botão para limpar (iOS)
          />
          {/* Ícone de Lupa (pode ser um botão se precisar de ação específica ao clicar nele) */}
          <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
      </View>

      {/* Lista de Médicos */}
      <FlatList
        data={filteredDoctors} // Usa a lista filtrada
        renderItem={renderItem} // Função que renderiza cada item
        keyExtractor={item => item.id} // Chave única para cada item
        contentContainerStyle={styles.listContainer} // Estilo para o container interno da lista
        showsVerticalScrollIndicator={false} // Esconde a barra de rolagem vertical
        ListEmptyComponent={ // Componente para mostrar se a busca não retornar resultados
          <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>Nenhum médico encontrado.</Text>
              <Text style={styles.emptyListSubText}>Tente ajustar sua busca.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
} // <- Fechamento da função DoctorsScreen

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15, // Espaço acima da barra
    marginBottom: 10, // Espaço abaixo da barra, antes da lista
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Ajuste fino para altura
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1, // Ocupa o máximo de espaço disponível na linha
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    paddingVertical: 0, // Remove padding vertical interno no Android
    marginRight: 8, // Espaço entre o input e o ícone
  },
  searchIcon: {
    // Se precisar de um TouchableOpacity em volta, crie um container
  },
  listContainer: {
    paddingHorizontal: 15, // Espaçamento lateral para os cards dentro da lista
    paddingBottom: 20, // Espaçamento na base da lista para não colar na borda
  },
  doctorCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    marginBottom: 15, // Espaço entre os cards
    elevation: 2, // Sombra sutil Android
    shadowColor: '#000', // Sombra sutil iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    // overflow: 'hidden', // Cuidado: Pode cortar a sombra em alguns casos
  },
  doctorCardContent: {
    flexDirection: 'row', // Alinha texto e imagem lado a lado
    padding: 15, // Padding interno do card
    alignItems: 'flex-start', // Alinha itens no topo da linha (útil se a descrição for longa)
  },
  doctorInfoContainer: {
    flex: 1, // Permite que esta coluna ocupe o espaço restante antes da imagem
    marginRight: 15, // Espaço entre a coluna de texto e a imagem
  },
  doctorName: {
    fontSize: 17,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600', // Peso da fonte
    color: theme.colors.text,
    marginBottom: 4, // Pequeno espaço abaixo do nome
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primary, // Especialidade em rosa
    marginBottom: 6, // Espaço abaixo da especialidade
    fontWeight: '500', // Um pouco mais de destaque
  },
  doctorDescription: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted, // Cor mais suave para a descrição
    lineHeight: 18, // Melhora a legibilidade de múltiplas linhas
    marginBottom: 8, // Espaço abaixo da descrição
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto', // Tenta empurrar para baixo (funciona se houver espaço vertical sobrando)
    paddingTop: 5, // Pequeno espaço acima da distância se não houver espaço para empurrar
  },
  distanceText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted, // Mesma cor suave da descrição
    marginLeft: 5, // Espaço entre ícone e texto
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Metade da largura/altura para fazer um círculo perfeito
    backgroundColor: theme.colors.border, // Cor de fundo enquanto a imagem não carrega
  },
  emptyListContainer: {
    flexGrow: 1, // Ocupa o espaço disponível se a lista estiver vazia
    marginTop: 50, // Espaço acima da mensagem
    alignItems: 'center', // Centraliza horizontalmente
    justifyContent: 'center', // Centraliza verticalmente (se flexGrow funcionar)
    paddingHorizontal: 20, // Evita que o texto encoste nas laterais
  }, // <- Fechamento do estilo emptyListContainer
  emptyListText: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyListSubText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: 'center',
  }
});

export default DoctorsScreen; // Exporta o componente para ser usado em outros lugares