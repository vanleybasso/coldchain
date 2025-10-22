// Variáveis globais
let appData = {};
let currentTemperatureData = {};
let temperatureChart = null;
let statusChart = null;
let modalHistoryChart = null;

// Dados de exemplo para os sensores
const sensorData = {
    1: {
        sensors: [
            { name: "Sensor Principal", value: "3.2°C", status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "3.5°C", status: "normal", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "2.9°C", status: "normal", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "3.3°C", status: "normal", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "3.1°C", status: "normal", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "22.5°C", status: "normal", location: "Externo" }
        ]
    },
    2: {
        sensors: [
            { name: "Sensor Principal", value: "8.1°C", status: "alert", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "9.2°C", status: "alert", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "7.8°C", status: "alert", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "7.5°C", status: "alert", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "8.3°C", status: "alert", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "24.7°C", status: "normal", location: "Externo" }
        ]
    },
    3: {
        sensors: [
            { name: "Sensor Principal", value: "6.3°C", status: "warning", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "7.1°C", status: "alert", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "5.8°C", status: "warning", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "6.0°C", status: "warning", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "6.5°C", status: "alert", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "23.2°C", status: "normal", location: "Externo" }
        ]
    },
    4: {
        sensors: [
            { name: "Sensor Principal", value: "4.0°C", status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "4.3°C", status: "normal", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "3.7°C", status: "normal", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "4.1°C", status: "normal", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "3.9°C", status: "normal", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "21.8°C", status: "normal", location: "Externo" }
        ]
    },
    5: {
        sensors: [
            { name: "Sensor Principal", value: "1.2°C", status: "warning", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "1.5°C", status: "warning", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "0.9°C", status: "alert", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "1.3°C", status: "warning", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "1.1°C", status: "warning", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "19.5°C", status: "normal", location: "Externo" }
        ]
    },
    6: {
        sensors: [
            { name: "Sensor Principal", value: "3.5°C", status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "3.8°C", status: "normal", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "3.2°C", status: "normal", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "3.6°C", status: "normal", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "3.4°C", status: "normal", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "22.8°C", status: "normal", location: "Externo" }
        ]
    },
    7: {
        sensors: [
            { name: "Sensor Principal", value: "7.9°C", status: "alert", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "9.0°C", status: "alert", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "7.6°C", status: "alert", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "7.3°C", status: "alert", location: "Teto traseiro" },
            { name: "Sensor do Piso", value: "8.1°C", status: "alert", location: "Piso dianteiro" },
            { name: "Sensor Externo", value: "24.5°C", status: "normal", location: "Externo" }
        ]
    }
};

