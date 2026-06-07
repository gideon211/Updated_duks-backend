import express from "express";
import { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, getInventoryAlerts } from "../controllers/inventoryController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllInventory);
router.get("/alerts", authMiddleware, isAdmin, getInventoryAlerts);
router.post("/", authMiddleware, isAdmin, createInventoryItem);
router.put("/:id", authMiddleware, isAdmin, updateInventoryItem);
router.delete("/:id", authMiddleware, isAdmin, deleteInventoryItem);

export default router;
