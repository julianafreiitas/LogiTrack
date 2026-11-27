SET NAMES utf8mb4;
-- Senha dos registros de teste: Admin@123
SET @senha = 'scrypt$0e9413067239d500d4609215e8d67177$d57cef9bae3ad3c941e06f64277128da930f99818264545015cc40b4ca696eb3263a60751e941f4ac19d267faf297429e7d35365ae4d67a19d4a39fb5772f8ea';

INSERT IGNORE INTO usuarios (nome,email,senha,telefone,tipo,status,ultimo_acesso) VALUES
('Equipe de operações','operacoes@logitrack.com',@senha,'(11) 4000-1000','admin','ativo',NOW()),
('Mariana Almeida','mariana@logitrack.com',@senha,'(11) 97777-1001','admin','ativo',NOW()),
('Gabriel Martins','gabriel@logitrack.com',@senha,'(11) 97777-1002','admin','ativo',NOW()),
('Fernanda Dias','fernanda@logitrack.com',@senha,'(11) 97777-1003','admin','ativo',NOW()),
('Ricardo Alves','ricardo@logitrack.com',@senha,'(11) 97777-1004','admin','ativo',NOW()),
('Helena Duarte','helena@logitrack.com',@senha,'(11) 97777-1005','admin','inativo',NULL),
('Bruno Teixeira','bruno@logitrack.com',@senha,'(11) 97777-1006','operador','ativo',NOW()),
('Paula Ribeiro','paula@logitrack.com',@senha,'(11) 97777-1007','operador','ativo',NOW()),
('Diego Lima','diego@logitrack.com',@senha,'(11) 97777-1008','operador','ativo',NOW()),
('Sandra Moreira','sandra@logitrack.com',@senha,'(11) 97777-1009','operador','inativo',NULL);

INSERT IGNORE INTO cadastro (nome,email,senha,telefone,cpf) VALUES
('Marcos Oliveira','marcos@email.com',@senha,'(11) 99999-9999','11122233301'),('Ana Carolina','ana@email.com',@senha,'(11) 98888-0002','11122233302'),
('Pedro Santos','pedro@email.com',@senha,'(11) 98888-0003','11122233303'),('Juliana Lima','juliana@email.com',@senha,'(11) 98888-0004','11122233304'),
('Rafael Costa','rafael@email.com',@senha,'(11) 98888-0005','11122233305'),('Beatriz Souza','beatriz@email.com',@senha,'(11) 98888-0006','11122233306'),
('Lucas Ferreira','lucas@email.com',@senha,'(11) 98888-0007','11122233307'),('Camila Rocha','camila@email.com',@senha,'(11) 98888-0008','11122233308'),
('Thiago Mendes','thiago@email.com',@senha,'(11) 98888-0009','11122233309'),('Larissa Prado','larissa@email.com',@senha,'(11) 98888-0010','11122233310'),
('Eduardo Nunes','eduardo@email.com',@senha,'(11) 98888-0011','11122233311'),('Patrícia Gomes','patricia@email.com',@senha,'(11) 98888-0012','11122233312'),
('Mercado Souza','mercado.souza@email.com',@senha,'(11) 98888-0013','11122233313'),('Tech Solutions','tech.solutions@email.com',@senha,'(11) 98888-0014','11122233314');

