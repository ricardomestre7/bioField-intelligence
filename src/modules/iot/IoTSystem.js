/**
 * Sistema de IoT e Sensores
 * @author RegenTech Solutions
 * @version 2.0.0
 */

import { Logger } from '../../utils/Logger.js';
import { ConfigManager } from '../../config/ConfigManager.js';

export class IoTSystem {
    constructor(config = {}) {
        this.config = {
            enableRealTimeUpdates: config.enableRealTimeUpdates !== false,
            updateInterval: config.updateInterval || 5000,
            maxSensors: config.maxSensors || 100,
            enableAlerts: config.enableAlerts !== false,
            enableDataLogging: config.enableDataLogging !== false,
            enablePredictiveAnalysis: config.enablePredictiveAnalysis !== false,
            ...config
        };
        
        this.logger = new Logger('IoTSystem');
        this.configManager = new ConfigManager();
        this.isInitialized = false;
        
        // Estado do sistema
        this.sensors = new Map();
        this.gateways = new Map();
        this.devices = new Map();
        this.networks = new Map();
        this.dataStreams = new Map();
        this.alerts = [];
        this.analytics = {
            totalReadings: 0,
            activeDevices: 0,
            networkHealth: 100,
            dataQuality: 95
        };
        
        // Intervalos e timers
        this.updateInterval = null;
        this.analyticsInterval = null;
        this.alertCheckInterval = null;
        
        this.initializeSystem();
    }

    async initialize() {
        try {
            this.logger.info('Inicializando Sistema IoT...');
            
            // Carregar configurações
            await this.loadConfiguration();
            
            // Inicializar sensores
            await this.initializeSensors();
            
            // Configurar gateways
            await this.setupGateways();
            
            // Inicializar redes
            await this.initializeNetworks();
            
            // Configurar coleta de dados
            if (this.config.enableDataLogging) {
                await this.setupDataLogging();
            }
            
            // Configurar alertas
            if (this.config.enableAlerts) {
                await this.setupAlertSystem();
            }
            
            // Iniciar atualizações em tempo real
            if (this.config.enableRealTimeUpdates) {
                this.startRealTimeUpdates();
            }
            
            // Configurar análise preditiva
            if (this.config.enablePredictiveAnalysis) {
                await this.setupPredictiveAnalysis();
            }
            
            this.isInitialized = true;
            this.logger.success('Sistema IoT inicializado com sucesso');
            
        } catch (error) {
            this.logger.error('Erro ao inicializar Sistema IoT:', error);
            throw error;
        }
    }

    initializeSystem() {
        // Tipos de sensores suportados
        this.sensorTypes = {
            temperature: {
                name: 'Temperatura',
                unit: '°C',
                icon: '🌡️',
                range: { min: -40, max: 85 },
                accuracy: 0.1,
                category: 'environmental'
            },
            humidity: {
                name: 'Umidade',
                unit: '%',
                icon: '💧',
                range: { min: 0, max: 100 },
                accuracy: 1,
                category: 'environmental'
            },
            soilMoisture: {
                name: 'Umidade do Solo',
                unit: '%',
                icon: '🌱',
                range: { min: 0, max: 100 },
                accuracy: 2,
                category: 'agricultural'
            },
            ph: {
                name: 'pH do Solo',
                unit: 'pH',
                icon: '⚗️',
                range: { min: 0, max: 14 },
                accuracy: 0.1,
                category: 'agricultural'
            },
            lightIntensity: {
                name: 'Intensidade Luminosa',
                unit: 'lux',
                icon: '☀️',
                range: { min: 0, max: 100000 },
                accuracy: 10,
                category: 'environmental'
            },
            airQuality: {
                name: 'Qualidade do Ar',
                unit: 'AQI',
                icon: '🌬️',
                range: { min: 0, max: 500 },
                accuracy: 1,
                category: 'environmental'
            },
            carbonDioxide: {
                name: 'CO2',
                unit: 'ppm',
                icon: '💨',
                range: { min: 300, max: 5000 },
                accuracy: 10,
                category: 'environmental'
            },
            waterLevel: {
                name: 'Nível de Água',
                unit: 'cm',
                icon: '🌊',
                range: { min: 0, max: 500 },
                accuracy: 1,
                category: 'water'
            },
            energy: {
                name: 'Consumo Energético',
                unit: 'kWh',
                icon: '⚡',
                range: { min: 0, max: 1000 },
                accuracy: 0.01,
                category: 'energy'
            },
            motion: {
                name: 'Movimento',
                unit: 'bool',
                icon: '🚶',
                range: { min: 0, max: 1 },
                accuracy: 1,
                category: 'security'
            }
        };
        
        // Protocolos de comunicação
        this.protocols = {
            wifi: { name: 'Wi-Fi', icon: '📶', range: '50m', power: 'medium' },
            bluetooth: { name: 'Bluetooth', icon: '📱', range: '10m', power: 'low' },
            zigbee: { name: 'ZigBee', icon: '🔗', range: '100m', power: 'low' },
            lora: { name: 'LoRa', icon: '📡', range: '15km', power: 'low' },
            cellular: { name: 'Celular', icon: '📶', range: 'unlimited', power: 'high' },
            ethernet: { name: 'Ethernet', icon: '🔌', range: '100m', power: 'medium' }
        };
        
        // Status dos dispositivos
        this.deviceStatus = {
            online: { name: 'Online', color: '#4CAF50', icon: '🟢' },
            offline: { name: 'Offline', color: '#F44336', icon: '🔴' },
            warning: { name: 'Aviso', color: '#FF9800', icon: '🟡' },
            error: { name: 'Erro', color: '#F44336', icon: '❌' },
            maintenance: { name: 'Manutenção', color: '#9E9E9E', icon: '🔧' }
        };
    }

