import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        plan: string;
        tokensRemaining?: number;
    };
}

interface JwtPayloadCustom extends jwt.JwtPayload {
    userId: number;
    plan: string;
}

export const tokensGuard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token inválido" });
        }

        const decoded = jwt.verify(token, getJwtSecret()) as JwtPayloadCustom;


        if (!decoded.userId || !decoded.plan) {
            return res.status(401).json({ message: "Token inválido" });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (user.tokensRemaining <= 0) {
            return res.status(403).json({ message: "Tokens agotados" });
        }

        // Restamos un token
        await prisma.user.update({
            where: { id: user.id },
            data: { tokensRemaining: { decrement: 1 } },
        });

        req.user = {
            userId: user.id,
            plan: user.plan,
            tokensRemaining: user.tokensRemaining - 1,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};
