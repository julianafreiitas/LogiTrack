import { Router } from "express";

import { consultarRastreio, listarClientes, resumoDoCliente } from "../controllers/clientePortalController.js";

const router = Router();

router.get("/", listarClientes);
router.get("/rastreio/:codigo", consultarRastreio);
router.get("/:id/resumo", resumoDoCliente);

export default router;
