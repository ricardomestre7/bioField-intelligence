/**
 * Gerenciador de Interface do Usuário
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../utils/Logger.js';

export class UIManager {
    constructor(config = {}) {
        this.config = {
            theme: config.theme || 'light',
            enableAnimations: config.enableAnimations !== false,
            enableNotifications: config.enableNotifications !== false,
            enableTooltips: config.enableTooltips !== false,
            enableKeyboardShortcuts: config.enableKeyboardShortcuts !== false,
            autoSave: config.autoSave !== false,
            language: config.language || 'pt-BR',
            ...config
        };
        
        this.logger = new Logger('UIManager');
        this.isInitialized = false;
        this.currentTheme = this.config.theme;
        this.notifications = [];
        this.modals = new Map();
        this.tooltips = new Map();
        this.components = new Map();
        this.eventListeners = new Map();
        
        this.initializeUI();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Gerenciador de UI...');
            
            // Aplicar tema
            this.applyTheme(this.currentTheme);
            
            // Configurar componentes base
            this.setupBaseComponents();
            
            // Configurar sistema de notificações
            if (this.config.enableNotifications) {
                this.setupNotificationSystem();
            }
            
            // Configurar tooltips
            if (this.config.enableTooltips) {
                this.setupTooltipSystem();
            }
            
            // Configurar atalhos de teclado
            if (this.config.enableKeyboardShortcuts) {
                this.setupKeyboardShortcuts();
            }
            
            // Configurar responsividade
            this.setupResponsiveHandlers();
            
            // Configurar auto-save
            if (this.config.autoSave) {
                this.setupAutoSave();
            }
            
            this.isInitialized = true;
            this.logger.success('Gerenciador de UI inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Gerenciador de UI:', error);
            throw error;
        }
    }

    initializeUI() {
        // Configurações de tema
        this.themes = {
            light: {
                name: 'Claro',
                colors: {
                    primary: '#2E7D32',
                    secondary: '#388E3C',
                    accent: '#4CAF50',
                    background: '#FFFFFF',
                    surface: '#F5F5F5',
                    text: '#212121',
                    textSecondary: '#757575',
                    border: '#E0E0E0',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    error: '#F44336',
                    info: '#2196F3'
                }
            },
            dark: {
                name: 'Escuro',
                colors: {
                    primary: '#4CAF50',
                    secondary: '#66BB6A',
                    accent: '#81C784',
                    background: '#121212',
                    surface: '#1E1E1E',
                    text: '#FFFFFF',
                    textSecondary: '#B0B0B0',
                    border: '#333333',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    error: '#F44336',
                    info: '#2196F3'
                }
            },
            nature: {
                name: 'Natureza',
                colors: {
                    primary: '#2E7D32',
                    secondary: '#388E3C',
                    accent: '#8BC34A',
                    background: '#F1F8E9',
                    surface: '#E8F5E8',
                    text: '#1B5E20',
                    textSecondary: '#2E7D32',
                    border: '#C8E6C9',
                    success: '#4CAF50',
                    warning: '#FF8F00',
                    error: '#D32F2F',
                    info: '#1976D2'
                }
            }
        };
        
        // Configurações de animação
        this.animations = {
            duration: {
                fast: 150,
                normal: 300,
                slow: 500
            },
            easing: {
                ease: 'ease',
                easeIn: 'ease-in',
                easeOut: 'ease-out',
                easeInOut: 'ease-in-out',
                bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
        };
        
        // Estado da UI
        this.uiState = {
            isLoading: false,
            activeModals: 0,
            activeNotifications: 0,
            screenSize: this.getScreenSize(),
            orientation: this.getOrientation()
        };
    }

    setupBaseComponents() {
        try {
            this.logger.info('Configurando componentes base...');
            
            // Criar estrutura base da aplicação
            this.createBaseStructure();
            
            // Registrar componentes
            this.registerComponents();
            
            // Aplicar estilos base
            this.applyBaseStyles();
            
            this.logger.success('Componentes base configurados');
            
        } catch (error) {
            this.logger.error('Erro ao configurar componentes base:', error);
        }
    }

    createBaseStructure() {
        const body = document.body;
        
        // Verificar se já existe estrutura
        if (document.getElementById('app-container')) {
            return;
        }
        
        const appHTML = `
            <div id="app-container" class="app-container">
                <!-- Header -->
                <header id="app-header" class="app-header">
                    <div class="header-content">
                        <div class="header-left">
                            <button id="menu-toggle" class="menu-toggle" aria-label="Toggle Menu">
                                <span class="hamburger"></span>
                            </button>
                            <div class="logo">
                                <span class="logo-icon">⚛️</span>
                                <span class="logo-text">BioField Intelligence</span>
                            </div>
                        </div>
                        
                        <div class="header-center">
                            <nav id="breadcrumbs" class="breadcrumbs" aria-label="Breadcrumb"></nav>
                        </div>
                        
                        <div class="header-right">
                            <div class="header-actions">
                                <button id="theme-toggle" class="action-btn" title="Alternar Tema">
                                    <span class="theme-icon">🌙</span>
                                </button>
                                <button id="notifications-toggle" class="action-btn" title="Notificações">
                                    <span class="notification-icon">🔔</span>
                                    <span id="notification-badge" class="notification-badge hidden">0</span>
                                </button>
                                <button id="user-menu" class="action-btn" title="Menu do Usuário">
                                    <span class="user-icon">👤</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Sidebar -->
                <aside id="sidebar" class="sidebar">
                    <nav id="navigation" class="navigation"></nav>
                </aside>
                
                <!-- Main Content -->
                <main id="main-content" class="main-content">
                    <div id="content" class="content"></div>
                </main>
                
                <!-- Footer -->
                <footer id="app-footer" class="app-footer">
                    <div class="footer-content">
                        <div class="footer-left">
                            <span class="footer-text">© 2024 BioField Intelligence</span>
                        </div>
                        <div class="footer-right">
                            <span id="status-indicator" class="status-indicator">🟢 Online</span>
                        </div>
                    </div>
                </footer>
                
                <!-- Overlay para modais -->
                <div id="modal-overlay" class="modal-overlay hidden"></div>
                
                <!-- Container de notificações -->
                <div id="notifications-container" class="notifications-container"></div>
                
                <!-- Container de tooltips -->
                <div id="tooltips-container" class="tooltips-container"></div>
                
                <!-- Loading overlay -->
                <div id="loading-overlay" class="loading-overlay hidden">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p class="loading-text">Carregando...</p>
                    </div>
                </div>
            </div>
        `;
        
        body.innerHTML = appHTML;
    }

    registerComponents() {
        // Registrar componentes reutilizáveis
        this.components.set('button', {
            name: 'Button',
            template: (props) => `
                <button class="btn ${props.variant || 'primary'} ${props.size || 'medium'} ${props.disabled ? 'disabled' : ''}" 
                        ${props.disabled ? 'disabled' : ''}
                        ${props.onClick ? `onclick="${props.onClick}"` : ''}>
                    ${props.icon ? `<span class="btn-icon">${props.icon}</span>` : ''}
                    <span class="btn-text">${props.text || 'Button'}</span>
                </button>
            `
        });
        
        this.components.set('card', {
            name: 'Card',
            template: (props) => `
                <div class="card ${props.variant || 'default'} ${props.size || 'medium'}">
                    ${props.header ? `
                        <div class="card-header">
                            ${props.icon ? `<span class="card-icon">${props.icon}</span>` : ''}
                            <h3 class="card-title">${props.header}</h3>
                            ${props.actions ? `<div class="card-actions">${props.actions}</div>` : ''}
                        </div>
                    ` : ''}
                    <div class="card-content">
                        ${props.content || ''}
                    </div>
                    ${props.footer ? `
                        <div class="card-footer">
                            ${props.footer}
                        </div>
                    ` : ''}
                </div>
            `
        });
        
        this.components.set('modal', {
            name: 'Modal',
            template: (props) => `
                <div class="modal ${props.size || 'medium'}" id="${props.id}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">${props.title || 'Modal'}</h3>
                            <button class="modal-close" onclick="UIManager.closeModal('${props.id}')">
                                <span class="close-icon">✕</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            ${props.content || ''}
                        </div>
                        ${props.footer ? `
                            <div class="modal-footer">
                                ${props.footer}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `
        });
    }

    applyBaseStyles() {
        const styleId = 'ui-manager-styles';
        
        // Remover estilos existentes
        const existingStyles = document.getElementById(styleId);
        if (existingStyles) {
            existingStyles.remove();
        }
        
        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = this.getBaseCSS();
        document.head.appendChild(styles);
    }

    getBaseCSS() {
        return `
            /* Reset e Base */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background-color: var(--background-color);
                overflow-x: hidden;
            }
            
            /* Layout Principal */
            .app-container {
                display: grid;
                grid-template-areas: 
                    "header header"
                    "sidebar main"
                    "footer footer";
                grid-template-rows: auto 1fr auto;
                grid-template-columns: 250px 1fr;
                min-height: 100vh;
                transition: all 0.3s ease;
            }
            
            .app-header {
                grid-area: header;
                background: var(--surface-color);
                border-bottom: 1px solid var(--border-color);
                padding: 0 1rem;
                z-index: 1000;
            }
            
            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 60px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .header-left, .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                font-size: 1.2rem;
                color: var(--primary-color);
            }
            
            .logo-icon {
                font-size: 1.5rem;
            }
            
            .sidebar {
                grid-area: sidebar;
                background: var(--surface-color);
                border-right: 1px solid var(--border-color);
                overflow-y: auto;
                transition: transform 0.3s ease;
            }
            
            .main-content {
                grid-area: main;
                padding: 1.5rem;
                overflow-y: auto;
                background: var(--background-color);
            }
            
            .app-footer {
                grid-area: footer;
                background: var(--surface-color);
                border-top: 1px solid var(--border-color);
                padding: 0.75rem 1rem;
            }
            
            .footer-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1400px;
                margin: 0 auto;
                font-size: 0.875rem;
                color: var(--text-secondary-color);
            }
            
            /* Componentes */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                background: var(--primary-color);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .btn.secondary {
                background: var(--surface-color);
                color: var(--text-color);
                border: 1px solid var(--border-color);
            }
            
            .btn.small {
                padding: 0.25rem 0.75rem;
                font-size: 0.75rem;
            }
            
            .btn.large {
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
            }
            
            .card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            
            .card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .card-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .card-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-color);
                flex: 1;
            }
            
            .card-content {
                padding: 1rem;
            }
            
            .card-footer {
                padding: 1rem;
                border-top: 1px solid var(--border-color);
                background: var(--background-color);
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-overlay.show {
                opacity: 1;
            }
            
            .modal {
                background: var(--surface-color);
                border-radius: 8px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .modal-overlay.show .modal {
                transform: scale(1);
            }
            
            .modal.small { width: 400px; }
            .modal.medium { width: 600px; }
            .modal.large { width: 800px; }
            
            .modal-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-body {
                padding: 1rem;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: 1rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }
            
            /* Notificações */
            .notifications-container {
                position: fixed;
                top: 80px;
                right: 1rem;
                z-index: 1500;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 400px;
            }
            
            .notification {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success { border-left: 4px solid var(--success-color); }
            .notification.warning { border-left: 4px solid var(--warning-color); }
            .notification.error { border-left: 4px solid var(--error-color); }
            .notification.info { border-left: 4px solid var(--info-color); }
            
            /* Utilitários */
            .hidden { display: none !important; }
            .loading { opacity: 0.6; pointer-events: none; }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 1rem;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .app-container {
                    grid-template-areas: 
                        "header"
                        "main"
                        "footer";
                    grid-template-columns: 1fr;
                }
                
                .sidebar {
                    position: fixed;
                    top: 60px;
                    left: 0;
                    bottom: 0;
                    width: 250px;
                    transform: translateX(-100%);
                    z-index: 1200;
                }
                
                .sidebar.open {
                    transform: translateX(0);
                }
            }
        `;
    }

    applyTheme(themeName) {
        try {
            const theme = this.themes[themeName];
            if (!theme) {
                this.logger.warn(`Tema '${themeName}' não encontrado`);
                return;
            }
            
            const root = document.documentElement;
            
            // Aplicar variáveis CSS do tema
            Object.entries(theme.colors).forEach(([key, value]) => {
                const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`;
                root.style.setProperty(cssVar, value);
            });
            
            // Atualizar classe do body
            document.body.className = `theme-${themeName}`;
            
            // Atualizar ícone do tema
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = themeName === 'dark' ? '☀️' : '🌙';
            }
            
            this.currentTheme = themeName;
            this.logger.info(`Tema '${theme.name}' aplicado`);
            
        } catch (error) {
            this.logger.error('Erro ao aplicar tema:', error);
        }
    }

    setupNotificationSystem() {
        try {
            // Configurar eventos de notificação
            document.addEventListener('click', (event) => {
                if (event.target.closest('#notifications-toggle')) {
                    this.toggleNotificationsPanel();
                }
                
                if (event.target.closest('.notification-close')) {
                    const notification = event.target.closest('.notification');
                    if (notification) {
                        this.removeNotification(notification.id);
                    }
                }
            });
            
            this.logger.debug('Sistema de notificações configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar sistema de notificações:', error);
        }
    }

    setupTooltipSystem() {
        try {
            // Configurar tooltips automáticos
            document.addEventListener('mouseenter', (event) => {
                const element = event.target.closest('[title], [data-tooltip]');
                if (element) {
                    const text = element.getAttribute('data-tooltip') || element.getAttribute('title');
                    if (text) {
                        this.showTooltip(element, text);
                        element.removeAttribute('title'); // Prevenir tooltip nativo
                    }
                }
            });
            
            document.addEventListener('mouseleave', (event) => {
                const element = event.target.closest('[data-tooltip]');
                if (element) {
                    this.hideTooltip(element);
                }
            });
            
            this.logger.debug('Sistema de tooltips configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar sistema de tooltips:', error);
        }
    }

    setupKeyboardShortcuts() {
        try {
            document.addEventListener('keydown', (event) => {
                // Ctrl/Cmd + K para busca
                if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                    event.preventDefault();
                    this.openSearchModal();
                }
                
                // Ctrl/Cmd + , para configurações
                if ((event.ctrlKey || event.metaKey) && event.key === ',') {
                    event.preventDefault();
                    this.openSettingsModal();
                }
                
                // Escape para fechar modais
                if (event.key === 'Escape') {
                    this.closeAllModals();
                }
                
                // Ctrl/Cmd + Shift + T para alternar tema
                if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
                    event.preventDefault();
                    this.toggleTheme();
                }
            });
            
            this.logger.debug('Atalhos de teclado configurados');
            
        } catch (error) {
            this.logger.error('Erro ao configurar atalhos de teclado:', error);
        }
    }

    setupResponsiveHandlers() {
        try {
            // Configurar menu mobile
            document.addEventListener('click', (event) => {
                if (event.target.closest('#menu-toggle')) {
                    this.toggleMobileMenu();
                }
            });
            
            // Monitorar mudanças de tamanho da tela
            window.addEventListener('resize', () => {
                this.handleResize();
            });
            
            // Monitorar mudanças de orientação
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.handleOrientationChange(), 100);
            });
            
            this.logger.debug('Handlers responsivos configurados');
            
        } catch (error) {
            this.logger.error('Erro ao configurar handlers responsivos:', error);
        }
    }

    setupAutoSave() {
        try {
            // Auto-save a cada 30 segundos
            this.autoSaveInterval = setInterval(() => {
                this.performAutoSave();
            }, 30000);
            
            // Save antes de sair da página
            window.addEventListener('beforeunload', () => {
                this.performAutoSave();
            });
            
            this.logger.debug('Auto-save configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar auto-save:', error);
        }
    }

    // Métodos de Notificação
    showNotification(message, type = 'info', duration = 5000) {
        try {
            const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const notification = {
                id,
                message,
                type,
                timestamp: Date.now(),
                duration
            };
            
            this.notifications.push(notification);
            this.renderNotification(notification);
            
            // Auto-remover após duração especificada
            if (duration > 0) {
                setTimeout(() => {
                    this.removeNotification(id);
                }, duration);
            }
            
            this.updateNotificationBadge();
            
            return id;
            
        } catch (error) {
            this.logger.error('Erro ao mostrar notificação:', error);
        }
    }

    renderNotification(notification) {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        
        const notificationHTML = `
            <div class="notification ${notification.type}" id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-icon">
                        ${this.getNotificationIcon(notification.type)}
                    </div>
                    <div class="notification-message">
                        ${notification.message}
                    </div>
                    <button class="notification-close" title="Fechar">
                        <span>✕</span>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', notificationHTML);
        
        // Animar entrada
        setTimeout(() => {
            const element = document.getElementById(notification.id);
            if (element) {
                element.classList.add('show');
            }
        }, 10);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    removeNotification(id) {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const count = this.notifications.length;
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }

    // Métodos de Modal
    showModal(id, options = {}) {
        try {
            const modalHTML = this.components.get('modal').template({
                id,
                title: options.title || 'Modal',
                content: options.content || '',
                footer: options.footer || '',
                size: options.size || 'medium'
            });
            
            const overlay = document.getElementById('modal-overlay');
            if (overlay) {
                overlay.innerHTML = modalHTML;
                overlay.classList.remove('hidden');
                
                setTimeout(() => {
                    overlay.classList.add('show');
                }, 10);
                
                this.modals.set(id, options);
                this.uiState.activeModals++;
            }
            
        } catch (error) {
            this.logger.error('Erro ao mostrar modal:', error);
        }
    }

    closeModal(id) {
        try {
            const overlay = document.getElementById('modal-overlay');
            if (overlay) {
                overlay.classList.remove('show');
                
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    overlay.innerHTML = '';
                }, 300);
                
                this.modals.delete(id);
                this.uiState.activeModals = Math.max(0, this.uiState.activeModals - 1);
            }
            
        } catch (error) {
            this.logger.error('Erro ao fechar modal:', error);
        }
    }

    closeAllModals() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            overlay.classList.remove('show');
            
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.innerHTML = '';
            }, 300);
            
            this.modals.clear();
            this.uiState.activeModals = 0;
        }
    }

    // Métodos de Tooltip
    showTooltip(element, text) {
        const tooltipId = `tooltip-${Date.now()}`;
        const rect = element.getBoundingClientRect();
        
        const tooltipHTML = `
            <div class="tooltip" id="${tooltipId}" style="
                position: fixed;
                top: ${rect.top - 35}px;
                left: ${rect.left + rect.width / 2}px;
                transform: translateX(-50%);
                background: var(--text-color);
                color: var(--background-color);
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                white-space: nowrap;
                z-index: 2500;
                opacity: 0;
                transition: opacity 0.2s ease;
            ">
                ${text}
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', tooltipHTML);
        
        setTimeout(() => {
            const tooltip = document.getElementById(tooltipId);
            if (tooltip) {
                tooltip.style.opacity = '1';
            }
        }, 10);
        
        this.tooltips.set(element, tooltipId);
    }

    hideTooltip(element) {
        const tooltipId = this.tooltips.get(element);
        if (tooltipId) {
            const tooltip = document.getElementById(tooltipId);
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    tooltip.remove();
                }, 200);
            }
            this.tooltips.delete(element);
        }
    }

    // Métodos de Tema
    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.applyTheme(nextTheme);
        this.showNotification(`Tema alterado para ${this.themes[nextTheme].name}`, 'success', 2000);
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.applyTheme(themeName);
        }
    }

    // Métodos de Loading
    showLoading(message = 'Carregando...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const loadingText = overlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            overlay.classList.remove('hidden');
            this.uiState.isLoading = true;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            this.uiState.isLoading = false;
        }
    }

    // Métodos Responsivos
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    handleResize() {
        const newSize = this.getScreenSize();
        if (newSize !== this.uiState.screenSize) {
            this.uiState.screenSize = newSize;
            this.logger.debug(`Tamanho da tela alterado para: ${newSize}`);
        }
    }

    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        if (newOrientation !== this.uiState.orientation) {
            this.uiState.orientation = newOrientation;
            this.logger.debug(`Orientação alterada para: ${newOrientation}`);
        }
    }

    getScreenSize() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // Métodos de Auto-save
    performAutoSave() {
        try {
            // Implementar lógica de auto-save aqui
            this.logger.debug('Auto-save executado');
        } catch (error) {
            this.logger.error('Erro no auto-save:', error);
        }
    }

    // Métodos de Busca e Configurações
    openSearchModal() {
        this.showModal('search-modal', {
            title: '🔍 Buscar',
            content: `
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Digite para buscar..." autofocus>
                    <div class="search-results"></div>
                </div>
            `,
            size: 'large'
        });
    }

    openSettingsModal() {
        this.showModal('settings-modal', {
            title: '⚙️ Configurações',
            content: `
                <div class="settings-container">
                    <div class="setting-group">
                        <h4>Aparência</h4>
                        <div class="setting-item">
                            <label>Tema:</label>
                            <select id="theme-select">
                                ${Object.entries(this.themes).map(([key, theme]) => `
                                    <option value="${key}" ${key === this.currentTheme ? 'selected' : ''}>
                                        ${theme.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn secondary" onclick="UIManager.closeModal('settings-modal')">Cancelar</button>
                <button class="btn primary" onclick="UIManager.saveSettings()">Salvar</button>
            `
        });
    }

    saveSettings() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            this.setTheme(themeSelect.value);
        }
        
        this.closeModal('settings-modal');
        this.showNotification('Configurações salvas com sucesso!', 'success');
    }

    // Métodos de Componente
    renderComponent(componentName, props = {}) {
        const component = this.components.get(componentName);
        if (component) {
            return component.template(props);
        }
        return '';
    }

    // Métodos de Estado
    getUIState() {
        return { ...this.uiState };
    }

    exportData() {
        return {
            currentTheme: this.currentTheme,
            notifications: this.notifications.slice(-10), // últimas 10
            modals: Object.fromEntries(this.modals),
            uiState: this.uiState,
            config: this.config
        };
    }

    destroy() {
        // Limpar intervalos
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Remover event listeners
        this.eventListeners.clear();
        
        // Limpar tooltips
        this.tooltips.clear();
        
        // Fechar modais
        this.closeAllModals();
        
        this.logger.info('Gerenciador de UI destruído');
    }
}

// Tornar disponível globalmente para uso em onclick handlers
window.UIManager = UIManager;

export default UIManager;