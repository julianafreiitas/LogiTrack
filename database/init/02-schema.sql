CREATE DATABASE IF NOT EXISTS logi_track_db;
USE logi_track_db;

CREATE TABLE IF NOT EXISTS motoristas (
    id_motoristas INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade_base VARCHAR(60) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    entregas_hoje INT NOT NULL DEFAULT 0,
    status ENUM('Disponível', 'Em rota', 'Indisponível') NOT NULL DEFAULT 'Disponível',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(40) NOT NULL,
    tipo ENUM('admin', 'operador') DEFAULT 'operador',
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cadastro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(40) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enderecos_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadast_id INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    coordenadas POINT NOT NULL,
    FOREIGN KEY (cadast_id) REFERENCES cadastro(id) ON DELETE CASCADE
);

CREATE SPATIAL INDEX idx_coordenadas_entrega ON enderecos_entrega(coordenadas);

CREATE TABLE IF NOT EXISTS localizacao_entregadores (
    entregador_id INT PRIMARY KEY,
    coordenadas POINT NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE SPATIAL INDEX idx_coordenadas_entregador ON localizacao_entregadores(coordenadas);

CREATE TABLE IF NOT EXISTS entregas (
    id_entregas INT AUTO_INCREMENT PRIMARY KEY,
    codigo_rastreio VARCHAR(20) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_motorista INT DEFAULT NULL,
    endereco_destino VARCHAR(255) NOT NULL,
    coordenadas_destino POINT NOT NULL,
    previsao DATETIME NOT NULL,
    status ENUM('Pendente', 'A Caminho', 'Entregue', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cadastro(id),
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id_motoristas) ON DELETE SET NULL
);

CREATE SPATIAL INDEX idx_coordenadas_destino ON entregas(coordenadas_destino);