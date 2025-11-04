// Dados dos sensores
let sensorData = {};
let currentVehicleData = {};
let sensorHistoryData = {};
let currentSensorChart = null;
let currentHumidityChart = null;
let isDoorOpen = false;
let visibleTemperatureSensors = new Set(['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto']);
let visibleHumiditySensors = new Set(['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto']);
let selectedSensor = null;

// Cores para os gráficos
const sensorColors = {
    'externo': '#FF6B6B',
    'principal': '#4ECDC4', 
    'meio': '#45B7D1',
    'porta': '#FFA07A',
    'fundo': '#98D8C8',
    'piso': '#F7DC6F',
    'teto': '#BB8FCE'
};

const humidityColors = {
    'externo': '#E74C3C',
    'principal': '#3498DB',
    'meio': '#2ECC71',
    'porta': '#F39C12',
    'fundo': '#9B59B6',
    'piso': '#1ABC9C',
    'teto': '#D35400'
};

// Sistema de Loading
let loadingSteps = [
    "Inicializando sistema...",
    "Carregando dados do veículo...",
    "Buscando dados dos sensores...",
    "Processando informações...",
    "Preparando gráficos...",
    "Finalizando carregamento..."
];

function updateLoadingStep(stepIndex) {
    const stepsElement = document.getElementById('loadingSteps');
    if (stepsElement && stepIndex < loadingSteps.length) {
        stepsElement.textContent = loadingSteps[stepIndex];
        
        // Simular progresso
        const progress = Math.min(100, Math.round((stepIndex / loadingSteps.length) * 100));
        console.log(`Progresso do carregamento: ${progress}% - ${loadingSteps[stepIndex]}`);
    }
}

function showLoading() {
    const loadingOverlay = document.getElementById('globalLoading');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('globalLoading');
    if (loadingOverlay) {
        // Pequeno delay para garantir que tudo foi carregado
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    }
}

// Função para carregar dados dos sensores
async function loadSensorData() {
    updateLoadingStep(2);
    
    try {
        console.log('Carregando dados dos sensores...');
        const response = await fetch('./sensor_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Dados brutos recebidos:', rawData);
        
        // Processar os dados para o formato esperado
        const processedData = {};
        const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
        
        sensorNames.forEach(sensorName => {
            if (rawData[sensorName] && rawData[sensorName].temperature !== 0.0) {
                const sensor = rawData[sensorName];
                const tempValue = sensor.temperature;
                const humidityValue = sensor.humidity;
                
                processedData[sensorName] = {
                    name: getSensorDisplayName(sensorName),
                    value: formatSensorValue(tempValue, humidityValue),
                    temperatureValue: tempValue,
                    location: getSensorLocation(sensorName),
                    status: getTemperatureStatus(tempValue, sensorName === 'externo'),
                    lastRead: formatDateTime(sensor.last_read),
                    icon: sensorName === 'externo' ? 'fas fa-sun' : 'fas fa-thermometer-half',
                    humidity: formatHumidity(humidityValue),
                    rawHumidity: humidityValue,
                    humidityStatus: getHumidityStatus(humidityValue)
                };
            } else {
                processedData[sensorName] = {
                    name: getSensorDisplayName(sensorName),
                    value: 'Não Config.',
                    temperatureValue: 0.0,
                    location: getSensorLocation(sensorName),
                    status: 'Não Configurado',
                    lastRead: new Date().toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    icon: sensorName === 'externo' ? 'fas fa-sun' : 'fas fa-thermometer-half',
                    humidity: 'Não Config.',
                    rawHumidity: 0.0,
                    humidityStatus: 'Não Configurado'
                };
            }
        });
        
        console.log('Dados processados:', processedData);
        return processedData;
        
    } catch (error) {
        console.error('Erro ao carregar dados dos sensores:', error);
        return getZeroSensorData();
    }
}

// Função para carregar histórico dos sensores
async function loadSensorHistory() {
    updateLoadingStep(4);
    
    try {
        console.log('Carregando histórico dos sensores (12h)...');
        // Tenta carregar o arquivo específico para 12h primeiro
        const response = await fetch('./sensor_history_12h.json');
        
        if (!response.ok) {
            // Fallback para o arquivo de compatibilidade
            console.log('Arquivo 12h não encontrado, tentando arquivo padrão...');
            const fallbackResponse = await fetch('./sensor_history.json');
            
            if (!fallbackResponse.ok) {
                throw new Error('Nenhum arquivo de histórico encontrado');
            }
            
            const data = await fallbackResponse.json();
            console.log('Histórico dos sensores (fallback) carregado:', data);
            return data;
        }
        
        const data = await response.json();
        console.log('Histórico dos sensores (12h) carregado:', data);
        return data;
        
    } catch (error) {
        console.error('Erro ao carregar histórico dos sensores:', error);
        return generateMockHistory(12);
    }
}

// CORREÇÃO: Função formatDateTime também corrigida
function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// CORREÇÃO: Nova função para formatar tempo nos gráficos - CORRIGIDA!
function formatTimeForChart(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        
        // CORREÇÃO: O JavaScript já lida com timezone automaticamente
        // Não precisamos ajustar manualmente
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (error) {
        console.error('Erro ao formatar tempo para gráfico:', error);
        return '';
    }
}

// Funções auxiliares (mantidas as mesmas)
function getSensorDisplayName(sensorName) {
    const names = {
        'externo': 'Sensor Externo',
        'principal': 'Sensor Principal',
        'meio': 'Sensor do Meio',
        'porta': 'Sensor da Porta',
        'fundo': 'Sensor do Fundo',
        'piso': 'Sensor do Piso',
        'teto': 'Sensor do Teto'
    };
    return names[sensorName] || sensorName;
}

