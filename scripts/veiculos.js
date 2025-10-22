// Variáveis globais
let appData = {};
let currentPage = 1;
const itemsPerPage = 5;
let vehicleDetailChart = null;

// Funções de modal (agora globais)
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação de veículos...');
    
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
    console.log('Inicializando aplicação de veículos...');
    setupEventListeners();
    populateVehicleTable();
    setupPagination();
    startRealTimeUpdates();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Modal functionality
    const addModal = document.getElementById('addVehicleModal');
    const detailsModal = document.getElementById('vehicleDetailsModal');
    const addBtn = document.getElementById('addVehicleBtn');
    const cancelBtn = document.getElementById('cancelAddVehicle');
    const closeButtons = document.querySelectorAll('.close-modal');
    const closeDetailsBtn = document.querySelector('.close-details');
    const saveVehicleBtn = document.getElementById('saveVehicleBtn');
    const editVehicleBtn = document.getElementById('editVehicleBtn');
    const exportBtn = document.getElementById('exportBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    // Event listeners para modais
    addBtn.addEventListener('click', () => openModal(addModal));
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(addModal);
            closeModal(detailsModal);
        });
    });
    
    cancelBtn.addEventListener('click', () => closeModal(addModal));
    closeDetailsBtn.addEventListener('click', () => closeModal(detailsModal));
    
    window.addEventListener('click', (e) => {
        if (e.target === addModal) closeModal(addModal);
        if (e.target === detailsModal) closeModal(detailsModal);
    });
    
    // Salvar veículo
    saveVehicleBtn.addEventListener('click', saveVehicle);
    
    // Editar veículo
    editVehicleBtn.addEventListener('click', editVehicle);
    
    // Exportar dados
    exportBtn.addEventListener('click', exportData);
    
    // Atualizar dados
    refreshBtn.addEventListener('click', refreshData);
    
    // Limpar filtros
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Filtros em tempo real
    const filterForm = document.getElementById('filterForm');
    filterForm.addEventListener('input', applyFilters);
}