    async loadConfiguration() {
        try {
            // Carregar configurações específicas do IoT
            const iotConfig = await this.configManager.get('iot', {
                sensors: [],
                gateways: [],
                networks: [],
                thresholds: {},
                alertRules: []
            });
            
            this.config = { ...this.config, ...iotConfig };
            this.logger.debug('Configurações IoT carregadas');
            
        } catch (error) {
            this.logger.error('Erro ao carregar configurações IoT:', error);
        }
    }

    async initializeSensors() {
        try {
            this.logger.info('Inicializando sensores...');
            
            // Sensores de demonstração
            const demoSensors = [
                {
                    id: 'temp_001',
                    name: 'Sensor Temperatura Estufa 1',
                    type: 'temperature',
                    location: { lat: -23.5505, lng: -46.6333, name: 'Estufa Principal' },
                    gateway: 'gw_001',
                    protocol: 'zigbee',
                    status: 'online',
                    lastReading: { value: 24.5, timestamp: Date.now() },
                    thresholds: { min: 18, max: 30, critical: 35 }
                },
                {
                    id: 'hum_001',
                    name: 'Sensor Umidade Estufa 1',
                    type: 'humidity',
                    location: { lat: -23.5505, lng: -46.6333, name: 'Estufa Principal' },
                    gateway: 'gw_001',
                    protocol: 'zigbee',
                    status: 'online',
                    lastReading: { value: 65, timestamp: Date.now() },
                    thresholds: { min: 40, max: 80, critical: 90 }
                },
                {
                    id: 'soil_001',
                    name: 'Sensor Umidade Solo - Setor A',
                    type: 'soilMoisture',
                    location: { lat: -23.5510, lng: -46.6340, name: 'Campo A' },
                    gateway: 'gw_002',
                    protocol: 'lora',
                    status: 'online',
                    lastReading: { value: 45, timestamp: Date.now() },
                    thresholds: { min: 30, max: 70, critical: 20 }
                },
                {
                    id: 'ph_001',
                    name: 'Sensor pH Solo - Setor A',
                    type: 'ph',
                    location: { lat: -23.5510, lng: -46.6340, name: 'Campo A' },
                    gateway: 'gw_002',
                    protocol: 'lora',
                    status: 'online',
                    lastReading: { value: 6.8, timestamp: Date.now() },
                    thresholds: { min: 6.0, max: 7.5, critical: 5.0 }
                },
                {
                    id: 'light_001',
                    name: 'Sensor Luz Solar - Área Externa',
                    type: 'lightIntensity',
                    location: { lat: -23.5500, lng: -46.6320, name: 'Área Externa' },
                    gateway: 'gw_003',
                    protocol: 'wifi',
                    status: 'online',
                    lastReading: { value: 45000, timestamp: Date.now() },
                    thresholds: { min: 10000, max: 80000, critical: 100000 }
                },
                {
                    id: 'air_001',
                    name: 'Monitor Qualidade do Ar',
                    type: 'airQuality',
                    location: { lat: -23.5495, lng: -46.6325, name: 'Escritório' },
                    gateway: 'gw_003',
                    protocol: 'wifi',
                    status: 'online',
                    lastReading: { value: 45, timestamp: Date.now() },
                    thresholds: { min: 0, max: 100, critical: 200 }
                },
                {
                    id: 'energy_001',
                    name: 'Medidor Energia Solar',
                    type: 'energy',
                    location: { lat: -23.5490, lng: -46.6310, name: 'Painel Solar' },
                    gateway: 'gw_004',
                    protocol: 'ethernet',
                    status: 'online',
                    lastReading: { value: 12.5, timestamp: Date.now() },
                    thresholds: { min: 0, max: 50, critical: 60 }
                },
                {
                    id: 'water_001',
                    name: 'Sensor Nível Reservatório',
                    type: 'waterLevel',
                    location: { lat: -23.5485, lng: -46.6315, name: 'Reservatório Principal' },
                    gateway: 'gw_004',
                    protocol: 'ethernet',
                    status: 'warning',
                    lastReading: { value: 85, timestamp: Date.now() },
                    thresholds: { min: 20, max: 180, critical: 10 }
                }
            ];
            
            // Registrar sensores
            demoSensors.forEach(sensor => {
                this.registerSensor(sensor);
            });
            
            this.logger.success(`${demoSensors.length} sensores inicializados`);
            
        } catch (error) {
            this.logger.error('Erro ao inicializar sensores:', error);
        }
    }

