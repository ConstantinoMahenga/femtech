// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (userData) => {
    try {
      // Buscar dados adicionais do Firestore
      const userDoc = await getDoc(doc(db, "users", userData.uid));
      const userRole = userDoc.data()?.role || 'paciente';
      
      const completeUserData = {
        ...userData,
        role: userRole
      };

      setUser(completeUserData);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(completeUserData));
    } catch (e) {
      console.error("Erro ao fazer login:", e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@auth_user');
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    role: user?.role // Adiciona role ao contexto
  };

  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};