// Popular a tabela de veículos
function populateVehicleTable() {
    const tableBody = document.getElementById('vehicleTableBody');
    tableBody.innerHTML = '';
    
    const vehicles = appData.vehicles || [];
    console.log('Populando tabela com', vehicles.length, 'veículos');
    
    // Aplicar filtros
    const filteredVehicles = applyFiltersToData(vehicles);
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    if (paginatedVehicles.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #777;">
                    <i class="fas fa-truck" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    Nenhum veículo encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedVehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        
        // Determinar classe do indicador de temperatura
        let tempClass = 'temp-normal';
        if (vehicle.temperature > 7) tempClass = 'temp-alert';
        else if (vehicle.temperature > 5) tempClass = 'temp-warning';
        
        // Determinar classe do status
        let statusClass = 'normal';
        let statusText = 'Ativo';
        
        if (vehicle.status === 'Crítico') {
            statusClass = 'alert';
            statusText = 'Crítico';
        } else if (vehicle.status === 'Atenção') {
            statusClass = 'warning';
            statusText = 'Manutenção';
        } else if (vehicle.status === 'inactive') {
            statusClass = 'inactive';
            statusText = 'Inativo';
        }
        
        // Criar tooltip de sensores
        const sensorTooltip = vehicle.sensors.map(sensor => `
            <div class="sensor-item">
                <span class="sensor-name">${sensor.name}:</span>
                <span class="sensor-value">${sensor.value}°C</span>
            </div>
        `).join('');
        
        // Determinar modelo baseado na placa (simulação)
        const vehicleModels = {
            'VLC-1023': 'Mercedes Sprinter',
            'VLC-2087': 'Volkswagen Delivery',
            'VLC-3054': 'Ford Transit',
            'VLC-4098': 'Fiat Ducato',
            'VLC-5021': 'Renault Master'
        };
        
        const vehicleModel = vehicleModels[vehicle.id] || 'Veículo Refrigerado';
        
        row.innerHTML = `
            <td>
                <a href="descricao.html?placa=${vehicle.id}" class="placa-link" title="Abrir página de detalhes do veículo">${vehicle.id}</a>
            </td>
            <td>${vehicleModel}</td>
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
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" title="Visualizar Detalhes" data-vehicle-id="${vehicle.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" title="Editar Veículo" data-vehicle-id="${vehicle.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-action delete" title="Excluir Veículo" data-vehicle-id="${vehicle.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    updateVehicleCount(filteredVehicles.length);
    
    // Configurar botões de ação
    setupActionButtons();
}

// Configurar botões de ação
function setupActionButtons() {
    // Visualizar detalhes (apenas o botão do olhinho)
    const viewButtons = document.querySelectorAll('.btn-action.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-vehicle-id');
            console.log('Abrindo modal de detalhes do veículo:', vehicleId);
            populateVehicleDetails(vehicleId);
            const detailsModal = document.getElementById('vehicleDetailsModal');
            openModal(detailsModal);
        });
    });
    
    // Editar veículo
    const editButtons = document.querySelectorAll('.btn-action.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-vehicle-id');
            editVehicle(vehicleId);
        });
    });
    
    // Excluir veículo
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-vehicle-id');
            deleteVehicle(vehicleId);
        });
    });
}

// Configurar paginação
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    const vehicles = appData.vehicles || [];
    const filteredVehicles = applyFiltersToData(vehicles);
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    const prevButton = document.createElement('div');
    prevButton.className = 'pagination-item';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            populateVehicleTable();
            setupPagination();
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('div');
        pageButton.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            populateVehicleTable();
            setupPagination();
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Botão próximo
    const nextButton = document.createElement('div');
    nextButton.className = 'pagination-item';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            populateVehicleTable();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Aplicar filtros aos dados
function applyFiltersToData(vehicles) {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('status').value;
    const temperatureFilter = document.getElementById('temperature').value;
    const routeFilter = document.getElementById('route').value;
    
    return vehicles.filter(vehicle => {
        // Filtro de busca
        if (searchTerm && !vehicle.id.toLowerCase().includes(searchTerm) && 
            !vehicle.driver.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filtro de status
        if (statusFilter) {
            if (statusFilter === 'Normal' && vehicle.status !== 'Normal') return false;
            if (statusFilter === 'Atenção' && vehicle.status !== 'Atenção') return false;
            if (statusFilter === 'inactive' && vehicle.status !== 'inactive') return false;
        }
        
        // Filtro de temperatura
        if (temperatureFilter) {
            const temp = parseFloat(vehicle.temperature);
            if (temperatureFilter === 'normal' && (temp < 2 || temp > 5)) return false;
            if (temperatureFilter === 'warning' && (temp <= 5 || temp > 7)) return false;
            if (temperatureFilter === 'critical' && temp <= 7) return false;
        }
        
        // Filtro de rota
        if (routeFilter && vehicle.route !== routeFilter) {
            return false;
        }
        
        return true;
    });
}

// Aplicar filtros
function applyFilters() {
    currentPage = 1;
    populateVehicleTable();
    setupPagination();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterForm').reset();
    applyFilters();
}

// Atualizar contador de veículos
function updateVehicleCount(count) {
    const totalVehicles = appData.vehicles ? appData.vehicles.length : 0;
    document.getElementById('vehicleCount').textContent = `Mostrando ${count} de ${totalVehicles} veículos`;
}

// Preencher detalhes do veículo (para o modal)
function populateVehicleDetails(vehicleId) {
    const vehicle = appData.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        console.error('Veículo não encontrado:', vehicleId);
        return;
    }
    
    console.log('Preenchendo detalhes para modal:', vehicleId);
    
    // Determinar modelo baseado na placa (simulação)
    const vehicleModels = {
        'VLC-1023': { modelo: 'Mercedes Sprinter', ano: '2022', capacidade: '1500 kg' },
        'VLC-2087': { modelo: 'Volkswagen Delivery', ano: '2021', capacidade: '1200 kg' },
        'VLC-3054': { modelo: 'Ford Transit', ano: '2020', capacidade: '1800 kg' },
        'VLC-4098': { modelo: 'Fiat Ducato', ano: '2022', capacidade: '1300 kg' },
        'VLC-5021': { modelo: 'Renault Master', ano: '2019', capacidade: '1400 kg' }
    };
    
    const vehicleInfo = vehicleModels[vehicle.id] || { modelo: 'Veículo Refrigerado', ano: '2021', capacidade: '1500 kg' };
    
    // Preencher informações do veículo
    document.getElementById('detail-placa').textContent = vehicle.id;
    document.getElementById('detail-modelo').textContent = vehicleInfo.modelo;
    document.getElementById('detail-ano').textContent = vehicleInfo.ano;
    document.getElementById('detail-capacidade').textContent = vehicleInfo.capacidade;
    document.getElementById('detail-tipo').textContent = 'Refrigerado';
    document.getElementById('detail-motorista').textContent = vehicle.driver;
    document.getElementById('detail-rota').textContent = vehicle.route;
    document.getElementById('detail-atualizacao').textContent = vehicle.lastUpdate;
    document.getElementById('detail-ultima-manutencao').textContent = '10/05/2023';
    document.getElementById('detail-proxima-manutencao').textContent = '10/08/2023';
    document.getElementById('detail-km').textContent = '45.230 km';
    document.getElementById('detail-telefone').textContent = '(11) 98765-4321';
    document.getElementById('detail-email').textContent = 'motorista@email.com';
    
    // Atualizar status
    const statusElement = document.getElementById('detail-status');
    statusElement.innerHTML = '';
    const statusSpan = document.createElement('span');
    
    let statusClass = 'normal';
    let statusText = 'Ativo';
    
    if (vehicle.status === 'Crítico') {
        statusClass = 'alert';
        statusText = 'Crítico';
    } else if (vehicle.status === 'Atenção') {
        statusClass = 'warning';
        statusText = 'Manutenção';
    } else if (vehicle.status === 'inactive') {
        statusClass = 'inactive';
        statusText = 'Inativo';
    }
    
    statusSpan.className = `status ${statusClass}`;
    statusSpan.textContent = statusText;
    statusElement.appendChild(statusSpan);
    
    // Atualizar temperatura
    const tempElement = document.getElementById('detail-temperatura');
    tempElement.innerHTML = '';
    const tempIndicator = document.createElement('span');
    
    const tempValue = parseFloat(vehicle.temperature);
    if (tempValue >= 2 && tempValue <= 5) {
        tempIndicator.className = 'temp-indicator temp-normal';
    } else if (tempValue > 5 && tempValue <= 7) {
        tempIndicator.className = 'temp-indicator temp-warning';
    } else {
        tempIndicator.className = 'temp-indicator temp-alert';
    }
    
    tempElement.appendChild(tempIndicator);
    tempElement.appendChild(document.createTextNode(` ${vehicle.temperature}°C`));
    
    // Atualizar título do modal
    document.querySelector('#vehicleDetailsModal .modal-title').textContent = `Detalhes do Veículo - ${vehicle.id}`;
    
    // Adicionar classe de status aos cards baseado no status do veículo
    const infoCard = document.querySelector('.detail-card:first-child');
    const operationCard = document.querySelector('.detail-card:nth-child(2)');
    
    // Remover classes anteriores
    infoCard.classList.remove('alert', 'warning');
    operationCard.classList.remove('alert', 'warning');
    
    if (vehicle.status === 'Crítico') {
        infoCard.classList.add('alert');
        operationCard.classList.add('alert');
    } else if (vehicle.status === 'Atenção') {
        infoCard.classList.add('warning');
        operationCard.classList.add('warning');
    }
    
    // Criar gráfico de temperatura
    if (typeof Chart !== 'undefined') {
        createVehicleDetailChart(vehicle);
    } else {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999;">
                    <i class="fas fa-chart-line" style="font-size: 40px; margin-bottom: 10px;"></i>
                    <span>Gráfico não disponível</span>
                </div>
            `;
        }
    }
}

