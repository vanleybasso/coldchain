// Variáveis globais
let alertsData = [];
let currentFilters = {
    status: 'all',
    severity: 'all',
    vehicle: 'all'
};

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
    console.log('Inicializando página de alertas...');
    
    showLoading();
    
    try {
        // Carregar dados
        await loadAlertsData();
        
        // Inicializar componentes
        initializeFilters();
        updateSummaryCards();
        displayAlerts();
        
        // Configurar event listeners
        setupEventListeners();
        
        hideLoading();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        hideLoading();
    }
});

// Carregar dados dos alertas
async function loadAlertsData() {
    try {
        console.log('Carregando dados dos sensores para gerar alertas...');
        
        // Carregar dados dos sensores
        const response = await fetch('./sensor_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sensorData = await response.json();
        console.log('Dados dos sensores carregados:', sensorData);
        
        // Gerar alertas baseados nos dados dos sensores
        alertsData = generateAlertsFromSensorData(sensorData);
        console.log('Alertas gerados:', alertsData);
        
    } catch (error) {
        console.error('Erro ao carregar dados dos alertas:', error);
        // Usar dados de fallback
        alertsData = getFallbackAlerts();
    }
}

// Gerar alertas baseados nos dados dos sensores
function generateAlertsFromSensorData(sensorData) {
    const alerts = [];
    const now = new Date();
    
    // Mapeamento de sensores para nomes amigáveis
    const sensorNames = {
        'externo': 'Sensor Externo',
        'principal': 'Sensor Principal',
        'meio': 'Sensor do Meio',
        'porta': 'Sensor da Porta',
        'fundo': 'Sensor do Fundo',
        'piso': 'Sensor do Piso',
        'teto': 'Sensor do Teto'
    };
    
    // Verificar cada sensor
    Object.entries(sensorData).forEach(([sensorId, sensor]) => {
        // Ignorar sensores não configurados
        if (sensor.temperature === 0.0) {
            return;
        }
        
        const temperature = sensor.temperature;
        let severity = 'info';
        let description = '';
        
        // Determinar gravidade baseada na temperatura
        if (sensorId === 'externo') {
            // Sensor externo - alertas diferentes
            if (temperature > 35) {
                severity = 'critical';
                description = 'Temperatura externa muito alta';
            } else if (temperature > 30) {
                severity = 'warning';
                description = 'Temperatura externa elevada';
            } else {
                return; // Não criar alerta para temperatura externa normal
            }
        } else {
            // Sensores internos
            if (temperature > 7) {
                severity = 'critical';
                description = 'Temperatura crítica na carga';
            } else if (temperature > 5) {
                severity = 'warning';
                description = 'Temperatura acima do ideal';
            } else if (temperature < 2) {
                severity = 'warning';
                description = 'Temperatura abaixo do ideal';
            } else {
                return; // Não criar alerta para temperatura normal
            }
        }
        
        // Criar alerta
        const alert = {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: sensorNames[sensorId],
            sensorId: sensorId,
            severity: severity,
            temperature: temperature,
            description: description,
            timestamp: new Date(sensor.last_read || now).toISOString(),
            status: 'active',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: new Date(sensor.last_read || now).toISOString()
                }
            ]
        };
        
        alerts.push(alert);
    });
    
    // Adicionar alguns alertas de sistema (para demonstração)
    alerts.push(...getSystemAlerts());
    
    return alerts;
}

// Gerar ID único para alerta
function generateAlertId() {
    return 'ALT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Alertas de sistema (para demonstração)
function getSystemAlerts() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    return [
        {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: 'Sistema',
            sensorId: 'system',
            severity: 'info',
            temperature: null,
            description: 'Veículo em movimento - monitoramento ativo',
            timestamp: oneHourAgo.toISOString(),
            status: 'active',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: oneHourAgo.toISOString()
                }
            ]
        },
        {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: 'Refrigerador',
            sensorId: 'refrigerator',
            severity: 'warning',
            temperature: null,
            description: 'Consumo de energia acima do normal',
            timestamp: twoHoursAgo.toISOString(),
            status: 'resolved',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: twoHoursAgo.toISOString()
                },
                {
                    action: 'Alerta resolvido',
                    user: 'Operador',
                    timestamp: oneHourAgo.toISOString()
                }
            ]
        }
    ];
}

// Dados de fallback para alertas
function getFallbackAlerts() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    return [
        {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: 'Sensor da Porta',
            sensorId: 'porta',
            severity: 'critical',
            temperature: 6.8,
            description: 'Temperatura crítica na carga',
            timestamp: now.toISOString(),
            status: 'active',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: now.toISOString()
                }
            ]
        },
        {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: 'Sistema',
            sensorId: 'system',
            severity: 'info',
            temperature: null,
            description: 'Veículo em movimento - monitoramento ativo',
            timestamp: oneHourAgo.toISOString(),
            status: 'active',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: oneHourAgo.toISOString()
                }
            ]
        },
        {
            id: generateAlertId(),
            vehicle: 'KG8000003',
            sensor: 'Refrigerador',
            sensorId: 'refrigerator',
            severity: 'warning',
            temperature: null,
            description: 'Consumo de energia acima do normal',
            timestamp: twoHoursAgo.toISOString(),
            status: 'resolved',
            history: [
                {
                    action: 'Alerta criado',
                    user: 'Sistema',
                    timestamp: twoHoursAgo.toISOString()
                },
                {
                    action: 'Alerta resolvido',
                    user: 'Operador',
                    timestamp: oneHourAgo.toISOString()
                }
            ]
        }
    ];
}

