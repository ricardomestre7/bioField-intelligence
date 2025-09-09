/**
 * Contexto de Autenticação
 * Gerencia login, registro, perfil do usuário e sessões
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import TouchID from 'react-native-touch-id';

// Tipos
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  birthDate?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    currency: string;
    units: 'metric' | 'imperial';
  };
  profile: {
    sustainabilityGoals: string[];
    interests: string[];
    location?: {
      city: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    gamification: {
      level: number;
      points: number;
      badges: string[];
      achievements: string[];
    };
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    expiresAt?: string;
    features: string[];
  };
  createdAt: string;
  lastLoginAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  biometricEnabled: boolean;
  rememberMe: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken?: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_BIOMETRIC'; payload: boolean }
  | { type: 'SET_REMEMBER_ME'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  biometricEnabled: false,
  rememberMe: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
      };
      
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        biometricEnabled: state.biometricEnabled,
      };
      
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
      
    case 'SET_BIOMETRIC':
      return {
        ...state,
        biometricEnabled: action.payload,
      };
      
    case 'SET_REMEMBER_ME':
      return {
        ...state,
        rememberMe: action.payload,
      };
      
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
      
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@user_data',
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  BIOMETRIC: '@biometric_enabled',
  REMEMBER_ME: '@remember_me',
};

// Configuração do Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // Substitua pelo seu Web Client ID
  offlineAccess: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  useEffect(() => {
    initializeAuth();
  }, []);
  
  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verifica se há sessão salva
      const [savedUser, savedToken, biometricEnabled, rememberMe] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC),
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
      ]);
      
      dispatch({ type: 'SET_BIOMETRIC', payload: biometricEnabled === 'true' });
      dispatch({ type: 'SET_REMEMBER_ME', payload: rememberMe === 'true' });
      
      if (savedUser && savedToken && rememberMe === 'true') {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'RESTORE_SESSION', payload: { user, token: savedToken } });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const saveSession = async (user: User, token: string, refreshToken?: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        refreshToken ? AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };
  
  const clearSession = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Autenticação com Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      // Busca dados completos do usuário da API
      const token = await firebaseUser.getIdToken();
      const userData = await fetchUserData(firebaseUser.uid, token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token },
      });
      
      if (state.rememberMe) {
        await saveSession(userData, token);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Cria usuário no Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Atualiza perfil no Firebase
      await firebaseUser.updateProfile({
        displayName: userData.name,
      });
      
      // Cria perfil completo na API
      const token = await firebaseUser.getIdToken();
      const user = await createUserProfile({
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        birthDate: userData.birthDate,
      }, token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      if (state.rememberMe) {
        await saveSession(user, token);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      let userData: User;
      
      if (userCredential.additionalUserInfo?.isNewUser) {
        // Novo usuário - cria perfil
        userData = await createUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName!,
        }, token);
      } else {
        // Usuário existente - busca dados
        userData = await fetchUserData(firebaseUser.uid, token);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token },
      });
      
      if (state.rememberMe) {
        await saveSession(userData, token);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error('Erro ao fazer login com Google');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loginWithFacebook = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('Login cancelado');
      }
      
      const data = await AccessToken.getCurrentAccessToken();
      
      if (!data) {
        throw new Error('Erro ao obter token do Facebook');
      }
      
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await auth().signInWithCredential(facebookCredential);
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      let userData: User;
      
      if (userCredential.additionalUserInfo?.isNewUser) {
        userData = await createUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName!,
        }, token);
      } else {
        userData = await fetchUserData(firebaseUser.uid, token);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token },
      });
      
      if (state.rememberMe) {
        await saveSession(userData, token);
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      throw new Error('Erro ao fazer login com Facebook');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loginWithBiometric = async () => {
    try {
      if (!state.biometricEnabled) {
        throw new Error('Autenticação biométrica não está habilitada');
      }
      
      const biometryType = await TouchID.isSupported();
      
      await TouchID.authenticate('Use sua biometria para fazer login', {
        title: 'Autenticação Biométrica',
        subtitle: 'Use sua impressão digital ou Face ID',
        description: 'Coloque seu dedo no sensor ou olhe para a câmera',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });
      
      // Restaura sessão salva após autenticação biométrica
      const [savedUser, savedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);
      
      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'RESTORE_SESSION', payload: { user, token: savedToken } });
      } else {
        throw new Error('Sessão não encontrada');
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      throw new Error('Erro na autenticação biométrica');
    }
  };
  
  const logout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      await LoginManager.logOut();
      await clearSession();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!state.user || !state.token) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser = await updateUserProfile(state.user.id, data, state.token);
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      if (state.rememberMe) {
        await saveSession(updatedUser, state.token);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('Usuário não autenticado');
      }
      
      // Reautentica o usuário
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      
      // Atualiza a senha
      await user.updatePassword(newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  const enableBiometric = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      
      await TouchID.authenticate('Habilitar autenticação biométrica', {
        title: 'Configurar Biometria',
        subtitle: 'Configure sua biometria para login rápido',
        description: 'Use sua impressão digital ou Face ID para fazer login',
        fallbackLabel: 'Cancelar',
        cancelLabel: 'Cancelar',
      });
      
      dispatch({ type: 'SET_BIOMETRIC', payload: true });
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, 'true');
    } catch (error) {
      console.error('Enable biometric error:', error);
      throw new Error('Erro ao habilitar autenticação biométrica');
    }
  };
  
  const disableBiometric = async () => {
    dispatch({ type: 'SET_BIOMETRIC', payload: false });
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, 'false');
  };
  
  const refreshSession = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        const userData = await fetchUserData(user.uid, token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: userData, token },
        });
        
        if (state.rememberMe) {
          await saveSession(userData, token);
        }
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      await logout();
    }
  };
  
  const value: AuthContextType = {
    state,
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithBiometric,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    enableBiometric,
    disableBiometric,
    refreshSession,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Funções auxiliares
const fetchUserData = async (uid: string, token: string): Promise<User> => {
  // Implementar chamada para API
  // Por enquanto, retorna dados mock
  return {
    id: uid,
    email: 'user@example.com',
    name: 'Usuário',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'pt-BR',
      currency: 'BRL',
      units: 'metric',
    },
    profile: {
      sustainabilityGoals: [],
      interests: [],
      gamification: {
        level: 1,
        points: 0,
        badges: [],
        achievements: [],
      },
    },
    subscription: {
      plan: 'free',
      features: [],
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
};

const createUserProfile = async (userData: Partial<User>, token: string): Promise<User> => {
  // Implementar chamada para API
  return fetchUserData(userData.id!, token);
};

const updateUserProfile = async (uid: string, data: Partial<User>, token: string): Promise<User> => {
  // Implementar chamada para API
  return fetchUserData(uid, token);
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    default:
      return 'Erro de autenticação';
  }
};

export type { User, AuthState, RegisterData };