SET NAMES utf8mb4;
USE logi_track_db;

-- Senha de todos os registros de teste abaixo: Admin@123
-- ---------------------------------------------------------------
-- Motoristas (10)
-- ---------------------------------------------------------------
INSERT INTO motoristas (nome, cidade_base, veiculo, entregas_hoje, status, localizacao_atual) VALUES
('Carlos Henrique',  'São Paulo',            'LT-2048', 3, 'Em rota',       ST_GeomFromText('POINT(-46.6333 -23.5505)')),
('João Pereira',     'Campinas',             'LT-2051', 2, 'Em rota',       ST_GeomFromText('POINT(-47.0626 -22.9099)')),
('Pedro Alves',      'Santos',               'LT-2063', 0, 'Disponível',    ST_GeomFromText('POINT(-46.3336 -23.9608)')),
('Diego Ramos',      'Sorocaba',             'LT-2077', 1, 'Em rota',       ST_GeomFromText('POINT(-47.4526 -23.5015)')),
('Marcelo Barros',   'Santo André',          'LT-2082', 0, 'Disponível',    ST_GeomFromText('POINT(-46.5383 -23.6737)')),
('Aline Souza',      'Guarulhos',            'LT-2094', 4, 'Em rota',       ST_GeomFromText('POINT(-46.5333 -23.4543)')),
('Rodrigo Faria',    'Osasco',               'LT-2105', 0, 'Indisponível',  ST_GeomFromText('POINT(-46.7917 -23.5325)')),
('Vanessa Cardoso',  'São Bernardo do Campo','LT-2118', 2, 'Disponível',    ST_GeomFromText('POINT(-46.5650 -23.6914)')),
('Felipe Moura',     'Jundiaí',              'LT-2126', 1, 'Em rota',       ST_GeomFromText('POINT(-46.8842 -23.1857)')),
('Tatiane Lopes',    'Mauá',                 'LT-2139', 0, 'Disponível',    ST_GeomFromText('POINT(-46.4613 -23.6677)'));

-- ---------------------------------------------------------------
-- Administradores e operadores (10: 6 administradores + 4 operadores)
-- ---------------------------------------------------------------
INSERT IGNORE INTO usuarios (nome, email, senha, telefone, tipo, status, ultimo_acesso) VALUES
('Equipe de operações', 'operacoes@logitrack.com', 'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 4000-1000', 'admin',    'ativo',   '2026-11-14 12:30:00'),
('Mariana Almeida',     'mariana@logitrack.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1001', 'admin',    'ativo',   '2026-11-12 14:10:00'),
('Gabriel Martins',     'gabriel@logitrack.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1002', 'admin',    'ativo',   '2026-11-08 13:45:00'),
('Fernanda Dias',       'fernanda@logitrack.com',  'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1003', 'admin',    'ativo',   '2026-11-02 15:20:00'),
('Ricardo Alves',       'ricardo@logitrack.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1004', 'admin',    'ativo',   '2026-10-28 12:05:00'),
('Helena Duarte',       'helena@logitrack.com',    'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1005', 'admin',    'inativo', '2026-10-15 16:40:00'),
('Bruno Teixeira',      'bruno@logitrack.com',     'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1006', 'operador', 'ativo',   '2026-11-13 12:15:00'),
('Paula Ribeiro',       'paula@logitrack.com',     'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1007', 'operador', 'ativo',   '2026-11-11 13:00:00'),
('Diego Lima',          'diego@logitrack.com',     'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1008', 'operador', 'ativo',   '2026-11-09 17:30:00'),
('Sandra Moreira',      'sandra@logitrack.com',    'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 97777-1009', 'operador', 'inativo', NULL);

-- ---------------------------------------------------------------
-- Clientes (12)
-- ---------------------------------------------------------------
INSERT IGNORE INTO cadastro (nome, email, senha, telefone, cpf) VALUES
('Marcos Oliveira', 'marcos@email.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 99999-9999', '11122233301'),
('Ana Carolina',    'ana@email.com',      'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0002', '11122233302'),
('Pedro Santos',    'pedro@email.com',    'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0003', '11122233303'),
('Juliana Lima',    'juliana@email.com',  'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0004', '11122233304'),
('Rafael Costa',    'rafael@email.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0005', '11122233305'),
('Beatriz Souza',   'beatriz@email.com',  'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0006', '11122233306'),
('Lucas Ferreira',  'lucas@email.com',    'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0007', '11122233307'),
('Camila Rocha',    'camila@email.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0008', '11122233308'),
('Thiago Mendes',   'thiago@email.com',   'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0009', '11122233309'),
('Larissa Prado',   'larissa@email.com',  'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0010', '11122233310'),
('Eduardo Nunes',   'eduardo@email.com',  'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0011', '11122233311'),
('Patrícia Gomes',  'patricia@email.com', 'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea', '(11) 98888-0012', '11122233312');

