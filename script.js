// Plataforma Regenerativa Inteligente - JavaScript

class RegenPlatform {
    constructor() {
        this.currentSection = 'dashboard';
        this.sensors = new Map();
        this.metrics = new Map();
        this.nfts = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.initializeSensors();
        this.initBlockchain();
        this.initDigitalTwin();
        this.initAPIServices();
        this.initIoTSystem();
        this.initMarketplace();
        this.startRealTimeUpdates();
        this.setupAnimations();
        console.log('🌱 Plataforma Regenerativa Inteligente inicializada');
    }

    // Digital Twin functionality
    initDigitalTwin() {
        this.digitalTwin = {
            systems: {
                energy: { efficiency: 85, status: 'optimal', trend: 'increasing' },
                water: { usage: 1250, recycling: 78, status: 'good', trend: 'stable' },
                waste: { reduction: 65, recycling: 82, status: 'excellent', trend: 'increasing' },
                carbon: { offset: 1850, reduction: 45, status: 'good', trend: 'increasing' },
                biodiversity: { index: 92, protection: 88, status: 'excellent', trend: 'stable' }
            },
            predictions: {
                nextMonth: {
                    energyEfficiency: 87,
                    carbonReduction: 48,
                    wasteReduction: 68,
                    biodiversityIndex: 94
                },
                nextQuarter: {
                    energyEfficiency: 90,
                    carbonReduction: 52,
                    wasteReduction: 72,
                    biodiversityIndex: 96
                }
            },
            alerts: [
                { type: 'warning', message: 'Water usage above target by 8%', priority: 'medium' },
                { type: 'success', message: 'Carbon offset exceeded target by 15%', priority: 'low' },
                { type: 'info', message: 'New biodiversity data available', priority: 'low' }
            ]
        };
        
        this.updateDigitalTwinDisplay();
        console.log('Digital Twin initialized with predictive analytics');
    }
    
