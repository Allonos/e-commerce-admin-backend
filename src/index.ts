import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/userRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";
import vehicelCategoriesRoutes from "./routes/vehicleCategoriesRoutes";
import heroVehiclesRoutes from "./routes/heroVehiclesRoutes";
import { swaggerSpec } from "./lib/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicles/categories", vehicelCategoriesRoutes);
app.use("/api/hero-vehicles", heroVehiclesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
