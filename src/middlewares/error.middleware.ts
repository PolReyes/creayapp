// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";

// Definimos un tipo de error personalizado
interface AppError extends Error {
    status?: number;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌ Error capturado:", err);

    const statusCode = err.status || 500;
    const message =
        err.message || "Ha ocurrido un error interno en el servidor";

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
    });
};