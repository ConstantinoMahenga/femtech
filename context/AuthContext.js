// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para persistência (opcional, mas recomendado)

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para guardar os dados do usuário
  const [isLoading, setIsLoading] = useState(true); // Estado para verificar se está carregando o usuário do storage

  // Efeito para tentar carregar o usuário do AsyncStorage ao iniciar o app
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("AuthProvider: Erro ao carregar usuário do storage", e);
        // Tratar erro, talvez limpar storage
      } finally {
        setIsLoading(false); // Finaliza o carregamento inicial
      }
    };

    loadUserFromStorage();
  }, []);

  // Função de Login
  const login = async (userData) => {
    try {
      console.log("AuthProvider: Logando usuário:", userData);
      setUser(userData); // Define o usuário no estado
      // Salva o usuário no AsyncStorage para persistência
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
    } catch (e) {
      console.error("AuthProvider: Erro ao salvar usuário no storage", e);
    }
  };

  // Função de Logout
  const logout = async () => {
    try {
      console.log("AuthProvider: Deslogando usuário");
      setUser(null); // Limpa o usuário do estado
      // Remove o usuário do AsyncStorage
      await AsyncStorage.removeItem('@auth_user');
    } catch (e) {
      console.error("AuthProvider: Erro ao remover usuário do storage", e);
    }
  };

  // Valor fornecido pelo contexto
  const value = {
    user,
    isLoggedIn: !!user, // True se user não for null
    isLoading,         // Para saber se o estado inicial já foi carregado
    login,
    logout,
  };

  // Não renderiza nada até que o estado inicial seja carregado (evita piscar a tela de login)
  if (isLoading) {
     // Pode retornar um componente de Loading aqui se preferir
     return null;
   }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};