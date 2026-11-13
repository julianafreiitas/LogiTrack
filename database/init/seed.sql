-- Garante os acentos corretos independente do cliente usado para rodar o script
SET NAMES utf8mb4;

-- Dados de exemplo para testar o site. Rodam depois do 01-schema.sql.
-- Senha de todos os usuários: 123456 (a coluna senha guarda o hash bcrypt).
-- Obs.: POINT(longitude latitude). As previsões das entregas são relativas a NOW(),
-- então sempre existem entregas atrasadas, em trânsito, pendentes e entregues para testar.

-- USUARIOS
INSERT INTO usuarios (nome, email, senha, telefone, tipo) VALUES
('Administrador', 'admin@logitrack.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 90000-0001', 'admin'),
('Maria Operadora', 'maria@logitrack.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 90000-0002', 'operador'),
('João Operador', 'joao@logitrack.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 90000-0003', 'operador'),
('Carlos Mendes', 'carlos.mendes@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0004', 'operador'),
('Fernanda Rocha', 'fernanda.rocha@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0005', 'operador'),
('Ricardo Almeida', 'ricardo.almeida@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0006', 'operador'),
('Patrícia Gomes', 'patricia.gomes@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0007', 'operador'),
('Lucas Barbosa', 'lucas.barbosa@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0008', 'operador'),
('Juliana Martins', 'juliana.martins@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0009', 'operador'),
('Bruno Teixeira', 'bruno.teixeira@email.com', '$2a$10$XOhNds7.aZHAkMpfmYSaX.2L.E0O71xp.uAAxH/hw/ElQwrd2sxd2', '(11) 91111-0010', 'operador');

-- MOTORISTAS
INSERT INTO motoristas (nome, cidade_base, veiculo, entregas_hoje, status, localizacao_atual) VALUES
('João Pereira', 'São Paulo', 'Caminhão Mercedes Accelo', 4, 'Em rota', ST_GeomFromText('POINT(-46.6333 -23.5505)')),
('Ana Costa', 'Campinas', 'Van Fiat Ducato', 3, 'Em rota', ST_GeomFromText('POINT(-47.0508 -22.9049)')),
('Pedro Alves', 'Santos', 'Caminhão VW Delivery', 0, 'Disponível', ST_GeomFromText('POINT(-46.3136 -23.9508)')),
('Marina Lima', 'São Bernardo', 'Van Renault Master', 5, 'Em rota', ST_GeomFromText('POINT(-46.5350 -23.6764)')),
('Diego Ramos', 'Sorocaba', 'Caminhão Iveco Daily', 2, 'Em rota', ST_GeomFromText('POINT(-47.4126 -23.4815)')),
('Carla Nunes', 'Jundiaí', 'Van Peugeot Boxer', 1, 'Em rota', ST_GeomFromText('POINT(-46.8342 -23.1607)')),
('Rafael Souza', 'Santo André', 'Moto Honda CG 160', 6, 'Disponível', ST_GeomFromText('POINT(-46.4783 -23.6339)')),
('Beatriz Lopes', 'Guarulhos', 'Fiorino Fiat', 0, 'Indisponível', ST_GeomFromText('POINT(-46.4633 -23.4193)')),
('Thiago Ferreira', 'Osasco', 'Caminhão Ford Cargo', 2, 'Em rota', ST_GeomFromText('POINT(-46.7119 -23.4925)')),
('Camila Duarte', 'Mauá', 'Van Mercedes Sprinter', 0, 'Disponível', ST_GeomFromText('POINT(-46.3713 -23.6227)'));

