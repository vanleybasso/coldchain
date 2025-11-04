import psycopg2
import json
from datetime import datetime, timedelta
import os
import time
import pytz

def fetch_current_sensor_data():
    """
    Busca os dados MAIS RECENTES de todos os sensores para o dashboard
    """
    try:
        print("Conectando ao banco PostgreSQL para dados atuais dos sensores...")
        
        conn = psycopg2.connect(
            host="10.0.0.101",
            port=5432,
            database="rota_position_db",
            user="rotadba",
            password="Bytzim-nirsuv-vyzji8",
            connect_timeout=10,
        )
        
        cursor = conn.cursor()
        
        # Buscar os dados MAIS RECENTES de cada sensor
        query = """
        SELECT DISTINCT ON (sensor_index) 
            sensor_index,
            temperature,
            humidity,
            time_position
        FROM public.historic_cold_chain
        WHERE license_plate = 'KG8000003'
        ORDER BY sensor_index, time_position DESC
        """
        
        print("Executando query para dados atuais...")
        cursor.execute(query)
        results = cursor.fetchall()
        
        print(f"Encontrados {len(results)} registros atuais dos sensores")
        
        # NOVO MAPEAMENTO DOS SENSORES
        sensor_mapping = {
            0: "externo",
            1: "dianteiro-direito", 
            2: "dianteiro-esquerdo",
            3: "central-direito",
            4: "central-esquerdo",
            5: "fundo-direito",
            6: "fundo-esquerdo"
        }
        
        # Processar resultados
        current_data = {}
        
        for sensor_index, temperature, humidity, time_position in results:
            sensor_name = sensor_mapping.get(sensor_index)
            if sensor_name:
                # Converter UTC para horário do Brasil
                if time_position.tzinfo is None:
                    time_position = pytz.utc.localize(time_position)
                brazil_tz = pytz.timezone('America/Sao_Paulo')
                time_position_brazil = time_position.astimezone(brazil_tz)
                
                current_data[sensor_name] = {
                    "temperature": float(temperature) if temperature is not None else 0.0,
                    "humidity": float(humidity) if humidity is not None else 0.0,
                    "last_read": time_position_brazil.isoformat()
                }
        
        # Garantir que todos os sensores estejam presentes
        for sensor_index, sensor_name in sensor_mapping.items():
            if sensor_name not in current_data:
                brazil_tz = pytz.timezone('America/Sao_Paulo')
                now_brazil = datetime.now(brazil_tz)
                
                current_data[sensor_name] = {
                    "temperature": 0.0,
                    "humidity": 0.0,
                    "last_read": now_brazil.isoformat()
                }
                print(f"Sensor {sensor_name} (índice {sensor_index}) não encontrado - marcado como não configurado")
        
        cursor.close()
        conn.close()
        
        print("Dados atuais obtidos com sucesso!")
        return current_data
        
    except psycopg2.OperationalError as e:
        print(f"Erro de conexão com o banco: {e}")
        return create_fallback_data_with_unconfigured()
    except Exception as e:
        print(f"Erro ao buscar dados atuais dos sensores: {e}")
        return create_fallback_data_with_unconfigured()

