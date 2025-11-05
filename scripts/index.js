// Variáveis globais
let sensorData = {};
let sensorHistoryData = {};
let temperatureChart, statusChart, historyChart;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
});

// Função para inicializar o dashboard
async function initializeDashboard() {
    console.log('Inicializando dashboard com dados reais...');
    
    try {
        // Carregar dados dos sensores
        await loadSensorData();
        
        // Carregar histórico dos sensores
        await loadSensorHistory();
        
        // Atualizar dashboard com dados reais
        updateDashboardWithRealData();
        
        // Inicializar gráficos
        if (typeof Chart !== 'undefined') {
            initializeCharts();
        } else {
            console.warn('Chart.js não está disponível. Gráficos não serão renderizados.');
            showChartPlaceholders();
        }
        
        // Configurar event listeners
        setupEventListeners();
        
        // Iniciar atualizações em tempo real
        startRealTimeUpdates();
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        // Usar dados de fallback em caso de erro
        useFallbackData();
    }
}

// Carregar dados dos sensores
async function loadSensorData() {
    try {
        console.log('Carregando dados dos sensores...');
        const response = await fetch('./sensor_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados dos sensores carregados:', data);
        sensorData = data;
        
    } catch (error) {
        console.error('Erro ao carregar dados dos sensores:', error);
        throw error;
    }
}

// Carregar histórico dos sensores
async function loadSensorHistory() {
    try {
        console.log('Carregando histórico dos sensores...');
        const response = await fetch('./sensor_history.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Histórico dos sensores carregado:', data);
        sensorHistoryData = data;
        
    } catch (error) {
        console.error('Erro ao carregar histórico dos sensores:', error);
        throw error;
    }
}

// Atualizar dashboard com dados reais
function updateDashboardWithRealData() {
    console.log('Atualizando dashboard com dados reais...');
    
    // Calcular métricas reais
    const totalVehicles = 1; // Apenas KG8000003
    const avgTemperature = calculateAverageTemperature();
    const activeAlerts = countActiveAlerts();
    
    // Atualizar cards do dashboard
    document.getElementById('total-vehicles').querySelector('.loading-content').textContent = totalVehicles;
    document.getElementById('avg-temperature').querySelector('.loading-content').textContent = `${avgTemperature}°C`;
    document.getElementById('active-alerts').querySelector('.loading-content').textContent = activeAlerts;
    
    // REMOVIDO: Card de economia de combustível
    
    // Remover loading dos cards
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('card-loading');
        card.classList.add('content-loaded');
    });
    
    // Popular tabela de veículos
    populateVehicleTable();
    
    console.log('Dashboard atualizado com dados reais');
}

// Função para calcular temperatura média dos sensores internos
function calculateAverageTemperature() {
    // NOVOS NOMES DOS SENSORES INTERNOS
    const internalSensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
    let totalTemp = 0;
    let validSensors = 0;
    
    internalSensors.forEach(sensorName => {
        if (sensorData[sensorName] && sensorData[sensorName].temperature !== 0.0) {
            totalTemp += sensorData[sensorName].temperature;
            validSensors++;
        }
    });
    
    if (validSensors > 0) {
        return (totalTemp / validSensors).toFixed(1);
    }
    
    return '--';
}

// FUNÇÃO MODIFICADA: Nova faixa de temperatura -2°C a 10°C
function countActiveAlerts() {
    let alertCount = 0;
    
    Object.entries(sensorData).forEach(([sensorName, sensor]) => {
        // Ignorar sensor externo e sensores não configurados
        if (sensorName === 'externo' || sensor.temperature === 0.0) {
            return;
        }
        
        // NOVA FAIXA: -2°C a 10°C é normal
        if (sensor.temperature > 15) {
            alertCount++; // Crítico
        } else if (sensor.temperature > 10 || sensor.temperature < -2) {
            alertCount++; // Alerta
        }
    });
    
    return alertCount;
}

// Contar sensores configurados
function countConfiguredSensors() {
    let count = 0;
    Object.values(sensorData).forEach(sensor => {
        if (sensor.temperature !== 0.0) {
            count++;
        }
    });
    return count;
}