// Função para criar gráfico de temperatura no modal
function createVehicleDetailChart(vehicle) {
    const ctx = document.getElementById('vehicleDetailChart');
    if (!ctx) {
        console.error('Canvas vehicleDetailChart não encontrado');
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (vehicleDetailChart) {
        vehicleDetailChart.destroy();
    }
    
    // Gerar dados de histórico para as últimas 24h (simulação)
    const historyData = generateTemperatureHistory(vehicle);
    
    const ctx2d = ctx.getContext('2d');
    
    // Configurar cores baseadas na temperatura
    const backgroundColors = historyData.temperatures.map(temp => {
        if (temp > 7) return 'rgba(236, 37, 19, 0.3)'; // Vermelho para crítico
        if (temp > 5) return 'rgba(236, 221, 19, 0.3)'; // Amarelo para atenção
        return 'rgba(46, 167, 173, 0.3)'; // Verde para normal
    });
    
    const borderColors = historyData.temperatures.map(temp => {
        if (temp > 7) return 'rgba(236, 37, 19, 1)';
        if (temp > 5) return 'rgba(236, 221, 19, 1)';
        return 'rgba(46, 167, 173, 1)';
    });
    
    vehicleDetailChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: historyData.times,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historyData.temperatures,
                backgroundColor: 'rgba(46, 167, 173, 0.1)',
                borderColor: 'rgba(46, 167, 173, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: borderColors,
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
                    callbacks: {
                        label: function(context) {
                            return `Temperatura: ${context.parsed.y}°C`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        maxRotation: 45,
                        callback: function(value, index, values) {
                            // Mostrar apenas alguns labels para não poluir
                            return index % 3 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    },
                    min: -2,
                    max: 12,
                    ticks: {
                        stepSize: 2
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
                    tension: 0.4
                }
            }
        }
    });
    
    // Adicionar zonas de temperatura visualmente
    addTemperatureZones();
}

