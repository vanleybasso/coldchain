// Variáveis globais
let appData = {};
let currentPage = 1;
const itemsPerPage = 5;
let routeMap = null;
let routeLine = null;

// Funções de modal (globais)
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
    console.log('DOM carregado, iniciando aplicação de rotas...');
    
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
    console.log('Inicializando aplicação de rotas...');
    setupEventListeners();
    populateRoutesTable();
    setupPagination();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Modal functionality
    const addModal = document.getElementById('addRouteModal');
    const detailsModal = document.getElementById('routeDetailsModal');
    const addBtn = document.getElementById('addRouteBtn');
    const cancelBtn = document.getElementById('cancelAddRoute');
    const closeButtons = document.querySelectorAll('.close-modal');
    const closeDetailsBtn = document.querySelector('.close-details');
    const saveRouteBtn = document.getElementById('saveRouteBtn');
    const editRouteBtn = document.getElementById('editRouteBtn');
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
    
    // Salvar rota
    saveRouteBtn.addEventListener('click', saveRoute);
    
    // Editar rota
    editRouteBtn.addEventListener('click', editRoute);
    
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

// Dados de exemplo para as rotas
const routeData = {
    "1": {
        nome: "Rota Centro-Sul",
        origem: "Centro",
        destino: "Zona Sul",
        distancia: "18.5 km",
        tempo: "45 minutos",
        veiculos: "5",
        entregas: "28",
        consumo: "7.8 km/L",
        status: "active",
        motoristaPrincipal: "Carlos Silva",
        motoristaSuplentes: "Ana Santos, Roberto Alves",
        primeiraSaida: "06:30",
        ultimaSaida: "14:00",
        frequencia: "A cada 2 horas",
        temperatura: {
            media: "3.4°C",
            status: "normal",
            range: "2°C a 5°C",
            ultimaAtualizacao: "10/09/2023 14:25"
        },
        sensores: [
            { name: "Sensor Principal", value: "3.2°C", status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "3.5°C", status: "normal", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "2.9°C", status: "normal", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "3.3°C", status: "normal", location: "Teto traseiro" }
        ]
    },
    "2": {
        nome: "Rota Norte-Centro",
        origem: "Zona Norte",
        destino: "Centro",
        distancia: "22.3 km",
        tempo: "55 minutos",
        veiculos: "3",
        entregas: "22",
        consumo: "7.2 km/L",
        status: "active",
        motoristaPrincipal: "Ana Santos",
        motoristaSuplentes: "João Costa, Maria Oliveira",
        primeiraSaida: "07:00",
        ultimaSaida: "15:00",
        frequencia: "A cada 3 horas",
        temperatura: {
            media: "8.1°C",
            status: "alert",
            range: "2°C a 5°C",
            ultimaAtualizacao: "10/09/2023 14:20"
        },
        sensores: [
            { name: "Sensor Principal", value: "8.1°C", status: "alert", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "9.2°C", status: "alert", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "7.8°C", status: "alert", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "7.5°C", status: "alert", location: "Teto traseiro" }
        ]
    },
    "3": {
        nome: "Rota Oeste-Aeroporto",
        origem: "Zona Oeste",
        destino: "Aeroporto",
        distancia: "35.7 km",
        tempo: "1h 15min",
        veiculos: "2",
        entregas: "15",
        consumo: "8.1 km/L",
        status: "active",
        motoristaPrincipal: "Roberto Alves",
        motoristaSuplentes: "Carlos Silva, João Costa",
        primeiraSaida: "05:30",
        ultimaSaida: "13:30",
        frequencia: "A cada 4 horas",
        temperatura: {
            media: "6.3°C",
            status: "warning",
            range: "2°C a 5°C",
            ultimaAtualizacao: "10/09/2023 14:18"
        },
        sensores: [
            { name: "Sensor Principal", value: "6.3°C", status: "warning", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "7.1°C", status: "alert", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "5.8°C", status: "warning", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "6.0°C", status: "warning", location: "Teto traseiro" }
        ]
    },
    "4": {
        nome: "Rota Leste-Centro",
        origem: "Zona Leste",
        destino: "Centro",
        distancia: "16.8 km",
        tempo: "40 minutos",
        veiculos: "4",
        entregas: "32",
        consumo: "7.5 km/L",
        status: "active",
        motoristaPrincipal: "Maria Oliveira",
        motoristaSuplentes: "Ana Santos, Roberto Alves",
        primeiraSaida: "06:00",
        ultimaSaida: "16:00",
        frequencia: "A cada 2 horas",
        temperatura: {
            media: "4.0°C",
            status: "normal",
            range: "2°C a 5°C",
            ultimaAtualizacao: "10/09/2023 14:15"
        },
        sensores: [
            { name: "Sensor Principal", value: "4.0°C", status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "4.3°C", status: "normal", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "3.7°C", status: "normal", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "4.1°C", status: "normal", location: "Teto traseiro" }
        ]
    },
    "5": {
        nome: "Rota Aeroporto-Sul",
        origem: "Aeroporto",
        destino: "Zona Sul",
        distancia: "28.4 km",
        tempo: "1h 05min",
        veiculos: "2",
        entregas: "12",
        consumo: "7.9 km/L",
        status: "inactive",
        motoristaPrincipal: "João Costa",
        motoristaSuplentes: "Carlos Silva, Maria Oliveira",
        primeiraSaida: "08:00",
        ultimaSaida: "12:00",
        frequencia: "A cada 6 horas",
        temperatura: {
            media: "1.2°C",
            status: "warning",
            range: "2°C a 5°C",
            ultimaAtualizacao: "10/09/2023 14:10"
        },
        sensores: [
            { name: "Sensor Principal", value: "1.2°C", status: "warning", location: "Centro da carga" },
            { name: "Sensor da Porta", value: "1.5°C", status: "warning", location: "Perto da porta" },
            { name: "Sensor do Fundo", value: "0.9°C", status: "alert", location: "Fundo do veículo" },
            { name: "Sensor do Teto", value: "1.3°C", status: "warning", location: "Teto traseiro" }
        ]
    }
};