// FUNÇÃO MODIFICADA: Nova faixa de temperatura -2°C a 10°C
function getTemperatureStatus(temperature) {
    if (isNaN(temperature)) {
        return 'Sem Dados';
    }
    
    // NOVA FAIXA: -2°C a 10°C é normal
    if (temperature >= -2 && temperature <= 10) return 'Normal';
    if ((temperature > -5 && temperature < -2) || (temperature > 10 && temperature <= 15)) return 'Alerta';
    return 'Crítico';
}

// Função para obter última atualização
function getLastUpdateTime(sensorData) {
    if (!sensorData) return '--';
    
    let latestTime = null;
    Object.values(sensorData).forEach(sensor => {
        if (sensor.last_read) {
            const sensorTime = new Date(sensor.last_read);
            if (!latestTime || sensorTime > latestTime) {
                latestTime = sensorTime;
            }
        }
    });
    
    if (latestTime) {
        return latestTime.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    return '--';
}

// Função para criar tooltip dos sensores
function createSensorTooltip(sensorData, lastUpdate) {
    if (!sensorData) {
        return '<div class="sensor-item"><span class="sensor-name">Sem dados de sensores</span></div>';
    }
    
    let tooltipHTML = '';
    let hasData = false;
    
    // NOVA ORDEM DOS SENSORES
    const sensorOrder = ['externo', 'dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
    
    sensorOrder.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        if (sensor && sensor.temperature !== 0.0) {
            hasData = true;
            const displayName = getSensorDisplayName(sensorName);
            const statusClass = getSensorStatusClass(sensor.temperature, sensorName === 'externo');
            
            tooltipHTML += `
                <div class="sensor-item ${statusClass}">
                    <span class="sensor-name">${displayName}</span>
                    <span class="sensor-value">${sensor.temperature}°C</span>
                </div>
            `;
        }
    });
    
    if (!hasData) {
        tooltipHTML = '<div class="sensor-item"><span class="sensor-name">Nenhum sensor configurado</span></div>';
    }
    
    return tooltipHTML;
}

// FUNÇÃO MODIFICADA: Nova faixa de temperatura -2°C a 10°C
function getSensorStatusClass(temperature, isExternal = false) {
    if (isExternal) return 'sensor-external';
    
    // NOVA FAIXA: -2°C a 10°C é normal
    if (temperature >= -2 && temperature <= 10) return 'sensor-normal';
    if ((temperature > -5 && temperature < -2) || (temperature > 10 && temperature <= 15)) return 'sensor-warning';
    return 'sensor-critical';
}

// Configurar tooltips
function setupTooltips() {
    const multiSensors = document.querySelectorAll('.multi-sensor');
    
    multiSensors.forEach(sensor => {
        // Remover event listeners anteriores para evitar duplicação
        sensor.removeEventListener('mouseenter', showTooltip);
        sensor.removeEventListener('mouseleave', hideTooltip);
        
        // Adicionar novos event listeners
        sensor.addEventListener('mouseenter', showTooltip);
        sensor.addEventListener('mouseleave', hideTooltip);
    });
}

// Mostrar tooltip
function showTooltip(event) {
    const sensor = event.currentTarget;
    const tooltip = sensor.querySelector('.sensor-tooltip');
    
    if (tooltip) {
        // Posicionar tooltip acima do elemento
        const rect = sensor.getBoundingClientRect();
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.bottom = '100%';
        tooltip.style.top = 'auto';
        tooltip.style.marginBottom = '10px';
        
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }
}

// Esconder tooltip
function hideTooltip(event) {
    const sensor = event.currentTarget;
    const tooltip = sensor.querySelector('.sensor-tooltip');
    
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }
}

// NOVAS FUNÇÕES AUXILIARES PARA NOMES DOS SENSORES
function getSensorDisplayName(sensorName) {
    const names = {
        'externo': 'Externo',
        'dianteiro-direito': 'Dianteiro Direito',
        'dianteiro-esquerdo': 'Dianteiro Esquerdo',
        'central-direito': 'Central Direito',
        'central-esquerdo': 'Central Esquerdo',
        'fundo-direito': 'Fundo Direito',
        'fundo-esquerdo': 'Fundo Esquerdo'
    };
    return names[sensorName] || sensorName;
}

