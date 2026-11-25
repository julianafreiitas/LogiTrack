import cors from "cors";
import express from "express";
import helmet from "helmet";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

const app = express();
const normalizarOrigem = (url) => url.trim().replace(/\/+$/, "");

const origensPermitidas = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://logitrack.10.189.87.231.sslip.io",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .filter(Boolean)
  .map(normalizarOrigem);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto LogiTrack",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.use(errorHandler);

export default app;