import { Request, Response } from "express";
import { preferenceClient } from "../config/mercadopago";
import { Plan } from "../types/plan";
import { ENV } from "../config/env";

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
