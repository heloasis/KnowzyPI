
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Usuario } from '../types/auth';

type AuthContextType = {
  user: Usuario | null;
  isLoading: boolean;
  signIn: (user: Usuario) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: Usuario | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<Usuario | null>(null);

  // Não precisamos carregar dados salvos.
  const isLoading = false;

  const signIn = async (nextUser: Usuario) => {
    try {
      await AsyncStorage.multiRemove(['favoritos', 'knowzyFavoritos']);
    } catch (error) {
      // Ignora falhas de storage em ambientes restritivos.
    }

    setUserState(nextUser);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['favoritos', 'knowzyFavoritos']);
    } catch (error) {
      // Ignora falhas de storage em ambientes restritivos.
    }

    setUserState(null);
  };

  const setUser = async (nextUser: Usuario | null) => {
    setUserState(nextUser);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
      setUser,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
