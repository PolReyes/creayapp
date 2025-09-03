// src/config/jwt.ts
export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("❌ JWT_SECRET no está definido en .env");
    }
    return secret;
}

