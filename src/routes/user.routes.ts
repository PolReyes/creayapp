import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { tokensGuard } from "../middlewares/tokens.guard";

const router = Router();

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Perfil del usuario",
        user: req.user,
    });
});

router.post("/consulta-ia", tokensGuard, (req, res) => {
    res.json({
        message: "Consulta procesada 🚀",
        tokensRemaining: req.user?.tokensRemaining,
    });
});


export default router;
