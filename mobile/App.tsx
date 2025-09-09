/**
 * Super App Regenerativo - Aplicativo Mobile Principal
 * Plataforma móvel nativa com recursos avançados de sustentabilidade,
 * blockchain, IA, IoT, AR/VR e colaboração em tempo real
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Alert,
  AppState,
  Linking,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import SplashScreen from 'react-native-splash-screen';
import { QueryClient, QueryClientProvider } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Importações dos módulos principais
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { DataProvider } from './src/contexts/DataContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { BiometricProvider } from './src/contexts/BiometricContext';

// Importações das telas principais
import SplashScreenComponent from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import BiometricSetupScreen from './src/screens/auth/BiometricSetupScreen';

// Telas principais do app
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import MetricsScreen from './src/screens/metrics/MetricsScreen';
import SustainabilityScreen from './src/screens/sustainability/SustainabilityScreen';
import BlockchainScreen from './src/screens/blockchain/BlockchainScreen';
import IoTScreen from './src/screens/iot/IoTScreen';
import ARScreen from './src/screens/ar/ARScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import CollaborationScreen from './src/screens/collaboration/CollaborationScreen';
import PaymentsScreen from './src/screens/payments/PaymentsScreen';
import MarketplaceScreen from './src/screens/marketplace/MarketplaceScreen';
import GamificationScreen from './src/screens/gamification/GamificationScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

// Componentes utilitários
import LoadingScreen from './src/components/common/LoadingScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import NetworkStatus from './src/components/common/NetworkStatus';
import UpdatePrompt from './src/components/common/UpdatePrompt';

// Serviços
import { initializeServices } from './src/services';
import { setupPushNotifications } from './src/services/NotificationService';
import { initializeAnalytics } from './src/services/AnalyticsService';
import { setupCrashReporting } from './src/services/CrashService';
import { initializeDatabase } from './src/services/DatabaseService';
import { setupBackgroundTasks } from './src/services/BackgroundService';

// Configurações
import { navigationRef } from './src/navigation/NavigationService';
import { linking } from './src/navigation/LinkingConfig';

// Tipos
import type { RootStackParamList } from './src/types/navigation';

// Navegadores
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Cliente React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// Componente de Tabs Principal
const MainTabs: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Metrics':
              iconName = 'analytics';
              break;
            case 'Sustainability':
              iconName = 'eco';
              break;
            case 'Blockchain':
              iconName = 'account-balance';
              break;
            case 'IoT':
              iconName = 'sensors';
              break;
            case 'AR':
              iconName = 'view-in-ar';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Collaboration':
              iconName = 'group';
              break;
            case 'Payments':
              iconName = 'payment';
              break;
            case 'Marketplace':
              iconName = 'store';
              break;
            case 'Gamification':
              iconName = 'emoji-events';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Metrics" 
        component={MetricsScreen}
        options={{ tabBarLabel: 'Métricas' }}
      />
      <Tab.Screen 
        name="Sustainability" 
        component={SustainabilityScreen}
        options={{ tabBarLabel: 'Sustentabilidade' }}
      />
      <Tab.Screen 
        name="Blockchain" 
        component={BlockchainScreen}
        options={{ tabBarLabel: 'Blockchain' }}
      />
      <Tab.Screen 
        name="IoT" 
        component={IoTScreen}
        options={{ tabBarLabel: 'IoT' }}
      />
      <Tab.Screen 
        name="AR" 
        component={ARScreen}
        options={{ tabBarLabel: 'AR' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="Collaboration" 
        component={CollaborationScreen}
        options={{ tabBarLabel: 'Colaboração' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ tabBarLabel: 'Pagamentos' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{ tabBarLabel: 'Marketplace' }}
      />
      <Tab.Screen 
        name="Gamification" 
        component={GamificationScreen}
        options={{ tabBarLabel: 'Gamificação' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Componente de Drawer Principal
const MainDrawer: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{
          drawerLabel: 'Início',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          title: 'Super App Regenerativo',
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerLabel: 'Configurações',
          drawerIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          drawerLabel: 'Notificações',
          drawerIcon: ({ color, size }) => (
            <Icon name="notifications" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Componente de Navegação de Autenticação
const AuthStack: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Criar Conta' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Recuperar Senha' }}
      />
      <Stack.Screen 
        name="BiometricSetup" 
        component={BiometricSetupScreen}
        options={{ title: 'Configurar Biometria' }}
      />
    </Stack.Navigator>
  );
};

// Componente Principal de Navegação
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    checkFirstLaunch();
  }, []);
  
  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);
      
      // Simula tempo de splash screen
      setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hide();
      }, 2000);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
      setShowSplash(false);
    }
  };
  
  if (showSplash) {
    return <SplashScreenComponent />;
  }
  
  if (isLoading || isFirstLaunch === null) {
    return <LoadingScreen />;
  }
  
  if (isFirstLaunch) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainDrawer} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

// Componente Principal do App
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      // Inicializa serviços essenciais
      await initializeServices();
      await initializeDatabase();
      await setupPushNotifications();
      await initializeAnalytics();
      await setupCrashReporting();
      await setupBackgroundTasks();
      
      // Verifica conectividade
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn('App started without internet connection');
      }
      
      // Verifica atualizações
      const currentVersion = DeviceInfo.getVersion();
      console.log('App version:', currentVersion);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setInitError('Erro ao inicializar o aplicativo. Tente novamente.');
    }
  };
  
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App voltou ao primeiro plano
      console.log('App became active');
    } else if (nextAppState === 'background') {
      // App foi para segundo plano
      console.log('App went to background');
    }
  };
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
  
  // Manipula deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      // Implementar navegação baseada no deep link
    };
    
    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    // Verifica se o app foi aberto por um deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });
    
    return () => {
      linkingListener.remove();
    };
  }, []);
  
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.errorGradient}
        >
          <Icon name="error" size={64} color="white" />
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorMessage}>{initError}</Text>
        </LinearGradient>
      </View>
    );
  }
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <DataProvider>
                  <NotificationProvider>
                    <LocationProvider>
                      <BiometricProvider>
                        <StatusBar
                          barStyle="light-content"
                          backgroundColor="#2E7D32"
                          translucent={false}
                        />
                        <NavigationContainer
                          ref={navigationRef}
                          linking={linking}
                          fallback={<LoadingScreen />}
                        >
                          <AppNavigator />
                        </NavigationContainer>
                        <NetworkStatus />
                        <UpdatePrompt />
                      </BiometricProvider>
                    </LocationProvider>
                  </NotificationProvider>
                </DataProvider>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default App;