import { Router } from "express";

import { cancelarPedido, consultarRastreio, listarClientes, listarPedidos, obterPerfil, resumoDoCliente, salvarPerfil } from "../controllers/clientePortalController.js";

const router = Router();

router.get("/", listarClientes);
router.get("/rastreio/:codigo", consultarRastreio);
router.patch("/rastreio/:codigo/cancelar", cancelarPedido);
router.get("/:id/pedidos", listarPedidos);
router.get("/:id/perfil", obterPerfil);
router.put("/:id/perfil", salvarPerfil);
router.get("/:id/resumo", resumoDoCliente);

export default router;
