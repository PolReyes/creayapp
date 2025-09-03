import { Router } from "express";
import { createPreference, checkoutPayment } from "../controllers/payment.controller";

const router = Router();

// Checkout Pro (redirige al widget de Mercado Pago)
router.post("/create-preference", createPreference);

// Checkout API (tarjeta directa desde frontend)
router.post("/checkout", checkoutPayment);

export default router;