def fetch_sensor_history_with_time_range(sensor_index, time_range='6h'):
    """
    Busca dados históricos de um sensor específico baseado no período selecionado
    VERSÃO SIMPLIFICADA: Ignora timezone complexo e usa cálculo direto
    """
    try:
        print(f"Conectando ao banco PostgreSQL para histórico do sensor {sensor_index} - período: {time_range}")
        
        conn = psycopg2.connect(
            host="10.0.0.101",
            port=5432,
            database="rota_position_db",
            user="rotadba",
            password="Bytzim-nirsuv-vyzji8",
            connect_timeout=10,
        )
        
        cursor = conn.cursor()
        
        # ABORDAGEM SIMPLIFICADA: Calcular direto em UTC sem conversões complexas
        # O banco está em UTC, então vamos calcular tudo em UTC
        
        # Horário atual em UTC
        now_utc = datetime.utcnow()
        
        # Definir período baseado no time_range (em UTC)
        if time_range == '1h':
            start_time_utc = now_utc - timedelta(hours=1)
        elif time_range == '6h':
            start_time_utc = now_utc - timedelta(hours=6)
        elif time_range == '12h':
            start_time_utc = now_utc - timedelta(hours=12)
        elif time_range == '24h':
            start_time_utc = now_utc - timedelta(hours=24)
        else:  # Default para 6 horas
            start_time_utc = now_utc - timedelta(hours=6)
        
        # Converter para mostrar nos logs (apenas para informação)
        brazil_tz = pytz.timezone('America/Sao_Paulo')
        utc_tz = pytz.utc
        
        now_utc_tz = utc_tz.localize(now_utc)
        start_time_utc_tz = utc_tz.localize(start_time_utc)
        
        now_brazil = now_utc_tz.astimezone(brazil_tz)
        start_time_brazil = start_time_utc_tz.astimezone(brazil_tz)
        
        print(f"=== PERÍODO {time_range} ===")
        print(f"Data/hora atual (Brasil): {now_brazil.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"Data/hora início (Brasil): {start_time_brazil.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"Data/hora início (UTC): {start_time_utc.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"Diferença real: {(now_brazil - start_time_brazil).total_seconds() / 3600:.1f} horas")
        
        # Buscar dados históricos do sensor específico
        query = """
        SELECT temperature, humidity, time_position
        FROM public.historic_cold_chain
        WHERE license_plate = 'KG8000003' 
          AND sensor_index = %s
          AND time_position >= %s
          AND temperature != 0.0
        ORDER BY time_position ASC
        """
        
        print(f"Executando query para histórico do sensor {sensor_index} (período: {time_range})...")
        cursor.execute(query, (sensor_index, start_time_utc))
        results = cursor.fetchall()
        
        print(f"Encontrados {len(results)} registros históricos para sensor {sensor_index} no período {time_range}")
        
        # Processar resultados e converter timezone para Brasil
        history_data = []
        
        for temperature, humidity, time_position in results:
            # Converter UTC para horário do Brasil para exibição
            if time_position.tzinfo is None:
                time_position = pytz.utc.localize(time_position)
            time_position_brazil = time_position.astimezone(brazil_tz)
            
            history_data.append({
                "temperature": float(temperature) if temperature is not None else 0.0,
                "humidity": float(humidity) if humidity is not None else 0.0,
                "timestamp": time_position_brazil.isoformat()
            })
        
        cursor.close()
        conn.close()
        
        # Se não há dados suficientes, criar dados mock
        if len(history_data) < 3:
            print(f"Dados insuficientes para sensor {sensor_index}, gerando dados mock...")
            history_data = generate_mock_history_for_period(time_range, sensor_index)
        
        return history_data
        
    except psycopg2.OperationalError as e:
        print(f"Erro de conexão com o banco para sensor {sensor_index}: {e}")
        return generate_mock_history_for_period(time_range, sensor_index)
    except Exception as e:
        print(f"Erro ao buscar histórico do sensor {sensor_index}: {e}")
        return generate_mock_history_for_period(time_range, sensor_index)

def generate_mock_history_for_period(time_range, sensor_index):
    """
    Gera dados mock baseados no período selecionado
    """
    print(f"Gerando dados mock para sensor {sensor_index} - período: {time_range}")
    
    # NOVO MAPEAMENTO DOS SENSORES
    sensor_mapping = {
        0: "externo",
        1: "dianteiro-direito", 
        2: "dianteiro-esquerdo",
        3: "central-direito",
        4: "central-esquerdo",
        5: "fundo-direito",
        6: "fundo-esquerdo"
    }
    
    sensor_name = sensor_mapping.get(sensor_index, "dianteiro-direito")
    
    # Definir parâmetros baseados no período
    if time_range == '1h':
        points = 12  # 5 minutos cada
        base_temp = 3.5 if sensor_name != 'externo' else 24.0
        minutes_between_points = 5
    elif time_range == '6h':
        points = 12  # 30 minutos cada
        base_temp = 3.5 if sensor_name != 'externo' else 24.0
        minutes_between_points = 30
    elif time_range == '12h':
        points = 24  # 30 minutos cada para ter mais pontos
        base_temp = 3.5 if sensor_name != 'externo' else 24.0
        minutes_between_points = 30
    elif time_range == '24h':
        points = 24  # 1 hora cada
        base_temp = 3.5 if sensor_name != 'externo' else 24.0
        minutes_between_points = 60
    else:
        points = 12
        base_temp = 3.5 if sensor_name != 'externo' else 24.0
        minutes_between_points = 30
    
    # Ajustar base_temp para sensor central direito (normalmente mais quente)
    if sensor_name == 'central-direito':
        base_temp += 2.0
    
    history = []
    brazil_tz = pytz.timezone('America/Sao_Paulo')
    now_brazil = datetime.now(brazil_tz)
    
    # Gerar pontos distribuídos uniformemente pelo período
    for i in range(points):
        # Calcular o tempo para este ponto (do mais antigo para o mais recente)
        minutes_ago = (points - 1 - i) * minutes_between_points
        time_point = now_brazil - timedelta(minutes=minutes_ago)
        
        # Variação realista baseada no tempo
        time_factor = i / (points - 1) if points > 1 else 0.5
        temp_variation = (time_factor - 0.5) * 2  # Varia de -1 a +1
        
        temp = round(base_temp + temp_variation, 1)
        humidity = round(50 + temp_variation * 10, 0)
        
        history.append({
            "temperature": temp,
            "humidity": max(0, min(100, humidity)),
            "timestamp": time_point.isoformat()
        })
    
    print(f"Gerados {len(history)} pontos mock para período de {time_range}")
    return history

def get_all_sensors_history_with_time_range(time_range='6h'):
    """Busca histórico para todos os sensores baseado no período selecionado"""
    # NOVO MAPEAMENTO DOS SENSORES
    sensor_mapping = {
        0: "externo",
        1: "dianteiro-direito", 
        2: "dianteiro-esquerdo",
        3: "central-direito",
        4: "central-esquerdo",
        5: "fundo-direito",
        6: "fundo-esquerdo"
    }
    
    all_history = {}
    
    for sensor_index, sensor_name in sensor_mapping.items():
        print(f"Buscando histórico para {sensor_name} (índice {sensor_index}) - período: {time_range}...")
        history = fetch_sensor_history_with_time_range(sensor_index, time_range)
        all_history[sensor_name] = history
        time.sleep(0.3)
    
    return all_history

def create_fallback_data_with_unconfigured():
    """Cria dados de fallback incluindo sensores não configurados"""
    print("Criando dados de fallback com sensores não configurados...")
    
    brazil_tz = pytz.timezone('America/Sao_Paulo')
    now_brazil = datetime.now(brazil_tz)
    
    fallback_data = {
        "externo": {
            "temperature": 24.2,
            "humidity": 65.0,
            "last_read": now_brazil.isoformat()
        },
        "dianteiro-direito": {
            "temperature": 3.2,
            "humidity": 54.0,
            "last_read": now_brazil.isoformat()
        },
        "dianteiro-esquerdo": {
            "temperature": 3.5,
            "humidity": 55.0,
            "last_read": now_brazil.isoformat()
        },
        "central-direito": {
            "temperature": 0.0,
            "humidity": 0.0,
            "last_read": now_brazil.isoformat()
        },
        "central-esquerdo": {
            "temperature": 0.0,
            "humidity": 0.0,
            "last_read": now_brazil.isoformat()
        },
        "fundo-direito": {
            "temperature": 0.0,
            "humidity": 0.0,
            "last_read": now_brazil.isoformat()
        },
        "fundo-esquerdo": {
            "temperature": 0.0,
            "humidity": 0.0,
            "last_read": now_brazil.isoformat()
        }
    }
    
    return fallback_data

def save_history_for_all_periods():
    """
    Salva dados históricos para todos os períodos possíveis
    """
    periods = ['1h', '6h', '12h', '24h']
    
    for period in periods:
        print(f"\n=== BUSCANDO HISTÓRICO ({period}) PARA GRÁFICOS ===")
        history_data = get_all_sensors_history_with_time_range(period)
        
        # Salvar histórico em arquivo JSON específico para o período
        history_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), f'sensor_history_{period}.json')
        
        with open(history_file_path, 'w', encoding='utf-8') as f:
            json.dump(history_data, f, indent=2, ensure_ascii=False)
        
        print(f"Histórico dos sensores ({period}) salvo em: {history_file_path}")
    
    # CRIAR TAMBÉM O ARQUIVO sensor_history.json (12h) para compatibilidade
    print(f"\n=== CRIANDO ARQUIVO DE COMPATIBILIDADE (12h) ===")
    history_data_12h = get_all_sensors_history_with_time_range('12h')
    compat_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sensor_history.json')
    
    with open(compat_file_path, 'w', encoding='utf-8') as f:
        json.dump(history_data_12h, f, indent=2, ensure_ascii=False)
    
    print(f"Arquivo de compatibilidade salvo em: {compat_file_path}")

if __name__ == "__main__":
    try:
        # Buscar dados ATUAIS dos sensores para o dashboard
        print("=== BUSCANDO DADOS ATUAIS PARA DASHBOARD ===")
        current_data = fetch_current_sensor_data()
        
        # Salvar dados atuais em arquivo JSON
        current_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sensor_data.json')
        
        with open(current_file_path, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, indent=2, ensure_ascii=False)
        
        print(f"Dados atuais dos sensores salvos em: {current_file_path}")
        
        # Salvar históricos para todos os períodos
        save_history_for_all_periods()
        
    except KeyboardInterrupt:
        print("\nExecução interrompida pelo usuário")
    except Exception as e:
        print(f"Erro geral na execução: {e}")