INSERT IGNORE INTO motoristas (nome,cpf,telefone,email,cnh,categoria_cnh,cidade_base,veiculo,entregas_hoje,situacao,status,matricula,data_nascimento,endereco,contato_emergencia,validade_cnh,localizacao_atual) VALUES
('João Silva','12121212121','(11) 98765-4321','joao.silva@logitrack.com','12121212121','AB','São Caetano do Sul, SP','Van 03 - Fiat Ducato',0,'Ativo','Em rota','MOT-00428','1990-05-18','Rua das Flores, 123 - São Caetano do Sul, SP','(11) 90000-0000','2028-11-20',ST_GeomFromText('POINT(-46.5548 -23.6229)')),
('Carlos Henrique','11111111111','(11) 90000-0001','carlos@logitrack.com','11111111111','B','São Paulo','LT-2048',0,'Ativo','Disponível','MOT-00101',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.6333 -23.5505)')),
('João Pereira','22222222222','(19) 90000-0002','joao.pereira@logitrack.com','22222222222','AB','Campinas','LT-2051',0,'Ativo','Disponível','MOT-00102',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-47.0626 -22.9099)')),
('Pedro Alves','33333333333','(13) 90000-0003','pedro.alves@logitrack.com','33333333333','B','Santos','LT-2063',0,'Ativo','Disponível','MOT-00103',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.3336 -23.9608)')),
('Diego Ramos','44444444444','(15) 90000-0004','diego.ramos@logitrack.com','44444444444','C','Sorocaba','LT-2077',0,'Ativo','Disponível','MOT-00104',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-47.4526 -23.5015)')),
('Marcelo Barros','55555555555','(11) 90000-0005','marcelo@logitrack.com','55555555555','B','Santo André','LT-2082',0,'Ativo','Disponível','MOT-00105',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.5383 -23.6737)')),
('Aline Souza','66666666666','(11) 90000-0006','aline@logitrack.com','66666666666','AB','Guarulhos','LT-2094',0,'Ativo','Disponível','MOT-00106',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.5333 -23.4543)')),
('Rodrigo Faria','77777777777','(11) 90000-0007','rodrigo@logitrack.com','77777777777','B','Osasco','LT-2105',0,'Ativo','Indisponível','MOT-00107',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.7917 -23.5325)')),
('Vanessa Cardoso','88888888888','(11) 90000-0008','vanessa@logitrack.com','88888888888','B','São Bernardo do Campo','LT-2118',0,'Ativo','Disponível','MOT-00108',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.5650 -23.6914)')),
('Felipe Moura','99999999999','(11) 90000-0009','felipe@logitrack.com','99999999999','C','Jundiaí','LT-2126',0,'Ativo','Disponível','MOT-00109',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.8842 -23.1857)')),
('Tatiane Lopes','10101010101','(11) 90000-0010','tatiane@logitrack.com','10101010101','B','Mauá','LT-2139',0,'Ativo','Disponível','MOT-00110',NULL,NULL,NULL,NULL,ST_GeomFromText('POINT(-46.4613 -23.6677)'));

-- Entregas do portal: duas em andamento, uma pendente, três entregues hoje e histórico.
INSERT IGNORE INTO entregas (codigo,id_cliente,nome_cliente,id_motorista,endereco_origem,endereco_destino,coordenadas_destino,tipo_servico,observacoes,previsao,status,checked_at,atualizado_em)
SELECT v.codigo,c.id,c.nome,m.id_motoristas,'São Caetano do Sul, SP',v.endereco,ST_GeomFromText(v.ponto),'Entrega padrão',NULL,v.previsao,v.status,v.criado,v.atualizado
FROM (SELECT 'LT78452' codigo,'mercado.souza@email.com' email,'Rua das Flores, 123 - São Caetano do Sul, SP' endereco,'POINT(-46.5580 -23.6229)' ponto,TIMESTAMP(CURDATE(),'14:30:00') previsao,'A Caminho' status,NOW() criado,NOW() atualizado UNION ALL
SELECT 'LT78453','tech.solutions@email.com','Av. Goiás, 456 - Santo André, SP','POINT(-46.5383 -23.6639)',TIMESTAMP(CURDATE(),'15:15:00'),'A Caminho',NOW(),NOW() UNION ALL
SELECT 'LT78454','marcos@email.com','Rua Pará, 321 - São Caetano do Sul, SP','POINT(-46.5760 -23.6300)',DATE_ADD(NOW(),INTERVAL 3 HOUR),'Pendente',NOW(),NOW() UNION ALL
SELECT 'LT78455','ana@email.com','Rua Amazonas, 800 - São Caetano do Sul, SP','POINT(-46.5400 -23.6150)',TIMESTAMP(CURDATE(),'09:00:00'),'Entregue',NOW(),TIMESTAMP(CURDATE(),'09:10:00') UNION ALL
SELECT 'LT78456','pedro@email.com','Rua Alegre, 90 - São Caetano do Sul, SP','POINT(-46.5700 -23.6150)',TIMESTAMP(CURDATE(),'10:00:00'),'Entregue',NOW(),TIMESTAMP(CURDATE(),'10:10:00') UNION ALL
SELECT 'LT78457','juliana@email.com','Rua Perrella, 200 - São Caetano do Sul, SP','POINT(-46.5500 -23.6400)',TIMESTAMP(CURDATE(),'11:00:00'),'Entregue',NOW(),TIMESTAMP(CURDATE(),'11:10:00') UNION ALL
SELECT 'LT78458','rafael@email.com','Rua das Figueiras, 500 - Santo André, SP','POINT(-46.5330 -23.6630)',DATE_SUB(NOW(),INTERVAL 1 DAY),'Entregue',DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY) UNION ALL
SELECT 'LT78459','beatriz@email.com','Av. Kennedy, 700 - São Bernardo do Campo, SP','POINT(-46.5750 -23.6800)',DATE_SUB(NOW(),INTERVAL 3 DAY),'Entregue',DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY) UNION ALL
SELECT 'LT78460','lucas@email.com','Rua Marechal Deodoro, 620 - São Bernardo do Campo, SP','POINT(-46.5500 -23.7050)',DATE_SUB(NOW(),INTERVAL 5 DAY),'Entregue',DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY)) v
JOIN cadastro c ON c.email=v.email JOIN motoristas m ON m.email='joao.silva@logitrack.com';

