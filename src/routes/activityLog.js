import express from "express";
import { getActivityLogs, getActivityLogsByCustomer, getDistinctActions, getActivityStats } from "../controllers/activityLogController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getActivityLogs);
router.get("/stats", authMiddleware, isAdmin, getActivityStats);
router.get("/actions", authMiddleware, isAdmin, getDistinctActions);
router.get("/customer/:email", authMiddleware, isAdmin, getActivityLogsByCustomer);

export default router;