// Popular a tabela de rotas
function populateRoutesTable() {
    const tableBody = document.getElementById('routesTableBody');
    tableBody.innerHTML = '';
    
    const routes = Object.values(routeData);
    console.log('Populando tabela com', routes.length, 'rotas');
    
    // Aplicar filtros
    const filteredRoutes = applyFiltersToData(routes);
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
    
    if (paginatedRoutes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #777;">
                    <i class="fas fa-route" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    Nenhuma rota encontrada
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedRoutes.forEach((route, index) => {
        const routeId = Object.keys(routeData)[index];
        const row = document.createElement('tr');
        
        // Determinar classe do status
        let statusClass = route.status === 'active' ? 'active' : 'inactive';
        let statusText = route.status === 'active' ? 'Ativa' : 'Inativa';
        
        row.innerHTML = `
            <td>${route.nome}</td>
            <td>${route.origem} - ${route.destino}</td>
            <td>${route.distancia}</td>
            <td>${route.tempo}</td>
            <td>${route.veiculos} veículos</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" title="Visualizar" data-route-id="${routeId}"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" title="Editar" data-route-id="${routeId}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-action delete" title="Excluir" data-route-id="${routeId}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    updateRouteCount(filteredRoutes.length);
    
    // Configurar botões de ação
    setupActionButtons();
}

// Configurar botões de ação
function setupActionButtons() {
    // Visualizar detalhes
    const viewButtons = document.querySelectorAll('.btn-action.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const routeId = this.getAttribute('data-route-id');
            console.log('Abrindo detalhes da rota:', routeId);
            populateRouteDetails(routeId);
            const detailsModal = document.getElementById('routeDetailsModal');
            openModal(detailsModal);
        });
    });
    
    // Editar rota
    const editButtons = document.querySelectorAll('.btn-action.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const routeId = this.getAttribute('data-route-id');
            editRoute(routeId);
        });
    });
    
    // Excluir rota
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const routeId = this.getAttribute('data-route-id');
            deleteRoute(routeId);
        });
    });
}

// Configurar paginação
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    const routes = Object.values(routeData);
    const filteredRoutes = applyFiltersToData(routes);
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    const prevButton = document.createElement('div');
    prevButton.className = 'pagination-item';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            populateRoutesTable();
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
            populateRoutesTable();
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
            populateRoutesTable();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Aplicar filtros aos dados
function applyFiltersToData(routes) {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('status').value;
    const regionFilter = document.getElementById('region').value;
    const vehicleFilter = document.getElementById('vehicle').value;
    
    return routes.filter(route => {
        // Filtro de busca
        if (searchTerm && !route.nome.toLowerCase().includes(searchTerm) && 
            !route.origem.toLowerCase().includes(searchTerm) &&
            !route.destino.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filtro de status
        if (statusFilter && route.status !== statusFilter) {
            return false;
        }
        
        // Filtro de região
        if (regionFilter) {
            const origem = route.origem.toLowerCase();
            const destino = route.destino.toLowerCase();
            const filter = regionFilter.toLowerCase();
            
            if (!origem.includes(filter) && !destino.includes(filter)) {
                return false;
            }
        }
        
        // Filtro de tipo de veículo (simulação)
        if (vehicleFilter) {
            const veiculos = parseInt(route.veiculos);
            if (vehicleFilter === 'small' && veiculos > 3) return false;
            if (vehicleFilter === 'medium' && (veiculos <= 2 || veiculos > 5)) return false;
            if (vehicleFilter === 'large' && veiculos <= 3) return false;
        }
        
        return true;
    });
}

// Aplicar filtros
function applyFilters() {
    currentPage = 1;
    populateRoutesTable();
    setupPagination();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterForm').reset();
    applyFilters();
}

// Atualizar contador de rotas
function updateRouteCount(count) {
    const totalRoutes = Object.keys(routeData).length;
    document.getElementById('routeCount').textContent = `Mostrando ${count} de ${totalRoutes} rotas`;
}

// Função para renderizar os sensores no modal
function renderSensors(sensors) {
    const sensorsContainer = document.getElementById('sensors-container');
    sensorsContainer.innerHTML = '';
    
    sensors.forEach(sensor => {
        const sensorCard = document.createElement('div');
        sensorCard.className = `sensor-card ${sensor.status}`;
        
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status ${sensor.status}">${sensor.status === 'normal' ? 'Normal' : sensor.status === 'warning' ? 'Atenção' : 'Crítico'}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}</div>
            <div class="sensor-card-location">${sensor.location}</div>
        `;
        
        sensorsContainer.appendChild(sensorCard);
    });
}

// Função para obter coordenadas fictícias baseadas na rota
function getRouteCoordinates(route) {
    const routeCoordinates = {
        "1": { // Centro-Sul
            origin: [-23.5505, -46.6333], // Centro
            destination: [-23.6505, -46.7333], // Zona Sul
            waypoints: [
                [-23.5605, -46.6433],
                [-23.5805, -46.6633],
                [-23.6005, -46.6833],
                [-23.6205, -46.7033],
                [-23.6405, -46.7233]
            ]
        },
        "2": { // Norte-Centro
            origin: [-23.5005, -46.6333], // Zona Norte
            destination: [-23.5505, -46.6333], // Centro
            waypoints: [
                [-23.5105, -46.6333],
                [-23.5205, -46.6333],
                [-23.5305, -46.6333],
                [-23.5405, -46.6333]
            ]
        },
        "3": { // Oeste-Aeroporto
            origin: [-23.5505, -46.7333], // Zona Oeste
            destination: [-23.4356, -46.4737], // Aeroporto
            waypoints: [
                [-23.5405, -46.7233],
                [-23.5205, -46.6833],
                [-23.5005, -46.6433],
                [-23.4805, -46.6033],
                [-23.4605, -46.5633],
                [-23.4456, -46.5237]
            ]
        },
        "4": { // Leste-Centro
            origin: [-23.5505, -46.5333], // Zona Leste
            destination: [-23.5505, -46.6333], // Centro
            waypoints: [
                [-23.5505, -46.5433],
                [-23.5505, -46.5533],
                [-23.5505, -46.5633],
                [-23.5505, -46.5733],
                [-23.5505, -46.5833],
                [-23.5505, -46.5933],
                [-23.5505, -46.6033],
                [-23.5505, -46.6133],
                [-23.5505, -46.6233]
            ]
        },
        "5": { // Aeroporto-Sul
            origin: [-23.4356, -46.4737], // Aeroporto
            destination: [-23.6505, -46.7333], // Zona Sul
            waypoints: [
                [-23.4456, -46.4937],
                [-23.4656, -46.5337],
                [-23.4856, -46.5737],
                [-23.5056, -46.6137],
                [-23.5256, -46.6537],
                [-23.5456, -46.6937],
                [-23.5656, -46.7137],
                [-23.5856, -46.7237],
                [-23.6056, -46.7337],
                [-23.6256, -46.7337]
            ]
        }
    };
    
    const routeId = Object.keys(routeData).find(key => routeData[key] === route);
    return routeCoordinates[routeId] || routeCoordinates["1"];
}

// Função para inicializar o mapa
function initMap(routeId) {
    const route = routeData[routeId];
    if (!route) return;
    
    // Destruir mapa anterior se existir
    if (routeMap) {
        routeMap.remove();
        routeMap = null;
    }
    
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer) return;
    
    // Coordenadas fictícias baseadas na rota
    const coordinates = getRouteCoordinates(route);
    
    // Criar mapa
    routeMap = L.map('routeMap').setView(coordinates.center || coordinates.origin, 12);
    
    // Adicionar tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(routeMap);
    
    // Adicionar marcadores
    const originIcon = L.divIcon({
        className: 'origin-marker',
        iconSize: [20, 20],
        html: '<i class="fas fa-play" style="color: white; font-size: 8px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>'
    });
    
    const destinationIcon = L.divIcon({
        className: 'destination-marker',
        iconSize: [20, 20],
        html: '<i class="fas fa-flag-checkered" style="color: white; font-size: 8px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>'
    });
    
    // Marcador de origem
    L.marker(coordinates.origin, { icon: originIcon })
        .addTo(routeMap)
        .bindPopup(`<strong>Origem:</strong> ${route.origem}<br><small>${coordinates.origin[0].toFixed(4)}, ${coordinates.origin[1].toFixed(4)}</small>`);
    
    // Marcador de destino
    L.marker(coordinates.destination, { icon: destinationIcon })
        .addTo(routeMap)
        .bindPopup(`<strong>Destino:</strong> ${route.destino}<br><small>${coordinates.destination[0].toFixed(4)}, ${coordinates.destination[1].toFixed(4)}</small>`);
    
    // Adicionar linha da rota
    const routePoints = [coordinates.origin, ...(coordinates.waypoints || []), coordinates.destination];
    routeLine = L.polyline(routePoints, {
        color: '#1E355F',
        weight: 4,
        opacity: 0.7,
        dashArray: '5, 10'
    }).addTo(routeMap);
    
    // Ajustar o zoom para mostrar toda a rota
    routeMap.fitBounds(routeLine.getBounds());
    
    // Adicionar veículos em movimento (simulação)
    addMovingVehicles(route, routePoints);
    
    // Adicionar controles de zoom
    setupMapControls();
    
    // Adicionar legenda
    addMapLegend();
}

