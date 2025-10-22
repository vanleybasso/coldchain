// Variáveis globais
let appData = {};
let currentPage = 1;
const itemsPerPage = 5;
let alertCounter = 10; // Contador para novos alertas

// Dados de exemplo para os alertas
const alertData = {
    1: {
        priority: "critical",
        status: "active",
        time: "15 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 14:25",
        vehicle: "VLC-2087",
        type: "Temperatura",
        description: "Sensor Principal: Temperatura crítica: 8.1°C detectada no compartimento de refrigeração. Excede o limite máximo de 5°C.",
        code: "ALT-20230910-001",
        location: "Zona Norte - Av. Principal, 1234",
        route: "Centro de Distribuição → Supermercado Central",
        updated: "2 minutos atrás",
        history: [
            "14:25 - Alerta detectado pelo sistema",
            "14:28 - Notificação enviada para o motorista",
            "14:30 - Operador notificado"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "8.1°C", status: "Crítico", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "9.2°C", status: "Crítico", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "7.8°C", status: "Atenção", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "7.5°C", status: "Atenção", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "8.3°C", status: "Crítico", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "24.7°C", status: "Normal", location: "Externo" }
        ]
    },
    2: {
        priority: "high",
        status: "active",
        time: "20 minutos",
        assigned: "Não atribuído",
        datetime: "10/09/2023 14:20",
        vehicle: "VLC-3054",
        type: "Temperatura",
        description: "Sensor da Porta: Temperatura elevada: 6.3°C detectada. Aproximando-se do limite crítico.",
        code: "ALT-20230910-002",
        location: "Zona Leste - Rua das Flores, 567",
        route: "Centro de Distribuição → Restaurante Estrela",
        updated: "5 minutos atrás",
        history: [
            "14:20 - Alerta detectado pelo sistema",
            "14:22 - Notificação enviada para o motorista"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "5.8°C", status: "Atenção", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "6.3°C", status: "Atenção", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "5.5°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "5.7°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "6.1°C", status: "Atenção", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "26.2°C", status: "Normal", location: "Externo" }
        ]
    },
    3: {
        priority: "medium",
        status: "active",
        time: "22 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 14:18",
        vehicle: "VLC-5021",
        type: "Temperatura",
        description: "Sensor do Fundo: Temperatura baixa: 1.2°C detectada. Abaixo do limite mínimo recomendado.",
        code: "ALT-20230910-003",
        location: "Zona Sul - Av. Industrial, 789",
        route: "Centro de Distribuição → Frigorífico Central",
        updated: "8 minutos atrás",
        history: [
            "14:18 - Alerta detectado pelo sistema",
            "14:20 - Notificação enviada para o motorista"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "2.1°C", status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "3.5°C", status: "Normal", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "1.2°C", status: "Atenção", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "2.8°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "1.8°C", status: "Atenção", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "18.5°C", status: "Normal", location: "Externo" }
        ]
    },
    4: {
        priority: "high",
        status: "resolved",
        time: "45 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 13:45",
        vehicle: "VLC-1023",
        type: "Temperatura",
        description: "Sensor do Teto: Temperatura fora dos limites: 9.2°C. Problema resolvido após ajuste do sistema.",
        code: "ALT-20230910-004",
        location: "Zona Oeste - Rua Comercial, 456",
        route: "Centro de Distribuição → Shopping Norte",
        updated: "15 minutos atrás",
        history: [
            "13:45 - Alerta detectado pelo sistema",
            "13:48 - Notificação enviada para o motorista",
            "13:50 - Operador notificado",
            "14:00 - Sistema ajustado manualmente",
            "14:05 - Temperatura estabilizada em 3.2°C",
            "14:10 - Alerta resolvido"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "3.2°C", status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "3.5°C", status: "Normal", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "3.1°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "3.3°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "3.0°C", status: "Normal", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "22.8°C", status: "Normal", location: "Externo" }
        ]
    },
    5: {
        priority: "medium",
        status: "resolved",
        time: "60 minutos",
        assigned: "Não atribuído",
        datetime: "10/09/2023 13:30",
        vehicle: "VLC-4098",
        type: "Temperatura",
        description: "Sensor do Piso: Variação de temperatura anômala detectada. Estabilizada após verificação.",
        code: "ALT-20230910-005",
        location: "Centro - Av. Central, 101",
        route: "Centro de Distribuição → Hospital Municipal",
        updated: "25 minutos atrás",
        history: [
            "13:30 - Alerta detectado pelo sistema",
            "13:35 - Variação de ±2°C identificada",
            "13:45 - Sistema auto-ajustado",
            "13:50 - Temperatura estabilizada",
            "14:00 - Alerta resolvido"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "4.1°C", status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "4.3°C", status: "Normal", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "4.0°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "4.2°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "4.1°C", status: "Normal", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "25.1°C", status: "Normal", location: "Externo" }
        ]
    },
    6: {
        priority: "critical",
        status: "active",
        time: "10 minutos",
        assigned: "Não atribuído",
        datetime: "10/09/2023 15:10",
        vehicle: "VLC-2087",
        type: "Temperatura",
        description: "Sistema de refrigeração com falha - Temperatura: 10.2°C. Intervenção urgente necessária.",
        code: "ALT-20230910-006",
        location: "Zona Norte - Rodovia BR-101, km 45",
        route: "Centro de Distribuição → Supermercado Central",
        updated: "2 minutos atrás",
        history: [
            "15:10 - Alerta crítico detectado",
            "15:11 - Notificação de emergência enviada",
            "15:12 - Supervisor notificado"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "10.2°C", status: "Crítico", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "11.5°C", status: "Crítico", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "9.8°C", status: "Crítico", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "10.1°C", status: "Crítico", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "10.5°C", status: "Crítico", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "28.3°C", status: "Normal", location: "Externo" }
        ]
    },
    7: {
        priority: "high",
        status: "active",
        time: "17 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 15:03",
        vehicle: "VLC-3054",
        type: "Temperatura",
        description: "Porta do compartimento aberta - Temperatura subindo rapidamente: 7.8°C.",
        code: "ALT-20230910-007",
        location: "Zona Leste - Rua dos Mercados, 234",
        route: "Centro de Distribuição → Restaurante Estrela",
        updated: "3 minutos atrás",
        history: [
            "15:03 - Alerta de porta aberta detectado",
            "15:05 - Motorista notificado",
            "15:07 - Temperatura em ascensão rápida",
            "15:10 - Operador assumiu o caso"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "7.8°C", status: "Crítico", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "12.3°C", status: "Crítico", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "7.2°C", status: "Atenção", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "7.5°C", status: "Atenção", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "8.1°C", status: "Crítico", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "27.9°C", status: "Normal", location: "Externo" }
        ]
    },
    8: {
        priority: "medium",
        status: "active",
        time: "30 minutos",
        assigned: "Não atribuído",
        datetime: "10/09/2023 14:50",
        vehicle: "VLC-1023",
        type: "Temperatura",
        description: "Flutuação de temperatura constante detectada: variação de ±1.5°C.",
        code: "ALT-20230910-008",
        location: "Zona Oeste - Av. Comercial, 567",
        route: "Centro de Distribuição → Shopping Norte",
        updated: "10 minutos atrás",
        history: [
            "14:50 - Padrão de flutuação detectado",
            "14:55 - Análise automática iniciada",
            "15:00 - Padrão persistente identificado"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "4.8°C", status: "Atenção", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "5.2°C", status: "Atenção", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "4.5°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "4.9°C", status: "Atenção", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "5.1°C", status: "Atenção", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "26.5°C", status: "Normal", location: "Externo" }
        ]
    },
    9: {
        priority: "low",
        status: "active",
        time: "40 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 14:40",
        vehicle: "VLC-4098",
        type: "Temperatura",
        description: "Temperatura próxima do limite superior: 4.8°C. Monitoramento preventivo.",
        code: "ALT-20230910-009",
        location: "Centro - Rua Hospitalar, 303",
        route: "Centro de Distribuição → Hospital Municipal",
        updated: "15 minutos atrás",
        history: [
            "14:40 - Alerta preventivo gerado",
            "14:45 - Monitoramento intensificado",
            "14:50 - Situação estável"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "4.8°C", status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "5.1°C", status: "Atenção", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "4.6°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "4.7°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "4.9°C", status: "Normal", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "24.8°C", status: "Normal", location: "Externo" }
        ]
    },
    10: {
        priority: "high",
        status: "resolved",
        time: "55 minutos",
        assigned: "Operador",
        datetime: "10/09/2023 14:15",
        vehicle: "VLC-5021",
        type: "Temperatura",
        description: "Falha temporária no sensor principal - Agora estabilizado em 3.5°C.",
        code: "ALT-20230910-010",
        location: "Zona Sul - Av. Industrial, 890",
        route: "Centro de Distribuição → Frigorífico Central",
        updated: "20 minutos atrás",
        history: [
            "14:15 - Falha de sensor detectada",
            "14:20 - Sensor secundário ativado",
            "14:25 - Diagnóstico realizado",
            "14:35 - Sensor recuperado",
            "14:40 - Leitura normalizada",
            "14:45 - Alerta resolvido"
        ],
        sensors: [
            { id: 1, name: "Sensor Principal", value: "3.5°C", status: "Normal", location: "Centro da carga" },
            { id: 2, name: "Sensor da Porta", value: "3.7°C", status: "Normal", location: "Perto da porta" },
            { id: 3, name: "Sensor do Fundo", value: "3.4°C", status: "Normal", location: "Fundo do veículo" },
            { id: 4, name: "Sensor do Teto", value: "3.6°C", status: "Normal", location: "Teto traseiro" },
            { id: 5, name: "Sensor do Piso", value: "3.3°C", status: "Normal", location: "Piso dianteiro" },
            { id: 6, name: "Sensor Externo", value: "23.2°C", status: "Normal", location: "Externo" }
        ]
    }
};

