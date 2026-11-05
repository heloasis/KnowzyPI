
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken } from '../api/api';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem('knowzy:user');
        const savedToken = await AsyncStorage.getItem('knowzy:token');
        if (savedUser) setUserState(JSON.parse(savedUser));
        if (savedToken) await setAuthToken(savedToken);
      } catch (error) { console.warn('Não foi possível recuperar a sessão local.', error); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const signIn = async (nextUser: Usuario) => {
    try {
      await AsyncStorage.setItem('knowzy:user', JSON.stringify(nextUser));
    } catch (error) {
      // Ignora falhas de storage em ambientes restritivos.
    }

    setUserState(nextUser);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['knowzy:user', 'knowzy:token']);
      await clearAuthToken();
    } catch (error) {
      // Ignora falhas de storage em ambientes restritivos.
    }

    setUserState(null);
  };

  const setUser = async (nextUser: Usuario | null) => {
    setUserState(nextUser);
    if (nextUser) await AsyncStorage.setItem('knowzy:user', JSON.stringify(nextUser));
    else await AsyncStorage.removeItem('knowzy:user');
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