// Adicionar veículos em movimento no mapa
function addMovingVehicles(route, routePoints) {
    const numVehicles = parseInt(route.veiculos) || 1;
    
    for (let i = 0; i < numVehicles; i++) {
        // Posição aleatória ao longo da rota
        const progress = Math.random();
        const segmentIndex = Math.floor((routePoints.length - 1) * progress);
        const segmentProgress = (routePoints.length - 1) * progress - segmentIndex;
        
        const startPoint = routePoints[segmentIndex];
        const endPoint = routePoints[segmentIndex + 1];
        
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;
        
        const vehicleIcon = L.divIcon({
            className: 'vehicle-marker',
            iconSize: [16, 16],
            html: '<i class="fas fa-truck" style="color: white; font-size: 6px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>'
        });
        
        L.marker([lat, lng], { icon: vehicleIcon })
            .addTo(routeMap)
            .bindPopup(`<strong>Veículo ${i + 1}</strong><br>Rota: ${route.nome}<br>Status: Em trânsito`);
    }
}

// Configurar controles do mapa
function setupMapControls() {
    // Controles de zoom
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        routeMap.zoomIn();
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        routeMap.zoomOut();
    });
    
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        if (routeLine) {
            routeMap.fitBounds(routeLine.getBounds());
        }
    });
}

