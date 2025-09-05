import { Request, Response } from "express";
import { preferenceClient } from "../config/mercadopago";
import { Plan } from "../types/plan";
import { ENV } from "../config/env";

import { Payment, MercadoPagoConfig } from "mercadopago";
import { PrismaClient } from "@prisma/client";
import { PayerRequest } from "mercadopago/dist/clients/payment/create/types";

const prisma = new PrismaClient();
const mpClient = new MercadoPagoConfig({ accessToken: ENV.MP_ACCESS_TOKEN! });

export const createPreference = async (req: Request, res: Response) => {
    try {
        const { userId, plan } = req.body as { userId: number; plan: Plan };

        const body = {
            items: [
                {
                    id: plan,
                    title: plan === "premium" ? "Plan Premium" : "Plan Free",
                    quantity: 1,
                    currency_id: "PEN", // Soles 🇵🇪
                    unit_price: plan === "premium" ? 10 : 0,
                },
            ],
            back_urls: {
                success: `${ENV.BASE_URL}/success`,
                failure: `${ENV.BASE_URL}/failure`,
                pending: `${ENV.BASE_URL}/pending`,
            },
            notification_url: `${ENV.BASE_URL}/api/webhooks/webhook`, // ⚡ Cambiar a URL pública en producción
            external_reference: JSON.stringify({ userId, plan }),
        };

        const result = await preferenceClient.create({ body });
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear preferencia" });
    }
};

/**
 * Checkout con tarjeta (Checkout API)
 */
export const checkoutPayment = async (req: Request, res: Response) => {
    try {
        const { token, payment_method_id, issuer_id, installments, userId, plan, payer } = req.body as {
            token: string;
            payment_method_id: string;
            issuer_id: number;
            installments: number;
            userId: number;
            plan: "free" | "premium";
            payer: PayerRequest;
        };

        if (!token || !userId || !plan) {
            return res.status(400).json({ error: "Faltan datos en la solicitud" });
        }
        console.log("📩 Datos recibidos en backend:", {
            token,
            payment_method_id,
            issuer_id,
            installments,
            userId,
            plan,
            payer,
        });
        const payment = new Payment(mpClient);

        const response = await payment.create({
            body: {
                transaction_amount: plan === "premium" ? 10 : 0, // monto en PEN
                token,
                description: `Suscripción ${plan}`,
                installments,
                payment_method_id,  // 👈 dinámico
                issuer_id,          // 👈 opcional, si lo envía el frontend
                payer,
            },
        });
        console.log("✅ Respuesta MP:", response);
        if (response.status === "approved") {
            // 🔥 Actualizar tokens del usuario
            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan,
                    tokensRemaining: plan === "premium" ? 1000 : 100,
                },
            });

            return res.json({
                success: true,
                message: "Pago aprobado ✅",
                payment: response,
            });
        }

        res.json({
            success: false,
            message: "Pago pendiente o rechazado ❌",
            payment: response,
        });
    } catch (error: any) {
        console.error("❌ Error en checkout:", error);
        return res.status(500).json({ error: error.message, details: error });
    }
};
