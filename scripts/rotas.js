// Variáveis globais
let routesData = [];
let currentFilters = {
    status: 'all',
    vehicle: 'all',
    date: 'week'
};
let map;
let currentRouteLayer = null;

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
    console.log('Inicializando página de rotas...');
    
    showLoading();
    
    try {
        // Inicializar mapa
        initializeMap();
        
        // Carregar dados
        await loadRoutesData();
        
        // Inicializar componentes
        initializeFilters();
        updateSummaryCards();
        displayRoutes();
        
        // Configurar event listeners
        setupEventListeners();
        
        hideLoading();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        hideLoading();
    }
});

// Inicializar mapa Leaflet
function initializeMap() {
    console.log('Inicializando mapa...');
    
    // Coordenadas iniciais (Centro de São Paulo como exemplo)
    const initialCoords = [-23.5505, -46.6333];
    
    // Criar mapa
    map = L.map('routeMap').setView(initialCoords, 12);
    
    // Adicionar tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    console.log('Mapa inicializado com sucesso');
}

// Carregar dados das rotas
async function loadRoutesData() {
    try {
        console.log('Carregando dados das rotas...');
        
        // Em um sistema real, isso viria de uma API
        // Por enquanto, vamos gerar dados de exemplo baseados no veículo KG8000003
        routesData = generateSampleRoutesData();
        console.log('Dados das rotas carregados:', routesData);
        
    } catch (error) {
        console.error('Erro ao carregar dados das rotas:', error);
        routesData = getFallbackRoutesData();
    }
}

// Gerar dados de exemplo de rotas
function generateSampleRoutesData() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
        {
            id: 'RT001',
            vehicle: 'KG8000003',
            driver: 'Carlos Silva',
            status: 'active',
            origin: 'Centro de Distribuição - Zona Leste',
            destination: 'Supermercado ABC - Zona Sul',
            distance: 25.8,
            duration: 45,
            progress: 65,
            startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 08:00
            endTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00
            currentLocation: [-23.5600, -46.6400],
            stops: [
                { name: 'Centro de Distribuição', address: 'Av. Industrial, 1000', status: 'completed' },
                { name: 'Posto de Combustível', address: 'Av. das Nações, 500', status: 'completed' },
                { name: 'Supermercado ABC', address: 'Rua Comercial, 250', status: 'pending' }
            ],
            temperatureStatus: 'normal',
            priority: 'high'
        },
        {
            id: 'RT002',
            vehicle: 'KG8000003',
            driver: 'Ana Santos',
            status: 'scheduled',
            origin: 'Centro de Distribuição - Zona Leste',
            destination: 'Restaurante XYZ - Centro',
            distance: 18.5,
            duration: 35,
            progress: 0,
            startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14:00
            endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
            currentLocation: null,
            stops: [
                { name: 'Centro de Distribuição', address: 'Av. Industrial, 1000', status: 'pending' },
                { name: 'Restaurante XYZ', address: 'Rua Central, 150', status: 'pending' }
            ],
            temperatureStatus: 'normal',
            priority: 'medium'
        },
        {
            id: 'RT003',
            vehicle: 'KG8000003',
            driver: 'João Oliveira',
            status: 'completed',
            origin: 'Centro de Distribuição - Zona Leste',
            destination: 'Mercado Municipal - Centro',
            distance: 22.3,
            duration: 40,
            progress: 100,
            startTime: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000), // 10:00
            endTime: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000), // 11:00
            currentLocation: null,
            stops: [
                { name: 'Centro de Distribuição', address: 'Av. Industrial, 1000', status: 'completed' },
                { name: 'Mercado Municipal', address: 'Praça da República, 100', status: 'completed' }
            ],
            temperatureStatus: 'normal',
            priority: 'medium'
        },
        {
            id: 'RT004',
            vehicle: 'KG8000003',
            driver: 'Carlos Silva',
            status: 'cancelled',
            origin: 'Centro de Distribuição - Zona Leste',
            destination: 'Shopping Center - Zona Oeste',
            distance: 30.2,
            duration: 55,
            progress: 0,
            startTime: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000), // 16:00
            endTime: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000), // 17:00
            currentLocation: null,
            stops: [
                { name: 'Centro de Distribuição', address: 'Av. Industrial, 1000', status: 'pending' },
                { name: 'Shopping Center', address: 'Av. Comercial, 2000', status: 'pending' }
            ],
            temperatureStatus: 'normal',
            priority: 'low',
            cancellationReason: 'Problema mecânico no veículo'
        }
    ];
}

