SET NAMES utf8mb4;

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
('Equipe de operações', 'operacoes@logitrack.com', 'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 4000-1000', 'admin',    'ativo',   '2026-11-14 12:30:00'),
('Mariana Almeida',     'mariana@logitrack.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1001', 'admin',    'ativo',   '2026-11-12 14:10:00'),
('Gabriel Martins',     'gabriel@logitrack.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1002', 'admin',    'ativo',   '2026-11-08 13:45:00'),
('Fernanda Dias',       'fernanda@logitrack.com',  'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1003', 'admin',    'ativo',   '2026-11-02 15:20:00'),
('Ricardo Alves',       'ricardo@logitrack.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1004', 'admin',    'ativo',   '2026-10-28 12:05:00'),
('Helena Duarte',       'helena@logitrack.com',    'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1005', 'admin',    'inativo', '2026-10-15 16:40:00'),
('Bruno Teixeira',      'bruno@logitrack.com',     'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1006', 'operador', 'ativo',   '2026-11-13 12:15:00'),
('Paula Ribeiro',       'paula@logitrack.com',     'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1007', 'operador', 'ativo',   '2026-11-11 13:00:00'),
('Diego Lima',          'diego@logitrack.com',     'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1008', 'operador', 'ativo',   '2026-11-09 17:30:00'),
('Sandra Moreira',      'sandra@logitrack.com',    'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 97777-1009', 'operador', 'inativo', NULL);

-- ---------------------------------------------------------------
-- Clientes (12)
-- ---------------------------------------------------------------
INSERT IGNORE INTO cadastro (nome, email, senha, telefone, cpf) VALUES
('Marcos Oliveira', 'marcos@email.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 99999-9999', '11122233301'),
('Ana Carolina',    'ana@email.com',      'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0002', '11122233302'),
('Pedro Santos',    'pedro@email.com',    'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0003', '11122233303'),
('Juliana Lima',    'juliana@email.com',  'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0004', '11122233304'),
('Rafael Costa',    'rafael@email.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0005', '11122233305'),
('Beatriz Souza',   'beatriz@email.com',  'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0006', '11122233306'),
('Lucas Ferreira',  'lucas@email.com',    'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0007', '11122233307'),
('Camila Rocha',    'camila@email.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0008', '11122233308'),
('Thiago Mendes',   'thiago@email.com',   'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0009', '11122233309'),
('Larissa Prado',   'larissa@email.com',  'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0010', '11122233310'),
('Eduardo Nunes',   'eduardo@email.com',  'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0011', '11122233311'),
('Patrícia Gomes',  'patricia@email.com', 'scrypt$a021e3f7c733d40a4b75c41036004e59$92d3e8be870fa90cce46f315eaec22a1a9fd2e78c4a2fe7e069fa0ccf09110e4140145061b5dd9305016fd95e71fb9c302791144896be8f2a995fe4e764eeb12', '(11) 98888-0012', '11122233312');

