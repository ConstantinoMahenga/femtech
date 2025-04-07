
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navegation/StackNavigator';
import { StatusBar } from 'react-native';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}