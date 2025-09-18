// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIYNOKU5rklEVYwU9Y2ZSdmKGz0w2aZ6c",
    authDomain: "biofield-intelligence.firebaseapp.com",
    databaseURL: "https://biofield-intelligence-default-rtdb.firebaseio.com",
    projectId: "biofield-intelligence",
    storageBucket: "biofield-intelligence.firebasestorage.app",
    messagingSenderId: "506419866113",
    appId: "1:506419866113:web:8aa79c9c1c74a5b6a7d832"
};

// Variáveis de controle
let updateCount = 0;
let sensorsData = {};
let lastUpdateTime = null;

        // Função de log
        function addLog(message, type = 'info') {
            const logContainer = document.getElementById('logContainer');
            const timestamp = new Date().toLocaleTimeString();
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `[${timestamp}] ${message}`;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Manter apenas os últimos 10 logs na sidebar
            const entries = logContainer.querySelectorAll('.log-entry');
            if (entries.length > 10) {
                entries[0].remove();
            }
        }

// Atualizar status do Firebase
function updateFirebaseStatus(message, type) {
    // Criar elemento de status se não existir
    let statusEl = document.getElementById('firebaseStatus');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'firebaseStatus';
        statusEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusEl);
    }
    
    statusEl.className = `firebase-status ${type}`;
    statusEl.innerHTML = `<i class="fas fa-${type === 'connected' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'spinner fa-spin'}"></i> ${message}`;
    
    // Aplicar estilos
    if (type === 'connected') {
        statusEl.style.background = '#4caf50';
        statusEl.style.color = 'white';
    } else if (type === 'error') {
        statusEl.style.background = '#f44336';
        statusEl.style.color = 'white';
    } else {
        statusEl.style.background = '#ff9800';
        statusEl.style.color = 'white';
    }
}

// Atualizar estatísticas em tempo real
function updateLiveStats() {
    const sensorKeys = Object.keys(sensorsData);
    document.getElementById('activeSensors').textContent = sensorKeys.length;
    document.getElementById('totalUpdates').textContent = updateCount;
    document.getElementById('lastUpdate').textContent = lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : '--';

    // Calcular índice bioenergético médio
    if (sensorKeys.length > 0) {
        const bioIndexes = sensorKeys.map(key => {
            const data = sensorsData[key];
            return data.bioIndex || data.temperatura || 0;
        }).filter(val => val > 0);
        
        if (bioIndexes.length > 0) {
            const avgBioIndex = bioIndexes.reduce((a, b) => a + b, 0) / bioIndexes.length;
            document.getElementById('avgBioIndex').textContent = parseFloat(avgBioIndex).toFixed(1);
        }
    }
}

// Atualizar KPIs principais
function updateKPIs() {
    const sensorKeys = Object.keys(sensorsData);
    
    if (sensorKeys.length === 0) {
        document.getElementById('bioIndexValue').textContent = '--';
        document.getElementById('coherenceValue').textContent = '--';
        document.getElementById('qualityValue').textContent = '--';
        document.getElementById('noiseValue').textContent = '--';
        return;
    }

    // Calcular médias
    let totalBioIndex = 0, totalCoherence = 0, qualityCounts = {}, noiseCounts = {};
    let validSensors = 0;

    sensorKeys.forEach(key => {
        const data = sensorsData[key];
        if (data.bioIndex || data.temperatura) {
            totalBioIndex += data.bioIndex || data.temperatura || 0;
            totalCoherence += data.coherence || data.audio_level || 0;
            validSensors++;
        }
        
        if (data.quality) qualityCounts[data.quality] = (qualityCounts[data.quality] || 0) + 1;
        if (data.noise) noiseCounts[data.noise] = (noiseCounts[data.noise] || 0) + 1;
    });

    if (validSensors > 0) {
        const avgBioIndex = totalBioIndex / validSensors;
        const avgCoherence = totalCoherence / validSensors;
        
        document.getElementById('bioIndexValue').textContent = parseFloat(avgBioIndex).toFixed(1);
        document.getElementById('coherenceValue').textContent = parseFloat(avgCoherence).toFixed(1);
        
        // Encontrar qualidade mais comum
        const mostCommonQuality = Object.keys(qualityCounts).reduce((a, b) => 
            qualityCounts[a] > qualityCounts[b] ? a : b, '--');
        document.getElementById('qualityValue').textContent = mostCommonQuality;
        
        // Encontrar ruído mais comum
        const mostCommonNoise = Object.keys(noiseCounts).reduce((a, b) => 
            noiseCounts[a] > noiseCounts[b] ? a : b, '--');
        document.getElementById('noiseValue').textContent = mostCommonNoise;
    }
}