function getSensorLocation(sensorName) {
    const locations = {
        'externo': 'Externo',
        'principal': 'Centro da carga',
        'meio': 'Meio da carga',
        'porta': 'Perto da porta',
        'fundo': 'Fundo do veículo',
        'piso': 'Piso dianteiro',
        'teto': 'Teto traseiro'
    };
    return locations[sensorName] || 'Localização desconhecida';
}

function getTemperatureStatus(temperature, isExternal = false) {
    if (temperature === 0.0) {
        return 'Não Configurado';
    }
    
    if (isExternal) return 'Normal';
    
    if (temperature >= 2 && temperature <= 5) return 'Normal';
    if (temperature > 5 && temperature <= 7) return 'Alerta';
    return 'Crítico';
}

function getHumidityStatus(humidity) {
    if (humidity === 0.0) {
        return 'Não Configurado';
    }
    
    if (humidity >= 40 && humidity <= 60) return 'Normal';
    if ((humidity >= 30 && humidity < 40) || (humidity > 60 && humidity <= 70)) return 'Alerta';
    return 'Crítico';
}

function formatSensorValue(temperature, humidity) {
    if (temperature === 0.0) {
        return 'Não Config.';
    }
    return `${temperature}°C`;
}

function formatHumidity(humidity) {
    if (humidity === 0.0) {
        return 'Não Config.';
    }
    return `${humidity}%`;
}

