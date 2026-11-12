-- colocar varios insert into TABELAS values... pelo menos 10 para cada tabela, pode usar ia pra fazer

/* ============
    USUÁRIO
    =========== */

    INSERT INTO usuarios
    (id_usuarios, nome, email, senha, telefone, imagem, tipo, status)
    VALUES
    (1, 'Carlos Mendes', 'carlos@email.com', '$2y$10$hash1', '(11) 99911-1111', 'carlos.jpg', 'admin', 'ativo'),
    (2, 'Ana Souza', 'ana@email.com', '$2y$10$hash2', '(11) 99922-2222', 'ana.jpg', 'operador', 'ativo'),
    (3, 'Pedro Oliveira', 'pedro@email.com', '$2y$10$hash3', '(11) 99933-3333', 'pedro.jpg', 'operador', 'ativo'),
    (4, 'Mariana Costa', 'mariana@email.com', '$2y$10$hash4', '(11) 99944-4444', 'mariana.jpg', 'operador', 'ativo'),
    (5, 'Lucas Ferreira', 'lucas@email.com', '$2y$10$hash5', '(11) 99955-5555', 'operador', 'ativo'),
    (6, 'Juliana Alves', 'juliana@email.com', '$2y$10$hash6', '(11) 99966-6666', 'operador', 'ativo'),
    (7, 'Rafael Santos', 'rafael@email.com', '$2y$10$hash7', '(11) 99977-7777', 'operador', 'ativo'),
    (8, 'Fernanda Lima', 'fernanda@email.com', '$2y$10$hash8', '(11) 99988-8888', 'operador', 'ativo'),
    (9, 'Bruno Rodrigues', 'bruno@email.com', '$2y$10$hash9', '(11) 99999-9999', 'operador', 'inativo'),
    (10, 'Camila Martins', 'camila@email.com', '$2y$10$hash10', '(11) 98888-0000', 'operador', 'ativo');


/* ============
    MOTORISTAS
    =========== */

    INSERT INTO motoristas
    (id_motoristas, nome, cidade_base, veiculo, entregas_hoje, status, localizacao_atual)
    VALUES
    (1, 'Roberto Silva', 'São Paulo', 'Moto Honda CG 160', 5, 'Disponível', ST_GeomFromText('POINT(-46.6333 -23.5505)')),
    (2, 'André Oliveira', 'São Paulo', 'Moto Yamaha Fazer', 8, 'Em rota', ST_GeomFromText('POINT(-46.6388 -23.5489)')),
    (3, 'Marcos Pereira', 'Guarulhos', 'Carro Fiat Fiorino', 3, 'Disponível', ST_GeomFromText('POINT(-46.5333 -23.4538)')),
    (4, 'Diego Santos', 'Osasco', 'Moto Honda CG 160', 6, 'Em rota', ST_GeomFromText('POINT(-46.7917 -23.5325)')),
    (5, 'Felipe Costa', 'São Paulo', 'Van Renault Master', 4, 'Disponível', ST_GeomFromText('POINT(-46.6900 -23.5614)')),
    (6, 'Thiago Martins', 'Santo André', 'Moto Honda Biz', 7, 'Em rota', ST_GeomFromText('POINT(-46.5333 -23.6639)')),
    (7, 'Gustavo Lima', 'São Bernardo do Campo', 'Carro Chevrolet Montana', 2, 'Disponível', ST_GeomFromText('POINT(-46.5650 -23.6944)')),
    (8, 'Eduardo Alves', 'São Paulo', 'Moto Yamaha Factor', 9, 'Indisponível', ST_GeomFromText('POINT(-46.6500 -23.5700)')),
    (9, 'Vinicius Rocha', 'Diadema', 'Moto Honda CG 160', 5, 'Disponível', ST_GeomFromText('POINT(-46.6220 -23.6860)')),
    (10, 'Leonardo Souza', 'São Paulo', 'Van Fiat Ducato', 1, 'Disponível', ST_GeomFromText('POINT(-46.7100 -23.5900)'));