    async setupGateways() {
        try {
            this.logger.info('Configurando gateways...');
            
            // Gateways de demonstração
            const demoGateways = [
                {
                    id: 'gw_001',
                    name: 'Gateway Estufa Principal',
                    location: { lat: -23.5505, lng: -46.6333, name: 'Estufa Principal' },
                    protocols: ['zigbee', 'wifi'],
                    status: 'online',
                    connectedDevices: 8,
                    maxDevices: 50,
                    signalStrength: 85,
                    lastSeen: Date.now()
                },
                {
                    id: 'gw_002',
                    name: 'Gateway Campo LoRa',
                    location: { lat: -23.5510, lng: -46.6340, name: 'Campo A' },
                    protocols: ['lora'],
                    status: 'online',
                    connectedDevices: 15,
                    maxDevices: 100,
                    signalStrength: 92,
                    lastSeen: Date.now()
                },
                {
                    id: 'gw_003',
                    name: 'Gateway Wi-Fi Escritório',
                    location: { lat: -23.5495, lng: -46.6325, name: 'Escritório' },
                    protocols: ['wifi', 'bluetooth'],
                    status: 'online',
                    connectedDevices: 12,
                    maxDevices: 30,
                    signalStrength: 78,
                    lastSeen: Date.now()
                },
                {
                    id: 'gw_004',
                    name: 'Gateway Ethernet Industrial',
                    location: { lat: -23.5490, lng: -46.6310, name: 'Área Industrial' },
                    protocols: ['ethernet', 'cellular'],
                    status: 'online',
                    connectedDevices: 6,
                    maxDevices: 20,
                    signalStrength: 95,
                    lastSeen: Date.now()
                }
            ];
            
            // Registrar gateways
            demoGateways.forEach(gateway => {
                this.registerGateway(gateway);
            });
            
            this.logger.success(`${demoGateways.length} gateways configurados`);
            
        } catch (error) {
            this.logger.error('Erro ao configurar gateways:', error);
        }
    }

