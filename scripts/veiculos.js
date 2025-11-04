// Variáveis globais
let vehiclesData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação de veículos...');
    initializeApp();
});

// Função para inicializar a aplicação
async function initializeApp() {
    console.log('Inicializando aplicação de veículos...');
    setupEventListeners();
    await loadVehiclesData();
    
    // Se não encontrou veículos, usar fallback
    if (vehiclesData.length === 0) {
        console.log('Nenhum veículo encontrado, usando fallback KG8000003');
        vehiclesData = getFallbackData();
    }
    
    populateVehicleTable();
    setupPagination();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('search');
    const statusFilter = document.getElementById('statusFilter');
    
    // Atualizar dados
    refreshBtn.addEventListener('click', refreshData);
    
    // Filtros em tempo real com debounce para evitar piscamento
    let filterTimeout;
    const applyFilterWithDebounce = function() {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    };
    
    searchInput.addEventListener('input', applyFilterWithDebounce);
    statusFilter.addEventListener('change', applyFilterWithDebounce);
}

// Carregar dados dos veículos - SIMPLIFICADO
async function loadVehiclesData() {
    try {
        console.log('Carregando dados dos veículos...');
        
        // Dados fixos - apenas KG8000003 (substitui o vehicles_data.json)
        const vehicles = [{ "license_plate": "KG8000003" }];
        
        // Para cada veículo, carregar dados dos sensores
        vehiclesData = [];
        
        for (const vehicle of vehicles) {
            const sensorData = await loadSensorDataForVehicle(vehicle.license_plate);
            vehiclesData.push({
                license_plate: vehicle.license_plate,
                sensor_data: sensorData
            });
        }
        
        console.log('Dados dos veículos carregados:', vehiclesData);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        vehiclesData = getFallbackData();
    }
}

// Carregar dados dos sensores para um veículo específico
async function loadSensorDataForVehicle(licensePlate) {
    try {
        console.log(`Carregando dados dos sensores para ${licensePlate}...`);
        
        const response = await fetch('./sensor_data.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar dados dos sensores');
        }
        
        const allSensorData = await response.json();
        
        // Retornar os dados dos sensores diretamente (já são do KG8000003)
        return allSensorData;
        
    } catch (error) {
        console.error(`Erro ao carregar sensores para ${licensePlate}:`, error);
        return getFallbackSensorData();
    }
}

// Popular a tabela de veículos
function populateVehicleTable() {
    const tableBody = document.getElementById('vehicleTableBody');
    
    // Remover classe de loading da tabela
    const table = document.querySelector('.vehicle-table');
    table.classList.remove('table-loading');
    
    tableBody.innerHTML = '';
    
    console.log('Populando tabela com', vehiclesData.length, 'veículos');
    
    // Aplicar filtros
    const filteredVehicles = applyFiltersToData(vehiclesData);
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    if (paginatedVehicles.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #777;">
                    <i class="fas fa-search" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    Nenhum veículo encontrado com os filtros aplicados
                </td>
            </tr>
        `;
        updateVehicleCount(0);
        return;
    }
    
    paginatedVehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        
        // Calcular temperatura média dos sensores internos
        const avgTemperature = calculateAverageTemperature(vehicle.sensor_data);
        const sensorCount = countConfiguredSensors(vehicle.sensor_data);
        const lastUpdate = getLastUpdateTime(vehicle.sensor_data);
        const temperatureStatus = getTemperatureStatus(vehicle.sensor_data);
        
        // Gerar dados aleatórios para os outros campos
        const vehicleModel = generateRandomModel();
        const driver = generateRandomDriver();
        const route = generateRandomRoute();
        
        // Determinar classe do indicador de temperatura
        let tempClass = 'temp-normal';
        const tempValue = parseFloat(avgTemperature);
        if (!isNaN(tempValue)) {
            if (tempValue > 7) tempClass = 'temp-alert';
            else if (tempValue > 5) tempClass = 'temp-warning';
        }
        
        // Criar tooltip de sensores
        const sensorTooltip = createSensorTooltip(vehicle.sensor_data, lastUpdate);
        
        row.innerHTML = `
            <td>
                <a href="descricao.html?placa=${vehicle.license_plate}" class="placa-link" title="Abrir página de detalhes do veículo">
                    ${vehicle.license_plate}
                </a>
            </td>
            <td>${vehicleModel}</td>
            <td>${driver}</td>
            <td>${route}</td>
            <td>
                <div class="multi-sensor">
                    <span class="temp-indicator ${tempClass}"></span> 
                    <span class="temperature-value">${avgTemperature}</span>
                    <span class="sensor-badge">${sensorCount} sensores</span>
                    <div class="sensor-tooltip">
                        <div class="sensor-tooltip-title">Sensores - Última atualização: ${lastUpdate}</div>
                        <div class="sensor-tooltip-content">
                            ${sensorTooltip}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(temperatureStatus)}">${temperatureStatus}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <a href="descricao.html?placa=${vehicle.license_plate}" class="btn-action view" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    updateVehicleCount(filteredVehicles.length);
    
    // Configurar tooltips após criar a tabela
    setupTooltips();
}

// Determinar classe do badge de status
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Normal': return 'status-normal';
        case 'Alerta': return 'status-warning';
        case 'Crítico': return 'status-alert';
        case 'Sem Dados': return 'status-inactive';
        default: return 'status-inactive';
    }
}