function getZeroSensorData() {
    console.log('Usando dados zerados...');
    const now = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    return {
        'externo': {
            name: 'Sensor Externo',
            value: 'Não Config.',
            location: 'Externo',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-sun',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'principal': {
            name: 'Sensor Principal',
            value: 'Não Config.',
            location: 'Centro da carga',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'meio': {
            name: 'Sensor do Meio',
            value: 'Não Config.',
            location: 'Meio da carga',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'porta': {
            name: 'Sensor da Porta',
            value: 'Não Config.',
            location: 'Perto da porta',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'fundo': {
            name: 'Sensor do Fundo',
            value: 'Não Config.',
            location: 'Fundo do veículo',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'piso': {
            name: 'Sensor do Piso',
            value: 'Não Config.',
            location: 'Piso dianteiro',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        },
        'teto': {
            name: 'Sensor do Teto',
            value: 'Não Config.',
            location: 'Teto traseiro',
            status: 'Não Configurado',
            lastRead: now,
            icon: 'fas fa-thermometer-half',
            humidity: 'Não Config.',
            temperatureValue: 0.0,
            rawHumidity: 0.0,
            humidityStatus: 'Não Configurado'
        }
    };
}

function generateMockHistory(hours = 12) {
    console.log(`Gerando dados mock para histórico de ${hours}h...`);
    
    const mockHistory = {};
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    sensorNames.forEach(sensorName => {
        const history = [];
        const baseTemp = sensorName === 'externo' ? 22 : 3.5;
        const baseHumidity = sensorName === 'externo' ? 65 : 55;
        
        const points = hours;
        for (let i = 0; i < points; i++) {
            const time = new Date();
            time.setHours(time.getHours() - (points - 1 - i));
            
            let tempVariation, humidityVariation;
            if (sensorName === 'externo') {
                tempVariation = Math.sin(i * Math.PI / 6) * 6 + (Math.random() - 0.5) * 2;
                humidityVariation = Math.sin(i * Math.PI / 6) * 15 + (Math.random() - 0.5) * 5;
            } else if (sensorName === 'porta') {
                tempVariation = (Math.random() - 0.5) * 2.5;
                humidityVariation = (Math.random() - 0.5) * 8;
            } else {
                tempVariation = (Math.random() - 0.5) * 1.2;
                humidityVariation = (Math.random() - 0.5) * 4;
            }
            
            const temp = Math.round((baseTemp + tempVariation) * 10) / 10;
            const humidity = Math.round((baseHumidity + humidityVariation) * 10) / 10;
            
            history.push({
                temperature: temp,
                humidity: Math.max(0, Math.min(100, humidity)),
                timestamp: time.toISOString()
            });
        }
        
        mockHistory[sensorName] = history;
    });
    
    return mockHistory;
}

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Nova função para atualizar o dashboard com dados reais dos sensores
function updateDashboardWithSensorData() {
    console.log('Atualizando dashboard com dados dos sensores...');
    
    const avgTemperature = calculateAverageTemperature();
    document.getElementById('avg-temperature').textContent = `${avgTemperature}°C`;
    
    updateTemperatureStatus(avgTemperature);
    
    if (!isDoorOpen) {
        const doorStatus = checkDoorStatus();
        updateDoorsStatus(doorStatus);
    }
    
    updateRefrigeratorStatus(avgTemperature);
    
    document.getElementById('fuel-consumption').textContent = '-- L/100km';
    
    console.log('Dashboard atualizado com dados reais dos sensores');
}

function checkDoorStatus() {
    if (isDoorOpen) {
        return true;
    }
    
    const doorSensor = sensorData['porta'];
    if (doorSensor && doorSensor.temperatureValue > 7 && doorSensor.temperatureValue !== 0.0) {
        return true;
    }
    return false;
}

function updateDoorsStatus(open) {
    const truckClosed = document.getElementById('truck-closed');
    const truckOpen = document.getElementById('truck-open');
    
    isDoorOpen = open;
    
    if (open) {
        truckClosed.style.opacity = '0';
        truckOpen.style.opacity = '1';
        
        document.getElementById('doors-status').textContent = 'Aberta';
        document.getElementById('doors-label').textContent = 'Porta traseira aberta';
        document.getElementById('doors-change').innerHTML = 
            '<i class="fas fa-exclamation-triangle"></i> Alerta: Porta aberta';
        document.getElementById('doors-change').className = 'dashboard-change negative';
    } else {
        truckClosed.style.opacity = '1';
        truckOpen.style.opacity = '0';
        
        document.getElementById('doors-status').textContent = 'Fechada';
        document.getElementById('doors-label').textContent = 'Porta traseira fechada';
        document.getElementById('doors-change').innerHTML = 
            '<i class="fas fa-check-circle"></i> Status normal';
        document.getElementById('doors-change').className = 'dashboard-change positive';
    }
}

function toggleDoorStatus() {
    updateDoorsStatus(!isDoorOpen);
}

// Função principal para carregar dados do veículo
async function loadVehicleData() {
    updateLoadingStep(1);
    
    console.log('Iniciando carregamento dos dados do veículo...');
    
    const plate = getUrlParameter('placa') || 'KG8000003';
    
    sensorData = await loadSensorData();
    console.log('Sensor data carregado:', sensorData);
    
    document.getElementById('page-title').textContent = `Detalhes do Veículo - ${plate}`;
    
    document.getElementById('vehicle-plate').textContent = plate;
    document.getElementById('vehicle-model').textContent = 'Veículo Refrigerado';
    document.getElementById('vehicle-year').textContent = '2023';
    document.getElementById('vehicle-capacity').textContent = '1500 kg';
    document.getElementById('vehicle-type').textContent = 'Refrigerado';
    document.getElementById('vehicle-driver').textContent = 'Motorista KG8000003';
    
    const avgTemperature = calculateAverageTemperature();
    
    document.getElementById('vehicle-route').textContent = 'Rota Ativa';
    document.getElementById('vehicle-trip-status').textContent = 'Em Operação';
    document.getElementById('vehicle-last-update').textContent = new Date().toLocaleString('pt-BR');
    document.getElementById('vehicle-location').textContent = 'Em Trânsito';
    document.getElementById('vehicle-avg-temp').textContent = `${avgTemperature}°C`;
    document.getElementById('vehicle-next-stop').textContent = 'Próxima Entrega';
    
    updateVehicleStatus(avgTemperature);
    
    updateDashboardWithSensorData();
    
    updateSensorVisuals();
    createSensorCards();
    updateSensorTemperatures();
    
    // Carregar histórico e criar gráficos comparativos
    sensorHistoryData = await loadSensorHistory();
    createComparativeCharts();
    
    // Chamar updateSensorDetails sem afetar os gráficos
    if (Object.keys(sensorData).length > 0) {
        updateSensorDetailsWithoutAffectingCharts('principal');
    }
    
    currentVehicleData = { plate, avgTemperature };
    console.log('Dados do veículo carregados com sucesso');
}

function calculateAverageTemperature() {
    const internalSensors = ['principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    let totalTemp = 0;
    let validSensors = 0;
    
    internalSensors.forEach(sensorId => {
        if (sensorData[sensorId]) {
            const tempValue = sensorData[sensorId].temperatureValue;
            if (!isNaN(tempValue) && tempValue !== 0.0) {
                totalTemp += tempValue;
                validSensors++;
                console.log(`Sensor ${sensorId}: ${tempValue}°C`);
            }
        }
    });
    
    if (validSensors > 0) {
        const avg = totalTemp / validSensors;
        const roundedAvg = Math.round(avg * 10) / 10;
        console.log(`Temperatura média calculada: ${roundedAvg}°C (${validSensors} sensores válidos)`);
        return roundedAvg.toString();
    } else {
        console.log(`Temperatura média: -- (${validSensors} sensores válidos)`);
        return '--';
    }
}

function updateVehicleStatus(avgTemperature) {
    const statusElement = document.getElementById('vehicle-status');
    
    if (avgTemperature !== '--') {
        const tempValue = parseFloat(avgTemperature);
        if (tempValue >= 2 && tempValue <= 5) {
            statusElement.textContent = 'Normal';
            statusElement.className = 'status-badge status-normal';
        } else if (tempValue > 5 && tempValue <= 7) {
            statusElement.textContent = 'Alerta';
            statusElement.className = 'status-badge status-warning';
        } else {
            statusElement.textContent = 'Crítico';
            statusElement.className = 'status-badge status-alert';
        }
    } else {
        statusElement.textContent = 'Sem Dados';
        statusElement.className = 'status-badge status-inactive';
    }
}

function updateTemperatureStatus(avgTemperature) {
    const tempStatusElement = document.getElementById('temp-status');
    
    if (avgTemperature !== '--') {
        const tempValue = parseFloat(avgTemperature);
        if (tempValue >= 2 && tempValue <= 5) {
            tempStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Dentro da faixa ideal';
            tempStatusElement.className = 'dashboard-change positive';
        } else if (tempValue > 5 && tempValue <= 7) {
            tempStatusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fora da faixa ideal';
            tempStatusElement.className = 'dashboard-change negative';
        } else {
            tempStatusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Temperatura crítica';
            tempStatusElement.className = 'dashboard-change negative';
        }
    } else {
        tempStatusElement.innerHTML = '<i class="fas fa-question-circle"></i> Sem dados de temperatura';
        tempStatusElement.className = 'dashboard-change';
    }
}

function updateRefrigeratorStatus(avgTemperature) {
    const refrigeratorChangeElement = document.getElementById('refrigerator-change');
    const refrigeratorStatusElement = document.getElementById('refrigerator-status');
    
    if (avgTemperature !== '--') {
        const tempValue = parseFloat(avgTemperature);
        
        if (tempValue >= 2 && tempValue <= 7) {
            refrigeratorStatusElement.textContent = 'Ligado';
            refrigeratorChangeElement.innerHTML = '<i class="fas fa-check-circle"></i> Operação normal';
            refrigeratorChangeElement.className = 'dashboard-change positive';
        } else {
            refrigeratorStatusElement.textContent = 'Desligado';
            refrigeratorChangeElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Refrigerador desligado';
            refrigeratorChangeElement.className = 'dashboard-change negative';
        }
    } else {
        refrigeratorStatusElement.textContent = '--';
        refrigeratorChangeElement.innerHTML = '<i class="fas fa-question-circle"></i> Status desconhecido';
        refrigeratorChangeElement.className = 'dashboard-change';
    }
}

function updateSensorVisuals() {
    Object.keys(sensorData).forEach(sensorId => {
        const sensor = sensorData[sensorId];
        const sensorElement = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
        
        if (sensorElement) {
            sensorElement.className = 'sensor';
            
            if (sensor.status === 'Normal') {
                sensorElement.classList.add('sensor-normal');
            } else if (sensor.status === 'Alerta') {
                sensorElement.classList.add('sensor-warning');
            } else if (sensor.status === 'Crítico') {
                sensorElement.classList.add('sensor-alert');
            } else if (sensor.status === 'Não Configurado') {
                sensorElement.classList.add('sensor-inactive');
            } else {
                sensorElement.classList.add('sensor-normal');
            }
        }
    });
}

function updateSensorTemperatures() {
    Object.keys(sensorData).forEach(sensorId => {
        const sensor = sensorData[sensorId];
        const sensorElement = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
        
        if (sensorElement) {
            const temperatureElement = sensorElement.querySelector('.sensor-temperature');
            if (temperatureElement) {
                temperatureElement.textContent = sensor.value;
            }
        }
    });
}

function createSensorCards() {
    const sensorsGrid = document.getElementById('sensors-grid');
    sensorsGrid.innerHTML = '';
    
    Object.keys(sensorData).forEach(sensorId => {
        const sensor = sensorData[sensorId];
        
        const sensorCard = document.createElement('div');
        sensorCard.className = 'sensor-card';
        sensorCard.setAttribute('data-sensor', sensorId);
        
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status-badge ${getSensorStatusClass(sensor.status)}">${sensor.status}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}</div>
            <div class="sensor-card-location">${sensor.location}</div>
            ${sensor.humidity && sensor.humidity !== 'Não Config.' ? `<div class="sensor-card-humidity">Umidade: ${sensor.humidity}</div>` : ''}
        `;
        
        sensorsGrid.appendChild(sensorCard);
    });
}

function getSensorStatusClass(status) {
    switch(status) {
        case 'Normal': return 'status-normal';
        case 'Alerta': return 'status-warning';
        case 'Crítico': return 'status-alert';
        case 'Não Configurado': return 'status-inactive';
        default: return 'status-inactive';
    }
}

// NOVA FUNÇÃO: Atualizar detalhes do sensor sem afetar os gráficos
function updateSensorDetailsWithoutAffectingCharts(sensorId) {
    const sensor = sensorData[sensorId];
    
    if (!sensor) return;
    
    // Atualizar o sensor selecionado
    selectedSensor = sensorId;
    
    document.getElementById('sensor-name').textContent = sensor.name;
    document.getElementById('sensor-value').textContent = sensor.value;
    document.getElementById('sensor-location').textContent = sensor.location;
    document.getElementById('sensor-last-read').textContent = sensor.lastRead;
    document.getElementById('sensor-status-text').textContent = sensor.status;
    
    const iconElement = document.querySelector('.sensor-details-icon i');
    iconElement.className = sensor.icon;
    
    const statusElement = document.getElementById('sensor-status');
    statusElement.textContent = sensor.status;
    statusElement.className = 'sensor-details-status status-badge';
    statusElement.classList.add(getSensorStatusClass(sensor.status));
    
    // Aplicar cor vermelha ao valor da temperatura E ao ícone se for crítico
    const sensorValueElement = document.getElementById('sensor-value');
    const sensorIconElement = document.querySelector('.sensor-details-icon');
    
    if (sensor.status === 'Crítico') {
        sensorValueElement.style.color = 'var(--danger)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--danger), #c82333)';
    } else if (sensor.status === 'Alerta') {
        sensorValueElement.style.color = 'var(--warning)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--warning), #fd7e14)';
    } else {
        sensorValueElement.style.color = 'var(--primary)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
    }
    
    // Atualizar seleção visual nos sensores
    const allSensors = document.querySelectorAll('.sensor');
    allSensors.forEach(s => s.classList.remove('active'));
    
    const selectedSensorElement = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
    if (selectedSensorElement) {
        selectedSensorElement.classList.add('active');
    }
    
    // Atualizar seleção visual nos cards
    const allCards = document.querySelectorAll('.sensor-card');
    allCards.forEach(c => c.style.boxShadow = 'none');
    
    const selectedCard = document.querySelector(`.sensor-card[data-sensor="${sensorId}"]`);
    if (selectedCard) {
        selectedCard.style.boxShadow = '0 0 0 2px var(--primary)';
    }
    
    // NÃO atualizar os gráficos - deixar todos os sensores visíveis
}

// NOVA FUNÇÃO: Atualizar gráficos para mostrar apenas o sensor selecionado
function updateChartsForSelectedSensor(sensorId) {
    // Para temperatura
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    sensorNames.forEach(name => {
        if (name === sensorId) {
            visibleTemperatureSensors.add(name);
        } else {
            visibleTemperatureSensors.delete(name);
        }
    });
    
    // Para umidade
    sensorNames.forEach(name => {
        if (name === sensorId) {
            visibleHumiditySensors.add(name);
        } else {
            visibleHumiditySensors.delete(name);
        }
    });
    
    // Atualizar os gráficos
    if (currentSensorChart) {
        sensorNames.forEach(sensorName => {
            const datasetIndex = currentSensorChart.data.datasets.findIndex(ds => 
                ds.label === sensorData[sensorName]?.name
            );
            if (datasetIndex !== -1) {
                currentSensorChart.setDatasetVisibility(datasetIndex, sensorName === sensorId);
            }
        });
        currentSensorChart.update();
    }
    
    if (currentHumidityChart) {
        sensorNames.forEach(sensorName => {
            const datasetIndex = currentHumidityChart.data.datasets.findIndex(ds => 
                ds.label === sensorData[sensorName]?.name
            );
            if (datasetIndex !== -1) {
                currentHumidityChart.setDatasetVisibility(datasetIndex, sensorName === sensorId);
            }
        });
        currentHumidityChart.update();
    }
    
    // Atualizar as legendas
    updateLegendStates(sensorId);
}

// NOVA FUNÇÃO: Atualizar estados das legendas
function updateLegendStates(selectedSensorId) {
    // Atualizar legendas de temperatura
    const tempLegendItems = document.querySelectorAll('#temperature-legend .legend-item');
    tempLegendItems.forEach(item => {
        const sensorName = item.getAttribute('data-sensor');
        const checkbox = item.querySelector('.legend-checkbox');
        if (sensorName === selectedSensorId) {
            checkbox.checked = true;
            item.classList.remove('hidden');
        } else {
            checkbox.checked = false;
            item.classList.add('hidden');
        }
    });
    
    // Atualizar legendas de umidade
    const humidityLegendItems = document.querySelectorAll('#humidity-legend .legend-item');
    humidityLegendItems.forEach(item => {
        const sensorName = item.getAttribute('data-sensor');
        const checkbox = item.querySelector('.legend-checkbox');
        if (sensorName === selectedSensorId) {
            checkbox.checked = true;
            item.classList.remove('hidden');
        } else {
            checkbox.checked = false;
            item.classList.add('hidden');
        }
    });
}

// FUNÇÃO ATUALIZADA: updateSensorDetails agora também atualiza os gráficos
function updateSensorDetails(sensorId) {
    const sensor = sensorData[sensorId];
    
    if (!sensor) return;
    
    // Atualizar o sensor selecionado
    selectedSensor = sensorId;
    
    document.getElementById('sensor-name').textContent = sensor.name;
    document.getElementById('sensor-value').textContent = sensor.value;
    document.getElementById('sensor-location').textContent = sensor.location;
    document.getElementById('sensor-last-read').textContent = sensor.lastRead;
    document.getElementById('sensor-status-text').textContent = sensor.status;
    
    const iconElement = document.querySelector('.sensor-details-icon i');
    iconElement.className = sensor.icon;
    
    const statusElement = document.getElementById('sensor-status');
    statusElement.textContent = sensor.status;
    statusElement.className = 'sensor-details-status status-badge';
    statusElement.classList.add(getSensorStatusClass(sensor.status));
    
    // Aplicar cor vermelha ao valor da temperatura E ao ícone se for crítico
    const sensorValueElement = document.getElementById('sensor-value');
    const sensorIconElement = document.querySelector('.sensor-details-icon');
    
    if (sensor.status === 'Crítico') {
        sensorValueElement.style.color = 'var(--danger)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--danger), #c82333)';
    } else if (sensor.status === 'Alerta') {
        sensorValueElement.style.color = 'var(--warning)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--warning), #fd7e14)';
    } else {
        sensorValueElement.style.color = 'var(--primary)';
        sensorIconElement.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
    }
    
    // Atualizar seleção visual nos sensores
    const allSensors = document.querySelectorAll('.sensor');
    allSensors.forEach(s => s.classList.remove('active'));
    
    const selectedSensorElement = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
    if (selectedSensorElement) {
        selectedSensorElement.classList.add('active');
    }
    
    // Atualizar seleção visual nos cards
    const allCards = document.querySelectorAll('.sensor-card');
    allCards.forEach(c => c.style.boxShadow = 'none');
    
    const selectedCard = document.querySelector(`.sensor-card[data-sensor="${sensorId}"]`);
    if (selectedCard) {
        selectedCard.style.boxShadow = '0 0 0 2px var(--primary)';
    }
    
    // NOVO: Atualizar gráficos para mostrar apenas o sensor selecionado
    updateChartsForSelectedSensor(sensorId);
}

// NOVAS FUNÇÕES PARA GRÁFICOS COMPARATIVOS
function createComparativeCharts() {
    createComparativeTemperatureChart();
    createComparativeHumidityChart();
    createChartLegends();
    
    // Garantir que todos os sensores estejam visíveis no carregamento inicial
    showAllSensorsOnLoad();
    
    // Iniciar atualizações automáticas dos gráficos
    startChartUpdates();
}

// NOVA FUNÇÃO: Mostrar todos os sensores no carregamento inicial
function showAllSensorsOnLoad() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    // Limpar os conjuntos e adicionar todos os sensores
    visibleTemperatureSensors.clear();
    visibleHumiditySensors.clear();
    
    sensorNames.forEach(sensorName => {
        if (sensorData[sensorName] && sensorData[sensorName].status !== 'Não Configurado') {
            visibleTemperatureSensors.add(sensorName);
            visibleHumiditySensors.add(sensorName);
        }
    });
    
    // Atualizar os gráficos
    if (currentSensorChart) {
        sensorNames.forEach(sensorName => {
            const datasetIndex = currentSensorChart.data.datasets.findIndex(ds => 
                ds.label === sensorData[sensorName]?.name
            );
            if (datasetIndex !== -1) {
                currentSensorChart.setDatasetVisibility(datasetIndex, visibleTemperatureSensors.has(sensorName));
            }
        });
        currentSensorChart.update();
    }
    
    if (currentHumidityChart) {
        sensorNames.forEach(sensorName => {
            const datasetIndex = currentHumidityChart.data.datasets.findIndex(ds => 
                ds.label === sensorData[sensorName]?.name
            );
            if (datasetIndex !== -1) {
                currentHumidityChart.setDatasetVisibility(datasetIndex, visibleHumiditySensors.has(sensorName));
            }
        });
        currentHumidityChart.update();
    }
    
    // Atualizar as legendas para mostrar todos
    updateAllLegendStates();
}

// NOVA FUNÇÃO: Atualizar todas as legendas para estado inicial
function updateAllLegendStates() {
    // Atualizar legendas de temperatura
    const tempLegendItems = document.querySelectorAll('#temperature-legend .legend-item');
    tempLegendItems.forEach(item => {
        const sensorName = item.getAttribute('data-sensor');
        const checkbox = item.querySelector('.legend-checkbox');
        const isVisible = visibleTemperatureSensors.has(sensorName);
        checkbox.checked = isVisible;
        if (isVisible) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Atualizar legendas de umidade
    const humidityLegendItems = document.querySelectorAll('#humidity-legend .legend-item');
    humidityLegendItems.forEach(item => {
        const sensorName = item.getAttribute('data-sensor');
        const checkbox = item.querySelector('.legend-checkbox');
        const isVisible = visibleHumiditySensors.has(sensorName);
        checkbox.checked = isVisible;
        if (isVisible) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function createComparativeTemperatureChart() {
    updateLoadingStep(4);
    
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) {
        console.error('Canvas temperatureChart não encontrado');
        return;
    }
    
    if (currentSensorChart) {
        currentSensorChart.destroy();
    }
    
    const datasets = [];
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    // Obter labels do primeiro sensor que tenha dados
    let timeLabels = [];
    sensorNames.forEach(sensorName => {
        if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
            // CORREÇÃO: Usar a nova função que considera timezone
            timeLabels = sensorHistoryData[sensorName].map(entry => 
                formatTimeForChart(entry.timestamp)
            );
            return;
        }
    });
    
    // Criar datasets para cada sensor
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        const history = sensorHistoryData[sensorName] || [];
        
        // Só criar dataset se o sensor estiver configurado
        if (sensor && sensor.status !== 'Não Configurado' && history.length > 0) {
            const data = history.map(entry => entry.temperature);
            
            datasets.push({
                label: sensor.name,
                data: data,
                borderColor: sensorColors[sensorName],
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                fill: false,
                tension: 0.3,
                pointRadius: 1,
                pointHoverRadius: 3,
                pointBorderWidth: 0,
                pointBackgroundColor: sensorColors[sensorName],
                hidden: !visibleTemperatureSensors.has(sensorName)
            });
        }
    });
    
    const ctx2d = ctx.getContext('2d');
    currentSensorChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 12
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 8
                }
            },
            scales: {
                x: {
                    grid: { 
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        font: {
                            size: 10
                        },
                        callback: function(value, index, values) {
                            return index % 2 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: { 
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Temperatura (°C)',
                        font: {
                            size: 11
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        }
    });
}

function createComparativeHumidityChart() {
    const ctx = document.getElementById('humidityChart');
    if (!ctx) {
        console.error('Canvas humidityChart não encontrado');
        return;
    }
    
    if (currentHumidityChart) {
        currentHumidityChart.destroy();
    }
    
    const datasets = [];
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    let timeLabels = [];
    sensorNames.forEach(sensorName => {
        if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
            // CORREÇÃO: Usar a nova função que considera timezone
            timeLabels = sensorHistoryData[sensorName].map(entry => 
                formatTimeForChart(entry.timestamp)
            );
            return;
        }
    });
    
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        const history = sensorHistoryData[sensorName] || [];
        
        if (sensor && sensor.status !== 'Não Configurado' && history.length > 0) {
            const data = history.map(entry => entry.humidity);
            
            datasets.push({
                label: sensor.name,
                data: data,
                borderColor: humidityColors[sensorName],
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                fill: false,
                tension: 0.3,
                pointRadius: 1,
                pointHoverRadius: 3,
                pointBorderWidth: 0,
                pointBackgroundColor: humidityColors[sensorName],
                hidden: !visibleHumiditySensors.has(sensorName)
            });
        }
    });
    
    const ctx2d = ctx.getContext('2d');
    currentHumidityChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 12
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 8
                }
            },
            scales: {
                x: {
                    grid: { 
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        font: {
                            size: 10
                        },
                        callback: function(value, index, values) {
                            return index % 2 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: { 
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Umidade (%)',
                        font: {
                            size: 11
                        }
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        }
    });
}

function createChartLegends() {
    createTemperatureLegend();
    createHumidityLegend();
}

function createTemperatureLegend() {
    const legendContainer = document.getElementById('temperature-legend');
    legendContainer.innerHTML = '';
    
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        
        // Só criar legenda para sensores configurados
        if (sensor && sensor.status !== 'Não Configurado') {
            const isVisible = visibleTemperatureSensors.has(sensorName);
            
            const legendItem = document.createElement('div');
            legendItem.className = `legend-item ${!isVisible ? 'hidden' : ''}`;
            legendItem.setAttribute('data-sensor', sensorName);
            
            legendItem.innerHTML = `
                <input type="checkbox" class="legend-checkbox" ${isVisible ? 'checked' : ''}>
                <div class="legend-color sensor-color-${sensorName}"></div>
                <div class="legend-text">${sensor.name}</div>
            `;
            
            legendContainer.appendChild(legendItem);
            
            // Adicionar evento de clique
            legendItem.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = this.querySelector('.legend-checkbox');
                    const newCheckedState = !checkbox.checked;
                    checkbox.checked = newCheckedState;
                    toggleTemperatureSensor(sensorName, newCheckedState);
                }
            });
            
            // Evento para o checkbox
            const checkbox = legendItem.querySelector('.legend-checkbox');
            checkbox.addEventListener('change', function() {
                toggleTemperatureSensor(sensorName, this.checked);
            });
        }
    });
}

function createHumidityLegend() {
    const legendContainer = document.getElementById('humidity-legend');
    legendContainer.innerHTML = '';
    
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        
        if (sensor && sensor.status !== 'Não Configurado') {
            const isVisible = visibleHumiditySensors.has(sensorName);
            
            const legendItem = document.createElement('div');
            legendItem.className = `legend-item ${!isVisible ? 'hidden' : ''}`;
            legendItem.setAttribute('data-sensor', sensorName);
            
            legendItem.innerHTML = `
                <input type="checkbox" class="legend-checkbox" ${isVisible ? 'checked' : ''}>
                <div class="legend-color sensor-humidity-color-${sensorName}"></div>
                <div class="legend-text">${sensor.name}</div>
            `;
            
            legendContainer.appendChild(legendItem);
            
            legendItem.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = this.querySelector('.legend-checkbox');
                    const newCheckedState = !checkbox.checked;
                    checkbox.checked = newCheckedState;
                    toggleHumiditySensor(sensorName, newCheckedState);
                }
            });
            
            const checkbox = legendItem.querySelector('.legend-checkbox');
            checkbox.addEventListener('change', function() {
                toggleHumiditySensor(sensorName, this.checked);
            });
        }
    });
}

function toggleTemperatureSensor(sensorName, show) {
    if (show) {
        visibleTemperatureSensors.add(sensorName);
    } else {
        visibleTemperatureSensors.delete(sensorName);
    }
    
    // Atualizar gráfico
    if (currentSensorChart) {
        const datasetIndex = currentSensorChart.data.datasets.findIndex(ds => 
            ds.label === sensorData[sensorName].name
        );
        
        if (datasetIndex !== -1) {
            currentSensorChart.setDatasetVisibility(datasetIndex, show);
            currentSensorChart.update();
        }
    }
    
    // Atualizar legenda
    const legendItem = document.querySelector(`#temperature-legend .legend-item[data-sensor="${sensorName}"]`);
    if (legendItem) {
        if (show) {
            legendItem.classList.remove('hidden');
        } else {
            legendItem.classList.add('hidden');
        }
    }
    
    // Atualizar checkbox
    const checkbox = document.querySelector(`#temperature-legend .legend-item[data-sensor="${sensorName}"] .legend-checkbox`);
    if (checkbox) {
        checkbox.checked = show;
    }
}

function toggleHumiditySensor(sensorName, show) {
    if (show) {
        visibleHumiditySensors.add(sensorName);
    } else {
        visibleHumiditySensors.delete(sensorName);
    }
    
    if (currentHumidityChart) {
        const datasetIndex = currentHumidityChart.data.datasets.findIndex(ds => 
            ds.label === sensorData[sensorName].name
        );
        
        if (datasetIndex !== -1) {
            currentHumidityChart.setDatasetVisibility(datasetIndex, show);
            currentHumidityChart.update();
        }
    }
    
    const legendItem = document.querySelector(`#humidity-legend .legend-item[data-sensor="${sensorName}"]`);
    if (legendItem) {
        if (show) {
            legendItem.classList.remove('hidden');
        } else {
            legendItem.classList.add('hidden');
        }
    }
    
    // Atualizar checkbox
    const checkbox = document.querySelector(`#humidity-legend .legend-item[data-sensor="${sensorName}"] .legend-checkbox`);
    if (checkbox) {
        checkbox.checked = show;
    }
}

function showAllTemperatureSensors() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    sensorNames.forEach(sensorName => {
        if (sensorData[sensorName] && sensorData[sensorName].status !== 'Não Configurado') {
            visibleTemperatureSensors.add(sensorName);
            toggleTemperatureSensor(sensorName, true);
        }
    });
}

function hideAllTemperatureSensors() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    sensorNames.forEach(sensorName => {
        visibleTemperatureSensors.delete(sensorName);
        toggleTemperatureSensor(sensorName, false);
    });
}

function showAllHumiditySensors() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    sensorNames.forEach(sensorName => {
        if (sensorData[sensorName] && sensorData[sensorName].status !== 'Não Configurado') {
            visibleHumiditySensors.add(sensorName);
            toggleHumiditySensor(sensorName, true);
        }
    });
}

function hideAllHumiditySensors() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    sensorNames.forEach(sensorName => {
        visibleHumiditySensors.delete(sensorName);
        toggleHumiditySensor(sensorName, false);
    });
}

// NOVAS FUNÇÕES PARA ATUALIZAÇÃO AUTOMÁTICA DOS GRÁFICOS
function startChartUpdates() {
    setInterval(async () => {
        try {
            console.log('Atualizando gráficos...');
            
            // Recarregar dados históricos
            const newHistoryData = await loadSensorHistory();
            
            if (newHistoryData && Object.keys(newHistoryData).length > 0) {
                sensorHistoryData = newHistoryData;
                
                // Atualizar gráficos se existirem
                if (currentSensorChart) {
                    updateTemperatureChartData();
                }
                
                if (currentHumidityChart) {
                    updateHumidityChartData();
                }
                
                console.log('Gráficos atualizados com sucesso');
            }
            
        } catch (error) {
            console.error('Erro ao atualizar gráficos:', error);
        }
    }, 30000); // Atualizar a cada 30 segundos
}

function updateTemperatureChartData() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        const history = sensorHistoryData[sensorName] || [];
        
        if (sensor && sensor.status !== 'Não Configurado' && history.length > 0) {
            const datasetIndex = currentSensorChart.data.datasets.findIndex(ds => 
                ds.label === sensor.name
            );
            
            if (datasetIndex !== -1) {
                // Atualizar dados
                const newData = history.map(entry => entry.temperature);
                currentSensorChart.data.datasets[datasetIndex].data = newData;
                
                // Atualizar labels se necessário
                if (currentSensorChart.data.labels.length !== history.length) {
                    currentSensorChart.data.labels = history.map(entry => 
                        formatTimeForChart(entry.timestamp)
                    );
                }
            }
        }
    });
    
    currentSensorChart.update('none'); // Atualizar sem animação
}