    async initializeNetworks() {
        try {
            this.logger.info('Inicializando redes...');
            
            // Redes de demonstração
            const demoNetworks = [
                {
                    id: 'net_zigbee',
                    name: 'Rede ZigBee Estufas',
                    protocol: 'zigbee',
                    status: 'active',
                    devices: 25,
                    coverage: '85%',
                    health: 92,
                    bandwidth: '250 kbps',
                    latency: '15ms'
                },
                {
                    id: 'net_lora',
                    name: 'Rede LoRa Campo',
                    protocol: 'lora',
                    status: 'active',
                    devices: 45,
                    coverage: '95%',
                    health: 88,
                    bandwidth: '50 kbps',
                    latency: '200ms'
                },
                {
                    id: 'net_wifi',
                    name: 'Wi-Fi Corporativo',
                    protocol: 'wifi',
                    status: 'active',
                    devices: 18,
                    coverage: '90%',
                    health: 95,
                    bandwidth: '100 Mbps',
                    latency: '5ms'
                }
            ];
            
            // Registrar redes
            demoNetworks.forEach(network => {
                this.registerNetwork(network);
            });
            
            this.logger.success(`${demoNetworks.length} redes inicializadas`);
            
        } catch (error) {
            this.logger.error('Erro ao inicializar redes:', error);
        }
    }

    registerSensor(sensorData) {
        try {
            const sensor = {
                ...sensorData,
                registeredAt: Date.now(),
                readings: [],
                alerts: [],
                metadata: {
                    totalReadings: 0,
                    avgValue: 0,
                    minValue: null,
                    maxValue: null,
                    lastCalibration: Date.now(),
                    batteryLevel: Math.floor(Math.random() * 40) + 60 // 60-100%
                }
            };
            
            this.sensors.set(sensor.id, sensor);
            this.logger.debug(`Sensor registrado: ${sensor.name} (${sensor.id})`);
            
            return sensor;
            
        } catch (error) {
            this.logger.error('Erro ao registrar sensor:', error);
        }
    }

    registerGateway(gatewayData) {
        try {
            const gateway = {
                ...gatewayData,
                registeredAt: Date.now(),
                statistics: {
                    totalMessages: 0,
                    messagesPerHour: 0,
                    errorRate: 0,
                    uptime: 99.5
                }
            };
            
            this.gateways.set(gateway.id, gateway);
            this.logger.debug(`Gateway registrado: ${gateway.name} (${gateway.id})`);
            
            return gateway;
            
        } catch (error) {
            this.logger.error('Erro ao registrar gateway:', error);
        }
    }

    registerNetwork(networkData) {
        try {
            const network = {
                ...networkData,
                registeredAt: Date.now(),
                statistics: {
                    totalTraffic: 0,
                    packetsLost: 0,
                    avgLatency: 0,
                    peakUsage: 0
                }
            };
            
            this.networks.set(network.id, network);
            this.logger.debug(`Rede registrada: ${network.name} (${network.id})`);
            
            return network;
            
        } catch (error) {
            this.logger.error('Erro ao registrar rede:', error);
        }
    }

    startRealTimeUpdates() {
        try {
            // Parar atualizações existentes
            this.stopRealTimeUpdates();
            
            // Iniciar atualizações de sensores
            this.updateInterval = setInterval(() => {
                this.updateSensorReadings();
            }, this.config.updateInterval);
            
            // Iniciar análise de dados
            this.analyticsInterval = setInterval(() => {
                this.updateAnalytics();
            }, this.config.updateInterval * 2);
            
            // Iniciar verificação de alertas
            this.alertCheckInterval = setInterval(() => {
                this.checkAlerts();
            }, this.config.updateInterval / 2);
            
            this.logger.info('Atualizações em tempo real iniciadas');
            
        } catch (error) {
            this.logger.error('Erro ao iniciar atualizações em tempo real:', error);
        }
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.analyticsInterval) {
            clearInterval(this.analyticsInterval);
            this.analyticsInterval = null;
        }
        
        if (this.alertCheckInterval) {
            clearInterval(this.alertCheckInterval);
            this.alertCheckInterval = null;
        }
        