// Renderizar lista de sensores
function renderSensors() {
    const sensorsList = document.getElementById('sensorsList');
    const sensorKeys = Object.keys(sensorsData);

    if (sensorKeys.length === 0) {
        sensorsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum sensor ativo no momento</p>';
        return;
    }

    let html = '';
    sensorKeys.forEach(sensorId => {
        const data = sensorsData[sensorId];
        const isCritical = (data.bioIndex || data.temperatura || 0) > 80;
        const criticalClass = isCritical ? 'critical' : '';
        
        html += `
            <div class="sensor-item ${criticalClass}" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin: 10px 0;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid ${isCritical ? '#f44336' : '#4caf50'};
            ">
                <div class="sensor-info">
                    <h4 style="margin: 0 0 5px 0; color: #333;">${sensorId}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${data.localizacao || data.location || 'Localização não disponível'}</p>
                </div>
                <div class="sensor-metrics" style="display: flex; gap: 20px;">
                    <div class="metric" style="text-align: center;">
                        <div class="metric-value" style="font-size: 1.2rem; font-weight: bold; color: #667eea;">${parseFloat(data.bioIndex || data.temperatura || 0).toFixed(1)}</div>
                        <div class="metric-label" style="font-size: 0.8rem; color: #666;">Bio Index</div>
                    </div>
                    <div class="metric" style="text-align: center;">
                        <div class="metric-value" style="font-size: 1.2rem; font-weight: bold; color: #667eea;">${parseFloat(data.coherence || data.audio_level || 0).toFixed(1)}</div>
                        <div class="metric-label" style="font-size: 0.8rem; color: #666;">Coerência</div>
                    </div>
                    <div class="metric" style="text-align: center;">
                        <div class="metric-value" style="font-size: 1.2rem; font-weight: bold; color: #667eea;">${data.quality || data.status || '--'}</div>
                        <div class="metric-label" style="font-size: 0.8rem; color: #666;">Qualidade</div>
                    </div>
                </div>
            </div>
        `;
    });

    sensorsList.innerHTML = html;
}

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    addLog('✅ Firebase inicializado com sucesso', 'info');
    updateFirebaseStatus('Conectado ao Firebase', 'connected');

    // Monitorar conexão
    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val()) {
            addLog('🔗 Conexão ativa com Firebase', 'info');
            updateFirebaseStatus('Conectado ao Firebase', 'connected');
        } else {
            addLog('⚠️ Conexão perdida com Firebase', 'warning');
            updateFirebaseStatus('Conexão perdida', 'error');
        }
    });

    // Escutar sensores principais
    database.ref('sensores').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            sensorsData = {...sensorsData, ...data};
            updateCount++;
            lastUpdateTime = new Date();
            addLog(`📥 Dados recebidos de sensores principais (${Object.keys(data).length} sensores)`, 'info');
            
            updateLiveStats();
            updateKPIs();
            renderSensors();
        }
    });

    // Escutar sensores de teste
    database.ref('sensores_teste').on('value', (snapshot) => {
        const testData = snapshot.val();
        if (testData) {
            sensorsData = {...sensorsData, ...testData};
            updateCount++;
            lastUpdateTime = new Date();
            addLog(`📥 Dados recebidos de sensores de teste (${Object.keys(testData).length} sensores)`, 'info');
            
            updateLiveStats();
            updateKPIs();
            renderSensors();
        }
    });

    // Escutar leituras vibracionais
    database.ref('vibrational_readings').on('value', (snapshot) => {
        const readings = snapshot.val();
        if (readings) {
            addLog(`📥 Leituras vibracionais recebidas (${Object.keys(readings).length} leituras)`, 'info');
            
            // Processar leituras aprovadas
            Object.entries(readings).forEach(([id, reading]) => {
                if (reading.approved && reading.status === 'approved') {
                    sensorsData[`vibrational_${id}`] = {
                        bioIndex: reading.bioIndex,
                        coherence: reading.vibrationalCoherence,
                        quality: reading.infoQuality,
                        noise: reading.emNoise,
                        localizacao: reading.location?.latitude ? 
                            `${parseFloat(reading.location.latitude).toFixed(4)}, ${parseFloat(reading.location.longitude).toFixed(4)}` : 
                            'Localização não disponível'
                    };
                }
            });
            
            updateLiveStats();
            updateKPIs();
            renderSensors();
        }
    });

    addLog('🎯 Monitoramento ativo - Aguardando atualizações em tempo real', 'info');

} catch (error) {
    console.error('Erro Firebase:', error);
    addLog(`❌ Erro ao conectar: ${error.message}`, 'error');
    updateFirebaseStatus(`Erro: ${error.message}`, 'error');
}

// Log inicial
// Inicializar dashboard quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    addLog('🚀 Dashboard BioField Intelligence iniciado', 'info');
    addLog('📡 Aguardando dados dos sensores...', 'info');
    
    // Inicializar componentes do dashboard
    updateLiveStats();
    updateKPIs();
    renderSensors();
    
    // Simular alguns dados iniciais para demonstração
    setTimeout(() => {
        // Simular dados de sensores
        sensorsData = {
            sensor1: { bioIndex: 75.5, coherence: 82.3, location: { latitude: -23.5505, longitude: -46.6333 } },
            sensor2: { bioIndex: 68.2, coherence: 79.1, location: { latitude: -23.5489, longitude: -46.6388 } },
            sensor3: { bioIndex: 71.8, coherence: 85.7, location: { latitude: -23.5520, longitude: -46.6311 } }
        };
        
        updateCount = 3;
        lastUpdateTime = new Date();
        
        // Atualizar interface
        updateLiveStats();
        updateKPIs();
        renderSensors();
        
        addLog('✅ Dados de demonstração carregados', 'success');
        updateFirebaseStatus('Conectado - Modo Demo', 'success');
    }, 2000);
});