// Dados de exemplo para o modal
const temperatureData = {
    1: {
        temperature: "3.2°C",
        status: "Normal",
        range: "2°C a 5°C",
        variation: "+0.3°C",
        vehicle: "VLC-1023 - Mercedes Sprinter",
        driver: "Carlos Silva",
        plate: "VLC-1023",
        model: "Mercedes Sprinter",
        location: "Centro",
        datetime: "10/09/2023 14:25",
        speed: "45 km/h",
        updated: "2 minutos atrás"
    },
    2: {
        temperature: "8.1°C",
        status: "Crítico",
        range: "2°C a 5°C",
        variation: "+1.2°C",
        vehicle: "VLC-2087 - Volkswagen Delivery",
        driver: "Ana Santos",
        plate: "VLC-2087",
        model: "Volkswagen Delivery",
        location: "Zona Norte",
        datetime: "10/09/2023 14:20",
        speed: "32 km/h",
        updated: "7 minutos atrás"
    },
    3: {
        temperature: "6.3°C",
        status: "Atenção",
        range: "2°C a 5°C",
        variation: "+0.8°C",
        vehicle: "VLC-3054 - Ford Transit",
        driver: "Roberto Alves",
        plate: "VLC-3054",
        model: "Ford Transit",
        location: "Zona Oeste",
        datetime: "10/09/2023 14:18",
        speed: "38 km/h",
        updated: "9 minutos atrás"
    },
    4: {
        temperature: "4.0°C",
        status: "Normal",
        range: "2°C a 5°C",
        variation: "-0.2°C",
        vehicle: "VLC-4098 - Fiat Ducato",
        driver: "Maria Oliveira",
        plate: "VLC-4098",
        model: "Fiat Ducato",
        location: "Zona Leste",
        datetime: "10/09/2023 14:15",
        speed: "50 km/h",
        updated: "12 minutos atrás"
    },
    5: {
        temperature: "1.2°C",
        status: "Atenção",
        range: "2°C a 5°C",
        variation: "-0.5°C",
        vehicle: "VLC-5021 - Renault Master",
        driver: "João Costa",
        plate: "VLC-5021",
        model: "Renault Master",
        location: "Aeroporto",
        datetime: "10/09/2023 14:10",
        speed: "55 km/h",
        updated: "17 minutos atrás"
    },
    6: {
        temperature: "3.5°C",
        status: "Normal",
        range: "2°C a 5°C",
        variation: "+0.1°C",
        vehicle: "VLC-1023 - Mercedes Sprinter",
        driver: "Carlos Silva",
        plate: "VLC-1023",
        model: "Mercedes Sprinter",
        location: "Centro",
        datetime: "10/09/2023 14:05",
        speed: "42 km/h",
        updated: "22 minutos atrás"
    },
    7: {
        temperature: "7.9°C",
        status: "Crítico",
        range: "2°C a 5°C",
        variation: "+0.9°C",
        vehicle: "VLC-2087 - Volkswagen Delivery",
        driver: "Ana Santos",
        plate: "VLC-2087",
        model: "Volkswagen Delivery",
        location: "Zona Norte",
        datetime: "10/09/2023 14:00",
        speed: "28 km/h",
        updated: "27 minutos atrás"
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação de temperaturas...');
    initializeApp();
});

