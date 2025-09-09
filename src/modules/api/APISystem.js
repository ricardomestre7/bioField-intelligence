/**
 * Sistema de APIs Escaláveis e Microserviços
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../../utils/Logger.js';

export class APISystem {
    constructor(config = {}) {
        this.config = {
            baseUrl: config.baseUrl || 'https://api.regentech.com',
            version: config.version || 'v2',
            timeout: config.timeout || 30000,
            retryAttempts: config.retryAttempts || 3,
            enableCaching: config.enableCaching !== false,
            enableRateLimit: config.enableRateLimit !== false,
            enableAuth: config.enableAuth !== false,
            ...config
        };
        
        this.logger = new Logger('APISystem');
        this.isInitialized = false;
        this.endpoints = new Map();
        this.microservices = new Map();
        this.cache = new Map();
        this.rateLimiter = new Map();
        this.authTokens = new Map();
        
        this.initializeAPIs();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema de APIs...');
            
            // Registrar endpoints
            await this.registerEndpoints();
            
            // Inicializar microserviços
            await this.initializeMicroservices();
            
            // Configurar autenticação
            if (this.config.enableAuth) {
                await this.setupAuthentication();
            }
            
            // Configurar rate limiting
            if (this.config.enableRateLimit) {
                this.setupRateLimit();
            }
            
            // Testar conectividade
            await this.testConnectivity();
            
            this.isInitialized = true;
            this.logger.success('Sistema de APIs inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema de APIs:', error);
            throw error;
        }
    }

    initializeAPIs() {
        // Configurações iniciais das APIs
        this.apiConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'RegenTech-Platform/2.0.0'
            },
            interceptors: {
                request: [],
                response: []
            },
            middleware: []
        };
        
        // Estatísticas de uso
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHits: 0,
            rateLimitHits: 0
        };
    }

    async registerEndpoints() {
        try {
            this.logger.info('Registrando endpoints da API...');
            
            // Endpoints de Métricas
            this.endpoints.set('metrics', {
                name: 'Metrics API',
                baseUrl: `${this.config.baseUrl}/${this.config.version}/metrics`,
                methods: {
                    getAll: { method: 'GET', path: '/' },
                    getById: { method: 'GET', path: '/{id}' },
                    create: { method: 'POST', path: '/' },
                    update: { method: 'PUT', path: '/{id}' },
                    delete: { method: 'DELETE', path: '/{id}' },
                    aggregate: { method: 'POST', path: '/aggregate' },
                    predict: { method: 'POST', path: '/predict' }
                },
                rateLimit: { requests: 1000, window: 3600 }, // 1000 req/hour
                cacheEnabled: true,
                cacheTTL: 300 // 5 minutes
            });
            
            // Endpoints de Blockchain
            this.endpoints.set('blockchain', {
                name: 'Blockchain API',
                baseUrl: `${this.config.baseUrl}/${this.config.version}/blockchain`,
                methods: {
                    getCertificates: { method: 'GET', path: '/certificates' },
                    issueCertificate: { method: 'POST', path: '/certificates' },
                    verifyCertificate: { method: 'GET', path: '/certificates/{id}/verify' },
                    getTransactions: { method: 'GET', path: '/transactions' },
                    getValidators: { method: 'GET', path: '/validators' }
                },
                rateLimit: { requests: 500, window: 3600 },
                cacheEnabled: true,
                cacheTTL: 600 // 10 minutes
            });
            
            // Endpoints de IoT
            this.endpoints.set('iot', {
                name: 'IoT API',
                baseUrl: `${this.config.baseUrl}/${this.config.version}/iot`,
                methods: {
                    getSensors: { method: 'GET', path: '/sensors' },
                    getSensorData: { method: 'GET', path: '/sensors/{id}/data' },
                    updateSensor: { method: 'PUT', path: '/sensors/{id}' },
                    getGateways: { method: 'GET', path: '/gateways' },
                    sendCommand: { method: 'POST', path: '/commands' }
                },
                rateLimit: { requests: 2000, window: 3600 },
                cacheEnabled: true,
                cacheTTL: 60 // 1 minute
            });
            
            // Endpoints de Digital Twin
            this.endpoints.set('digitaltwin', {
                name: 'Digital Twin API',
                baseUrl: `${this.config.baseUrl}/${this.config.version}/twins`,
                methods: {
                    getTwins: { method: 'GET', path: '/' },
                    getTwin: { method: 'GET', path: '/{id}' },
                    simulate: { method: 'POST', path: '/{id}/simulate' },
                    predict: { method: 'POST', path: '/{id}/predict' },
                    optimize: { method: 'POST', path: '/{id}/optimize' }
                },
                rateLimit: { requests: 200, window: 3600 },
                cacheEnabled: true,
                cacheTTL: 900 // 15 minutes
            });
            
            // Endpoints de Marketplace
            this.endpoints.set('marketplace', {
                name: 'Marketplace API',
                baseUrl: `${this.config.baseUrl}/${this.config.version}/marketplace`,
                methods: {
                    getProducts: { method: 'GET', path: '/products' },
                    getProduct: { method: 'GET', path: '/products/{id}' },
                    createProduct: { method: 'POST', path: '/products' },
                    updateProduct: { method: 'PUT', path: '/products/{id}' },
                    deleteProduct: { method: 'DELETE', path: '/products/{id}' },
                    search: { method: 'GET', path: '/search' },
                    getOrders: { method: 'GET', path: '/orders' },
                    createOrder: { method: 'POST', path: '/orders' }
                },
                rateLimit: { requests: 1500, window: 3600 },
                cacheEnabled: true,
                cacheTTL: 180 // 3 minutes
            });
            
            this.logger.success(`${this.endpoints.size} endpoints registrados`);
            
        } catch (error) {
            this.logger.error('Erro ao registrar endpoints:', error);
        }
    }

    async initializeMicroservices() {
        try {
            this.logger.info('Inicializando microserviços...');
            
            // Microserviço de Processamento de Dados
            this.microservices.set('data-processor', {
                name: 'Data Processor Service',
                url: 'http://data-processor:8001',
                status: 'active',
                health: 'healthy',
                version: '1.2.0',
                capabilities: ['data-transformation', 'aggregation', 'validation'],
                lastHealthCheck: Date.now(),
                metrics: {
                    requests: 0,
                    errors: 0,
                    avgResponseTime: 0
                }
            });
            
            // Microserviço de Machine Learning
            this.microservices.set('ml-engine', {
                name: 'ML Engine Service',
                url: 'http://ml-engine:8002',
                status: 'active',
                health: 'healthy',
                version: '2.1.0',
                capabilities: ['prediction', 'classification', 'optimization'],
                lastHealthCheck: Date.now(),
                metrics: {
                    requests: 0,
                    errors: 0,
                    avgResponseTime: 0
                }
            });
            
            // Microserviço de Notificações
            this.microservices.set('notification', {
                name: 'Notification Service',
                url: 'http://notification:8003',
                status: 'active',
                health: 'healthy',
                version: '1.0.5',
                capabilities: ['email', 'sms', 'push', 'webhook'],
                lastHealthCheck: Date.now(),
                metrics: {
                    requests: 0,
                    errors: 0,
                    avgResponseTime: 0
                }
            });
            
            // Microserviço de Relatórios
            this.microservices.set('reporting', {
                name: 'Reporting Service',
                url: 'http://reporting:8004',
                status: 'active',
                health: 'healthy',
                version: '1.1.2',
                capabilities: ['pdf-generation', 'charts', 'export', 'scheduling'],
                lastHealthCheck: Date.now(),
                metrics: {
                    requests: 0,
                    errors: 0,
                    avgResponseTime: 0
                }
            });
            
            // Microserviço de Autenticação
            this.microservices.set('auth', {
                name: 'Authentication Service',
                url: 'http://auth:8005',
                status: 'active',
                health: 'healthy',
                version: '2.0.1',
                capabilities: ['jwt', 'oauth2', 'rbac', 'mfa'],
                lastHealthCheck: Date.now(),
                metrics: {
                    requests: 0,
                    errors: 0,
                    avgResponseTime: 0
                }
            });
            
            // Configurar health checks
            this.setupHealthChecks();
            
            this.logger.success(`${this.microservices.size} microserviços inicializados`);
            
        } catch (error) {
            this.logger.error('Erro ao inicializar microserviços:', error);
        }
    }

    setupHealthChecks() {
        // Health check a cada 30 segundos
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, 30000);
    }

    async performHealthChecks() {
        try {
            for (const [serviceId, service] of this.microservices) {
                const startTime = Date.now();
                
                try {
                    // Simular health check
                    const isHealthy = Math.random() > 0.05; // 95% uptime
                    
                    service.health = isHealthy ? 'healthy' : 'unhealthy';
                    service.status = isHealthy ? 'active' : 'degraded';
                    service.lastHealthCheck = Date.now();
                    service.responseTime = Date.now() - startTime;
                    
                    if (!isHealthy) {
                        this.logger.warn(`Microserviço ${service.name} não está saudável`);
                    }
                    
                } catch (error) {
                    service.health = 'unhealthy';
                    service.status = 'error';
                    service.lastHealthCheck = Date.now();
                    this.logger.error(`Health check falhou para ${service.name}:`, error);
                }
            }
            
        } catch (error) {
            this.logger.error('Erro durante health checks:', error);
        }
    }

    async setupAuthentication() {
        try {
            this.logger.info('Configurando autenticação...');
            
            // Simular obtenção de tokens
            this.authTokens.set('api_key', {
                type: 'api_key',
                value: 'regen_' + Math.random().toString(36).substr(2, 32),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
                scopes: ['read', 'write', 'admin']
            });
            
            this.authTokens.set('jwt', {
                type: 'jwt',
                value: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                expiresAt: Date.now() + (60 * 60 * 1000), // 1 hora
                scopes: ['read', 'write']
            });
            
            this.logger.success('Autenticação configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar autenticação:', error);
        }
    }

    setupRateLimit() {
        // Configurar rate limiting para cada endpoint
        for (const [endpointId, endpoint] of this.endpoints) {
            if (endpoint.rateLimit) {
                this.rateLimiter.set(endpointId, {
                    requests: 0,
                    window: endpoint.rateLimit.window * 1000, // converter para ms
                    limit: endpoint.rateLimit.requests,
                    resetTime: Date.now() + (endpoint.rateLimit.window * 1000)
                });
            }
        }
        
        // Reset rate limits periodicamente
        this.rateLimitInterval = setInterval(() => {
            this.resetRateLimits();
        }, 60000); // a cada minuto
    }

    resetRateLimits() {
        const now = Date.now();
        
        for (const [endpointId, limiter] of this.rateLimiter) {
            if (now >= limiter.resetTime) {
                limiter.requests = 0;
                limiter.resetTime = now + limiter.window;
            }
        }
    }

    async testConnectivity() {
        try {
            this.logger.info('Testando conectividade das APIs...');
            
            // Simular teste de conectividade
            const testResults = [];
            
            for (const [endpointId, endpoint] of this.endpoints) {
                const startTime = Date.now();
                
                try {
                    // Simular requisição de teste
                    const success = Math.random() > 0.1; // 90% success rate
                    const responseTime = Math.random() * 1000 + 100; // 100-1100ms
                    
                    testResults.push({
                        endpoint: endpointId,
                        success,
                        responseTime,
                        timestamp: Date.now()
                    });
                    
                    if (success) {
                        this.logger.debug(`${endpoint.name}: OK (${responseTime.toFixed(0)}ms)`);
                    } else {
                        this.logger.warn(`${endpoint.name}: FALHA`);
                    }
                    
                } catch (error) {
                    testResults.push({
                        endpoint: endpointId,
                        success: false,
                        error: error.message,
                        timestamp: Date.now()
                    });
                }
            }
            
            const successRate = (testResults.filter(r => r.success).length / testResults.length) * 100;
            this.logger.info(`Teste de conectividade concluído: ${successRate.toFixed(1)}% sucesso`);
            
        } catch (error) {
            this.logger.error('Erro no teste de conectividade:', error);
        }
    }

    async makeRequest(endpointId, method, path = '', data = null, options = {}) {
        try {
            const startTime = Date.now();
            this.stats.totalRequests++;
            
            // Verificar rate limit
            if (this.config.enableRateLimit && !this.checkRateLimit(endpointId)) {
                this.stats.rateLimitHits++;
                throw new Error('Rate limit exceeded');
            }
            
            // Verificar cache
            if (this.config.enableCaching && method === 'GET') {
                const cached = this.getFromCache(endpointId, path);
                if (cached) {
                    this.stats.cacheHits++;
                    return cached;
                }
            }
            
            const endpoint = this.endpoints.get(endpointId);
            if (!endpoint) {
                throw new Error(`Endpoint ${endpointId} não encontrado`);
            }
            
            // Construir URL
            const url = `${endpoint.baseUrl}${path}`;
            
            // Preparar headers
            const headers = {
                ...this.apiConfig.headers,
                ...options.headers
            };
            
            // Adicionar autenticação
            if (this.config.enableAuth) {
                const authToken = this.authTokens.get('api_key');
                if (authToken && authToken.expiresAt > Date.now()) {
                    headers['Authorization'] = `Bearer ${authToken.value}`;
                }
            }
            
            // Simular requisição HTTP
            const response = await this.simulateHttpRequest({
                method,
                url,
                headers,
                data,
                timeout: this.config.timeout
            });
            
            // Atualizar estatísticas
            const responseTime = Date.now() - startTime;
            this.updateStats(true, responseTime);
            
            // Atualizar rate limit
            if (this.config.enableRateLimit) {
                this.updateRateLimit(endpointId);
            }
            
            // Cachear resposta se aplicável
            if (this.config.enableCaching && method === 'GET' && response.status === 200) {
                this.setCache(endpointId, path, response.data, endpoint.cacheTTL);
            }
            
            this.logger.debug(`${method} ${url}: ${response.status} (${responseTime}ms)`);
            
            return response;
            
        } catch (error) {
            this.updateStats(false, Date.now() - startTime);
            this.logger.error(`Erro na requisição ${endpointId}:`, error);
            throw error;
        }
    }

    async simulateHttpRequest(config) {
        // Simular latência de rede
        const latency = Math.random() * 500 + 100; // 100-600ms
        await new Promise(resolve => setTimeout(resolve, latency));
        
        // Simular diferentes tipos de resposta
        const successRate = 0.95; // 95% success rate
        const isSuccess = Math.random() < successRate;
        
        if (!isSuccess) {
            const errorTypes = [400, 401, 403, 404, 500, 502, 503];
            const errorStatus = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            throw new Error(`HTTP ${errorStatus}`);
        }
        
        // Gerar dados de resposta simulados
        const responseData = this.generateMockResponse(config.url, config.method);
        
        return {
            status: 200,
            statusText: 'OK',
            data: responseData,
            headers: {
                'content-type': 'application/json',
                'x-response-time': `${latency}ms`
            }
        };
    }

    generateMockResponse(url, method) {
        // Gerar dados mock baseados na URL e método
        if (url.includes('/metrics')) {
            return {
                metrics: [
                    { id: 'carbon', value: 850, unit: 'tCO₂eq', timestamp: Date.now() },
                    { id: 'energy', value: 8500, unit: 'kWh', timestamp: Date.now() },
                    { id: 'water', value: 42000, unit: 'L', timestamp: Date.now() }
                ],
                total: 3,
                page: 1
            };
        } else if (url.includes('/blockchain')) {
            return {
                certificates: [
                    { id: 'cert_001', type: 'carbon_offset', status: 'active' },
                    { id: 'cert_002', type: 'renewable_energy', status: 'active' }
                ],
                total: 2
            };
        } else if (url.includes('/iot')) {
            return {
                sensors: [
                    { id: 'sensor_001', type: 'temperature', value: 22.5, status: 'online' },
                    { id: 'sensor_002', type: 'humidity', value: 65, status: 'online' }
                ],
                total: 2
            };
        } else if (url.includes('/twins')) {
            return {
                twins: [
                    { id: 'twin_001', name: 'Ecossistema', status: 'active' },
                    { id: 'twin_002', name: 'Fazenda', status: 'active' }
                ],
                total: 2
            };
        } else if (url.includes('/marketplace')) {
            return {
                products: [
                    { id: 'prod_001', name: 'Crédito de Carbono', price: 25.50 },
                    { id: 'prod_002', name: 'Energia Solar', price: 0.15 }
                ],
                total: 2
            };
        }
        
        return { message: 'Success', timestamp: Date.now() };
    }

    checkRateLimit(endpointId) {
        const limiter = this.rateLimiter.get(endpointId);
        if (!limiter) return true;
        
        const now = Date.now();
        
        // Reset se necessário
        if (now >= limiter.resetTime) {
            limiter.requests = 0;
            limiter.resetTime = now + limiter.window;
        }
        
        return limiter.requests < limiter.limit;
    }

    updateRateLimit(endpointId) {
        const limiter = this.rateLimiter.get(endpointId);
        if (limiter) {
            limiter.requests++;
        }
    }

    getFromCache(endpointId, path) {
        const cacheKey = `${endpointId}:${path}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        
        // Remove cache expirado
        if (cached) {
            this.cache.delete(cacheKey);
        }
        
        return null;
    }

    setCache(endpointId, path, data, ttl) {
        const cacheKey = `${endpointId}:${path}`;
        this.cache.set(cacheKey, {
            data,
            expiresAt: Date.now() + (ttl * 1000),
            createdAt: Date.now()
        });
    }

    updateStats(success, responseTime) {
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }
        
        // Atualizar tempo médio de resposta
        const totalRequests = this.stats.successfulRequests + this.stats.failedRequests;
        this.stats.averageResponseTime = (
            (this.stats.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests
        );
    }

    // Métodos de conveniência para cada endpoint
    async getMetrics(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const path = queryString ? `/?${queryString}` : '/';
        return await this.makeRequest('metrics', 'GET', path);
    }

    async createMetric(metricData) {
        return await this.makeRequest('metrics', 'POST', '/', metricData);
    }

    async getCertificates() {
        return await this.makeRequest('blockchain', 'GET', '/certificates');
    }

    async issueCertificate(certificateData) {
        return await this.makeRequest('blockchain', 'POST', '/certificates', certificateData);
    }

    async getSensors() {
        return await this.makeRequest('iot', 'GET', '/sensors');
    }

    async getSensorData(sensorId, timeRange = {}) {
        const queryString = new URLSearchParams(timeRange).toString();
        const path = `/sensors/${sensorId}/data${queryString ? `?${queryString}` : ''}`;
        return await this.makeRequest('iot', 'GET', path);
    }

    async getTwins() {
        return await this.makeRequest('digitaltwin', 'GET', '/');
    }

    async simulateTwin(twinId, scenarios) {
        return await this.makeRequest('digitaltwin', 'POST', `/${twinId}/simulate`, { scenarios });
    }

    async getProducts(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const path = `/products${queryString ? `?${queryString}` : ''}`;
        return await this.makeRequest('marketplace', 'GET', path);
    }

    async createOrder(orderData) {
        return await this.makeRequest('marketplace', 'POST', '/orders', orderData);
    }

    render() {
        const content = document.getElementById('content');
        if (!content) return;
        
        const endpointsArray = Array.from(this.endpoints.values());
        const microservicesArray = Array.from(this.microservices.values());
        const cacheSize = this.cache.size;
        const successRate = this.stats.totalRequests > 0 ? 
            (this.stats.successfulRequests / this.stats.totalRequests * 100) : 0;
        
        content.innerHTML = `
            <div class="api-dashboard">
                <div class="api-header">
                    <h3>🔌 Sistema de APIs e Microserviços</h3>
                    <div class="api-status">
                        <div class="status-indicator ${this.isInitialized ? 'active' : 'inactive'}"></div>
                        <span>Sistema ${this.isInitialized ? 'Ativo' : 'Inativo'}</span>
                    </div>
                </div>
                
                <div class="api-stats">
                    <div class="stat-card">
                        <div class="stat-icon">🔌</div>
                        <div class="stat-info">
                            <h4>${endpointsArray.length}</h4>
                            <p>Endpoints</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚙️</div>
                        <div class="stat-info">
                            <h4>${microservicesArray.length}</h4>
                            <p>Microserviços</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h4>${this.stats.totalRequests}</h4>
                            <p>Requisições</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <h4>${successRate.toFixed(1)}%</h4>
                            <p>Taxa de Sucesso</p>
                        </div>
                    </div>
                </div>
                
                <div class="api-content">
                    <div class="endpoints-section">
                        <h4>🔌 Endpoints da API</h4>
                        <div class="endpoints-grid">
                            ${endpointsArray.map(endpoint => this.renderEndpointCard(endpoint)).join('')}
                        </div>
                    </div>
                    
                    <div class="microservices-section">
                        <h4>⚙️ Microserviços</h4>
                        <div class="microservices-grid">
                            ${microservicesArray.map(service => this.renderMicroserviceCard(service)).join('')}
                        </div>
                    </div>
                    
                    <div class="performance-section">
                        <h4>📈 Performance e Estatísticas</h4>
                        <div class="performance-grid">
                            <div class="performance-card">
                                <h5>📊 Estatísticas Gerais</h5>
                                <div class="stats-list">
                                    <div class="stat-item">
                                        <span class="stat-label">Total de Requisições:</span>
                                        <span class="stat-value">${this.stats.totalRequests}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Requisições Bem-sucedidas:</span>
                                        <span class="stat-value">${this.stats.successfulRequests}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Requisições Falhadas:</span>
                                        <span class="stat-value">${this.stats.failedRequests}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Tempo Médio de Resposta:</span>
                                        <span class="stat-value">${this.stats.averageResponseTime.toFixed(0)}ms</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="performance-card">
                                <h5>🚀 Cache e Rate Limiting</h5>
                                <div class="stats-list">
                                    <div class="stat-item">
                                        <span class="stat-label">Itens em Cache:</span>
                                        <span class="stat-value">${cacheSize}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Cache Hits:</span>
                                        <span class="stat-value">${this.stats.cacheHits}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Rate Limit Hits:</span>
                                        <span class="stat-value">${this.stats.rateLimitHits}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Cache Habilitado:</span>
                                        <span class="stat-value">${this.config.enableCaching ? '✅' : '❌'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEndpointCard(endpoint) {
        const methodsCount = Object.keys(endpoint.methods).length;
        const rateLimitInfo = endpoint.rateLimit ? 
            `${endpoint.rateLimit.requests}/${endpoint.rateLimit.window}s` : 'Sem limite';
        
        return `
            <div class="endpoint-card">
                <div class="endpoint-header">
                    <div class="endpoint-icon">🔌</div>
                    <div class="endpoint-info">
                        <h5>${endpoint.name}</h5>
                        <div class="endpoint-url">${endpoint.baseUrl}</div>
                    </div>
                    <div class="endpoint-status status-active">
                        🟢
                    </div>
                </div>
                
                <div class="endpoint-details">
                    <div class="detail-row">
                        <span class="detail-label">Métodos:</span>
                        <span class="detail-value">${methodsCount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Rate Limit:</span>
                        <span class="detail-value">${rateLimitInfo}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cache:</span>
                        <span class="detail-value">${endpoint.cacheEnabled ? '✅' : '❌'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TTL:</span>
                        <span class="detail-value">${endpoint.cacheTTL || 0}s</span>
                    </div>
                </div>
                
                <div class="endpoint-methods">
                    <h6>Métodos Disponíveis</h6>
                    <div class="methods-list">
                        ${Object.entries(endpoint.methods).slice(0, 4).map(([name, method]) => `
                            <div class="method-item">
                                <span class="method-type method-${method.method.toLowerCase()}">${method.method}</span>
                                <span class="method-name">${name}</span>
                            </div>
                        `).join('')}
                        ${Object.keys(endpoint.methods).length > 4 ? `
                            <div class="method-item">
                                <span class="method-more">+${Object.keys(endpoint.methods).length - 4} mais</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderMicroserviceCard(service) {
        const uptime = service.lastHealthCheck ? 
            ((Date.now() - service.lastHealthCheck) / 1000).toFixed(0) : 0;
        const capabilitiesCount = service.capabilities.length;
        
        return `
            <div class="microservice-card service-${service.health}">
                <div class="service-header">
                    <div class="service-icon">⚙️</div>
                    <div class="service-info">
                        <h5>${service.name}</h5>
                        <div class="service-version">v${service.version}</div>
                    </div>
                    <div class="service-status status-${service.health}">
                        ${this.getHealthIcon(service.health)}
                    </div>
                </div>
                
                <div class="service-details">
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${service.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Saúde:</span>
                        <span class="detail-value">${service.health}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">URL:</span>
                        <span class="detail-value">${service.url}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Último Check:</span>
                        <span class="detail-value">${uptime}s atrás</span>
                    </div>
                </div>
                
                <div class="service-capabilities">
                    <h6>Capacidades (${capabilitiesCount})</h6>
                    <div class="capabilities-list">
                        ${service.capabilities.slice(0, 3).map(capability => `
                            <span class="capability-tag">${capability}</span>
                        `).join('')}
                        ${capabilitiesCount > 3 ? `
                            <span class="capability-more">+${capabilitiesCount - 3}</span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="service-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Requisições:</span>
                        <span class="metric-value">${service.metrics.requests}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Erros:</span>
                        <span class="metric-value">${service.metrics.errors}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Tempo Médio:</span>
                        <span class="metric-value">${service.metrics.avgResponseTime}ms</span>
                    </div>
                </div>
            </div>
        `;
    }

    getHealthIcon(health) {
        const icons = {
            healthy: '🟢',
            unhealthy: '🔴',
            degraded: '🟡',
            unknown: '⚪'
        };
        return icons[health] || '❓';
    }

    exportData() {
        return {
            endpoints: Object.fromEntries(this.endpoints),
            microservices: Object.fromEntries(this.microservices),
            stats: this.stats,
            cache: {
                size: this.cache.size,
                keys: Array.from(this.cache.keys())
            },
            rateLimiter: Object.fromEntries(this.rateLimiter)
        };
    }

    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        if (this.rateLimitInterval) {
            clearInterval(this.rateLimitInterval);
        }
        
        this.logger.info('Sistema de APIs destruído');
    }
}

export default APISystem;