-- Entregas para os demais motoristas do seletor, com as três situações de hoje.
INSERT IGNORE INTO entregas (codigo,id_cliente,nome_cliente,id_motorista,endereco_origem,endereco_destino,coordenadas_destino,tipo_servico,previsao,status,checked_at,atualizado_em)
SELECT v.codigo,c.id,c.nome,m.id_motoristas,v.cidade,v.endereco,ST_GeomFromText(v.ponto),'Entrega padrão',v.previsao,v.status,NOW(),v.atualizado
FROM (
  SELECT 'CH001' codigo,'carlos@logitrack.com' motorista,'marcos@email.com' cliente,'São Paulo, SP' cidade,'Rua Augusta, 900 - Consolação, São Paulo, SP' endereco,'POINT(-46.6360 -23.5520)' ponto,DATE_ADD(NOW(),INTERVAL 2 HOUR) previsao,'A Caminho' status,NOW() atualizado UNION ALL
  SELECT 'CH002','carlos@logitrack.com','ana@email.com','São Paulo, SP','Rua Vergueiro, 1800 - Vila Mariana, São Paulo, SP','POINT(-46.6380 -23.5800)',DATE_ADD(NOW(),INTERVAL 4 HOUR),'Pendente',NOW() UNION ALL
  SELECT 'CH003','carlos@logitrack.com','pedro@email.com','São Paulo, SP','Rua Voluntários da Pátria, 1500 - Santana, São Paulo, SP','POINT(-46.6250 -23.5050)',TIMESTAMP(CURDATE(),'09:00:00'),'Entregue',TIMESTAMP(CURDATE(),'09:10:00') UNION ALL
  SELECT 'JP001','joao.pereira@logitrack.com','juliana@email.com','Campinas, SP','Avenida Norte-Sul, 500 - Cambuí, Campinas, SP','POINT(-47.0600 -22.9000)',DATE_ADD(NOW(),INTERVAL 2 HOUR),'A Caminho',NOW() UNION ALL
  SELECT 'JP002','joao.pereira@logitrack.com','rafael@email.com','Campinas, SP','Rua Barão de Jaguara, 800 - Centro, Campinas, SP','POINT(-47.0800 -22.9200)',DATE_ADD(NOW(),INTERVAL 4 HOUR),'Pendente',NOW() UNION ALL
  SELECT 'JP003','joao.pereira@logitrack.com','beatriz@email.com','Campinas, SP','Avenida John Boyd Dunlop, 3000 - Jardim Ipaussurama, Campinas, SP','POINT(-47.1000 -22.9300)',TIMESTAMP(CURDATE(),'09:00:00'),'Entregue',TIMESTAMP(CURDATE(),'09:10:00') UNION ALL
  SELECT 'PA001','pedro.alves@logitrack.com','lucas@email.com','Santos, SP','Avenida Ana Costa, 350 - Gonzaga, Santos, SP','POINT(-46.3260 -23.9650)',DATE_ADD(NOW(),INTERVAL 2 HOUR),'A Caminho',NOW() UNION ALL
  SELECT 'PA002','pedro.alves@logitrack.com','camila@email.com','Santos, SP','Rua João Pessoa, 100 - Centro, Santos, SP','POINT(-46.3330 -23.9500)',DATE_ADD(NOW(),INTERVAL 4 HOUR),'Pendente',NOW() UNION ALL
  SELECT 'PA003','pedro.alves@logitrack.com','thiago@email.com','Santos, SP','Avenida Conselheiro Nébias, 1800 - Boqueirão, Santos, SP','POINT(-46.3100 -23.9700)',TIMESTAMP(CURDATE(),'09:00:00'),'Entregue',TIMESTAMP(CURDATE(),'09:10:00') UNION ALL
  SELECT 'DR001','diego.ramos@logitrack.com','larissa@email.com','Sorocaba, SP','Avenida Barão de Tatuí, 700 - Centro, Sorocaba, SP','POINT(-47.4520 -23.5020)',DATE_ADD(NOW(),INTERVAL 2 HOUR),'A Caminho',NOW() UNION ALL
  SELECT 'DR002','diego.ramos@logitrack.com','eduardo@email.com','Sorocaba, SP','Avenida Itavuvu, 2500 - Jardim Santa Cecília, Sorocaba, SP','POINT(-47.4700 -23.4800)',DATE_ADD(NOW(),INTERVAL 4 HOUR),'Pendente',NOW() UNION ALL
  SELECT 'DR003','diego.ramos@logitrack.com','patricia@email.com','Sorocaba, SP','Rua São Bento, 400 - Centro, Sorocaba, SP','POINT(-47.4550 -23.5200)',TIMESTAMP(CURDATE(),'09:00:00'),'Entregue',TIMESTAMP(CURDATE(),'09:10:00')
) v
JOIN cadastro c ON c.email=v.cliente
JOIN motoristas m ON m.email=v.motorista;

