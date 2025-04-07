// navigation/StackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Telas de autenticação
import WelcomeScreen from '../welcomeScreen';
import LoginScreen from '../login';
import RegisterScreen from '../cadastro';

// Telas para pacientes
import PatientTabs from '../pacientes/(tabs)/tabNavegation';

// Telas para médicos
import DoctorTabs from '../medicos/(tabs)/tabNavegation';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, isLoading, role } = useAuth();

  if (isLoading) {
    return null; // Ou um componente de loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Usuário logado - redireciona baseado no role
          role === 'medico' ? (
            <Stack.Screen name="DoctorHome" component={DoctorTabs} />
          ) : (
            <Stack.Screen name="PatientHome" component={PatientTabs} />
          )
        ) : (
          // Usuário não logado
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;