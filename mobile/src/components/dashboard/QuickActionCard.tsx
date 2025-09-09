/**
 * Componente de Card de Ação Rápida
 * Botões de acesso rápido para funcionalidades principais
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
const cardWidth = (screenWidth - 80) / 4;

interface QuickActionCardProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    rotation.value = withTiming(5, { duration: 100 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withTiming(0, { duration: 100 });
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
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
          {/* Ícone */}
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Icon name={icon} size={28} color={color} />
          </View>
          
          {/* Título */}
          <Text
            style={[styles.title, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          
          {/* Indicador de ação */}
          <View style={[styles.actionIndicator, { backgroundColor: color }]} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  card: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default QuickActionCard;