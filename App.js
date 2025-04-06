import React from 'react';
// O caminho para StackNavigator está correto conforme seu código
import StackNavigator from './navegation/StackNavigator';
// O caminho para AuthProvider (assumindo context/ na raiz)
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    // Envolve o StackNavigator com o AuthProvider
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
};

export default App;