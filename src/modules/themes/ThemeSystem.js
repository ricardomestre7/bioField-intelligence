/**
 * Sistema de Temas e Dark Mode
 * Implementa gerenciamento completo de temas, dark mode automático,
 * personalização de cores, acessibilidade e sincronização entre dispositivos
 */

class ThemeSystem {
    constructor() {
        this.themes = new Map();
        this.customThemes = new Map();
        this.currentTheme = 'light';
        this.settings = {
            autoDetectSystemTheme: true,
            followSystemSchedule: false,
            customSchedule: {
                enabled: false,
                darkStart: '18:00',
                lightStart: '06:00'
            },
            animations: true,
            highContrast: false,
            reducedMotion: false,
            fontSize: 'medium',
            colorBlindnessSupport: 'none'
        };
        this.observers = new Set();
        this.eventHandlers = new Map();
        this.cssVariables = new Map();
        this.init();
    }

    async init() {
        try {
            await this.loadDefaultThemes();
            await this.loadCustomThemes();
            await this.loadSettings();
            this.setupSystemListeners();
            this.setupScheduleChecker();
            this.applyInitialTheme();
            this.injectThemeCSS();
            console.log('ThemeSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing ThemeSystem:', error);
        }
    }

    async loadDefaultThemes() {
        const defaultThemes = [
            {
                id: 'light',
                name: 'Claro',
                description: 'Tema claro padrão com cores suaves',
                type: 'light',
                colors: {
                    // Cores primárias
                    primary: '#2E7D32',
                    primaryLight: '#4CAF50',
                    primaryDark: '#1B5E20',
                    secondary: '#00ACC1',
                    secondaryLight: '#26C6DA',
                    secondaryDark: '#00838F',
                    
                    // Cores de fundo
                    background: '#FFFFFF',
                    backgroundSecondary: '#F5F5F5',
                    backgroundTertiary: '#EEEEEE',
                    surface: '#FFFFFF',
                    surfaceVariant: '#F8F9FA',
                    
                    // Cores de texto
                    onBackground: '#212121',
                    onSurface: '#212121',
                    onPrimary: '#FFFFFF',
                    onSecondary: '#FFFFFF',
                    textPrimary: '#212121',
                    textSecondary: '#757575',
                    textDisabled: '#BDBDBD',
                    
                    // Cores de estado
                    success: '#4CAF50',
                    warning: '#FF9800',
                    error: '#F44336',
                    info: '#2196F3',
                    
                    // Cores de borda e divisão
                    border: '#E0E0E0',
                    divider: '#E0E0E0',
                    outline: '#757575',
                    
                    // Cores específicas da sustentabilidade
                    eco: '#4CAF50',
                    carbon: '#795548',
                    energy: '#FF9800',
                    water: '#2196F3',
                    waste: '#9C27B0'
                },
                shadows: {
                    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
                    focus: '0 0 0 3px rgba(46, 125, 50, 0.3)'
                },
                borderRadius: {
                    small: '4px',
                    medium: '8px',
                    large: '12px',
                    round: '50%'
                }
            },
            {
                id: 'dark',
                name: 'Escuro',
                description: 'Tema escuro moderno para reduzir fadiga ocular',
                type: 'dark',
                colors: {
                    // Cores primárias
                    primary: '#66BB6A',
                    primaryLight: '#81C784',
                    primaryDark: '#4CAF50',
                    secondary: '#4DD0E1',
                    secondaryLight: '#80DEEA',
                    secondaryDark: '#26C6DA',
                    
                    // Cores de fundo
                    background: '#121212',
                    backgroundSecondary: '#1E1E1E',
                    backgroundTertiary: '#2D2D2D',
                    surface: '#1E1E1E',
                    surfaceVariant: '#2D2D2D',
                    
                    // Cores de texto
                    onBackground: '#FFFFFF',
                    onSurface: '#FFFFFF',
                    onPrimary: '#000000',
                    onSecondary: '#000000',
                    textPrimary: '#FFFFFF',
                    textSecondary: '#B3B3B3',
                    textDisabled: '#666666',
                    
                    // Cores de estado
                    success: '#66BB6A',
                    warning: '#FFB74D',
                    error: '#EF5350',
                    info: '#64B5F6',
                    
                    // Cores de borda e divisão
                    border: '#404040',
                    divider: '#404040',
                    outline: '#B3B3B3',
                    
                    // Cores específicas da sustentabilidade
                    eco: '#66BB6A',
                    carbon: '#A1887F',
                    energy: '#FFB74D',
                    water: '#64B5F6',
                    waste: '#BA68C8'
                },
                shadows: {
                    small: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
                    medium: '0 3px 6px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.7)',
                    large: '0 10px 20px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.8)',
                    focus: '0 0 0 3px rgba(102, 187, 106, 0.4)'
                },
                borderRadius: {
                    small: '4px',
                    medium: '8px',
                    large: '12px',
                    round: '50%'
                }
            },
            {
                id: 'nature',
                name: 'Natureza',
                description: 'Tema inspirado na natureza com tons verdes',
                type: 'light',
                colors: {
                    primary: '#2E7D32',
                    primaryLight: '#66BB6A',
                    primaryDark: '#1B5E20',
                    secondary: '#8BC34A',
                    secondaryLight: '#AED581',
                    secondaryDark: '#689F38',
                    
                    background: '#F1F8E9',
                    backgroundSecondary: '#E8F5E8',
                    backgroundTertiary: '#DCEDC8',
                    surface: '#FFFFFF',
                    surfaceVariant: '#F1F8E9',
                    
                    onBackground: '#1B5E20',
                    onSurface: '#1B5E20',
                    onPrimary: '#FFFFFF',
                    onSecondary: '#FFFFFF',
                    textPrimary: '#1B5E20',
                    textSecondary: '#388E3C',
                    textDisabled: '#81C784',
                    
                    success: '#4CAF50',
                    warning: '#FF8F00',
                    error: '#D32F2F',
                    info: '#1976D2',
                    
                    border: '#C8E6C9',
                    divider: '#C8E6C9',
                    outline: '#388E3C',
                    
                    eco: '#4CAF50',
                    carbon: '#6D4C41',
                    energy: '#FF8F00',
                    water: '#0277BD',
                    waste: '#7B1FA2'
                },
                shadows: {
                    small: '0 1px 3px rgba(27,94,32,0.12), 0 1px 2px rgba(27,94,32,0.24)',
                    medium: '0 3px 6px rgba(27,94,32,0.16), 0 3px 6px rgba(27,94,32,0.23)',
                    large: '0 10px 20px rgba(27,94,32,0.19), 0 6px 6px rgba(27,94,32,0.23)',
                    focus: '0 0 0 3px rgba(46, 125, 50, 0.3)'
                },
                borderRadius: {
                    small: '6px',
                    medium: '12px',
                    large: '18px',
                    round: '50%'
                }
            },
            {
                id: 'ocean',
                name: 'Oceano',
                description: 'Tema azul inspirado no oceano',
                type: 'light',
                colors: {
                    primary: '#0277BD',
                    primaryLight: '#29B6F6',
                    primaryDark: '#01579B',
                    secondary: '#00ACC1',
                    secondaryLight: '#4DD0E1',
                    secondaryDark: '#00838F',
                    
                    background: '#E3F2FD',
                    backgroundSecondary: '#BBDEFB',
                    backgroundTertiary: '#90CAF9',
                    surface: '#FFFFFF',
                    surfaceVariant: '#E3F2FD',
                    
                    onBackground: '#01579B',
                    onSurface: '#01579B',
                    onPrimary: '#FFFFFF',
                    onSecondary: '#FFFFFF',
                    textPrimary: '#01579B',
                    textSecondary: '#0277BD',
                    textDisabled: '#64B5F6',
                    
                    success: '#00C853',
                    warning: '#FF8F00',
                    error: '#D32F2F',
                    info: '#1976D2',
                    
                    border: '#81D4FA',
                    divider: '#81D4FA',
                    outline: '#0277BD',
                    
                    eco: '#00C853',
                    carbon: '#5D4037',
                    energy: '#FF8F00',
                    water: '#0277BD',
                    waste: '#7B1FA2'
                },
                shadows: {
                    small: '0 1px 3px rgba(1,87,155,0.12), 0 1px 2px rgba(1,87,155,0.24)',
                    medium: '0 3px 6px rgba(1,87,155,0.16), 0 3px 6px rgba(1,87,155,0.23)',
                    large: '0 10px 20px rgba(1,87,155,0.19), 0 6px 6px rgba(1,87,155,0.23)',
                    focus: '0 0 0 3px rgba(2, 119, 189, 0.3)'
                },
                borderRadius: {
                    small: '4px',
                    medium: '8px',
                    large: '12px',
                    round: '50%'
                }
            },
            {
                id: 'sunset',
                name: 'Pôr do Sol',
                description: 'Tema quente com cores de pôr do sol',
                type: 'light',
                colors: {
                    primary: '#FF5722',
                    primaryLight: '#FF8A65',
                    primaryDark: '#D84315',
                    secondary: '#FF9800',
                    secondaryLight: '#FFB74D',
                    secondaryDark: '#F57C00',
                    
                    background: '#FFF3E0',
                    backgroundSecondary: '#FFE0B2',
                    backgroundTertiary: '#FFCC02',
                    surface: '#FFFFFF',
                    surfaceVariant: '#FFF3E0',
                    
                    onBackground: '#BF360C',
                    onSurface: '#BF360C',
                    onPrimary: '#FFFFFF',
                    onSecondary: '#FFFFFF',
                    textPrimary: '#BF360C',
                    textSecondary: '#D84315',
                    textDisabled: '#FF8A65',
                    
                    success: '#4CAF50',
                    warning: '#FF9800',
                    error: '#D32F2F',
                    info: '#1976D2',
                    
                    border: '#FFAB91',
                    divider: '#FFAB91',
                    outline: '#D84315',
                    
                    eco: '#4CAF50',
                    carbon: '#5D4037',
                    energy: '#FF9800',
                    water: '#1976D2',
                    waste: '#7B1FA2'
                },
                shadows: {
                    small: '0 1px 3px rgba(191,54,12,0.12), 0 1px 2px rgba(191,54,12,0.24)',
                    medium: '0 3px 6px rgba(191,54,12,0.16), 0 3px 6px rgba(191,54,12,0.23)',
                    large: '0 10px 20px rgba(191,54,12,0.19), 0 6px 6px rgba(191,54,12,0.23)',
                    focus: '0 0 0 3px rgba(255, 87, 34, 0.3)'
                },
                borderRadius: {
                    small: '4px',
                    medium: '8px',
                    large: '12px',
                    round: '50%'
                }
            },
            {
                id: 'high-contrast',
                name: 'Alto Contraste',
                description: 'Tema com alto contraste para acessibilidade',
                type: 'light',
                colors: {
                    primary: '#000000',
                    primaryLight: '#424242',
                    primaryDark: '#000000',
                    secondary: '#FFFFFF',
                    secondaryLight: '#F5F5F5',
                    secondaryDark: '#E0E0E0',
                    
                    background: '#FFFFFF',
                    backgroundSecondary: '#F5F5F5',
                    backgroundTertiary: '#E0E0E0',
                    surface: '#FFFFFF',
                    surfaceVariant: '#F5F5F5',
                    
                    onBackground: '#000000',
                    onSurface: '#000000',
                    onPrimary: '#FFFFFF',
                    onSecondary: '#000000',
                    textPrimary: '#000000',
                    textSecondary: '#424242',
                    textDisabled: '#757575',
                    
                    success: '#2E7D32',
                    warning: '#F57C00',
                    error: '#C62828',
                    info: '#1565C0',
                    
                    border: '#000000',
                    divider: '#000000',
                    outline: '#000000',
                    
                    eco: '#2E7D32',
                    carbon: '#3E2723',
                    energy: '#F57C00',
                    water: '#1565C0',
                    waste: '#4A148C'
                },
                shadows: {
                    small: '0 2px 4px rgba(0,0,0,0.8)',
                    medium: '0 4px 8px rgba(0,0,0,0.8)',
                    large: '0 8px 16px rgba(0,0,0,0.8)',
                    focus: '0 0 0 4px rgba(0, 0, 0, 0.8)'
                },
                borderRadius: {
                    small: '2px',
                    medium: '4px',
                    large: '6px',
                    round: '50%'
                }
            }
        ];
        
        defaultThemes.forEach(theme => {
            this.themes.set(theme.id, theme);
        });
    }