    updateDigitalTwinDisplay() {
        const container = document.querySelector('.digital-twin-container');
        if (!container) return;
        
        // Create or update the twin dashboard
        let dashboard = container.querySelector('.twin-dashboard');
        if (!dashboard) {
            dashboard = document.createElement('div');
            dashboard.className = 'twin-dashboard';
            container.appendChild(dashboard);
        }
        
        dashboard.innerHTML = `
            <div class="twin-systems">
                <h4>System Status</h4>
                <div class="systems-grid">
                    ${Object.entries(this.digitalTwin.systems).map(([key, system]) => `
                        <div class="system-card ${system.status}">
                            <div class="system-icon">
                                ${this.getSystemIcon(key)}
                            </div>
                            <div class="system-info">
                                <h5>${this.formatSystemName(key)}</h5>
                                <div class="system-metrics">
                                    ${this.getSystemMetrics(key, system)}
                                </div>
                                <div class="system-status status-${system.status}">
                                    ${system.status.toUpperCase()}
                                </div>
                            </div>
                            <div class="system-trend trend-${system.trend}">
                                ${this.getTrendIcon(system.trend)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="twin-predictions">
                <h4>Predictive Analytics</h4>
                <div class="predictions-grid">
                    <div class="prediction-card">
                        <h5>Next Month</h5>
                        <div class="prediction-metrics">
                            <div class="metric">
                                <span class="metric-label">Energy Efficiency</span>
                                <span class="metric-value">${this.digitalTwin.predictions.nextMonth.energyEfficiency}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Carbon Reduction</span>
                                <span class="metric-value">${this.digitalTwin.predictions.nextMonth.carbonReduction}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="prediction-card">
                        <h5>Next Quarter</h5>
                        <div class="prediction-metrics">
                            <div class="metric">
                                <span class="metric-label">Waste Reduction</span>
                                <span class="metric-value">${this.digitalTwin.predictions.nextQuarter.wasteReduction}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Biodiversity Index</span>
                                <span class="metric-value">${this.digitalTwin.predictions.nextQuarter.biodiversityIndex}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="twin-alerts">
                <h4>System Alerts</h4>
                <div class="alerts-list">
                    ${this.digitalTwin.alerts.map(alert => `
                        <div class="alert-item alert-${alert.type}">
                            <div class="alert-icon">
                                ${this.getAlertIcon(alert.type)}
                            </div>
                            <div class="alert-content">
                                <p>${alert.message}</p>
                                <span class="alert-priority priority-${alert.priority}">${alert.priority.toUpperCase()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    getSystemIcon(system) {
        const icons = {
            energy: '⚡',
            water: '💧',
            waste: '♻️',
            carbon: '🌱',
            biodiversity: '🦋'
        };
        return icons[system] || '📊';
    }
    
    formatSystemName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    getSystemMetrics(key, system) {
        const metrics = {
            energy: `Efficiency: ${system.efficiency}%`,
            water: `Usage: ${system.usage}L | Recycling: ${system.recycling}%`,
            waste: `Reduction: ${system.reduction}% | Recycling: ${system.recycling}%`,
            carbon: `Offset: ${system.offset}t | Reduction: ${system.reduction}%`,
            biodiversity: `Index: ${system.index} | Protection: ${system.protection}%`
        };
        return metrics[key] || 'No data';
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
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️',
            error: '❌'
        };
        return icons[type] || 'ℹ️';
    }
    
    simulateDigitalTwin() {
        // Simulate real-time updates to the digital twin
        Object.keys(this.digitalTwin.systems).forEach(key => {
            const system = this.digitalTwin.systems[key];
            
            // Simulate small changes in metrics
            if (key === 'energy' && system.efficiency) {
                system.efficiency += (Math.random() - 0.5) * 2;
                system.efficiency = Math.max(70, Math.min(100, system.efficiency));
            }
            
            if (key === 'water' && system.usage) {
                system.usage += (Math.random() - 0.5) * 50;
                system.usage = Math.max(1000, Math.min(1500, system.usage));
            }
            
            // Update status based on metrics
            if (key === 'energy') {
                system.status = system.efficiency > 90 ? 'excellent' : system.efficiency > 80 ? 'good' : 'optimal';
            }
        });
        
        this.updateDigitalTwinDisplay();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.switchSection(targetSection);
            });
        });
    }

    switchSection(sectionId) {
        // Remove active class from all sections and nav links
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to target section and nav link
        const targetSection = document.getElementById(sectionId);
        const targetNavLink = document.querySelector(`[href="#${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
        
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }

        // Trigger section-specific initialization
        this.initializeSection(sectionId);
    }

    initializeSection(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'metrics':
                this.updateMetrics();
                break;
            case 'blockchain':
                this.updateBlockchain();
                break;
            case 'iot':
                this.updateIoT();
                break;
            case 'marketplace':
                this.updateMarketplace();
                break;
            case 'apis':
                this.updateAPIServices();
                break;
        }
    }

    initializeSensors() {
        // Simular dados de sensores IoT
        this.sensors.set('air_quality', {
            value: 8,
            unit: 'μg/m³',
            status: 'Excelente',
            lastUpdate: new Date()
        });
        
        this.sensors.set('temperature', {
            value: 23,
            unit: '°C',
            humidity: 65,
            lastUpdate: new Date()
        });
        
        this.sensors.set('water_quality', {
            value: 7.2,
            unit: 'pH',
            status: 'Boa',
            lastUpdate: new Date()
        });

        this.sensors.set('soil_quality', {
            value: 85,
            unit: '%',
            nutrients: ['N: 45mg/kg', 'P: 23mg/kg', 'K: 67mg/kg'],
            lastUpdate: new Date()
        });
    }

    startRealTimeUpdates() {
        // Atualizar dados a cada 5 segundos
        setInterval(() => {
            this.updateSensorData();
            this.updateMetricsData();
            this.simulateDigitalTwin();
            if (this.currentSection === 'dashboard') {
                this.updateDashboard();
            }
            if (this.currentSection === 'apis') {
                this.updateAPIMetrics();
            }
            if (this.currentSection === 'iot') {
                this.updateIoTSensors();
            }
        }, 5000);

        // Atualizar animações das métricas
        setInterval(() => {
            this.animateMetricBars();
        }, 2000);
    }

    updateSensorData() {
        // Simular variações nos dados dos sensores
        this.sensors.forEach((sensor, key) => {
            switch(key) {
                case 'air_quality':
                    sensor.value = Math.max(5, Math.min(15, sensor.value + (Math.random() - 0.5) * 2));
                    sensor.status = sensor.value < 10 ? 'Excelente' : sensor.value < 20 ? 'Boa' : 'Regular';
                    break;
                case 'temperature':
                    sensor.value = Math.max(18, Math.min(28, sensor.value + (Math.random() - 0.5) * 1));
                    sensor.humidity = Math.max(40, Math.min(80, sensor.humidity + (Math.random() - 0.5) * 5));
                    break;
                case 'water_quality':
                    sensor.value = Math.max(6.5, Math.min(8.0, sensor.value + (Math.random() - 0.5) * 0.2));
                    sensor.status = sensor.value >= 6.5 && sensor.value <= 7.5 ? 'Excelente' : 'Boa';
                    break;
                case 'soil_quality':
                    sensor.value = Math.max(70, Math.min(95, sensor.value + (Math.random() - 0.5) * 3));
                    break;
            }
            sensor.lastUpdate = new Date();
        });
    }

    updateMetricsData() {
        // Atualizar métricas do dashboard
        const regenIndex = document.querySelector('.kpi-card:nth-child(1) .kpi-value');
        const globalImpact = document.querySelector('.kpi-card:nth-child(2) .kpi-value');
        const nftCount = document.querySelector('.kpi-card:nth-child(3) .kpi-value');
        const tokens = document.querySelector('.kpi-card:nth-child(4) .kpi-value');

        if (regenIndex) {
            const currentValue = parseFloat(regenIndex.textContent);
            const newValue = Math.max(75, Math.min(95, currentValue + (Math.random() - 0.5) * 0.5));
            regenIndex.textContent = newValue.toFixed(1) + '%';
        }

        if (globalImpact) {
            const currentValue = parseFloat(globalImpact.textContent);
            const newValue = currentValue + Math.random() * 0.01;
            globalImpact.textContent = newValue.toFixed(1) + 'M';
        }
    }

    updateDashboard() {
        // Atualizar barras de métricas do gêmeo digital
        const soilQuality = this.sensors.get('soil_quality');
        const waterQuality = this.sensors.get('water_quality');
        
        if (soilQuality) {
            const soilBar = document.querySelector('.metric-item:nth-child(1) .metric-fill');
            const soilValue = document.querySelector('.metric-item:nth-child(1) .metric-value');
            if (soilBar && soilValue) {
                soilBar.style.width = soilQuality.value + '%';
                soilValue.textContent = soilQuality.value.toFixed(0) + '%';
            }
        }

        if (waterQuality) {
            const waterBar = document.querySelector('.metric-item:nth-child(3) .metric-fill');
            const waterValue = document.querySelector('.metric-item:nth-child(3) .metric-value');
            if (waterBar && waterValue) {
                const percentage = Math.round((waterQuality.value - 6) / 2 * 100);
                waterBar.style.width = percentage + '%';
                waterValue.textContent = percentage + '%';
            }
        }
    }

    updateMetrics() {
        // Atualizar status dos sistemas de IA
        const analysisCards = document.querySelectorAll('.analysis-card');
        analysisCards.forEach((card, index) => {
            const status = card.querySelector('.status');
            if (status) {
                // Simular ocasionais mudanças de status
                if (Math.random() < 0.05) {
                    status.textContent = 'Processando';
                    status.className = 'status processing';
                    setTimeout(() => {
                        status.textContent = 'Ativo';
                        status.className = 'status active';
                    }, 3000);
                }
            }
        });
    }

    updateBlockchain() {
        // Simular novas certificações NFT
        if (Math.random() < 0.1) {
            this.generateNewNFT();
        }
        
        // Update blockchain display if on blockchain section
        if (this.currentSection === 'blockchain') {
            this.updateBlockchainDisplay();
        }
    }
    
    // Blockchain functionality
    initBlockchain() {
        this.blockchain = {
            chain: [],
            pendingTransactions: [],
            miningReward: 100,
            difficulty: 2
        };
        
        // Create genesis block
        this.createGenesisBlock();
        
        // Initialize certificates
        this.certificates = [
            {
                id: 'CERT-001',
                type: 'Carbon Neutral',
                company: 'EcoTech Solutions',
                status: 'Verified',
                carbonOffset: '1,250 tons CO2',
                validUntil: '2025-12-31',
                blockHash: '0x1a2b3c4d5e6f',
                timestamp: new Date('2024-01-15').toISOString()
            },
            {
                id: 'CERT-002',
                type: 'Renewable Energy',
                company: 'GreenPower Corp',
                status: 'Pending',
                energyGenerated: '500 MWh',
                validUntil: '2025-06-30',
                blockHash: '0x2b3c4d5e6f7a',
                timestamp: new Date('2024-02-20').toISOString()
            },
            {
                id: 'CERT-003',
                type: 'Biodiversity Protection',
                company: 'Nature Guardians',
                status: 'Verified',
                areaProtected: '1,000 hectares',
                validUntil: '2026-03-15',
                blockHash: '0x3c4d5e6f7a8b',
                timestamp: new Date('2024-03-10').toISOString()
            }
        ];
        
        this.updateBlockchainDisplay();
        console.log('Blockchain system initialized with certificates');
    }
    
    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: new Date().toISOString(),
            data: 'Genesis Block - Regenerative Platform',
            previousHash: '0',
            hash: this.calculateHash('0', 'Genesis Block - Regenerative Platform', new Date().toISOString()),
            nonce: 0
        };
        this.blockchain.chain.push(genesisBlock);
    }
    
