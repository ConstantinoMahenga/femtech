import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Importe o hook de autenticação (relativo a navegation/)
import { useAuth } from '../context/AuthContext';

// Importe suas telas (ajuste '../screens/' se estiverem em outro lugar)
import WelcomeScreen from '../welcomeScreen';   // Assumindo screens/WelcomeScreen.js
import LoginScreen from '../login';       // Assumindo screens/LoginScreen.js
import RegisterScreen from '../cadastro';  // Assumindo screens/RegisterScreen.js

// Importe o componente que contém as Tabs (caminho original)
import AppTabs from '../pacientes/(tabs)/tabNavegation'; // Caminho do seu código



const Stack = createStackNavigator();

const StackNavigator = () => {
  // Use o hook para obter o estado de login e carregamento
  const { isLoggedIn, isLoading } = useAuth();

  // Se ainda estiver carregando, retorne null ou um splash/loading
   if (isLoading) {
     return null; // Ou <SplashScreen />
   }

  return (
    // O NavigationContainer fica aqui
    <NavigationContainer>
      {/* Usa os nomes de rota do seu código original */}
      <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Welcome"} screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // --- Tela Logada ---
          // A rota "Home" agora aponta para o componente das suas abas
          <Stack.Screen
            name="Home" // Mantém o nome da rota principal
            component={AppTabs} // Usa o componente de abas importado
          />
          // Adicione outras telas *fora* das abas que precisam de login aqui, se houver

        ) : (
          // --- Telas Não Logadas ---
          // Mantém as telas de autenticação
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            
            {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
