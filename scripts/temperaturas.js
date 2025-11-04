// Variáveis globais
let sensorData = {};
let sensorHistoryData = {};
let currentFilters = {
    timeRange: '6h',
    vehicle: 'KG8000003',
    sensor: 'all'
};
let trendChart, distributionChart;

// Sistema de Loading
function showLoading() {
    const loadingOverlay = document.getElementById('globalLoading');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('globalLoading');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando página de temperaturas...');
    
    showLoading();
    
    try {
        // Carregar dados
        await loadSensorData();
        await loadSensorHistoryForPeriod(currentFilters.timeRange);
        
        // Inicializar componentes
        initializeFilters();
        updateMetrics();
        createCharts();
        
        // Configurar event listeners
        setupEventListeners();
        
        hideLoading();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        hideLoading();
    }
});

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

// Carregar histórico dos sensores baseado no período
async function loadSensorHistoryForPeriod(timeRange) {
    try {
        console.log(`Carregando histórico para período: ${timeRange}`);
        const response = await fetch(`./sensor_history_${timeRange}.json`);
        
        if (!response.ok) {
            console.log(`Arquivo para período ${timeRange} não encontrado, usando padrão...`);
            await loadDefaultSensorHistory();
            return;
        }
        
        const data = await response.json();
        console.log(`Histórico do período ${timeRange} carregado:`, data);
        sensorHistoryData = data;
        
    } catch (error) {
        console.error(`Erro ao carregar histórico do período ${timeRange}:`, error);
        await loadDefaultSensorHistory();
    }
}

// Carregar histórico padrão (6h) como fallback
async function loadDefaultSensorHistory() {
    try {
        console.log('Carregando histórico padrão...');
        const response = await fetch('./sensor_history.json');
        if (response.ok) {
            const data = await response.json();
            sensorHistoryData = data;
            console.log('Histórico padrão carregado com sucesso');
        } else {
            console.log('Arquivo de histórico padrão não encontrado');
            sensorHistoryData = {};
        }
    } catch (error) {
        console.error('Erro ao carregar histórico padrão:', error);
        sensorHistoryData = {};
    }
}

