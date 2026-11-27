import pool from "./database.js";

const CAMPOS = {
  usuarios: {
    ultimo_acesso: "TIMESTAMP NULL DEFAULT NULL",
  },
  cadastro: {
    cpf: "VARCHAR(11) DEFAULT NULL",
    nascimento: "DATE DEFAULT NULL",
    cep: "VARCHAR(12) DEFAULT NULL",
    rua: "VARCHAR(150) DEFAULT NULL",
    numero: "VARCHAR(20) DEFAULT NULL",
    bairro: "VARCHAR(100) DEFAULT NULL",
    cidade: "VARCHAR(100) DEFAULT NULL",
    estado: "VARCHAR(50) DEFAULT NULL",
  },
  entregas: {
    endereco_coleta: "VARCHAR(255) DEFAULT NULL",
    data_coleta: "DATE DEFAULT NULL",
    tipo_servico: "VARCHAR(30) DEFAULT NULL",
    tamanho_pacote: "VARCHAR(20) DEFAULT NULL",
    peso_kg: "DECIMAL(8,2) DEFAULT NULL",
    urgencia: "VARCHAR(20) DEFAULT NULL",
    observacoes: "TEXT DEFAULT NULL",
    valor_frete: "DECIMAL(10,2) DEFAULT NULL",
    distancia_km: "DECIMAL(8,1) DEFAULT NULL",
    forma_pagamento: "VARCHAR(20) DEFAULT NULL",
    pago_em: "DATETIME DEFAULT NULL",
  },
};

async function colunaExiste(tabela, coluna) {
  const [[existente]] = await pool.query(
    `SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tabela, coluna],
  );
  return Boolean(existente);
}

async function indiceExiste(tabela, indice) {
  const [[existente]] = await pool.query(
    `SELECT 1 AS existe FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tabela, indice],
  );
  return Boolean(existente);
}

export async function migrarPortalCliente() {
  // Bases antigas usavam nomes diferentes. Renomear preserva os registros.
  if (!(await colunaExiste("cadastro", "id")) && await colunaExiste("cadastro", "id_cadastro")) {
    await pool.query("ALTER TABLE cadastro RENAME COLUMN id_cadastro TO id");
  }
  if (!(await colunaExiste("entregas", "codigo_rastreio")) && await colunaExiste("entregas", "codigo")) {
    await pool.query("ALTER TABLE entregas RENAME COLUMN codigo TO codigo_rastreio");
  }
  if (!(await colunaExiste("entregas", "endereco_coleta")) && await colunaExiste("entregas", "endereco_origem")) {
    await pool.query("ALTER TABLE entregas RENAME COLUMN endereco_origem TO endereco_coleta");
  }

  for (const [tabela, campos] of Object.entries(CAMPOS)) {
    for (const [coluna, definicao] of Object.entries(campos)) {
      if (!(await colunaExiste(tabela, coluna))) {
        await pool.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao}`);
      }
    }
  }

  if (!(await indiceExiste("cadastro", "uq_cadastro_cpf"))) {
    const [[duplicados]] = await pool.query(
      `SELECT COUNT(*) AS total FROM (
         SELECT cpf FROM cadastro
         WHERE cpf IS NOT NULL AND TRIM(cpf) <> ''
         GROUP BY cpf HAVING COUNT(*) > 1
       ) AS cpfs_duplicados`,
    );
    if (Number(duplicados.total) === 0) {
      await pool.query("ALTER TABLE cadastro ADD UNIQUE INDEX uq_cadastro_cpf (cpf)");
    }
  }

  for (const [tabela, coluna] of [["cadastro", "id"], ["entregas", "codigo_rastreio"], ["entregas", "id_cliente"], ["entregas", "coordenadas_destino"], ["entregas", "previsao"]]) {
    if (!(await colunaExiste(tabela, coluna))) {
      throw new Error(`Schema incompatível: coluna ${tabela}.${coluna} não encontrada.`);
    }
  }
}
