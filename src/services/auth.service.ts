// src/services/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "a11fe14d4af28786d3cbb4c6df5c54e1e0dbf1a6a3ae109ba3974baf55a2c507";

// src/services/auth.service.ts
export const register = async (
    email: string,
    password: string,
    firstname: string,
    lastname: string
) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw { status: 400, message: "El usuario ya existe" };

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, passwordHash, firstname, lastname },
    });

    // 👇 Generamos el token directamente al registrar
    const token = generateToken(user.id, user.plan);

    // Retornamos también info básica del usuario
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            plan: user.plan,
            tokensRemaining: user.tokensRemaining,
        },
    };
};

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: "Usuario no encontrado" };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw { status: 401, message: "Credenciales inválidas" };

    const token = generateToken(user.id, user.plan);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            plan: user.plan,
            tokensRemaining: user.tokensRemaining,
        },
    };
};


// Función para generar JWT
const generateToken = (userId: number, plan: string) => {
    return jwt.sign({ userId, plan }, JWT_SECRET, { expiresIn: "1h" });
};

