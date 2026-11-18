import { Router } from "express";

import { resumoDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/", resumoDashboard);

export default router;