    calculateHash(previousHash, data, timestamp) {
        return '0x' + Math.random().toString(16).substr(2, 16);
    }
    
    createCertificate(certificateData) {
        const newCert = {
            id: `CERT-${String(this.certificates.length + 1).padStart(3, '0')}`,
            ...certificateData,
            status: 'Pending',
            blockHash: this.calculateHash('prev', JSON.stringify(certificateData), new Date().toISOString()),
            timestamp: new Date().toISOString()
        };
        
        this.certificates.push(newCert);
        this.updateBlockchainDisplay();
        return newCert;
    }
    
    verifyCertificate(certId) {
        const cert = this.certificates.find(c => c.id === certId);
        if (cert) {
            cert.status = 'Verified';
            this.updateBlockchainDisplay();
            console.log(`Certificate ${certId} verified successfully!`);
        }
    }
    
    updateBlockchainDisplay() {
        const container = document.querySelector('.blockchain-card');
        if (!container) return;
        
        const certList = container.querySelector('.cert-list') || this.createCertList(container);
        
        certList.innerHTML = this.certificates.map(cert => `
            <div class="cert-item ${cert.status.toLowerCase()}">
                <div class="cert-header">
                    <h4>${cert.id}</h4>
                    <span class="cert-status status-${cert.status.toLowerCase()}">${cert.status}</span>
                </div>
                <div class="cert-details">
                    <p><strong>Type:</strong> ${cert.type}</p>
                    <p><strong>Company:</strong> ${cert.company}</p>
                    <p><strong>Valid Until:</strong> ${cert.validUntil}</p>
                    <p><strong>Block Hash:</strong> ${cert.blockHash}</p>
                </div>
                <div class="cert-actions">
                    ${cert.status === 'Pending' ? `<button class="btn-verify" onclick="window.regenPlatform.verifyCertificate('${cert.id}')">Verify</button>` : ''}
                    <button class="btn-view" onclick="window.regenPlatform.viewCertificate('${cert.id}')">View Details</button>
                </div>
            </div>
        `).join('');
    }
    