-- ENTREGAS
INSERT INTO entregas (codigo, id_cliente, id_motorista, endereco_destino, coordenadas_destino, previsao, status) VALUES
('LT-2048', 4, 1, 'Av. Paulista, 1000 - Bela Vista - São Paulo', ST_GeomFromText('POINT(-46.6333 -23.5505)'), DATE_ADD(NOW(), INTERVAL -26 HOUR), 'Entregue'),
('LT-2049', 5, 2, 'Rua Barão de Jaguara, 450 - Centro - Campinas', ST_GeomFromText('POINT(-47.0608 -22.9099)'), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'A Caminho'),
('LT-2050', 6, 3, 'Av. Ana Costa, 300 - Gonzaga - Santos', ST_GeomFromText('POINT(-46.3336 -23.9608)'), DATE_ADD(NOW(), INTERVAL 20 HOUR), 'Pendente'),
('LT-2051', 7, 4, 'Rua Marechal Deodoro, 210 - Centro - São Bernardo', ST_GeomFromText('POINT(-46.5650 -23.6914)'), DATE_ADD(NOW(), INTERVAL -30 HOUR), 'Entregue'),
('LT-2052', 8, 5, 'Av. Itavuvu, 1800 - Jardim Santa Cecília - Sorocaba', ST_GeomFromText('POINT(-47.4526 -23.5015)'), DATE_ADD(NOW(), INTERVAL -3 HOUR), 'A Caminho'),
('LT-2053', 9, 6, 'Rua do Rosário, 95 - Centro - Jundiaí', ST_GeomFromText('POINT(-46.8842 -23.1857)'), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'A Caminho'),
('LT-2054', 10, 7, 'Rua Oliveira Lima, 77 - Jardim - Santo André', ST_GeomFromText('POINT(-46.5383 -23.6639)'), DATE_ADD(NOW(), INTERVAL -8 HOUR), 'Entregue'),
('LT-2055', 4, NULL, 'Av. Guarulhos, 3200 - Vila Augusta - Guarulhos', ST_GeomFromText('POINT(-46.5333 -23.4543)'), DATE_ADD(NOW(), INTERVAL 30 HOUR), 'Pendente'),
('LT-2056', 5, 9, 'Av. dos Autonomistas, 1500 - Vila Yara - Osasco', ST_GeomFromText('POINT(-46.7919 -23.5325)'), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'A Caminho'),
('LT-2057', 6, 10, 'Av. Barão de Mauá, 890 - Centro - Mauá', ST_GeomFromText('POINT(-46.4613 -23.6677)'), DATE_ADD(NOW(), INTERVAL 12 HOUR), 'Cancelado'),
('LT-2058', 7, 1, 'Rua Augusta, 2200 - Consolação - São Paulo', ST_GeomFromText('POINT(-46.6333 -23.5505)'), DATE_ADD(NOW(), INTERVAL -5 HOUR), 'Pendente'),
('LT-2059', 8, 4, 'Av. Kennedy, 600 - Anchieta - São Bernardo', ST_GeomFromText('POINT(-46.5650 -23.6914)'), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'Pendente');

-- ENDERECOS_ENTREGA
INSERT INTO enderecos_entrega (usuarios_id, rua, numero, bairro, cidade, coordenadas) VALUES
(4, 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', ST_GeomFromText('POINT(-46.6333 -23.5505)')),
(5, 'Rua Barão de Jaguara', '450', 'Centro', 'Campinas', ST_GeomFromText('POINT(-47.0608 -22.9099)')),
(6, 'Av. Ana Costa', '300', 'Gonzaga', 'Santos', ST_GeomFromText('POINT(-46.3336 -23.9608)')),
(7, 'Rua Marechal Deodoro', '210', 'Centro', 'São Bernardo', ST_GeomFromText('POINT(-46.5650 -23.6914)')),
(8, 'Av. Itavuvu', '1800', 'Jardim Santa Cecília', 'Sorocaba', ST_GeomFromText('POINT(-47.4526 -23.5015)')),
(9, 'Rua do Rosário', '95', 'Centro', 'Jundiaí', ST_GeomFromText('POINT(-46.8842 -23.1857)')),
(10, 'Rua Oliveira Lima', '77', 'Jardim', 'Santo André', ST_GeomFromText('POINT(-46.5383 -23.6639)')),
(4, 'Av. Guarulhos', '3200', 'Vila Augusta', 'Guarulhos', ST_GeomFromText('POINT(-46.5333 -23.4543)')),
(5, 'Av. dos Autonomistas', '1500', 'Vila Yara', 'Osasco', ST_GeomFromText('POINT(-46.7919 -23.5325)')),
(6, 'Av. Barão de Mauá', '890', 'Centro', 'Mauá', ST_GeomFromText('POINT(-46.4613 -23.6677)'));

-- LOCALIZACAO_ENTREGADORES (entregador_id = id do motorista)
INSERT INTO localizacao_entregadores (entregador_id, coordenadas) VALUES
(1, ST_GeomFromText('POINT(-46.6333 -23.5505)')),
(2, ST_GeomFromText('POINT(-47.0508 -22.9049)')),
(3, ST_GeomFromText('POINT(-46.3136 -23.9508)')),
(4, ST_GeomFromText('POINT(-46.5350 -23.6764)')),
(5, ST_GeomFromText('POINT(-47.4126 -23.4815)')),
(6, ST_GeomFromText('POINT(-46.8342 -23.1607)')),
(7, ST_GeomFromText('POINT(-46.4783 -23.6339)')),
(8, ST_GeomFromText('POINT(-46.4633 -23.4193)')),
(9, ST_GeomFromText('POINT(-46.7119 -23.4925)')),
(10, ST_GeomFromText('POINT(-46.3713 -23.6227)'));