// Inicializar filtros
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const vehicleFilter = document.getElementById('vehicleFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    statusFilter.value = currentFilters.status;
    severityFilter.value = currentFilters.severity;
    vehicleFilter.value = currentFilters.vehicle;
    
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const vehicleFilter = document.getElementById('vehicleFilter');
    
    currentFilters = {
        status: statusFilter.value,
        severity: severityFilter.value,
        vehicle: vehicleFilter.value
    };
    
    console.log('Aplicando filtros:', currentFilters);
    displayAlerts();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('severityFilter').value = 'all';
    document.getElementById('vehicleFilter').value = 'all';
    
    currentFilters = {
        status: 'all',
        severity: 'all',
        vehicle: 'all'
    };
    
    displayAlerts();
}

// Atualizar cards de resumo
function updateSummaryCards() {
    const criticalAlerts = alertsData.filter(alert => 
        alert.severity === 'critical' && alert.status === 'active'
    ).length;
    
    const warningAlerts = alertsData.filter(alert => 
        alert.severity === 'warning' && alert.status === 'active'
    ).length;
    
    const totalAlerts = alertsData.length;
    
    const resolvedAlerts = alertsData.filter(alert => 
        alert.status === 'resolved'
    ).length;
    
    document.getElementById('critical-alerts').textContent = criticalAlerts;
    document.getElementById('warning-alerts').textContent = warningAlerts;
    document.getElementById('total-alerts').textContent = totalAlerts;
    document.getElementById('resolved-alerts').textContent = resolvedAlerts;
}

// Exibir alertas na lista
function displayAlerts() {
    const alertsList = document.getElementById('alertsList');
    const alertsCount = document.getElementById('alertsCount');
    
    // Filtrar alertas
    let filteredAlerts = alertsData.filter(alert => {
        // Filtro de status
        if (currentFilters.status !== 'all' && alert.status !== currentFilters.status) {
            return false;
        }
        
        // Filtro de gravidade
        if (currentFilters.severity !== 'all' && alert.severity !== currentFilters.severity) {
            return false;
        }
        
        // Filtro de veículo
        if (currentFilters.vehicle !== 'all' && alert.vehicle !== currentFilters.vehicle) {
            return false;
        }
        
        return true;
    });
    
    // Ordenar alertas (ativos primeiro, depois por gravidade e data)
    filteredAlerts.sort((a, b) => {
        // Ativos primeiro
        if (a.status !== b.status) {
            return a.status === 'active' ? -1 : 1;
        }
        
        // Por gravidade (crítico > warning > info)
        const severityOrder = { 'critical': 3, 'warning': 2, 'info': 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[b.severity] - severityOrder[a.severity];
        }
        
        // Por data (mais recente primeiro)
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Atualizar contador
    alertsCount.textContent = `${filteredAlerts.length} alerta${filteredAlerts.length !== 1 ? 's' : ''}`;
    
    // Limpar lista
    alertsList.innerHTML = '';
    
    if (filteredAlerts.length === 0) {
        alertsList.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success); margin-bottom: 15px;"></i>
                <p>Nenhum alerta encontrado com os filtros aplicados</p>
            </div>
        `;
        return;
    }
    
    // Adicionar alertas à lista
    filteredAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.appendChild(alertElement);
    });
}

// Criar elemento de alerta
function createAlertElement(alert) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${alert.status === 'resolved' ? 'resolved' : ''}`;
    alertElement.setAttribute('data-alert-id', alert.id);
    
    const severityClass = alert.severity;
    const statusClass = alert.status;
    
    const timeAgo = getTimeAgo(alert.timestamp);
    const temperatureText = alert.temperature !== null ? `${alert.temperature}°C` : 'N/A';
    
    alertElement.innerHTML = `
        <div class="alert-severity ${severityClass}"></div>
        <div class="alert-content">
            <div class="alert-header">
                <div class="alert-title">${alert.sensor}</div>
                <span class="alert-badge ${severityClass}">${getSeverityText(alert.severity)}</span>
                <span class="alert-badge ${statusClass}">${getStatusText(alert.status)}</span>
            </div>
            <div class="alert-description">${alert.description}</div>
            <div class="alert-meta">
                <div class="alert-meta-item">
                    <i class="fas fa-truck"></i>
                    <span>${alert.vehicle}</span>
                </div>
                <div class="alert-meta-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>${temperatureText}</span>
                </div>
                <div class="alert-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${timeAgo}</span>
                </div>
            </div>
        </div>
        <div class="alert-actions">
            <button class="btn-action view" title="Ver Detalhes">
                <i class="fas fa-eye"></i>
            </button>
            ${alert.status === 'active' ? `
                <button class="btn-action resolve" title="Resolver Alerta">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    // Adicionar event listeners
    const viewBtn = alertElement.querySelector('.btn-action.view');
    const resolveBtn = alertElement.querySelector('.btn-action.resolve');
    
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAlertDetails(alert.id);
    });
    
    if (resolveBtn) {
        resolveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resolveAlert(alert.id);
        });
    }
    
    alertElement.addEventListener('click', () => {
        showAlertDetails(alert.id);
    });
    
    return alertElement;
}