// Inicializar filtros
function initializeFilters() {
    const timeRangeSelect = document.getElementById('timeRange');
    const vehicleFilter = document.getElementById('vehicleFilter');
    const sensorFilter = document.getElementById('sensorFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    
    timeRangeSelect.value = currentFilters.timeRange;
    vehicleFilter.value = currentFilters.vehicle;
    sensorFilter.value = currentFilters.sensor;
    
    applyFiltersBtn.addEventListener('click', applyFilters);
}

// Aplicar filtros
async function applyFilters() {
    const timeRangeSelect = document.getElementById('timeRange');
    const vehicleFilter = document.getElementById('vehicleFilter');
    const sensorFilter = document.getElementById('sensorFilter');
    
    currentFilters = {
        timeRange: timeRangeSelect.value,
        vehicle: vehicleFilter.value,
        sensor: sensorFilter.value
    };
    
    console.log('Aplicando filtros:', currentFilters);
    
    showLoading();
    
    try {
        await loadSensorHistoryForPeriod(currentFilters.timeRange);
        updateMetrics();
        updateCharts();
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        hideLoading();
    }
}

// Atualizar métricas - COM TEMPERATURA MÍNIMA MÉDIA
function updateMetrics() {
    const metrics = calculateTemperatureMetricsFromHistory();
    
    // Atualizar cards
    document.getElementById('avg-temp').textContent = `${metrics.average}°C`;
    document.getElementById('max-temp').textContent = `${metrics.maximum}°C`;
    document.getElementById('min-temp').textContent = `${metrics.minimumAvg}°C`; // Mínima média
    
    updateMetricPeriods();
    updateTrendIndicators();
}

// Calcular métricas de temperatura baseadas no HISTÓRICO - ATUALIZADA
function calculateTemperatureMetricsFromHistory() {
    let allTemperatures = [];
    let sensorMinTemperatures = {}; // Para calcular mínima média
    
    // Coletar temperaturas do histórico baseadas nos filtros
    if (currentFilters.sensor === 'all') {
        // NOVOS NOMES DOS SENSORES INTERNOS
        const internalSensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
        
        internalSensors.forEach(sensorName => {
            if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
                // Coletar todas as temperaturas para média e máxima
                sensorHistoryData[sensorName].forEach(entry => {
                    if (entry.temperature !== 0.0) {
                        allTemperatures.push(entry.temperature);
                    }
                });
                
                // Calcular mínima de cada sensor
                const sensorTemps = sensorHistoryData[sensorName]
                    .filter(entry => entry.temperature !== 0.0)
                    .map(entry => entry.temperature);
                
                if (sensorTemps.length > 0) {
                    const sensorMin = Math.min(...sensorTemps);
                    sensorMinTemperatures[sensorName] = sensorMin;
                }
            }
        });
    } else {
        // Sensor específico
        if (sensorHistoryData[currentFilters.sensor]) {
            sensorHistoryData[currentFilters.sensor].forEach(entry => {
                if (entry.temperature !== 0.0) {
                    allTemperatures.push(entry.temperature);
                }
            });
            
            // Para sensor único, mínima média é a mesma que mínima
            const sensorTemps = sensorHistoryData[currentFilters.sensor]
                .filter(entry => entry.temperature !== 0.0)
                .map(entry => entry.temperature);
            
            if (sensorTemps.length > 0) {
                const sensorMin = Math.min(...sensorTemps);
                sensorMinTemperatures[currentFilters.sensor] = sensorMin;
            }
        }
    }
    
    // Calcular métricas
    let average = '--';
    let maximum = '--';
    let minimumAvg = '--'; // Mínima média
    
    if (allTemperatures.length > 0) {
        // Média geral
        const sum = allTemperatures.reduce((a, b) => a + b, 0);
        average = (sum / allTemperatures.length).toFixed(1);
        
        // Máxima geral
        maximum = Math.max(...allTemperatures).toFixed(1);
        
        // Mínima média (média das mínimas de cada sensor)
        const minTemps = Object.values(sensorMinTemperatures);
        if (minTemps.length > 0) {
            const minSum = minTemps.reduce((a, b) => a + b, 0);
            minimumAvg = (minSum / minTemps.length).toFixed(1);
        } else {
            // Se não conseguiu calcular mínima média, usa a mínima geral
            minimumAvg = Math.min(...allTemperatures).toFixed(1);
        }
        
        console.log(`Métricas calculadas - Média: ${average}°C, Máxima: ${maximum}°C, Mínima Média: ${minimumAvg}°C`);
        console.log(`Leituras: ${allTemperatures.length}, Sensores com mínima: ${Object.keys(sensorMinTemperatures).length}`);
    } else {
        console.log('Nenhum dado histórico encontrado para calcular métricas');
    }
    
    return {
        average,
        maximum,
        minimumAvg
    };
}

// Atualizar períodos nos cards
function updateMetricPeriods() {
    const periodText = getPeriodDisplayText(currentFilters.timeRange);
    const periodElements = document.querySelectorAll('.metric-period');
    
    periodElements.forEach(element => {
        element.textContent = periodText;
    });
}

// Obter texto de exibição do período
function getPeriodDisplayText(timeRange) {
    const periods = {
        '1h': 'Última hora',
        '6h': 'Últimas 6 horas',
        '12h': 'Últimas 12 horas',
        '24h': 'Últimas 24 horas'
    };
    return periods[timeRange] || 'Últimas 6 horas';
}

// Atualizar indicadores de tendência
function updateTrendIndicators() {
    const historicalData = getHistoricalDataForMetrics();
    const trends = calculateTrends(historicalData);
    
    updateTrendElement('avg-temp-trend', trends.avg);
    updateTrendElement('max-temp-trend', trends.max);
    updateTrendElement('min-temp-trend', trends.min);
}

