import express from "express";
import { getAllPreorders, createPreorder, updatePreorderStatus, deletePreorder } from "../controllers/preorderController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllPreorders);
router.post("/", authMiddleware, isAdmin, createPreorder);
router.patch("/:id/status", authMiddleware, isAdmin, updatePreorderStatus);
router.delete("/:id", authMiddleware, isAdmin, deletePreorder);

export default router;
