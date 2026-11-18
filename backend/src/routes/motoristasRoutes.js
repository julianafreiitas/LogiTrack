import { Router } from "express";

import {
  atualizarMotorista,
  criarMotorista,
  excluirMotorista,
  listarMotoristas,
} from "../controllers/motoristasController.js";

const router = Router();

router.get("/", listarMotoristas);
router.post("/", criarMotorista);
router.put("/:id", atualizarMotorista);
router.delete("/:id", excluirMotorista);

export default router;
