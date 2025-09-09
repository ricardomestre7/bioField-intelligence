/**
 * Sistema de Gêmeo Digital Preditivo
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../../utils/Logger.js';

export class DigitalTwinSystem {
    constructor(config = {}) {
        this.config = {
            updateInterval: config.updateInterval || 10000,
            simulationSteps: config.simulationSteps || 100,
            enablePredictions: config.enablePredictions !== false,
            enableOptimization: config.enableOptimization !== false,
            maxScenarios: config.maxScenarios || 5,
            ...config
        };
        
        this.logger = new Logger('DigitalTwinSystem');
        this.isInitialized = false;
        this.twins = new Map();
        this.simulations = new Map();
        this.scenarios = [];
        this.optimizations = new Map();
        
        this.initializeDigitalTwins();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema de Gêmeo Digital...');
            
            // Carregar modelos de simulação
            await this.loadSimulationModels();
            
            // Inicializar gêmeos digitais
            await this.initializeTwins();
            
            // Configurar simulações automáticas
            this.setupAutoSimulations();
            
            // Carregar cenários de otimização
            if (this.config.enableOptimization) {
                await this.loadOptimizationScenarios();
            }
            
            this.isInitialized = true;
            this.logger.success('Sistema de Gêmeo Digital inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema de Gêmeo Digital:', error);
            throw error;
        }
    }

    initializeDigitalTwins() {
        // Configurações iniciais dos gêmeos digitais
        const twinConfigs = {
            ecosystem: {
                name: 'Ecossistema Regenerativo',
                type: 'environmental',
                parameters: {
                    biodiversity: 85,
                    soilHealth: 78,
                    waterQuality: 92,
                    carbonSequestration: 1200,
                    energyEfficiency: 88
                },
                sensors: ['soil', 'water', 'air', 'biodiversity'],
                updateFrequency: 5000
            },
            farm: {
                name: 'Fazenda Digital',
                type: 'agricultural',
                parameters: {
                    cropYield: 4.2,
                    soilMoisture: 65,
                    nutrientLevel: 82,
                    pestUsage: 15,
                    waterUsage: 2500
                },
                sensors: ['soil', 'weather', 'crop', 'irrigation'],
                updateFrequency: 3000
            },
            factory: {
                name: 'Fábrica Sustentável',
                type: 'industrial',
                parameters: {
                    energyConsumption: 8500,
                    wasteGeneration: 120,
                    efficiency: 94,
                    emissions: 45,
                    recyclingRate: 87
                },
                sensors: ['energy', 'waste', 'emissions', 'production'],
                updateFrequency: 2000
            }
        };
        
        Object.entries(twinConfigs).forEach(([key, config]) => {
            this.twins.set(key, {
                ...config,
                id: key,
                status: 'active',
                lastUpdate: Date.now(),
                historicalData: [],
                predictions: null,
                optimization: null
            });
        });
    }

    async loadSimulationModels() {
        try {
            this.logger.info('Carregando modelos de simulação...');
            
            // Modelo de Ecossistema
            const ecosystemModel = {
                name: 'EcosystemModel',
                version: '2.1.0',
                equations: {
                    biodiversity: (params) => {
                        const { soilHealth, waterQuality, temperature, pollution } = params;
                        return (soilHealth * 0.4 + waterQuality * 0.3 + (100 - pollution) * 0.2 + (25 - Math.abs(temperature - 22)) * 0.1);
                    },
                    carbonSequestration: (params) => {
                        const { biomass, soilCarbon, temperature, moisture } = params;
                        return biomass * 0.5 + soilCarbon * 0.3 + (moisture / 100) * 200 - (temperature - 20) * 10;
                    },
                    soilHealth: (params) => {
                        const { organicMatter, ph, nutrients, compaction } = params;
                        return (organicMatter * 0.4 + (7 - Math.abs(ph - 6.5)) * 10 + nutrients * 0.3 + (100 - compaction) * 0.2);
                    }
                },
                constraints: {
                    temperature: { min: -10, max: 45 },
                    moisture: { min: 0, max: 100 },
                    ph: { min: 4, max: 9 }
                }
            };
            
            // Modelo Agrícola
            const agriculturalModel = {
                name: 'AgriculturalModel',
                version: '1.8.0',
                equations: {
                    cropYield: (params) => {
                        const { soilHealth, irrigation, fertilizer, weather, pests } = params;
                        return (soilHealth * 0.3 + irrigation * 0.25 + fertilizer * 0.2 + weather * 0.15 + (100 - pests) * 0.1) / 20;
                    },
                    waterEfficiency: (params) => {
                        const { soilMoisture, evapotranspiration, irrigation } = params;
                        return (soilMoisture + irrigation - evapotranspiration) / irrigation * 100;
                    },
                    nutrientBalance: (params) => {
                        const { nitrogen, phosphorus, potassium, organicMatter } = params;
                        return (nitrogen + phosphorus + potassium) / 3 + organicMatter * 0.2;
                    }
                },
                constraints: {
                    soilMoisture: { min: 20, max: 80 },
                    temperature: { min: 5, max: 40 },
                    nutrients: { min: 0, max: 100 }
                }
            };
            
            // Modelo Industrial
            const industrialModel = {
                name: 'IndustrialModel',
                version: '1.5.0',
                equations: {
                    energyEfficiency: (params) => {
                        const { production, energyInput, waste, maintenance } = params;
                        return (production / energyInput) * (100 - waste) * (100 - maintenance) / 10000;
                    },
                    emissions: (params) => {
                        const { energyConsumption, fuelType, efficiency, filters } = params;
                        const emissionFactor = fuelType === 'renewable' ? 0.1 : 0.8;
                        return energyConsumption * emissionFactor * (100 - efficiency) * (100 - filters) / 10000;
                    },
                    wasteReduction: (params) => {
                        const { recycling, reuse, reduction, efficiency } = params;
                        return (recycling + reuse + reduction) * efficiency / 100;
                    }
                },
                constraints: {
                    efficiency: { min: 60, max: 98 },
                    recycling: { min: 0, max: 100 },
                    emissions: { min: 0, max: 1000 }
                }
            };
            
            this.simulationModels = {
                ecosystem: ecosystemModel,
                farm: agriculturalModel,
                factory: industrialModel
            };
            
            this.logger.success('Modelos de simulação carregados');
            
        } catch (error) {
            this.logger.error('Erro ao carregar modelos de simulação:', error);
        }
    }

    async initializeTwins() {
        try {
            for (const [twinId, twin] of this.twins) {
                // Gerar dados históricos
                await this.generateHistoricalData(twinId);
                
                // Executar simulação inicial
                await this.runSimulation(twinId);
                
                // Gerar predições iniciais
                if (this.config.enablePredictions) {
                    await this.generatePredictions(twinId);
                }
            }
            
            this.logger.success('Gêmeos digitais inicializados');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar gêmeos digitais:', error);
        }
    }

    async generateHistoricalData(twinId) {
        const twin = this.twins.get(twinId);
        if (!twin) return;
        
        const historicalPeriod = 30; // últimos 30 dias
        const dataPoints = [];
        
        for (let i = historicalPeriod; i >= 0; i--) {
            const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
            const dataPoint = {
                timestamp,
                date: new Date(timestamp).toISOString().split('T')[0],
                parameters: {}
            };
            
            // Gerar valores históricos para cada parâmetro
            Object.keys(twin.parameters).forEach(param => {
                dataPoint.parameters[param] = this.generateHistoricalValue(twinId, param, i);
            });
            
            dataPoints.push(dataPoint);
        }
        
        twin.historicalData = dataPoints;
    }

    generateHistoricalValue(twinId, parameter, daysAgo) {
        const twin = this.twins.get(twinId);
        const baseValue = twin.parameters[parameter];
        
        // Adicionar variação temporal e ruído
        const seasonalVariation = Math.sin((daysAgo * 2 * Math.PI) / 365) * 0.1;
        const randomNoise = (Math.random() - 0.5) * 0.2;
        const trendFactor = daysAgo * 0.001; // Tendência leve
        
        const variation = seasonalVariation + randomNoise - trendFactor;
        return Math.max(0, baseValue * (1 + variation));
    }

    async runSimulation(twinId, scenarios = null) {
        try {
            const twin = this.twins.get(twinId);
            if (!twin) return null;
            
            const model = this.simulationModels[twin.type];
            if (!model) return null;
            
            this.logger.debug(`Executando simulação para ${twin.name}...`);
            
            const simulationId = `sim_${twinId}_${Date.now()}`;
            const simulation = {
                id: simulationId,
                twinId,
                startTime: Date.now(),
                steps: this.config.simulationSteps,
                scenarios: scenarios || this.generateDefaultScenarios(twinId),
                results: []
            };
            
            // Executar simulação para cada cenário
            for (const scenario of simulation.scenarios) {
                const result = await this.simulateScenario(twin, model, scenario);
                simulation.results.push(result);
            }
            
            simulation.endTime = Date.now();
            simulation.duration = simulation.endTime - simulation.startTime;
            
            this.simulations.set(simulationId, simulation);
            twin.lastSimulation = simulationId;
            
            this.logger.success(`Simulação ${simulationId} concluída`);
            
            return simulation;
            
        } catch (error) {
            this.logger.error('Erro ao executar simulação:', error);
            return null;
        }
    }

    generateDefaultScenarios(twinId) {
        const scenarios = [
            {
                name: 'Cenário Base',
                description: 'Condições atuais mantidas',
                modifications: {}
            },
            {
                name: 'Cenário Otimista',
                description: 'Melhorias em todos os parâmetros',
                modifications: {
                    efficiency: 1.15,
                    sustainability: 1.2,
                    innovation: 1.1
                }
            },
            {
                name: 'Cenário Pessimista',
                description: 'Degradação dos parâmetros',
                modifications: {
                    efficiency: 0.9,
                    sustainability: 0.85,
                    external_pressure: 1.3
                }
            }
        ];
        
        // Adicionar cenários específicos por tipo de gêmeo
        if (twinId === 'ecosystem') {
            scenarios.push({
                name: 'Mudanças Climáticas',
                description: 'Impacto das mudanças climáticas',
                modifications: {
                    temperature: 1.05,
                    precipitation: 0.9,
                    extreme_events: 1.4
                }
            });
        } else if (twinId === 'farm') {
            scenarios.push({
                name: 'Agricultura Regenerativa',
                description: 'Implementação de práticas regenerativas',
                modifications: {
                    soil_health: 1.3,
                    biodiversity: 1.25,
                    water_efficiency: 1.2
                }
            });
        } else if (twinId === 'factory') {
            scenarios.push({
                name: 'Indústria 4.0',
                description: 'Automação e IoT avançado',
                modifications: {
                    efficiency: 1.25,
                    waste_reduction: 1.3,
                    energy_optimization: 1.2
                }
            });
        }
        
        return scenarios;
    }

    async simulateScenario(twin, model, scenario) {
        const steps = this.config.simulationSteps;
        const timeHorizon = 365; // dias
        const stepSize = timeHorizon / steps;
        
        const result = {
            scenario: scenario.name,
            description: scenario.description,
            timeline: [],
            summary: {},
            metrics: {}
        };
        
        let currentParams = { ...twin.parameters };
        
        // Aplicar modificações do cenário
        Object.entries(scenario.modifications).forEach(([key, factor]) => {
            if (currentParams[key]) {
                currentParams[key] *= factor;
            }
        });
        
        // Simular ao longo do tempo
        for (let step = 0; step < steps; step++) {
            const timePoint = step * stepSize;
            const timestamp = Date.now() + (timePoint * 24 * 60 * 60 * 1000);
            
            // Aplicar equações do modelo
            const simulatedParams = {};
            Object.entries(model.equations).forEach(([param, equation]) => {
                try {
                    simulatedParams[param] = equation(currentParams);
                } catch (error) {
                    simulatedParams[param] = currentParams[param] || 0;
                }
            });
            
            // Aplicar constraints
            Object.entries(simulatedParams).forEach(([param, value]) => {
                const constraint = model.constraints[param];
                if (constraint) {
                    simulatedParams[param] = Math.max(constraint.min, Math.min(constraint.max, value));
                }
            });
            
            result.timeline.push({
                step,
                timePoint,
                timestamp,
                date: new Date(timestamp).toISOString().split('T')[0],
                parameters: { ...simulatedParams }
            });
            
            // Atualizar parâmetros para próximo step
            currentParams = { ...currentParams, ...simulatedParams };
            
            // Adicionar variação estocástica
            Object.keys(currentParams).forEach(param => {
                const noise = (Math.random() - 0.5) * 0.02; // 2% de ruído
                currentParams[param] *= (1 + noise);
            });
        }
        
        // Calcular métricas do resultado
        result.metrics = this.calculateScenarioMetrics(result.timeline);
        result.summary = this.generateScenarioSummary(result);
        
        return result;
    }

    calculateScenarioMetrics(timeline) {
        if (timeline.length === 0) return {};
        
        const metrics = {};
        const firstPoint = timeline[0];
        const lastPoint = timeline[timeline.length - 1];
        
        // Calcular métricas para cada parâmetro
        Object.keys(firstPoint.parameters).forEach(param => {
            const values = timeline.map(point => point.parameters[param]);
            
            metrics[param] = {
                initial: firstPoint.parameters[param],
                final: lastPoint.parameters[param],
                min: Math.min(...values),
                max: Math.max(...values),
                average: values.reduce((sum, val) => sum + val, 0) / values.length,
                change: ((lastPoint.parameters[param] - firstPoint.parameters[param]) / firstPoint.parameters[param]) * 100,
                volatility: this.calculateVolatility(values)
            };
        });
        
        return metrics;
    }

    calculateVolatility(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        
        return Math.sqrt(variance);
    }

    generateScenarioSummary(result) {
        const { metrics } = result;
        const summary = {
            overallTrend: 'stable',
            keyInsights: [],
            recommendations: [],
            riskLevel: 'medium'
        };
        
        // Analisar tendências gerais
        const changes = Object.values(metrics).map(m => m.change);
        const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
        
        if (avgChange > 5) {
            summary.overallTrend = 'improving';
            summary.riskLevel = 'low';
        } else if (avgChange < -5) {
            summary.overallTrend = 'declining';
            summary.riskLevel = 'high';
        }
        
        // Gerar insights
        Object.entries(metrics).forEach(([param, metric]) => {
            if (Math.abs(metric.change) > 10) {
                summary.keyInsights.push(
                    `${param} apresenta mudança significativa de ${metric.change.toFixed(1)}%`
                );
            }
            
            if (metric.volatility > metric.average * 0.2) {
                summary.keyInsights.push(
                    `${param} mostra alta volatilidade (${metric.volatility.toFixed(2)})`
                );
            }
        });
        
        // Gerar recomendações
        if (summary.overallTrend === 'declining') {
            summary.recommendations.push('Implementar medidas corretivas urgentes');
            summary.recommendations.push('Monitorar parâmetros críticos mais frequentemente');
        } else if (summary.overallTrend === 'improving') {
            summary.recommendations.push('Manter estratégias atuais');
            summary.recommendations.push('Considerar expansão das práticas bem-sucedidas');
        }
        
        return summary;
    }

    async generatePredictions(twinId) {
        try {
            const twin = this.twins.get(twinId);
            if (!twin || !twin.historicalData.length) return;
            
            this.logger.debug(`Gerando predições para ${twin.name}...`);
            
            const predictions = {
                shortTerm: {}, // 7 dias
                mediumTerm: {}, // 30 dias
                longTerm: {} // 90 dias
            };
            
            // Gerar predições para cada parâmetro
            Object.keys(twin.parameters).forEach(param => {
                const historicalValues = twin.historicalData.map(d => d.parameters[param]);
                
                predictions.shortTerm[param] = this.predictValue(historicalValues, 7);
                predictions.mediumTerm[param] = this.predictValue(historicalValues, 30);
                predictions.longTerm[param] = this.predictValue(historicalValues, 90);
            });
            
            twin.predictions = {
                ...predictions,
                generatedAt: Date.now(),
                confidence: this.calculatePredictionConfidence(twin.historicalData)
            };
            
            this.logger.success(`Predições geradas para ${twin.name}`);
            
        } catch (error) {
            this.logger.error('Erro ao gerar predições:', error);
        }
    }

    predictValue(historicalValues, daysAhead) {
        if (historicalValues.length < 7) return null;
        
        // Algoritmo de predição simples baseado em tendência e sazonalidade
        const recent = historicalValues.slice(-7);
        const older = historicalValues.slice(-14, -7);
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        const trend = (recentAvg - olderAvg) / 7; // tendência por dia
        const seasonal = Math.sin((daysAhead * 2 * Math.PI) / 365) * (recentAvg * 0.1);
        
        return {
            value: recentAvg + (trend * daysAhead) + seasonal,
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            confidence: Math.max(0.5, 1 - (this.calculateVolatility(recent) / recentAvg))
        };
    }

    calculatePredictionConfidence(historicalData) {
        if (historicalData.length < 14) return 0.5;
        
        // Calcular confiança baseada na consistência dos dados históricos
        const consistencyScores = Object.keys(historicalData[0].parameters).map(param => {
            const values = historicalData.map(d => d.parameters[param]);
            const volatility = this.calculateVolatility(values);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            
            return Math.max(0, 1 - (volatility / mean));
        });
        
        return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
    }

    async loadOptimizationScenarios() {
        try {
            this.logger.info('Carregando cenários de otimização...');
            
            this.scenarios = [
                {
                    id: 'carbon_optimization',
                    name: 'Otimização de Carbono',
                    description: 'Maximizar sequestro de carbono',
                    objective: 'maximize',
                    target: 'carbonSequestration',
                    constraints: {
                        cost: { max: 100000 },
                        time: { max: 365 },
                        resources: { max: 1000 }
                    },
                    variables: ['soilHealth', 'biodiversity', 'energyEfficiency']
                },
                {
                    id: 'efficiency_optimization',
                    name: 'Otimização de Eficiência',
                    description: 'Maximizar eficiência operacional',
                    objective: 'maximize',
                    target: 'efficiency',
                    constraints: {
                        cost: { max: 50000 },
                        environmental_impact: { max: 0.1 }
                    },
                    variables: ['energyConsumption', 'wasteGeneration', 'recyclingRate']
                },
                {
                    id: 'sustainability_optimization',
                    name: 'Otimização de Sustentabilidade',
                    description: 'Equilibrar todos os aspectos sustentáveis',
                    objective: 'balance',
                    targets: ['carbonSequestration', 'biodiversity', 'efficiency', 'waterQuality'],
                    constraints: {
                        cost: { max: 75000 },
                        time: { max: 180 }
                    },
                    variables: ['all']
                }
            ];
            
            this.logger.success('Cenários de otimização carregados');
            
        } catch (error) {
            this.logger.error('Erro ao carregar cenários de otimização:', error);
        }
    }

    setupAutoSimulations() {
        // Configurar simulações automáticas
        this.simulationInterval = setInterval(() => {
            this.runAutoSimulations();
        }, this.config.updateInterval);
        
        // Atualizar predições periodicamente
        this.predictionInterval = setInterval(() => {
            if (this.config.enablePredictions) {
                this.updateAllPredictions();
            }
        }, 60 * 60 * 1000); // a cada hora
    }

    async runAutoSimulations() {
        if (!this.isInitialized) return;
        
        try {
            for (const [twinId] of this.twins) {
                await this.runSimulation(twinId);
            }
            
            this.logger.debug('Simulações automáticas executadas');
            
        } catch (error) {
            this.logger.error('Erro nas simulações automáticas:', error);
        }
    }

    async updateAllPredictions() {
        try {
            for (const [twinId] of this.twins) {
                await this.generatePredictions(twinId);
            }
            
            this.logger.debug('Predições atualizadas');
            
        } catch (error) {
            this.logger.error('Erro ao atualizar predições:', error);
        }
    }

    render() {
        const content = document.getElementById('content');
        if (!content) return;
        
        const twinsArray = Array.from(this.twins.values());
        const simulationsArray = Array.from(this.simulations.values()).slice(0, 3);
        
        content.innerHTML = `
            <div class="digital-twin-dashboard">
                <div class="twin-header">
                    <h3>🔮 Sistema de Gêmeo Digital Preditivo</h3>
                    <div class="twin-status">
                        <div class="status-indicator ${this.isInitialized ? 'active' : 'inactive'}"></div>
                        <span>Sistema ${this.isInitialized ? 'Ativo' : 'Inativo'}</span>
                    </div>
                </div>
                
                <div class="twin-stats">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h4>${twinsArray.length}</h4>
                            <p>Gêmeos Digitais</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔄</div>
                        <div class="stat-info">
                            <h4>${simulationsArray.length}</h4>
                            <p>Simulações Ativas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h4>${this.scenarios.length}</h4>
                            <p>Cenários</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <h4>${twinsArray.filter(t => t.predictions).length}</h4>
                            <p>Com Predições</p>
                        </div>
                    </div>
                </div>
                
                <div class="twins-grid">
                    ${twinsArray.map(twin => this.renderTwinCard(twin)).join('')}
                </div>
                
                <div class="simulations-section">
                    <h4>🔄 Simulações Recentes</h4>
                    <div class="simulations-list">
                        ${simulationsArray.map(sim => this.renderSimulationCard(sim)).join('')}
                    </div>
                </div>
                
                <div class="scenarios-section">
                    <h4>📊 Cenários de Otimização</h4>
                    <div class="scenarios-grid">
                        ${this.scenarios.map(scenario => this.renderScenarioCard(scenario)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderTwinCard(twin) {
        const lastUpdate = new Date(twin.lastUpdate).toLocaleString();
        const parametersCount = Object.keys(twin.parameters).length;
        const hasSimulation = twin.lastSimulation ? this.simulations.get(twin.lastSimulation) : null;
        
        return `
            <div class="twin-card twin-${twin.type}">
                <div class="twin-header">
                    <div class="twin-icon">${this.getTwinIcon(twin.type)}</div>
                    <div class="twin-info">
                        <h4>${twin.name}</h4>
                        <div class="twin-type">${twin.type}</div>
                    </div>
                    <div class="twin-status status-${twin.status}">
                        ${this.getStatusIcon(twin.status)}
                    </div>
                </div>
                
                <div class="twin-parameters">
                    <h5>Parâmetros Principais</h5>
                    <div class="parameters-grid">
                        ${Object.entries(twin.parameters).slice(0, 4).map(([key, value]) => `
                            <div class="parameter-item">
                                <span class="parameter-name">${key}</span>
                                <span class="parameter-value">${typeof value === 'number' ? value.toFixed(1) : value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${twin.predictions ? `
                    <div class="twin-predictions">
                        <h5>🔮 Predições (7 dias)</h5>
                        <div class="predictions-summary">
                            ${Object.entries(twin.predictions.shortTerm).slice(0, 2).map(([param, pred]) => `
                                <div class="prediction-item">
                                    <span class="prediction-param">${param}</span>
                                    <span class="prediction-value">${pred?.value?.toFixed(1) || 'N/A'}</span>
                                    <span class="prediction-trend trend-${pred?.trend || 'stable'}">
                                        ${this.getTrendIcon(pred?.trend || 'stable')}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="prediction-confidence">
                            Confiança: ${(twin.predictions.confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                ` : ''}
                
                <div class="twin-actions">
                    <button class="btn-simulate" onclick="window.regenPlatform.digitalTwinSystem.runSimulation('${twin.id}')">
                        🔄 Simular
                    </button>
                    <button class="btn-optimize" onclick="window.regenPlatform.digitalTwinSystem.optimize('${twin.id}')">
                        🎯 Otimizar
                    </button>
                </div>
                
                <div class="twin-footer">
                    <span class="last-update">Atualizado: ${lastUpdate}</span>
                </div>
            </div>
        `;
    }

    renderSimulationCard(simulation) {
        const twin = this.twins.get(simulation.twinId);
        const duration = simulation.duration || 0;
        const scenariosCount = simulation.scenarios?.length || 0;
        
        return `
            <div class="simulation-card">
                <div class="simulation-header">
                    <div class="simulation-icon">🔄</div>
                    <div class="simulation-info">
                        <h5>Simulação: ${twin?.name || simulation.twinId}</h5>
                        <div class="simulation-id">${simulation.id}</div>
                    </div>
                    <div class="simulation-duration">
                        ${duration}ms
                    </div>
                </div>
                
                <div class="simulation-details">
                    <div class="detail-item">
                        <span class="detail-label">Cenários:</span>
                        <span class="detail-value">${scenariosCount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Steps:</span>
                        <span class="detail-value">${simulation.steps}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Iniciado:</span>
                        <span class="detail-value">${new Date(simulation.startTime).toLocaleTimeString()}</span>
                    </div>
                </div>
                
                ${simulation.results && simulation.results.length > 0 ? `
                    <div class="simulation-results">
                        <h6>Resultados Principais</h6>
                        <div class="results-summary">
                            ${simulation.results.slice(0, 2).map(result => `
                                <div class="result-item">
                                    <span class="result-scenario">${result.scenario}</span>
                                    <span class="result-trend trend-${result.summary?.overallTrend || 'stable'}">
                                        ${this.getTrendIcon(result.summary?.overallTrend || 'stable')}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderScenarioCard(scenario) {
        return `
            <div class="scenario-card">
                <div class="scenario-header">
                    <div class="scenario-icon">${this.getScenarioIcon(scenario.objective)}</div>
                    <div class="scenario-info">
                        <h5>${scenario.name}</h5>
                        <div class="scenario-description">${scenario.description}</div>
                    </div>
                </div>
                
                <div class="scenario-details">
                    <div class="detail-item">
                        <span class="detail-label">Objetivo:</span>
                        <span class="detail-value">${scenario.objective}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Variáveis:</span>
                        <span class="detail-value">${Array.isArray(scenario.variables) ? scenario.variables.length : 'Todas'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Restrições:</span>
                        <span class="detail-value">${Object.keys(scenario.constraints).length}</span>
                    </div>
                </div>
                
                <div class="scenario-actions">
                    <button class="btn-run-scenario" onclick="window.regenPlatform.digitalTwinSystem.runOptimization('${scenario.id}')">
                        ▶️ Executar
                    </button>
                </div>
            </div>
        `;
    }

    getTwinIcon(type) {
        const icons = {
            environmental: '🌍',
            agricultural: '🌾',
            industrial: '🏭',
            urban: '🏙️',
            energy: '⚡'
        };
        return icons[type] || '🔮';
    }

    getStatusIcon(status) {
        const icons = {
            active: '🟢',
            inactive: '🔴',
            simulating: '🟡',
            error: '❌'
        };
        return icons[status] || '❓';
    }

    getTrendIcon(trend) {
        const icons = {
            increasing: '📈',
            decreasing: '📉',
            stable: '➡️',
            improving: '📈',
            declining: '📉'
        };
        return icons[trend] || '➡️';
    }

    getScenarioIcon(objective) {
        const icons = {
            maximize: '📈',
            minimize: '📉',
            balance: '⚖️',
            optimize: '🎯'
        };
        return icons[objective] || '🎯';
    }

    async optimize(twinId) {
        this.logger.info(`Iniciando otimização para ${twinId}`);
        // Implementar lógica de otimização
    }

    async runOptimization(scenarioId) {
        this.logger.info(`Executando cenário de otimização ${scenarioId}`);
        // Implementar execução de cenário
    }

    exportData() {
        return {
            twins: Object.fromEntries(this.twins),
            simulations: Object.fromEntries(this.simulations),
            scenarios: this.scenarios,
            optimizations: Object.fromEntries(this.optimizations)
        };
    }

    destroy() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
        
        if (this.predictionInterval) {
            clearInterval(this.predictionInterval);
        }
        
        this.logger.info('Sistema de Gêmeo Digital destruído');
    }
}

export default DigitalTwinSystem;