// Função para gerar histórico de temperatura (simulação)
function generateTemperatureHistory(vehicle) {
    const times = [];
    const temperatures = [];
    
    // Gerar 24 pontos de dados (uma por hora)
    const baseTemp = parseFloat(vehicle.temperature);
    
    for (let i = 23; i >= 0; i--) {
        const time = new Date();
        time.setHours(time.getHours() - i);
        
        // Formatar hora
        const timeString = time.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Gerar temperatura com variação realista baseada no status
        let variationRange = 1.5; // Variação padrão
        if (vehicle.status === 'Crítico') variationRange = 3; // Mais variação para crítico
        if (vehicle.status === 'Atenção') variationRange = 2; // Variação média para atenção
        
        const variation = (Math.random() - 0.5) * variationRange;
        const temp = Math.max(-2, Math.min(12, baseTemp + variation));
        
        times.push(timeString);
        temperatures.push(parseFloat(temp.toFixed(1)));
    }
    
    return { times, temperatures };
}

// Função para adicionar zonas de temperatura ao gráfico
function addTemperatureZones() {
    // Adicionar informações sobre as zonas de temperatura
    const chartContainer = document.querySelector('.temperature-chart');
    if (!chartContainer.querySelector('.temperature-zones')) {
        const zonesInfo = document.createElement('div');
        zonesInfo.className = 'temperature-zones';
        zonesInfo.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            font-size: 12px;
        `;
        zonesInfo.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 12px; height: 12px; background-color: #2EAD61; border-radius: 2px; margin-right: 5px;"></span>
                <span>Ideal (2-5°C)</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 12px; height: 12px; background-color: #ECDD13; border-radius: 2px; margin-right: 5px;"></span>
                <span>Atenção (5-7°C)</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 12px; height: 12px; background-color: #EC2513; border-radius: 2px; margin-right: 5px;"></span>
                <span>Crítico (>7°C)</span>
            </div>
        `;
        chartContainer.appendChild(zonesInfo);
    }
}

