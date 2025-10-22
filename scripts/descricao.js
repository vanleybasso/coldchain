// Dados dos veículos
const vehicleData = {
    "VLC-1023": {
        placa: "VLC-1023",
        modelo: "Mercedes Sprinter",
        ano: "2022",
        capacidade: "1500 kg",
        tipo: "Refrigerado",
        motorista: "Carlos Silva",
        rota: "Centro - Zona Sul",
        status: "normal",
        atualizacao: "15/06/2023 14:32",
        temperatura: "3.2",
        ultimaManutencao: "10/05/2023",
        proximaManutencao: "10/08/2023",
        km: "45.230 km",
        telefone: "(11) 98765-4321",
        email: "carlos.silva@email.com",
        tripStatus: "Em Andamento",
        location: "Av. Paulista, 1000",
        nextStop: "Centro de Distribuição - 15 min",
        fuelConsumption: "5.8 L/100km",
        fuelChange: "positive",
        doorsStatus: "0/1 Abertas",
        refrigeratorStatus: "Funcionando"
    },
    "VLC-2087": {
        placa: "VLC-2087",
        modelo: "Volkswagen Delivery",
        ano: "2021",
        capacidade: "1200 kg",
        tipo: "Refrigerado",
        motorista: "Ana Santos",
        rota: "Zona Norte - Centro",
        status: "alert",
        atualizacao: "15/06/2023 13:45",
        temperatura: "8.1",
        ultimaManutencao: "15/04/2023",
        proximaManutencao: "15/07/2023",
        km: "62.150 km",
        telefone: "(11) 97654-3210",
        email: "ana.santos@email.com",
        tripStatus: "Parado",
        location: "Rua Augusta, 500",
        nextStop: "Centro - 25 min",
        fuelConsumption: "6.2 L/100km",
        fuelChange: "negative",
        doorsStatus: "1/1 Abertas",
        refrigeratorStatus: "Em Alerta"
    },
    "VLC-3054": {
        placa: "VLC-3054",
        modelo: "Ford Transit",
        ano: "2020",
        capacidade: "1800 kg",
        tipo: "Refrigerado",
        motorista: "Roberto Alves",
        rota: "Zona Oeste - Aeroporto",
        status: "warning",
        atualizacao: "15/06/2023 12:18",
        temperatura: "6.3",
        ultimaManutencao: "22/05/2023",
        proximaManutencao: "22/08/2023",
        km: "78.450 km",
        telefone: "(11) 96543-2109",
        email: "roberto.alves@email.com",
        tripStatus: "Em Manutenção",
        location: "Oficina Central",
        nextStop: "Aeroporto - 40 min",
        fuelConsumption: "7.1 L/100km",
        fuelChange: "negative",
        doorsStatus: "0/1 Abertas",
        refrigeratorStatus: "Em Manutenção"
    },
    "VLC-4098": {
        placa: "VLC-4098",
        modelo: "Fiat Ducato",
        ano: "2022",
        capacidade: "1300 kg",
        tipo: "Refrigerado",
        motorista: "Maria Oliveira",
        rota: "Zona Leste - Centro",
        status: "normal",
        atualizacao: "15/06/2023 14:05",
        temperatura: "4.0",
        ultimaManutencao: "05/06/2023",
        proximaManutencao: "05/09/2023",
        km: "32.780 km",
        telefone: "(11) 95432-1098",
        email: "maria.oliveira@email.com",
        tripStatus: "Em Andamento",
        location: "Av. Faria Lima, 1500",
        nextStop: "Centro - 10 min",
        fuelConsumption: "5.5 L/100km",
        fuelChange: "positive",
        doorsStatus: "0/1 Abertas",
        refrigeratorStatus: "Funcionando"
    },
    "VLC-5021": {
        placa: "VLC-5021",
        modelo: "Renault Master",
        ano: "2019",
        capacidade: "1400 kg",
        tipo: "Refrigerado",
        motorista: "João Costa",
        rota: "Aeroporto - Zona Sul",
        status: "inactive",
        atualizacao: "14/06/2023 18:20",
        temperatura: "2.8",
        ultimaManutencao: "18/05/2023",
        proximaManutencao: "18/08/2023",
        km: "89.120 km",
        telefone: "(11) 94321-0987",
        email: "joao.costa@email.com",
        tripStatus: "Inativo",
        location: "Garagem Central",
        nextStop: "Sem rota ativa",
        fuelConsumption: "6.8 L/100km",
        fuelChange: "negative",
        doorsStatus: "0/1 Abertas",
        refrigeratorStatus: "Desligado"
    }
};

