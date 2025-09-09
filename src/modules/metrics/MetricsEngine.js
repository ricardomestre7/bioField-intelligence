/**
 * Engine de Métricas Multidimensionais com IA
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../../utils/Logger.js';

export class MetricsEngine {
    constructor(config = {}) {
        this.config = {
            updateInterval: config.updateInterval || 5000,
            maxDataPoints: config.maxDataPoints || 1000,
            enablePredictions: config.enablePredictions !== false,
            aiModelEndpoint: config.aiModelEndpoint || '/api/ai/predictions',
            categories: config.categories || [],
            ...config
        };
        
        this.logger = new Logger('MetricsEngine');
        this.isInitialized = false;
        this.metrics = new Map();
        this.historicalData = new Map();
        this.predictions = new Map();
        this.alerts = [];
        
        this.initializeMetrics();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Engine de Métricas...');
            
            // Carregar dados históricos
            await this.loadHistoricalData();
            
            // Inicializar modelo de IA
            if (this.config.enablePredictions) {
                await this.initializeAIModel();
            }
            
            // Configurar atualizações automáticas
            this.setupAutoUpdates();
            
            this.isInitialized = true;
            this.logger.success('Engine de Métricas inicializada com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Engine de Métricas:', error);
            throw error;
        }
    }

    initializeMetrics() {
        const defaultMetrics = {
            carbon: {
                current: 0,
                target: 1000,
                unit: 'tCO₂eq',
                trend: 'stable',
                efficiency: 0,
                lastUpdate: Date.now()
            },
            energy: {
                current: 0,
                target: 10000,
                unit: 'kWh',
                trend: 'increasing',
                efficiency: 0,
                lastUpdate: Date.now()
            },
            water: {
                current: 0,
                target: 50000,
                unit: 'L',
                trend: 'decreasing',
                efficiency: 0,
                lastUpdate: Date.now()
            },
            waste: {
                current: 0,
                target: 5000,
                unit: 'kg',
                trend: 'decreasing',
                efficiency: 0,
                lastUpdate: Date.now()
            },
            biodiversity: {
                current: 0,
                target: 100,
                unit: 'índice',
                trend: 'increasing',
                efficiency: 0,
                lastUpdate: Date.now()
            }
        };

        Object.entries(defaultMetrics).forEach(([key, value]) => {
            this.metrics.set(key, value);
            this.historicalData.set(key, []);
        });
    }

    async loadHistoricalData() {
        try {
            // Simular carregamento de dados históricos
            const historicalPeriod = 30; // últimos 30 dias
            const now = Date.now();
            
            for (const [metricKey] of this.metrics) {
                const data = [];
                
                for (let i = historicalPeriod; i >= 0; i--) {
                    const timestamp = now - (i * 24 * 60 * 60 * 1000);
                    const value = this.generateHistoricalValue(metricKey, i);
                    
                    data.push({
                        timestamp,
                        value,
                        date: new Date(timestamp).toISOString().split('T')[0]
                    });
                }
                
                this.historicalData.set(metricKey, data);
            }
            
            this.logger.info('Dados históricos carregados');
            
        } catch (error) {
            this.logger.error('Erro ao carregar dados históricos:', error);
        }
    }

    generateHistoricalValue(metricKey, daysAgo) {
        const baseValues = {
            carbon: 850 + Math.sin(daysAgo * 0.1) * 100 + Math.random() * 50,
            energy: 8500 + Math.cos(daysAgo * 0.15) * 1000 + Math.random() * 200,
            water: 42000 + Math.sin(daysAgo * 0.2) * 5000 + Math.random() * 1000,
            waste: 3200 + Math.cos(daysAgo * 0.12) * 400 + Math.random() * 100,
            biodiversity: 85 + Math.sin(daysAgo * 0.08) * 10 + Math.random() * 5
        };
        
        return Math.max(0, baseValues[metricKey] || 0);
    }

    async initializeAIModel() {
        try {
            this.logger.info('Inicializando modelo de IA para predições...');
            
            // Simular inicialização do modelo de IA
            this.aiModel = {
                isLoaded: true,
                version: '2.1.0',
                accuracy: 0.87,
                lastTrained: new Date().toISOString()
            };
            
            // Gerar predições iniciais
            await this.generatePredictions();
            
            this.logger.success('Modelo de IA inicializado');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar modelo de IA:', error);
        }
    }

    async generatePredictions() {
        if (!this.aiModel?.isLoaded) return;
        
        try {
            for (const [metricKey, metric] of this.metrics) {
                const historical = this.historicalData.get(metricKey) || [];
                
                if (historical.length < 7) continue; // Precisa de pelo menos 7 dias
                
                const prediction = this.calculatePrediction(metricKey, historical);
                this.predictions.set(metricKey, prediction);
            }
            
            this.logger.debug('Predições atualizadas');
            
        } catch (error) {
            this.logger.error('Erro ao gerar predições:', error);
        }
    }

    calculatePrediction(metricKey, historical) {
        // Algoritmo simplificado de predição baseado em tendências
        const recent = historical.slice(-7); // últimos 7 dias
        const older = historical.slice(-14, -7); // 7 dias anteriores
        
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
        
        const trend = recentAvg - olderAvg;
        const volatility = this.calculateVolatility(recent);
        
        // Predições para próximos 7, 30 e 90 dias
        const predictions = {
            next7Days: recentAvg + (trend * 1),
            next30Days: recentAvg + (trend * 4),
            next90Days: recentAvg + (trend * 12),
            confidence: Math.max(0.5, 1 - (volatility / recentAvg)),
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
        };
        
        return predictions;
    }

    calculateVolatility(data) {
        if (data.length < 2) return 0;
        
        const mean = data.reduce((sum, item) => sum + item.value, 0) / data.length;
        const variance = data.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / data.length;
        
        return Math.sqrt(variance);
    }

    setupAutoUpdates() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, this.config.updateInterval);
        
        // Atualizar predições a cada hora
        this.predictionInterval = setInterval(() => {
            this.generatePredictions();
        }, 60 * 60 * 1000);
    }

    update() {
        if (!this.isInitialized) return;
        
        try {
            // Simular atualizações de métricas em tempo real
            for (const [key, metric] of this.metrics) {
                const newValue = this.simulateMetricUpdate(key, metric);
                
                // Atualizar métrica
                metric.current = newValue;
                metric.efficiency = this.calculateEfficiency(key, newValue);
                metric.trend = this.calculateTrend(key);
                metric.lastUpdate = Date.now();
                
                // Adicionar ao histórico
                this.addToHistory(key, newValue);
                
                // Verificar alertas
                this.checkAlerts(key, metric);
            }
            
            this.logger.debug('Métricas atualizadas');
            
        } catch (error) {
            this.logger.error('Erro ao atualizar métricas:', error);
        }
    }

    simulateMetricUpdate(key, metric) {
        const variations = {
            carbon: () => metric.current + (Math.random() - 0.5) * 20,
            energy: () => metric.current + (Math.random() - 0.4) * 100,
            water: () => metric.current + (Math.random() - 0.6) * 500,
            waste: () => metric.current + (Math.random() - 0.7) * 50,
            biodiversity: () => metric.current + (Math.random() - 0.3) * 2
        };
        
        const updateFn = variations[key] || (() => metric.current);
        return Math.max(0, updateFn());
    }

    calculateEfficiency(key, currentValue) {
        const metric = this.metrics.get(key);
        if (!metric) return 0;
        
        // Calcular eficiência baseada no target
        const efficiency = Math.min(100, (currentValue / metric.target) * 100);
        return Math.round(efficiency);
    }

    calculateTrend(key) {
        const historical = this.historicalData.get(key) || [];
        if (historical.length < 2) return 'stable';
        
        const recent = historical.slice(-5); // últimos 5 pontos
        const older = historical.slice(-10, -5); // 5 pontos anteriores
        
        if (recent.length === 0 || older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }

    addToHistory(key, value) {
        const historical = this.historicalData.get(key) || [];
        
        historical.push({
            timestamp: Date.now(),
            value,
            date: new Date().toISOString().split('T')[0]
        });
        
        // Limitar tamanho do histórico
        if (historical.length > this.config.maxDataPoints) {
            historical.splice(0, historical.length - this.config.maxDataPoints);
        }
        
        this.historicalData.set(key, historical);
    }

    checkAlerts(key, metric) {
        const thresholds = {
            carbon: { critical: 1200, warning: 1000 },
            energy: { critical: 12000, warning: 10000 },
            water: { critical: 60000, warning: 50000 },
            waste: { critical: 6000, warning: 5000 },
            biodiversity: { critical: 70, warning: 80 }
        };
        
        const threshold = thresholds[key];
        if (!threshold) return;
        
        const alertId = `${key}-${Date.now()}`;
        
        if (metric.current >= threshold.critical) {
            this.addAlert({
                id: alertId,
                type: 'critical',
                metric: key,
                message: `${key} atingiu nível crítico: ${metric.current} ${metric.unit}`,
                timestamp: Date.now(),
                resolved: false
            });
        } else if (metric.current >= threshold.warning) {
            this.addAlert({
                id: alertId,
                type: 'warning',
                metric: key,
                message: `${key} próximo do limite: ${metric.current} ${metric.unit}`,
                timestamp: Date.now(),
                resolved: false
            });
        }
    }

    addAlert(alert) {
        // Evitar alertas duplicados
        const existingAlert = this.alerts.find(a => 
            a.metric === alert.metric && 
            a.type === alert.type && 
            !a.resolved
        );
        
        if (!existingAlert) {
            this.alerts.unshift(alert);
            this.logger.warn(`Alerta gerado: ${alert.message}`);
            
            // Limitar número de alertas
            if (this.alerts.length > 50) {
                this.alerts = this.alerts.slice(0, 50);
            }
        }
    }

    render() {
        const content = document.getElementById('content');
        if (!content) return;
        
        const metricsArray = Array.from(this.metrics.entries());
        
        content.innerHTML = `
            <div class="metrics-dashboard">
                <div class="metrics-header">
                    <h3>📊 Engine de Métricas Multidimensionais</h3>
                    <div class="metrics-summary">
                        <div class="summary-card">
                            <div class="summary-icon">🎯</div>
                            <div class="summary-info">
                                <h4>${metricsArray.length}</h4>
                                <p>Métricas Ativas</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-icon">🤖</div>
                            <div class="summary-info">
                                <h4>${this.aiModel?.accuracy ? (this.aiModel.accuracy * 100).toFixed(1) : 0}%</h4>
                                <p>Precisão IA</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-icon">⚠️</div>
                            <div class="summary-info">
                                <h4>${this.alerts.filter(a => !a.resolved).length}</h4>
                                <p>Alertas Ativos</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-grid">
                    ${metricsArray.map(([key, metric]) => this.renderMetricCard(key, metric)).join('')}
                </div>
                
                ${this.renderPredictions()}
                ${this.renderAlerts()}
            </div>
        `;
    }

    renderMetricCard(key, metric) {
        const prediction = this.predictions.get(key);
        const historical = this.historicalData.get(key) || [];
        const recentData = historical.slice(-7);
        
        return `
            <div class="metric-card metric-${key}">
                <div class="metric-header">
                    <div class="metric-icon">${this.getMetricIcon(key)}</div>
                    <div class="metric-info">
                        <h4>${this.getMetricName(key)}</h4>
                        <div class="metric-trend trend-${metric.trend}">
                            ${this.getTrendIcon(metric.trend)} ${metric.trend}
                        </div>
                    </div>
                </div>
                
                <div class="metric-value">
                    <span class="current-value">${metric.current.toFixed(1)}</span>
                    <span class="metric-unit">${metric.unit}</span>
                </div>
                
                <div class="metric-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${metric.efficiency}%"></div>
                    </div>
                    <span class="progress-text">${metric.efficiency}% do target</span>
                </div>
                
                ${prediction ? `
                    <div class="metric-prediction">
                        <h5>🔮 Predição (7 dias)</h5>
                        <div class="prediction-value">
                            <span>${prediction.next7Days.toFixed(1)} ${metric.unit}</span>
                            <span class="confidence">(${(prediction.confidence * 100).toFixed(0)}% confiança)</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="metric-chart">
                    <canvas id="chart-${key}" width="300" height="100"></canvas>
                </div>
            </div>
        `;
    }

    renderPredictions() {
        const predictionsArray = Array.from(this.predictions.entries());
        
        if (predictionsArray.length === 0) return '';
        
        return `
            <div class="predictions-section">
                <h4>🔮 Análise Preditiva</h4>
                <div class="predictions-grid">
                    ${predictionsArray.map(([key, prediction]) => `
                        <div class="prediction-card">
                            <div class="prediction-header">
                                <span class="prediction-icon">${this.getMetricIcon(key)}</span>
                                <span class="prediction-name">${this.getMetricName(key)}</span>
                            </div>
                            <div class="prediction-timeline">
                                <div class="timeline-item">
                                    <span class="timeline-label">7 dias</span>
                                    <span class="timeline-value">${prediction.next7Days.toFixed(1)}</span>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-label">30 dias</span>
                                    <span class="timeline-value">${prediction.next30Days.toFixed(1)}</span>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-label">90 dias</span>
                                    <span class="timeline-value">${prediction.next90Days.toFixed(1)}</span>
                                </div>
                            </div>
                            <div class="prediction-confidence">
                                Confiança: ${(prediction.confidence * 100).toFixed(0)}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAlerts() {
        const activeAlerts = this.alerts.filter(a => !a.resolved).slice(0, 5);
        
        if (activeAlerts.length === 0) {
            return `
                <div class="alerts-section">
                    <h4>⚠️ Alertas do Sistema</h4>
                    <div class="no-alerts">
                        <span class="no-alerts-icon">✅</span>
                        <span>Nenhum alerta ativo no momento</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="alerts-section">
                <h4>⚠️ Alertas do Sistema (${activeAlerts.length})</h4>
                <div class="alerts-list">
                    ${activeAlerts.map(alert => `
                        <div class="alert-item alert-${alert.type}">
                            <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                            <div class="alert-content">
                                <div class="alert-message">${alert.message}</div>
                                <div class="alert-time">${new Date(alert.timestamp).toLocaleString()}</div>
                            </div>
                            <button class="alert-dismiss" onclick="window.regenPlatform.metricsEngine.resolveAlert('${alert.id}')">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getMetricIcon(key) {
        const icons = {
            carbon: '🌱',
            energy: '⚡',
            water: '💧',
            waste: '♻️',
            biodiversity: '🦋'
        };
        return icons[key] || '📊';
    }

    getMetricName(key) {
        const names = {
            carbon: 'Carbono',
            energy: 'Energia',
            water: 'Água',
            waste: 'Resíduos',
            biodiversity: 'Biodiversidade'
        };
        return names[key] || key;
    }

    getTrendIcon(trend) {
        const icons = {
            increasing: '📈',
            decreasing: '📉',
            stable: '➡️'
        };
        return icons[trend] || '➡️';
    }

    getAlertIcon(type) {
        const icons = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            this.logger.info(`Alerta resolvido: ${alert.message}`);
            this.render(); // Re-render para atualizar UI
        }
    }

    exportData() {
        return {
            metrics: Object.fromEntries(this.metrics),
            historical: Object.fromEntries(this.historicalData),
            predictions: Object.fromEntries(this.predictions),
            alerts: this.alerts,
            aiModel: this.aiModel
        };
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.predictionInterval) {
            clearInterval(this.predictionInterval);
        }
        
        this.logger.info('Engine de Métricas destruída');
    }
}

export default MetricsEngine;