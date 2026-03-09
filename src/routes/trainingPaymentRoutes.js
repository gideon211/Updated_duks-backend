// src/routes/trainingPaymentRoutes.js
import express from "express";
import {
  initializeTrainingPayment,
  webhookTrainingPayment,
  verifyTrainingPayment,
} from "../controllers/trainingPaymentController.js";

const router = express.Router();

// Initialize training payment (requires authentication - optional)
// If you want guests to register without login, remove auth middleware
router.post("/initialize", initializeTrainingPayment);

// Paystack webhook for training payments
router.post("/webhook", webhookTrainingPayment);

// Verify training payment (fallback)
router.get("/verify/:reference", verifyTrainingPayment);

export default router;
