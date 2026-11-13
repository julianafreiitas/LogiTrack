import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";
import entregasRoutes from "./routes/entregas.js";
import healthRoutes from "./routes/healthRoutes.js";
import motoristasRoutes from "./routes/motoristas.js";

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
    message: "API do LogiTrack",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/motoristas", motoristasRoutes);

app.use(errorHandler);

export default app;
