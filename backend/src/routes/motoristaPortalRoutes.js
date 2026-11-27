import { Router } from "express";

import {
  atualizarStatusDaEntrega,
  exigirMotorista,
  listarEntregasDoMotorista,
  listarMotoristasDoPortal,
  mapaDoMotorista,
  resumoDoMotorista,
} from "../controllers/motoristaPortalController.js";

const router = Router();

router.get("/", listarMotoristasDoPortal);
router.get("/:id/resumo", exigirMotorista, resumoDoMotorista);
router.get("/:id/entregas", exigirMotorista, listarEntregasDoMotorista);
router.get("/:id/entregas/:codigo/rota", exigirMotorista, obterRotaDaEntrega);
router.get("/:id/mapa", exigirMotorista, mapaDoMotorista);
router.patch("/:id/entregas/:codigo/status", exigirMotorista, atualizarStatusDaEntrega);

export default router;
