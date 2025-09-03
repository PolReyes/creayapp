import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Plan } from "../types/plan";

const prisma = new PrismaClient();

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { type, data } = req.body;

        if (type === "payment") {
            const paymentId = data.id;
            console.log("📩 Pago recibido:", paymentId);

            // ⚡ Lo ideal es consultar Mercado Pago con paymentId para validar
            const externalReference = data.external_reference;
            if (!externalReference) {
                return res.status(400).json({ error: "Falta external_reference" });
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
