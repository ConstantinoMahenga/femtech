import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Verifique o caminho

// Telas de autenticação
import WelcomeScreen from '../welcomeScreen'; // Verifique o caminho
import LoginScreen from '../login';           // Verifique o caminho
import RegisterScreen from '../cadastro';     // Verifique o caminho

// Telas Principais (Abas)
import PatientTabs from '../pacientes/(tabs)/tabNavegation'; // Verifique o caminho
import DoctorTabs from '../medicos/(tabs)/tabNavegation';   // Verifique o caminho

// --- Telas de Detalhe (Adicionadas) ---
// *** IMPORTANTE: Verifique os caminhos corretos para estas telas ***
import ChatScreen from '../pacientes/conversainterna'; // Exemplo: ../screens/ChatScreen
//import ViewDoctorProfileScreen from '../path/to/your/ViewDoctorProfileScreen'; // Exemplo: ../screens/ViewDoctorProfileScreen

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, isLoading, role } = useAuth();

  if (isLoading) {
    // Você pode mostrar um splash screen ou ActivityIndicator aqui
    // import { ActivityIndicator, View } from 'react-native';
    // return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" /></View>;
    return null;
  }

  return (
    <NavigationContainer>
      {/* Mova o screenOptions para cá se quiser aplicá-lo a todas as telas */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // --- Usuário Logado ---
          // Define TODAS as telas acessíveis após o login aqui
          <>
            {role === 'medico' ? (
              // Se for médico, a tela inicial das abas é DoctorTabs
              <Stack.Screen name="DoctorHome" component={DoctorTabs} />
            ) : (
              // Se for paciente (ou outro), a tela inicial das abas é PatientTabs
              <Stack.Screen name="PatientHome" component={PatientTabs} />
            )}

            {/* Telas de Detalhe que podem ser acessadas a partir das abas */}
            <Stack.Screen
              name="ChatScreen" // Nome usado em navigation.navigate
              component={ChatScreen}
              // options={{ headerShown: false }} // Já está no screenOptions global
            />
           
             {/* Adicione outras telas de detalhe aqui, se houver */}

             {/* Se DoctorTabs precisar acessar PatientTabs ou vice-versa (improvável), adicione a outra aqui também */}
             {/* Exemplo: <Stack.Screen name="PatientHomeForDoctor" component={PatientTabs} /> */}

          </>
        ) : (
          // --- Usuário Não Logado ---
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