INSERT IGNORE INTO entregas (codigo,id_cliente,nome_cliente,endereco_destino,coordenadas_destino,previsao,status)
SELECT CONCAT('DEMO-',LPAD(c.id,5,'0')),c.id,c.nome,'Avenida Paulista, 1000 - São Paulo, SP',ST_GeomFromText('POINT(-46.6550 -23.5610)'),DATE_ADD(NOW(),INTERVAL 1 DAY),'Pendente'
FROM cadastro c WHERE c.email NOT IN ('marcos@email.com','ana@email.com','pedro@email.com','juliana@email.com','rafael@email.com','beatriz@email.com','lucas@email.com');

INSERT IGNORE INTO enderecos_entrega (cadastro_id,rua,numero,bairro,cidade,coordenadas)
SELECT id,'Rua das Flores','123','Centro','São Caetano do Sul',ST_GeomFromText('POINT(-46.5548 -23.6229)') FROM cadastro ORDER BY id LIMIT 10;

INSERT IGNORE INTO localizacao_entregadores (entregador_id,coordenadas)
SELECT id_motoristas,localizacao_atual FROM motoristas ORDER BY id_motoristas LIMIT 10;

INSERT IGNORE INTO rotas (nome,id_motorista,distancia_km,origem,destino,status)
SELECT CONCAT('Rota ',m.nome),m.id_motoristas,12.5,m.cidade_base,'São Paulo','Ativa' FROM motoristas m ORDER BY m.id_motoristas LIMIT 10;

INSERT IGNORE INTO rotas_pontos (id_rota,ordem,coordenadas)
SELECT r.id_rotas,p.ordem,ST_GeomFromText(p.ponto)
FROM rotas r JOIN motoristas m ON r.id_motorista=m.id_motoristas
JOIN (SELECT 1 ordem,'POINT(-46.6333 -23.5505)' ponto UNION ALL SELECT 2,'POINT(-46.6200 -23.5700)' UNION ALL SELECT 3,'POINT(-46.5548 -23.6229)') p
WHERE r.nome=CONCAT('Rota ',m.nome);
