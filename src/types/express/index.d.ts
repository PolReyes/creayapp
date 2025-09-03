export { };

declare global {
    namespace Express {
        interface User {
            userId: number;
            plan: string;
            tokensRemaining?: number; // 👈 opcional para evitar incompatibilidades
        }

        interface Request {
            user?: User;
        }
    }
}