// Dados para a tabela - COM 10 ALERTAS
const tableData = [
    { id: 1, datetime: "10/09/2023 14:25", vehicle: "VLC-2087", type: "Temperatura", description: "Sensor Principal: Temperatura crítica: 8.1°C", priority: "critical", status: "active", class: "critical" },
    { id: 2, datetime: "10/09/2023 14:20", vehicle: "VLC-3054", type: "Temperatura", description: "Sensor da Porta: Temperatura elevada: 6.3°C", priority: "high", status: "active", class: "warning" },
    { id: 3, datetime: "10/09/2023 14:18", vehicle: "VLC-5021", type: "Temperatura", description: "Sensor do Fundo: Temperatura baixa: 1.2°C", priority: "medium", status: "active", class: "warning" },
    { id: 4, datetime: "10/09/2023 13:45", vehicle: "VLC-1023", type: "Temperatura", description: "Sensor do Teto: Temperatura fora dos limites: 9.2°C", priority: "high", status: "resolved", class: "info" },
    { id: 5, datetime: "10/09/2023 13:30", vehicle: "VLC-4098", type: "Temperatura", description: "Sensor do Piso: Variação de temperatura anômala", priority: "medium", status: "resolved", class: "info" },
    { id: 6, datetime: "10/09/2023 15:10", vehicle: "VLC-2087", type: "Temperatura", description: "Sistema de refrigeração com falha - Temperatura: 10.2°C", priority: "critical", status: "active", class: "critical" },
    { id: 7, datetime: "10/09/2023 15:03", vehicle: "VLC-3054", type: "Temperatura", description: "Porta do compartimento aberta - Temperatura subindo rapidamente", priority: "high", status: "active", class: "warning" },
    { id: 8, datetime: "10/09/2023 14:50", vehicle: "VLC-1023", type: "Temperatura", description: "Flutuação de temperatura constante detectada", priority: "medium", status: "active", class: "warning" },
    { id: 9, datetime: "10/09/2023 14:40", vehicle: "VLC-4098", type: "Temperatura", description: "Temperatura próxima do limite superior: 4.8°C", priority: "low", status: "active", class: "info" },
    { id: 10, datetime: "10/09/2023 14:15", vehicle: "VLC-5021", type: "Temperatura", description: "Falha temporária no sensor principal - Agora estabilizado", priority: "high", status: "resolved", class: "info" }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação de alertas...');
    initializeApp();
});

