/**
 * Plataforma Regenerativa Inteligente - Classe Principal
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { MetricsEngine } from '../modules/metrics/MetricsEngine.js';
import { BlockchainSystem } from '../modules/blockchain/BlockchainSystem.js';
import { DigitalTwin } from '../modules/digital-twin/DigitalTwin.js';
import { APIServices } from '../modules/api/APIServices.js';
import { IoTSystem } from '../modules/iot/IoTSystem.js';
import { Marketplace } from '../modules/marketplace/Marketplace.js';
import { NavigationManager } from '../components/navigation/NavigationManager.js';
import { UIManager } from '../components/ui/UIManager.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { Logger } from '../utils/Logger.js';

export class RegenPlatform {
    constructor() {
        this.config = new ConfigManager();
        this.logger = new Logger('RegenPlatform');
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        
        // Inicializar módulos
        this.initializeModules();
        this.init();
    }

    initializeModules() {
        try {
            this.metricsEngine = new MetricsEngine(this.config.get('metrics'));
            this.blockchain = new BlockchainSystem(this.config.get('blockchain'));
            this.digitalTwin = new DigitalTwin(this.config.get('digitalTwin'));
            this.apiServices = new APIServices(this.config.get('api'));
            this.iotSystem = new IoTSystem(this.config.get('iot'));
            this.marketplace = new Marketplace(this.config.get('marketplace'));
            
            // Componentes de UI
            this.navigationManager = new NavigationManager(this);
            this.uiManager = new UIManager(this);
            
            this.logger.info('Módulos inicializados com sucesso');
        } catch (error) {
            this.logger.error('Erro ao inicializar módulos:', error);
            throw error;
        }
    }

    async init() {
        try {
            this.logger.info('Iniciando Plataforma Regenerativa Inteligente v2.0.0');
            
            // Inicializar sistemas em ordem de dependência
            await this.metricsEngine.initialize();
            await this.blockchain.initialize();
            await this.digitalTwin.initialize();
            await this.apiServices.initialize();
            await this.iotSystem.initialize();
            await this.marketplace.initialize();
            
            // Configurar navegação e UI
            this.navigationManager.setup();
            this.uiManager.initialize();
            
            // Iniciar atualizações em tempo real
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            this.logger.success('🌱 Plataforma inicializada com sucesso!');
            
            // Emitir evento de inicialização
            this.emit('platform:initialized');
            
        } catch (error) {
            this.logger.error('Erro crítico na inicialização:', error);
            this.handleInitializationError(error);
        }
    }

    startRealTimeUpdates() {
        // Atualizar métricas a cada 5 segundos
        setInterval(() => {
            if (this.isInitialized) {
                this.metricsEngine.update();
                this.digitalTwin.simulate();
                this.iotSystem.updateSensors();
            }
        }, 5000);

        // Atualizar blockchain a cada 30 segundos
        setInterval(() => {
            if (this.isInitialized) {
                this.blockchain.processTransactions();
            }
        }, 30000);

        // Atualizar APIs a cada 10 segundos
        setInterval(() => {
            if (this.isInitialized) {
                this.apiServices.updateMetrics();
            }
        }, 10000);
    }

    switchSection(sectionId) {
        if (!this.isInitialized) {
            this.logger.warn('Plataforma não inicializada');
            return;
        }

        this.logger.info(`Mudando para seção: ${sectionId}`);
        this.currentSection = sectionId;
        this.navigationManager.activateSection(sectionId);
        this.initializeSection(sectionId);
    }

    initializeSection(sectionId) {
        const sectionMap = {
            'dashboard': () => this.uiManager.renderDashboard(),
            'metrics': () => this.metricsEngine.render(),
            'blockchain': () => this.blockchain.render(),
            'twin': () => this.digitalTwin.render(),
            'api': () => this.apiServices.render(),
            'iot': () => this.iotSystem.render(),
            'marketplace': () => this.marketplace.render()
        };

        const renderFunction = sectionMap[sectionId];
        if (renderFunction) {
            renderFunction();
        } else {
            this.logger.warn(`Seção não encontrada: ${sectionId}`);
        }
    }

    handleInitializationError(error) {
        const errorMessage = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2>Erro de Inicialização</h2>
                <p>Ocorreu um erro ao inicializar a plataforma:</p>
                <pre>${error.message}</pre>
                <button onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = errorMessage;
        }
    }

    // Sistema de eventos simples
    emit(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }

    // Métodos de utilidade
    getModuleStatus() {
        return {
            metricsEngine: this.metricsEngine?.isInitialized || false,
            blockchain: this.blockchain?.isInitialized || false,
            digitalTwin: this.digitalTwin?.isInitialized || false,
            apiServices: this.apiServices?.isInitialized || false,
            iotSystem: this.iotSystem?.isInitialized || false,
            marketplace: this.marketplace?.isInitialized || false
        };
    }

    exportData(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            platform: {
                version: '2.0.0',
                status: this.isInitialized ? 'active' : 'inactive',
                currentSection: this.currentSection
            },
            modules: this.getModuleStatus(),
            metrics: this.metricsEngine?.exportData(),
            blockchain: this.blockchain?.exportData(),
            iot: this.iotSystem?.exportData(),
            marketplace: this.marketplace?.exportData()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }
        
        return data;
    }

    destroy() {
        this.logger.info('Destruindo plataforma...');
        
        // Limpar intervalos
        clearInterval(this.metricsUpdateInterval);
        clearInterval(this.blockchainUpdateInterval);
        clearInterval(this.apiUpdateInterval);
        
        // Destruir módulos
        this.metricsEngine?.destroy();
        this.blockchain?.destroy();
        this.digitalTwin?.destroy();
        this.apiServices?.destroy();
        this.iotSystem?.destroy();
        this.marketplace?.destroy();
        
        this.isInitialized = false;
        this.logger.info('Plataforma destruída');
    }
}

// Exportar instância global
window.RegenPlatform = RegenPlatform;