// Determinar status da temperatura
function getTemperatureStatus(sensorData) {
    const avgTemp = calculateAverageTemperature(sensorData);
    if (avgTemp === '--°C') {
        return 'Sem Dados';
    }
    
    const tempValue = parseFloat(avgTemp);
    if (isNaN(tempValue)) {
        return 'Sem Dados';
    }
    
    if (tempValue >= 2 && tempValue <= 5) return 'Normal';
    if (tempValue > 5 && tempValue <= 7) return 'Alerta';
    return 'Crítico';
}

// Aplicar filtros aos dados
function applyFiltersToData(vehicles) {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    return vehicles.filter(vehicle => {
        // Filtro de pesquisa por placa
        if (searchTerm && !vehicle.license_plate.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filtro por status de temperatura
        if (statusFilter) {
            const tempStatus = getTemperatureStatus(vehicle.sensor_data);
            
            switch(statusFilter) {
                case 'normal':
                    if (tempStatus !== 'Normal') return false;
                    break;
                case 'alerta':
                    if (tempStatus !== 'Alerta') return false;
                    break;
                case 'critico':
                    if (tempStatus !== 'Crítico') return false;
                    break;
            }
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

// Configurar paginação
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    const filteredVehicles = applyFiltersToData(vehiclesData);
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) {
        // Não mostrar paginação se só tem uma página
        return;
    }
    
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
    if (currentPage === 1) prevButton.classList.add('disabled');
    paginationContainer.appendChild(prevButton);
    
    // Páginas
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
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
    if (currentPage === totalPages) nextButton.classList.add('disabled');
    paginationContainer.appendChild(nextButton);
}

// Atualizar contador de veículos
function updateVehicleCount(count) {
    const totalVehicles = vehiclesData.length;
    document.getElementById('vehicleCount').innerHTML = `
        <div class="loading-content">Mostrando ${count} de ${totalVehicles} veículo${totalVehicles !== 1 ? 's' : ''}</div>
    `;
}

// Atualizar dados
function refreshData() {
    // Mostrar loading
    const table = document.querySelector('.vehicle-table');
    table.classList.add('table-loading');
    
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('btn-loading');
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Dados de fallback para KG8000003
function getFallbackData() {
    console.log('Usando dados de fallback para veículo KG8000003');
    return [
        {
            license_plate: "KG8000003",
            sensor_data: getFallbackSensorData()
        }
    ];
}

// Dados de sensores de fallback para KG8000003
function getFallbackSensorData() {
    const now = new Date().toISOString();
    return {
        "externo": {
            "temperature": 24.2,
            "humidity": 65.0,
            "last_read": now
        },
        "principal": {
            "temperature": 3.2,
            "humidity": 54.0,
            "last_read": now
        },
        "meio": {
            "temperature": 3.5,
            "humidity": 55.0,
            "last_read": now
        },
        "porta": {
            "temperature": 6.8,
            "humidity": 58.0,
            "last_read": now
        },
        "fundo": {
            "temperature": 2.9,
            "humidity": 53.0,
            "last_read": now
        },
        "piso": {
            "temperature": 3.1,
            "humidity": 56.0,
            "last_read": now
        },
        "teto": {
            "temperature": 3.3,
            "humidity": 54.5,
            "last_read": now
        }
    };
}

// Função para calcular temperatura média dos sensores internos
function calculateAverageTemperature(sensorData) {
    if (!sensorData) return '--°C';
    
    const internalSensors = ['principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    let totalTemp = 0;
    let validSensors = 0;
    
    internalSensors.forEach(sensorName => {
        if (sensorData[sensorName] && sensorData[sensorName].temperature !== 0.0) {
            totalTemp += sensorData[sensorName].temperature;
            validSensors++;
        }
    });
    
    if (validSensors > 0) {
        return (totalTemp / validSensors).toFixed(1) + '°C';
    }
    
    return '--°C';
}

// Contar sensores configurados
function countConfiguredSensors(sensorData) {
    if (!sensorData) return 0;
    
    let count = 0;
    Object.values(sensorData).forEach(sensor => {
        if (sensor.temperature !== 0.0) {
            count++;
        }
    });
    
    return count;
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
    
    // Ordem específica para mostrar os sensores
    const sensorOrder = ['externo', 'principal', 'meio', 'porta', 'fundo', 'piso', 'teto'];
    
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

// Função para determinar classe de status do sensor
function getSensorStatusClass(temperature, isExternal = false) {
    if (isExternal) return 'sensor-external';
    
    if (temperature >= 2 && temperature <= 5) return 'sensor-normal';
    if (temperature > 5 && temperature <= 7) return 'sensor-warning';
    return 'sensor-critical';
}

// Funções auxiliares para dados aleatórios
function generateRandomModel() {
    const models = ['Mercedes Sprinter', 'Volkswagen Delivery', 'Ford Transit', 'Fiat Ducato', 'Renault Master', 'Iveco Daily', 'Volvo FE'];
    return models[Math.floor(Math.random() * models.length)];
}

function generateRandomDriver() {
    const drivers = ['Carlos Silva', 'Ana Santos', 'João Oliveira', 'Maria Costa', 'Pedro Almeida', 'Fernanda Lima', 'Ricardo Souza'];
    return drivers[Math.floor(Math.random() * drivers.length)];
}

function generateRandomRoute() {
    const routes = ['Centro - Zona Sul', 'Zona Norte - Centro', 'Zona Leste - Centro', 'Zona Oeste - Centro', 'Centro - Zona Leste', 'Zona Sul - Zona Norte'];
    return routes[Math.floor(Math.random() * routes.length)];
}

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