-- ---------------------------------------------------------------
-- Entregas (14). Pedro e Lucas ficam sem solicitação de propósito.
-- ---------------------------------------------------------------
INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20001', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Santo André, SP', ST_GeomFromText('POINT(-46.5383 -23.6737)'), 'Entrega expressa',
       'Solicitação de entrega criada em 14/11/2026. Acompanhamento ativo.', '2026-11-14 18:00:00', 'A Caminho', '2026-11-14 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Carlos Henrique' WHERE c.email = 'marcos@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20002', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Osasco, SP', ST_GeomFromText('POINT(-46.7917 -23.5325)'), 'Entrega padrão',
       NULL, '2026-11-03 17:00:00', 'Entregue', '2026-11-02 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Rodrigo Faria' WHERE c.email = 'marcos@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20003', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Campinas, SP', ST_GeomFromText('POINT(-47.0626 -22.9099)'), 'Entrega agendada',
       'Entrega concluída em 10/11/2026.', '2026-11-10 16:00:00', 'Entregue', '2026-11-10 13:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'João Pereira' WHERE c.email = 'ana@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20004', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Santos, SP', ST_GeomFromText('POINT(-46.3336 -23.9608)'), 'Entrega padrão',
       NULL, '2026-10-21 18:00:00', 'Entregue', '2026-10-20 12:30:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Pedro Alves' WHERE c.email = 'ana@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20005', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Guarulhos, SP', ST_GeomFromText('POINT(-46.5333 -23.4543)'), 'Entrega expressa',
       'Entrega concluída em 05/11/2026.', '2026-11-05 15:00:00', 'Entregue', '2026-11-05 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Aline Souza' WHERE c.email = 'juliana@email.com';

-- Rafael: pendente e ainda sem motorista atribuído
INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20006', c.id_cadastro, NULL, 'São Paulo, SP', 'São Bernardo do Campo, SP', ST_GeomFromText('POINT(-46.5650 -23.6914)'), 'Entrega padrão',
       NULL, '2026-11-19 18:00:00', 'Pendente', '2026-11-01 13:00:00'
FROM cadastro c WHERE c.email = 'rafael@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20007', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Mauá, SP', ST_GeomFromText('POINT(-46.4613 -23.6677)'), 'Entrega padrão',
       'Entrega concluída em 30/10/2026.', '2026-10-30 17:00:00', 'Entregue', '2026-10-30 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Tatiane Lopes' WHERE c.email = 'beatriz@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20008', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Jundiaí, SP', ST_GeomFromText('POINT(-46.8842 -23.1857)'), 'Entrega agendada',
       NULL, '2026-10-26 18:00:00', 'A Caminho', '2026-10-24 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Felipe Moura' WHERE c.email = 'camila@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20009', c.id_cadastro, NULL, 'São Paulo, SP', 'Sorocaba, SP', ST_GeomFromText('POINT(-47.4526 -23.5015)'), 'Entrega padrão',
       'Cliente cancelou antes da coleta.', '2026-11-14 18:00:00', 'Cancelado', '2026-11-12 14:00:00'
FROM cadastro c WHERE c.email = 'thiago@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20010', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Santo André, SP', ST_GeomFromText('POINT(-46.5383 -23.6737)'), 'Entrega expressa',
       NULL, '2026-11-08 16:00:00', 'Entregue', '2026-11-08 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Marcelo Barros' WHERE c.email = 'larissa@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20011', c.id_cadastro, NULL, 'São Paulo, SP', 'Guarulhos, SP', ST_GeomFromText('POINT(-46.5333 -23.4543)'), 'Entrega padrão',
       NULL, '2026-11-18 18:00:00', 'Pendente', '2026-11-13 15:00:00'
FROM cadastro c WHERE c.email = 'eduardo@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20012', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Campinas, SP', ST_GeomFromText('POINT(-47.0626 -22.9099)'), 'Entrega agendada',
       'Entrega concluída em 03/11/2026.', '2026-11-03 17:00:00', 'Entregue', '2026-11-03 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'João Pereira' WHERE c.email = 'patricia@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20013', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Osasco, SP', ST_GeomFromText('POINT(-46.7917 -23.5325)'), 'Entrega padrão',
       NULL, '2026-10-12 17:00:00', 'Entregue', '2026-10-11 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Vanessa Cardoso' WHERE c.email = 'juliana@email.com';

INSERT IGNORE INTO entregas (codigo, id_cliente, id_motorista, endereco_origem, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20014', c.id_cadastro, m.id_motoristas, 'São Paulo, SP', 'Sorocaba, SP', ST_GeomFromText('POINT(-47.4526 -23.5015)'), 'Entrega expressa',
       NULL, '2026-10-05 16:00:00', 'Entregue', '2026-10-05 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Diego Ramos' WHERE c.email = 'camila@email.com';