// Função para inicializar a aplicação
function initializeApp() {
    console.log('Inicializando aplicação de temperaturas...');
    setupEventListeners();
    populateTemperatureTable();
    initializeCharts();
    startRealTimeUpdates();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botões
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const exportChartBtn = document.getElementById('exportChartBtn');
    const filterChartBtn = document.getElementById('filterChartBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    
    // Event listeners para botões
    clearFiltersBtn.addEventListener('click', clearFilters);
    exportChartBtn.addEventListener('click', exportChart);
    filterChartBtn.addEventListener('click', filterChart);
    exportReportBtn.addEventListener('click', exportReport);
    
    // Filtros em tempo real
    const filterForm = document.getElementById('filterForm');
    filterForm.addEventListener('input', applyFilters);
    
    // Modal functionality
    const modal = document.getElementById('detailsModal');
    const closeModalBtn = document.querySelector('.modal-close');
    const closeModalBtn2 = document.getElementById('modal-close-btn');
    const actionBtn = document.getElementById('modal-action-btn');
    
    // Adiciona eventos para fechar o modal
    closeModalBtn.addEventListener('click', closeModal);
    closeModalBtn2.addEventListener('click', closeModal);
    actionBtn.addEventListener('click', generateIncidentReport);
    
    // Fecha o modal ao clicar fora dele
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fecha o modal com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Inicializar gráficos
function initializeCharts() {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está disponível');
        return;
    }
    
    // Gráfico de variação de temperatura por hora
    const tempCtx = document.getElementById('temperatureChart');
    if (tempCtx) {
        const tempCtx2d = tempCtx.getContext('2d');
        
        // Dados de exemplo para o gráfico de temperatura
        const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
        const temperatures = [3.1, 3.3, 3.5, 3.8, 4.2, 3.9, 3.4];
        
        // Destruir gráfico anterior se existir
        if (temperatureChart) {
            temperatureChart.destroy();
        }
        
        temperatureChart = new Chart(tempCtx2d, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Temperatura Média (°C)',
                    data: temperatures,
                    borderColor: '#2EA7AD',
                    backgroundColor: 'rgba(46, 167, 173, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2EA7AD',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
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
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        },
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de distribuição de status
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        const statusCtx2d = statusCtx.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (statusChart) {
            statusChart.destroy();
        }
        
        statusChart = new Chart(statusCtx2d, {
            type: 'doughnut',
            data: {
                labels: ['Normal', 'Atenção', 'Crítico'],
                datasets: [{
                    data: [15, 3, 2],
                    backgroundColor: [
                        '#2EAD61',
                        '#ECDD13',
                        '#EC2513'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Criar gráfico de histórico no modal
function createModalHistoryChart(vehicleId) {
    const ctx = document.getElementById('modalHistoryChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (modalHistoryChart) {
        modalHistoryChart.destroy();
    }
    
    const ctx2d = ctx.getContext('2d');
    
    // Gerar dados de histórico para as últimas 2 horas
    const historyData = generateHistoryData(vehicleId);
    
    modalHistoryChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: historyData.times,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historyData.temperatures,
                borderColor: '#2EA7AD',
                backgroundColor: 'rgba(46, 167, 173, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: historyData.colors,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3
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
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: -2,
                    max: 12,
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });
}

// Gerar dados de histórico para o modal
function generateHistoryData(vehicleId) {
    const times = [];
    const temperatures = [];
    const colors = [];
    
    // Gerar 12 pontos de dados (um a cada 10 minutos)
    for (let i = 11; i >= 0; i--) {
        const time = new Date();
        time.setMinutes(time.getMinutes() - (i * 10));
        
        // Formatar hora
        const timeString = time.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Gerar temperatura com variação realista
        const baseTemp = parseFloat(temperatureData[vehicleId].temperature);
        const variation = (Math.random() - 0.5) * 1.5;
        const temp = Math.max(-2, Math.min(12, baseTemp + variation));
        
        // Determinar cor baseada na temperatura
        let color = '#2EAD61'; // Verde para normal
        if (temp > 7) color = '#EC2513'; // Vermelho para crítico
        else if (temp > 5) color = '#ECDD13'; // Amarelo para atenção
        
        times.push(timeString);
        temperatures.push(parseFloat(temp.toFixed(1)));
        colors.push(color);
    }
    
    return { times, temperatures, colors };
}

// Popular a tabela de temperaturas
function populateTemperatureTable() {
    const tableBody = document.getElementById('temperatureTableBody');
    tableBody.innerHTML = '';
    
    const tableData = [
        { id: 1, datetime: "10/09/2023 14:25", vehicle: "VLC-1023", driver: "Carlos Silva", temp: "3.2°C", status: "normal", location: "Centro" },
        { id: 2, datetime: "10/09/2023 14:20", vehicle: "VLC-2087", driver: "Ana Santos", temp: "8.1°C", status: "alert", location: "Zona Norte" },
        { id: 3, datetime: "10/09/2023 14:18", vehicle: "VLC-3054", driver: "Roberto Alves", temp: "6.3°C", status: "warning", location: "Zona Oeste" },
        { id: 4, datetime: "10/09/2023 14:15", vehicle: "VLC-4098", driver: "Maria Oliveira", temp: "4.0°C", status: "normal", location: "Zona Leste" },
        { id: 5, datetime: "10/09/2023 14:10", vehicle: "VLC-5021", driver: "João Costa", temp: "1.2°C", status: "warning", location: "Aeroporto" },
        { id: 6, datetime: "10/09/2023 14:05", vehicle: "VLC-1023", driver: "Carlos Silva", temp: "3.5°C", status: "normal", location: "Centro" },
        { id: 7, datetime: "10/09/2023 14:00", vehicle: "VLC-2087", driver: "Ana Santos", temp: "7.9°C", status: "alert", location: "Zona Norte" }
    ];
    
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', row.id);
        
        tr.innerHTML = `
            <td>${row.datetime}</td>
            <td>${row.vehicle}</td>
            <td>${row.driver}</td>
            <td>
                <div class="multi-sensor">
                    <span class="temp-indicator temp-${row.status}"></span> ${row.temp}
                    <span class="sensor-badge">6 sensores</span>
                    <div class="sensor-tooltip">
                        <div class="sensor-tooltip-title">Todos os Sensores</div>
                        ${generateSensorTooltip(row.id)}
                    </div>
                </div>
            </td>
            <td><span class="status ${row.status}">${getStatusText(row.status)}</span></td>
            <td>${row.location}</td>
        `;
        
        tableBody.appendChild(tr);
    });
    
    // Adiciona eventos de clique nas linhas da tabela
    const tableRows = document.querySelectorAll('.history-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', () => {
            const id = row.getAttribute('data-id');
            openModal(id);
        });
    });
}

// Gerar tooltip de sensores
function generateSensorTooltip(id) {
    const sensors = sensorData[id].sensors;
    return sensors.map(sensor => `
        <div class="sensor-item">
            <span class="sensor-name">${sensor.name}:</span>
            <span class="sensor-value">${sensor.value}</span>
        </div>
    `).join('');
}

// Obter texto do status
function getStatusText(status) {
    switch(status) {
        case 'normal': return 'Normal';
        case 'warning': return 'Atenção';
        case 'alert': return 'Crítico';
        default: return 'Desconhecido';
    }
}

// Função para renderizar os sensores no modal
function renderSensors(id) {
    const sensorsContainer = document.getElementById('sensors-container');
    sensorsContainer.innerHTML = '';
    
    const sensors = sensorData[id].sensors;
    
    sensors.forEach(sensor => {
        const sensorCard = document.createElement('div');
        sensorCard.className = `sensor-card ${sensor.status}`;
        
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status ${sensor.status}">${getStatusText(sensor.status)}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}</div>
            <div class="sensor-card-location">${sensor.location}</div>
        `;
        
        sensorsContainer.appendChild(sensorCard);
    });
}

// Função para abrir o modal com os dados
function openModal(id) {
    const data = temperatureData[id];
    
    // Atualiza os elementos do modal com os dados
    document.getElementById('modal-temp').textContent = data.temperature;
    document.getElementById('modal-status').textContent = data.status;
    document.getElementById('modal-range').textContent = data.range;
    document.getElementById('modal-variation').textContent = data.variation;
    document.getElementById('modal-vehicle').textContent = data.vehicle;
    document.getElementById('modal-driver').textContent = data.driver;
    document.getElementById('modal-plate').textContent = data.plate;
    document.getElementById('modal-model').textContent = data.model;
    document.getElementById('modal-location').textContent = data.location;
    document.getElementById('modal-datetime').textContent = data.datetime;
    document.getElementById('modal-speed').textContent = data.speed;
    document.getElementById('modal-updated').textContent = data.updated;
    
    // Ajusta as classes de status
    const tempValue = document.getElementById('modal-temp');
    const statusValue = document.getElementById('modal-status');
    const variationValue = document.getElementById('modal-variation');
    
    // Remove classes anteriores
    tempValue.className = 'detail-card-value';
    statusValue.className = 'detail-card-value';
    variationValue.className = 'detail-card-value';
    
    // Adiciona a classe apropriada baseada no status
    if (data.status === 'Normal') {
        tempValue.classList.add('normal');
        statusValue.classList.add('normal');
        variationValue.classList.add('normal');
    } else if (data.status === 'Atenção') {
        tempValue.classList.add('warning');
        statusValue.classList.add('warning');
        variationValue.classList.add('warning');
    } else {
        tempValue.classList.add('critical');
        statusValue.classList.add('critical');
        variationValue.classList.add('critical');
    }
    
    // Renderiza os sensores
    renderSensors(id);
    
    // Cria o gráfico de histórico
    createModalHistoryChart(id);
    
    // Exibe o modal
    const modal = document.getElementById('detailsModal');
    modal.classList.add('active');
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
}

// Gerar relatório de incidente
function generateIncidentReport() {
    alert('Relatório de incidente gerado com sucesso!');
    closeModal();
}

// Aplicar filtros
function applyFilters() {
    console.log('Aplicando filtros...');
    // Implementar lógica de filtros
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterForm').reset();
    alert('Filtros limpos com sucesso!');
}

// Exportar gráfico
function exportChart() {
    alert('Gráfico exportado com sucesso!');
}

// Filtrar gráfico
function filterChart() {
    alert('Filtro aplicado ao gráfico!');
}

// Exportar relatório
function exportReport() {
    alert('Relatório exportado com sucesso!');
}

// Atualizar gráficos em tempo real
function updateCharts() {
    if (temperatureChart) {
        // Simular pequenas variações nos dados
        const newData = temperatureChart.data.datasets[0].data.map(temp => {
            const variation = (Math.random() - 0.5) * 0.3;
            return Math.max(2, Math.min(8, temp + variation));
        });
        
        temperatureChart.data.datasets[0].data = newData;
        temperatureChart.update('none');
    }
    
    if (statusChart) {
        // Simular pequenas variações na distribuição
        const newData = statusChart.data.datasets[0].data.map((count, index) => {
            if (index === 0) return Math.max(10, count + (Math.random() > 0.5 ? 1 : -1));
            if (index === 1) return Math.max(1, count + (Math.random() > 0.7 ? 1 : -1));
            return Math.max(0, count + (Math.random() > 0.8 ? 1 : -1));
        });
        
        statusChart.data.datasets[0].data = newData;
        statusChart.update('none');
    }
}

// Simulação de atualização de dados em tempo real
function updateTemperatures() {
    const tempElements = document.querySelectorAll('.history-table td:nth-child(4)');
    
    tempElements.forEach(el => {
        const currentTemp = parseFloat(el.querySelector('.multi-sensor').textContent.match(/-?\d+\.\d+/)[0]);
        const variation = (Math.random() - 0.5) * 0.4; // Variação de ±0.2
        const newTemp = Math.max(-5, Math.min(10, (currentTemp + variation))).toFixed(1);
        
        // Atualiza o indicador visual
        const indicator = el.querySelector('.temp-indicator');
        indicator.className = 'temp-indicator';
        
        if (newTemp >= 2 && newTemp <= 5) {
            indicator.classList.add('temp-normal');
        } else if (newTemp > 5 && newTemp <= 7) {
            indicator.classList.add('temp-warning');
        } else {
            indicator.classList.add('temp-alert');
        }
        
        // Atualiza o texto
        const tempText = el.querySelector('.multi-sensor');
        tempText.innerHTML = tempText.innerHTML.replace(/-?\d+\.\d+°C/, `${newTemp}°C`);
        
        // Atualiza o status na mesma linha
        const statusCell = el.parentElement.querySelector('td:nth-child(5)');
        const statusSpan = statusCell.querySelector('.status');
        statusSpan.className = 'status';
        
        if (newTemp >= 2 && newTemp <= 5) {
            statusSpan.classList.add('normal');
            statusSpan.textContent = 'Normal';
        } else if (newTemp > 5 && newTemp <= 7) {
            statusSpan.classList.add('warning');
            statusSpan.textContent = 'Atenção';
        } else {
            statusSpan.classList.add('alert');
            statusSpan.textContent = 'Crítico';
        }
    });
    
    // Atualiza os cartões de resumo
    const avgTempElement = document.querySelector('.temp-card:nth-child(1) .temp-card-value');
    const maxTempElement = document.querySelector('.temp-card:nth-child(2) .temp-card-value');
    const minTempElement = document.querySelector('.temp-card:nth-child(3) .temp-card-value');
    
    // Simula pequenas variações nos valores dos cartões
    const currentAvg = parseFloat(avgTempElement.textContent);
    const newAvg = (currentAvg + (Math.random() - 0.5) * 0.2).toFixed(1);
    avgTempElement.textContent = `${newAvg}°C`;
}

// Iniciar atualizações em tempo real
function startRealTimeUpdates() {
    // Atualiza temperaturas a cada 15 segundos
    setInterval(updateTemperatures, 15000);
    
    // Atualiza gráficos a cada 20 segundos
    setInterval(updateCharts, 20000);
}