// Função para inicializar a aplicação
function initializeApp() {
    console.log('Inicializando aplicação de alertas...');
    setupEventListeners();
    populateAlertTable();
    setupPagination();
    
    // Atualizar os cards de resumo
    updateAlertOverview();
    
    // Iniciar simulação de novos alertas após 5 segundos
    setTimeout(simulateNewAlerts, 5000);
}

// Atualizar os cards de resumo
function updateAlertOverview() {
    const criticalAlerts = tableData.filter(alert => alert.priority === 'critical' && alert.status === 'active').length;
    const warningAlerts = tableData.filter(alert => 
        (alert.priority === 'high' || alert.priority === 'medium') && alert.status === 'active'
    ).length;
    const resolvedAlerts = tableData.filter(alert => alert.status === 'resolved').length;
    
    // Atualizar os valores nos cards
    document.querySelector('.alert-card.critical .alert-card-value').textContent = `${criticalAlerts} Alertas`;
    document.querySelector('.alert-card.warning .alert-card-value').textContent = `${warningAlerts} Alertas`;
    document.querySelector('.alert-card.info .alert-card-value').textContent = `${resolvedAlerts} Alertas`;
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botões
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const newAlertBtn = document.getElementById('newAlertBtn');
    const exportBtn = document.getElementById('exportBtn');
    const resolveAllBtn = document.getElementById('resolveAllBtn');
    const muteAlertsBtn = document.getElementById('muteAlertsBtn');
    
    // Event listeners para botões
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    if (newAlertBtn) newAlertBtn.addEventListener('click', createNewAlert);
    if (exportBtn) exportBtn.addEventListener('click', exportAlerts);
    if (resolveAllBtn) resolveAllBtn.addEventListener('click', resolveAllAlerts);
    if (muteAlertsBtn) muteAlertsBtn.addEventListener('click', toggleMuteAlerts);
    
    // Filtros em tempo real
    const filterForm = document.getElementById('filterForm');
    if (filterForm) filterForm.addEventListener('input', applyFilters);
    
    // Modal functionality
    const modal = document.getElementById('alertDetailsModal');
    const closeModalBtn = document.querySelector('.modal-close');
    const closeModalBtn2 = document.getElementById('modal-close-btn');
    const resolveBtn = document.getElementById('modal-resolve-btn');
    const assignBtn = document.getElementById('modal-assign-btn');
    
    // Adiciona eventos para fechar o modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAlertModal);
    if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeAlertModal);
    if (resolveBtn) resolveBtn.addEventListener('click', resolveAlert);
    if (assignBtn) assignBtn.addEventListener('click', assignAlert);
    
    // Fecha o modal ao clicar fora dele
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAlertModal();
            }
        });
    }
    
    // Fecha o modal com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('alertDetailsModal');
            if (modal && modal.classList.contains('active')) {
                closeAlertModal();
            }
        }
    });
}