/* ============
    ENTREGAS
    =========== */

    INSERT INTO entregas
    (id_entregas, codigo, id_cliente, id_motorista, endereco_destino, coordenadas_destino, previsao, status)
    VALUES
    (1, 'ENT-12345', 1, 1, 'Av. Paulista, 1000 - Bela Vista, São Paulo', ST_GeomFromText('POINT(-46.6533 -23.5632)'), '2026-11-12 11:00:00', 'A Caminho'),

    (2, 'ENT-12346', 2, 2, 'Rua Augusta, 500 - Consolação, São Paulo', ST_GeomFromText('POINT(-46.6530 -23.5505)'), '2026-11-12 12:00:00', 'Pendente'),

    (3, 'ENT-12347', 3, 3, 'Av. Salgado Filho, 1500 - Guarulhos', ST_GeomFromText('POINT(-46.5333 -23.4538)'), '2026-11-12 13:00:00', 'A Caminho'),

    (4, 'ENT-12348', 4, 4, 'Rua Antônio Agu, 300 - Centro, Osasco', ST_GeomFromText('POINT(-46.7917 -23.5325)'), '2026-11-12 14:00:00', 'Pendente'),

    (5, 'ENT-12349', 5, 5, 'Av. Brigadeiro Faria Lima, 2000 - Pinheiros', ST_GeomFromText('POINT(-46.6910 -23.5700)'), '2026-11-12 15:00:00', 'Entregue'),

    (6, 'ENT-12350', 6, 6, 'Rua das Figueiras, 800 - Santo André', ST_GeomFromText('POINT(-46.5333 -23.6639)'), '2026-11-12 16:00:00', 'A Caminho'),

    (7, 'ENT-12351', 7, 7, 'Av. Kennedy, 1200 - São Bernardo do Campo', ST_GeomFromText('POINT(-46.5650 -23.6944)'), '2026-11-12 17:00:00', 'Pendente'),

    (8, 'ENT-12352', 8, 8, 'Rua Vergueiro, 1500 - Vila Mariana, São Paulo', ST_GeomFromText('POINT(-46.6380 -23.5880)'), '2026-11-12 18:00:00', 'Cancelado'),

    (9, 'ENT-12353', 9, 9, 'Av. Alda, 400 - Centro, Diadema', ST_GeomFromText('POINT(-46.6220 -23.6860)'), '2026-11-12 19:00:00', 'A Caminho'),

    (10, 'ENT-12354', 10, NULL, 'Rua Tuiuti, 700 - Tatuapé, São Paulo', ST_GeomFromText('POINT(-46.5760 -23.5400)'), '2026-11-12 20:00:00', 'Pendente');

/* ===================
    ENDEREÇOS ENTREGA
    ================== */

    INSERT INTO enderecos_entrega
    (id, usuarios_id, rua, numero, bairro, cidade, coordenadas)
    VALUES
    (1, 1, 'Avenida Paulista', '1000', 'Bela Vista', 'São Paulo', ST_GeomFromText('POINT(-46.6533 -23.5632)')),
    (2, 2, 'Rua Augusta', '500', 'Consolação', 'São Paulo', ST_GeomFromText('POINT(-46.6530 -23.5505)')),
    (3, 3, 'Avenida Salgado Filho', '1500', 'Centro', 'Guarulhos', ST_GeomFromText('POINT(-46.5333 -23.4538)')),
    (4, 4, 'Rua Antônio Agu', '300', 'Centro', 'Osasco', ST_GeomFromText('POINT(-46.7917 -23.5325)')),
    (5, 5, 'Avenida Faria Lima', '2000', 'Pinheiros', 'São Paulo', ST_GeomFromText('POINT(-46.6910 -23.5700)')),
    (6, 6, 'Rua das Figueiras', '800', 'Jardim', 'Santo André', ST_GeomFromText('POINT(-46.5333 -23.6639)')),
    (7, 7, 'Avenida Kennedy', '1200', 'Jardim do Mar', 'São Bernardo do Campo', ST_GeomFromText('POINT(-46.5650 -23.6944)')),
    (8, 8, 'Rua Vergueiro', '1500', 'Vila Mariana', 'São Paulo', ST_GeomFromText('POINT(-46.6380 -23.5880)')),
    (9, 9, 'Avenida Alda', '400', 'Centro', 'Diadema', ST_GeomFromText('POINT(-46.6220 -23.6860)')),
    (10, 10, 'Rua Tuiuti', '700', 'Tatuapé', 'São Paulo', ST_GeomFromText('POINT(-46.5760 -23.5400)'));

/* ============
    ENTEGADORES
    =========== */

    INSERT INTO localizacao_entregadores
    (entregador_id, coordenadas)
    VALUES
    (1, ST_GeomFromText('POINT(-46.6320 -23.5510)')),
    (2, ST_GeomFromText('POINT(-46.6400 -23.5490)')),
    (3, ST_GeomFromText('POINT(-46.5350 -23.4550)')),
    (4, ST_GeomFromText('POINT(-46.7900 -23.5310)')),
    (5, ST_GeomFromText('POINT(-46.6880 -23.5620)')),
    (6, ST_GeomFromText('POINT(-46.5350 -23.6650)')),
    (7, ST_GeomFromText('POINT(-46.5670 -23.6950)')),
    (8, ST_GeomFromText('POINT(-46.6510 -23.5710)')),
    (9, ST_GeomFromText('POINT(-46.6240 -23.6870)')),
    (10, ST_GeomFromText('POINT(-46.7120 -23.5910)'));

