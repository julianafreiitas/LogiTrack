import cors from "cors";
import express from "express";
import helmet from "helmet";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./healthRoutes.js"; // ou o caminho correto do healthRoutes

const app = express();

app.use(helmet());
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

// Regista as rotas de entregas (o endpoint será /api/deliveries)
app.use("/api", deliveryRoutes);

app.use(errorHandler);

export default app;