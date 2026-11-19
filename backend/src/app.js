import cors from "cors";
import express from "express";
import helmet from "helmet";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import motoristasRoutes from "./routes/motoristasRoutes.js";
import rotasRoutes from "./routes/rotasRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", (process.env.FRONTEND_URL || "http://logitrack.10.189.87.231.sslip.io")],
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
// Regista as rotas de entregas (o endpoint será /api/deliveries)
app.use("/api", healthRoutes);
app.use("/api/deliveries", deliveryRoutes);

app.use(errorHandler);

export default app;