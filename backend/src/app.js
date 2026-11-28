import cors from "cors";
import express from "express";
import helmet from "helmet";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import motoristasRoutes from "./routes/motoristasRoutes.js";
import rotasRoutes from "./routes/rotasRoutes.js";
import motoristaPortalRoutes from "./routes/motoristaPortalRoutes.js";
import clientePortalRoutes from "./routes/clientePortalRoutes.js";
import clienteAuthRoutes from "./routes/clienteAuthRoutes.js";
import authRoutes from "./routes/auth.js";
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
    origin(origin, callback) {
      // Sem origin (curl, health checks) ou origem na lista: permitido
      if (!origin || origensPermitidas.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto LogiTrack",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/rotas", rotasRoutes);
app.use("/api/portal/motorista", motoristaPortalRoutes);
app.use("/api/portal/cliente", clientePortalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/cliente", clienteAuthRoutes);
app.use("/api/usuarios", usuariosRoutes);
// Regista as rotas de entregas (o endpoint será /api/deliveries)
app.use("/api", healthRoutes);
app.use("/api/deliveries", deliveryRoutes);

app.use(errorHandler);

export default app;