function updateTrendElement(elementId, trend) {
    const element = document.getElementById(elementId);
    if (trend.value !== '--') {
        element.innerHTML = trend.direction === 'positive' 
            ? `<i class="fas fa-arrow-up"></i> ${trend.value}`
            : `<i class="fas fa-arrow-down"></i> ${trend.value}`;
        element.className = `metric-trend ${trend.direction}`;
    } else {
        element.innerHTML = '<i class="fas fa-minus"></i> --';
        element.className = 'metric-trend';
    }
}

// Obter dados históricos para cálculo de tendências - ATUALIZADA
function getHistoricalDataForMetrics() {
    let allTemperatures = [];
    
    if (currentFilters.sensor === 'all') {
        // NOVOS NOMES DOS SENSORES INTERNOS
        const internalSensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
        internalSensors.forEach(sensorName => {
            if (sensorHistoryData[sensorName]) {
                sensorHistoryData[sensorName].forEach(entry => {
                    if (entry.temperature !== 0.0) {
                        const entryTime = new Date(entry.timestamp);
                        allTemperatures.push({
                            temperature: entry.temperature,
                            timestamp: entryTime
                        });
                    }
                });
            }
        });
    } else {
        if (sensorHistoryData[currentFilters.sensor]) {
            sensorHistoryData[currentFilters.sensor].forEach(entry => {
                if (entry.temperature !== 0.0) {
                    const entryTime = new Date(entry.timestamp);
                    allTemperatures.push({
                        temperature: entry.temperature,
                        timestamp: entryTime
                    });
                }
            });
        }
    }
    
    return allTemperatures;
}

// Calcular tendências
function calculateTrends(historicalData) {
    if (historicalData.length < 2) {
        return {
            avg: { value: '--', direction: 'neutral' },
            max: { value: '--', direction: 'neutral' },
            min: { value: '--', direction: 'neutral' }
        };
    }
    
    // Ordenar por timestamp
    historicalData.sort((a, b) => a.timestamp - b.timestamp);
    
    const midIndex = Math.floor(historicalData.length / 2);
    const oldData = historicalData.slice(0, midIndex);
    const newData = historicalData.slice(midIndex);
    
    const oldAvg = oldData.reduce((sum, entry) => sum + entry.temperature, 0) / oldData.length;
    const newAvg = newData.reduce((sum, entry) => sum + entry.temperature, 0) / newData.length;
    
    const oldMax = Math.max(...oldData.map(entry => entry.temperature));
    const newMax = Math.max(...newData.map(entry => entry.temperature));
    const oldMin = Math.min(...oldData.map(entry => entry.temperature));
    const newMin = Math.min(...newData.map(entry => entry.temperature));
    
    const avgDiff = (newAvg - oldAvg).toFixed(1);
    const maxDiff = (newMax - oldMax).toFixed(1);
    const minDiff = (newMin - oldMin).toFixed(1);
    
    return {
        avg: { 
            value: `${Math.abs(avgDiff)}°C`, 
            direction: avgDiff >= 0 ? 'positive' : 'negative' 
        },
        max: { 
            value: `${Math.abs(maxDiff)}°C`, 
            direction: maxDiff >= 0 ? 'positive' : 'negative' 
        },
        min: { 
            value: `${Math.abs(minDiff)}°C`, 
            direction: minDiff >= 0 ? 'positive' : 'negative' 
        }
    };
}

// Criar gráficos
function createCharts() {
    createTrendChart();
    createDistributionChart();
}

// Gráfico de tendência com dados reais
function createTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const chartData = getRealChartData();
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
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

// Obter dados reais para o gráfico baseado nos filtros
function getRealChartData() {
    if (currentFilters.sensor === 'all') {
        // Gráfico com todos os sensores internos
        return getAllSensorsChartData();
    } else {
        // Gráfico com sensor específico
        return getSingleSensorChartData(currentFilters.sensor);
    }
}