function updateHumidityChartData() {
    const sensorNames = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
    sensorNames.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        const history = sensorHistoryData[sensorName] || [];
        
        if (sensor && sensor.status !== 'Não Configurado' && history.length > 0) {
            const datasetIndex = currentHumidityChart.data.datasets.findIndex(ds => 
                ds.label === sensor.name
            );
            
            if (datasetIndex !== -1) {
                // Atualizar dados
                const newData = history.map(entry => entry.humidity);
                currentHumidityChart.data.datasets[datasetIndex].data = newData;
                
                // Atualizar labels se necessário
                if (currentHumidityChart.data.labels.length !== history.length) {
                    currentHumidityChart.data.labels = history.map(entry => 
                        formatTimeForChart(entry.timestamp)
                    );
                }
            }
        }
    });
    
    currentHumidityChart.update('none'); // Atualizar sem animação
}

// Adicionar eventos de clique aos sensores
function setupEventListeners() {
    updateLoadingStep(3);
    
    const sensors = document.querySelectorAll('.sensor');
    const sensorCards = document.querySelectorAll('.sensor-card');
    
    sensors.forEach(sensor => {
        sensor.addEventListener('click', function() {
            const sensorId = this.getAttribute('data-sensor');
            updateSensorDetails(sensorId);
        });
    });
    
    sensorCards.forEach(card => {
        card.addEventListener('click', function() {
            const sensorId = this.getAttribute('data-sensor');
            updateSensorDetails(sensorId);
        });
    });
    
    const doorsCard = document.getElementById('doors-card');
    if (doorsCard) {
        doorsCard.addEventListener('click', toggleDoorStatus);
    }
    
    // Eventos para controles dos gráficos
    document.getElementById('show-all-temp').addEventListener('click', showAllTemperatureSensors);
    document.getElementById('hide-all-temp').addEventListener('click', hideAllTemperatureSensors);
    document.getElementById('show-all-humidity').addEventListener('click', showAllHumiditySensors);
    document.getElementById('hide-all-humidity').addEventListener('click', hideAllHumiditySensors);
    
    if (Object.keys(sensorData).length > 0) {
        updateSensorDetailsWithoutAffectingCharts('principal');
    }
}

