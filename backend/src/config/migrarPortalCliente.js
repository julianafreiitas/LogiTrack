import pool from "./database.js";

const CAMPOS = {
  cadastro: {
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

export async function migrarPortalCliente() {
  for (const [tabela, campos] of Object.entries(CAMPOS)) {
    for (const [coluna, definicao] of Object.entries(campos)) {
      const [[existente]] = await pool.query(
        `SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tabela, coluna],
      );
      if (!existente) {
        await pool.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao}`);
      }
    }
  }
}
