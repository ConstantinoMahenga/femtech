import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import WelcomeScreen from '../welcomeScreen';
import LoginScreen from '../login';
import RegisterScreen from '../cadastro';
// import DashboardScreen from '../pacientes/(tabs)/home'; // <<< NÃO PRECISA MAIS IMPORTAR DIRETAMENTE AQUI

// --- Importe o componente que contém o Tab Navigator ---
// Ajuste o caminho conforme a estrutura do seu projeto
import AppTabs from '../pacientes/(tabs)/tabNavegation'; // <<< ASSUMINDO que AppTabs.js está em ../pacientes/(tabs)/

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    // ÚNICO NavigationContainer
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        {/* Telas de Autenticação */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Tela Principal que contém as Abas */}
        <Stack.Screen
          name="Home" // <<< Dê um nome para a rota que contém as abas (ex: MainApp, App, HomeTabs)
          component={AppTabs} // <<< Use o componente AppTabs importado
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;