// Função para atualizar o gráfico quando os dados mudarem
function updateVehicleDetailChart(vehicle) {
    if (vehicleDetailChart && vehicle) {
        const historyData = generateTemperatureHistory(vehicle);
        
        vehicleDetailChart.data.labels = historyData.times;
        vehicleDetailChart.data.datasets[0].data = historyData.temperatures;
        
        // Atualizar cores dos pontos
        const borderColors = historyData.temperatures.map(temp => {
            if (temp > 7) return 'rgba(236, 37, 19, 1)';
            if (temp > 5) return 'rgba(236, 221, 19, 1)';
            return 'rgba(46, 167, 173, 1)';
        });
        
        vehicleDetailChart.data.datasets[0].pointBackgroundColor = borderColors;
        vehicleDetailChart.update('none'); // 'none' para animação suave
    }
}

// Salvar veículo
function saveVehicle() {
    const form = document.getElementById('addVehicleForm');
    const formData = new FormData(form);
    
    // Validar formulário
    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Criar novo veículo
    const newVehicle = {
        id: formData.get('plate'),
        driver: formData.get('driver'),
        route: formData.get('modalRoute'),
        status: formData.get('modalStatus'),
        temperature: (Math.random() * 8 + 2).toFixed(1), // Temperatura aleatória entre 2-10°C
        lastUpdate: new Date().toLocaleTimeString('pt-BR'),
        sensors: [
            { id: 1, name: "Sensor Principal", value: (Math.random() * 8 + 2).toFixed(1), status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: (Math.random() * 8 + 2).toFixed(1), status: "Normal", location: "Perto da porta" }
        ],
        history: [
            { time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}), temp: (Math.random() * 8 + 2).toFixed(1), status: "Normal", location: "Localização atual" }
        ]
    };
    
    // Adicionar à lista de veículos
    if (!appData.vehicles) appData.vehicles = [];
    appData.vehicles.push(newVehicle);
    
    // Fechar modal e atualizar tabela
    closeModal(document.getElementById('addVehicleModal'));
    
    // Limpar formulário
    form.reset();
    
    // Atualizar interface
    currentPage = 1;
    populateVehicleTable();
    setupPagination();
    
    alert(`Veículo ${newVehicle.id} adicionado com sucesso!`);
}

// Editar veículo
function editVehicle(vehicleId = null) {
    if (vehicleId) {
        // Editar veículo específico
        alert(`Editando veículo: ${vehicleId}`);
        // Aqui você pode abrir um modal de edição com os dados preenchidos
    } else {
        // Editar veículo do modal de detalhes
        const vehicleId = document.getElementById('detail-placa').textContent;
        alert(`Editando veículo: ${vehicleId}`);
        // Aqui você pode implementar a lógica de edição
    }
}

// Excluir veículo
function deleteVehicle(vehicleId) {
    if (confirm(`Tem certeza que deseja excluir o veículo ${vehicleId}?`)) {
        appData.vehicles = appData.vehicles.filter(v => v.id !== vehicleId);
        populateVehicleTable();
        setupPagination();
        alert(`Veículo ${vehicleId} excluído com sucesso!`);
    }
}

// Exportar dados
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rotasystem-veiculos.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Dados exportados com sucesso!');
}

// Atualizar dados
function refreshData() {
    location.reload();
}

