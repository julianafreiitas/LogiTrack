import { Router } from "express";

import { pool } from "../config/database.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar);

// LISTAR MOTORISTAS
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_motoristas AS id, nome, veiculo, cidade_base AS cidade, entregas_hoje AS entregasHoje, status
      FROM motoristas
      ORDER BY nome
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