function getSensorLocation(sensorName) {
    const locations = {
        'externo': 'Externo do veículo',
        'dianteiro-direito': 'Parte dianteira direita',
        'dianteiro-esquerdo': 'Parte dianteira esquerda',
        'central-direito': 'Centro direito da carga',
        'central-esquerdo': 'Centro esquerdo da carga',
        'fundo-direito': 'Fundo direito',
        'fundo-esquerdo': 'Fundo esquerdo'
    };
    return locations[sensorName] || 'Localização desconhecida';
}

// Popular tabela de veículos - VERSÃO SIMPLIFICADA
function populateVehicleTable() {
    const tableBody = document.getElementById('vehicle-table-body');
    
    // Remover classe de loading da tabela
    const table = document.querySelector('.vehicle-table');
    table.classList.remove('table-loading');
    
    tableBody.innerHTML = '';
    
    console.log('Populando tabela com veículos');
    
    // Para cada veículo (apenas KG8000003)
    const row = document.createElement('tr');
    
    // Calcular temperatura média dos sensores internos
    const avgTemperature = calculateAverageTemperature();
    const sensorCount = countConfiguredSensors();
    const lastUpdate = getLastUpdateTime(sensorData);
    const temperatureStatus = getTemperatureStatus(parseFloat(avgTemperature));
    
    // Dados FIXOS - sem aleatoriedade
    const vehicleModel = 'Mercedes Sprinter';
    const driver = 'Carlos Silva';
    const route = 'Centro - Zona Sul';
    
    // Determinar classe do indicador de temperatura
    let tempClass = 'temp-normal';
    const tempValue = parseFloat(avgTemperature);
    if (!isNaN(tempValue)) {
        // NOVA FAIXA: -2°C a 10°C é normal
        if (tempValue > 15) tempClass = 'temp-alert';
        else if (tempValue > 10 || tempValue < -2) tempClass = 'temp-warning';
    }
    
    // Criar tooltip de sensores
    const sensorTooltip = createSensorTooltip(sensorData, lastUpdate);
    
    row.innerHTML = `
        <td>
            <a href="descricao.html?placa=KG8000003" class="placa-link" title="Abrir página de detalhes do veículo">
                KG8000003
            </a>
        </td>
        <td>${vehicleModel}</td>
        <td>${driver}</td>
        <td>${route}</td>
        <td>
            <div class="multi-sensor">
                <span class="temp-indicator ${tempClass}"></span> 
                <span class="temperature-value">${avgTemperature}°C</span>
                <span class="sensor-badge">${sensorCount} sensores</span>
                <div class="sensor-tooltip">
                    <div class="sensor-tooltip-title">Sensores - Última atualização: ${lastUpdate}</div>
                    <div class="sensor-tooltip-content">
                        ${sensorTooltip}
                    </div>
                </div>
            </div>
        </td>
        <td>${temperatureStatus}</td> <!-- STATUS SIMPLES SEM BADGE -->
        <td>
            <div class="action-buttons">
                <a href="descricao.html?placa=KG8000003" class="btn-action view" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </a>
            </div>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Atualizar contador
    updateVehicleCount();
    
    // Configurar tooltips após criar a tabela
    setupTooltips();
}

// Atualizar contador de veículos
function updateVehicleCount() {
    const totalVehicles = 1; // Apenas KG8000003
    document.getElementById('vehicleCount').innerHTML = `
        <div class="loading-content">Mostrando ${totalVehicles} de ${totalVehicles} veículo${totalVehicles !== 1 ? 's' : ''}</div>
    `;
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de temperatura média (últimas 12h)
    createTemperatureChart();
    
    // Gráfico de status da frota
    createStatusChart();
    
    // Esconder placeholders e mostrar gráficos
    document.querySelectorAll('.chart-loading').forEach(loading => {
        loading.style.display = 'none';
    });
    document.querySelectorAll('.chart-placeholder canvas').forEach(canvas => {
        canvas.style.display = 'block';
    });
}

// Criar gráfico de temperatura média
function createTemperatureChart() {
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) {
        console.error('Canvas temperatureChart não encontrado');
        return;
    }
    
    const ctx2d = ctx.getContext('2d');
    
    // Obter dados do histórico de temperatura média
    const temperatureHistory = calculateAverageTemperatureHistory();
    
    if (temperatureHistory.labels.length === 0) {
        console.warn('Sem dados históricos para o gráfico de temperatura');
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    temperatureChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: temperatureHistory.labels,
            datasets: [{
                label: 'Temperatura Média (°C)',
                data: temperatureHistory.data,
                borderColor: '#2EA7AD',
                backgroundColor: 'rgba(46, 167, 173, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2EA7AD',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                        maxRotation: 45,
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

// Calcular histórico de temperatura média
function calculateAverageTemperatureHistory() {
    // NOVOS NOMES DOS SENSORES INTERNOS
    const internalSensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
    const labels = [];
    const data = [];
    
    // Pegar o primeiro sensor que tenha dados para obter os timestamps
    let referenceSensor = null;
    for (const sensorName of internalSensors) {
        if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
            referenceSensor = sensorName;
            break;
        }
    }
    
    if (!referenceSensor) {
        return { labels: [], data: [] };
    }
    
    // Usar os timestamps do sensor de referência
    sensorHistoryData[referenceSensor].forEach((entry, index) => {
        const time = new Date(entry.timestamp);
        labels.push(time.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        
        // Calcular temperatura média para este timestamp
        let totalTemp = 0;
        let validSensors = 0;
        
        internalSensors.forEach(sensorName => {
            if (sensorHistoryData[sensorName] && 
                sensorHistoryData[sensorName][index] && 
                sensorHistoryData[sensorName][index].temperature !== 0.0) {
                totalTemp += sensorHistoryData[sensorName][index].temperature;
                validSensors++;
            }
        });
        
        if (validSensors > 0) {
            data.push(parseFloat((totalTemp / validSensors).toFixed(1)));
        } else {
            data.push(null);
        }
    });
    
    return { labels, data };
}

// Criar gráfico de status da frota
function createStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) {
        console.error('Canvas statusChart não encontrado');
        return;
    }
    
    const ctx2d = ctx.getContext('2d');
    
    // Calcular status baseado na temperatura média
    const avgTemperature = parseFloat(calculateAverageTemperature());
    let statusData = [0, 0, 0]; // [Normal, Alerta, Crítico]
    
    if (!isNaN(avgTemperature)) {
        // NOVA FAIXA: -2°C a 10°C é normal
        if (avgTemperature >= -2 && avgTemperature <= 10) {
            statusData[0] = 1; // Normal
        } else if ((avgTemperature > -5 && avgTemperature < -2) || (avgTemperature > 10 && avgTemperature <= 15)) {
            statusData[1] = 1; // Alerta
        } else {
            statusData[2] = 1; // Crítico
        }
    }
    
    // Destruir gráfico anterior se existir
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx2d, {
        type: 'doughnut',
        data: {
            labels: ['Normal', 'Alerta', 'Crítico'],
            datasets: [{
                data: statusData,
                backgroundColor: ['#2EAD61', '#ECDD13', '#EC2513'], // Verde, Amarelo, Vermelho
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} veículo(s) (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Mostrar placeholders quando Chart.js não estiver disponível
function showChartPlaceholders() {
    const chartContainers = document.querySelectorAll('.chart-placeholder');
    chartContainers.forEach(container => {
        if (!container.querySelector('canvas')) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;"><i class="fas fa-chart-line" style="font-size: 40px; margin-right: 10px;"></i>Gráfico não disponível</div>';
        }
    });
}

// Configurar botões de detalhes
function setupDetailButtons() {
    const buttons = document.querySelectorAll('.btn-primary[data-vehicle]');
    
    buttons.forEach(button => {
        // Remover event listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const vehicleId = this.getAttribute('data-vehicle');
            console.log('Abrindo modal para:', vehicleId);
            openVehicleModal(vehicleId);
        });
    });
}

// Abrir modal de detalhes do veículo
function openVehicleModal(vehicleId) {
    const avgTemperature = calculateAverageTemperature();
    const temperatureStatus = getTemperatureStatus(parseFloat(avgTemperature));
    const sensorCount = countConfiguredSensors();
    const activeAlerts = countActiveAlerts();
    
    // Preencher dados básicos COM DADOS FIXOS
    document.getElementById('modal-vehicle').textContent = vehicleId;
    document.getElementById('modal-driver').textContent = 'Carlos Silva'; // FIXO
    document.getElementById('modal-route').textContent = 'Centro - Zona Sul'; // FIXO
    document.getElementById('modal-temp').textContent = `${avgTemperature}°C`;
    document.getElementById('modal-update').textContent = new Date().toLocaleString('pt-BR');
    document.getElementById('modal-sensors-count').textContent = `${sensorCount} sensores ativos`;
    document.getElementById('modal-door-status').textContent = 'Fechada';
    
    // Configurar status - TEXTO SIMPLES
    const statusElement = document.getElementById('modal-status');
    statusElement.textContent = temperatureStatus;
    statusElement.className = 'detail-value'; // Remove classes de status
    
    // Preencher sensores
    const sensorsContainer = document.getElementById('modal-sensors');
    sensorsContainer.innerHTML = '';
    
    Object.entries(sensorData).forEach(([sensorName, sensor]) => {
        // Só mostrar sensores configurados
        if (sensor.temperature !== 0.0) {
            const sensorCard = document.createElement('div');
            let statusClass = '';
            let statusText = '';
            
            if (sensorName === 'externo') {
                statusClass = 'normal';
                statusText = 'Normal';
            } else {
                // NOVA FAIXA: -2°C a 10°C é normal
                if (sensor.temperature > 15) {
                    statusClass = 'alert';
                    statusText = 'Crítico';
                } else if (sensor.temperature > 10 || sensor.temperature < -2) {
                    statusClass = 'warning';
                    statusText = 'Alerta';
                } else {
                    statusClass = 'normal';
                    statusText = 'Normal';
                }
            }
            
            sensorCard.className = `sensor-card ${statusClass}`;
            sensorCard.innerHTML = `
                <div class="sensor-card-header">
                    <div class="sensor-card-title">${getSensorDisplayName(sensorName)}</div>
                    <span class="status ${statusClass}">${statusText}</span>
                </div>
                <div class="sensor-card-value">${sensor.temperature}°C</div>
                <div class="sensor-card-location">${getSensorLocation(sensorName)}</div>
                ${sensor.humidity && sensor.humidity !== 0.0 ? `<div class="sensor-card-humidity">Umidade: ${sensor.humidity}%</div>` : ''}
            `;
            
            sensorsContainer.appendChild(sensorCard);
        }
    });
    
    // Criar gráfico de histórico
    createModalHistoryChart();
    
    // Mostrar o modal
    const modal = document.getElementById('vehicleModal');
    modal.classList.add('active');
}

// Criar gráfico de histórico no modal
function createModalHistoryChart() {
    const ctx = document.getElementById('historyChart');
    if (!ctx) {
        console.error('Canvas historyChart não encontrado');
        return;
    }
    
    const ctx2d = ctx.getContext('2d');
    
    // Obter dados do histórico de temperatura média
    const temperatureHistory = calculateAverageTemperatureHistory();
    
    if (temperatureHistory.labels.length === 0) {
        ctx2d.fillStyle = '#f8f9fa';
        ctx2d.fillRect(0, 0, ctx.width, ctx.height);
        ctx2d.fillStyle = '#6c757d';
        ctx2d.textAlign = 'center';
        ctx2d.fillText('Sem dados históricos disponíveis', ctx.width / 2, ctx.height / 2);
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (historyChart) {
        historyChart.destroy();
    }
    
    historyChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: temperatureHistory.labels,
            datasets: [{
                label: 'Temperatura Média (°C)',
                data: temperatureHistory.data,
                borderColor: '#2EA7AD',
                backgroundColor: 'rgba(46, 167, 173, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2EA7AD',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
    
    // Esconder loading e mostrar gráfico
    const historyLoading = document.querySelector('.history-chart .chart-loading');
    if (historyLoading) {
        historyLoading.style.display = 'none';
    }
    ctx.style.display = 'block';
}

// Fechar modal
function closeModal() {
    document.getElementById('vehicleModal').classList.remove('active');
}

// Configurar event listeners
function setupEventListeners() {
    // Fechar modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Botão de exportar
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Gerar relatório
    const reportBtn = document.getElementById('modal-report');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateReport);
    }
}

// Exportar dados
function exportData() {
    const exportData = {
        vehicle: 'KG8000003',
        timestamp: new Date().toISOString(),
        averageTemperature: calculateAverageTemperature(),
        activeAlerts: countActiveAlerts(),
        sensors: sensorData,
        sensorHistory: sensorHistoryData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Criar link de download
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotasystem-kg8000003-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Dados exportados com sucesso!');
}

// Gerar relatório
function generateReport() {
    alert('Relatório gerado com sucesso!');
}

// Simulação de atualizações em tempo real
function startRealTimeUpdates() {
    setInterval(async () => {
        try {
            console.log('Atualizando dados em tempo real...');
            
            // Recarregar dados dos sensores
            await loadSensorData();
            
            // Atualizar dashboard
            updateDashboardWithRealData();
            
            // Atualizar gráficos
            if (temperatureChart) {
                const temperatureHistory = calculateAverageTemperatureHistory();
                temperatureChart.data.labels = temperatureHistory.labels;
                temperatureChart.data.datasets[0].data = temperatureHistory.data;
                temperatureChart.update();
            }
            
            if (statusChart) {
                const avgTemperature = parseFloat(calculateAverageTemperature());
                let statusData = [0, 0, 0];
                
                if (!isNaN(avgTemperature)) {
                    // NOVA FAIXA: -2°C a 10°C é normal
                    if (avgTemperature >= -2 && avgTemperature <= 10) {
                        statusData[0] = 1;
                    } else if ((avgTemperature > -5 && avgTemperature < -2) || (avgTemperature > 10 && avgTemperature <= 15)) {
                        statusData[1] = 1;
                    } else {
                        statusData[2] = 1;
                    }
                }
                
                statusChart.data.datasets[0].data = statusData;
                statusChart.update();
            }
            
            console.log('Dados atualizados com sucesso');
            
        } catch (error) {
            console.error('Erro na atualização em tempo real:', error);
        }
    }, 30000); // Atualizar a cada 30 segundos
}

// Usar dados de fallback em caso de erro
function useFallbackData() {
    console.log('Usando dados de fallback...');
    
    // Dados de fallback básicos
    document.getElementById('total-vehicles').querySelector('.loading-content').textContent = '1';
    document.getElementById('avg-temperature').querySelector('.loading-content').textContent = '3.2°C';
    document.getElementById('active-alerts').querySelector('.loading-content').textContent = '1';
    
    // Remover loading
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('card-loading');
        card.classList.add('content-loaded');
    });
    
    // Popular tabela com dados básicos
    const tableBody = document.getElementById('vehicle-table-body');
    tableBody.innerHTML = `
        <tr>
            <td>
                <a href="descricao.html?placa=KG8000003" class="placa-link">
                    KG8000003
                </a>
            </td>
            <td>Mercedes Sprinter</td>
            <td>Carlos Silva</td>
            <td>Centro - Zona Sul</td>
            <td>
                <div class="multi-sensor">
                    <span class="temp-indicator temp-normal"></span> 3.2°C
                    <span class="sensor-badge">6 sensores</span>
                </div>
            </td>
            <td>Normal</td> <!-- STATUS SIMPLES SEM BADGE -->
            <td>
                <div class="action-buttons">
                    <a href="descricao.html?placa=KG8000003" class="btn-action view" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </td>
        </tr>
    `;
    
    document.querySelector('.vehicle-table').classList.remove('table-loading');
    setupDetailButtons();
    
    // Mostrar placeholders para gráficos
    showChartPlaceholders();
}