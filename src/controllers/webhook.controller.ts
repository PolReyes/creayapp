import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Plan } from "../types/plan";
import { paymentClient } from "../config/mercadopago";

const prisma = new PrismaClient();

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { type, data } = req.body;

        if (type === "payment") {
            const paymentId = data.id;
            console.log("📩 Pago recibido, consultando detalles:", paymentId);

            // Consultar el pago en Mercado Pago
            const payment = await paymentClient.get({ id: paymentId });

            if (payment.status !== "approved") {
                console.log("⚠️ Pago no aprobado, ignorando");
                return res.sendStatus(200);
            }

            // Obtener external_reference
            const externalReference = payment.external_reference;
            if (!externalReference) {
                return res.status(400).json({ error: "Falta external_reference en el pago" });
            }

            const { userId, plan } = JSON.parse(externalReference) as {
                userId: number;
                plan: Plan;
            };

            let tokensToAdd = 0;
            if (plan === "free") tokensToAdd = 100;
            if (plan === "premium") tokensToAdd = 1000;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan,
                    tokensRemaining: tokensToAdd,
                },
            });

            console.log(`✅ Tokens recargados para usuario ${userId}: ${tokensToAdd}`);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error en webhook:", error);
        res.sendStatus(500);
    }
};
