// src/routes/index.ts
// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import paymentRoutes from "./payment.routes";
import webhookRoutes from "./webhook.routes";

const router = Router();

// ✅ Agrupamos todas las rutas
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes); // 👉 para checkout con Mercado Pago
router.use("/webhooks", webhookRoutes); // 👉 para recibir notificaciones

// Ruta base
router.get("/", (req, res) => {
    res.json({ message: "API funcionando 🚀" });
});

export default router;
