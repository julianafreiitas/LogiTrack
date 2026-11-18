import { Router } from "express";

import { pool } from "../config/database.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar);

// LISTAR ENTREGAS
// "Atrasada" não existe no banco: é uma entrega Pendente/A Caminho com a previsão já vencida.
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.codigo AS code,
        e.endereco_destino AS destination,
        COALESCE(m.nome, 'Sem motorista') AS driver,
        e.previsao AS eta,
        CASE
          WHEN e.status IN ('Pendente', 'A Caminho') AND e.previsao < NOW() THEN 'Atrasada'
          WHEN e.status = 'A Caminho' THEN 'Em trânsito'
          ELSE e.status
        END AS status
      FROM entregas e
      LEFT JOIN motoristas m ON m.id_motoristas = e.id_motorista
      ORDER BY e.codigo
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