    async loadCustomThemes() {
        const savedThemes = localStorage.getItem('customThemes');
        if (savedThemes) {
            const themes = JSON.parse(savedThemes);
            themes.forEach(theme => {
                this.customThemes.set(theme.id, theme);
            });
        }
    }

    async loadSettings() {
        const savedSettings = localStorage.getItem('themeSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        const savedTheme = localStorage.getItem('currentTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
    }

    setupSystemListeners() {
        // Detecta mudanças no tema do sistema
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addListener((e) => {
                if (this.settings.autoDetectSystemTheme) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
            
            // Detecta preferência por movimento reduzido
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionQuery.addListener((e) => {
                this.updateSetting('reducedMotion', e.matches);
            });
            
            // Detecta preferência por alto contraste
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            highContrastQuery.addListener((e) => {
                if (e.matches && this.settings.highContrast) {
                    this.setTheme('high-contrast');
                }
            });
        }
    }

    setupScheduleChecker() {
        // Verifica horário a cada minuto para mudança automática
        setInterval(() => {
            if (this.settings.customSchedule.enabled) {
                this.checkScheduledThemeChange();
            }
        }, 60000);
    }

    checkScheduledThemeChange() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const { darkStart, lightStart } = this.settings.customSchedule;
        
        if (currentTime === darkStart) {
            this.setTheme('dark');
        } else if (currentTime === lightStart) {
            this.setTheme('light');
        }
    }

    applyInitialTheme() {
        if (this.settings.autoDetectSystemTheme && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        
        this.applyTheme(this.currentTheme);
    }

    injectThemeCSS() {
        const style = document.createElement('style');
        style.id = 'theme-system-styles';
        style.textContent = `
            :root {
                /* Transições suaves para mudanças de tema */
                --theme-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            * {
                transition: var(--theme-transition);
            }
            
            /* Desabilita transições se movimento reduzido for preferido */
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* Estilos para alto contraste */
            .high-contrast {
                filter: contrast(150%);
            }
            
            /* Estilos para tamanhos de fonte */
            .font-small { font-size: 0.875rem; }
            .font-medium { font-size: 1rem; }
            .font-large { font-size: 1.125rem; }
            .font-extra-large { font-size: 1.25rem; }
            
            /* Estilos para suporte a daltonismo */
            .colorblind-protanopia {
                filter: url(#protanopia-filter);
            }
            
            .colorblind-deuteranopia {
                filter: url(#deuteranopia-filter);
            }
            
            .colorblind-tritanopia {
                filter: url(#tritanopia-filter);
            }
            
            /* Indicador de tema ativo */
            .theme-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--surface);
                color: var(--on-surface);
                padding: 8px 16px;
                border-radius: var(--border-radius-medium);
                box-shadow: var(--shadow-medium);
                z-index: 1000;
                opacity: 0;
                transform: translateY(-20px);
                transition: var(--theme-transition);
            }
            
            .theme-indicator.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        
        document.head.appendChild(style);
        
        // Adiciona filtros SVG para suporte a daltonismo
        this.injectColorBlindnessFilters();
    }

    injectColorBlindnessFilters() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        
        svg.innerHTML = `
            <defs>
                <filter id="protanopia-filter">
                    <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
                </filter>
                <filter id="deuteranopia-filter">
                    <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
                </filter>
                <filter id="tritanopia-filter">
                    <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
                </filter>
            </defs>
        `;
        
        document.body.appendChild(svg);
    }

    // Métodos principais
    setTheme(themeId, options = {}) {
        const theme = this.themes.get(themeId) || this.customThemes.get(themeId);
        if (!theme) {
            console.warn(`Theme '${themeId}' not found`);
            return false;
        }
        
        const previousTheme = this.currentTheme;
        this.currentTheme = themeId;
        
        this.applyTheme(themeId, options);
        this.saveCurrentTheme();
        
        // Mostra indicador de mudança de tema
        if (!options.silent) {
            this.showThemeIndicator(theme.name);
        }
        
        // Notifica observadores
        this.notifyObservers('themeChanged', {
            previousTheme,
            currentTheme: themeId,
            theme
        });
        
        this.emit('themeChanged', { previousTheme, currentTheme: themeId, theme });
        
        return true;
    }

    applyTheme(themeId, options = {}) {
        const theme = this.themes.get(themeId) || this.customThemes.get(themeId);
        if (!theme) return;
        
        const root = document.documentElement;
        
        // Aplica cores
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.camelToKebab(key)}`, value);
            this.cssVariables.set(key, value);
        });
        