// Adicionar legenda do mapa
function addMapLegend() {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
            <div class="legend-item">
                <div class="legend-color legend-origin"></div>
                <span>Origem</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-destination"></div>
                <span>Destino</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-vehicle"></div>
                <span>Veículo</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-route"></div>
                <span>Rota</span>
            </div>
        `;
        return div;
    };
    
    legend.addTo(routeMap);
}

// Preencher detalhes da rota
function populateRouteDetails(routeId) {
    const route = routeData[routeId];
    if (!route) {
        console.error('Rota não encontrada:', routeId);
        return;
    }
    
    console.log('Preenchendo detalhes para:', routeId);
    
    // Preencher informações da rota
    document.getElementById('detail-nome').textContent = route.nome;
    document.getElementById('detail-origem').textContent = route.origem;
    document.getElementById('detail-destino').textContent = route.destino;
    document.getElementById('detail-distancia').textContent = route.distancia;
    document.getElementById('detail-tempo').textContent = route.tempo;
    document.getElementById('detail-veiculos').textContent = route.veiculos;
    document.getElementById('detail-entregas').textContent = route.entregas;
    document.getElementById('detail-consumo').textContent = route.consumo;
    document.getElementById('detail-motorista-principal').textContent = route.motoristaPrincipal;
    document.getElementById('detail-motorista-suplentes').textContent = route.motoristaSuplentes;
    document.getElementById('detail-primeira-saida').textContent = route.primeiraSaida;
    document.getElementById('detail-ultima-saida').textContent = route.ultimaSaida;
    document.getElementById('detail-frequencia').textContent = route.frequencia;
    
    // Preencher informações de temperatura
    document.getElementById('detail-temp-media').innerHTML = `<span class="temp-indicator temp-${route.temperatura.status}"></span> ${route.temperatura.media}`;
    document.getElementById('detail-temp-range').textContent = route.temperatura.range;
    document.getElementById('detail-temp-update').textContent = route.temperatura.ultimaAtualizacao;
    
    // Atualizar status de temperatura
    const tempStatusElement = document.getElementById('detail-temp-status');
    tempStatusElement.innerHTML = '';
    const tempStatusSpan = document.createElement('span');
    tempStatusSpan.className = `status ${route.temperatura.status}`;
    tempStatusSpan.textContent = route.temperatura.status === 'normal' ? 'Normal' : route.temperatura.status === 'warning' ? 'Atenção' : 'Crítico';
    tempStatusElement.appendChild(tempStatusSpan);
    
    // Atualizar status da rota
    const statusElement = document.getElementById('detail-status');
    statusElement.innerHTML = '';
    const statusSpan = document.createElement('span');
    statusSpan.className = `status ${route.status}`;
    statusSpan.textContent = route.status === 'active' ? 'Ativa' : 'Inativa';
    statusElement.appendChild(statusSpan);
    
    // Renderizar sensores
    renderSensors(route.sensores);
    
    // Atualizar título do modal
    document.querySelector('#routeDetailsModal .modal-title').textContent = `Detalhes da Rota - ${route.nome}`;
    
    // Inicializar mapa
    setTimeout(() => {
        initMap(routeId);
    }, 100);
}

// Salvar rota
function saveRoute() {
    const form = document.getElementById('addRouteForm');
    const formData = new FormData(form);
    
    // Validar formulário
    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Criar nova rota
    const newRouteId = Object.keys(routeData).length + 1;
    const newRoute = {
        nome: document.getElementById('route-name').value,
        origem: document.getElementById('origin').value,
        destino: document.getElementById('destination').value,
        distancia: document.getElementById('distance').value + ' km',
        tempo: document.getElementById('time').value + ' minutos',
        veiculos: Math.floor(Math.random() * 5) + 1 + ' veículos',
        entregas: Math.floor(Math.random() * 30) + 10 + '',
        consumo: (Math.random() * 2 + 6).toFixed(1) + ' km/L',
        status: document.getElementById('route-status').value,
        motoristaPrincipal: "Novo Motorista",
        motoristaSuplentes: "Suplente 1, Suplente 2",
        primeiraSaida: "06:00",
        ultimaSaida: "14:00",
        frequencia: "A cada 2 horas",
        temperatura: {
            media: (Math.random() * 8 + 2).toFixed(1) + '°C',
            status: "normal",
            range: "2°C a 5°C",
            ultimaAtualizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
        },
        sensores: [
            { name: "Sensor Principal", value: (Math.random() * 8 + 2).toFixed(1) + '°C', status: "normal", location: "Centro da carga" },
            { name: "Sensor da Porta", value: (Math.random() * 8 + 2).toFixed(1) + '°C', status: "normal", location: "Perto da porta" }
        ]
    };
    
    // Adicionar à lista de rotas
    routeData[newRouteId] = newRoute;
    
    // Fechar modal e atualizar tabela
    closeModal(document.getElementById('addRouteModal'));
    
    // Limpar formulário
    form.reset();
    
    // Atualizar interface
    currentPage = 1;
    populateRoutesTable();
    setupPagination();
    
    alert(`Rota "${newRoute.nome}" adicionada com sucesso!`);
}

// Editar rota
function editRoute(routeId = null) {
    if (routeId) {
        // Editar rota específica
        const route = routeData[routeId];
        alert(`Editando rota: ${route.nome}`);
    } else {
        // Editar rota do modal de detalhes
        const routeName = document.getElementById('detail-nome').textContent;
        alert(`Editando rota: ${routeName}`);
    }
}

// Excluir rota
function deleteRoute(routeId) {
    const route = routeData[routeId];
    if (!route) return;
    
    if (confirm(`Tem certeza que deseja excluir a rota "${route.nome}"?`)) {
        delete routeData[routeId];
        populateRoutesTable();
        setupPagination();
        alert(`Rota "${route.nome}" excluída com sucesso!`);
    }
}

// Exportar dados
function exportData() {
    const dataStr = JSON.stringify(routeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rotasystem-rotas.json';
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

// Dados de fallback em caso de erro no carregamento do JSON
function getFallbackData() {
    console.log('Usando dados de fallback para rotas');
    return {
        "dashboard": {
            "totalVehicles": 5,
            "avgTemperature": 4.9,
            "activeAlerts": 1,
            "fuelEconomy": 7.8,
            "fuelTarget": 8.2
        },
        "vehicles": []
    };
}