        this.logger.info('Atualizações em tempo real paradas');
    }

    updateSensorReadings() {
        try {
            this.sensors.forEach((sensor, sensorId) => {
                // Simular nova leitura
                const newReading = this.generateSensorReading(sensor);
                
                // Atualizar sensor
                sensor.lastReading = newReading;
                sensor.readings.push(newReading);
                sensor.metadata.totalReadings++;
                
                // Manter apenas últimas 100 leituras
                if (sensor.readings.length > 100) {
                    sensor.readings = sensor.readings.slice(-100);
                }
                
                // Atualizar estatísticas
                this.updateSensorStatistics(sensor);
                
                // Verificar status
                this.updateSensorStatus(sensor);
            });
            
            this.analytics.totalReadings += this.sensors.size;
            
        } catch (error) {
            this.logger.error('Erro ao atualizar leituras dos sensores:', error);
        }
    }

    generateSensorReading(sensor) {
        const sensorType = this.sensorTypes[sensor.type];
        const lastValue = sensor.lastReading?.value || 0;
        
        // Gerar variação realística
        let newValue;
        
        switch (sensor.type) {
            case 'temperature':
                newValue = lastValue + (Math.random() - 0.5) * 2;
                break;
            case 'humidity':
                newValue = lastValue + (Math.random() - 0.5) * 5;
                break;
            case 'soilMoisture':
                newValue = lastValue + (Math.random() - 0.5) * 3;
                break;
            case 'ph':
                newValue = lastValue + (Math.random() - 0.5) * 0.2;
                break;
            case 'lightIntensity':
                const hour = new Date().getHours();
                const baseLight = hour >= 6 && hour <= 18 ? 30000 + Math.sin((hour - 6) * Math.PI / 12) * 25000 : 100;
                newValue = baseLight + (Math.random() - 0.5) * 5000;
                break;
            case 'airQuality':
                newValue = lastValue + (Math.random() - 0.5) * 10;
                break;
            case 'energy':
                newValue = Math.max(0, lastValue + (Math.random() - 0.3) * 2);
                break;
            case 'waterLevel':
                newValue = lastValue + (Math.random() - 0.5) * 1;
                break;
            default:
                newValue = lastValue + (Math.random() - 0.5) * 1;
        }
        
        // Aplicar limites
        newValue = Math.max(sensorType.range.min, Math.min(sensorType.range.max, newValue));
        
        // Aplicar precisão
        newValue = Math.round(newValue / sensorType.accuracy) * sensorType.accuracy;
        
        return {
            value: newValue,
            timestamp: Date.now(),
            quality: Math.random() > 0.1 ? 'good' : 'poor',
            signalStrength: Math.floor(Math.random() * 30) + 70
        };
    }

    updateSensorStatistics(sensor) {
        const readings = sensor.readings.map(r => r.value);
        
        if (readings.length > 0) {
            sensor.metadata.avgValue = readings.reduce((a, b) => a + b, 0) / readings.length;
            sensor.metadata.minValue = Math.min(...readings);
            sensor.metadata.maxValue = Math.max(...readings);
        }
    }

    updateSensorStatus(sensor) {
        const reading = sensor.lastReading;
        const thresholds = sensor.thresholds;
        
        // Verificar conectividade
        const timeSinceLastReading = Date.now() - reading.timestamp;
        if (timeSinceLastReading > this.config.updateInterval * 3) {
            sensor.status = 'offline';
            return;
        }
        
        // Verificar valores críticos
        if (reading.value <= thresholds.critical || reading.value >= thresholds.critical) {
            sensor.status = 'error';
            return;
        }
        
        // Verificar valores de aviso
        if (reading.value < thresholds.min || reading.value > thresholds.max) {
            sensor.status = 'warning';
            return;
        }
        
        // Verificar qualidade do sinal
        if (reading.signalStrength < 30) {
            sensor.status = 'warning';
            return;
        }
        
        sensor.status = 'online';
    }

    updateAnalytics() {
        try {
            // Contar dispositivos ativos
            this.analytics.activeDevices = Array.from(this.sensors.values())
                .filter(s => s.status === 'online').length;
            
            // Calcular saúde da rede
            const totalDevices = this.sensors.size;
            const onlineDevices = this.analytics.activeDevices;
            this.analytics.networkHealth = totalDevices > 0 ? 
                Math.round((onlineDevices / totalDevices) * 100) : 100;
            
            // Calcular qualidade dos dados
            const goodReadings = Array.from(this.sensors.values())
                .filter(s => s.lastReading?.quality === 'good').length;
            this.analytics.dataQuality = totalDevices > 0 ? 
                Math.round((goodReadings / totalDevices) * 100) : 100;
            
        } catch (error) {
            this.logger.error('Erro ao atualizar analytics:', error);
        }
    }

    checkAlerts() {
        try {
            this.sensors.forEach((sensor, sensorId) => {
                const reading = sensor.lastReading;
                const thresholds = sensor.thresholds;
                
                // Verificar alertas de valor
                if (reading.value < thresholds.min || reading.value > thresholds.max) {
                    this.createAlert({
                        type: 'threshold',
                        severity: reading.value <= thresholds.critical ? 'critical' : 'warning',
                        sensorId: sensor.id,
                        sensorName: sensor.name,
                        message: `Valor fora do limite: ${reading.value}${this.sensorTypes[sensor.type].unit}`,
                        value: reading.value,
                        threshold: reading.value < thresholds.min ? thresholds.min : thresholds.max
                    });
                }
                
                // Verificar alertas de conectividade
                if (sensor.status === 'offline') {
                    this.createAlert({
                        type: 'connectivity',
                        severity: 'warning',
                        sensorId: sensor.id,
                        sensorName: sensor.name,
                        message: 'Sensor desconectado',
                        lastSeen: reading.timestamp
                    });
                }
                
                // Verificar bateria baixa
                if (sensor.metadata.batteryLevel < 20) {
                    this.createAlert({
                        type: 'battery',
                        severity: sensor.metadata.batteryLevel < 10 ? 'critical' : 'warning',
                        sensorId: sensor.id,
                        sensorName: sensor.name,
                        message: `Bateria baixa: ${sensor.metadata.batteryLevel}%`,
                        batteryLevel: sensor.metadata.batteryLevel
                    });
                }
            });
            
        } catch (error) {
            this.logger.error('Erro ao verificar alertas:', error);
        }
    }

    createAlert(alertData) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...alertData,
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false
        };
        
        // Evitar alertas duplicados
        const existingAlert = this.alerts.find(a => 
            a.type === alert.type && 
            a.sensorId === alert.sensorId && 
            !a.resolved &&
            (Date.now() - a.timestamp) < 300000 // 5 minutos
        );
        
        if (!existingAlert) {
            this.alerts.push(alert);
            
            // Manter apenas últimos 100 alertas
            if (this.alerts.length > 100) {
                this.alerts = this.alerts.slice(-100);
            }
            
            this.logger.warn(`Alerta criado: ${alert.message}`);
            
            // Emitir evento para UI
            this.emitEvent('alert-created', alert);
        }
    }

    async setupDataLogging() {
        try {
            this.logger.info('Configurando sistema de logging de dados...');
            
            // Configurar armazenamento local
            this.dataStorage = {
                sensors: new Map(),
                analytics: [],
                alerts: []
            };
            
            this.logger.success('Sistema de logging configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar logging:', error);
        }
    }

    async setupAlertSystem() {
        try {
            this.logger.info('Configurando sistema de alertas...');
            
            // Configurar regras de alerta padrão
            this.alertRules = [
                {
                    id: 'temp_critical',
                    name: 'Temperatura Crítica',
                    condition: 'value > 35 OR value < 5',
                    severity: 'critical',
                    actions: ['notify', 'log', 'email']
                },
                {
                    id: 'humidity_high',
                    name: 'Umidade Alta',
                    condition: 'value > 85',
                    severity: 'warning',
                    actions: ['notify', 'log']
                },
                {
                    id: 'battery_low',
                    name: 'Bateria Baixa',
                    condition: 'battery < 20',
                    severity: 'warning',
                    actions: ['notify', 'log']
                }
            ];
            
            this.logger.success('Sistema de alertas configurado');
            
        } catch (error) {
            this.logger.error('Erro ao configurar sistema de alertas:', error);
        }
    }

    async setupPredictiveAnalysis() {
        try {
            this.logger.info('Configurando análise preditiva...');
            
            // Configurar modelos preditivos simples
            this.predictiveModels = {
                temperature: {
                    name: 'Predição de Temperatura',
                    algorithm: 'linear_regression',
                    accuracy: 85,
                    lastTrained: Date.now()
                },
                humidity: {
                    name: 'Predição de Umidade',
                    algorithm: 'moving_average',
                    accuracy: 78,
                    lastTrained: Date.now()
                }
            };
            
            this.logger.success('Análise preditiva configurada');
            
        } catch (error) {
            this.logger.error('Erro ao configurar análise preditiva:', error);
        }
    }

    // Métodos de consulta
    getSensor(sensorId) {
        return this.sensors.get(sensorId);
    }

    getAllSensors() {
        return Array.from(this.sensors.values());
    }

    getSensorsByType(type) {
        return Array.from(this.sensors.values()).filter(s => s.type === type);
    }

    getSensorsByStatus(status) {
        return Array.from(this.sensors.values()).filter(s => s.status === status);
    }

    getGateway(gatewayId) {
        return this.gateways.get(gatewayId);
    }

    getAllGateways() {
        return Array.from(this.gateways.values());
    }

    getNetwork(networkId) {
        return this.networks.get(networkId);
    }

    getAllNetworks() {
        return Array.from(this.networks.values());
    }

    getAlerts(options = {}) {
        let alerts = [...this.alerts];
        
        if (options.severity) {
            alerts = alerts.filter(a => a.severity === options.severity);
        }
        
        if (options.unresolved) {
            alerts = alerts.filter(a => !a.resolved);
        }
        
        if (options.limit) {
            alerts = alerts.slice(-options.limit);
        }
        
        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }

    getAnalytics() {
        return {
            ...this.analytics,
            sensors: {
                total: this.sensors.size,
                online: this.getSensorsByStatus('online').length,
                offline: this.getSensorsByStatus('offline').length,
                warning: this.getSensorsByStatus('warning').length,
                error: this.getSensorsByStatus('error').length
            },
            gateways: {
                total: this.gateways.size,
                online: Array.from(this.gateways.values()).filter(g => g.status === 'online').length
            },
            networks: {
                total: this.networks.size,
                active: Array.from(this.networks.values()).filter(n => n.status === 'active').length
            },
            alerts: {
                total: this.alerts.length,
                unresolved: this.alerts.filter(a => !a.resolved).length,
                critical: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length
            }
        };
    }

    // Métodos de controle
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = Date.now();
            this.logger.info(`Alerta reconhecido: ${alertId}`);
        }
    }

    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            this.logger.info(`Alerta resolvido: ${alertId}`);
        }
    }

    calibrateSensor(sensorId) {
        const sensor = this.sensors.get(sensorId);
        if (sensor) {
            sensor.metadata.lastCalibration = Date.now();
            this.logger.info(`Sensor calibrado: ${sensor.name}`);
        }
    }

    // Métodos de renderização
    render() {
        if (!this.isInitialized) {
            return '<div class="loading">Inicializando Sistema IoT...</div>';
        }
        
        return this.renderDashboard();
    }

    renderDashboard() {
        const analytics = this.getAnalytics();
        const recentAlerts = this.getAlerts({ limit: 5, unresolved: true });
        
        return `
            <div class="iot-dashboard">
                <!-- Header com estatísticas -->
                <div class="dashboard-header">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-content">
                                <div class="stat-value">${analytics.sensors.total}</div>
                                <div class="stat-label">Sensores</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">🟢</div>
                            <div class="stat-content">
                                <div class="stat-value">${analytics.sensors.online}</div>
                                <div class="stat-label">Online</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📡</div>
                            <div class="stat-content">
                                <div class="stat-value">${analytics.gateways.online}</div>
                                <div class="stat-label">Gateways</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">⚠️</div>
                            <div class="stat-content">
                                <div class="stat-value">${analytics.alerts.unresolved}</div>
                                <div class="stat-label">Alertas</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Grid principal -->
                <div class="dashboard-grid">
                    <!-- Sensores -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>🌡️ Sensores</h3>
                            <button class="btn-refresh" onclick="iotSystem.updateSensorReadings()">🔄</button>
                        </div>
                        <div class="sensors-grid">
                            ${this.renderSensorsGrid()}
                        </div>
                    </div>
                    
                    <!-- Gateways -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>📡 Gateways</h3>
                        </div>
                        <div class="gateways-list">
                            ${this.renderGatewaysList()}
                        </div>
                    </div>
                    
                    <!-- Redes -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>🔗 Redes</h3>
                        </div>
                        <div class="networks-list">
                            ${this.renderNetworksList()}
                        </div>
                    </div>
                    
                    <!-- Alertas -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>⚠️ Alertas Recentes</h3>
                        </div>
                        <div class="alerts-list">
                            ${this.renderAlertsList(recentAlerts)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSensorsGrid() {
        const sensors = this.getAllSensors();
        
        return sensors.map(sensor => {
            const sensorType = this.sensorTypes[sensor.type];
            const status = this.deviceStatus[sensor.status];
            
            return `
                <div class="sensor-card" data-sensor-id="${sensor.id}">
                    <div class="sensor-header">
                        <div class="sensor-icon">${sensorType.icon}</div>
                        <div class="sensor-status" style="color: ${status.color}">
                            ${status.icon}
                        </div>
                    </div>
                    
                    <div class="sensor-content">
                        <div class="sensor-name">${sensor.name}</div>
                        <div class="sensor-location">${sensor.location.name}</div>
                        
                        <div class="sensor-reading">
                            <span class="reading-value">${sensor.lastReading.value}</span>
                            <span class="reading-unit">${sensorType.unit}</span>
                        </div>
                        
                        <div class="sensor-meta">
                            <div class="meta-item">
                                <span class="meta-label">Bateria:</span>
                                <span class="meta-value">${sensor.metadata.batteryLevel}%</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Sinal:</span>
                                <span class="meta-value">${sensor.lastReading.signalStrength}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sensor-actions">
                        <button class="btn-small" onclick="iotSystem.showSensorDetails('${sensor.id}')">
                            📊 Detalhes
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderGatewaysList() {
        const gateways = this.getAllGateways();
        
        return gateways.map(gateway => {
            const status = this.deviceStatus[gateway.status];
            
            return `
                <div class="gateway-item">
                    <div class="gateway-info">
                        <div class="gateway-name">${gateway.name}</div>
                        <div class="gateway-location">${gateway.location.name}</div>
                        <div class="gateway-protocols">
                            ${gateway.protocols.map(p => `
                                <span class="protocol-tag">${this.protocols[p].icon} ${this.protocols[p].name}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="gateway-stats">
                        <div class="stat-item">
                            <span class="stat-label">Dispositivos:</span>
                            <span class="stat-value">${gateway.connectedDevices}/${gateway.maxDevices}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Sinal:</span>
                            <span class="stat-value">${gateway.signalStrength}%</span>
                        </div>
                    </div>
                    
                    <div class="gateway-status" style="color: ${status.color}">
                        ${status.icon} ${status.name}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderNetworksList() {
        const networks = this.getAllNetworks();
        
        return networks.map(network => {
            const protocol = this.protocols[network.protocol];
            
            return `
                <div class="network-item">
                    <div class="network-info">
                        <div class="network-name">
                            ${protocol.icon} ${network.name}
                        </div>
                        <div class="network-stats">
                            <span class="stat-item">${network.devices} dispositivos</span>
                            <span class="stat-item">Cobertura: ${network.coverage}</span>
                            <span class="stat-item">Saúde: ${network.health}%</span>
                        </div>
                    </div>
                    
                    <div class="network-performance">
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: ${network.health}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAlertsList(alerts) {
        if (alerts.length === 0) {
            return '<div class="no-alerts">✅ Nenhum alerta ativo</div>';
        }
        
        return alerts.map(alert => {
            const severityColors = {
                critical: '#F44336',
                warning: '#FF9800',
                info: '#2196F3'
            };
            
            return `
                <div class="alert-item" data-alert-id="${alert.id}">
                    <div class="alert-severity" style="background-color: ${severityColors[alert.severity]}">
                        ${alert.severity === 'critical' ? '🚨' : '⚠️'}
                    </div>
                    
                    <div class="alert-content">
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-meta">
                            <span class="alert-sensor">${alert.sensorName}</span>
                            <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    
                    <div class="alert-actions">
                        <button class="btn-small" onclick="iotSystem.acknowledgeAlert('${alert.id}')">
                            ✓ OK
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Métodos de evento
    emitEvent(eventName, data) {
        const event = new CustomEvent(`iot-${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    // Métodos de exportação
    exportData() {
        return {
            sensors: Object.fromEntries(this.sensors),
            gateways: Object.fromEntries(this.gateways),
            networks: Object.fromEntries(this.networks),
            alerts: this.alerts.slice(-50), // últimos 50 alertas
            analytics: this.analytics,
            config: this.config
        };
    }

    destroy() {
        // Parar atualizações
        this.stopRealTimeUpdates();
        
        // Limpar dados
        this.sensors.clear();
        this.gateways.clear();
        this.networks.clear();
        this.alerts = [];
        
        this.logger.info('Sistema IoT destruído');
    }
}

export default IoTSystem;