import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api", routes);

// Middleware de errores centralizado
app.use(errorHandler);

export default app;