// Dados do gráfico para todos os sensores - ATUALIZADA
function getAllSensorsChartData() {
    // NOVOS NOMES DOS SENSORES INTERNOS
    const internalSensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo'];
    const datasets = [];
    const timeLabels = [];
    
    // Cores para os sensores
    const sensorColors = {
        'dianteiro-direito': '#2EA7AD',
        'dianteiro-esquerdo': '#45B7D1',
        'central-direito': '#FFA07A',
        'central-esquerdo': '#98D8C8',
        'fundo-direito': '#F7DC6F',
        'fundo-esquerdo': '#BB8FCE'
    };
    
    // Obter labels de tempo do primeiro sensor que tenha dados
    let hasData = false;
    for (const sensorName of internalSensors) {
        if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
            timeLabels.push(...sensorHistoryData[sensorName].map(entry => 
                formatTimestampForChart(entry.timestamp, currentFilters.timeRange)
            ));
            hasData = true;
            break;
        }
    }
    
    // Criar datasets para cada sensor
    internalSensors.forEach(sensorName => {
        if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
            const data = sensorHistoryData[sensorName].map(entry => entry.temperature);
            
            datasets.push({
                label: getSensorDisplayName(sensorName),
                data: data,
                borderColor: sensorColors[sensorName] || '#2EA7AD',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: sensorColors[sensorName] || '#2EA7AD',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 4
            });
        }
    });
    
    // Se não há dados, usar dados simulados
    if (!hasData) {
        return getFallbackChartData();
    }
    
    return {
        labels: timeLabels,
        datasets: datasets
    };
}