// Dados de fallback para rotas
function getFallbackRoutesData() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
        {
            id: 'RT001',
            vehicle: 'KG8000003',
            driver: 'Motorista KG8000003',
            status: 'active',
            origin: 'Centro de Distribuição',
            destination: 'Ponto de Entrega 1',
            distance: 15.5,
            duration: 30,
            progress: 45,
            startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000),
            endTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
            currentLocation: [-23.5505, -46.6333],
            stops: [
                { name: 'Origem', address: 'Centro de Distribuição', status: 'completed' },
                { name: 'Destino', address: 'Ponto de Entrega 1', status: 'pending' }
            ],
            temperatureStatus: 'normal',
            priority: 'medium'
        }
    ];
}

// Inicializar filtros
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const vehicleFilter = document.getElementById('vehicleFilter');
    const dateFilter = document.getElementById('dateFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const refreshBtn = document.getElementById('refreshBtn');
    const newRouteBtn = document.getElementById('newRouteBtn');
    
    statusFilter.value = currentFilters.status;
    vehicleFilter.value = currentFilters.vehicle;
    dateFilter.value = currentFilters.date;
    
    applyFiltersBtn.addEventListener('click', applyFilters);
    refreshBtn.addEventListener('click', refreshData);
    newRouteBtn.addEventListener('click', showNewRouteModal);
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const vehicleFilter = document.getElementById('vehicleFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    currentFilters = {
        status: statusFilter.value,
        vehicle: vehicleFilter.value,
        date: dateFilter.value
    };
    
    console.log('Aplicando filtros:', currentFilters);
    displayRoutes();
    updateMap();
}

// Atualizar cards de resumo
function updateSummaryCards() {
    const activeRoutes = routesData.filter(route => route.status === 'active').length;
    const completedRoutes = routesData.filter(route => route.status === 'completed').length;
    const activeVehicles = routesData.filter(route => 
        route.status === 'active' || route.status === 'scheduled'
    ).length;
    
    // Calcular eficiência (exemplo simplificado)
    const totalCompleted = routesData.filter(route => route.status === 'completed').length;
    const totalScheduled = routesData.filter(route => 
        route.status === 'scheduled' || route.status === 'completed'
    ).length;
    
    const efficiencyRate = totalScheduled > 0 ? 
        Math.round((totalCompleted / totalScheduled) * 100) : 100;
    
    document.getElementById('active-routes').textContent = activeRoutes;
    document.getElementById('completed-routes').textContent = completedRoutes;
    document.getElementById('active-vehicles').textContent = activeVehicles;
    document.getElementById('efficiency-rate').textContent = `${efficiencyRate}%`;
}

// Exibir rotas na lista
function displayRoutes() {
    const routesList = document.getElementById('routesList');
    const routesCount = document.getElementById('routesCount');
    
    // Filtrar rotas
    let filteredRoutes = routesData.filter(route => {
        // Filtro de status
        if (currentFilters.status !== 'all' && route.status !== currentFilters.status) {
            return false;
        }
        
        // Filtro de veículo
        if (currentFilters.vehicle !== 'all' && route.vehicle !== currentFilters.vehicle) {
            return false;
        }
        
        // Filtro de data (implementação básica)
        if (currentFilters.date !== 'all') {
            const today = new Date();
            const routeDate = new Date(route.startTime);
            
            switch(currentFilters.date) {
                case 'today':
                    if (routeDate.toDateString() !== today.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    if (routeDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    if (routeDate < monthAgo) return false;
                    break;
            }
        }
        
        return true;
    });
    
    // Ordenar rotas (ativas primeiro, depois agendadas, concluídas, canceladas)
    const statusOrder = { 'active': 4, 'scheduled': 3, 'completed': 2, 'cancelled': 1 };
    filteredRoutes.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[b.status] - statusOrder[a.status];
        }
        return new Date(b.startTime) - new Date(a.startTime);
    });
    
    // Atualizar contador
    routesCount.textContent = `${filteredRoutes.length} rota${filteredRoutes.length !== 1 ? 's' : ''}`;
    
    // Limpar lista
    routesList.innerHTML = '';
    
    if (filteredRoutes.length === 0) {
        routesList.innerHTML = `
            <div class="no-routes">
                <i class="fas fa-route" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                <p>Nenhuma rota encontrada com os filtros aplicados</p>
            </div>
        `;
        return;
    }
    
    // Adicionar rotas à lista
    filteredRoutes.forEach(route => {
        const routeElement = createRouteElement(route);
        routesList.appendChild(routeElement);
    });
}