// Simulação de atualizações em tempo real
function startRealTimeUpdates() {
    setInterval(() => {
        if (appData.vehicles) {
            // Atualizar temperaturas aleatoriamente
            appData.vehicles.forEach(vehicle => {
                const variation = (Math.random() - 0.5) * 0.4;
                vehicle.temperature = Math.max(-5, Math.min(10, (parseFloat(vehicle.temperature) + variation))).toFixed(1);
                vehicle.lastUpdate = new Date().toLocaleTimeString('pt-BR');
            });
            
            // Atualizar a tabela
            populateVehicleTable();
            
            // Atualizar gráfico se estiver aberto
            const detailsModal = document.getElementById('vehicleDetailsModal');
            if (detailsModal.style.display === 'flex') {
                const currentVehicleId = document.getElementById('detail-placa').textContent;
                const currentVehicle = appData.vehicles.find(v => v.id === currentVehicleId);
                if (currentVehicle) {
                    updateVehicleDetailChart(currentVehicle);
                    
                    // Atualizar também a temperatura no modal
                    const tempElement = document.getElementById('detail-temperatura');
                    tempElement.innerHTML = '';
                    const tempIndicator = document.createElement('span');
                    
                    const tempValue = parseFloat(currentVehicle.temperature);
                    if (tempValue >= 2 && tempValue <= 5) {
                        tempIndicator.className = 'temp-indicator temp-normal';
                    } else if (tempValue > 5 && tempValue <= 7) {
                        tempIndicator.className = 'temp-indicator temp-warning';
                    } else {
                        tempIndicator.className = 'temp-indicator temp-alert';
                    }
                    
                    tempElement.appendChild(tempIndicator);
                    tempElement.appendChild(document.createTextNode(` ${currentVehicle.temperature}°C`));
                    document.getElementById('detail-atualizacao').textContent = currentVehicle.lastUpdate;
                }
            }
        }
    }, 15000); // Atualizar a cada 15 segundos
}

// Dados de fallback em caso de erro no carregamento do JSON
function getFallbackData() {
    console.log('Usando dados de fallback para veículos');
    return {
        "dashboard": {
            "totalVehicles": 5,
            "avgTemperature": 4.9,
            "activeAlerts": 1,
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
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 8.1, "status": "Crítico", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 9.2, "status": "Crítico", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "10:10", "temp": 7.8, "status": "Atenção", "location": "Av. Tiradentes, 2000" },
                    { "time": "10:00", "temp": 6.5, "status": "Atenção", "location": "Av. Braz Leme, 1500" }
                ]
            },
            {
                "id": "VLC-3054",
                "driver": "João Oliveira",
                "route": "Zona Leste - Centro",
                "status": "Normal",
                "temperature": 4.1,
                "lastUpdate": "09:45:18",
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 4.1, "status": "Normal", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 4.3, "status": "Normal", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "09:40", "temp": 4.0, "status": "Normal", "location": "Av. Radial Leste, 800" },
                    { "time": "09:30", "temp": 3.9, "status": "Normal", "location": "Rua Tuiuti, 300" }
                ]
            },
            {
                "id": "VLC-4098",
                "driver": "Maria Costa",
                "route": "Zona Oeste - Centro",
                "status": "Atenção",
                "temperature": 6.2,
                "lastUpdate": "11:05:33",
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 6.2, "status": "Atenção", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 6.8, "status": "Atenção", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "11:00", "temp": 6.1, "status": "Atenção", "location": "Av. Rebouças, 1500" },
                    { "time": "10:50", "temp": 5.9, "status": "Atenção", "location": "Rua Heitor Penteado, 200" }
                ]
            },
            {
                "id": "VLC-5021",
                "driver": "Pedro Almeida",
                "route": "Centro - Zona Sul",
                "status": "inactive",
                "temperature": 2.5,
                "lastUpdate": "08:30:15",
                "sensors": [
                    { "id": 1, "name": "Sensor Principal", "value": 2.5, "status": "Normal", "location": "Centro da carga" },
                    { "id": 2, "name": "Sensor da Porta", "value": 2.7, "status": "Normal", "location": "Perto da porta" }
                ],
                "history": [
                    { "time": "08:25", "temp": 2.4, "status": "Normal", "location": "Garagem Central" },
                    { "time": "08:15", "temp": 2.3, "status": "Normal", "location": "Garagem Central" }
                ]
            }
        ]
    };
}