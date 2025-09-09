/**
 * Gerenciador de Navegação da Plataforma
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../utils/Logger.js';

export class NavigationManager {
    constructor(config = {}) {
        this.config = {
            enableAnimations: config.enableAnimations !== false,
            enableKeyboardNavigation: config.enableKeyboardNavigation !== false,
            enableBreadcrumbs: config.enableBreadcrumbs !== false,
            enableHistory: config.enableHistory !== false,
            defaultSection: config.defaultSection || 'dashboard',
            ...config
        };
        
        this.logger = new Logger('NavigationManager');
        this.isInitialized = false;
        this.currentSection = null;
        this.previousSection = null;
        this.navigationHistory = [];
        this.breadcrumbs = [];
        this.sections = new Map();
        this.navigationListeners = new Map();
        
        this.initializeNavigation();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Gerenciador de Navegação...');
            
            // Registrar seções
            this.registerSections();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Configurar navegação por teclado
            if (this.config.enableKeyboardNavigation) {
                this.setupKeyboardNavigation();
            }
            
            // Configurar histórico do navegador
            if (this.config.enableHistory) {
                this.setupBrowserHistory();
            }
            
            // Navegar para seção inicial
            await this.navigateToSection(this.config.defaultSection);
            
            this.isInitialized = true;
            this.logger.success('Gerenciador de Navegação inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Gerenciador de Navegação:', error);
            throw error;
        }
    }

    initializeNavigation() {
        // Configurações de animação
        this.animationConfig = {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fadeIn: 'fadeIn 0.3s ease-in-out',
            fadeOut: 'fadeOut 0.3s ease-in-out',
            slideIn: 'slideIn 0.3s ease-in-out',
            slideOut: 'slideOut 0.3s ease-in-out'
        };
        
        // Estado da navegação
        this.navigationState = {
            isNavigating: false,
            lastNavigationTime: 0,
            navigationCount: 0,
            errors: []
        };
    }

    registerSections() {
        try {
            this.logger.info('Registrando seções da aplicação...');
            
            // Dashboard Principal
            this.sections.set('dashboard', {
                id: 'dashboard',
                name: 'Dashboard',
                title: 'Painel Principal',
                icon: '🏠',
                description: 'Visão geral da plataforma regenerativa',
                path: '/dashboard',
                component: 'DashboardComponent',
                permissions: ['read'],
                isDefault: true,
                showInMenu: true,
                order: 1,
                breadcrumb: 'Início'
            });
            
            // Métricas e Analytics
            this.sections.set('metrics', {
                id: 'metrics',
                name: 'Métricas',
                title: 'Métricas e Analytics',
                icon: '📊',
                description: 'Análise de métricas ambientais e de sustentabilidade',
                path: '/metrics',
                component: 'MetricsComponent',
                permissions: ['read', 'analytics'],
                showInMenu: true,
                order: 2,
                breadcrumb: 'Métricas',
                subSections: [
                    { id: 'carbon', name: 'Carbono', path: '/metrics/carbon' },
                    { id: 'energy', name: 'Energia', path: '/metrics/energy' },
                    { id: 'water', name: 'Água', path: '/metrics/water' },
                    { id: 'biodiversity', name: 'Biodiversidade', path: '/metrics/biodiversity' }
                ]
            });
            
            // Blockchain e Certificação
            this.sections.set('blockchain', {
                id: 'blockchain',
                name: 'Blockchain',
                title: 'Certificação Blockchain',
                icon: '🔗',
                description: 'Sistema de certificação e rastreabilidade blockchain',
                path: '/blockchain',
                component: 'BlockchainComponent',
                permissions: ['read', 'blockchain'],
                showInMenu: true,
                order: 3,
                breadcrumb: 'Blockchain',
                subSections: [
                    { id: 'certificates', name: 'Certificados', path: '/blockchain/certificates' },
                    { id: 'transactions', name: 'Transações', path: '/blockchain/transactions' },
                    { id: 'validators', name: 'Validadores', path: '/blockchain/validators' }
                ]
            });
            
            // Gêmeo Digital
            this.sections.set('digital-twin', {
                id: 'digital-twin',
                name: 'Gêmeo Digital',
                title: 'Simulação e Gêmeo Digital',
                icon: '🔮',
                description: 'Simulações preditivas e otimização de ecossistemas',
                path: '/digital-twin',
                component: 'DigitalTwinComponent',
                permissions: ['read', 'simulation'],
                showInMenu: true,
                order: 4,
                breadcrumb: 'Gêmeo Digital',
                subSections: [
                    { id: 'simulations', name: 'Simulações', path: '/digital-twin/simulations' },
                    { id: 'predictions', name: 'Predições', path: '/digital-twin/predictions' },
                    { id: 'optimization', name: 'Otimização', path: '/digital-twin/optimization' }
                ]
            });
            
            // IoT e Sensores
            this.sections.set('iot', {
                id: 'iot',
                name: 'IoT',
                title: 'IoT e Sensores',
                icon: '📡',
                description: 'Monitoramento em tempo real via sensores IoT',
                path: '/iot',
                component: 'IoTComponent',
                permissions: ['read', 'iot'],
                showInMenu: true,
                order: 5,
                breadcrumb: 'IoT',
                subSections: [
                    { id: 'sensors', name: 'Sensores', path: '/iot/sensors' },
                    { id: 'gateways', name: 'Gateways', path: '/iot/gateways' },
                    { id: 'alerts', name: 'Alertas', path: '/iot/alerts' }
                ]
            });
            
            // Marketplace
            this.sections.set('marketplace', {
                id: 'marketplace',
                name: 'Marketplace',
                title: 'Marketplace Regenerativo',
                icon: '🛒',
                description: 'Marketplace de soluções e produtos regenerativos',
                path: '/marketplace',
                component: 'MarketplaceComponent',
                permissions: ['read', 'marketplace'],
                showInMenu: true,
                order: 6,
                breadcrumb: 'Marketplace',
                subSections: [
                    { id: 'products', name: 'Produtos', path: '/marketplace/products' },
                    { id: 'orders', name: 'Pedidos', path: '/marketplace/orders' },
                    { id: 'sellers', name: 'Vendedores', path: '/marketplace/sellers' }
                ]
            });
            
            // APIs e Integrações
            this.sections.set('api', {
                id: 'api',
                name: 'APIs',
                title: 'APIs e Microserviços',
                icon: '🔌',
                description: 'Gerenciamento de APIs e microserviços',
                path: '/api',
                component: 'APIComponent',
                permissions: ['read', 'admin'],
                showInMenu: true,
                order: 7,
                breadcrumb: 'APIs',
                subSections: [
                    { id: 'endpoints', name: 'Endpoints', path: '/api/endpoints' },
                    { id: 'microservices', name: 'Microserviços', path: '/api/microservices' },
                    { id: 'monitoring', name: 'Monitoramento', path: '/api/monitoring' }
                ]
            });
            
            // Configurações
            this.sections.set('settings', {
                id: 'settings',
                name: 'Configurações',
                title: 'Configurações do Sistema',
                icon: '⚙️',
                description: 'Configurações e preferências do sistema',
                path: '/settings',
                component: 'SettingsComponent',
                permissions: ['read', 'settings'],
                showInMenu: true,
                order: 8,
                breadcrumb: 'Configurações',
                subSections: [
                    { id: 'general', name: 'Geral', path: '/settings/general' },
                    { id: 'security', name: 'Segurança', path: '/settings/security' },
                    { id: 'integrations', name: 'Integrações', path: '/settings/integrations' }
                ]
            });
            
            this.logger.success(`${this.sections.size} seções registradas`);
            
        } catch (error) {
            this.logger.error('Erro ao registrar seções:', error);
        }
    }

    setupEventListeners() {
        try {
            // Eventos de clique na navegação
            document.addEventListener('click', (event) => {
                const navItem = event.target.closest('[data-nav-section]');
                if (navItem) {
                    event.preventDefault();
                    const sectionId = navItem.getAttribute('data-nav-section');
                    this.navigateToSection(sectionId);
                }
            });
            
            // Eventos de mudança de hash
            window.addEventListener('hashchange', (event) => {
                if (this.config.enableHistory) {
                    this.handleHashChange(event);
                }
            });
            
            // Eventos de popstate (botões voltar/avançar)
            window.addEventListener('popstate', (event) => {
                if (this.config.enableHistory && event.state) {
                    this.navigateToSection(event.state.section, false);
                }
            });
            
            this.logger.debug('Event listeners configurados');
            
        } catch (error) {
            this.logger.error('Erro ao configurar event listeners:', error);
        }
    }

    setupKeyboardNavigation() {
        try {
            document.addEventListener('keydown', (event) => {
                // Alt + número para navegação rápida
                if (event.altKey && event.key >= '1' && event.key <= '9') {
                    event.preventDefault();
                    const sectionIndex = parseInt(event.key) - 1;
                    const sectionsArray = Array.from(this.sections.values())
                        .filter(section => section.showInMenu)
                        .sort((a, b) => a.order - b.order);
                    
                    if (sectionsArray[sectionIndex]) {
                        this.navigateToSection(sectionsArray[sectionIndex].id);
                    }
                }
                
                // Ctrl + H para home/dashboard
                if (event.ctrlKey && event.key === 'h') {
                    event.preventDefault();
                    this.navigateToSection('dashboard');
                }
                
                // Ctrl + B para voltar
                if (event.ctrlKey && event.key === 'b') {
                    event.preventDefault();
                    this.goBack();
                }
            });
            
            this.logger.debug('Navegação por teclado configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar navegação por teclado:', error);
        }
    }

    setupBrowserHistory() {
        try {
            // Configurar estado inicial
            if (!window.history.state) {
                window.history.replaceState(
                    { section: this.config.defaultSection },
                    '',
                    `#${this.config.defaultSection}`
                );
            }
            
            this.logger.debug('Histórico do navegador configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar histórico do navegador:', error);
        }
    }

    async navigateToSection(sectionId, updateHistory = true) {
        try {
            // Verificar se já está navegando
            if (this.navigationState.isNavigating) {
                this.logger.warn('Navegação já em andamento, ignorando...');
                return false;
            }
            
            // Verificar se a seção existe
            const section = this.sections.get(sectionId);
            if (!section) {
                this.logger.error(`Seção '${sectionId}' não encontrada`);
                return false;
            }
            
            // Verificar se já está na seção
            if (this.currentSection === sectionId) {
                this.logger.debug(`Já na seção '${sectionId}'`);
                return true;
            }
            
            this.navigationState.isNavigating = true;
            this.navigationState.lastNavigationTime = Date.now();
            this.navigationState.navigationCount++;
            
            this.logger.info(`Navegando para seção: ${section.name}`);
            
            // Salvar seção anterior
            this.previousSection = this.currentSection;
            
            // Executar animação de saída
            if (this.config.enableAnimations && this.currentSection) {
                await this.animateOut();
            }
            
            // Atualizar seção atual
            this.currentSection = sectionId;
            
            // Atualizar histórico de navegação
            this.updateNavigationHistory(sectionId);
            
            // Atualizar breadcrumbs
            if (this.config.enableBreadcrumbs) {
                this.updateBreadcrumbs(section);
            }
            
            // Atualizar histórico do navegador
            if (this.config.enableHistory && updateHistory) {
                this.updateBrowserHistory(section);
            }
            
            // Atualizar interface
            this.updateNavigation();
            this.updateContent(section);
            
            // Executar animação de entrada
            if (this.config.enableAnimations) {
                await this.animateIn();
            }
            
            // Notificar listeners
            this.notifyNavigationListeners(sectionId, this.previousSection);
            
            this.navigationState.isNavigating = false;
            
            this.logger.success(`Navegação para '${section.name}' concluída`);
            return true;
            
        } catch (error) {
            this.navigationState.isNavigating = false;
            this.navigationState.errors.push({
                error: error.message,
                section: sectionId,
                timestamp: Date.now()
            });
            
            this.logger.error(`Erro na navegação para '${sectionId}':`, error);
            return false;
        }
    }

    async animateOut() {
        return new Promise((resolve) => {
            const content = document.getElementById('content');
            if (content) {
                content.style.animation = this.animationConfig.fadeOut;
                setTimeout(resolve, this.animationConfig.duration);
            } else {
                resolve();
            }
        });
    }

    async animateIn() {
        return new Promise((resolve) => {
            const content = document.getElementById('content');
            if (content) {
                content.style.animation = this.animationConfig.fadeIn;
                setTimeout(() => {
                    content.style.animation = '';
                    resolve();
                }, this.animationConfig.duration);
            } else {
                resolve();
            }
        });
    }

    updateNavigationHistory(sectionId) {
        this.navigationHistory.push({
            section: sectionId,
            timestamp: Date.now(),
            previousSection: this.previousSection
        });
        
        // Manter apenas os últimos 50 itens
        if (this.navigationHistory.length > 50) {
            this.navigationHistory = this.navigationHistory.slice(-50);
        }
    }

    updateBreadcrumbs(section) {
        this.breadcrumbs = [
            { name: 'Início', section: 'dashboard', path: '/dashboard' }
        ];
        
        if (section.id !== 'dashboard') {
            this.breadcrumbs.push({
                name: section.breadcrumb || section.name,
                section: section.id,
                path: section.path
            });
        }
        
        this.renderBreadcrumbs();
    }

    updateBrowserHistory(section) {
        const url = `#${section.id}`;
        const state = { section: section.id };
        
        window.history.pushState(state, section.title, url);
        document.title = `${section.title} - RegenTech Platform`;
    }

    updateNavigation() {
        const navItems = document.querySelectorAll('[data-nav-section]');
        
        navItems.forEach(item => {
            const sectionId = item.getAttribute('data-nav-section');
            
            if (sectionId === this.currentSection) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
    }

    updateContent(section) {
        const content = document.getElementById('content');
        if (!content) return;
        
        // Aqui seria carregado o componente específico da seção
        // Por enquanto, vamos mostrar uma mensagem placeholder
        content.innerHTML = `
            <div class="section-content">
                <div class="section-header">
                    <div class="section-icon">${section.icon}</div>
                    <div class="section-info">
                        <h2>${section.title}</h2>
                        <p>${section.description}</p>
                    </div>
                </div>
                
                <div class="section-body">
                    <div class="loading-placeholder">
                        <div class="loading-spinner"></div>
                        <p>Carregando ${section.name}...</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderBreadcrumbs() {
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbContainer || !this.config.enableBreadcrumbs) return;
        
        const breadcrumbHTML = this.breadcrumbs.map((crumb, index) => {
            const isLast = index === this.breadcrumbs.length - 1;
            
            return `
                <span class="breadcrumb-item ${isLast ? 'current' : ''}">
                    ${isLast ? crumb.name : `
                        <a href="#${crumb.section}" data-nav-section="${crumb.section}">
                            ${crumb.name}
                        </a>
                    `}
                </span>
                ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
            `;
        }).join('');
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }

    handleHashChange(event) {
        const hash = window.location.hash.substring(1);
        if (hash && this.sections.has(hash)) {
            this.navigateToSection(hash, false);
        }
    }

    goBack() {
        if (this.navigationHistory.length > 1) {
            // Remover entrada atual
            this.navigationHistory.pop();
            
            // Obter entrada anterior
            const previousEntry = this.navigationHistory[this.navigationHistory.length - 1];
            
            if (previousEntry) {
                this.navigateToSection(previousEntry.section);
            } else {
                this.navigateToSection(this.config.defaultSection);
            }
        } else {
            this.navigateToSection(this.config.defaultSection);
        }
    }

    goToSection(sectionId) {
        return this.navigateToSection(sectionId);
    }

    getCurrentSection() {
        return this.currentSection;
    }

    getPreviousSection() {
        return this.previousSection;
    }

    getSection(sectionId) {
        return this.sections.get(sectionId);
    }

    getAllSections() {
        return Array.from(this.sections.values());
    }

    getMenuSections() {
        return Array.from(this.sections.values())
            .filter(section => section.showInMenu)
            .sort((a, b) => a.order - b.order);
    }

    addNavigationListener(id, callback) {
        this.navigationListeners.set(id, callback);
    }

    removeNavigationListener(id) {
        this.navigationListeners.delete(id);
    }

    notifyNavigationListeners(currentSection, previousSection) {
        for (const [id, callback] of this.navigationListeners) {
            try {
                callback(currentSection, previousSection);
            } catch (error) {
                this.logger.error(`Erro no listener '${id}':`, error);
            }
        }
    }

    renderNavigation() {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        const menuSections = this.getMenuSections();
        
        const navigationHTML = `
            <div class="nav-header">
                <div class="nav-logo">
                    <span class="logo-icon">🌱</span>
                    <span class="logo-text">RegenTech</span>
                </div>
            </div>
            
            <div class="nav-menu">
                ${menuSections.map(section => `
                    <a href="#${section.id}" 
                       class="nav-item ${section.id === this.currentSection ? 'active' : ''}" 
                       data-nav-section="${section.id}"
                       title="${section.description}">
                        <span class="nav-icon">${section.icon}</span>
                        <span class="nav-label">${section.name}</span>
                        ${section.subSections ? `
                            <span class="nav-arrow">›</span>
                        ` : ''}
                    </a>
                    ${section.subSections && section.id === this.currentSection ? `
                        <div class="nav-submenu">
                            ${section.subSections.map(subSection => `
                                <a href="${subSection.path}" class="nav-subitem">
                                    <span class="nav-sublabel">${subSection.name}</span>
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                `).join('')}
            </div>
            
            <div class="nav-footer">
                <div class="nav-stats">
                    <div class="stat-item">
                        <span class="stat-label">Navegações:</span>
                        <span class="stat-value">${this.navigationState.navigationCount}</span>
                    </div>
                </div>
            </div>
        `;
        
        nav.innerHTML = navigationHTML;
    }

    exportData() {
        return {
            currentSection: this.currentSection,
            previousSection: this.previousSection,
            navigationHistory: this.navigationHistory.slice(-10), // últimas 10
            breadcrumbs: this.breadcrumbs,
            sections: Object.fromEntries(this.sections),
            navigationState: this.navigationState,
            config: this.config
        };
    }

    destroy() {
        // Remover event listeners
        document.removeEventListener('click', this.handleClick);
        window.removeEventListener('hashchange', this.handleHashChange);
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Limpar listeners
        this.navigationListeners.clear();
        
        this.logger.info('Gerenciador de Navegação destruído');
    }
}

export default NavigationManager;