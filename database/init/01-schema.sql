SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(40) NOT NULL,
    imagem VARCHAR(100) DEFAULT NULL,
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



CREATE TABLE IF NOT EXISTS motoristas (
    id_motoristas INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) DEFAULT NULL UNIQUE,
    telefone VARCHAR(40) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL,
    cnh VARCHAR(11) DEFAULT NULL,
    categoria_cnh VARCHAR(2) DEFAULT NULL,
    cidade_base VARCHAR(60) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    entregas_hoje INT NOT NULL DEFAULT 0,
    -- situacao = cadastro (Ativo/Inativo); status = situação operacional
    situacao ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    status ENUM('Disponível', 'Em rota', 'Indisponível') NOT NULL DEFAULT 'Disponível',
    localizacao_atual POINT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    SPATIAL INDEX idx_localizacao_motorista (localizacao_atual)
);

CREATE TABLE IF NOT EXISTS enderecos_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadast_id INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    coordenadas POINT NOT NULL,
    FOREIGN KEY (cadast_id) REFERENCES cadastro(id) ON DELETE CASCADE,
    SPATIAL INDEX idx_coordenadas_entrega (coordenadas)
);

CREATE TABLE IF NOT EXISTS localizacao_entregadores (
    entregador_id INT PRIMARY KEY,
    coordenadas POINT NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_coordenadas_entregador (coordenadas)
);

CREATE TABLE IF NOT EXISTS entregas (
    id_entregas INT AUTO_INCREMENT PRIMARY KEY,
    codigo_rastreio VARCHAR(20) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    nome_cliente VARCHAR(100) DEFAULT NULL,
    id_motorista INT DEFAULT NULL,
    endereco_destino VARCHAR(255) NOT NULL,
    coordenadas_destino POINT NOT NULL,
    previsao DATETIME NOT NULL,
    status ENUM('Pendente', 'A Caminho', 'Entregue', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cadastro(id),
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id_motoristas) ON DELETE SET NULL,
    SPATIAL INDEX idx_coordenadas_destino (coordenadas_destino)
);

CREATE TABLE IF NOT EXISTS rotas (
    id_rotas INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    id_motorista INT DEFAULT NULL,
    distancia_km DECIMAL(8,1) NOT NULL DEFAULT 0,
    origem VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id_motoristas) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rotas_pontos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_rota INT NOT NULL,
    ordem INT NOT NULL,
    coordenadas POINT NOT NULL,
    FOREIGN KEY (id_rota) REFERENCES rotas(id_rotas) ON DELETE CASCADE,
    SPATIAL INDEX idx_coordenadas_rota_ponto (coordenadas)
);
