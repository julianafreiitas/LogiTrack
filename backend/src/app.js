import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js"; // 1. Importe a nova rota de entregas

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api", deliveryRoutes); // 2. Registre as rotas de entregas (o endpoint será /api/deliveries)

app.use(errorHandler);

export default app;