// Atualização de dados em tempo real
async function updateSensorData() {
    try {
        console.log('Atualizando dados dos sensores...');
        
        const newSensorData = await loadSensorData();
        
        Object.keys(newSensorData).forEach(sensorId => {
            const sensor = newSensorData[sensorId];
            
            const sensorElement = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
            if (sensorElement) {
                const temperatureElement = sensorElement.querySelector('.sensor-temperature');
                if (temperatureElement) {
                    temperatureElement.textContent = sensor.value;
                }
                
                sensorElement.className = 'sensor';
                if (sensor.status === 'Normal') {
                    sensorElement.classList.add('sensor-normal');
                } else if (sensor.status === 'Alerta') {
                    sensorElement.classList.add('sensor-warning');
                } else if (sensor.status === 'Crítico') {
                    sensorElement.classList.add('sensor-alert');
                } else if (sensor.status === 'Não Configurado') {
                    sensorElement.classList.add('sensor-inactive');
                }
            }
            
            const selectedSensor = document.querySelector('.sensor.active');
            if (selectedSensor && selectedSensor.getAttribute('data-sensor') === sensorId) {
                updateSensorDetails(sensorId);
            }
            
            const card = document.querySelector(`.sensor-card[data-sensor="${sensorId}"]`);
            if (card) {
                card.querySelector('.sensor-card-value').textContent = sensor.value;
                
                const statusBadge = card.querySelector('.status-badge');
                statusBadge.textContent = sensor.status;
                statusBadge.className = 'status-badge';
                statusBadge.classList.add(getSensorStatusClass(sensor.status));
            }
        });
        
        sensorData = newSensorData;
        updateDashboardWithSensorData();
        
        console.log('Dados dos sensores atualizados com sucesso');
        
    } catch (error) {
        console.error('Erro ao atualizar dados dos sensores:', error);
    }
    
    setTimeout(updateSensorData, 10000);
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    // Mostrar loading imediatamente
    showLoading();
    updateLoadingStep(0);
    
    const truckClosed = document.getElementById('truck-closed');
    const truckOpen = document.getElementById('truck-open');
    
    if (truckClosed && truckOpen) {
        truckClosed.style.opacity = '1';
        truckOpen.style.opacity = '0';
        isDoorOpen = false;
    }
    
    try {
        await loadVehicleData();
        
        setTimeout(() => {
            setupEventListeners();
            updateLoadingStep(5);
            
            // Esconder loading após um pequeno delay para garantir que tudo foi carregado
            setTimeout(() => {
                hideLoading();
            }, 1000);
        }, 100);
        
        // Iniciar atualização automática
        setTimeout(updateSensorData, 15000);
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        // Em caso de erro, esconder o loading também
        hideLoading();
    }
});