// Obter texto da gravidade
function getSeverityText(severity) {
    const texts = {
        'critical': 'Crítico',
        'warning': 'Atenção',
        'info': 'Informação'
    };
    return texts[severity] || severity;
}

// Obter texto do status
function getStatusText(status) {
    const texts = {
        'active': 'Ativo',
        'resolved': 'Resolvido'
    };
    return texts[status] || status;
}

// Calcular tempo relativo
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Agora mesmo';
    } else if (diffMins < 60) {
        return `Há ${diffMins} min`;
    } else if (diffHours < 24) {
        return `Há ${diffHours} h`;
    } else {
        return `Há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
    }
}

// Mostrar detalhes do alerta
function showAlertDetails(alertId) {
    const alert = alertsData.find(a => a.id === alertId);
    if (!alert) return;
    
    // Preencher modal
    document.getElementById('modal-vehicle').textContent = alert.vehicle;
    document.getElementById('modal-sensor').textContent = alert.sensor;
    document.getElementById('modal-severity').textContent = getSeverityText(alert.severity);
    document.getElementById('modal-temperature').textContent = alert.temperature !== null ? `${alert.temperature}°C` : 'N/A';
    document.getElementById('modal-status').textContent = getStatusText(alert.status);
    document.getElementById('modal-timestamp').textContent = new Date(alert.timestamp).toLocaleString('pt-BR');
    document.getElementById('modal-description').textContent = alert.description;
    
    // Preencher histórico
    const historyList = document.getElementById('modal-history');
    historyList.innerHTML = '';
    
    alert.history.forEach(historyItem => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.innerHTML = `
            <div class="history-time">${new Date(historyItem.timestamp).toLocaleTimeString('pt-BR')}</div>
            <div class="history-action">${historyItem.action}</div>
            <div class="history-user">${historyItem.user}</div>
        `;
        historyList.appendChild(historyElement);
    });
    
    // Configurar botão de resolver
    const resolveBtn = document.getElementById('resolveAlert');
    if (alert.status === 'active') {
        resolveBtn.style.display = 'flex';
        resolveBtn.onclick = () => resolveAlert(alertId);
    } else {
        resolveBtn.style.display = 'none';
    }
    
    // Mostrar modal
    document.getElementById('alertModal').classList.add('active');
}

// Resolver alerta
function resolveAlert(alertId) {
    const alertIndex = alertsData.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return;
    
    const now = new Date();
    
    alertsData[alertIndex].status = 'resolved';
    alertsData[alertIndex].history.push({
        action: 'Alerta resolvido',
        user: 'Usuário',
        timestamp: now.toISOString()
    });
    
    // Atualizar interface
    updateSummaryCards();
    displayAlerts();
    closeModal();
    
    // Mostrar confirmação
    showNotification('Alerta resolvido com sucesso!', 'success');
}

// Fechar modal
function closeModal() {
    document.getElementById('alertModal').classList.remove('active');
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

// Configurar event listeners
function setupEventListeners() {
    // Fechar modal
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.getElementById('alertModal');
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Atualizar alertas
    const refreshBtn = document.getElementById('refreshAlerts');
    refreshBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await loadAlertsData();
            updateSummaryCards();
            displayAlerts();
            hideLoading();
            showNotification('Alertas atualizados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar alertas:', error);
            hideLoading();
            showNotification('Erro ao atualizar alertas', 'error');
        }
    });
    
    // Exportar alertas
    const exportBtn = document.getElementById('exportAlerts');
    exportBtn.addEventListener('click', exportAlerts);
}

// Exportar alertas
function exportAlerts() {
    const exportData = {
        timestamp: new Date().toISOString(),
        filters: currentFilters,
        alerts: alertsData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Criar link de download
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alertas-rotasystem-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Alertas exportados com sucesso!', 'success');
}

// Atualização em tempo real
function startRealTimeUpdates() {
    setInterval(async () => {
        try {
            console.log('Atualizando alertas em tempo real...');
            await loadAlertsData();
            updateSummaryCards();
            displayAlerts();
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
        border-left-color: var(--success);
    }
    
    .notification-error {
        border-left-color: var(--critical);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-success .notification-content i {
        color: var(--success);
    }
    
    .notification-error .notification-content i {
        color: var(--critical);
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
    
    .no-alerts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: var(--gray);
        text-align: center;
    }
`;

document.head.appendChild(notificationStyles);