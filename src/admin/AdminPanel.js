/**
 * BioField Intelligence - Painel de Administração
 * Módulo Beta - Controle de autorização e geração de relatórios
 */

class AdminPanel {
    constructor(containerId, firebaseConfig) {
        this.containerId = containerId;
        this.firebaseConfig = firebaseConfig;
        this.pendingReadings = [];
        this.approvedReadings = [];
        this.isAuthenticated = false;
        
        this.init();
    }

    init() {
        this.createAdminPanel();
        this.setupEventListeners();
        this.authenticate();
    }

    createAdminPanel() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Container de admin não encontrado:', this.containerId);
            return;
        }

        container.innerHTML = `
            <div class="admin-panel">
                <div class="admin-header">
                    <h2>🔐 Painel de Administração BioField</h2>
                    <div class="auth-status">
                        <span id="auth-status" class="status-indicator">Desconectado</span>
                        <button id="login-btn" class="btn btn-primary">Login Admin</button>
                    </div>
                </div>

                <div class="admin-content" id="admin-content" style="display: none;">
                    <div class="admin-tabs">
                        <button class="tab-btn active" data-tab="pending">Leituras Pendentes</button>
                        <button class="tab-btn" data-tab="approved">Leituras Aprovadas</button>
                        <button class="tab-btn" data-tab="reports">Relatórios</button>
                        <button class="tab-btn" data-tab="settings">Configurações</button>
                    </div>

                    <div class="tab-content">
                        <!-- Leituras Pendentes -->
                        <div id="pending-tab" class="tab-pane active">
                            <div class="section-header">
                                <h3>📋 Leituras Aguardando Autorização</h3>
                                <div class="section-actions">
                                    <button id="refresh-pending" class="btn btn-secondary">Atualizar</button>
                                    <button id="approve-all" class="btn btn-success">Aprovar Todas</button>
                                </div>
                            </div>
                            <div id="pending-readings-list" class="readings-list">
                                <!-- Leituras pendentes serão carregadas aqui -->
                            </div>
                        </div>

                        <!-- Leituras Aprovadas -->
                        <div id="approved-tab" class="tab-pane">
                            <div class="section-header">
                                <h3>✅ Leituras Aprovadas</h3>
                                <div class="section-actions">
                                    <button id="refresh-approved" class="btn btn-secondary">Atualizar</button>
                                    <button id="generate-report" class="btn btn-primary">Gerar Relatório</button>
                                </div>
                            </div>
                            <div id="approved-readings-list" class="readings-list">
                                <!-- Leituras aprovadas serão carregadas aqui -->
                            </div>
                        </div>

                        <!-- Relatórios -->
                        <div id="reports-tab" class="tab-pane">
                            <div class="section-header">
                                <h3>📊 Relatórios e Espectros</h3>
                            </div>
                            <div class="reports-content">
                                <div class="report-filters">
                                    <select id="report-period">
                                        <option value="today">Hoje</option>
                                        <option value="week">Esta Semana</option>
                                        <option value="month">Este Mês</option>
                                        <option value="all">Todos</option>
                                    </select>
                                    <button id="generate-spectrum-report" class="btn btn-primary">Gerar Relatório de Espectros</button>
                                </div>
                                <div id="reports-container">
                                    <!-- Relatórios serão gerados aqui -->
                                </div>
                            </div>
                        </div>

                        <!-- Configurações -->
                        <div id="settings-tab" class="tab-pane">
                            <div class="section-header">
                                <h3>⚙️ Configurações do Sistema</h3>
                            </div>
                            <div class="settings-content">
                                <div class="setting-group">
                                    <label>Intervalo de Coleta (ms):</label>
                                    <input type="number" id="collection-interval" value="5000" min="1000" max="30000">
                                </div>
                                <div class="setting-group">
                                    <label>Auto-aprovação:</label>
                                    <input type="checkbox" id="auto-approval">
                                </div>
                                <div class="setting-group">
                                    <label>Notificações por Email:</label>
                                    <input type="email" id="notification-email" placeholder="admin@biofield.com">
                                </div>
                                <button id="save-settings" class="btn btn-primary">Salvar Configurações</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addAdminStyles();
    }

    addAdminStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .admin-panel {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                min-height: 600px;
            }

            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(34, 197, 94, 0.3);
            }

            .admin-header h2 {
                margin: 0;
                color: #22c55e;
            }

            .auth-status {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .status-indicator {
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
            }

            .status-indicator.connected {
                background: #22c55e;
                color: white;
            }

            .status-indicator.disconnected {
                background: #ef4444;
                color: white;
            }

            .admin-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(34, 197, 94, 0.2);
            }

            .tab-btn {
                padding: 12px 24px;
                border: none;
                background: transparent;
                color: #9ca3af;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                font-weight: 600;
            }

            .tab-btn.active {
                color: #22c55e;
                border-bottom-color: #22c55e;
            }

            .tab-btn:hover {
                color: white;
            }

            .tab-pane {
                display: none;
            }

            .tab-pane.active {
                display: block;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .section-header h3 {
                margin: 0;
                color: #22c55e;
            }

            .section-actions {
                display: flex;
                gap: 10px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: #22c55e;
                color: white;
            }

            .btn-primary:hover {
                background: #16a34a;
            }

            .btn-secondary {
                background: #6b7280;
                color: white;
            }

            .btn-secondary:hover {
                background: #4b5563;
            }

            .btn-success {
                background: #059669;
                color: white;
            }

            .btn-success:hover {
                background: #047857;
            }

            .btn-danger {
                background: #dc2626;
                color: white;
            }

            .btn-danger:hover {
                background: #b91c1c;
            }

            .readings-list {
                display: grid;
                gap: 15px;
            }

            .reading-card {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(34, 197, 94, 0.2);
                border-radius: 10px;
                padding: 20px;
                transition: all 0.3s ease;
            }

            .reading-card:hover {
                border-color: #22c55e;
                transform: translateY(-2px);
            }

            .reading-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .reading-id {
                font-weight: 600;
                color: #22c55e;
            }

            .reading-timestamp {
                color: #9ca3af;
                font-size: 14px;
            }

            .reading-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 15px;
            }

            .metric-item {
                text-align: center;
            }

            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #22c55e;
            }

            .metric-label {
                font-size: 12px;
                color: #9ca3af;
            }

            .reading-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .report-filters {
                display: flex;
                gap: 15px;
                align-items: center;
                margin-bottom: 20px;
            }

            .report-filters select {
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #374151;
                background: #1e293b;
                color: white;
            }

            .settings-content {
                max-width: 500px;
            }

            .setting-group {
                margin-bottom: 20px;
            }

            .setting-group label {
                display: block;
                margin-bottom: 8px;
                color: #9ca3af;
                font-weight: 600;
            }

            .setting-group input {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #374151;
                background: #1e293b;
                color: white;
            }

            .spectrum-chart {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }

            .chart-container {
                position: relative;
                height: 300px;
                margin: 20px 0;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Login
        document.getElementById('login-btn')?.addEventListener('click', () => this.showLoginModal());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Ações
        document.getElementById('refresh-pending')?.addEventListener('click', () => this.loadPendingReadings());
        document.getElementById('refresh-approved')?.addEventListener('click', () => this.loadApprovedReadings());
        document.getElementById('approve-all')?.addEventListener('click', () => this.approveAllReadings());
        document.getElementById('generate-report')?.addEventListener('click', () => this.generateReport());
        document.getElementById('generate-spectrum-report')?.addEventListener('click', () => this.generateSpectrumReport());
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
    }

    async authenticate() {
        // Simulação de autenticação (em produção, usar Firebase Auth)
        const adminToken = localStorage.getItem('biofield_admin_token');
        if (adminToken) {
            this.isAuthenticated = true;
            this.updateAuthStatus();
            this.loadPendingReadings();
        }
    }

    showLoginModal() {
        const password = prompt('Digite a senha de administrador:');
        if (password === 'biofield2024') { // Senha temporária
            this.isAuthenticated = true;
            localStorage.setItem('biofield_admin_token', 'admin_token_' + Date.now());
            this.updateAuthStatus();
            this.loadPendingReadings();
        } else {
            alert('Senha incorreta!');
        }
    }

    updateAuthStatus() {
        const statusElement = document.getElementById('auth-status');
        const contentElement = document.getElementById('admin-content');
        const loginBtn = document.getElementById('login-btn');

        if (this.isAuthenticated) {
            statusElement.textContent = 'Conectado';
            statusElement.className = 'status-indicator connected';
            contentElement.style.display = 'block';
            loginBtn.style.display = 'none';
        } else {
            statusElement.textContent = 'Desconectado';
            statusElement.className = 'status-indicator disconnected';
            contentElement.style.display = 'none';
            loginBtn.style.display = 'block';
        }
    }

    switchTab(tabName) {
        // Atualizar botões de tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Carregar dados específicos da tab
        if (tabName === 'pending') {
            this.loadPendingReadings();
        } else if (tabName === 'approved') {
            this.loadApprovedReadings();
        }
    }

    async loadPendingReadings() {
        // Simulação de carregamento de dados pendentes
        this.pendingReadings = this.generateMockPendingReadings();
        this.renderPendingReadings();
    }

    async loadApprovedReadings() {
        // Simulação de carregamento de dados aprovados
        this.approvedReadings = this.generateMockApprovedReadings();
        this.renderApprovedReadings();
    }

    generateMockPendingReadings() {
        const readings = [];
        for (let i = 0; i < 5; i++) {
            readings.push({
                id: `pending_${Date.now()}_${i}`,
                user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
                device_id: `device_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                localidade: ['Portugal', 'Brasil', 'Espanha'][Math.floor(Math.random() * 3)],
                readings: Array.from({length: Math.floor(Math.random() * 20) + 10}, () => ({
                    timestamp: new Date().toISOString(),
                    atividade_vibracional: Math.random() * 100,
                    coherence: Math.random() * 100,
                    espectro_vibracional_raw: Array.from({length: 100}, () => ({
                        freq: Math.random() * 10,
                        amplitude: Math.random() * 100,
                        phase: Math.random() * Math.PI * 2
                    }))
                })),
                consent_given: true,
                consent_timestamp: new Date().toISOString()
            });
        }
        return readings;
    }

    generateMockApprovedReadings() {
        const readings = [];
        for (let i = 0; i < 3; i++) {
            readings.push({
                id: `approved_${Date.now()}_${i}`,
                user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
                device_id: `device_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                localidade: ['Portugal', 'Brasil', 'Espanha'][Math.floor(Math.random() * 3)],
                readings: Array.from({length: Math.floor(Math.random() * 30) + 20}, () => ({
                    timestamp: new Date().toISOString(),
                    atividade_vibracional: Math.random() * 100,
                    coherence: Math.random() * 100,
                    espectro_vibracional_raw: Array.from({length: 100}, () => ({
                        freq: Math.random() * 10,
                        amplitude: Math.random() * 100,
                        phase: Math.random() * Math.PI * 2
                    }))
                })),
                approved_at: new Date().toISOString(),
                approved_by: 'admin'
            });
        }
        return readings;
    }

    renderPendingReadings() {
        const container = document.getElementById('pending-readings-list');
        if (!container) return;

        if (this.pendingReadings.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af;">Nenhuma leitura pendente</p>';
            return;
        }

        container.innerHTML = this.pendingReadings.map(reading => `
            <div class="reading-card">
                <div class="reading-header">
                    <div class="reading-id">${reading.id}</div>
                    <div class="reading-timestamp">${new Date(reading.timestamp).toLocaleString()}</div>
                </div>
                <div class="reading-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${reading.readings.length}</div>
                        <div class="metric-label">Leituras</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(reading.readings.reduce((acc, r) => acc + r.atividade_vibracional, 0) / reading.readings.length)}%</div>
                        <div class="metric-label">Atividade Média</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(reading.readings.reduce((acc, r) => acc + r.coherence, 0) / reading.readings.length)}%</div>
                        <div class="metric-label">Coerência Média</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${reading.localidade}</div>
                        <div class="metric-label">Localização</div>
                    </div>
                </div>
                <div class="reading-actions">
                    <button class="btn btn-primary" onclick="adminPanel.approveReading('${reading.id}')">Aprovar</button>
                    <button class="btn btn-secondary" onclick="adminPanel.viewSpectrum('${reading.id}')">Ver Espectro</button>
                    <button class="btn btn-danger" onclick="adminPanel.rejectReading('${reading.id}')">Rejeitar</button>
                </div>
            </div>
        `).join('');
    }

    renderApprovedReadings() {
        const container = document.getElementById('approved-readings-list');
        if (!container) return;

        if (this.approvedReadings.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af;">Nenhuma leitura aprovada</p>';
            return;
        }

        container.innerHTML = this.approvedReadings.map(reading => `
            <div class="reading-card">
                <div class="reading-header">
                    <div class="reading-id">${reading.id}</div>
                    <div class="reading-timestamp">Aprovado em ${new Date(reading.approved_at).toLocaleString()}</div>
                </div>
                <div class="reading-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${reading.readings.length}</div>
                        <div class="metric-label">Leituras</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(reading.readings.reduce((acc, r) => acc + r.atividade_vibracional, 0) / reading.readings.length)}%</div>
                        <div class="metric-label">Atividade Média</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(reading.readings.reduce((acc, r) => acc + r.coherence, 0) / reading.readings.length)}%</div>
                        <div class="metric-label">Coerência Média</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${reading.localidade}</div>
                        <div class="metric-label">Localização</div>
                    </div>
                </div>
                <div class="reading-actions">
                    <button class="btn btn-primary" onclick="adminPanel.generateReadingReport('${reading.id}')">Gerar Relatório</button>
                    <button class="btn btn-secondary" onclick="adminPanel.viewSpectrum('${reading.id}')">Ver Espectro</button>
                </div>
            </div>
        `).join('');
    }

    async approveReading(readingId) {
        const reading = this.pendingReadings.find(r => r.id === readingId);
        if (!reading) return;

        // Mover para aprovados
        reading.approved_at = new Date().toISOString();
        reading.approved_by = 'admin';
        this.approvedReadings.push(reading);
        this.pendingReadings = this.pendingReadings.filter(r => r.id !== readingId);

        // Atualizar interface
        this.renderPendingReadings();
        this.renderApprovedReadings();

        console.log('✅ Leitura aprovada:', readingId);
        alert('Leitura aprovada com sucesso!');
    }

    async rejectReading(readingId) {
        this.pendingReadings = this.pendingReadings.filter(r => r.id !== readingId);
        this.renderPendingReadings();
        
        console.log('❌ Leitura rejeitada:', readingId);
        alert('Leitura rejeitada!');
    }

    async approveAllReadings() {
        if (confirm('Tem certeza que deseja aprovar todas as leituras pendentes?')) {
            this.pendingReadings.forEach(reading => {
                reading.approved_at = new Date().toISOString();
                reading.approved_by = 'admin';
                this.approvedReadings.push(reading);
            });
            this.pendingReadings = [];
            
            this.renderPendingReadings();
            this.renderApprovedReadings();
            
            alert('Todas as leituras foram aprovadas!');
        }
    }

    viewSpectrum(readingId) {
        const reading = [...this.pendingReadings, ...this.approvedReadings].find(r => r.id === readingId);
        if (!reading) return;

        // Criar modal para visualizar espectro
        this.createSpectrumModal(reading);
    }

    createSpectrumModal(reading) {
        const modal = document.createElement('div');
        modal.className = 'spectrum-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Espectro Vibracional - ${reading.id}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="spectrum-info">
                        <p><strong>Usuário:</strong> ${reading.user_id}</p>
                        <p><strong>Localização:</strong> ${reading.localidade}</p>
                        <p><strong>Data:</strong> ${new Date(reading.timestamp).toLocaleString()}</p>
                        <p><strong>Total de Leituras:</strong> ${reading.readings.length}</p>
                    </div>
                    <div class="spectrum-chart">
                        <canvas id="spectrum-chart-${reading.id}" width="800" height="400"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .spectrum-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .modal-content {
                background: #1e293b;
                border-radius: 15px;
                padding: 20px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(34, 197, 94, 0.3);
            }

            .close-btn {
                background: none;
                border: none;
                color: #9ca3af;
                font-size: 24px;
                cursor: pointer;
            }

            .spectrum-info {
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
            }

            .spectrum-info p {
                margin: 5px 0;
                color: #9ca3af;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Fechar modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Gerar gráfico do espectro
        this.generateSpectrumChart(reading);
    }

    generateSpectrumChart(reading) {
        const canvas = document.getElementById(`spectrum-chart-${reading.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = reading.readings[0]?.espectro_vibracional_raw || [];

        // Desenhar espectro simples
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = (index / data.length) * canvas.width;
            const y = canvas.height - (point.amplitude / 100) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    generateReadingReport(readingId) {
        const reading = this.approvedReadings.find(r => r.id === readingId);
        if (!reading) return;

        // Gerar relatório PDF (simulação)
        console.log('📄 Gerando relatório para:', readingId);
        alert('Relatório gerado com sucesso! (Simulação)');
    }

    generateSpectrumReport() {
        console.log('📊 Gerando relatório de espectros...');
        alert('Relatório de espectros gerado! (Simulação)');
    }

    saveSettings() {
        const settings = {
            collectionInterval: document.getElementById('collection-interval').value,
            autoApproval: document.getElementById('auto-approval').checked,
            notificationEmail: document.getElementById('notification-email').value
        };

        localStorage.setItem('biofield_admin_settings', JSON.stringify(settings));
        alert('Configurações salvas com sucesso!');
    }
}

// Exportar para uso global
window.AdminPanel = AdminPanel;
