// Recria o banco de desenvolvimento: apaga as tabelas e roda 01-schema.sql e seed.sql.
// Uso (dentro da pasta backend): npm run db:reset
import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

if (process.env.NODE_ENV === "production") {
  console.error("Recusado: este script apaga todos os dados e não roda em produção.");
  process.exit(1);
}

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../database/init");
const arquivos = ["01-schema.sql", "seed.sql"];

let conexao;

try {
  conexao = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  console.log(`Banco: ${process.env.DB_NAME} em ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);

  const [tabelas] = await conexao.query(
    "SELECT table_name AS nome FROM information_schema.tables WHERE table_schema = DATABASE()",
  );
  await conexao.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const { nome } of tabelas) {
    await conexao.query(`DROP TABLE IF EXISTS \`${nome}\``);
  }
  await conexao.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log(`- ${tabelas.length} tabela(s) apagada(s)`);

  for (const arquivo of arquivos) {
    await conexao.query(await readFile(path.join(pasta, arquivo), "utf8"));
    console.log(`- ${arquivo} executado`);
  }

  const [[resumo]] = await conexao.query(
    "SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios, (SELECT COUNT(*) FROM motoristas) AS motoristas, (SELECT COUNT(*) FROM entregas) AS entregas, (SELECT COUNT(*) FROM rotas) AS rotas",
  );
  console.log(`Pronto! ${resumo.usuarios} usuários, ${resumo.motoristas} motoristas, ${resumo.entregas} entregas, ${resumo.rotas} rotas.`);
} catch (erro) {
  console.error("Erro ao recriar o banco:", erro.message);
  process.exitCode = 1;
} finally {
  await conexao?.end();
}