// Criar elemento de rota
function createRouteElement(route) {
    const routeElement = document.createElement('div');
    routeElement.className = 'route-item';
    routeElement.setAttribute('data-route-id', route.id);
    
    const statusClass = route.status;
    const timeText = formatRouteTime(route.startTime);
    const distanceText = `${route.distance} km`;
    const durationText = `${route.duration} min`;
    
    routeElement.innerHTML = `
        <div class="route-status ${statusClass}"></div>
        <div class="route-content">
            <div class="route-header">
                <div class="route-id">${route.id}</div>
                <span class="route-badge ${statusClass}">${getStatusText(route.status)}</span>
                ${route.priority === 'high' ? '<span class="route-badge" style="background: rgba(220,53,69,0.1); color: #dc3545;">Alta</span>' : ''}
            </div>
            <div class="route-info">${route.origin} → ${route.destination}</div>
            <div class="route-meta">
                <div class="route-meta-item">
                    <i class="fas fa-truck"></i>
                    <span>${route.vehicle}</span>
                </div>
                <div class="route-meta-item">
                    <i class="fas fa-user"></i>
                    <span>${route.driver}</span>
                </div>
                <div class="route-meta-item">
                    <i class="fas fa-road"></i>
                    <span>${distanceText}</span>
                </div>
                <div class="route-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${timeText}</span>
                </div>
            </div>
        </div>
        <div class="route-actions">
            <button class="btn-action view" title="Ver Detalhes">
                <i class="fas fa-eye"></i>
            </button>
            ${route.status === 'active' ? `
                <button class="btn-action track" title="Acompanhar Rota">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    // Adicionar event listeners
    const viewBtn = routeElement.querySelector('.btn-action.view');
    const trackBtn = routeElement.querySelector('.btn-action.track');
    
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showRouteDetails(route.id);
    });
    
    if (trackBtn) {
        trackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            trackRoute(route.id);
        });
    }
    
    routeElement.addEventListener('click', () => {
        showRouteDetails(route.id);
    });
    
    return routeElement;
}

// Obter texto do status
function getStatusText(status) {
    const texts = {
        'active': 'Ativa',
        'scheduled': 'Agendada',
        'completed': 'Concluída',
        'cancelled': 'Cancelada'
    };
    return texts[status] || status;
}

// Formatar horário da rota
function formatRouteTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Atualizar mapa com as rotas
function updateMap() {
    // Limpar rota atual
    if (currentRouteLayer) {
        map.removeLayer(currentRouteLayer);
        currentRouteLayer = null;
    }
    
    // Encontrar rotas ativas para mostrar no mapa
    const activeRoutes = routesData.filter(route => route.status === 'active');
    
    if (activeRoutes.length > 0) {
        // Mostrar a primeira rota ativa no mapa
        const route = activeRoutes[0];
        showRouteOnMap(route);
    } else {
        // Mostrar mensagem de nenhuma rota ativa
        const bounds = map.getBounds();
        const center = bounds.getCenter();
        
        L.marker(center).addTo(map)
            .bindPopup('Nenhuma rota ativa no momento')
            .openPopup();
    }
}

// Mostrar rota no mapa
function showRouteOnMap(route) {
    if (!route.currentLocation) return;
    
    // Limpar rota anterior
    if (currentRouteLayer) {
        map.removeLayer(currentRouteLayer);
    }
    
    // Adicionar marcador da localização atual
    const currentLocationMarker = L.marker(route.currentLocation)
        .addTo(map)
        .bindPopup(`
            <div class="map-popup">
                <strong>${route.vehicle}</strong><br>
                ${route.driver}<br>
                Rota: ${route.id}<br>
                Status: ${getStatusText(route.status)}<br>
                Progresso: ${route.progress}%
            </div>
        `)
        .openPopup();
    
    // Centralizar mapa na localização atual
    map.setView(route.currentLocation, 13);
    
    currentRouteLayer = currentLocationMarker;
}

