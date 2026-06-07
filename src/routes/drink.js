import express from "express";
import {
  getAllDrinks,
  getDrinkById,
  getDrinksByCategory,
  addDrink,
  updateDrink,
  deleteDrink,
} from "../controllers/drinkController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js"; // updated import
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * ==========================
 * PUBLIC ROUTES
 * ==========================
 */

// Get all drinks (anyone can access)
router.get("/", getAllDrinks);

// Get drinks grouped by category (admin)
router.get("/stats/category", authMiddleware, isAdmin, getDrinksByCategory);

// Get single drink by ID
router.get("/:id", getDrinkById);

/**
 * ==========================
 * ADMIN ROUTES
 * ==========================
 *
 * These routes require:
 * - A valid token (authMiddleware)
 * - Admin privileges (isAdmin)
 * - Optionally, image upload via Multer
 */

// Add a new drink (with optional image upload)
router.post(
  "/add",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  addDrink
);

// Update a drink (image can also be updated)
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  updateDrink
);

// Delete a drink by ID
router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  deleteDrink
);

export default router;
