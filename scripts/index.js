// Variáveis globais
let appData = {};
let temperatureChart, statusChart, historyChart;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
    console.log('Chart.js disponível:', typeof Chart !== 'undefined');
    
    // Carregar dados do JSON
    fetchData()
        .then(data => {
            console.log('Dados carregados com sucesso:', data);
            appData = data;
            initializeApp();
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            // Dados de fallback em caso de erro
            appData = getFallbackData();
            initializeApp();
        });
});

// Função para carregar dados do JSON
async function fetchData() {
    console.log('Tentando carregar dados de ./data.json');
    const response = await fetch('./data.json');
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
}

// Função para inicializar a aplicação
function initializeApp() {
    console.log('Inicializando aplicação...');
    console.log('Chart disponível para gráficos:', typeof Chart !== 'undefined');
    
    updateDashboardCards();
    populateVehicleTable();
    
    // Só inicializar gráficos se Chart.js estiver disponível
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    } else {
        console.warn('Chart.js não está disponível. Gráficos não serão renderizados.');
        showChartPlaceholders();
    }
    
    setupEventListeners();
    startRealTimeUpdates();
}

// Mostrar placeholders quando Chart.js não estiver disponível
function showChartPlaceholders() {
    const chartContainers = document.querySelectorAll('.chart-placeholder');
    chartContainers.forEach(container => {
        if (!container.querySelector('canvas')) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;"><i class="fas fa-chart-line" style="font-size: 40px; margin-right: 10px;"></i>Grafíco não disponível</div>';
        }
    });
}

// Atualizar os cards do dashboard
function updateDashboardCards() {
    const dashboard = appData.dashboard;
    
    document.getElementById('total-vehicles').textContent = `${dashboard.totalVehicles} Veículos`;
    document.getElementById('avg-temperature').textContent = `${dashboard.avgTemperature}°C`;
    document.getElementById('active-alerts').textContent = `${dashboard.activeAlerts} Alertas`;
    document.getElementById('fuel-economy').textContent = `${dashboard.fuelEconomy} km/L`;
    
    // Calcular variação do combustível
    const fuelVariation = ((dashboard.fuelEconomy - dashboard.fuelTarget) / dashboard.fuelTarget * 100).toFixed(1);
    const fuelVariationElement = document.getElementById('fuel-variation');
    fuelVariationElement.textContent = `${fuelVariation}%`;
    
    if (parseFloat(fuelVariation) >= 0) {
        fuelVariationElement.className = 'status normal';
    } else {
        fuelVariationElement.className = 'status warning';
    }
}

