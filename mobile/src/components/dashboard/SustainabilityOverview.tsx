/**
 * Componente de Visão Geral de Sustentabilidade
 * Exibe métricas e progresso de impacto ambiental
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface SustainabilityData {
  carbonReduction: number;
  energyEfficiency: number;
  waterConservation: number;
  wasteReduction: number;
  overallScore: number;
  monthlyGoal: number;
  achievements: string[];
}

interface SustainabilityOverviewProps {
  data?: SustainabilityData;
}

const SustainabilityOverview: React.FC<SustainabilityOverviewProps> = ({ data }) => {
  const { theme } = useTheme();
  
  // Valores padrão se não houver dados
  const sustainabilityData: SustainabilityData = data || {
    carbonReduction: 75,
    energyEfficiency: 82,
    waterConservation: 68,
    wasteReduction: 91,
    overallScore: 79,
    monthlyGoal: 85,
    achievements: ['Eco Warrior', 'Energy Saver', 'Water Guardian'],
  };
  
  // Animações
  const progressAnimations = {
    carbon: useSharedValue(0),
    energy: useSharedValue(0),
    water: useSharedValue(0),
    waste: useSharedValue(0),
    overall: useSharedValue(0),
  };
  
  useEffect(() => {
    // Anima as barras de progresso com delay
    progressAnimations.carbon.value = withDelay(
      100,
      withTiming(sustainabilityData.carbonReduction, { duration: 1000 })
    );
    progressAnimations.energy.value = withDelay(
      200,
      withTiming(sustainabilityData.energyEfficiency, { duration: 1000 })
    );
    progressAnimations.water.value = withDelay(
      300,
      withTiming(sustainabilityData.waterConservation, { duration: 1000 })
    );
    progressAnimations.waste.value = withDelay(
      400,
      withTiming(sustainabilityData.wasteReduction, { duration: 1000 })
    );
    progressAnimations.overall.value = withDelay(
      500,
      withTiming(sustainabilityData.overallScore, { duration: 1200 })
    );
  }, [data]);
  
  const metrics = [
    {
      key: 'carbon',
      title: 'Redução de Carbono',
      value: sustainabilityData.carbonReduction,
      icon: 'eco',
      color: theme.colors.eco,
      animation: progressAnimations.carbon,
    },
    {
      key: 'energy',
      title: 'Eficiência Energética',
      value: sustainabilityData.energyEfficiency,
      icon: 'flash-on',
      color: theme.colors.energy,
      animation: progressAnimations.energy,
    },
    {
      key: 'water',
      title: 'Conservação de Água',
      value: sustainabilityData.waterConservation,
      icon: 'water-drop',
      color: theme.colors.water,
      animation: progressAnimations.water,
    },
    {
      key: 'waste',
      title: 'Redução de Resíduos',
      value: sustainabilityData.wasteReduction,
      icon: 'recycling',
      color: theme.colors.waste,
      animation: progressAnimations.waste,
    },
  ];
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muito Bom';
    if (score >= 70) return 'Bom';
    if (score >= 60) return 'Regular';
    return 'Precisa Melhorar';
  };
  
  const overallAnimatedStyle = useAnimatedStyle(() => {
    const progress = progressAnimations.overall.value;
    return {
      width: `${progress}%`,
    };
  });
  
  const renderProgressBar = (metric: any) => {
    const animatedStyle = useAnimatedStyle(() => {
      const progress = metric.animation.value;
      return {
        width: `${progress}%`,
      };
    });
    
    return (
      <View key={metric.key} style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <View style={styles.metricInfo}>
            <Icon name={metric.icon} size={20} color={metric.color} />
            <Text style={[styles.metricTitle, { color: theme.colors.textPrimary }]}>
              {metric.title}
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
            {metric.value}%
          </Text>
        </View>
        
        <View style={[styles.progressTrack, { backgroundColor: metric.color + '20' }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: metric.color },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    );
  };
  
  return (
    <LinearGradient
      colors={[theme.colors.eco + '10', theme.colors.eco + '05']}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.eco + '20',
        },
      ]}
    >
      {/* Score geral */}
      <View style={styles.overallSection}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
            Pontuação Sustentável
          </Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(sustainabilityData.overallScore) }]}>
            {sustainabilityData.overallScore}
          </Text>
          <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
            {getScoreLabel(sustainabilityData.overallScore)}
          </Text>
        </View>
        
        <View style={styles.goalContainer}>
          <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
            Meta do Mês: {sustainabilityData.monthlyGoal}%
          </Text>
          <View style={[styles.goalTrack, { backgroundColor: theme.colors.primary + '20' }]}>
            <Animated.View
              style={[
                styles.goalFill,
                { backgroundColor: theme.colors.primary },
                overallAnimatedStyle,
              ]}
            />
          </View>
        </View>
      </View>
      
      {/* Métricas individuais */}
      <View style={styles.metricsSection}>
        {metrics.map(renderProgressBar)}
      </View>
      
      {/* Conquistas */}
      {sustainabilityData.achievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <Text style={[styles.achievementsTitle, { color: theme.colors.textPrimary }]}>
            Conquistas Recentes
          </Text>
          <View style={styles.achievementsList}>
            {sustainabilityData.achievements.map((achievement, index) => (
              <View key={index} style={[styles.achievementBadge, { backgroundColor: theme.colors.success + '20' }]}>
                <Icon name="emoji-events" size={16} color={theme.colors.success} />
                <Text style={[styles.achievementText, { color: theme.colors.success }]}>
                  {achievement}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallSection: {
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalContainer: {
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  goalTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SustainabilityOverview;