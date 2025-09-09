/**
 * Sistema de Inteligência Artificial Avançado
 * Implementa ML, análise preditiva, processamento de linguagem natural e assistente IA
 * @author RegenTech Solutions
 * @version 3.0.0
 */

import { Logger } from '../../utils/Logger.js';
import { ConfigManager } from '../../config/ConfigManager.js';

export class AISystem {
    constructor(config = {}) {
        this.config = {
            enablePredictiveAnalytics: config.enablePredictiveAnalytics !== false,
            enableNLP: config.enableNLP !== false,
            enableComputerVision: config.enableComputerVision !== false,
            enableRecommendations: config.enableRecommendations !== false,
            enableAnomalyDetection: config.enableAnomalyDetection !== false,
            modelUpdateInterval: config.modelUpdateInterval || 3600000, // 1 hora
            confidenceThreshold: config.confidenceThreshold || 0.8,
            maxPredictionHorizon: config.maxPredictionHorizon || 30, // dias
            ...config
        };
        
        this.logger = new Logger('AISystem');
        this.configManager = new ConfigManager();
        this.isInitialized = false;
        
        // Modelos de ML
        this.models = new Map();
        this.modelMetrics = new Map();
        this.trainingData = new Map();
        
        // Cache de predições
        this.predictionCache = new Map();
        this.lastModelUpdate = new Map();
        
        // Assistente IA
        this.chatHistory = [];
        this.userContext = new Map();
        this.conversationState = 'idle';
        
        // Análise de dados
        this.dataPatterns = new Map();
        this.anomalies = [];
        this.insights = [];
        
        this.initializeSystem();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema de IA...');
            
            // Carregar configurações
            await this.loadConfiguration();
            
            // Inicializar modelos de ML
            await this.initializeMLModels();
            
            // Configurar processamento de linguagem natural
            if (this.config.enableNLP) {
                await this.setupNLP();
            }
            
            // Configurar visão computacional
            if (this.config.enableComputerVision) {
                await this.setupComputerVision();
            }
            
            // Inicializar sistema de recomendações
            if (this.config.enableRecommendations) {
                await this.setupRecommendationEngine();
            }
            
            // Configurar detecção de anomalias
            if (this.config.enableAnomalyDetection) {
                await this.setupAnomalyDetection();
            }
            
            // Iniciar análise preditiva
            if (this.config.enablePredictiveAnalytics) {
                await this.startPredictiveAnalytics();
            }
            
            this.isInitialized = true;
            this.logger.success('Sistema de IA inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema de IA:', error);
            throw error;
        }
    }

    initializeSystem() {
        // Tipos de modelos disponíveis
        this.modelTypes = {
            timeSeries: {
                name: 'Séries Temporais',
                description: 'Previsão de métricas ao longo do tempo',
                algorithms: ['ARIMA', 'LSTM', 'Prophet', 'Exponential Smoothing']
            },
            classification: {
                name: 'Classificação',
                description: 'Categorização de dados e padrões',
                algorithms: ['Random Forest', 'SVM', 'Neural Network', 'Gradient Boosting']
            },
            regression: {
                name: 'Regressão',
                description: 'Predição de valores contínuos',
                algorithms: ['Linear Regression', 'Polynomial', 'Ridge', 'Lasso']
            },
            clustering: {
                name: 'Agrupamento',
                description: 'Identificação de padrões e grupos',
                algorithms: ['K-Means', 'DBSCAN', 'Hierarchical', 'Gaussian Mixture']
            },
            anomalyDetection: {
                name: 'Detecção de Anomalias',
                description: 'Identificação de comportamentos anômalos',
                algorithms: ['Isolation Forest', 'One-Class SVM', 'Autoencoder', 'Statistical']
            },
            nlp: {
                name: 'Processamento de Linguagem Natural',
                description: 'Análise e compreensão de texto',
                algorithms: ['Transformer', 'BERT', 'GPT', 'Word2Vec']
            }
        };
        
        // Métricas de sustentabilidade para análise
        this.sustainabilityMetrics = {
            energy: {
                name: 'Energia',
                unit: 'kWh',
                target: 'minimize',
                importance: 0.25
            },
            water: {
                name: 'Água',
                unit: 'L',
                target: 'minimize',
                importance: 0.20
            },
            carbon: {
                name: 'Carbono',
                unit: 'kg CO2',
                target: 'minimize',
                importance: 0.30
            },
            waste: {
                name: 'Resíduos',
                unit: 'kg',
                target: 'minimize',
                importance: 0.15
            },
            biodiversity: {
                name: 'Biodiversidade',
                unit: 'índice',
                target: 'maximize',
                importance: 0.10
            }
        };
        
        // Templates de conversação para o assistente
        this.conversationTemplates = {
            greeting: [
                'Olá! Sou o assistente IA da RegenTech. Como posso ajudar você hoje?',
                'Oi! Estou aqui para ajudar com análises de sustentabilidade. O que você gostaria de saber?',
                'Bem-vindo! Posso ajudar com insights sobre suas métricas regenerativas.'
            ],
            dataAnalysis: [
                'Analisando seus dados de sustentabilidade...',
                'Processando métricas ambientais...',
                'Gerando insights baseados em IA...'
            ],
            predictions: [
                'Com base nos padrões atuais, prevejo que...',
                'As tendências indicam que...',
                'Minha análise preditiva sugere que...'
            ],
            recommendations: [
                'Recomendo as seguintes ações:',
                'Para otimizar seus resultados, sugiro:',
                'Baseado na análise, você deveria considerar:'
            ]
        };
    }

    async loadConfiguration() {
        try {
            const aiConfig = await this.configManager.get('ai', {
                models: {},
                training: {},
                predictions: {},
                chat: {}
            });
            
            this.config = { ...this.config, ...aiConfig };
            this.logger.debug('Configurações de IA carregadas');
            
        } catch (error) {
            this.logger.error('Erro ao carregar configurações de IA:', error);
        }
    }

    async initializeMLModels() {
        try {
            this.logger.info('Inicializando modelos de ML...');
            
            // Modelo de previsão de energia
            await this.createModel('energy_prediction', {
                type: 'timeSeries',
                algorithm: 'LSTM',
                features: ['temperature', 'humidity', 'solar_radiation', 'historical_usage'],
                target: 'energy_consumption',
                horizon: 7 // dias
            });
            
            // Modelo de otimização de água
            await this.createModel('water_optimization', {
                type: 'regression',
                algorithm: 'Random Forest',
                features: ['weather', 'soil_moisture', 'crop_type', 'irrigation_history'],
                target: 'optimal_water_usage'
            });
            
            // Modelo de detecção de anomalias
            await this.createModel('anomaly_detection', {
                type: 'anomalyDetection',
                algorithm: 'Isolation Forest',
                features: ['all_sensors'],
                sensitivity: 0.1
            });
            
            // Modelo de classificação de sustentabilidade
            await this.createModel('sustainability_classifier', {
                type: 'classification',
                algorithm: 'Gradient Boosting',
                features: ['energy_efficiency', 'water_usage', 'carbon_footprint', 'waste_reduction'],
                target: 'sustainability_level',
                classes: ['bronze', 'silver', 'gold', 'platinum', 'regenerative']
            });
            
            // Modelo de recomendações
            await this.createModel('recommendation_engine', {
                type: 'clustering',
                algorithm: 'K-Means',
                features: ['user_behavior', 'preferences', 'sustainability_goals'],
                clusters: 5
            });
            
            this.logger.success(`${this.models.size} modelos de ML inicializados`);
            
        } catch (error) {
            this.logger.error('Erro ao inicializar modelos de ML:', error);
        }
    }

    async createModel(modelId, config) {
        try {
            const model = {
                id: modelId,
                ...config,
                status: 'initialized',
                accuracy: 0,
                lastTrained: null,
                lastPrediction: null,
                trainingData: [],
                predictions: [],
                metrics: {
                    accuracy: 0,
                    precision: 0,
                    recall: 0,
                    f1Score: 0,
                    mse: 0,
                    mae: 0
                },
                createdAt: Date.now()
            };
            
            this.models.set(modelId, model);
            this.logger.debug(`Modelo criado: ${modelId}`);
            
            return model;
            
        } catch (error) {
            this.logger.error(`Erro ao criar modelo ${modelId}:`, error);
            throw error;
        }
    }

    async setupNLP() {
        try {
            this.logger.info('Configurando processamento de linguagem natural...');
            
            this.nlpEngine = {
                tokenizer: this.createTokenizer(),
                sentimentAnalyzer: this.createSentimentAnalyzer(),
                intentClassifier: this.createIntentClassifier(),
                entityExtractor: this.createEntityExtractor(),
                responseGenerator: this.createResponseGenerator()
            };
            
            // Treinar com dados de exemplo
            await this.trainNLPModels();
            
            this.logger.success('NLP configurado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao configurar NLP:', error);
        }
    }

    createTokenizer() {
        return {
            tokenize: (text) => {
                return text.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
                    .filter(token => token.length > 0);
            },
            
            removeStopWords: (tokens) => {
                const stopWords = new Set([
                    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
                    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem',
                    'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde'
                ]);
                
                return tokens.filter(token => !stopWords.has(token));
            }
        };
    }

    createSentimentAnalyzer() {
        const positiveWords = new Set([
            'bom', 'ótimo', 'excelente', 'maravilhoso', 'perfeito', 'incrível',
            'sustentável', 'eficiente', 'renovável', 'limpo', 'verde', 'ecológico'
        ]);
        
        const negativeWords = new Set([
            'ruim', 'péssimo', 'terrível', 'horrível', 'problemático',
            'poluente', 'tóxico', 'desperdício', 'ineficiente', 'prejudicial'
        ]);
        
        return {
            analyze: (tokens) => {
                let positiveScore = 0;
                let negativeScore = 0;
                
                tokens.forEach(token => {
                    if (positiveWords.has(token)) positiveScore++;
                    if (negativeWords.has(token)) negativeScore++;
                });
                
                const total = positiveScore + negativeScore;
                if (total === 0) return { sentiment: 'neutral', confidence: 0.5 };
                
                const sentiment = positiveScore > negativeScore ? 'positive' : 'negative';
                const confidence = Math.max(positiveScore, negativeScore) / total;
                
                return { sentiment, confidence };
            }
        };
    }

    createIntentClassifier() {
        const intents = {
            'data_query': {
                patterns: ['dados', 'métricas', 'estatísticas', 'números', 'relatório'],
                response: 'data_analysis'
            },
            'prediction_request': {
                patterns: ['previsão', 'futuro', 'tendência', 'projeção', 'estimativa'],
                response: 'prediction'
            },
            'recommendation_request': {
                patterns: ['recomendação', 'sugestão', 'conselho', 'dica', 'otimização'],
                response: 'recommendation'
            },
            'help_request': {
                patterns: ['ajuda', 'como', 'tutorial', 'explicação', 'dúvida'],
                response: 'help'
            },
            'greeting': {
                patterns: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
                response: 'greeting'
            }
        };
        
        return {
            classify: (tokens) => {
                let bestMatch = { intent: 'unknown', confidence: 0 };
                
                Object.entries(intents).forEach(([intent, config]) => {
                    const matches = config.patterns.filter(pattern => 
                        tokens.some(token => token.includes(pattern) || pattern.includes(token))
                    );
                    
                    const confidence = matches.length / config.patterns.length;
                    
                    if (confidence > bestMatch.confidence) {
                        bestMatch = { intent, confidence, response: config.response };
                    }
                });
                
                return bestMatch;
            }
        };
    }

    createEntityExtractor() {
        return {
            extract: (tokens) => {
                const entities = {
                    metrics: [],
                    timeframes: [],
                    locations: [],
                    numbers: []
                };
                
                const metricKeywords = {
                    'energia': 'energy',
                    'água': 'water',
                    'carbono': 'carbon',
                    'resíduo': 'waste',
                    'biodiversidade': 'biodiversity'
                };
                
                const timeKeywords = {
                    'hoje': 'today',
                    'ontem': 'yesterday',
                    'semana': 'week',
                    'mês': 'month',
                    'ano': 'year'
                };
                
                tokens.forEach(token => {
                    // Extrair métricas
                    Object.entries(metricKeywords).forEach(([keyword, metric]) => {
                        if (token.includes(keyword)) {
                            entities.metrics.push(metric);
                        }
                    });
                    
                    // Extrair períodos de tempo
                    Object.entries(timeKeywords).forEach(([keyword, timeframe]) => {
                        if (token.includes(keyword)) {
                            entities.timeframes.push(timeframe);
                        }
                    });
                    
                    // Extrair números
                    if (/\d+/.test(token)) {
                        entities.numbers.push(parseFloat(token.match(/\d+(\.\d+)?/)[0]));
                    }
                });
                
                return entities;
            }
        };
    }

    createResponseGenerator() {
        return {
            generate: (intent, entities, context = {}) => {
                switch (intent.response) {
                    case 'greeting':
                        return this.getRandomTemplate('greeting');
                    
                    case 'data_analysis':
                        return this.generateDataResponse(entities, context);
                    
                    case 'prediction':
                        return this.generatePredictionResponse(entities, context);
                    
                    case 'recommendation':
                        return this.generateRecommendationResponse(entities, context);
                    
                    case 'help':
                        return this.generateHelpResponse(entities, context);
                    
                    default:
                        return 'Desculpe, não entendi sua pergunta. Pode reformular?';
                }
            }
        };
    }

    async trainNLPModels() {
        // Simular treinamento com dados de exemplo
        const trainingData = [
            { text: 'Como está o consumo de energia hoje?', intent: 'data_query', entities: ['energy', 'today'] },
            { text: 'Qual será a previsão de água para próxima semana?', intent: 'prediction_request', entities: ['water', 'week'] },
            { text: 'Me dê sugestões para reduzir carbono', intent: 'recommendation_request', entities: ['carbon'] },
            { text: 'Olá, preciso de ajuda', intent: 'greeting', entities: [] }
        ];
        
        this.logger.debug(`Treinamento NLP concluído com ${trainingData.length} exemplos`);
    }

    async setupComputerVision() {
        try {
            this.logger.info('Configurando visão computacional...');
            
            this.visionEngine = {
                imageClassifier: this.createImageClassifier(),
                objectDetector: this.createObjectDetector(),
                anomalyDetector: this.createVisualAnomalyDetector()
            };
            
            this.logger.success('Visão computacional configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar visão computacional:', error);
        }
    }

    createImageClassifier() {
        return {
            classify: async (imageData) => {
                // Simular classificação de imagem
                const categories = [
                    { name: 'Painel Solar', confidence: 0.95, sustainability: 'high' },
                    { name: 'Vegetação', confidence: 0.88, sustainability: 'high' },
                    { name: 'Resíduo', confidence: 0.76, sustainability: 'low' },
                    { name: 'Água Limpa', confidence: 0.92, sustainability: 'high' }
                ];
                
                return categories[Math.floor(Math.random() * categories.length)];
            }
        };
    }

    createObjectDetector() {
        return {
            detect: async (imageData) => {
                // Simular detecção de objetos
                return [
                    { object: 'solar_panel', confidence: 0.94, bbox: [100, 100, 200, 150] },
                    { object: 'tree', confidence: 0.87, bbox: [300, 50, 400, 200] },
                    { object: 'sensor', confidence: 0.91, bbox: [150, 250, 180, 280] }
                ];
            }
        };
    }

    createVisualAnomalyDetector() {
        return {
            detectAnomalies: async (imageData) => {
                // Simular detecção de anomalias visuais
                const anomalies = [
                    { type: 'equipment_damage', severity: 'medium', location: [120, 130] },
                    { type: 'unusual_growth', severity: 'low', location: [350, 180] }
                ];
                
                return Math.random() > 0.7 ? anomalies : [];
            }
        };
    }

    async setupRecommendationEngine() {
        try {
            this.logger.info('Configurando engine de recomendações...');
            
            this.recommendationEngine = {
                userBased: this.createUserBasedRecommender(),
                itemBased: this.createItemBasedRecommender(),
                contentBased: this.createContentBasedRecommender(),
                hybrid: this.createHybridRecommender()
            };
            
            this.logger.success('Engine de recomendações configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar engine de recomendações:', error);
        }
    }

    createUserBasedRecommender() {
        return {
            recommend: (userId, preferences = {}) => {
                // Simular recomendações baseadas em usuário
                const recommendations = [
                    {
                        type: 'action',
                        title: 'Instalar Painéis Solares',
                        description: 'Reduza 40% do consumo de energia',
                        impact: 'high',
                        confidence: 0.89
                    },
                    {
                        type: 'optimization',
                        title: 'Otimizar Irrigação',
                        description: 'Economize 25% de água com sensores inteligentes',
                        impact: 'medium',
                        confidence: 0.76
                    },
                    {
                        type: 'behavior',
                        title: 'Compostagem Doméstica',
                        description: 'Reduza resíduos orgânicos em 60%',
                        impact: 'medium',
                        confidence: 0.82
                    }
                ];
                
                return recommendations.sort((a, b) => b.confidence - a.confidence);
            }
        };
    }

    createItemBasedRecommender() {
        return {
            recommend: (itemId, context = {}) => {
                // Simular recomendações baseadas em item
                return [
                    { item: 'smart_sensor', similarity: 0.94 },
                    { item: 'solar_battery', similarity: 0.87 },
                    { item: 'water_filter', similarity: 0.79 }
                ];
            }
        };
    }

    createContentBasedRecommender() {
        return {
            recommend: (userProfile, contentFeatures = {}) => {
                // Simular recomendações baseadas em conteúdo
                return [
                    { content: 'sustainability_course', relevance: 0.91 },
                    { content: 'green_technology_guide', relevance: 0.85 },
                    { content: 'carbon_offset_program', relevance: 0.78 }
                ];
            }
        };
    }

    createHybridRecommender() {
        return {
            recommend: (userId, context = {}) => {
                // Combinar diferentes tipos de recomendações
                const userRecs = this.recommendationEngine.userBased.recommend(userId);
                const itemRecs = this.recommendationEngine.itemBased.recommend(context.currentItem);
                const contentRecs = this.recommendationEngine.contentBased.recommend(context.userProfile);
                
                // Combinar e ponderar recomendações
                return this.combineRecommendations(userRecs, itemRecs, contentRecs);
            }
        };
    }

    combineRecommendations(userRecs, itemRecs, contentRecs) {
        // Algoritmo simples de combinação
        const combined = [];
        
        userRecs.forEach(rec => {
            combined.push({ ...rec, source: 'user', weight: 0.4 });
        });
        
        itemRecs.forEach(rec => {
            combined.push({ ...rec, source: 'item', weight: 0.3 });
        });
        
        contentRecs.forEach(rec => {
            combined.push({ ...rec, source: 'content', weight: 0.3 });
        });
        
        return combined.sort((a, b) => (b.confidence || b.similarity || b.relevance) * b.weight - 
                                      (a.confidence || a.similarity || a.relevance) * a.weight);
    }

    async setupAnomalyDetection() {
        try {
            this.logger.info('Configurando detecção de anomalias...');
            
            this.anomalyDetector = {
                statistical: this.createStatisticalDetector(),
                ml: this.createMLAnomalyDetector(),
                threshold: this.createThresholdDetector(),
                pattern: this.createPatternDetector()
            };
            
            this.logger.success('Detecção de anomalias configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar detecção de anomalias:', error);
        }
    }

    createStatisticalDetector() {
        return {
            detect: (data, metric) => {
                if (data.length < 10) return [];
                
                const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
                const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
                const stdDev = Math.sqrt(variance);
                
                const anomalies = [];
                const threshold = 2; // 2 desvios padrão
                
                data.forEach((value, index) => {
                    const zScore = Math.abs((value - mean) / stdDev);
                    if (zScore > threshold) {
                        anomalies.push({
                            index,
                            value,
                            zScore,
                            severity: zScore > 3 ? 'high' : 'medium',
                            type: 'statistical',
                            metric
                        });
                    }
                });
                
                return anomalies;
            }
        };
    }

    createMLAnomalyDetector() {
        return {
            detect: async (data, features) => {
                // Simular detecção ML (Isolation Forest)
                const anomalies = [];
                
                data.forEach((point, index) => {
                    const anomalyScore = Math.random();
                    if (anomalyScore > 0.9) {
                        anomalies.push({
                            index,
                            point,
                            score: anomalyScore,
                            severity: anomalyScore > 0.95 ? 'high' : 'medium',
                            type: 'ml',
                            features
                        });
                    }
                });
                
                return anomalies;
            }
        };
    }

    createThresholdDetector() {
        return {
            detect: (data, thresholds) => {
                const anomalies = [];
                
                data.forEach((value, index) => {
                    Object.entries(thresholds).forEach(([metric, threshold]) => {
                        if (value[metric] > threshold.max || value[metric] < threshold.min) {
                            anomalies.push({
                                index,
                                value: value[metric],
                                threshold,
                                severity: 'medium',
                                type: 'threshold',
                                metric
                            });
                        }
                    });
                });
                
                return anomalies;
            }
        };
    }

    createPatternDetector() {
        return {
            detect: (data, patterns) => {
                // Detectar padrões anômalos em sequências
                const anomalies = [];
                
                // Simular detecção de padrões
                for (let i = 0; i < data.length - 5; i++) {
                    const sequence = data.slice(i, i + 5);
                    const isAnomalous = this.isAnomalousPattern(sequence);
                    
                    if (isAnomalous) {
                        anomalies.push({
                            startIndex: i,
                            endIndex: i + 4,
                            sequence,
                            severity: 'medium',
                            type: 'pattern'
                        });
                    }
                }
                
                return anomalies;
            }
        };
    }

    isAnomalousPattern(sequence) {
        // Lógica simples para detectar padrões anômalos
        const trend = sequence[sequence.length - 1] - sequence[0];
        const avgChange = trend / (sequence.length - 1);
        
        // Detectar mudanças bruscas
        for (let i = 1; i < sequence.length; i++) {
            const change = sequence[i] - sequence[i - 1];
            if (Math.abs(change) > Math.abs(avgChange) * 3) {
                return true;
            }
        }
        
        return false;
    }

    async startPredictiveAnalytics() {
        try {
            this.logger.info('Iniciando análise preditiva...');
            
            // Configurar intervalos de predição
            this.predictionIntervals = {
                shortTerm: setInterval(() => this.generateShortTermPredictions(), 300000), // 5 min
                mediumTerm: setInterval(() => this.generateMediumTermPredictions(), 1800000), // 30 min
                longTerm: setInterval(() => this.generateLongTermPredictions(), 3600000) // 1 hora
            };
            
            // Gerar predições iniciais
            await this.generateAllPredictions();
            
            this.logger.success('Análise preditiva iniciada');
            
        } catch (error) {
            this.logger.error('Erro ao iniciar análise preditiva:', error);
        }
    }

    async generateAllPredictions() {
        await Promise.all([
            this.generateShortTermPredictions(),
            this.generateMediumTermPredictions(),
            this.generateLongTermPredictions()
        ]);
    }

    async generateShortTermPredictions() {
        try {
            const predictions = {};
            
            // Predições para as próximas 24 horas
            Object.keys(this.sustainabilityMetrics).forEach(metric => {
                predictions[metric] = this.generateTimeSeries(metric, 24, 'hours');
            });
            
            this.predictionCache.set('shortTerm', {
                predictions,
                generatedAt: Date.now(),
                horizon: '24h',
                confidence: 0.85
            });
            
            this.logger.debug('Predições de curto prazo geradas');
            
        } catch (error) {
            this.logger.error('Erro ao gerar predições de curto prazo:', error);
        }
    }

    async generateMediumTermPredictions() {
        try {
            const predictions = {};
            
            // Predições para os próximos 7 dias
            Object.keys(this.sustainabilityMetrics).forEach(metric => {
                predictions[metric] = this.generateTimeSeries(metric, 7, 'days');
            });
            
            this.predictionCache.set('mediumTerm', {
                predictions,
                generatedAt: Date.now(),
                horizon: '7d',
                confidence: 0.75
            });
            
            this.logger.debug('Predições de médio prazo geradas');
            
        } catch (error) {
            this.logger.error('Erro ao gerar predições de médio prazo:', error);
        }
    }

    async generateLongTermPredictions() {
        try {
            const predictions = {};
            
            // Predições para os próximos 30 dias
            Object.keys(this.sustainabilityMetrics).forEach(metric => {
                predictions[metric] = this.generateTimeSeries(metric, 30, 'days');
            });
            
            this.predictionCache.set('longTerm', {
                predictions,
                generatedAt: Date.now(),
                horizon: '30d',
                confidence: 0.65
            });
            
            this.logger.debug('Predições de longo prazo geradas');
            
        } catch (error) {
            this.logger.error('Erro ao gerar predições de longo prazo:', error);
        }
    }

    generateTimeSeries(metric, periods, unit) {
        const series = [];
        const baseValue = Math.random() * 100;
        const trend = (Math.random() - 0.5) * 0.1; // -5% a +5% por período
        const seasonality = Math.random() * 0.2; // 20% de variação sazonal
        const noise = Math.random() * 0.1; // 10% de ruído
        
        for (let i = 0; i < periods; i++) {
            const trendComponent = baseValue * (1 + trend * i);
            const seasonalComponent = Math.sin((i / periods) * 2 * Math.PI) * seasonality * baseValue;
            const noiseComponent = (Math.random() - 0.5) * noise * baseValue;
            
            const value = Math.max(0, trendComponent + seasonalComponent + noiseComponent);
            
            series.push({
                period: i + 1,
                value: Math.round(value * 100) / 100,
                timestamp: Date.now() + (i * this.getMilliseconds(unit)),
                confidence: Math.max(0.5, 0.9 - (i * 0.01)) // Confiança diminui com o tempo
            });
        }
        
        return series;
    }

    getMilliseconds(unit) {
        const units = {
            'hours': 3600000,
            'days': 86400000,
            'weeks': 604800000,
            'months': 2592000000
        };
        
        return units[unit] || 86400000;
    }

    // Métodos do assistente de chat
    async processMessage(message, userId = 'default') {
        try {
            this.logger.debug(`Processando mensagem: ${message}`);
            
            // Tokenizar mensagem
            const tokens = this.nlpEngine.tokenizer.tokenize(message);
            const cleanTokens = this.nlpEngine.tokenizer.removeStopWords(tokens);
            
            // Analisar sentimento
            const sentiment = this.nlpEngine.sentimentAnalyzer.analyze(cleanTokens);
            
            // Classificar intenção
            const intent = this.nlpEngine.intentClassifier.classify(cleanTokens);
            
            // Extrair entidades
            const entities = this.nlpEngine.entityExtractor.extract(cleanTokens);
            
            // Obter contexto do usuário
            const context = this.getUserContext(userId);
            
            // Gerar resposta
            const response = this.nlpEngine.responseGenerator.generate(intent, entities, context);
            
            // Salvar na história da conversa
            this.chatHistory.push({
                userId,
                message,
                response,
                sentiment,
                intent,
                entities,
                timestamp: Date.now()
            });
            
            // Atualizar contexto do usuário
            this.updateUserContext(userId, { intent, entities, sentiment });
            
            return {
                response,
                sentiment,
                intent,
                entities,
                confidence: intent.confidence
            };
            
        } catch (error) {
            this.logger.error('Erro ao processar mensagem:', error);
            return {
                response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                error: true
            };
        }
    }

    getUserContext(userId) {
        return this.userContext.get(userId) || {
            preferences: {},
            history: [],
            currentTopic: null,
            sessionStart: Date.now()
        };
    }

    updateUserContext(userId, data) {
        const context = this.getUserContext(userId);
        
        context.history.push(data);
        context.currentTopic = data.intent.intent;
        context.lastInteraction = Date.now();
        
        // Manter apenas os últimos 10 itens do histórico
        if (context.history.length > 10) {
            context.history = context.history.slice(-10);
        }
        
        this.userContext.set(userId, context);
    }

    generateDataResponse(entities, context) {
        const metrics = entities.metrics.length > 0 ? entities.metrics : ['energy', 'water', 'carbon'];
        const timeframe = entities.timeframes[0] || 'today';
        
        let response = this.getRandomTemplate('dataAnalysis') + '\n\n';
        
        metrics.forEach(metric => {
            const data = this.generateMockData(metric, timeframe);
            response += `📊 **${this.sustainabilityMetrics[metric]?.name || metric}**: ${data.value} ${this.sustainabilityMetrics[metric]?.unit || ''}\n`;
            response += `   Tendência: ${data.trend} (${data.change > 0 ? '+' : ''}${data.change}%)\n\n`;
        });
        
        return response;
    }

    generatePredictionResponse(entities, context) {
        const metrics = entities.metrics.length > 0 ? entities.metrics : ['energy'];
        const timeframe = entities.timeframes[0] || 'week';
        
        let response = this.getRandomTemplate('predictions') + '\n\n';
        
        metrics.forEach(metric => {
            const prediction = this.generateMockPrediction(metric, timeframe);
            response += `🔮 **${this.sustainabilityMetrics[metric]?.name || metric}** (próxima ${timeframe}):\n`;
            response += `   Valor previsto: ${prediction.value} ${this.sustainabilityMetrics[metric]?.unit || ''}\n`;
            response += `   Confiança: ${(prediction.confidence * 100).toFixed(1)}%\n`;
            response += `   Tendência: ${prediction.trend}\n\n`;
        });
        
        return response;
    }

    generateRecommendationResponse(entities, context) {
        const metrics = entities.metrics.length > 0 ? entities.metrics : Object.keys(this.sustainabilityMetrics);
        
        let response = this.getRandomTemplate('recommendations') + '\n\n';
        
        const recommendations = this.recommendationEngine.userBased.recommend('default', { metrics });
        
        recommendations.slice(0, 3).forEach((rec, index) => {
            response += `${index + 1}. **${rec.title}**\n`;
            response += `   ${rec.description}\n`;
            response += `   Impacto: ${rec.impact} | Confiança: ${(rec.confidence * 100).toFixed(1)}%\n\n`;
        });
        
        return response;
    }

    generateHelpResponse(entities, context) {
        return `🤖 **Assistente IA RegenTech**\n\n` +
               `Posso ajudar você com:\n\n` +
               `📊 **Análise de Dados**: "Como está o consumo de energia?"\n` +
               `🔮 **Predições**: "Qual será a tendência de água na próxima semana?"\n` +
               `💡 **Recomendações**: "Como posso reduzir meu impacto de carbono?"\n` +
               `📈 **Relatórios**: "Gere um relatório de sustentabilidade"\n\n` +
               `Digite sua pergunta em linguagem natural!`;
    }

    generateMockData(metric, timeframe) {
        return {
            value: Math.round(Math.random() * 1000),
            trend: Math.random() > 0.5 ? 'crescente' : 'decrescente',
            change: Math.round((Math.random() - 0.5) * 20 * 100) / 100
        };
    }

    generateMockPrediction(metric, timeframe) {
        return {
            value: Math.round(Math.random() * 1000),
            confidence: 0.7 + Math.random() * 0.25,
            trend: Math.random() > 0.5 ? 'melhoria esperada' : 'atenção necessária'
        };
    }

    getRandomTemplate(category) {
        const templates = this.conversationTemplates[category] || ['Resposta padrão'];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // Métodos de análise e insights
    async generateInsights(data, timeframe = '30d') {
        try {
            const insights = [];
            
            // Análise de tendências
            const trends = await this.analyzeTrends(data, timeframe);
            insights.push(...trends);
            
            // Detecção de anomalias
            const anomalies = await this.detectAnomalies(data);
            insights.push(...anomalies);
            
            // Oportunidades de otimização
            const optimizations = await this.findOptimizations(data);
            insights.push(...optimizations);
            
            // Comparações e benchmarks
            const benchmarks = await this.generateBenchmarks(data);
            insights.push(...benchmarks);
            
            return insights.sort((a, b) => b.importance - a.importance);
            
        } catch (error) {
            this.logger.error('Erro ao gerar insights:', error);
            return [];
        }
    }

    async analyzeTrends(data, timeframe) {
        const trends = [];
        
        Object.entries(data).forEach(([metric, values]) => {
            if (values.length < 2) return;
            
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            const change = ((lastValue - firstValue) / firstValue) * 100;
            
            const trend = {
                type: 'trend',
                metric,
                change,
                direction: change > 0 ? 'increase' : 'decrease',
                significance: Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
                importance: Math.abs(change) / 100,
                message: `${metric} ${change > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(change).toFixed(1)}% no período`,
                recommendation: this.getTrendRecommendation(metric, change)
            };
            
            trends.push(trend);
        });
        
        return trends;
    }

    getTrendRecommendation(metric, change) {
        const metricConfig = this.sustainabilityMetrics[metric];
        if (!metricConfig) return 'Monitorar tendência';
        
        const isGoodTrend = (metricConfig.target === 'minimize' && change < 0) ||
                           (metricConfig.target === 'maximize' && change > 0);
        
        if (isGoodTrend) {
            return 'Tendência positiva! Continue com as práticas atuais.';
        } else {
            return `Atenção necessária. Considere otimizar ${metricConfig.name.toLowerCase()}.`;
        }
    }

    async detectAnomalies(data) {
        const anomalies = [];
        
        Object.entries(data).forEach(([metric, values]) => {
            const detected = this.anomalyDetector.statistical.detect(values, metric);
            
            detected.forEach(anomaly => {
                anomalies.push({
                    type: 'anomaly',
                    metric,
                    ...anomaly,
                    importance: anomaly.severity === 'high' ? 0.9 : 0.6,
                    message: `Anomalia detectada em ${metric}: valor ${anomaly.value} (Z-score: ${anomaly.zScore.toFixed(2)})`,
                    recommendation: 'Investigar causa da anomalia e tomar ação corretiva se necessário.'
                });
            });
        });
        
        return anomalies;
    }

    async findOptimizations(data) {
        const optimizations = [];
        
        // Simular identificação de oportunidades
        const opportunities = [
            {
                metric: 'energy',
                potential: 25,
                action: 'Instalar sistema de energia solar',
                impact: 'Redução de 25% no consumo de energia da rede',
                investment: 'Médio',
                payback: '3-5 anos'
            },
            {
                metric: 'water',
                potential: 15,
                action: 'Implementar sistema de captação de chuva',
                impact: 'Economia de 15% no consumo de água',
                investment: 'Baixo',
                payback: '1-2 anos'
            },
            {
                metric: 'waste',
                potential: 40,
                action: 'Programa de compostagem',
                impact: 'Redução de 40% nos resíduos orgânicos',
                investment: 'Baixo',
                payback: '6 meses'
            }
        ];
        
        opportunities.forEach(opp => {
            optimizations.push({
                type: 'optimization',
                ...opp,
                importance: opp.potential / 100,
                message: `Oportunidade: ${opp.action} (${opp.potential}% de melhoria)`,
                recommendation: `${opp.impact}. Investimento ${opp.investment.toLowerCase()}, retorno em ${opp.payback}.`
            });
        });
        
        return optimizations;
    }

    async generateBenchmarks(data) {
        const benchmarks = [];
        
        // Simular comparações com benchmarks
        Object.entries(data).forEach(([metric, values]) => {
            const currentValue = values[values.length - 1];
            const benchmark = this.getBenchmark(metric);
            
            if (benchmark) {
                const performance = (currentValue / benchmark.value) * 100;
                
                benchmarks.push({
                    type: 'benchmark',
                    metric,
                    currentValue,
                    benchmarkValue: benchmark.value,
                    performance,
                    status: performance <= 100 ? 'above' : 'below',
                    importance: Math.abs(performance - 100) / 100,
                    message: `${metric}: ${performance.toFixed(1)}% do benchmark ${benchmark.name}`,
                    recommendation: performance > 100 ? 
                        `Desempenho abaixo do benchmark. Considere melhorias.` :
                        `Desempenho acima do benchmark! Excelente trabalho.`
                });
            }
        });
        
        return benchmarks;
    }

    getBenchmark(metric) {
        const benchmarks = {
            energy: { name: 'indústria', value: 100 },
            water: { name: 'setor', value: 80 },
            carbon: { name: 'meta nacional', value: 50 },
            waste: { name: 'melhores práticas', value: 20 }
        };
        
        return benchmarks[metric];
    }

    // Métodos de renderização
    render() {
        if (!this.isInitialized) {
            return '<div class="loading">Inicializando Sistema de IA...</div>';
        }
        
        return this.renderAISystem();
    }

    renderAISystem() {
        const predictions = this.predictionCache.get('shortTerm');
        const insights = this.insights.slice(0, 5);
        
        return `
            <div class="ai-system-container">
                <!-- Header do Sistema de IA -->
                <div class="ai-header">
                    <div class="header-content">
                        <h2>🤖 Sistema de IA Avançado</h2>
                        <div class="ai-status">
                            <span class="status-indicator active">🟢 Online</span>
                            <span class="model-count">${this.models.size} modelos ativos</span>
                        </div>
                    </div>
                </div>
                
                <!-- Chat com Assistente IA -->
                <div class="ai-chat-section">
                    <h3>💬 Assistente Inteligente</h3>
                    <div class="chat-container">
                        <div class="chat-messages" id="ai-chat-messages">
                            ${this.renderChatHistory()}
                        </div>
                        <div class="chat-input">
                            <input type="text" 
                                   id="ai-chat-input" 
                                   placeholder="Pergunte sobre suas métricas de sustentabilidade..."
                                   onkeypress="if(event.key==='Enter') aiSystem.sendMessage()">
                            <button onclick="aiSystem.sendMessage()">📤</button>
                        </div>
                    </div>
                </div>
                
                <!-- Predições IA -->
                <div class="predictions-section">
                    <h3>🔮 Análise Preditiva</h3>
                    <div class="predictions-grid">
                        ${this.renderPredictions(predictions)}
                    </div>
                </div>
                
                <!-- Insights e Recomendações -->
                <div class="insights-section">
                    <h3>💡 Insights Inteligentes</h3>
                    <div class="insights-list">
                        ${this.renderInsights(insights)}
                    </div>
                </div>
                
                <!-- Modelos de ML -->
                <div class="models-section">
                    <h3>🧠 Modelos de Machine Learning</h3>
                    <div class="models-grid">
                        ${this.renderModels()}
                    </div>
                </div>
                
                <!-- Detecção de Anomalias -->
                <div class="anomalies-section">
                    <h3>⚠️ Detecção de Anomalias</h3>
                    <div class="anomalies-list">
                        ${this.renderAnomalies()}
                    </div>
                </div>
            </div>
        `;
    }

    renderChatHistory() {
        return this.chatHistory.slice(-5).map(chat => `
            <div class="chat-message user">
                <div class="message-content">${chat.message}</div>
                <div class="message-time">${new Date(chat.timestamp).toLocaleTimeString()}</div>
            </div>
            <div class="chat-message ai">
                <div class="message-content">${chat.response}</div>
                <div class="message-confidence">Confiança: ${(chat.confidence * 100).toFixed(1)}%</div>
            </div>
        `).join('');
    }

    renderPredictions(predictions) {
        if (!predictions) return '<div class="no-data">Gerando predições...</div>';
        
        return Object.entries(predictions.predictions).map(([metric, series]) => {
            const nextValue = series[0];
            const metricConfig = this.sustainabilityMetrics[metric];
            
            return `
                <div class="prediction-card">
                    <div class="prediction-header">
                        <h4>${metricConfig?.name || metric}</h4>
                        <span class="prediction-horizon">${predictions.horizon}</span>
                    </div>
                    <div class="prediction-value">
                        ${nextValue.value} ${metricConfig?.unit || ''}
                    </div>
                    <div class="prediction-confidence">
                        Confiança: ${(nextValue.confidence * 100).toFixed(1)}%
                    </div>
                    <div class="prediction-chart">
                        ${this.renderMiniChart(series.slice(0, 7))}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMiniChart(series) {
        const max = Math.max(...series.map(s => s.value));
        const min = Math.min(...series.map(s => s.value));
        const range = max - min || 1;
        
        return series.map((point, index) => {
            const height = ((point.value - min) / range) * 40 + 5;
            return `<div class="chart-bar" style="height: ${height}px" title="${point.value}"></div>`;
        }).join('');
    }

    renderInsights(insights) {
        if (insights.length === 0) {
            return '<div class="no-insights">Analisando dados para gerar insights...</div>';
        }
        
        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-icon">
                    ${this.getInsightIcon(insight.type)}
                </div>
                <div class="insight-content">
                    <div class="insight-message">${insight.message}</div>
                    <div class="insight-recommendation">${insight.recommendation}</div>
                    <div class="insight-importance">
                        Importância: ${this.getImportanceLevel(insight.importance)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getInsightIcon(type) {
        const icons = {
            trend: '📈',
            anomaly: '⚠️',
            optimization: '💡',
            benchmark: '🎯'
        };
        return icons[type] || '📊';
    }

    getImportanceLevel(importance) {
        if (importance > 0.8) return '🔴 Alta';
        if (importance > 0.5) return '🟡 Média';
        return '🟢 Baixa';
    }

    renderModels() {
        return Array.from(this.models.values()).map(model => `
            <div class="model-card">
                <div class="model-header">
                    <h4>${model.id}</h4>
                    <span class="model-status ${model.status}">${model.status}</span>
                </div>
                <div class="model-info">
                    <div class="model-type">${model.type}</div>
                    <div class="model-algorithm">${model.algorithm}</div>
                </div>
                <div class="model-metrics">
                    <div class="metric">
                        <span class="label">Acurácia:</span>
                        <span class="value">${(model.metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">Última atualização:</span>
                        <span class="value">${model.lastTrained ? new Date(model.lastTrained).toLocaleDateString() : 'Nunca'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAnomalies() {
        if (this.anomalies.length === 0) {
            return '<div class="no-anomalies">✅ Nenhuma anomalia detectada</div>';
        }
        
        return this.anomalies.slice(0, 5).map(anomaly => `
            <div class="anomaly-card ${anomaly.severity}">
                <div class="anomaly-header">
                    <span class="anomaly-type">${anomaly.type}</span>
                    <span class="anomaly-severity">${anomaly.severity}</span>
                </div>
                <div class="anomaly-details">
                    <div class="anomaly-metric">${anomaly.metric}</div>
                    <div class="anomaly-value">Valor: ${anomaly.value}</div>
                    ${anomaly.zScore ? `<div class="anomaly-score">Z-Score: ${anomaly.zScore.toFixed(2)}</div>` : ''}
                </div>
                <div class="anomaly-timestamp">
                    ${new Date().toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // Métodos de interação
    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        
        try {
            const response = await this.processMessage(message);
            this.updateChatDisplay(message, response.response);
            
        } catch (error) {
            this.logger.error('Erro ao enviar mensagem:', error);
            this.updateChatDisplay(message, 'Desculpe, ocorreu um erro. Tente novamente.');
        }
    }

    updateChatDisplay(userMessage, aiResponse) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.innerHTML = `
            <div class="message-content">${userMessage}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        const aiDiv = document.createElement('div');
        aiDiv.className = 'chat-message ai';
        aiDiv.innerHTML = `
            <div class="message-content">${aiResponse}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        messagesContainer.appendChild(userDiv);
        messagesContainer.appendChild(aiDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Métodos de treinamento e atualização
    async trainModel(modelId, trainingData) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                throw new Error(`Modelo ${modelId} não encontrado`);
            }
            
            this.logger.info(`Treinando modelo ${modelId}...`);
            
            // Simular treinamento
            model.status = 'training';
            model.trainingData = trainingData;
            
            // Simular processo de treinamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Atualizar métricas do modelo
            model.metrics = {
                accuracy: 0.8 + Math.random() * 0.15,
                precision: 0.75 + Math.random() * 0.2,
                recall: 0.7 + Math.random() * 0.25,
                f1Score: 0.72 + Math.random() * 0.23,
                mse: Math.random() * 0.1,
                mae: Math.random() * 0.05
            };
            
            model.status = 'trained';
            model.lastTrained = Date.now();
            
            this.logger.success(`Modelo ${modelId} treinado com sucesso`);
            
            return model;
            
        } catch (error) {
            this.logger.error(`Erro ao treinar modelo ${modelId}:`, error);
            throw error;
        }
    }

    async updateModels() {
        try {
            this.logger.info('Atualizando modelos de ML...');
            
            const updatePromises = Array.from(this.models.keys()).map(async modelId => {
                const lastUpdate = this.lastModelUpdate.get(modelId) || 0;
                const timeSinceUpdate = Date.now() - lastUpdate;
                
                if (timeSinceUpdate > this.config.modelUpdateInterval) {
                    // Simular dados de treinamento
                    const trainingData = this.generateTrainingData(modelId);
                    await this.trainModel(modelId, trainingData);
                    this.lastModelUpdate.set(modelId, Date.now());
                }
            });
            
            await Promise.all(updatePromises);
            
            this.logger.success('Modelos atualizados com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao atualizar modelos:', error);
        }
    }

    generateTrainingData(modelId) {
        // Simular geração de dados de treinamento
        const data = [];
        const sampleSize = 100 + Math.floor(Math.random() * 400);
        
        for (let i = 0; i < sampleSize; i++) {
            data.push({
                features: Array.from({ length: 5 }, () => Math.random() * 100),
                target: Math.random() * 50,
                timestamp: Date.now() - (Math.random() * 86400000 * 30) // Últimos 30 dias
            });
        }
        
        return data;
    }

    // Métodos de exportação e relatórios
    async generateAIReport(timeframe = '30d') {
        try {
            const report = {
                metadata: {
                    generatedAt: Date.now(),
                    timeframe,
                    version: '3.0.0'
                },
                models: this.getModelsReport(),
                predictions: this.getPredictionsReport(),
                insights: await this.generateInsights({}, timeframe),
                anomalies: this.anomalies,
                performance: this.getPerformanceMetrics(),
                recommendations: this.getAIRecommendations()
            };
            
            return report;
            
        } catch (error) {
            this.logger.error('Erro ao gerar relatório de IA:', error);
            throw error;
        }
    }

    getModelsReport() {
        return Array.from(this.models.values()).map(model => ({
            id: model.id,
            type: model.type,
            algorithm: model.algorithm,
            status: model.status,
            accuracy: model.metrics.accuracy,
            lastTrained: model.lastTrained,
            trainingDataSize: model.trainingData.length
        }));
    }

    getPredictionsReport() {
        const report = {};
        
        ['shortTerm', 'mediumTerm', 'longTerm'].forEach(term => {
            const predictions = this.predictionCache.get(term);
            if (predictions) {
                report[term] = {
                    horizon: predictions.horizon,
                    confidence: predictions.confidence,
                    generatedAt: predictions.generatedAt,
                    metricsCount: Object.keys(predictions.predictions).length
                };
            }
        });
        
        return report;
    }

    getPerformanceMetrics() {
        return {
            modelsActive: this.models.size,
            averageAccuracy: this.calculateAverageAccuracy(),
            predictionsCached: this.predictionCache.size,
            anomaliesDetected: this.anomalies.length,
            chatInteractions: this.chatHistory.length,
            systemUptime: Date.now() - (this.initializationTime || Date.now())
        };
    }

    calculateAverageAccuracy() {
        const accuracies = Array.from(this.models.values())
            .map(model => model.metrics.accuracy)
            .filter(acc => acc > 0);
        
        return accuracies.length > 0 ? 
            accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length : 0;
    }

    getAIRecommendations() {
        return [
            {
                category: 'model_optimization',
                title: 'Otimizar Modelos de ML',
                description: 'Retreinar modelos com dados mais recentes',
                priority: 'medium',
                estimatedImpact: 'Melhoria de 10-15% na acurácia'
            },
            {
                category: 'data_quality',
                title: 'Melhorar Qualidade dos Dados',
                description: 'Implementar validação e limpeza automática',
                priority: 'high',
                estimatedImpact: 'Redução de 30% em anomalias falsas'
            },
            {
                category: 'feature_engineering',
                title: 'Engenharia de Features',
                description: 'Adicionar novas variáveis preditivas',
                priority: 'low',
                estimatedImpact: 'Melhoria de 5-8% nas predições'
            }
        ];
    }

    // Métodos de configuração e manutenção
    async updateConfiguration(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            await this.configManager.set('ai', this.config);
            
            this.logger.info('Configuração de IA atualizada');
            
            // Reinicializar componentes se necessário
            if (newConfig.modelUpdateInterval) {
                this.restartPredictionIntervals();
            }
            
        } catch (error) {
            this.logger.error('Erro ao atualizar configuração:', error);
        }
    }

    restartPredictionIntervals() {
        // Limpar intervalos existentes
        Object.values(this.predictionIntervals).forEach(interval => {
            clearInterval(interval);
        });
        
        // Reiniciar com nova configuração
        this.startPredictiveAnalytics();
    }

    async cleanup() {
        try {
            this.logger.info('Limpando Sistema de IA...');
            
            // Limpar intervalos
            Object.values(this.predictionIntervals).forEach(interval => {
                clearInterval(interval);
            });
            
            // Limpar caches
            this.predictionCache.clear();
            this.userContext.clear();
            
            // Salvar estado final
            await this.saveState();
            
            this.logger.success('Sistema de IA limpo com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao limpar Sistema de IA:', error);
        }
    }

    async saveState() {
        try {
            const state = {
                models: Array.from(this.models.entries()),
                predictions: Array.from(this.predictionCache.entries()),
                insights: this.insights,
                anomalies: this.anomalies,
                chatHistory: this.chatHistory.slice(-50), // Manter apenas últimas 50 mensagens
                lastUpdate: Date.now()
            };
            
            await this.configManager.set('ai_state', state);
            
        } catch (error) {
            this.logger.error('Erro ao salvar estado:', error);
        }
    }

    async loadState() {
        try {
            const state = await this.configManager.get('ai_state');
            
            if (state) {
                this.models = new Map(state.models || []);
                this.predictionCache = new Map(state.predictions || []);
                this.insights = state.insights || [];
                this.anomalies = state.anomalies || [];
                this.chatHistory = state.chatHistory || [];
                
                this.logger.debug('Estado do Sistema de IA carregado');
            }
            
        } catch (error) {
            this.logger.error('Erro ao carregar estado:', error);
        }
    }

    // Getters para status do sistema
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            modelsCount: this.models.size,
            activeModels: Array.from(this.models.values()).filter(m => m.status === 'trained').length,
            predictionsAvailable: this.predictionCache.size > 0,
            anomaliesCount: this.anomalies.length,
            chatActive: this.conversationState !== 'idle',
            lastUpdate: Math.max(...Array.from(this.lastModelUpdate.values()), 0)
        };
    }

    getModelStatus(modelId) {
        const model = this.models.get(modelId);
        return model ? {
            id: model.id,
            status: model.status,
            accuracy: model.metrics.accuracy,
            lastTrained: model.lastTrained,
            type: model.type,
            algorithm: model.algorithm
        } : null;
    }

    getPredictions(timeframe = 'shortTerm') {
        return this.predictionCache.get(timeframe) || null;
    }

    getInsights(limit = 10) {
        return this.insights.slice(0, limit);
    }

    getAnomalies(limit = 20) {
        return this.anomalies.slice(0, limit);
    }
}

// Instância global
window.aiSystem = null;

// Inicialização automática
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.aiSystem = new AISystem();
        await window.aiSystem.initialize();
        console.log('✅ Sistema de IA inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar Sistema de IA:', error);
    }
});