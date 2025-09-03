// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        const result = await authService.register(email, password, firstname, lastname);

        res.json({
            success: true,
            token: result.token,
            user: result.user, // 👈 ya devuelve el perfil
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            token: result.token,
            user: result.user,
        });
    } catch (error: any) {
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }
        next(error);
    }
};


