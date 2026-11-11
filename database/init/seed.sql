SET NAMES utf8mb4;
USE app_db;

INSERT INTO motoristas (nome, cidade_base, veiculo, entregas_hoje, status) VALUES
('João Pereira', 'São Paulo', 'Fiorino Branca', 4, 'Em rota'),
('Pedro Alves', 'São Paulo', 'Van Sprinter', 3, 'Em rota'),
('Diego Ramos', 'São Paulo', 'Moto Honda CG 160', 6, 'Em rota'),
('Carlos Souza', 'Campinas', 'Fiorino Prata', 2, 'Disponível'),
('Ana Lima', 'Santos', 'Van Master', 5, 'Em rota'),
('Marcos Silva', 'Sorocaba', 'Caminhão VUC', 1, 'Disponível'),
('Rafaela Costa', 'Guarulhos', 'Moto Yamaha Fazer', 7, 'Em rota'),
('Bruno Martins', 'Santo André', 'Fiorino Branca', 0, 'Disponível'),
('Fernanda Rocha', 'São Bernardo do Campo', 'Van Sprinter', 0, 'Indisponível'),
('Lucas Teixeira', 'Osasco', 'Moto Honda Biz', 3, 'Em rota');

INSERT INTO usuarios (nome, email, senha, telefone, tipo, status) VALUES
('Matheus Paz', 'matheus@logitrack.com', 'senha_exemplo_01', '(11) 91111-0001', 'admin', 'ativo'),
('Samuel Godinho', 'samuel@logitrack.com', 'senha_exemplo_02', '(11) 91111-0002', 'admin', 'ativo'),
('Gustavo Paiva', 'gustavo@logitrack.com', 'senha_exemplo_03', '(11) 91111-0003', 'operador', 'ativo'),
('Juliana Mendes', 'juliana@logitrack.com', 'senha_exemplo_04', '(11) 91111-0004', 'operador', 'ativo'),
('Ricardo Nunes', 'ricardo@logitrack.com', 'senha_exemplo_05', '(11) 91111-0005', 'operador', 'ativo'),
('Patrícia Gomes', 'patricia@logitrack.com', 'senha_exemplo_06', '(11) 91111-0006', 'operador', 'inativo'),
('Eduardo Farias', 'eduardo@logitrack.com', 'senha_exemplo_07', '(11) 91111-0007', 'operador', 'ativo'),
('Camila Duarte', 'camila@logitrack.com', 'senha_exemplo_08', '(11) 91111-0008', 'operador', 'ativo'),
('Thiago Barros', 'thiago@logitrack.com', 'senha_exemplo_09', '(11) 91111-0009', 'operador', 'inativo'),
('Larissa Pires', 'larissa@logitrack.com', 'senha_exemplo_10', '(11) 91111-0010', 'admin', 'ativo');

INSERT INTO cadastro (nome, email, senha, telefone) VALUES
('Mercado Boa Compra', 'contato@boacompra.com.br', 'senha_exemplo_c01', '(19) 3201-0001'),
('Farmácia Vida Plena', 'pedidos@vidaplena.com.br', 'senha_exemplo_c02', '(13) 3202-0002'),
('Loja Tech Sorocaba', 'vendas@techsorocaba.com.br', 'senha_exemplo_c03', '(15) 3203-0003'),
('Padaria Pão Quente', 'padaria@paoquente.com.br', 'senha_exemplo_c04', '(11) 2404-0004'),
('Casa & Cia Móveis', 'sac@casaecia.com.br', 'senha_exemplo_c05', '(11) 4405-0005'),
('Auto Peças Rápido', 'atendimento@autopecasrapido.com.br', 'senha_exemplo_c06', '(11) 4306-0006'),
('Livraria Página Viva', 'contato@paginaviva.com.br', 'senha_exemplo_c07', '(11) 3607-0007'),
('Distribuidora Jundiaí Bebidas', 'comercial@jundiaibebidas.com.br', 'senha_exemplo_c08', '(11) 4608-0008'),
('Ótica Visão Clara', 'loja@visaoclara.com.br', 'senha_exemplo_c09', '(11) 4709-0009'),
('Escritório Paulista Advocacia', 'adm@paulistaadv.com.br', 'senha_exemplo_c10', '(11) 3010-0010');

INSERT INTO enderecos_entrega (cadast_id, rua, numero, bairro, cidade, coordenadas) VALUES
(1, 'Avenida Francisco Glicério', '1200', 'Centro', 'Campinas', ST_GeomFromText('POINT(-47.0608 -22.9056)')),
(2, 'Avenida Ana Costa', '350', 'Gonzaga', 'Santos', ST_GeomFromText('POINT(-46.3336 -23.9608)')),
(3, 'Rua XV de Novembro', '480', 'Centro', 'Sorocaba', ST_GeomFromText('POINT(-47.4526 -23.5015)')),
(4, 'Avenida Tiradentes', '900', 'Centro', 'Guarulhos', ST_GeomFromText('POINT(-46.5333 -23.4543)')),
(5, 'Avenida Kennedy', '700', 'Centro', 'Santo André', ST_GeomFromText('POINT(-46.5383 -23.6639)')),
(6, 'Rua Marechal Deodoro', '620', 'Centro', 'São Bernardo do Campo', ST_GeomFromText('POINT(-46.5650 -23.6914)')),
(7, 'Avenida dos Autonomistas', '1500', 'Vila Yara', 'Osasco', ST_GeomFromText('POINT(-46.7917 -23.5325)')),
(8, 'Avenida Jundiaí', '300', 'Anhangabaú', 'Jundiaí', ST_GeomFromText('POINT(-46.8842 -23.1857)')),
(9, 'Avenida Voluntário Fernando Braga', '210', 'Centro', 'Mogi das Cruzes', ST_GeomFromText('POINT(-46.1884 -23.5229)')),
(10, 'Avenida Paulista', '1578', 'Bela Vista', 'São Paulo', ST_GeomFromText('POINT(-46.6560 -23.5614)'));

INSERT INTO localizacao_entregadores (entregador_id, coordenadas) VALUES
(1, ST_GeomFromText('POINT(-46.6400 -23.5500)')),
(2, ST_GeomFromText('POINT(-46.6700 -23.5600)')),
(3, ST_GeomFromText('POINT(-46.6250 -23.5450)')),
(4, ST_GeomFromText('POINT(-47.0500 -22.9100)')),
(5, ST_GeomFromText('POINT(-46.3300 -23.9500)')),
(6, ST_GeomFromText('POINT(-47.4400 -23.5100)')),
(7, ST_GeomFromText('POINT(-46.5300 -23.4600)')),
(8, ST_GeomFromText('POINT(-46.5400 -23.6600)')),
(9, ST_GeomFromText('POINT(-46.5600 -23.6900)')),
(10, ST_GeomFromText('POINT(-46.7900 -23.5300)'));

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