import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN as string,
    options: { timeout: 5000 }
});

// Exportamos los clientes que necesitamos
export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
