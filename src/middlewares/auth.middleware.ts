import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        plan: string;
        tokensRemaining?: number; // 🔹 opcional
    };
}

interface JwtPayloadCustom extends jwt.JwtPayload {
    userId: number;
    plan: string;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token inválido" });
        }

        // ✅ Ahora TS sabe que token es string
        const decoded = jwt.verify(token, getJwtSecret()) as JwtPayloadCustom;

        if (!decoded || !decoded.userId || !decoded.plan) {
            return res.status(401).json({ message: "Token inválido" });
        }

        req.user = { userId: decoded.userId, plan: decoded.plan };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" + error });
    }
};

