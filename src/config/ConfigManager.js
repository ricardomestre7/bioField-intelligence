/**
 * Gerenciador de Configurações da Plataforma Regenerativa
 * @author RegenTech Solutions
 * @version 2.0.0
 */

export class ConfigManager {
    constructor() {
        this.config = this.loadDefaultConfig();
        this.loadEnvironmentConfig();
    }

    loadDefaultConfig() {
        return {
            platform: {
                name: 'BioField Intelligence',
                version: '2.0.0',
                environment: 'development',
                debug: true,
                language: 'pt-BR'
            },
            
            metrics: {
                updateInterval: 5000,
                maxDataPoints: 1000,
                enablePredictions: true,
                aiModelEndpoint: '/api/ai/predictions',
                categories: [
                    { id: 'carbon', name: 'Carbono', icon: '🌱', weight: 0.3 },
                    { id: 'energy', name: 'Energia', icon: '⚡', weight: 0.25 },
                    { id: 'water', name: 'Água', icon: '💧', weight: 0.2 },
                    { id: 'waste', name: 'Resíduos', icon: '♻️', weight: 0.15 },
                    { id: 'biodiversity', name: 'Biodiversidade', icon: '🦋', weight: 0.1 }
                ]
            },
            
            blockchain: {
                networkId: 'regen-network',
                blockTime: 30000,
                maxTransactionsPerBlock: 100,
                consensusAlgorithm: 'proof-of-sustainability',
                certificateTypes: [
                    'carbon-offset',
                    'renewable-energy',
                    'waste-reduction',
                    'biodiversity-protection',
                    'sustainable-agriculture'
                ]
            },
            
            digitalTwin: {
                simulationInterval: 10000,
                predictionHorizon: 90, // dias
                enableRealTimeSync: true,
                systems: {
                    energy: { enabled: true, priority: 'high' },
                    water: { enabled: true, priority: 'high' },
                    waste: { enabled: true, priority: 'medium' },
                    carbon: { enabled: true, priority: 'high' },
                    biodiversity: { enabled: true, priority: 'medium' }
                }
            },
            
            api: {
                baseUrl: 'https://api.regenplatform.com',
                version: 'v2',
                timeout: 30000,
                retryAttempts: 3,
                rateLimiting: {
                    enabled: true,
                    requestsPerMinute: 100
                },
                endpoints: {
                    metrics: '/metrics',
                    blockchain: '/blockchain',
                    iot: '/iot',
                    marketplace: '/marketplace',
                    ai: '/ai'
                }
            },
            
            iot: {
                networkProtocol: 'LoRaWAN',
                dataCollectionInterval: 60000,
                maxSensors: 1000,
                alertThresholds: {
                    battery: 20, // %
                    signal: 30, // %
                    temperature: { min: -10, max: 50 }, // °C
                    humidity: { min: 20, max: 80 }, // %
                    airQuality: { max: 150 } // AQI
                },
                sensorTypes: [
                    'temperature',
                    'humidity',
                    'air-quality',
                    'water-quality',
                    'soil-moisture',
                    'light-intensity',
                    'noise-level',
                    'motion-detection'
                ]
            },
            
            marketplace: {
                currency: 'EUR',
                taxRate: 0.21, // 21% IVA
                shippingCost: 15.00,
                freeShippingThreshold: 100.00,
                categories: [
                    { id: 'energia', name: 'Energia Renovável', icon: '⚡' },
                    { id: 'agua', name: 'Gestão de Água', icon: '💧' },
                    { id: 'residuos', name: 'Gestão de Resíduos', icon: '♻️' },
                    { id: 'agricultura', name: 'Agricultura Sustentável', icon: '🌱' },
                    { id: 'construcao', name: 'Construção Verde', icon: '🏠' },
                    { id: 'mobilidade', name: 'Mobilidade Sustentável', icon: '🚲' }
                ],
                paymentMethods: [
                    'credit-card',
                    'bank-transfer',
                    'crypto',
                    'green-tokens'
                ]
            },
            
            ui: {
                theme: 'light',
                animations: true,
                notifications: true,
                autoSave: true,
                refreshInterval: 30000,
                chartColors: {
                    primary: '#2E8B57',
                    secondary: '#32CD32',
                    accent: '#FFD700',
                    warning: '#FF6B35',
                    error: '#DC143C',
                    success: '#228B22'
                }
            },
            
            logging: {
                level: 'info', // debug, info, warn, error
                enableConsole: true,
                enableRemote: false,
                remoteEndpoint: '/api/logs',
                maxLogSize: 1000 // número máximo de logs em memória
            },
            
            security: {
                enableCSRF: true,
                sessionTimeout: 3600000, // 1 hora em ms
                maxLoginAttempts: 5,
                passwordMinLength: 8,
                enableTwoFactor: false
            },
            
            performance: {
                enableCaching: true,
                cacheTimeout: 300000, // 5 minutos
                enableCompression: true,
                maxConcurrentRequests: 10,
                enableServiceWorker: true
            }
        };
    }

