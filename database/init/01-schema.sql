-- Garante os acentos corretos independente do cliente usado para rodar o script
SET NAMES utf8mb4;

-- O banco (MYSQL_DATABASE) já é criado pelo Docker. As tabelas abaixo são criadas nele.
-- Ordem importa: tabelas referenciadas pelas chaves estrangeiras vêm primeiro.

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- guarda o HASH (bcrypt), nunca a senha pura
    telefone VARCHAR(40) NOT NULL,
    tipo ENUM('admin', 'operador') DEFAULT 'operador',
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motoristas (
    id_motoristas INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade_base VARCHAR(60) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    entregas_hoje INT NOT NULL DEFAULT 0,
    status ENUM('Disponível', 'Em rota', 'Indisponível') NOT NULL DEFAULT 'Disponível',
    localizacao_atual POINT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    SPATIAL INDEX idx_localizacao_motorista (localizacao_atual)
);

CREATE TABLE IF NOT EXISTS entregas (
    id_entregas INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Código de rastreio único (ex: ENT-12345)

    -- Chaves Estrangeiras (Relacionando com as tabelas anteriores)
    id_cliente INT NOT NULL,
    id_motorista INT DEFAULT NULL, -- Pode começar NULL até um motorista aceitar a corrida

    -- Dados de Texto do Destino (para exibição em tela)
    endereco_destino VARCHAR(255) NOT NULL,

    -- GEOLOCALIZAÇÃO: O ponto exato no mapa onde o motorista deve ir
    coordenadas_destino POINT NOT NULL,

    previsao DATETIME NOT NULL,
    status ENUM('Pendente', 'A Caminho', 'Entregue', 'Cancelado') NOT NULL DEFAULT 'Pendente',

    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Restrições de Chave Estrangeira (Garante a integridade dos dados)
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuarios),
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id_motoristas) ON DELETE SET NULL,

    -- Índice espacial para buscas geográficas nas entregas
    SPATIAL INDEX idx_coordenadas_destino (coordenadas_destino)
);

CREATE TABLE IF NOT EXISTS enderecos_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuarios_id INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    coordenadas POINT NOT NULL,

    FOREIGN KEY (usuarios_id) REFERENCES usuarios(id_usuarios) ON DELETE CASCADE,
    SPATIAL INDEX idx_coordenadas_entrega (coordenadas)
);

CREATE TABLE IF NOT EXISTS localizacao_entregadores (
    entregador_id INT PRIMARY KEY,
    coordenadas POINT NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    SPATIAL INDEX idx_coordenadas_entregador (coordenadas)
);

-- Usada pelo "Esqueceu a senha?"
CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);
