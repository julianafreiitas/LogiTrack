import { pool } from "../config/database.js";

const descricoes = {
  Entregue: { titulo: "Entrega concluída", tom: "orange" },
  "Em trânsito": { titulo: "Saiu para entrega", tom: "blue" },
  Pendente: { titulo: "Aguardando saída", tom: "green" },
  Atrasada: { titulo: "Entrega atrasada", tom: "red" },
  Cancelado: { titulo: "Entrega cancelada", tom: "red" },
};

const contagens = `
  COUNT(*) AS total,
  COALESCE(SUM(status = 'Entregue'), 0) AS concluidas,
  COALESCE(SUM(status = 'A Caminho' AND previsao >= NOW()), 0) AS emTransito,
  COALESCE(SUM(status = 'Pendente' AND previsao >= NOW()), 0) AS pendentes,
  COALESCE(SUM(status IN ('Pendente', 'A Caminho') AND previsao < NOW()), 0) AS atrasadas,
  COALESCE(SUM(status = 'Cancelado'), 0) AS canceladas
`;

export async function resumoDashboard(request, response) {
  const periodo = Number(request.query.periodo) === 30 ? 30 : 7;

  // Período atual: hoje e os (periodo - 1) dias anteriores, pela data do pedido.
  const [[atual]] = await pool.query(
    `SELECT ${contagens} FROM entregas WHERE checked_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [periodo - 1],
  );

  const [[anterior]] = await pool.query(
    `SELECT COUNT(*) AS total FROM entregas
     WHERE checked_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND checked_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [periodo * 2 - 1, periodo - 1],
  );

  const [porDia] = await pool.query(
    `WITH RECURSIVE dias AS (
       SELECT DATE_SUB(CURDATE(), INTERVAL ? DAY) AS dia
       UNION ALL
       SELECT DATE_ADD(dia, INTERVAL 1 DAY) FROM dias WHERE dia < CURDATE()
     )
     SELECT DATE_FORMAT(d.dia, '%Y-%m-%d') AS dia, COUNT(e.id_entregas) AS total
     FROM dias d
     LEFT JOIN entregas e ON DATE(e.checked_at) = d.dia
     GROUP BY d.dia
     ORDER BY d.dia`,
    [periodo - 1],
  );

  const [recentes] = await pool.query(
    `SELECT
       codigo,
       SUBSTRING_INDEX(endereco_destino, ' - ', -1) AS cidade,
       TIMESTAMPDIFF(MINUTE, atualizado_em, NOW()) AS minutos,
       CASE
         WHEN status IN ('Pendente', 'A Caminho') AND previsao < NOW() THEN 'Atrasada'
         WHEN status = 'A Caminho' THEN 'Em trânsito'
         ELSE status
       END AS situacao
     FROM entregas
     ORDER BY atualizado_em DESC
     LIMIT 3`,
  );

  const total = Number(atual.total);
  const totalAnterior = Number(anterior.total);

  response.json({
    periodo,
    metricas: {
      total,
      concluidas: Number(atual.concluidas),
      emTransito: Number(atual.emTransito),
      pendentes: Number(atual.pendentes),
      atrasadas: Number(atual.atrasadas),
      canceladas: Number(atual.canceladas),
      // null quando não há período anterior para comparar
      variacao: totalAnterior > 0 ? ((total - totalAnterior) / totalAnterior) * 100 : null,
    },
    entregasPorDia: porDia.map((linha) => ({ dia: linha.dia, total: Number(linha.total) })),
    atualizacoes: recentes.map((linha) => {
      const { titulo, tom } = descricoes[linha.situacao] || descricoes.Pendente;
      return {
        titulo: `${linha.codigo} · ${titulo}`,
        cidade: linha.cidade,
        minutos: Math.max(0, Number(linha.minutos)),
        tom,
      };
    }),
  });
}
