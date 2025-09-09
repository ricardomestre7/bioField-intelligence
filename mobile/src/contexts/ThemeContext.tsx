/**
 * Contexto de Tema
 * Gerencia temas, modo escuro e personalização visual
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição de cores para diferentes temas
const lightTheme = {
  colors: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#4CAF50',
    secondary: '#FF6F00',
    secondaryDark: '#E65100',
    secondaryLight: '#FF8F00',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212121',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    border: '#E0E0E0',
    notification: '#FF5722',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    // Cores específicas para sustentabilidade
    eco: '#4CAF50',
    energy: '#FFC107',
    water: '#03A9F4',
    waste: '#9C27B0',
    carbon: '#795548',
    // Gradientes
    gradientPrimary: ['#2E7D32', '#4CAF50'],
    gradientSecondary: ['#FF6F00', '#FF8F00'],
    gradientEco: ['#4CAF50', '#8BC34A'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 50,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 24, fontWeight: 'bold' },
    h4: { fontSize: 20, fontWeight: 'bold' },
    h5: { fontSize: 18, fontWeight: '600' },
    h6: { fontSize: 16, fontWeight: '600' },
    body1: { fontSize: 16, fontWeight: 'normal' },
    body2: { fontSize: 14, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
    button: { fontSize: 16, fontWeight: '600' },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    border: '#333333',
    // Ajustes para modo escuro
    eco: '#66BB6A',
    energy: '#FFD54F',
    water: '#4FC3F7',
    waste: '#BA68C8',
    carbon: '#A1887F',
  },
};

// Temas personalizados
const natureTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#2E7D32',
    secondary: '#8BC34A',
    eco: '#4CAF50',
    energy: '#CDDC39',
    water: '#00BCD4',
    waste: '#795548',
  },
};

const oceanTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0277BD',
    secondary: '#00ACC1',
    eco: '#26A69A',
    energy: '#FFB74D',
    water: '#29B6F6',
    waste: '#78909C',
  },
};

const sunsetTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#FF5722',
    secondary: '#FF9800',
    eco: '#FF7043',
    energy: '#FFC107',
    water: '#03A9F4',
    waste: '#9C27B0',
  },
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
  nature: natureTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
};

type ThemeName = keyof typeof themes;
type Theme = typeof lightTheme;

interface ThemeState {
  currentTheme: ThemeName;
  theme: Theme;
  isDark: boolean;
  autoMode: boolean;
  customThemes: Record<string, Partial<Theme>>;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    colorBlindSupport: boolean;
  };
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_AUTO_MODE'; payload: boolean }
  | { type: 'ADD_CUSTOM_THEME'; payload: { name: string; theme: Partial<Theme> } }
  | { type: 'UPDATE_ACCESSIBILITY'; payload: Partial<ThemeState['accessibility']> }
  | { type: 'LOAD_SAVED_THEME'; payload: Partial<ThemeState> };

const initialState: ThemeState = {
  currentTheme: 'light',
  theme: lightTheme,
  isDark: false,
  autoMode: true,
  customThemes: {},
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    colorBlindSupport: false,
  },
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      const newTheme = themes[action.payload] || lightTheme;
      const isDark = action.payload === 'dark';
      return {
        ...state,
        currentTheme: action.payload,
        theme: newTheme,
        isDark,
      };
      
    case 'TOGGLE_DARK_MODE':
      const toggledTheme = state.isDark ? 'light' : 'dark';
      return {
        ...state,
        currentTheme: toggledTheme,
        theme: themes[toggledTheme],
        isDark: !state.isDark,
        autoMode: false,
      };
      
    case 'SET_AUTO_MODE':
      return {
        ...state,
        autoMode: action.payload,
      };
      
    case 'ADD_CUSTOM_THEME':
      return {
        ...state,
        customThemes: {
          ...state.customThemes,
          [action.payload.name]: action.payload.theme,
        },
      };
      
    case 'UPDATE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          ...action.payload,
        },
      };
      
    case 'LOAD_SAVED_THEME':
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
}

interface ThemeContextType {
  state: ThemeState;
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleDarkMode: () => void;
  setAutoMode: (enabled: boolean) => void;
  addCustomTheme: (name: string, theme: Partial<Theme>) => void;
  updateAccessibility: (settings: Partial<ThemeState['accessibility']>) => void;
  getAvailableThemes: () => ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@theme_settings';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  
  // Carrega configurações salvas
  useEffect(() => {
    loadSavedTheme();
  }, []);
  
  // Monitora mudanças do sistema
  useEffect(() => {
    if (state.autoMode) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const systemTheme = colorScheme === 'dark' ? 'dark' : 'light';
        dispatch({ type: 'SET_THEME', payload: systemTheme });
      });
      
      return () => subscription?.remove();
    }
  }, [state.autoMode]);
  
  // Salva configurações quando mudam
  useEffect(() => {
    saveTheme();
  }, [state.currentTheme, state.autoMode, state.accessibility]);
  
  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_SAVED_THEME', payload: parsedState });
      } else if (state.autoMode) {
        // Usa tema do sistema se não há configuração salva
        const systemColorScheme = Appearance.getColorScheme();
        const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        dispatch({ type: 'SET_THEME', payload: systemTheme });
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };
  
  const saveTheme = async () => {
    try {
      const toSave = {
        currentTheme: state.currentTheme,
        autoMode: state.autoMode,
        accessibility: state.accessibility,
        customThemes: state.customThemes,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };
  
  const setTheme = (theme: ThemeName) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };
  
  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };
  
  const setAutoMode = (enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_MODE', payload: enabled });
    
    if (enabled) {
      const systemColorScheme = Appearance.getColorScheme();
      const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      dispatch({ type: 'SET_THEME', payload: systemTheme });
    }
  };
  
  const addCustomTheme = (name: string, theme: Partial<Theme>) => {
    dispatch({ type: 'ADD_CUSTOM_THEME', payload: { name, theme } });
  };
  
  const updateAccessibility = (settings: Partial<ThemeState['accessibility']>) => {
    dispatch({ type: 'UPDATE_ACCESSIBILITY', payload: settings });
  };
  
  const getAvailableThemes = (): ThemeName[] => {
    return Object.keys(themes) as ThemeName[];
  };
  
  const value: ThemeContextType = {
    state,
    theme: state.theme,
    isDark: state.isDark,
    setTheme,
    toggleDarkMode,
    setAutoMode,
    addCustomTheme,
    updateAccessibility,
    getAvailableThemes,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { Theme, ThemeName, ThemeState };
export { themes };