import { Router } from "express";

import {
  atualizarStatusDaEntrega,
  atualizarPerfilDoMotorista,
  exigirMotorista,
  listarEntregasDoMotorista,
  listarMotoristasDoPortal,
  mapaDoMotorista,
  obterPerfilDoMotorista,
  resumoDoMotorista,
} from "../controllers/motoristaPortalController.js";

const router = Router();

router.get("/", listarMotoristasDoPortal);
router.get("/:id/resumo", exigirMotorista, resumoDoMotorista);
router.get("/:id/entregas", exigirMotorista, listarEntregasDoMotorista);
router.get("/:id/mapa", exigirMotorista, mapaDoMotorista);
router.get("/:id/perfil", exigirMotorista, obterPerfilDoMotorista);
router.put("/:id/perfil", exigirMotorista, atualizarPerfilDoMotorista);
router.patch("/:id/entregas/:codigo/status", exigirMotorista, atualizarStatusDaEntrega);

export default router;
