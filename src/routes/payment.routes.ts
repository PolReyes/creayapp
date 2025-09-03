import { Router } from "express";
import { createPreference } from "../controllers/payment.controller";

const router = Router();

router.post("/create-preference", createPreference);

export default router;