// Popular a tabela de veículos
function populateVehicleTable() {
    const tableBody = document.getElementById('vehicle-table-body');
    tableBody.innerHTML = '';
    
    console.log('Populando tabela com', appData.vehicles.length, 'veículos');
    
    appData.vehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        
        // Determinar classe do indicador de temperatura
        let tempClass = 'temp-normal';
        if (vehicle.temperature > 7) tempClass = 'temp-alert';
        else if (vehicle.temperature > 5) tempClass = 'temp-warning';
        
        // Determinar classe do status
        let statusClass = 'normal';
        if (vehicle.status === 'Crítico') statusClass = 'alert';
        else if (vehicle.status === 'Atenção') statusClass = 'warning';
        
        // Criar tooltip de sensores
        const sensorTooltip = vehicle.sensors.map(sensor => `
            <div class="sensor-item">
                <span class="sensor-name">${sensor.name}:</span>
                <span class="sensor-value">${sensor.value}°C</span>
            </div>
        `).join('');
        
        row.innerHTML = `
            <td>${vehicle.id}</td>
            <td>${vehicle.driver}</td>
            <td>${vehicle.route}</td>
            <td>
                <div class="multi-sensor">
                    <span class="temp-indicator ${tempClass}"></span> ${vehicle.temperature}°C
                    <span class="sensor-badge">${vehicle.sensors.length} sensores</span>
                    <div class="sensor-tooltip">
                        <div class="sensor-tooltip-title">Todos os Sensores</div>
                        ${sensorTooltip}
                    </div>
                </div>
            </td>
            <td><span class="status ${statusClass}">${vehicle.status}</span></td>
            <td><button class="btn btn-primary" data-vehicle="${vehicle.id}">Detalhes</button></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners aos botões de detalhes
    setupDetailButtons();
}

// Configurar botões de detalhes
function setupDetailButtons() {
    console.log('Configurando botões de detalhes...');
    
    const buttons = document.querySelectorAll('.btn-primary[data-vehicle]');
    console.log('Encontrados', buttons.length, 'botões');
    
    buttons.forEach(button => {
        // Remover event listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const vehicleId = this.getAttribute('data-vehicle');
            console.log('Botão clicado, vehicleId:', vehicleId);
            openVehicleModal(vehicleId);
        });
    });
}

// Inicializar gráficos
function initializeCharts() {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está disponível');
        return;
    }
    
    // Gráfico de temperatura por veículo
    const tempCtx = document.getElementById('temperatureChart');
    if (!tempCtx) {
        console.error('Canvas temperatureChart não encontrado');
        return;
    }
    
    const tempCtx2d = tempCtx.getContext('2d');
    const vehicleLabels = appData.vehicles.map(v => v.id);
    const tempData = appData.vehicles.map(v => parseFloat(v.temperature));
    const tempColors = appData.vehicles.map(v => {
        if (v.temperature > 7) return '#EC2513';
        if (v.temperature > 5) return '#ECDD13';
        return '#2EAD61';
    });
    
    // Destruir gráfico anterior se existir
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    temperatureChart = new Chart(tempCtx2d, {
        type: 'bar',
        data: {
            labels: vehicleLabels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: tempData,
                backgroundColor: tempColors,
                borderColor: tempColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
    
    // Gráfico de status da frota
    const statusCtx = document.getElementById('statusChart');
    if (!statusCtx) {
        console.error('Canvas statusChart não encontrado');
        return;
    }
    
    const statusCtx2d = statusCtx.getContext('2d');
    const statusCounts = {
        'Normal': appData.vehicles.filter(v => v.status === 'Normal').length,
        'Atenção': appData.vehicles.filter(v => v.status === 'Atenção').length,
        'Crítico': appData.vehicles.filter(v => v.status === 'Crítico').length
    };
    
    // Destruir gráfico anterior se existir
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(statusCtx2d, {
        type: 'doughnut',
        data: {
            labels: ['Normal', 'Atenção', 'Crítico'],
            datasets: [{
                data: [statusCounts.Normal, statusCounts.Atenção, statusCounts.Crítico],
                backgroundColor: ['#2EAD61', '#ECDD13', '#EC2513'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Fechar modal
    const modalClose = document.querySelector('.modal-close');
    modalClose.addEventListener('click', closeModal);
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('vehicleModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Botão de exportar
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    // Gerar relatório
    document.getElementById('modal-report').addEventListener('click', generateReport);
}

// Abrir modal de detalhes do veículo
function openVehicleModal(vehicleId) {
    console.log('Abrindo modal para:', vehicleId);
    
    const vehicle = appData.vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
        console.error('Veículo não encontrado:', vehicleId);
        return;
    }
    
    // Preencher dados básicos
    document.getElementById('modal-vehicle').textContent = vehicle.id;
    document.getElementById('modal-driver').textContent = vehicle.driver;
    document.getElementById('modal-route').textContent = vehicle.route;
    document.getElementById('modal-temp').textContent = `${vehicle.temperature}°C`;
    document.getElementById('modal-update').textContent = vehicle.lastUpdate;
    document.getElementById('modal-speed').textContent = vehicle.speed;
    document.getElementById('modal-fuel').textContent = vehicle.fuel;
    
    // Configurar status
    const statusElement = document.getElementById('modal-status');
    statusElement.textContent = vehicle.status;
    statusElement.className = 'detail-value';
    
    if (vehicle.status === 'Normal') {
        statusElement.classList.add('status', 'normal');
    } else if (vehicle.status === 'Crítico') {
        statusElement.classList.add('status', 'alert');
    } else if (vehicle.status === 'Atenção') {
        statusElement.classList.add('status', 'warning');
    }
    
    // Preencher sensores
    const sensorsContainer = document.getElementById('modal-sensors');
    sensorsContainer.innerHTML = '';
    
    vehicle.sensors.forEach(sensor => {
        const sensorCard = document.createElement('div');
        let statusClass = '';
        
        if (sensor.status === 'Crítico') statusClass = 'alert';
        else if (sensor.status === 'Atenção') statusClass = 'warning';
        
        sensorCard.className = `sensor-card ${statusClass}`;
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status ${statusClass || 'normal'}">${sensor.status}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}°C</div>
            <div class="sensor-card-location">${sensor.location}</div>
        `;
        
        sensorsContainer.appendChild(sensorCard);
    });
    
    // Preencher histórico
    const historyBody = document.getElementById('modal-history');
    historyBody.innerHTML = '';
    
    vehicle.history.forEach(item => {
        const row = document.createElement('tr');
        
        let statusClass = '';
        if (item.status === 'Crítico') statusClass = 'status alert';
        else if (item.status === 'Atenção') statusClass = 'status warning';
        else statusClass = 'status normal';
        
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.temp}°C</td>
            <td><span class="${statusClass}">${item.status}</span></td>
            <td>${item.location}</td>
        `;
        
        historyBody.appendChild(row);
    });
    
    // Criar gráfico de histórico apenas se Chart.js estiver disponível
    if (typeof Chart !== 'undefined') {
        createHistoryChart(vehicle);
    } else {
        const historyChartElement = document.getElementById('historyChart');
        if (historyChartElement) {
            historyChartElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;"><i class="fas fa-chart-line" style="font-size: 30px; margin-right: 10px;"></i>Gráfico não disponível</div>';
        }
    }
    
    // Mostrar o modal
    const modal = document.getElementById('vehicleModal');
    modal.classList.add('active');
    console.log('Modal deve estar visível agora');
}

// Criar gráfico de histórico
function createHistoryChart(vehicle) {
    const historyCtx = document.getElementById('historyChart');
    if (!historyCtx) {
        console.error('Canvas historyChart não encontrado');
        return;
    }
    
    const historyCtx2d = historyCtx.getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (historyChart) {
        historyChart.destroy();
    }
    
    const historyTimes = vehicle.history.map(h => h.time).reverse();
    const historyTemps = vehicle.history.map(h => parseFloat(h.temp)).reverse();
    
    historyChart = new Chart(historyCtx2d, {
        type: 'line',
        data: {
            labels: historyTimes,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historyTemps,
                borderColor: '#2EA7AD',
                backgroundColor: 'rgba(46, 167, 173, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

// Fechar modal
function closeModal() {
    document.getElementById('vehicleModal').classList.remove('active');
}

// Exportar dados
function exportData() {
    // Simulação de exportação
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Criar link de download
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rotasystem-dados.json';
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
    setInterval(() => {
        // Atualizar temperaturas aleatoriamente
        appData.vehicles.forEach(vehicle => {
            const variation = (Math.random() - 0.5) * 0.4;
            vehicle.temperature = Math.max(-5, Math.min(10, (parseFloat(vehicle.temperature) + variation))).toFixed(1);
        });
        
        // Atualizar a tabela
        populateVehicleTable();
        
        // Atualizar gráficos apenas se Chart.js estiver disponível
        if (typeof Chart !== 'undefined') {
            updateCharts();
        }
        
    }, 10000); // Atualizar a cada 10 segundos
}

// Atualizar gráficos
function updateCharts() {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') return;
    
    // Atualizar gráfico de temperatura
    const tempData = appData.vehicles.map(v => parseFloat(v.temperature));
    if (temperatureChart) {
        temperatureChart.data.datasets[0].data = tempData;
        
        // Atualizar cores baseadas na temperatura
        const tempColors = appData.vehicles.map(v => {
            if (v.temperature > 7) return '#EC2513';
            if (v.temperature > 5) return '#ECDD13';
            return '#2EAD61';
        });
        
        temperatureChart.data.datasets[0].backgroundColor = tempColors;
        temperatureChart.data.datasets[0].borderColor = tempColors;
        temperatureChart.update();
    }
    
    // Atualizar gráfico de status
    if (statusChart) {
        const statusCounts = {
            'Normal': appData.vehicles.filter(v => v.status === 'Normal').length,
            'Atenção': appData.vehicles.filter(v => v.status === 'Atenção').length,
            'Crítico': appData.vehicles.filter(v => v.status === 'Crítico').length
        };
        
        statusChart.data.datasets[0].data = [statusCounts.Normal, statusCounts.Atenção, statusCounts.Crítico];
        statusChart.update();
    }
}

// Dados de fallback em caso de erro no carregamento do JSON
function getFallbackData() {
    console.log('Usando dados de fallback');
    return {
        "dashboard": {
            "totalVehicles": 38,
            "avgTemperature": 3.2,
            "activeAlerts": 3,
            "fuelEconomy": 7.8,
            "fuelTarget": 8.2
        },
        "vehicles": [
            {
                "id": "VLC-1023",
                "driver": "Carlos Silva",
                "route": "Centro - Zona Sul",
                "status": "Normal",
                "temperature": 3.2,
                "lastUpdate": "10:23:45",
                "speed": "62 km/h",
                "fuel": "78%",
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 3.2, "status": "Normal", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 3.5, "status": "Normal", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "10:20", "temp": 3.1, "status": "Normal", "location": "Av. Paulista, 1000" },
                    { "time": "10:10", "temp": 3.0, "status": "Normal", "location": "Rua Augusta, 500" }
                ]
            },
            {
                "id": "VLC-2087",
                "driver": "Ana Santos",
                "route": "Zona Norte - Centro",
                "status": "Crítico",
                "temperature": 8.1,
                "lastUpdate": "10:15:22",
                "speed": "45 km/h",
                "fuel": "35%",
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 8.1, "status": "Crítico", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 9.2, "status": "Crítico", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "10:10", "temp": 7.8, "status": "Atenção", "location": "Av. Tiradentes, 2000" },
                    { "time": "10:00", "temp": 6.5, "status": "Atenção", "location": "Av. Braz Leme, 1500" }
                ]
            }
        ]
    };
}