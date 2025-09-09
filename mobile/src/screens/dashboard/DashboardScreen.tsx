/**
 * Dashboard Principal - Super App Regenerativo
 * Tela principal com visão geral de todas as funcionalidades
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// Hooks e contextos
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useLocation } from '../../contexts/LocationContext';

// Componentes
import MetricCard from '../../components/dashboard/MetricCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import SustainabilityOverview from '../../components/dashboard/SustainabilityOverview';
import WeatherWidget from '../../components/dashboard/WeatherWidget';
import NotificationBanner from '../../components/dashboard/NotificationBanner';
import AIInsights from '../../components/dashboard/AIInsights';
import RecentActivity from '../../components/dashboard/RecentActivity';
import GamificationProgress from '../../components/dashboard/GamificationProgress';
import IoTDevicesStatus from '../../components/dashboard/IoTDevicesStatus';
import BlockchainSummary from '../../components/dashboard/BlockchainSummary';

// Serviços
import { getDashboardData } from '../../services/DashboardService';
import { getWeatherData } from '../../services/WeatherService';
import { getAIInsights } from '../../services/AIService';
import { getGamificationData } from '../../services/GamificationService';
import { getIoTDevicesStatus } from '../../services/IoTService';
import { getBlockchainSummary } from '../../services/BlockchainService';

// Tipos
import type { DashboardData, WeatherData, AIInsight } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {}

const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { updateData } = useData();
  const { location } = useLocation();
  
  // Estados
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [gamificationData, setGamificationData] = useState(null);
  const [iotDevices, setIoTDevices] = useState([]);
  const [blockchainSummary, setBlockchainSummary] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animações
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  
  // Carrega dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Atualiza dados baseado na localização
  useEffect(() => {
    if (location) {
      loadWeatherData();
    }
  }, [location]);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [dashboard, insights, gamification, devices, blockchain] = await Promise.all([
        getDashboardData(),
        getAIInsights(),
        getGamificationData(),
        getIoTDevicesStatus(),
        getBlockchainSummary(),
      ]);
      
      setDashboardData(dashboard);
      setAIInsights(insights);
      setGamificationData(gamification);
      setIoTDevices(devices);
      setBlockchainSummary(blockchain);
      
      updateData('dashboard', dashboard);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadWeatherData = async () => {
    if (!location) return;
    
    try {
      const weather = await getWeatherData(location.latitude, location.longitude);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };
  
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    await loadWeatherData();
    setIsRefreshing(false);
  }, []);
  
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Animação do header
    headerOpacity.value = withTiming(
      interpolate(offsetY, [0, 100], [1, 0.8], 'clamp')
    );
  };
  
  const quickActions = [
    {
      id: 'scan-qr',
      title: 'Escanear QR',
      icon: 'qr-code-scanner',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('QRScanner'),
    },
    {
      id: 'add-metric',
      title: 'Nova Métrica',
      icon: 'add-chart',
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('AddMetric'),
    },
    {
      id: 'ar-view',
      title: 'Visualizar AR',
      icon: 'view-in-ar',
      color: theme.colors.eco,
      onPress: () => navigation.navigate('AR'),
    },
    {
      id: 'chat-ai',
      title: 'Chat IA',
      icon: 'smart-toy',
      color: theme.colors.info,
      onPress: () => navigation.navigate('Chat'),
    },
  ];
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            'clamp'
          ),
        },
      ],
    };
  });
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Icon name="eco" size={64} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
            Carregando dados sustentáveis...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com gradiente */}
      <Animated.View style={[headerAnimatedStyle]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Icon name="account-circle" size={32} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Widget do clima */}
          {weatherData && (
            <WeatherWidget data={weatherData} style={styles.weatherWidget} />
          )}
        </LinearGradient>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de notificações */}
        <NotificationBanner style={styles.section} />
        
        {/* Ações rápidas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Ações Rápidas
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>
        
        {/* Visão geral de sustentabilidade */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Impacto Sustentável
          </Text>
          <SustainabilityOverview data={dashboardData?.sustainability} />
        </View>
        
        {/* Métricas principais */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Métricas Principais
          </Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Pegada de Carbono"
              value={dashboardData?.metrics?.carbonFootprint || 0}
              unit="kg CO₂"
              trend={-12}
              icon="eco"
              color={theme.colors.eco}
            />
            <MetricCard
              title="Economia de Energia"
              value={dashboardData?.metrics?.energySaved || 0}
              unit="kWh"
              trend={8}
              icon="flash-on"
              color={theme.colors.energy}
            />
            <MetricCard
              title="Água Economizada"
              value={dashboardData?.metrics?.waterSaved || 0}
              unit="L"
              trend={15}
              icon="water-drop"
              color={theme.colors.water}
            />
            <MetricCard
              title="Resíduos Reciclados"
              value={dashboardData?.metrics?.wasteRecycled || 0}
              unit="kg"
              trend={22}
              icon="recycling"
              color={theme.colors.waste}
            />
          </View>
        </View>
        
        {/* Progresso de gamificação */}
        {gamificationData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Seu Progresso
            </Text>
            <GamificationProgress data={gamificationData} />
          </View>
        )}
        
        {/* Insights de IA */}
        {aiInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Insights Inteligentes
            </Text>
            <AIInsights insights={aiInsights} />
          </View>
        )}
        
        {/* Status dos dispositivos IoT */}
        {iotDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Dispositivos IoT
            </Text>
            <IoTDevicesStatus devices={iotDevices} />
          </View>
        )}
        
        {/* Resumo blockchain */}
        {blockchainSummary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Blockchain
            </Text>
            <BlockchainSummary data={blockchainSummary} />
          </View>
        )}
        
        {/* Atividade recente */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Atividade Recente
          </Text>
          <RecentActivity data={dashboardData?.recentActivity} />
        </View>
        
        {/* Espaçamento inferior */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 4,
  },
  weatherWidget: {
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default DashboardScreen;