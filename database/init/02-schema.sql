CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    motorista VARCHAR(100) NOT NULL,
    previsao DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade_base VARCHAR(60) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    entregas_hoje INT NOT NULL DEFAULT 0,
    status ENUM('Disponível', 'Em rota', 'Indisponível')
        NOT NULL DEFAULT 'Disponível',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'operador') DEFAULT 'operador',
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS rotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    motorista VARCHAR(100) NOT NULL,
    distancia VARCHAR(50) NOT NULL,
    origem_lat DECIMAL(10, 6) NOT NULL,
    origem_lng DECIMAL(10, 6) NOT NULL,
    destino_lat DECIMAL(10, 6) NOT NULL,
    destino_lng DECIMAL(10, 6) NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativa'
);

INSERT INTO rotas (titulo, motorista, distancia, origem_lat, origem_lng, destino_lat, destino_lng, status) 
VALUES 
('Rota 01 - São Paulo → Campinas', 'João Pereira - 99 km', '99 km', -23.550520, -46.633308, -22.905560, -47.060830, 'Ativa'),
('Rota 02 - São Paulo → Santos', 'Pedro Alves - 78 km', '78 km', -23.550520, -46.633308, -23.961800, -46.333300, 'Ativa');