// Dados dos sensores (pode variar por veículo)
const sensorData = {
    'principal': {
        name: 'Sensor Principal',
        value: '3.2°C',
        location: 'Centro da carga',
        status: 'Normal',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'meio': {
        name: 'Sensor do Meio',
        value: '3.5°C',
        location: 'Meio da carga',
        status: 'Normal',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'porta': {
        name: 'Sensor da Porta',
        value: '6.8°C',
        location: 'Perto da porta',
        status: 'Alerta',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'fundo': {
        name: 'Sensor do Fundo',
        value: '2.9°C',
        location: 'Fundo do veículo',
        status: 'Normal',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'piso': {
        name: 'Sensor do Piso',
        value: '3.1°C',
        location: 'Piso dianteiro',
        status: 'Normal',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'teto': {
        name: 'Sensor do Teto',
        value: '3.3°C',
        location: 'Teto traseiro',
        status: 'Normal',
        lastRead: '14:32',
        icon: 'fas fa-thermometer-half'
    },
    'externo': {
        name: 'Sensor Externo',
        value: '22.5°C',
        location: 'Externo',
        status: 'Normal',
        lastRead: '14:30',
        icon: 'fas fa-sun'
    }
};

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para carregar dados do veículo
function loadVehicleData() {
    const plate = getUrlParameter('placa');
    
    if (!plate || !vehicleData[plate]) {
        // Se não encontrar o veículo, redireciona para a página de veículos
        alert('Veículo não encontrado!');
        window.location.href = 'veiculos.html';
        return;
    }
    
    const vehicle = vehicleData[plate];
    
    // Atualizar título da página
    document.getElementById('page-title').textContent = `Detalhes do Veículo - ${vehicle.placa}`;
    
    // Atualizar informações do veículo
    document.getElementById('vehicle-plate').textContent = vehicle.placa;
    document.getElementById('vehicle-model').textContent = vehicle.modelo;
    document.getElementById('vehicle-year').textContent = vehicle.ano;
    document.getElementById('vehicle-capacity').textContent = vehicle.capacidade;
    document.getElementById('vehicle-type').textContent = vehicle.tipo;
    document.getElementById('vehicle-driver').textContent = vehicle.motorista;
    document.getElementById('vehicle-route').textContent = vehicle.rota;
    document.getElementById('vehicle-trip-status').textContent = vehicle.tripStatus;
    document.getElementById('vehicle-last-update').textContent = vehicle.atualizacao;
    document.getElementById('vehicle-location').textContent = vehicle.location;
    document.getElementById('vehicle-avg-temp').textContent = `${vehicle.temperatura}°C`;
    document.getElementById('vehicle-next-stop').textContent = vehicle.nextStop;
    
    // Atualizar status do veículo
    const statusElement = document.getElementById('vehicle-status');
    statusElement.textContent = getStatusText(vehicle.status);
    statusElement.className = 'status-badge';
    statusElement.classList.add(getStatusClass(vehicle.status));
    
    // Atualizar dashboard
    document.getElementById('fuel-consumption').textContent = vehicle.fuelConsumption;
    document.getElementById('avg-temperature').textContent = `${vehicle.temperatura}°C`;
    document.getElementById('doors-status').textContent = vehicle.doorsStatus;
    document.getElementById('refrigerator-status').textContent = vehicle.refrigeratorStatus;
    
    // Atualizar status do combustível
    const fuelChangeElement = document.getElementById('fuel-change');
    fuelChangeElement.className = 'dashboard-change';
    fuelChangeElement.classList.add(vehicle.fuelChange);
    if (vehicle.fuelChange === 'positive') {
        fuelChangeElement.innerHTML = '<i class="fas fa-arrow-down"></i> 2.3% em relação ao mês anterior';
    } else {
        fuelChangeElement.innerHTML = '<i class="fas fa-arrow-up"></i> 1.7% em relação ao mês anterior';
    }
    
    // Atualizar status da temperatura
    const tempStatusElement = document.getElementById('temp-status');
    const tempValue = parseFloat(vehicle.temperatura);
    if (tempValue >= 2 && tempValue <= 5) {
        tempStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Dentro da faixa ideal';
        tempStatusElement.className = 'dashboard-change positive';
    } else if (tempValue > 5 && tempValue <= 7) {
        tempStatusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fora da faixa ideal';
        tempStatusElement.className = 'dashboard-change negative';
    } else {
        tempStatusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Temperatura crítica';
        tempStatusElement.className = 'dashboard-change negative';
    }
    
    // Atualizar status das portas
    const doorsChangeElement = document.getElementById('doors-change');
    if (vehicle.doorsStatus === '0/1 Abertas') {
        doorsChangeElement.innerHTML = '<i class="fas fa-check-circle"></i> Status normal';
        doorsChangeElement.className = 'dashboard-change positive';
    } else {
        doorsChangeElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Alerta: Porta aberta há 0 minutos';
        doorsChangeElement.className = 'dashboard-change negative';
    }
    
    // Atualizar status do refrigerador
    const refrigeratorChangeElement = document.getElementById('refrigerator-change');
    if (vehicle.refrigeratorStatus === 'Funcionando') {
        refrigeratorChangeElement.innerHTML = '<i class="fas fa-check-circle"></i> Operação normal';
        refrigeratorChangeElement.className = 'dashboard-change positive';
    } else if (vehicle.refrigeratorStatus === 'Em Alerta') {
        refrigeratorChangeElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Operação com alerta';
        refrigeratorChangeElement.className = 'dashboard-change negative';
    } else {
        refrigeratorChangeElement.innerHTML = '<i class="fas fa-times-circle"></i> Operação interrompida';
        refrigeratorChangeElement.className = 'dashboard-change negative';
    }
    
    // Atualizar sensores visuais baseados na temperatura do veículo
    updateSensorVisuals(vehicle.temperatura);
    
    // Criar cards de sensores dinamicamente
    createSensorCards();
}

// Função para obter texto do status
function getStatusText(status) {
    switch(status) {
        case 'normal': return 'Ativo';
        case 'alert': return 'Crítico';
        case 'warning': return 'Manutenção';
        case 'inactive': return 'Inativo';
        default: return 'Desconhecido';
    }
}

// Função para obter classe do status
function getStatusClass(status) {
    switch(status) {
        case 'normal': return 'status-normal';
        case 'alert': return 'status-alert';
        case 'warning': return 'status-warning';
        case 'inactive': return 'status-inactive';
        default: return 'status-normal';
    }
}

// Função para atualizar sensores visuais
function updateSensorVisuals(temperature) {
    const tempValue = parseFloat(temperature);
    
    // Atualizar sensores baseados na temperatura
    const sensors = document.querySelectorAll('.sensor');
    sensors.forEach(sensor => {
        const sensorType = sensor.getAttribute('data-sensor');
        
        // Reset classes
        sensor.className = 'sensor';
        
        // Aplicar classes baseadas na temperatura
        if (sensorType === 'externo') {
            sensor.classList.add('sensor-normal');
        } else if (tempValue >= 2 && tempValue <= 5) {
            sensor.classList.add('sensor-normal');
        } else if (tempValue > 5 && tempValue <= 7) {
            // Sensor da porta em alerta se temperatura estiver alta
            if (sensorType === 'porta') {
                sensor.classList.add('sensor-alert');
            } else {
                sensor.classList.add('sensor-warning');
            }
        } else {
            sensor.classList.add('sensor-alert');
        }
    });
}

// Função para criar cards de sensores
function createSensorCards() {
    const sensorsGrid = document.getElementById('sensors-grid');
    sensorsGrid.innerHTML = '';
    
    Object.keys(sensorData).forEach(sensorId => {
        const sensor = sensorData[sensorId];
        
        const sensorCard = document.createElement('div');
        sensorCard.className = 'sensor-card';
        sensorCard.setAttribute('data-sensor', sensorId);
        
        sensorCard.innerHTML = `
            <div class="sensor-card-header">
                <div class="sensor-card-title">${sensor.name}</div>
                <span class="status-badge ${getSensorStatusClass(sensor.status)}">${sensor.status}</span>
            </div>
            <div class="sensor-card-value">${sensor.value}</div>
            <div class="sensor-card-location">${sensor.location}</div>
        `;
        
        sensorsGrid.appendChild(sensorCard);
    });
}

// Função para obter classe de status do sensor
function getSensorStatusClass(status) {
    switch(status) {
        case 'Normal': return 'status-normal';
        case 'Alerta': return 'status-warning';
        case 'Crítico': return 'status-alert';
        default: return 'status-normal';
    }
}

// Função para atualizar o painel de detalhes do sensor
function updateSensorDetails(sensorId) {
    const sensor = sensorData[sensorId];
    
    if (!sensor) return;
    
    // Atualizar o painel de detalhes
    document.getElementById('sensor-name').textContent = sensor.name;
    document.getElementById('sensor-value').textContent = sensor.value;
    document.getElementById('sensor-location').textContent = sensor.location;
    document.getElementById('sensor-last-read').textContent = sensor.lastRead;
    document.getElementById('sensor-status-text').textContent = sensor.status;
    
    // Atualizar o ícone
    const iconElement = document.querySelector('.sensor-details-icon i');
    iconElement.className = sensor.icon;
    
    // Atualizar o status
    const statusElement = document.getElementById('sensor-status');
    statusElement.textContent = sensor.status;
    statusElement.className = 'sensor-details-status status-badge';
    statusElement.classList.add(getSensorStatusClass(sensor.status));
    
    // Destacar o sensor selecionado
    const allSensors = document.querySelectorAll('.sensor');
    allSensors.forEach(s => s.classList.remove('active'));
    
    const selectedSensor = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
    if (selectedSensor) {
        selectedSensor.classList.add('active');
    }
    
    // Destacar o card do sensor selecionado
    const allCards = document.querySelectorAll('.sensor-card');
    allCards.forEach(c => c.style.boxShadow = 'none');
    
    const selectedCard = document.querySelector(`.sensor-card[data-sensor="${sensorId}"]`);
    if (selectedCard) {
        selectedCard.style.boxShadow = '0 0 0 2px var(--primary)';
    }
}

// Adicionar eventos de clique aos sensores
function setupEventListeners() {
    const sensors = document.querySelectorAll('.sensor');
    const sensorCards = document.querySelectorAll('.sensor-card');
    
    sensors.forEach(sensor => {
        sensor.addEventListener('click', function() {
            const sensorId = this.getAttribute('data-sensor');
            updateSensorDetails(sensorId);
        });
    });
    
    sensorCards.forEach(card => {
        card.addEventListener('click', function() {
            const sensorId = this.getAttribute('data-sensor');
            updateSensorDetails(sensorId);
        });
    });
    
    // Selecionar o primeiro sensor por padrão
    updateSensorDetails('principal');
}

// Simulação de atualização de dados em tempo real
function updateSensorData() {
    // Atualizar os valores dos sensores aleatoriamente
    Object.keys(sensorData).forEach(sensorId => {
        const sensor = sensorData[sensorId];
        const currentTemp = parseFloat(sensor.value);
        const variation = (Math.random() - 0.5) * 0.3; // Variação de ±0.15
        let newTemp;
        
        if (sensorId === 'externo') {
            newTemp = Math.max(15, Math.min(35, (currentTemp + variation))).toFixed(1);
        } else {
            newTemp = Math.max(-5, Math.min(10, (currentTemp + variation))).toFixed(1);
        }
        
        sensor.value = `${newTemp}°C`;
        sensor.lastRead = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Atualizar status baseado na temperatura
        const tempValue = parseFloat(newTemp);
        if (sensorId === 'externo') {
            sensor.status = 'Normal'; // Sempre normal para externo
        } else if (tempValue >= 2 && tempValue <= 5) {
            sensor.status = 'Normal';
        } else if (tempValue > 5 && tempValue <= 7) {
            sensor.status = 'Alerta';
        } else {
            sensor.status = 'Crítico';
        }
        
        // Atualizar elementos visuais se este sensor estiver selecionado
        const selectedSensor = document.querySelector('.sensor.active');
        if (selectedSensor && selectedSensor.getAttribute('data-sensor') === sensorId) {
            updateSensorDetails(sensorId);
        }
        
        // Atualizar cards
        const card = document.querySelector(`.sensor-card[data-sensor="${sensorId}"]`);
        if (card) {
            card.querySelector('.sensor-card-value').textContent = `${newTemp}°C`;
            
            const statusBadge = card.querySelector('.status-badge');
            statusBadge.textContent = sensor.status;
            statusBadge.className = 'status-badge';
            statusBadge.classList.add(getSensorStatusClass(sensor.status));
        }
        
        // Atualizar sensores visuais
        const visualSensor = document.querySelector(`.sensor[data-sensor="${sensorId}"]`);
        if (visualSensor) {
            visualSensor.className = 'sensor';
            if (sensor.status === 'Normal') {
                visualSensor.classList.add('sensor-normal');
            } else if (sensor.status === 'Alerta') {
                visualSensor.classList.add('sensor-warning');
            } else {
                visualSensor.classList.add('sensor-alert');
            }
        }
    });
    
    // Atualizar a cada 10 segundos
    setTimeout(updateSensorData, 10000);
}

// Alternar status da porta
function toggleDoorStatus() {
    const door = document.getElementById('traseira');
    if (door.classList.contains('door-open')) {
        door.classList.remove('door-open');
        door.innerHTML = '<i class="fas fa-door-closed"></i>';
        
        // Atualizar dashboard
        document.getElementById('doors-status').textContent = '0/1 Abertas';
        document.getElementById('doors-change').innerHTML = 
            '<i class="fas fa-check-circle"></i> Status normal';
        document.getElementById('doors-change').className = 'dashboard-change positive';
    } else {
        door.classList.add('door-open');
        door.innerHTML = '<i class="fas fa-door-open"></i>';
        
        // Atualizar dashboard
        document.getElementById('doors-status').textContent = '1/1 Abertas';
        document.getElementById('doors-change').innerHTML = 
            '<i class="fas fa-exclamation-triangle"></i> Alerta: Porta aberta há 0 minutos';
        document.getElementById('doors-change').className = 'dashboard-change negative';
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do veículo
    loadVehicleData();
    
    // Adicionar eventos após um pequeno delay para garantir que os elementos foram criados
    setTimeout(() => {
        setupEventListeners();
    }, 100);
    
    // Adicionar evento de clique para a porta
    document.getElementById('traseira').addEventListener('click', toggleDoorStatus);
    
    // Iniciar simulação de atualização de dados
    updateSensorData();
});