    createCertList(container) {
        const certList = document.createElement('div');
        certList.className = 'cert-list';
        container.appendChild(certList);
        return certList;
    }
    
    viewCertificate(certId) {
        const cert = this.certificates.find(c => c.id === certId);
        if (cert) {
            this.showCertificateModal(cert);
        }
    }
    
    showCertificateModal(cert) {
        const modal = document.createElement('div');
        modal.className = 'cert-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Certificate Details</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cert-info">
                        <h4>${cert.id} - ${cert.type}</h4>
                        <p><strong>Company:</strong> ${cert.company}</p>
                        <p><strong>Status:</strong> <span class="status-${cert.status.toLowerCase()}">${cert.status}</span></p>
                        <p><strong>Valid Until:</strong> ${cert.validUntil}</p>
                        <p><strong>Block Hash:</strong> ${cert.blockHash}</p>
                        <p><strong>Timestamp:</strong> ${new Date(cert.timestamp).toLocaleString()}</p>
                        ${cert.carbonOffset ? `<p><strong>Carbon Offset:</strong> ${cert.carbonOffset}</p>` : ''}
                        ${cert.energyGenerated ? `<p><strong>Energy Generated:</strong> ${cert.energyGenerated}</p>` : ''}
                        ${cert.areaProtected ? `<p><strong>Area Protected:</strong> ${cert.areaProtected}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    updateIoT() {
        if (!this.iotSystem) {
            this.initIoTSystem();
        }
        this.updateIoTDisplay();
    }
    
    updateIoTDisplay() {
        const content = document.getElementById('content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="iot-dashboard">
                <div class="iot-overview">
                    <h3>🌐 Sistema IoT & Sensores</h3>
                    <div class="iot-stats">
                        <div class="stat-card">
                            <div class="stat-icon">📡</div>
                            <div class="stat-info">
                                <h4>${this.iotSystem.metrics.totalSensors}</h4>
                                <p>Total de Sensores</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-info">
                                <h4>${this.iotSystem.metrics.activeSensors}</h4>
                                <p>Sensores Ativos</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <h4>${this.iotSystem.metrics.dataPoints.toLocaleString()}</h4>
                                <p>Pontos de Dados</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🌐</div>
                            <div class="stat-info">
                                <h4>${this.iotSystem.metrics.networkHealth}%</h4>
                                <p>Saúde da Rede</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="iot-sections">
                    <div class="sensors-section">
                        <h4>📡 Sensores Ambientais</h4>
                        <div class="sensors-grid">
                            ${this.iotSystem.sensors.map(sensor => `
                                <div class="sensor-card sensor-${sensor.status}">
                                    <div class="sensor-header">
                                        <div class="sensor-icon">${this.getSensorIcon(sensor.type)}</div>
                                        <div class="sensor-info">
                                            <h5>${sensor.name}</h5>
                                            <p>${sensor.location}</p>
                                        </div>
                                        <div class="sensor-status status-${sensor.status}">${sensor.status}</div>
                                    </div>
                                    <div class="sensor-reading">
                                        <div class="reading-value">
                                            <span class="value">${sensor.lastReading.value}</span>
                                            <span class="unit">${sensor.lastReading.unit}</span>
                                        </div>
                                        <div class="reading-quality quality-${sensor.lastReading.quality}">
                                            ${sensor.lastReading.quality}
                                        </div>
                                    </div>
                                    <div class="sensor-metrics">
                                        <div class="metric">
                                            <span class="metric-label">Bateria:</span>
                                            <div class="battery-indicator">
                                                <div class="battery-fill" style="width: ${sensor.battery}%"></div>
                                            </div>
                                            <span class="metric-value">${sensor.battery}%</span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">Sinal:</span>
                                            <div class="signal-bars">
                                                ${this.generateSignalBars(sensor.signal)}
                                            </div>
                                            <span class="metric-value">${sensor.signal}%</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                
                    <div class="gateways-section">
                        <h4>🌐 Gateways de Rede</h4>
                        <div class="gateways-list">
                            ${this.iotSystem.gateways.map(gateway => `
                                <div class="gateway-card">
                                    <div class="gateway-header">
                                        <div class="gateway-icon">🌐</div>
                                        <div class="gateway-info">
                                            <h5>${gateway.name}</h5>
                                            <p>${gateway.location}</p>
                                        </div>
                                        <div class="gateway-status status-${gateway.status}">${gateway.status}</div>
                                    </div>
                                    <div class="gateway-metrics">
                                        <div class="metric">
                                            <span class="metric-label">Sensores Conectados:</span>
                                            <span class="metric-value">${gateway.connectedSensors}</span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">Taxa de Dados:</span>
                                            <span class="metric-value">${gateway.dataRate}</span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">Uptime:</span>
                                            <span class="metric-value">${gateway.uptime}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="iot-alerts">
                    <h4>⚠️ Alertas do Sistema</h4>
                    <div class="alerts-container">
                        ${this.iotSystem.alerts.length > 0 ? this.iotSystem.alerts.slice(0, 5).map(alert => `
                            <div class="alert-item alert-${alert.type}">
                                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                                <div class="alert-content">
                                    <h6>${alert.title}</h6>
                                    <p>${alert.message}</p>
                                    <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div class="alert-priority priority-${alert.priority}">${alert.priority}</div>
                            </div>
                        `).join('') : '<p class="no-alerts">✅ Nenhum alerta ativo no momento</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    // Enhanced IoT System and Sensors
    initIoTSystem() {
        this.iotSystem = {
            sensors: [
                {
                    id: 'sensor-001',
                    name: 'Sensor de Qualidade do Ar',
                    type: 'air_quality',
                    location: 'Zona Industrial A',
                    status: 'active',
                    battery: 87,
                    signal: 92,
                    lastReading: {
                        value: 42,
                        unit: 'AQI',
                        timestamp: new Date().toISOString(),
                        quality: 'good'
                    },
                    coordinates: { lat: -23.5505, lng: -46.6333 }
                },
                {
                    id: 'sensor-002',
                    name: 'Sensor de Temperatura',
                    type: 'temperature',
                    location: 'Estufa Vertical 1',
                    status: 'active',
                    battery: 94,
                    signal: 88,
                    lastReading: {
                        value: 24.5,
                        unit: '°C',
                        timestamp: new Date().toISOString(),
                        quality: 'optimal'
                    },
                    coordinates: { lat: -23.5515, lng: -46.6343 }
                },
                {
                    id: 'sensor-003',
                    name: 'Sensor de Umidade do Solo',
                    type: 'soil_moisture',
                    location: 'Horta Comunitária',
                    status: 'active',
                    battery: 76,
                    signal: 95,
                    lastReading: {
                        value: 68,
                        unit: '%',
                        timestamp: new Date().toISOString(),
                        quality: 'good'
                    },
                    coordinates: { lat: -23.5525, lng: -46.6353 }
                },
                {
                    id: 'sensor-004',
                    name: 'Sensor de Energia Solar',
                    type: 'solar_energy',
                    location: 'Painel Solar Bloco B',
                    status: 'active',
                    battery: 100,
                    signal: 97,
                    lastReading: {
                        value: 3.2,
                        unit: 'kW',
                        timestamp: new Date().toISOString(),
                        quality: 'excellent'
                    },
                    coordinates: { lat: -23.5535, lng: -46.6363 }
                },
                {
                    id: 'sensor-005',
                    name: 'Sensor de Consumo de Água',
                    type: 'water_consumption',
                    location: 'Sistema de Irrigação',
                    status: 'warning',
                    battery: 23,
                    signal: 78,
                    lastReading: {
                        value: 145.7,
                        unit: 'L/h',
                        timestamp: new Date().toISOString(),
                        quality: 'warning'
                    },
                    coordinates: { lat: -23.5545, lng: -46.6373 }
                },
                {
                    id: 'sensor-006',
                    name: 'Sensor de CO2',
                    type: 'co2',
                    location: 'Laboratório Verde',
                    status: 'active',
                    battery: 89,
                    signal: 91,
                    lastReading: {
                        value: 380,
                        unit: 'ppm',
                        timestamp: new Date().toISOString(),
                        quality: 'good'
                    },
                    coordinates: { lat: -23.5555, lng: -46.6383 }
                }
            ],
            gateways: [
                {
                    id: 'gateway-001',
                    name: 'Gateway Principal',
                    location: 'Centro de Controle',
                    status: 'online',
                    connectedSensors: 4,
                    dataRate: '2.4 MB/h',
                    uptime: '99.8%',
                    lastSync: new Date().toISOString()
                },
                {
                    id: 'gateway-002',
                    name: 'Gateway Secundário',
                    location: 'Área Externa',
                    status: 'online',
                    connectedSensors: 2,
                    dataRate: '1.8 MB/h',
                    uptime: '97.2%',
                    lastSync: new Date().toISOString()
                }
            ],
            networks: [
                {
                    id: 'network-001',
                    name: 'LoRaWAN Principal',
                    type: 'LoRaWAN',
                    coverage: '95%',
                    bandwidth: '125 kHz',
                    devices: 6,
                    status: 'optimal'
                },
                {
                    id: 'network-002',
                    name: 'WiFi Backup',
                    type: 'WiFi',
                    coverage: '78%',
                    bandwidth: '2.4 GHz',
                    devices: 2,
                    status: 'good'
                }
            ],
            metrics: {
                totalSensors: 6,
                activeSensors: 5,
                dataPoints: Math.floor(Math.random() * 10000) + 50000,
                networkHealth: 98.7
            },
            alerts: []
        };
        
        this.generateIoTAlerts();
        console.log('Enhanced IoT System initialized with environmental sensors');
    }
    
    generateIoTAlerts() {
        this.iotSystem.alerts = [];
        
        // Check for low battery sensors
        this.iotSystem.sensors.forEach(sensor => {
            if (sensor.battery < 30) {
                this.iotSystem.alerts.push({
                    id: `alert-battery-${sensor.id}`,
                    type: 'warning',
                    title: 'Bateria Baixa',
                    message: `Sensor ${sensor.name} com bateria em ${sensor.battery}%`,
                    timestamp: new Date().toISOString(),
                    priority: 'medium',
                    sensor: sensor.id
                });
            }
            
            if (sensor.signal < 80) {
                this.iotSystem.alerts.push({
                    id: `alert-signal-${sensor.id}`,
                    type: 'warning',
                    title: 'Sinal Fraco',
                    message: `Sensor ${sensor.name} com sinal de ${sensor.signal}%`,
                    timestamp: new Date().toISOString(),
                    priority: 'low',
                    sensor: sensor.id
                });
            }
            
            if (sensor.status === 'warning') {
                this.iotSystem.alerts.push({
                    id: `alert-status-${sensor.id}`,
                    type: 'error',
                    title: 'Sensor em Alerta',
                    message: `${sensor.name} requer atenção imediata`,
                    timestamp: new Date().toISOString(),
                    priority: 'high',
                    sensor: sensor.id
                });
            }
        });
        
        // Sort alerts by priority
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        this.iotSystem.alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
    
    updateIoTSensors() {
        if (!this.iotSystem) return;
        
        // Simulate real-time sensor updates
        this.iotSystem.sensors.forEach(sensor => {
            // Update sensor readings
            switch (sensor.type) {
                case 'air_quality':
                    sensor.lastReading.value = Math.max(0, Math.min(500, sensor.lastReading.value + (Math.random() - 0.5) * 10));
                    break;
                case 'temperature':
                    sensor.lastReading.value = Math.max(-10, Math.min(50, sensor.lastReading.value + (Math.random() - 0.5) * 2));
                    break;
                case 'soil_moisture':
                    sensor.lastReading.value = Math.max(0, Math.min(100, sensor.lastReading.value + (Math.random() - 0.5) * 5));
                    break;
                case 'solar_energy':
                    sensor.lastReading.value = Math.max(0, Math.min(5, sensor.lastReading.value + (Math.random() - 0.5) * 0.5));
                    break;
                case 'water_consumption':
                    sensor.lastReading.value = Math.max(0, sensor.lastReading.value + (Math.random() - 0.3) * 20);
                    break;
                case 'co2':
                    sensor.lastReading.value = Math.max(300, Math.min(1000, sensor.lastReading.value + (Math.random() - 0.5) * 20));
                    break;
            }
            
            // Update battery (slowly decrease)
            if (Math.random() < 0.1) {
                sensor.battery = Math.max(0, sensor.battery - Math.random());
            }
            
            // Update signal strength
            sensor.signal = Math.max(60, Math.min(100, sensor.signal + (Math.random() - 0.5) * 5));
            
            // Update timestamp
            sensor.lastReading.timestamp = new Date().toISOString();
        });
        
        // Update metrics
        this.iotSystem.metrics.dataPoints += Math.floor(Math.random() * 50) + 10;
        this.iotSystem.metrics.networkHealth = Math.max(95, Math.min(100, this.iotSystem.metrics.networkHealth + (Math.random() - 0.5) * 2));
        
        // Regenerate alerts
        this.generateIoTAlerts();
    }
    
    getSensorIcon(type) {
        const icons = {
            'air_quality': '🌬️',
            'temperature': '🌡️',
            'soil_moisture': '💧',
            'solar_energy': '☀️',
            'water_consumption': '🚰',
            'co2': '🌱'
        };
        return icons[type] || '📡';
    }
    
    generateSignalBars(signal) {
        const bars = 4;
        const filledBars = Math.ceil((signal / 100) * bars);
        let html = '';
        for (let i = 1; i <= bars; i++) {
            html += `<div class="signal-bar ${i <= filledBars ? 'active' : ''}"></div>`;
        }
        return html;
    }

    updateMarketplace() {
        // Simular mudanças de preços no marketplace
        const priceElements = document.querySelectorAll('.product-price');
        priceElements.forEach(priceEl => {
            if (Math.random() < 0.1) {
                const currentPrice = parseInt(priceEl.textContent.replace('€', ''));
                const variation = (Math.random() - 0.5) * 20;
                const newPrice = Math.max(50, currentPrice + variation);
                priceEl.textContent = `€${Math.round(newPrice)}`;
            }
        });
    }

    generateNewNFT() {
        const nftTypes = [
            { name: 'Reflorestamento', icon: 'fas fa-tree', description: 'árvores plantadas' },
            { name: 'Purificação Água', icon: 'fas fa-water', description: 'litros tratados' },
            { name: 'Energia Solar', icon: 'fas fa-solar-panel', description: 'kWh gerados' },
            { name: 'Compostagem', icon: 'fas fa-recycle', description: 'kg processados' }
        ];

        const randomType = nftTypes[Math.floor(Math.random() * nftTypes.length)];
        const nftId = String(this.nfts.length + 1).padStart(3, '0');
        const value = (Math.random() * 3 + 0.5).toFixed(1);

        console.log(`🎨 Nova certificação NFT gerada: ${randomType.name} #${nftId} - ${value} ETH`);
    }

    animateMetricBars() {
        const metricBars = document.querySelectorAll('.metric-fill');
        metricBars.forEach(bar => {
            const currentWidth = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = currentWidth;
            }, 100);
        });
    }

    setupAnimations() {
        // Animação de entrada para cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar todos os cards para animação
        const cards = document.querySelectorAll('.kpi-card, .analysis-card, .nft-card, .sensor-card, .product-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    // Método para simular integração com APIs externas
    async simulateAPICall(endpoint, data = null) {
        console.log(`🔄 Chamada API simulada para: ${endpoint}`);
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        // Simular resposta baseada no endpoint
        switch(endpoint) {
            case '/api/sensors':
                return Array.from(this.sensors.entries()).map(([key, value]) => ({ id: key, ...value }));
            case '/api/blockchain/nfts':
                return this.nfts;
            case '/api/metrics/regenerative-index':
                return { value: 87.5, trend: '+12.3%' };
            default:
                return { success: true, timestamp: new Date().toISOString() };
        }
    }

    // API Services and Microservices
    initAPIServices() {
        this.apiServices = {
            endpoints: [
                {
                    id: 'api-001',
                    name: 'Metrics API',
                    path: '/api/v1/metrics',
                    method: 'GET',
                    status: 'active',
                    requests: 1247,
                    avgResponseTime: 120,
                    successRate: 99.2,
                    lastAccess: new Date().toISOString()
                },
                {
                    id: 'api-002',
                    name: 'Blockchain API',
                    path: '/api/v1/blockchain',
                    method: 'POST',
                    status: 'active',
                    requests: 856,
                    avgResponseTime: 180,
                    successRate: 97.8,
                    lastAccess: new Date().toISOString()
                },
                {
                    id: 'api-003',
                    name: 'IoT Data API',
                    path: '/api/v1/iot/sensors',
                    method: 'GET',
                    status: 'active',
                    requests: 2341,
                    avgResponseTime: 95,
                    successRate: 99.5,
                    lastAccess: new Date().toISOString()
                },
                {
                    id: 'api-004',
                    name: 'Authentication API',
                    path: '/api/v1/auth',
                    method: 'POST',
                    status: 'active',
                    requests: 567,
                    avgResponseTime: 200,
                    successRate: 98.1,
                    lastAccess: new Date().toISOString()
                }
            ],
            microservices: [
                {
                    id: 'ms-001',
                    name: 'Data Processing Service',
                    status: 'running',
                    health: 'healthy',
                    cpu: 45,
                    memory: 67,
                    instances: 3,
                    uptime: '15d 8h 23m',
                    version: 'v2.1.4'
                },
                {
                    id: 'ms-002',
                    name: 'Notification Service',
                    status: 'running',
                    health: 'healthy',
                    cpu: 23,
                    memory: 34,
                    instances: 2,
                    uptime: '12d 14h 56m',
                    version: 'v1.8.2'
                },
                {
                    id: 'ms-003',
                    name: 'Analytics Engine',
                    status: 'running',
                    health: 'warning',
                    cpu: 78,
                    memory: 89,
                    instances: 4,
                    uptime: '7d 3h 12m',
                    version: 'v3.0.1'
                },
                {
                    id: 'ms-004',
                    name: 'File Storage Service',
                    status: 'running',
                    health: 'healthy',
                    cpu: 12,
                    memory: 28,
                    instances: 2,
                    uptime: '22d 11h 45m',
                    version: 'v1.5.7'
                }
            ],
            metrics: {
                totalRequests: 5011,
                successRate: 98.5,
                avgResponseTime: 145,
                activeConnections: 23
            },
            logs: []
        };
        
        this.generateAPILogs();
        console.log('API Services and Microservices initialized');
    }
    
    generateAPILogs() {
        const logTypes = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'];
        const endpoints = ['/api/v1/metrics', '/api/v1/blockchain', '/api/v1/iot/sensors', '/api/v1/auth'];
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        
        this.apiServices.logs = [];
        
        for (let i = 0; i < 20; i++) {
            const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
            const type = logTypes[Math.floor(Math.random() * logTypes.length)];
            const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
            const method = methods[Math.floor(Math.random() * methods.length)];
            const responseTime = Math.floor(Math.random() * 500) + 50;
            const statusCode = type === 'ERROR' ? 500 : (type === 'WARNING' ? 404 : 200);
            
            this.apiServices.logs.push({
                id: `log-${i + 1}`,
                timestamp,
                type,
                method,
                endpoint,
                statusCode,
                responseTime,
                message: this.generateLogMessage(type, endpoint, statusCode)
            });
        }
        
        // Sort by timestamp (newest first)
        this.apiServices.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    generateLogMessage(type, endpoint, statusCode) {
        const messages = {
            'INFO': `Request processed successfully for ${endpoint}`,
            'SUCCESS': `${endpoint} returned ${statusCode} - Operation completed`,
            'WARNING': `${endpoint} returned ${statusCode} - Resource not found`,
            'ERROR': `${endpoint} returned ${statusCode} - Internal server error`
        };
        return messages[type] || 'Unknown log message';
    }
    
    updateAPIServices() {
        const container = document.querySelector('.api-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="api-dashboard">
                <div class="api-overview">
                    <h3>🔗 API Services & Microservices</h3>
                    <div class="api-stats">
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <h4>${this.apiServices.metrics.totalRequests.toLocaleString()}</h4>
                                <p>Total Requests</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-info">
                                <h4>${this.apiServices.metrics.successRate}%</h4>
                                <p>Success Rate</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-info">
                                <h4>${this.apiServices.metrics.avgResponseTime}ms</h4>
                                <p>Avg Response Time</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔗</div>
                            <div class="stat-info">
                                <h4>${this.apiServices.metrics.activeConnections}</h4>
                                <p>Active Connections</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="api-sections">
                    <div class="api-endpoints">
                        <h4>🌐 API Endpoints</h4>
                        <div class="endpoints-list">
                            ${this.apiServices.endpoints.map(endpoint => `
                                <div class="endpoint-card">
                                    <div class="endpoint-header">
                                        <div class="endpoint-method method-${endpoint.method.toLowerCase()}">${endpoint.method}</div>
                                        <div class="endpoint-path">${endpoint.path}</div>
                                        <div class="endpoint-status status-${endpoint.status}">${endpoint.status}</div>
                                    </div>
                                    <div class="endpoint-metrics">
                                        <div class="metric">
                                            <span class="metric-label">Requests:</span>
                                            <span class="metric-value">${endpoint.requests.toLocaleString()}</span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">Response Time:</span>
                                            <span class="metric-value">${endpoint.avgResponseTime}ms</span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">Success Rate:</span>
                                            <span class="metric-value">${endpoint.successRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="microservices">
                        <h4>⚙️ Microservices</h4>
                        <div class="services-grid">
                            ${this.apiServices.microservices.map(service => `
                                <div class="service-card">
                                    <div class="service-header">
                                        <h5>${service.name}</h5>
                                        <div class="service-status status-${service.status}">${service.status}</div>
                                    </div>
                                    <div class="service-health health-${service.health}">
                                        <span class="health-indicator"></span>
                                        ${service.health}
                                    </div>
                                    <div class="service-metrics">
                                        <div class="resource-usage">
                                            <div class="usage-item">
                                                <span>CPU:</span>
                                                <div class="usage-bar">
                                                    <div class="usage-fill" style="width: ${service.cpu}%"></div>
                                                </div>
                                                <span>${service.cpu}%</span>
                                            </div>
                                            <div class="usage-item">
                                                <span>Memory:</span>
                                                <div class="usage-bar">
                                                    <div class="usage-fill" style="width: ${service.memory}%"></div>
                                                </div>
                                                <span>${service.memory}%</span>
                                            </div>
                                        </div>
                                        <div class="service-info">
                                            <p><strong>Instances:</strong> ${service.instances}</p>
                                            <p><strong>Uptime:</strong> ${service.uptime}</p>
                                            <p><strong>Version:</strong> ${service.version}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="api-logs">
                    <h4>📋 API Logs</h4>
                    <div class="logs-container">
                        ${this.apiServices.logs.slice(0, 10).map(log => `
                            <div class="log-entry log-${log.type.toLowerCase()}">
                                <div class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</div>
                                <div class="log-type">${log.type}</div>
                                <div class="log-method">${log.method}</div>
                                <div class="log-endpoint">${log.endpoint}</div>
                                <div class="log-status">${log.statusCode}</div>
                                <div class="log-time">${log.responseTime}ms</div>
                                <div class="log-message">${log.message}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    updateAPIMetrics() {
        // Simulate real-time API metrics updates
        this.apiServices.metrics.totalRequests += Math.floor(Math.random() * 10) + 1;
        this.apiServices.metrics.activeConnections = Math.floor(Math.random() * 50) + 10;
        this.apiServices.metrics.avgResponseTime = Math.floor(Math.random() * 100) + 100;
        
        // Update endpoint metrics
        this.apiServices.endpoints.forEach(endpoint => {
            endpoint.requests += Math.floor(Math.random() * 5);
            endpoint.avgResponseTime = Math.floor(Math.random() * 100) + 80;
            endpoint.lastAccess = new Date().toISOString();
        });
        
        // Update microservice metrics
        this.apiServices.microservices.forEach(service => {
            service.cpu = Math.max(10, Math.min(90, service.cpu + (Math.random() - 0.5) * 10));
            service.memory = Math.max(20, Math.min(95, service.memory + (Math.random() - 0.5) * 8));
        });
        
        // Add new log entry occasionally
        if (Math.random() < 0.3) {
            const logTypes = ['INFO', 'SUCCESS', 'WARNING'];
            const endpoints = ['/api/v1/metrics', '/api/v1/blockchain', '/api/v1/iot/sensors', '/api/v1/auth'];
            const methods = ['GET', 'POST', 'PUT'];
            
            const newLog = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: logTypes[Math.floor(Math.random() * logTypes.length)],
                method: methods[Math.floor(Math.random() * methods.length)],
                endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
                statusCode: 200,
                responseTime: Math.floor(Math.random() * 300) + 50,
                message: 'Real-time request processed successfully'
            };
            
            this.apiServices.logs.unshift(newLog);
            this.apiServices.logs = this.apiServices.logs.slice(0, 50); // Keep only last 50 logs
        }
        
        if (this.currentSection === 'apis') {
            this.updateAPIServices();
        }
    }

    // Método para exportar dados (funcionalidade futura)
    exportData(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            sensors: Object.fromEntries(this.sensors),
            metrics: Object.fromEntries(this.metrics),
            nfts: this.nfts
        };

        console.log(`📊 Exportando dados em formato ${format}:`, data);
        return data;
    }
}

// Inicializar a plataforma quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.regenPlatform = new RegenPlatform();
});

// Adicionar alguns utilitários globais
window.RegenUtils = {
    formatCurrency: (value, currency = 'EUR') => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: currency
        }).format(value);
    },
    
    formatDate: (date) => {
        return new Intl.DateTimeFormat('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    calculateCarbonFootprint: (data) => {
        // Algoritmo simplificado para cálculo de pegada de carbono
        const baseValue = 2.4; // toneladas base
        const efficiency = data.efficiency || 0.85;
        return baseValue * efficiency;
    }
};

console.log('🌍 Plataforma Regenerativa Inteligente carregada com sucesso!');
console.log('💡 Use window.regenPlatform para acessar a instância principal');
console.log('🛠️ Use window.RegenUtils para utilitários auxiliares');