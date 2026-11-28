import { Router } from "express";
import {
  criarAdministrador,
  listarAdministradores,
  listarClientes,
  obterResumo,
  obterSolicitacaoCliente,
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/resumo", obterResumo);

router.get("/clientes", listarClientes);
router.get("/clientes/:id/solicitacao", obterSolicitacaoCliente);

router.get("/administradores", listarAdministradores);
router.post("/administradores", criarAdministrador);

export default router;