    loadEnvironmentConfig() {
        // Carregar configurações específicas do ambiente
        const env = this.getEnvironment();
        
        if (env === 'production') {
            this.config.platform.debug = false;
            this.config.logging.level = 'warn';
            this.config.logging.enableConsole = false;
            this.config.logging.enableRemote = true;
        } else if (env === 'development') {
            this.config.platform.debug = true;
            this.config.logging.level = 'debug';
            this.config.api.baseUrl = 'http://localhost:3000';
        }
        
        // Carregar configurações do localStorage se disponíveis
        this.loadUserPreferences();
    }

    getEnvironment() {
        return process?.env?.NODE_ENV || 
               window?.location?.hostname === 'localhost' ? 'development' : 'production';
    }

    loadUserPreferences() {
        try {
            const userPrefs = localStorage.getItem('regenPlatform.preferences');
            if (userPrefs) {
                const preferences = JSON.parse(userPrefs);
                this.merge(this.config, preferences);
            }
        } catch (error) {
            console.warn('Erro ao carregar preferências do usuário:', error);
        }
    }

    saveUserPreferences() {
        try {
            const preferences = {
                ui: this.config.ui,
                platform: {
                    language: this.config.platform.language
                }
            };
            localStorage.setItem('regenPlatform.preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Erro ao salvar preferências do usuário:', error);
        }
    }

    get(path) {
        return this.getNestedValue(this.config, path);
    }

    set(path, value) {
        this.setNestedValue(this.config, path, value);
        this.saveUserPreferences();
    }

    getNestedValue(obj, path) {
        if (typeof path === 'string') {
            path = path.split('.');
        }
        
        return path.reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        if (typeof path === 'string') {
            path = path.split('.');
        }
        
        const lastKey = path.pop();
        const target = path.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    merge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.merge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    validate() {
        const requiredPaths = [
            'platform.name',
            'platform.version',
            'api.baseUrl',
            'metrics.updateInterval',
            'blockchain.networkId'
        ];
        
        const missing = requiredPaths.filter(path => this.get(path) === undefined);
        
        if (missing.length > 0) {
            throw new Error(`Configurações obrigatórias ausentes: ${missing.join(', ')}`);
        }
        
        return true;
    }

    reset() {
        this.config = this.loadDefaultConfig();
        localStorage.removeItem('regenPlatform.preferences');
    }

    export() {
        return JSON.stringify(this.config, null, 2);
    }

    import(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            this.merge(this.config, importedConfig);
            this.saveUserPreferences();
            return true;
        } catch (error) {
            console.error('Erro ao importar configuração:', error);
            return false;
        }
    }
}

// Instância singleton
let configInstance = null;

export function getConfig() {
    if (!configInstance) {
        configInstance = new ConfigManager();
    }
    return configInstance;
}

export default ConfigManager;