// Dados do gráfico para sensor único
function getSingleSensorChartData(sensorName) {
    let timeLabels = [];
    let temperatureData = [];
    
    if (sensorHistoryData[sensorName] && sensorHistoryData[sensorName].length > 0) {
        timeLabels = sensorHistoryData[sensorName].map(entry => 
            formatTimestampForChart(entry.timestamp, currentFilters.timeRange)
        );
        temperatureData = sensorHistoryData[sensorName].map(entry => entry.temperature);
    }
    
    // Se não há dados, usar dados simulados
    if (timeLabels.length === 0) {
        return getFallbackChartData();
    }
    
    return {
        labels: timeLabels,
        datasets: [{
            label: getSensorDisplayName(sensorName),
            data: temperatureData,
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
    };
}

// Formatar timestamp para o gráfico baseado no período
function formatTimestampForChart(timestamp, timeRange) {
    const date = new Date(timestamp);
    
    switch(timeRange) {
        case '1h':
        case '6h':
        case '12h':
        case '24h':
            return date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        default:
            return date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
    }
}

// Dados de fallback para gráfico
function getFallbackChartData() {
    const timeData = getTimeDataForRange(currentFilters.timeRange);
    const temperatureData = getTemperatureDataForRange(currentFilters.timeRange);
    
    return {
        labels: timeData,
        datasets: [{
            label: 'Temperatura Média',
            data: temperatureData,
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
    };
}

// Gráfico de distribuição por sensor - ATUALIZADA
function createDistributionChart() {
    const ctx = document.getElementById('sensorDistributionChart');
    if (!ctx) return;
    
    const sensorData = getCurrentSensorTemperatures();
    
    if (distributionChart) {
        distributionChart.destroy();
    }
    
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sensorData.labels,
            datasets: [{
                label: 'Temperatura Atual (°C)',
                data: sensorData.temperatures,
                backgroundColor: sensorData.colors,
                borderColor: sensorData.borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

// Obter temperaturas atuais dos sensores - ATUALIZADA
function getCurrentSensorTemperatures() {
    // NOVOS NOMES DOS SENSORES
    const sensors = ['dianteiro-direito', 'dianteiro-esquerdo', 'central-direito', 'central-esquerdo', 'fundo-direito', 'fundo-esquerdo', 'externo'];
    const labels = [];
    const temperatures = [];
    const colors = [];
    const borderColors = [];
    
    // Cores baseadas no status
    const statusColors = {
        'normal': 'rgba(46, 167, 173, 0.7)',
        'warning': 'rgba(255, 193, 7, 0.7)',
        'critical': 'rgba(220, 53, 69, 0.7)'
    };
    
    const statusBorderColors = {
        'normal': '#2EA7AD',
        'warning': '#FFC107',
        'critical': '#DC3545'
    };
    
    sensors.forEach(sensorName => {
        const sensor = sensorData[sensorName];
        if (sensor && sensor.temperature !== 0.0) {
            labels.push(getSensorDisplayName(sensorName));
            temperatures.push(sensor.temperature);
            
            // Determinar status (sensor externo sempre normal)
            let status = 'normal';
            if (sensorName !== 'externo') {
                const temp = sensor.temperature;
                if (temp > 7) {
                    status = 'critical';
                } else if (temp > 5) {
                    status = 'warning';
                }
            }
            
            colors.push(statusColors[status]);
            borderColors.push(statusBorderColors[status]);
        }
    });
    
    return { labels, temperatures, colors, borderColors };
}

// Função para obter nome de exibição do sensor - ATUALIZADA
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

function getHoursFromFilter(timeRange) {
    const ranges = {
        '1h': 1,
        '6h': 6,
        '12h': 12,
        '24h': 24
    };
    return ranges[timeRange] || 6;
}

// Funções auxiliares para dados de fallback
function getTimeDataForRange(range) {
    const now = new Date();
    let labels = [];
    
    switch(range) {
        case '1h':
            for (let i = 0; i < 12; i++) {
                const time = new Date(now.getTime() - (55 - i * 5) * 60000);
                labels.push(time.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }));
            }
            break;
        case '6h':
            for (let i = 0; i < 12; i++) {
                const time = new Date(now.getTime() - (330 - i * 30) * 60000);
                labels.push(time.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }));
            }
            break;
        case '12h':
            for (let i = 0; i < 12; i++) {
                const time = new Date(now.getTime() - (660 - i * 60) * 60000);
                labels.push(time.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }));
            }
            break;
        case '24h':
            for (let i = 0; i < 12; i++) {
                const time = new Date(now.getTime() - (1380 - i * 120) * 60000);
                labels.push(time.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }));
            }
            break;
    }
    
    return labels;
}

function getTemperatureDataForRange(range) {
    const baseTemp = 3.5;
    let data = [];
    
    switch(range) {
        case '1h':
            data = [3.2, 3.3, 3.4, 3.5, 3.6, 3.5, 3.4, 3.3, 3.2, 3.3, 3.4, 3.5];
            break;
        case '6h':
            data = [3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.6, 3.5, 3.4, 3.3, 3.4];
            break;
        case '12h':
            data = [2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.5, 3.4, 3.3, 3.4];
            break;
        case '24h':
            data = [2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.4, 3.3, 3.2, 3.3];
            break;
    }
    
    return data;
}

// Atualizar gráficos
function updateCharts() {
    if (trendChart) {
        trendChart.destroy();
        createTrendChart();
    }
    
    if (distributionChart) {
        distributionChart.destroy();
        createDistributionChart();
    }
    
    updateTrendIndicators();
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('exportChart').addEventListener('click', exportChart);
}

// Exportar gráfico
function exportChart() {
    if (trendChart) {
        const image = trendChart.toBase64Image();
        const link = document.createElement('a');
        link.href = image;
        link.download = `grafico_temperaturas_${currentFilters.timeRange}_${currentFilters.sensor}.png`;
        link.click();
    }
}

// Atualização em tempo real
function startRealTimeUpdates() {
    setInterval(async () => {
        try {
            await loadSensorData();
            updateMetrics();
            updateCharts();
        } catch (error) {
            console.error('Erro na atualização em tempo real:', error);
        }
    }, 30000);
}

setTimeout(startRealTimeUpdates, 5000);