// Popular a tabela de alertas
function populateAlertTable() {
    const tableBody = document.getElementById('alertTableBody');
    if (!tableBody) {
        console.error('Elemento alertTableBody não encontrado!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Aplicar filtros
    const filteredAlerts = applyFiltersToData(tableData);
    
    console.log('Alertas filtrados:', filteredAlerts.length);
    
    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
    if (paginatedAlerts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #777;">
                    <i class="fas fa-bell-slash" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    Nenhum alerta encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedAlerts.forEach(alert => {
        const tr = document.createElement('tr');
        tr.className = alert.class;
        tr.setAttribute('data-id', alert.id);
        
        const priorityClass = getPriorityClass(alert.priority);
        const priorityText = getPriorityText(alert.priority);
        const statusClass = alert.status === 'active' ? (alert.priority === 'critical' ? 'critical' : 'warning') : 'resolved';
        const statusText = alert.status === 'active' ? 'Ativo' : 'Resolvido';
        
        tr.innerHTML = `
            <td>${alert.datetime}</td>
            <td>${alert.vehicle}</td>
            <td>${alert.type}</td>
            <td>${alert.description}</td>
            <td><span class="priority-indicator ${priorityClass}"></span> ${priorityText}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${alert.status === 'active' ? '<button class="btn-action resolve" title="Resolver"><i class="fas fa-check"></i></button>' : ''}
                    <button class="btn-action view" title="Visualizar"><i class="fas fa-eye"></i></button>
                    ${alert.status === 'resolved' ? '<button class="btn-action delete" title="Excluir"><i class="fas fa-trash"></i></button>' : ''}
                </div>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
    
    // Atualizar contador
    updateAlertCount(filteredAlerts.length);
    
    // Configurar botões de ação
    setupActionButtons();
}

// Configurar botões de ação - CORRIGIDA
function setupActionButtons() {
    console.log('Configurando botões de ação...');
    
    // Visualizar detalhes
    const viewButtons = document.querySelectorAll('.btn-action.view');
    console.log('Encontrados', viewButtons.length, 'botões de visualização');
    
    viewButtons.forEach(button => {
        // Remove event listeners anteriores para evitar duplicação
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Re-seleciona os botões após o clone
    const newViewButtons = document.querySelectorAll('.btn-action.view');
    
    newViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const id = row.getAttribute('data-id');
            console.log('Clicou no botão visualizar, ID:', id);
            openAlertModal(id);
        });
    });
    
    // Resolver alerta
    const resolveButtons = document.querySelectorAll('.btn-action.resolve');
    resolveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const alertRow = this.closest('tr');
            const alertId = alertRow.getAttribute('data-id');
            resolveAlertById(alertId, alertRow);
        });
    });
    
    // Excluir alerta
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const alertRow = this.closest('tr');
            const alertId = alertRow.getAttribute('data-id');
            deleteAlert(alertId, alertRow);
        });
    });
}

// Configurar paginação
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const filteredAlerts = applyFiltersToData(tableData);
    const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    const prevButton = document.createElement('div');
    prevButton.className = 'pagination-item';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            populateAlertTable();
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
            populateAlertTable();
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
            populateAlertTable();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Aplicar filtros aos dados
function applyFiltersToData(alerts) {
    const priorityFilter = document.getElementById('priority')?.value || '';
    const statusFilter = document.getElementById('status')?.value || '';
    const typeFilter = document.getElementById('type')?.value || '';
    
    console.log('Filtros aplicados:', { priorityFilter, statusFilter, typeFilter });
    
    return alerts.filter(alert => {
        // Filtro de prioridade
        if (priorityFilter && alert.priority !== priorityFilter) {
            return false;
        }
        
        // Filtro de status
        if (statusFilter && alert.status !== statusFilter) {
            return false;
        }
        
        // Filtro de tipo
        if (typeFilter) {
            // Se o filtro for "temperature", mostra apenas alertas do tipo "Temperatura"
            if (typeFilter === 'temperature' && alert.type !== 'Temperatura') {
                return false;
            }
            // Para outros tipos de filtro, compara normalmente
            else if (typeFilter !== 'temperature' && alert.type.toLowerCase() !== typeFilter.toLowerCase()) {
                return false;
            }
        }
        
        return true;
    });
}

// Obter classe de prioridade
function getPriorityClass(priority) {
    switch(priority) {
        case 'critical': return 'priority-critical';
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-medium';
    }
}

// Obter texto de prioridade
function getPriorityText(priority) {
    switch(priority) {
        case 'critical': return 'Crítico';
        case 'high': return 'Alta';
        case 'medium': return 'Média';
        case 'low': return 'Baixa';
        default: return 'Média';
    }
}

// Atualizar contador de alertas
function updateAlertCount(count) {
    const alertCountElement = document.getElementById('alertCount');
    if (alertCountElement) {
        const totalAlerts = tableData.length;
        alertCountElement.textContent = `Mostrando ${count} de ${totalAlerts} alertas`;
    }
}

// Função para renderizar os sensores no modal
function renderSensors(id) {
    const sensorsContainer = document.getElementById('modal-sensors');
    if (!sensorsContainer) return;
    
    sensorsContainer.innerHTML = '';
    
    const sensors = alertData[id].sensors;
    
    sensors.forEach(sensor => {
        const sensorCard = document.createElement('div');
        let statusClass = '';
        
        if (sensor.status === 'Normal') statusClass = 'normal';
        else if (sensor.status === 'Crítico') statusClass = 'critical';
        else if (sensor.status === 'Atenção') statusClass = 'warning';
        
        sensorCard.className = `sensor-card ${statusClass}`;
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status ${statusClass}">${sensor.status}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}</div>
            <div class="sensor-card-location">${sensor.location}</div>
        `;
        
        sensorsContainer.appendChild(sensorCard);
    });
}

// Função para abrir o modal com os dados - CORRIGIDA
function openAlertModal(id) {
    console.log('Abrindo modal para alerta ID:', id);
    
    const data = alertData[id];
    
    if (!data) {
        console.error('Dados do alerta não encontrados para ID:', id);
        alert('Erro: Dados do alerta não encontrados!');
        return;
    }
    
    // Atualiza os elementos do modal com os dados
    document.getElementById('modal-priority').textContent = getPriorityText(data.priority);
    document.getElementById('modal-status').textContent = data.status === 'active' ? 'Ativo' : 'Resolvido';
    document.getElementById('modal-time').textContent = data.time;
    document.getElementById('modal-assigned').textContent = data.assigned;
    document.getElementById('modal-datetime').textContent = data.datetime;
    document.getElementById('modal-vehicle').textContent = data.vehicle;
    document.getElementById('modal-type').textContent = data.type;
    document.getElementById('modal-code').textContent = data.code;
    document.getElementById('modal-description').textContent = data.description;
    document.getElementById('modal-location').textContent = data.location;
    document.getElementById('modal-route').textContent = data.route;
    document.getElementById('modal-updated').textContent = data.updated;
    
    // Atualiza o histórico
    const historyList = data.history.map(item => `<li>${item}</li>`).join('');
    document.getElementById('modal-history').innerHTML = `<ul style="padding-left: 20px; margin-top: 5px;">${historyList}</ul>`;
    
    // Renderiza os sensores
    renderSensors(id);
    
    // Ajusta as classes de prioridade e status
    const priorityCard = document.getElementById('modal-priority-card');
    const statusCard = document.getElementById('modal-status-card');
    const priorityValue = document.getElementById('modal-priority');
    const statusValue = document.getElementById('modal-status');
    
    // Remove classes anteriores
    priorityCard.className = 'detail-card';
    statusCard.className = 'detail-card';
    priorityValue.className = 'detail-card-value';
    statusValue.className = 'detail-card-value';
    
    // Adiciona a classe apropriada baseada na prioridade
    if (data.priority === 'critical') {
        priorityCard.classList.add('critical');
        priorityValue.classList.add('critical');
    } else if (data.priority === 'high') {
        priorityCard.classList.add('warning');
        priorityValue.classList.add('warning');
    } else {
        priorityCard.classList.add('info');
        priorityValue.classList.add('info');
    }
    
    // Adiciona a classe apropriada baseada no status
    if (data.status === 'active') {
        if (data.priority === 'critical') {
            statusCard.classList.add('critical');
            statusValue.classList.add('critical');
        } else if (data.priority === 'high') {
            statusCard.classList.add('warning');
            statusValue.classList.add('warning');
        } else {
            statusCard.classList.add('info');
            statusValue.classList.add('info');
        }
    } else {
        statusCard.classList.add('info');
        statusValue.classList.add('info');
    }
    
    // Ajusta o texto do botão de atribuição
    const assignBtn = document.getElementById('modal-assign-btn');
    if (data.assigned === "Operador" || data.assigned === "Não atribuído") {
        assignBtn.innerHTML = '<i class="fas fa-user"></i> Atribuir a Mim';
    } else {
        assignBtn.innerHTML = '<i class="fas fa-user-times"></i> Remover Atribuição';
    }
    
    // Ajusta o botão de resolver
    const resolveBtn = document.getElementById('modal-resolve-btn');
    if (data.status === "resolved") {
        resolveBtn.style.display = 'none';
    } else {
        resolveBtn.style.display = 'flex';
    }
    
    // Armazena o ID do alerta atual nos botões
    resolveBtn.setAttribute('data-alert-id', id);
    assignBtn.setAttribute('data-alert-id', id);
    
    // Exibe o modal
    const modal = document.getElementById('alertDetailsModal');
    modal.classList.add('active');
    
    console.log('Modal aberto com sucesso!');
}

// Função para fechar o modal
function closeAlertModal() {
    const modal = document.getElementById('alertDetailsModal');
    modal.classList.remove('active');
}

// Resolver alerta do modal
function resolveAlert() {
    const alertId = this.getAttribute('data-alert-id');
    if (confirm(`Deseja marcar o alerta ${alertId} como resolvido?`)) {
        // Atualiza a interface
        const alertRow = document.querySelector(`tr[data-id="${alertId}"]`);
        if (alertRow) {
            const statusCell = alertRow.querySelector('td:nth-child(6)');
            statusCell.innerHTML = '<span class="status resolved">Resolvido</span>';
            alertRow.className = 'info';
            
            // Remove o botão de resolver da linha
            const resolveBtn = alertRow.querySelector('.btn-action.resolve');
            if (resolveBtn) resolveBtn.remove();
        }
        
        // Atualiza o modal
        document.getElementById('modal-status').textContent = 'Resolvido';
        const statusCard = document.getElementById('modal-status-card');
        const statusValue = document.getElementById('modal-status');
        statusCard.className = 'detail-card info';
        statusValue.className = 'detail-card-value info';
        
        const resolveBtn = document.getElementById('modal-resolve-btn');
        resolveBtn.style.display = 'none';
        
        alert(`Alerta ${alertId} resolvido com sucesso!`);
    }
}

// Atribuir alerta
function assignAlert() {
    const alertId = this.getAttribute('data-alert-id');
    const currentAssignment = document.getElementById('modal-assigned').textContent;
    
    if (currentAssignment === "Operador" || currentAssignment === "Não atribuído") {
        document.getElementById('modal-assigned').textContent = "Operador";
        this.innerHTML = '<i class="fas fa-user-times"></i> Remover Atribuição';
        alert(`Alerta ${alertId} atribuído a você!`);
    } else {
        document.getElementById('modal-assigned').textContent = "Não atribuído";
        this.innerHTML = '<i class="fas fa-user"></i> Atribuir a Mim';
        alert(`Atribuição do alerta ${alertId} removida!`);
    }
}

// Resolver alerta por ID
function resolveAlertById(alertId, alertRow) {
    if (confirm(`Deseja marcar o alerta ${alertId} como resolvido?`)) {
        const statusCell = alertRow.querySelector('td:nth-child(6)');
        statusCell.innerHTML = '<span class="status resolved">Resolvido</span>';
        
        // Remove a classe de cor da linha
        alertRow.className = 'info';
        
        // Remove o botão de resolver
        const resolveBtn = alertRow.querySelector('.btn-action.resolve');
        if (resolveBtn) resolveBtn.remove();
        
        alert(`Alerta ${alertId} resolvido com sucesso!`);
    }
}

// Excluir alerta
function deleteAlert(alertId, alertRow) {
    if (confirm(`Deseja excluir o alerta ${alertId}?`)) {
        alertRow.remove();
        alert(`Alerta ${alertId} excluído com sucesso!`);
    }
}

// Aplicar filtros
function applyFilters() {
    currentPage = 1;
    populateAlertTable();
    setupPagination();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterForm').reset();
    // Define o tipo de alerta como "Temperatura" por padrão
    document.getElementById('type').selectedIndex = 1;
    applyFilters();
    alert('Filtros limpos com sucesso!');
}

// Criar novo alerta manual
function createNewAlert() {
    alert('Funcionalidade de criar novo alerta manual será implementada em breve!');
}

// Exportar alertas
function exportAlerts() {
    alert('Alertas exportados com sucesso!');
}

// Resolver todos os alertas
function resolveAllAlerts() {
    if (confirm('Deseja resolver todos os alertas ativos?')) {
        const activeAlerts = document.querySelectorAll('.alert-table tr:not(.info)');
        activeAlerts.forEach(alert => {
            const statusCell = alert.querySelector('td:nth-child(6)');
            if (statusCell) {
                statusCell.innerHTML = '<span class="status resolved">Resolvido</span>';
                alert.className = 'info';
                
                // Remove botões de resolver
                const resolveBtn = alert.querySelector('.btn-action.resolve');
                if (resolveBtn) resolveBtn.remove();
            }
        });
        alert('Todos os alertas foram resolvidos!');
    }
}

// Silenciar alertas
function toggleMuteAlerts() {
    const btn = document.getElementById('muteAlertsBtn');
    const isMuted = btn.innerHTML.includes('bell-slash');
    
    if (isMuted) {
        btn.innerHTML = '<i class="fas fa-bell"></i> Ativar Alertas';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-success');
        alert('Alertas ativados!');
    } else {
        btn.innerHTML = '<i class="fas fa-bell-slash"></i> Silenciar Alertas';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-danger');
        alert('Alertas silenciados!');
    }
}

// Simulação de novos alertas em tempo real
function simulateNewAlerts() {
    // 20% de chance de gerar um novo alerta a cada 30 segundos
    if (Math.random() < 0.2) {
        const alertTable = document.getElementById('alertTableBody');
        if (!alertTable) return;
        
        const alertTypes = ['critical', 'warning', 'warning', 'info'];
        const priorities = [
            {class: 'priority-critical', text: 'Crítico', value: 'critical'},
            {class: 'priority-high', text: 'Alta', value: 'high'},
            {class: 'priority-medium', text: 'Média', value: 'medium'},
            {class: 'priority-low', text: 'Baixa', value: 'low'}
        ];
        
        const vehicles = ['VLC-1023', 'VLC-2087', 'VLC-3054', 'VLC-4098', 'VLC-5021'];
        const sensors = ['Sensor Principal', 'Sensor da Porta', 'Sensor do Fundo', 'Sensor do Teto', 'Sensor do Piso'];
        const alertMessages = [
            'Temperatura crítica: 8.5°C',
            'Temperatura elevada: 6.8°C',
            'Temperatura baixa: 1.0°C',
            'Variação de temperatura anômala',
            'Falha na leitura de temperatura'
        ];
        
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const sensor = sensors[Math.floor(Math.random() * sensors.length)];
        const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
        
        // Obter data e hora atual
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        const dateString = now.toLocaleDateString('pt-BR');
        
        // Gerar um ID único para o novo alerta
        alertCounter++;
        const newId = alertCounter;
        
        // Criar nova linha de alerta
        const newRow = document.createElement('tr'); 
        newRow.className = alertType;
        newRow.setAttribute('data-id', newId);
        
        newRow.innerHTML = `
            <td>${dateString} ${timeString}</td>
            <td>${vehicle}</td>
            <td>Temperatura</td>
            <td>${sensor}: ${message}</td>
            <td><span class="priority-indicator ${priority.class}"></span> ${priority.text}</td>
            <td><span class="status ${alertType}">Ativo</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action resolve" title="Resolver"><i class="fas fa-check"></i></button>
                    <button class="btn-action view" title="Visualizar"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        `;
        
        // Adicionar no início da tabela
        alertTable.insertBefore(newRow, alertTable.firstChild);
        
        // Adicionar aos dados da tabela
        tableData.unshift({
            id: newId,
            datetime: `${dateString} ${timeString}`,
            vehicle: vehicle,
            type: "Temperatura",
            description: `${sensor}: ${message}`,
            priority: priority.value,
            status: "active",
            class: alertType
        });
        
        // Adicionar eventos aos botões
        const resolveBtn = newRow.querySelector('.btn-action.resolve');
        resolveBtn.addEventListener('click', function() {
            const alertRow = this.closest('tr');
            const alertId = alertRow.getAttribute('data-id');
            resolveAlertById(alertId, alertRow);
        });
        
        const viewBtn = newRow.querySelector('.btn-action.view');
        viewBtn.addEventListener('click', function() {
            const alertId = newRow.getAttribute('data-id');
            
            // Criar dados para o novo alerta
            alertData[newId] = {
                priority: priority.value,
                status: "active",
                time: "0 minutos",
                assigned: "Não atribuído",
                datetime: `${dateString} ${timeString}`,
                vehicle: `${vehicle}`,
                type: "Temperatura",
                code: `ALT-${dateString.replace(/\//g, '')}-${newId.toString().padStart(3, '0')}`,
                description: `${sensor}: ${message}`,
                location: "Localização a ser determinada",  
                route: "Rota em análise",
                updated: "Agora mesmo",
                history: [
                    `${timeString} - Alerta detectado pelo sistema`
                ],
                sensors: [
                    { id: 1, name: "Sensor Principal", value: "8.5°C", status: "Crítico", location: "Centro da carga" },
                    { id: 2, name: "Sensor da Porta", value: "9.0°C", status: "Crítico", location: "Perto da porta" },
                    { id: 3, name: "Sensor do Fundo", value: "8.2°C", status: "Crítico", location: "Fundo do veículo" },
                    { id: 4, name: "Sensor do Teto", value: "8.3°C", status: "Crítico", location: "Teto traseiro" },
                    { id: 5, name: "Sensor do Piso", value: "8.7°C", status: "Crítico", location: "Piso dianteiro" },
                    { id: 6, name: "Sensor Externo", value: "25.1°C", status: "Normal", location: "Externo" }
                ]
            };
            
            openAlertModal(newId);
        });
        
        // Mostrar notificação
        showNotification(alertType, vehicle, sensor, message);
        
        // Atualizar contador
        updateAlertCount(tableData.length);
        
        // Atualizar cards de resumo
        updateAlertOverview();
        
        // Reconfigurar paginação
        setupPagination();
    }
    
    // Agendar próxima verificação
    setTimeout(simulateNewAlerts, 30000);
}

// Mostrar notificação
function showNotification(type, vehicle, sensor, message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'critical' ? '#EC2513' : (type === 'warning' ? '#ECDD13' : '#2EA7AD');
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    notification.innerHTML = `<strong>Novo Alerta!</strong><br>${vehicle}: ${sensor} - ${message}`;
    
    document.body.appendChild(notification);
    
    // Remover notificação após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 5000);
}