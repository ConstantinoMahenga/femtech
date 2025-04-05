import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// --- Importando suas telas REAIS com os nomes de arquivo fornecidos ---
import ChatListScreen from './conversa';
import DashboardScreen from './home';
import DoctorsScreen from './medicos';
import MyProfileScreen from './perfil';

// --- TEMA ---
const theme = {
  colors: {
    primary: '#FF69B4',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textMuted: '#888',
    border: '#eee',
    cardBackground: '#fff',
  },
};

const Tab = createBottomTabNavigator();

function AppTabs() { // Este componente agora só define o TabNavigator
  return (
    // <NavigationContainer> <--- REMOVA ESTA LINHA
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = focused ? size + 1 : size;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'DoctorsTab') {
            iconName = 'briefcase';
          } else if (route.name === 'ChatsTab') {
            iconName = 'message-square';
          } else if (route.name === 'ProfileTab') {
            iconName = 'user';
          }

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="DoctorsTab"
        component={DoctorsScreen}
        options={{ tabBarLabel: 'Médicos' }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Conversas' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MyProfileScreen}
        options={{ tabBarLabel: 'Meu Perfil' }}
      />
    </Tab.Navigator>
    // </NavigationContainer> <--- REMOVA ESTA LINHA
  );
}

// --- ESTILOS ---
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

// Exporte o componente AppTabs
export default AppTabs; // Certifique-se de que está exportando corretamente