// Acompanhar rota
function trackRoute(routeId) {
    const route = routesData.find(r => r.id === routeId);
    if (!route) return;
    
    showRouteOnMap(route);
    showNotification(`Acompanhando rota ${routeId}`, 'success');
}

// Mostrar detalhes da rota
function showRouteDetails(routeId) {
    const route = routesData.find(r => r.id === routeId);
    if (!route) return;
    
    // Preencher modal
    document.getElementById('modal-route-id').textContent = route.id;
    document.getElementById('modal-vehicle').textContent = route.vehicle;
    document.getElementById('modal-driver').textContent = route.driver;
    document.getElementById('modal-status').textContent = getStatusText(route.status);
    document.getElementById('modal-origin').textContent = route.origin;
    document.getElementById('modal-destination').textContent = route.destination;
    document.getElementById('modal-distance').textContent = `${route.distance} km`;
    document.getElementById('modal-duration').textContent = `${route.duration} minutos`;
    document.getElementById('modal-start-time').textContent = new Date(route.startTime).toLocaleString('pt-BR');
    document.getElementById('modal-end-time').textContent = new Date(route.endTime).toLocaleString('pt-BR');
    
    // Atualizar progresso
    const progressFill = document.getElementById('modal-progress-fill');
    const progressText = document.getElementById('modal-progress-text');
    progressFill.style.width = `${route.progress}%`;
    progressText.textContent = `${route.progress}%`;
    
    // Preencher pontos de parada
    const stopsList = document.getElementById('modal-stops-list');
    stopsList.innerHTML = '';
    
    route.stops.forEach((stop, index) => {
        const stopElement = document.createElement('div');
        stopElement.className = 'stop-item';
        stopElement.innerHTML = `
            <div class="stop-marker">${index + 1}</div>
            <div class="stop-content">
                <div class="stop-name">${stop.name}</div>
                <div class="stop-address">${stop.address}</div>
            </div>
            <div class="stop-status ${stop.status}">
                ${stop.status === 'completed' ? 'Concluído' : 'Pendente'}
            </div>
        `;
        stopsList.appendChild(stopElement);
    });
    
    // Configurar botão de acompanhar
    const trackBtn = document.getElementById('trackRoute');
    if (route.status === 'active') {
        trackBtn.style.display = 'flex';
        trackBtn.onclick = () => {
            trackRoute(routeId);
            closeModal();
        };
    } else {
        trackBtn.style.display = 'none';
    }
    
    // Mostrar modal
    document.getElementById('routeModal').classList.add('active');
}

// Fechar modal
function closeModal() {
    document.getElementById('routeModal').classList.remove('active');
}

// Mostrar modal de nova rota
function showNewRouteModal() {
    // Preencher data/hora padrão (próxima hora)
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    
    document.getElementById('routeStart').value = nextHour.toISOString().slice(0, 16);
    
    // Mostrar modal
    document.getElementById('newRouteModal').classList.add('active');
}

// Fechar modal de nova rota
function closeNewRouteModal() {
    document.getElementById('newRouteModal').classList.remove('active');
    document.getElementById('newRouteForm').reset();
    
    // Limpar pontos de parada adicionais
    const stopsContainer = document.getElementById('stopsContainer');
    while (stopsContainer.children.length > 1) {
        stopsContainer.removeChild(stopsContainer.lastChild);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Fechar modais
    const modalClose = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            modal.classList.remove('active');
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
    
    // Controles do mapa
    document.getElementById('zoomIn').addEventListener('click', () => {
        map.zoomIn();
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        map.zoomOut();
    });
    
    document.getElementById('locateMe').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13);
            });
        }
    });
    
    // Formulário nova rota
    document.getElementById('newRouteForm').addEventListener('submit', createNewRoute);
    document.getElementById('addStopBtn').addEventListener('click', addStopField);
}

