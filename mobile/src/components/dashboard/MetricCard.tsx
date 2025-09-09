/**
 * Componente de Card de Métrica
 * Exibe métricas com valores, tendências e ícones
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2;

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: number;
  icon: string;
  color: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toFixed(1);
  };
  
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? 'trending-up' : 'trending-down';
  };
  
  const getTrendColor = () => {
    if (!trend) return theme.colors.textSecondary;
    return trend > 0 ? theme.colors.success : theme.colors.error;
  };
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const CardContent = (
    <Animated.View style={[animatedStyle]}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: color + '30',
          },
        ]}
      >
        {/* Header com ícone */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <Icon
                name={getTrendIcon()!}
                size={16}
                color={getTrendColor()}
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
        
        {/* Valor principal */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {formatValue(value)}
          </Text>
          <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
            {unit}
          </Text>
        </View>
        
        {/* Título */}
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        
        {/* Indicador de progresso */}
        <View style={[styles.progressBar, { backgroundColor: color + '20' }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: color,
                width: `${Math.min(Math.abs(trend || 50), 100)}%`,
              },
            ]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }
  
  return <View style={styles.container}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    padding: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginLeft: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default MetricCard;