        // Aplica sombras
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
        });
        
        // Aplica border radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--border-radius-${key}`, value);
        });
        
        // Aplica classe do tipo de tema
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme.type}`);
        
        // Aplica configurações de acessibilidade
        this.applyAccessibilitySettings();
        
        // Atualiza meta theme-color para PWA
        this.updateMetaThemeColor(theme.colors.primary);
    }

    applyAccessibilitySettings() {
        const body = document.body;
        
        // Alto contraste
        body.classList.toggle('high-contrast', this.settings.highContrast);
        
        // Tamanho da fonte
        body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
        body.classList.add(`font-${this.settings.fontSize}`);
        
        // Suporte a daltonismo
        body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
        if (this.settings.colorBlindnessSupport !== 'none') {
            body.classList.add(`colorblind-${this.settings.colorBlindnessSupport}`);
        }
        
        // Movimento reduzido
        if (this.settings.reducedMotion) {
            document.documentElement.style.setProperty('--theme-transition', 'none');
        } else {
            document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
        }
    }

    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    showThemeIndicator(themeName) {
        let indicator = document.querySelector('.theme-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'theme-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `Tema: ${themeName}`;
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    // Métodos de tema personalizado
    createCustomTheme(themeData) {
        const customTheme = {
            id: themeData.id || this.generateThemeId(),
            name: themeData.name,
            description: themeData.description || '',
            type: themeData.type || 'light',
            colors: { ...this.getDefaultColors(themeData.type), ...themeData.colors },
            shadows: { ...this.getDefaultShadows(), ...themeData.shadows },
            borderRadius: { ...this.getDefaultBorderRadius(), ...themeData.borderRadius },
            custom: true,
            createdAt: Date.now()
        };
        
        this.customThemes.set(customTheme.id, customTheme);
        this.saveCustomThemes();
        
        this.emit('customThemeCreated', customTheme);
        
        return customTheme;
    }

    updateCustomTheme(themeId, updates) {
        const theme = this.customThemes.get(themeId);
        if (!theme || !theme.custom) {
            throw new Error('Custom theme not found or not editable');
        }
        
        const updatedTheme = {
            ...theme,
            ...updates,
            updatedAt: Date.now()
        };
        
        this.customThemes.set(themeId, updatedTheme);
        this.saveCustomThemes();
        
        // Se é o tema atual, reaplica
        if (this.currentTheme === themeId) {
            this.applyTheme(themeId);
        }
        
        this.emit('customThemeUpdated', updatedTheme);
        
        return updatedTheme;
    }

    deleteCustomTheme(themeId) {
        const theme = this.customThemes.get(themeId);
        if (!theme || !theme.custom) {
            throw new Error('Custom theme not found or not deletable');
        }
        
        // Se é o tema atual, muda para o padrão
        if (this.currentTheme === themeId) {
            this.setTheme('light');
        }
        
        this.customThemes.delete(themeId);
        this.saveCustomThemes();
        
        this.emit('customThemeDeleted', { themeId, theme });
        
        return true;
    }

    duplicateTheme(themeId, newName) {
        const originalTheme = this.themes.get(themeId) || this.customThemes.get(themeId);
        if (!originalTheme) {
            throw new Error('Theme not found');
        }
        
        const duplicatedTheme = {
            ...originalTheme,
            id: this.generateThemeId(),
            name: newName || `${originalTheme.name} (Cópia)`,
            custom: true,
            createdAt: Date.now()
        };
        
        delete duplicatedTheme.updatedAt;
        
        this.customThemes.set(duplicatedTheme.id, duplicatedTheme);
        this.saveCustomThemes();
        
        this.emit('themeDuplicated', { original: originalTheme, duplicate: duplicatedTheme });
        
        return duplicatedTheme;
    }

    // Métodos de configuração
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Aplica mudanças imediatamente se necessário
        switch (key) {
            case 'autoDetectSystemTheme':
                if (value && window.matchMedia) {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    this.setTheme(prefersDark ? 'dark' : 'light');
                }
                break;
            case 'highContrast':
            case 'reducedMotion':
            case 'fontSize':
            case 'colorBlindnessSupport':
                this.applyAccessibilitySettings();
                break;
        }
        
        this.emit('settingUpdated', { key, value });
    }

    updateSettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            this.updateSetting(key, value);
        });
    }

    // Métodos de exportação/importação
    exportTheme(themeId) {
        const theme = this.themes.get(themeId) || this.customThemes.get(themeId);
        if (!theme) {
            throw new Error('Theme not found');
        }
        
        const exportData = {
            ...theme,
            exportedAt: Date.now(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    importTheme(themeData) {
        let theme;
        
        if (typeof themeData === 'string') {
            theme = JSON.parse(themeData);
        } else {
            theme = themeData;
        }
        
        // Valida estrutura do tema
        if (!this.validateThemeStructure(theme)) {
            throw new Error('Invalid theme structure');
        }
        
        // Gera novo ID se já existir
        if (this.themes.has(theme.id) || this.customThemes.has(theme.id)) {
            theme.id = this.generateThemeId();
        }
        
        theme.custom = true;
        theme.importedAt = Date.now();
        
        this.customThemes.set(theme.id, theme);
        this.saveCustomThemes();
        
        this.emit('themeImported', theme);
        
        return theme;
    }

    validateThemeStructure(theme) {
        const requiredFields = ['id', 'name', 'type', 'colors'];
        const requiredColors = ['primary', 'background', 'onBackground', 'surface', 'onSurface'];
        
        // Verifica campos obrigatórios
        for (const field of requiredFields) {
            if (!theme[field]) {
                return false;
            }
        }
        
        // Verifica cores obrigatórias
        for (const color of requiredColors) {
            if (!theme.colors[color]) {
                return false;
            }
        }
        
        return true;
    }

    // Métodos de observação
    addObserver(observer) {
        this.observers.add(observer);
    }

    removeObserver(observer) {
        this.observers.delete(observer);
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (typeof observer[event] === 'function') {
                try {
                    observer[event](data);
                } catch (error) {
                    console.error('Error in theme observer:', error);
                }
            }
        });
    }

    // Métodos de renderização
    renderThemeSelector() {
        const allThemes = new Map([...this.themes, ...this.customThemes]);
        
        return `
            <div class="theme-selector">
                <h3>Seletor de Temas</h3>
                <div class="theme-grid">
                    ${Array.from(allThemes.values()).map(theme => `
                        <div class="theme-card ${this.currentTheme === theme.id ? 'active' : ''}" 
                             data-theme-id="${theme.id}">
                            <div class="theme-preview">
                                ${this.renderThemePreview(theme)}
                            </div>
                            <div class="theme-info">
                                <h4>${theme.name}</h4>
                                <p>${theme.description}</p>
                                ${theme.custom ? '<span class="custom-badge">Personalizado</span>' : ''}
                            </div>
                            <div class="theme-actions">
                                <button class="apply-theme-btn" data-theme-id="${theme.id}">
                                    ${this.currentTheme === theme.id ? 'Ativo' : 'Aplicar'}
                                </button>
                                ${theme.custom ? `
                                    <button class="edit-theme-btn" data-theme-id="${theme.id}">Editar</button>
                                    <button class="delete-theme-btn" data-theme-id="${theme.id}">Excluir</button>
                                ` : `
                                    <button class="duplicate-theme-btn" data-theme-id="${theme.id}">Duplicar</button>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="theme-actions-bar">
                    <button id="create-theme-btn" class="create-btn">Criar Tema Personalizado</button>
                    <button id="import-theme-btn" class="import-btn">Importar Tema</button>
                </div>
            </div>
        `;
    }

    renderThemePreview(theme) {
        return `
            <div class="theme-preview-container" style="
                background: ${theme.colors.background};
                color: ${theme.colors.onBackground};
                border: 1px solid ${theme.colors.border};
            ">
                <div class="preview-header" style="
                    background: ${theme.colors.primary};
                    color: ${theme.colors.onPrimary};
                    padding: 8px;
                    border-radius: ${theme.borderRadius?.small || '4px'} ${theme.borderRadius?.small || '4px'} 0 0;
                ">Header</div>
                <div class="preview-content" style="padding: 12px;">
                    <div class="preview-text" style="color: ${theme.colors.textPrimary};">Texto Principal</div>
                    <div class="preview-text-secondary" style="color: ${theme.colors.textSecondary}; font-size: 0.875rem;">Texto Secundário</div>
                    <div class="preview-button" style="
                        background: ${theme.colors.secondary};
                        color: ${theme.colors.onSecondary};
                        padding: 4px 8px;
                        border-radius: ${theme.borderRadius?.small || '4px'};
                        margin-top: 8px;
                        display: inline-block;
                        font-size: 0.75rem;
                    ">Botão</div>
                </div>
            </div>
        `;
    }

    renderThemeSettings() {
        return `
            <div class="theme-settings">
                <h3>Configurações de Tema</h3>
                
                <div class="settings-section">
                    <h4>Detecção Automática</h4>
                    <label class="setting-item">
                        <input type="checkbox" id="auto-detect-theme" 
                               ${this.settings.autoDetectSystemTheme ? 'checked' : ''}>
                        <span>Seguir tema do sistema</span>
                    </label>
                </div>
                
                <div class="settings-section">
                    <h4>Programação Personalizada</h4>
                    <label class="setting-item">
                        <input type="checkbox" id="custom-schedule" 
                               ${this.settings.customSchedule.enabled ? 'checked' : ''}>
                        <span>Ativar programação personalizada</span>
                    </label>
                    
                    <div class="schedule-inputs ${this.settings.customSchedule.enabled ? '' : 'disabled'}">
                        <label>
                            Tema escuro às:
                            <input type="time" id="dark-start-time" 
                                   value="${this.settings.customSchedule.darkStart}">
                        </label>
                        <label>
                            Tema claro às:
                            <input type="time" id="light-start-time" 
                                   value="${this.settings.customSchedule.lightStart}">
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Acessibilidade</h4>
                    
                    <label class="setting-item">
                        <input type="checkbox" id="high-contrast" 
                               ${this.settings.highContrast ? 'checked' : ''}>
                        <span>Alto contraste</span>
                    </label>
                    
                    <label class="setting-item">
                        <input type="checkbox" id="reduced-motion" 
                               ${this.settings.reducedMotion ? 'checked' : ''}>
                        <span>Reduzir animações</span>
                    </label>
                    
                    <label class="setting-item">
                        <span>Tamanho da fonte:</span>
                        <select id="font-size">
                            <option value="small" ${this.settings.fontSize === 'small' ? 'selected' : ''}>Pequena</option>
                            <option value="medium" ${this.settings.fontSize === 'medium' ? 'selected' : ''}>Média</option>
                            <option value="large" ${this.settings.fontSize === 'large' ? 'selected' : ''}>Grande</option>
                            <option value="extra-large" ${this.settings.fontSize === 'extra-large' ? 'selected' : ''}>Extra Grande</option>
                        </select>
                    </label>
                    
                    <label class="setting-item">
                        <span>Suporte a daltonismo:</span>
                        <select id="colorblindness-support">
                            <option value="none" ${this.settings.colorBlindnessSupport === 'none' ? 'selected' : ''}>Nenhum</option>
                            <option value="protanopia" ${this.settings.colorBlindnessSupport === 'protanopia' ? 'selected' : ''}>Protanopia</option>
                            <option value="deuteranopia" ${this.settings.colorBlindnessSupport === 'deuteranopia' ? 'selected' : ''}>Deuteranopia</option>
                            <option value="tritanopia" ${this.settings.colorBlindnessSupport === 'tritanopia' ? 'selected' : ''}>Tritanopia</option>
                        </select>
                    </label>
                </div>
                
                <div class="settings-section">
                    <h4>Animações</h4>
                    <label class="setting-item">
                        <input type="checkbox" id="animations" 
                               ${this.settings.animations ? 'checked' : ''}>
                        <span>Ativar animações de transição</span>
                    </label>
                </div>
            </div>
        `;
    }

    renderThemeCreator() {
        return `
            <div class="theme-creator">
                <h3>Criar Tema Personalizado</h3>
                
                <form id="theme-creator-form">
                    <div class="form-section">
                        <h4>Informações Básicas</h4>
                        <label>
                            Nome do tema:
                            <input type="text" id="theme-name" required>
                        </label>
                        <label>
                            Descrição:
                            <textarea id="theme-description" rows="3"></textarea>
                        </label>
                        <label>
                            Tipo base:
                            <select id="theme-type">
                                <option value="light">Claro</option>
                                <option value="dark">Escuro</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="form-section">
                        <h4>Cores Principais</h4>
                        <div class="color-inputs">
                            <label>
                                Cor primária:
                                <input type="color" id="primary-color" value="#2E7D32">
                            </label>
                            <label>
                                Cor secundária:
                                <input type="color" id="secondary-color" value="#00ACC1">
                            </label>
                            <label>
                                Cor de fundo:
                                <input type="color" id="background-color" value="#FFFFFF">
                            </label>
                            <label>
                                Cor da superfície:
                                <input type="color" id="surface-color" value="#FFFFFF">
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Cores de Texto</h4>
                        <div class="color-inputs">
                            <label>
                                Texto principal:
                                <input type="color" id="text-primary-color" value="#212121">
                            </label>
                            <label>
                                Texto secundário:
                                <input type="color" id="text-secondary-color" value="#757575">
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Pré-visualização</h4>
                        <div id="theme-preview" class="theme-preview-live">
                            <!-- Preview será atualizado dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="create-btn">Criar Tema</button>
                        <button type="button" id="cancel-create" class="cancel-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Métodos utilitários
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    generateThemeId() {
        return 'custom-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDefaultColors(type) {
        const baseTheme = this.themes.get(type === 'dark' ? 'dark' : 'light');
        return baseTheme ? { ...baseTheme.colors } : {};
    }

    getDefaultShadows() {
        const baseTheme = this.themes.get('light');
        return baseTheme ? { ...baseTheme.shadows } : {};
    }

    getDefaultBorderRadius() {
        const baseTheme = this.themes.get('light');
        return baseTheme ? { ...baseTheme.borderRadius } : {};
    }

    // Métodos de persistência
    saveCurrentTheme() {
        localStorage.setItem('currentTheme', this.currentTheme);
    }

    saveSettings() {
        localStorage.setItem('themeSettings', JSON.stringify(this.settings));
    }

    saveCustomThemes() {
        const themes = Array.from(this.customThemes.values());
        localStorage.setItem('customThemes', JSON.stringify(themes));
    }

    // Métodos de evento
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Error in theme event handler:', error);
                }
            });
        }
    }

    // Getters
    getCurrentTheme() {
        return this.themes.get(this.currentTheme) || this.customThemes.get(this.currentTheme);
    }

    getAllThemes() {
        return new Map([...this.themes, ...this.customThemes]);
    }

    getThemeById(themeId) {
        return this.themes.get(themeId) || this.customThemes.get(themeId);
    }

    getSettings() {
        return { ...this.settings };
    }

    getCSSVariable(variableName) {
        return this.cssVariables.get(variableName) || 
               getComputedStyle(document.documentElement).getPropertyValue(`--${this.camelToKebab(variableName)}`);
    }

    // Métodos de status
    getSystemStatus() {
        return {
            currentTheme: this.currentTheme,
            totalThemes: this.themes.size + this.customThemes.size,
            customThemes: this.customThemes.size,
            settings: this.settings,
            systemThemeSupport: !!window.matchMedia,
            prefersDarkMode: window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
        };
    }

    // Cleanup
    cleanup() {
        this.saveCurrentTheme();
        this.saveSettings();
        this.saveCustomThemes();
        this.observers.clear();
        this.eventHandlers.clear();
    }
}

// Instância global
window.themeSystem = new ThemeSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.themeSystem) {
        console.log('ThemeSystem loaded and ready');
    }
});

export default ThemeSystem;