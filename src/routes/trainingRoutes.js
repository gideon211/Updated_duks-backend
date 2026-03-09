// src/routes/trainingRoutes.js
import express from "express";
import {
  getAllTrainings,
  getTrainingById,
  addTraining,
  updateTraining,
  deleteTraining,
  getAllRegistrations,
} from "../controllers/trainingController.js";

const router = express.Router();

// Public routes
router.get("/", getAllTrainings);
router.get("/:id", getTrainingById);

// Admin routes (add your auth/admin middleware here)
// Example: router.post("/", authMiddleware, adminMiddleware, addTraining);
router.post("/", addTraining);
router.put("/:id", updateTraining);
router.delete("/:id", deleteTraining);

// Get all registrations (Admin only)
router.get("/registrations/all", getAllRegistrations);

export default router;
