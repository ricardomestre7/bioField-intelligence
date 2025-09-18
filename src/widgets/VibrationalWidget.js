/**
 * BioField Intelligence - Widget de Leitura Vibracional
 * Módulo Beta - Coleta dados brutos para análise posterior
 */

class VibrationalWidget {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = {
            firebaseConfig: config.firebaseConfig || null,
            autoCollect: config.autoCollect || true,
            collectionInterval: config.collectionInterval || 5000, // 5 segundos
            ...config
        };
        
        this.isCollecting = false;
        this.sessionData = {
            user_id: this.generateRandomID(),
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            localidade: this.detectLocation(),
            readings: []
        };
        
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        if (this.config.autoCollect) {
            this.startCollection();
        }
    }

    generateRandomID() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('biofield_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('biofield_device_id', deviceId);
        }
        return deviceId;
    }

    detectLocation() {
        // Simulação de detecção de localização
        const locations = ['Portugal', 'Brasil', 'Espanha', 'França', 'Itália'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    createWidget() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Container não encontrado:', this.containerId);
            return;
        }

        container.innerHTML = `
            <div class="vibrational-widget">
                <div class="widget-header">
                    <h3>🌊 Leitura Vibracional BioField</h3>
                    <div class="status-indicator">
                        <span class="status-dot" id="status-dot"></span>
                        <span id="status-text">Iniciando...</span>
                    </div>
                </div>
                
                <div class="widget-content">
                    <div class="coherence-display">
                        <div class="coherence-circle">
                            <div class="coherence-value" id="coherence-value">0%</div>
                            <div class="coherence-label">Coerência</div>
                        </div>
                    </div>
                    
                    <div class="activity-display">
                        <div class="activity-bar">
                            <div class="activity-fill" id="activity-fill"></div>
                        </div>
                        <div class="activity-label">Atividade Vibracional</div>
                    </div>
                    
                    <div class="session-info">
                        <div class="info-item">
                            <span class="label">Sessão:</span>
                            <span id="session-time">00:00</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Leituras:</span>
                            <span id="readings-count">0</span>
                        </div>
                    </div>
                    
                    <div class="widget-controls">
                        <button id="start-btn" class="btn btn-primary">Iniciar Leitura</button>
                        <button id="stop-btn" class="btn btn-secondary" disabled>Parar Leitura</button>
                        <button id="consent-btn" class="btn btn-success" disabled>Autorizar Envio</button>
                    </div>
                    
                    <div class="consent-panel" id="consent-panel" style="display: none;">
                        <h4>📋 Consentimento de Dados</h4>
                        <p>Os dados coletados serão enviados para análise bioenergética. 
                        Você autoriza o compartilhamento dos dados de leitura vibracional?</p>
                        <div class="consent-options">
                            <label>
                                <input type="checkbox" id="consent-checkbox">
                                Sim, autorizo o compartilhamento dos dados
                            </label>
                        </div>
                        <div class="consent-actions">
                            <button id="confirm-consent" class="btn btn-success" disabled>Confirmar</button>
                            <button id="cancel-consent" class="btn btn-secondary">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addWidgetStyles();
    }

    addWidgetStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .vibrational-widget {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 15px;
                padding: 20px;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 400px;
                margin: 20px auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(34, 197, 94, 0.2);
            }

            .widget-header h3 {
                margin: 0;
                color: #22c55e;
                font-size: 18px;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #ef4444;
                animation: pulse 2s infinite;
            }

            .status-dot.active {
                background: #22c55e;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            .coherence-display {
                text-align: center;
                margin: 20px 0;
            }

            .coherence-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: conic-gradient(from 0deg, #22c55e 0%, #22c55e var(--coherence, 0%), #374151 var(--coherence, 0%), #374151 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
                position: relative;
            }

            .coherence-circle::before {
                content: '';
                position: absolute;
                width: 80px;
                height: 80px;
                background: #1e293b;
                border-radius: 50%;
            }

            .coherence-value {
                font-size: 24px;
                font-weight: bold;
                color: #22c55e;
                z-index: 1;
            }

            .coherence-label {
                font-size: 12px;
                color: #9ca3af;
                z-index: 1;
            }

            .activity-display {
                margin: 20px 0;
            }

            .activity-bar {
                width: 100%;
                height: 20px;
                background: #374151;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .activity-fill {
                height: 100%;
                background: linear-gradient(90deg, #22c55e, #84cc16);
                width: 0%;
                transition: width 0.3s ease;
            }

            .activity-label {
                font-size: 12px;
                color: #9ca3af;
                text-align: center;
            }

            .session-info {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                font-size: 14px;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .label {
                color: #9ca3af;
                font-size: 12px;
            }

            .widget-controls {
                display: flex;
                gap: 10px;
                margin: 20px 0;
            }

            .btn {
                flex: 1;
                padding: 10px 15px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .btn-primary {
                background: #22c55e;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #16a34a;
            }

            .btn-secondary {
                background: #6b7280;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background: #4b5563;
            }

            .btn-success {
                background: #059669;
                color: white;
            }

            .btn-success:hover:not(:disabled) {
                background: #047857;
            }

            .consent-panel {
                background: rgba(0, 0, 0, 0.3);
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }

            .consent-panel h4 {
                margin: 0 0 15px 0;
                color: #22c55e;
            }

            .consent-panel p {
                margin: 0 0 15px 0;
                font-size: 14px;
                line-height: 1.5;
            }

            .consent-options {
                margin: 15px 0;
            }

            .consent-options label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                font-size: 14px;
            }

            .consent-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        const consentBtn = document.getElementById('consent-btn');
        const consentCheckbox = document.getElementById('consent-checkbox');
        const confirmConsent = document.getElementById('confirm-consent');
        const cancelConsent = document.getElementById('cancel-consent');

        startBtn?.addEventListener('click', () => this.startCollection());
        stopBtn?.addEventListener('click', () => this.stopCollection());
        consentBtn?.addEventListener('click', () => this.showConsentPanel());
        consentCheckbox?.addEventListener('change', (e) => {
            confirmConsent.disabled = !e.target.checked;
        });
        confirmConsent?.addEventListener('click', () => this.confirmConsent());
        cancelConsent?.addEventListener('click', () => this.hideConsentPanel());
    }

    startCollection() {
        this.isCollecting = true;
        this.sessionData.timestamp = new Date().toISOString();
        this.sessionData.readings = [];

        document.getElementById('start-btn').disabled = true;
        document.getElementById('stop-btn').disabled = false;
        document.getElementById('status-dot').classList.add('active');
        document.getElementById('status-text').textContent = 'Coletando dados...';

        this.collectionInterval = setInterval(() => {
            this.collectReading();
        }, this.config.collectionInterval);

        console.log('🌊 Iniciando coleta de dados vibracionais...');
    }

    stopCollection() {
        this.isCollecting = false;
        clearInterval(this.collectionInterval);

        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('consent-btn').disabled = false;
        document.getElementById('status-dot').classList.remove('active');
        document.getElementById('status-text').textContent = 'Sessão finalizada';

        console.log('⏹️ Coleta de dados finalizada');
    }

    collectReading() {
        if (!this.isCollecting) return;

        const reading = {
            timestamp: new Date().toISOString(),
            atividade_vibracional: this.simulateVibrationalActivity(),
            espectro_vibracional_raw: this.generateRawSpectrum(),
            coherence: this.simulateCoherence()
        };

        this.sessionData.readings.push(reading);
        this.updateDisplay(reading);
        this.updateSessionTime();
    }

    simulateVibrationalActivity() {
        // Simulação de atividade vibracional baseada em interação do usuário
        const baseActivity = Math.random() * 40 + 30; // 30-70%
        const mouseActivity = this.getMouseActivity();
        const timeVariation = Math.sin(Date.now() / 10000) * 10;
        
        return Math.max(0, Math.min(100, baseActivity + mouseActivity + timeVariation));
    }

    getMouseActivity() {
        // Simula atividade baseada em movimento do mouse
        return Math.random() * 20 - 10; // -10 a +10
    }

    generateRawSpectrum() {
        // Gera espectro vibracional simulado
        const frequencies = [];
        for (let i = 0; i < 100; i++) {
            frequencies.push({
                freq: i * 0.1,
                amplitude: Math.random() * 100,
                phase: Math.random() * Math.PI * 2
            });
        }
        return frequencies;
    }

    simulateCoherence() {
        // Simula coerência vibracional
        return Math.random() * 40 + 40; // 40-80%
    }

    updateDisplay(reading) {
        const coherenceValue = document.getElementById('coherence-value');
        const activityFill = document.getElementById('activity-fill');
        const readingsCount = document.getElementById('readings-count');

        if (coherenceValue) {
            coherenceValue.textContent = Math.round(reading.coherence) + '%';
            document.documentElement.style.setProperty('--coherence', reading.coherence + '%');
        }

        if (activityFill) {
            activityFill.style.width = reading.atividade_vibracional + '%';
        }

        if (readingsCount) {
            readingsCount.textContent = this.sessionData.readings.length;
        }
    }

    updateSessionTime() {
        const sessionTime = document.getElementById('session-time');
        if (sessionTime) {
            const startTime = new Date(this.sessionData.timestamp);
            const currentTime = new Date();
            const diff = Math.floor((currentTime - startTime) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showConsentPanel() {
        const consentPanel = document.getElementById('consent-panel');
        if (consentPanel) {
            consentPanel.style.display = 'block';
        }
    }

    hideConsentPanel() {
        const consentPanel = document.getElementById('consent-panel');
        if (consentPanel) {
            consentPanel.style.display = 'none';
        }
    }

    confirmConsent() {
        const consentData = {
            ...this.sessionData,
            consent_given: true,
            consent_timestamp: new Date().toISOString(),
            consent_ip: this.getClientIP()
        };

        this.sendToFirebase(consentData);
        this.hideConsentPanel();
        
        // Reset para nova sessão
        this.sessionData = {
            user_id: this.generateRandomID(),
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            localidade: this.detectLocation(),
            readings: []
        };

        document.getElementById('consent-btn').disabled = true;
        document.getElementById('readings-count').textContent = '0';
        document.getElementById('coherence-value').textContent = '0%';
        document.getElementById('activity-fill').style.width = '0%';
    }

    getClientIP() {
        // Simulação de IP (em produção, usar serviço real)
        return '192.168.1.' + Math.floor(Math.random() * 255);
    }

    async sendToFirebase(data) {
        try {
            console.log('📤 Enviando dados para Firebase:', data);
            
            // Enviar para Firebase real
            if (window.firebase && window.firebase.database) {
                const database = window.firebase.database();
                const docRef = await database.ref('vibrational_readings').push({
                    ...data,
                    timestamp: window.firebase.database.ServerValue.TIMESTAMP,
                    status: 'pending',
                    approved: false,
                    createdAt: new Date().toISOString()
                });
                
                console.log('✅ Dados enviados para Firebase com ID:', docRef.key);
                this.addLogEntry(`✅ Dados enviados para Firebase com ID: ${docRef.key}`);
                this.updateStatus('success', 'Dados Enviados!');
                
                // Reset após envio
                setTimeout(() => {
                    this.resetWidget();
                }, 3000);
            } else {
                // Fallback se Firebase não estiver disponível
                console.log('📤 Dados preparados para envio (Firebase não disponível):', data);
                this.addLogEntry('✅ Dados preparados para envio (modo offline)');
                this.updateStatus('success', 'Dados Preparados!');
                
                setTimeout(() => {
                    this.resetWidget();
                }, 3000);
            }
            
        } catch (error) {
            console.error('❌ Erro ao enviar dados:', error);
            this.addLogEntry(`❌ Erro ao enviar: ${error.message}`);
            this.updateStatus('error', 'Erro no Envio');
        }
    }

    // Método para integração com Firebase real
    setFirebaseConfig(config) {
        this.config.firebaseConfig = config;
    }
}

// Exportar para uso global
window.VibrationalWidget = VibrationalWidget;
