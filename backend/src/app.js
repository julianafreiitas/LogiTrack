import cors from "cors";
import express from "express";
import helmet from "helmet";
import deliveryRoutes from "./routes/deliveryRoutes.js";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";

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
app.use("/api/rotas", deliveryRoutes);

app.use(errorHandler);

export default app;
