import React from 'react';
import { Platform, StyleSheet } from 'react-native'; // View e Text não são mais necessários aqui
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// --- Importando APENAS as duas telas necessárias ---
import ChatListScreen from './conversas';      // Tela da lista de conversas
import DoctorProfileScreen from './perfil';       // Tela de perfil do médico
// Removidas as importações de home e medicos

// --- TEMA (Mantido) ---
const theme = {
  colors: {
    primary: '#FF69B4', // Rosa Principal
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888', // Cor para ícones inativos
    border: '#eee',
    cardBackground: '#fff',
  },
};

const Tab = createBottomTabNavigator();

function Medico() {
  return (
    // O <NavigationContainer> geralmente envolve este componente no App.js
    // <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // --- Configurações Gerais das Abas ---
          headerShown: false, // Mantém sem cabeçalho padrão
          tabBarActiveTintColor: theme.colors.primary, // Cor ativa (Rosa)
          tabBarInactiveTintColor: theme.colors.textMuted, // Cor inativa (Cinza)
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,

          // --- Definição do Ícone (Simplificada) ---
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const iconSize = focused ? size + 1 : size;

            // Define o ícone baseado APENAS nas rotas restantes
            if (route.name === 'ChatsTab') { // Nome da rota para Conversas
              iconName = 'message-square';
            } else if (route.name === 'ProfileTab') { // Nome da rota para Perfil
              iconName = 'user';
            } else {
              iconName = 'circle'; // Fallback caso algo dê errado
            }

            return <Icon name={iconName} size={iconSize} color={color} />;
          },
        })}
      >
        {/* --- Definindo APENAS as duas abas necessárias --- */}
        <Tab.Screen
          name="ChatsTab" // Nome da rota para a aba Conversas
          component={ChatListScreen} // Componente da lista de conversas
          options={{
            tabBarLabel: 'Conversas', // Texto da aba
          }}
        />
        <Tab.Screen
          name="ProfileTab" // Nome da rota para a aba Perfil
          component={DoctorProfileScreen} // Componente do perfil
          options={{
            tabBarLabel: 'Meu Perfil', // Texto da aba
          }}
        />
        {/* Removidas as Tab.Screen para HomeTab e DoctorsTab */}
      </Tab.Navigator>
    // </NavigationContainer>
  );
}

// --- ESTILOS para a Tab Bar (Mantidos) ---
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 90 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 11,
    marginBottom: Platform.OS === 'android' ? 5 : 0,
  },
});

export default Medico;