// Adicionar campo de ponto de parada
function addStopField() {
    const stopsContainer = document.getElementById('stopsContainer');
    const stopCount = stopsContainer.children.length;
    
    const stopItem = document.createElement('div');
    stopItem.className = 'stop-item';
    stopItem.innerHTML = `
        <input type="text" class="form-control stop-input" placeholder="Endereço do ponto de parada" required>
        <button type="button" class="btn-remove-stop">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    stopsContainer.appendChild(stopItem);
    
    // Adicionar evento de remover
    const removeBtn = stopItem.querySelector('.btn-remove-stop');
    removeBtn.addEventListener('click', () => {
        stopsContainer.removeChild(stopItem);
    });
    
    // Habilitar botão de remover do primeiro item se houver mais de um
    if (stopsContainer.children.length > 1) {
        const firstRemoveBtn = stopsContainer.children[0].querySelector('.btn-remove-stop');
        firstRemoveBtn.disabled = false;
    }
}

// Criar nova rota
function createNewRoute(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const stops = Array.from(document.querySelectorAll('.stop-input'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
    
    // Gerar ID único para nova rota
    const newRouteId = 'RT' + String(routesData.length + 1).padStart(3, '0');
    
    const newRoute = {
        id: newRouteId,
        vehicle: document.getElementById('routeVehicle').value,
        driver: document.getElementById('routeDriver').value,
        status: 'scheduled',
        origin: document.getElementById('routeOrigin').value,
        destination: document.getElementById('routeDestination').value,
        distance: Math.round(Math.random() * 50 + 10), // Distância aleatória para exemplo
        duration: Math.round(Math.random() * 60 + 20), // Duração aleatória para exemplo
        progress: 0,
        startTime: new Date(document.getElementById('routeStart').value),
        endTime: new Date(new Date(document.getElementById('routeStart').value).getTime() + 60 * 60 * 1000), // +1 hora
        currentLocation: null,
        stops: stops.map((stop, index) => ({
            name: `Parada ${index + 1}`,
            address: stop,
            status: 'pending'
        })),
        temperatureStatus: 'normal',
        priority: document.getElementById('routePriority').value,
        description: document.getElementById('routeDescription').value
    };
    
    // Adicionar nova rota
    routesData.unshift(newRoute);
    
    // Atualizar interface
    updateSummaryCards();
    displayRoutes();
    
    // Fechar modal e mostrar confirmação
    closeNewRouteModal();
    showNotification('Rota criada com sucesso!', 'success');
    
    console.log('Nova rota criada:', newRoute);
}

// Atualizar dados
async function refreshData() {
    showLoading();
    try {
        await loadRoutesData();
        updateSummaryCards();
        displayRoutes();
        updateMap();
        hideLoading();
        showNotification('Dados atualizados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        hideLoading();
        showNotification('Erro ao atualizar dados', 'error');
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Mostrar com animação
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Evento de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Atualização em tempo real
function startRealTimeUpdates() {
    setInterval(async () => {
        try {
            console.log('Atualizando rotas em tempo real...');
            
            // Simular atualização de localização para rotas ativas
            routesData.forEach(route => {
                if (route.status === 'active' && route.currentLocation) {
                    // Pequena variação na localização para simular movimento
                    const latVariation = (Math.random() - 0.5) * 0.01;
                    const lngVariation = (Math.random() - 0.5) * 0.01;
                    
                    route.currentLocation[0] += latVariation;
                    route.currentLocation[1] += lngVariation;
                    
                    // Atualizar progresso
                    if (route.progress < 100) {
                        route.progress = Math.min(100, route.progress + Math.random() * 5);
                    }
                }
            });
            
            updateSummaryCards();
            displayRoutes();
            updateMap();
            
        } catch (error) {
            console.error('Erro na atualização em tempo real:', error);
        }
    }, 30000); // Atualizar a cada 30 segundos
}

// Iniciar atualizações em tempo real após um delay
setTimeout(startRealTimeUpdates, 10000);

// Adicionar estilos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 15px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10000;
        border-left: 4px solid var(--info);
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        border-left-color: var(--accent4);
    }
    
    .notification-error {
        border-left-color: var(--accent2);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-success .notification-content i {
        color: var(--accent4);
    }
    
    .notification-error .notification-content i {
        color: var(--accent2);
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--gray);
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .no-routes {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: var(--gray);
        text-align: center;
    }
    
    .map-popup {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .map-popup strong {
        color: var(--primary);
    }
`;

document.head.appendChild(notificationStyles);