-- ---------------------------------------------------------------
-- Entregas (14). Pedro e Lucas ficam sem solicitação de propósito.
-- ---------------------------------------------------------------
INSERT IGNORE INTO entregas (codigo_rastreio, id_cliente, id_motorista, endereco_coleta, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20001', c.id, m.id_motoristas, 'São Paulo, SP', 'Santo André, SP', ST_GeomFromText('POINT(-46.5383 -23.6737)'), 'Entrega expressa',
       'Solicitação de entrega criada em 14/11/2026. Acompanhamento ativo.', '2026-11-14 18:00:00', 'A Caminho', '2026-11-14 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Carlos Henrique' WHERE c.email = 'marcos@email.com';

INSERT IGNORE INTO entregas (codigo_rastreio, id_cliente, id_motorista, endereco_coleta, endereco_destino, coordenadas_destino, tipo_servico, observacoes, previsao, status, checked_at)
SELECT 'ENT-20002', c.id, m.id_motoristas, 'São Paulo, SP', 'Osasco, SP', ST_GeomFromText('POINT(-46.7917 -23.5325)'), 'Entrega padrão',
       NULL, '2026-11-03 17:00:00', 'Entregue', '2026-11-02 12:00:00'
FROM cadastro c JOIN motoristas m ON m.nome = 'Rodrigo Faria' WHERE c.email = 'marcos@email.com';

INSERT INTO entregas (codigo_rastreio, id_cliente, id_motorista, endereco_destino, coordenadas_destino, previsao, status) VALUES
('ENT-10001', 1, 1, 'Avenida Francisco Glicério, 1200 - Centro, Campinas - SP', ST_GeomFromText('POINT(-47.0608 -22.9056)'), '2026-11-12 14:00:00', 'A Caminho'),
('ENT-10002', 2, 2, 'Avenida Ana Costa, 350 - Gonzaga, Santos - SP', ST_GeomFromText('POINT(-46.3336 -23.9608)'), '2026-11-12 15:30:00', 'A Caminho'),
('ENT-10003', 3, 3, 'Rua XV de Novembro, 480 - Centro, Sorocaba - SP', ST_GeomFromText('POINT(-47.4526 -23.5015)'), '2026-11-12 16:00:00', 'A Caminho'),
('ENT-10004', 4, 7, 'Avenida Tiradentes, 900 - Centro, Guarulhos - SP', ST_GeomFromText('POINT(-46.5333 -23.4543)'), '2026-11-12 10:00:00', 'Entregue'),
('ENT-10005', 5, 8, 'Avenida Kennedy, 700 - Centro, Santo André - SP', ST_GeomFromText('POINT(-46.5383 -23.6639)'), '2026-11-13 09:00:00', 'Pendente'),
('ENT-10006', 6, NULL, 'Rua Marechal Deodoro, 620 - Centro, São Bernardo do Campo - SP', ST_GeomFromText('POINT(-46.5650 -23.6914)'), '2026-11-13 11:00:00', 'Pendente'),
('ENT-10007', 7, 10, 'Avenida dos Autonomistas, 1500 - Vila Yara, Osasco - SP', ST_GeomFromText('POINT(-46.7917 -23.5325)'), '2026-11-12 13:00:00', 'A Caminho'),
('ENT-10008', 8, 4, 'Avenida Jundiaí, 300 - Anhangabaú, Jundiaí - SP', ST_GeomFromText('POINT(-46.8842 -23.1857)'), '2026-11-11 17:00:00', 'Entregue'),
('ENT-10009', 9, 6, 'Avenida Voluntário Fernando Braga, 210 - Centro, Mogi das Cruzes - SP', ST_GeomFromText('POINT(-46.1884 -23.5229)'), '2026-11-11 12:00:00', 'Cancelado'),
('ENT-10010', 10, 5, 'Avenida Paulista, 1578 - Bela Vista, São Paulo - SP', ST_GeomFromText('POINT(-46.6560 -23.5614)'), '2026-11-12 18:00:00', 'A Caminho');


-- ---------------------------------------------------------------------------
-- Entregas de exemplo para as telas do motorista e do cliente.
-- As datas são relativas a NOW()/CURDATE(), então sempre há entregas "de hoje"
-- e histórico dos últimos dias, em qualquer dia que o banco for recriado.
-- Motoristas 1 (João Pereira), 2 (Pedro Alves) e 3 (Diego Ramos); cliente 1 tem vários pedidos.
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO entregas (codigo_rastreio, id_cliente, id_motorista, endereco_destino, coordenadas_destino, previsao, status, checked_at, atualizado_em) VALUES
-- João Pereira: em andamento, pendentes e concluídas hoje
('ENT-20001', 1, 1, 'Avenida Paulista, 1578 - Bela Vista, São Paulo - SP', ST_GeomFromText('POINT(-46.6560 -23.5614)'), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'A Caminho', NOW(), NOW()),
('ENT-20002', 4, 1, 'Rua Augusta, 900 - Consolação, São Paulo - SP', ST_GeomFromText('POINT(-46.6562 -23.5531)'), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'A Caminho', NOW(), NOW()),
('ENT-20003', 5, 1, 'Rua Vergueiro, 2300 - Vila Mariana, São Paulo - SP', ST_GeomFromText('POINT(-46.6339 -23.5894)'), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'Pendente', NOW(), NOW()),
('ENT-20004', 1, 1, 'Rua dos Pinheiros, 450 - Pinheiros, São Paulo - SP', ST_GeomFromText('POINT(-46.6918 -23.5672)'), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'Pendente', NOW(), NOW()),
('ENT-20005', 6, 1, 'Rua da Mooca, 1200 - Mooca, São Paulo - SP', ST_GeomFromText('POINT(-46.5990 -23.5560)'), TIMESTAMP(CURDATE(), '09:00:00'), 'Entregue', TIMESTAMP(CURDATE(), '08:00:00'), TIMESTAMP(CURDATE(), '09:10:00')),
('ENT-20006', 7, 1, 'Rua Tuiuti, 700 - Tatuapé, São Paulo - SP', ST_GeomFromText('POINT(-46.5766 -23.5403)'), TIMESTAMP(CURDATE(), '10:30:00'), 'Entregue', TIMESTAMP(CURDATE(), '08:00:00'), TIMESTAMP(CURDATE(), '10:25:00')),
-- João Pereira: histórico (para testar busca, paginação e filtro de período)
('ENT-20007', 1, 1, 'Praça da Sé, 100 - Sé, São Paulo - SP', ST_GeomFromText('POINT(-46.6333 -23.5505)'), DATE_SUB(NOW(), INTERVAL 1 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ENT-20008', 8, 1, 'Avenida do Estado, 3000 - Cambuci, São Paulo - SP', ST_GeomFromText('POINT(-46.6200 -23.5700)'), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ENT-20009', 9, 1, 'Rua Domingos de Morais, 1500 - Vila Mariana, São Paulo - SP', ST_GeomFromText('POINT(-46.6370 -23.5930)'), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
('ENT-20010', 10, 1, 'Avenida Ipiranga, 200 - República, São Paulo - SP', ST_GeomFromText('POINT(-46.6430 -23.5440)'), DATE_SUB(NOW(), INTERVAL 6 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('ENT-20011', 4, 1, 'Avenida Lins de Vasconcelos, 1100 - Cambuci, São Paulo - SP', ST_GeomFromText('POINT(-46.6150 -23.5750)'), DATE_SUB(NOW(), INTERVAL 9 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
('ENT-20012', 1, 1, 'Rua Oscar Freire, 600 - Jardins, São Paulo - SP', ST_GeomFromText('POINT(-46.6710 -23.5620)'), DATE_SUB(NOW(), INTERVAL 15 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('ENT-20013', 5, 1, 'Avenida Rebouças, 1800 - Pinheiros, São Paulo - SP', ST_GeomFromText('POINT(-46.6720 -23.5640)'), DATE_SUB(NOW(), INTERVAL 25 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('ENT-20014', 6, 1, 'Rua Vergueiro, 3185 - Vila Mariana, São Paulo - SP', ST_GeomFromText('POINT(-46.6400 -23.5950)'), DATE_SUB(NOW(), INTERVAL 40 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 41 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),
-- Pedro Alves
('ENT-20020', 2, 2, 'Rua Teodoro Sampaio, 1000 - Pinheiros, São Paulo - SP', ST_GeomFromText('POINT(-46.6700 -23.5620)'), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'A Caminho', NOW(), NOW()),
('ENT-20021', 3, 2, 'Avenida Brigadeiro Faria Lima, 2000 - Jardim Paulistano, São Paulo - SP', ST_GeomFromText('POINT(-46.6920 -23.5760)'), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Pendente', NOW(), NOW()),
('ENT-20022', 1, 2, 'Rua Haddock Lobo, 500 - Cerqueira César, São Paulo - SP', ST_GeomFromText('POINT(-46.6600 -23.5580)'), TIMESTAMP(CURDATE(), '08:30:00'), 'Entregue', TIMESTAMP(CURDATE(), '07:30:00'), TIMESTAMP(CURDATE(), '08:20:00')),
('ENT-20023', 2, 2, 'Rua Cardeal Arcoverde, 700 - Pinheiros, São Paulo - SP', ST_GeomFromText('POINT(-46.6770 -23.5650)'), DATE_SUB(NOW(), INTERVAL 3 DAY), 'Entregue', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Diego Ramos
('ENT-20030', 3, 3, 'Avenida Celso Garcia, 2500 - Tatuapé, São Paulo - SP', ST_GeomFromText('POINT(-46.5800 -23.5400)'), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'A Caminho', NOW(), NOW()),
('ENT-20031', 1, 3, 'Rua Voluntários da Pátria, 1500 - Santana, São Paulo - SP', ST_GeomFromText('POINT(-46.6280 -23.5090)'), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Pendente', NOW(), NOW()),
-- Pedido cancelado do cliente 1 (sem motorista)
('ENT-20032', 1, NULL, 'Rua Consolação, 2000 - Consolação, São Paulo - SP', ST_GeomFromText('POINT(-46.6580 -23.5530)'), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Cancelado', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));
