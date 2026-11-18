import { Router } from "express";

import { listarRotas } from "../controllers/rotasController.js";

const router = Router();

router.get("/", listarRotas);

export default router;
