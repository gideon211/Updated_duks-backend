import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getNotifications);
router.get("/unread-count", authMiddleware, isAdmin, getUnreadCount);
router.patch("/:id/read", authMiddleware, isAdmin, markAsRead);
router.patch("/read-all", authMiddleware, isAdmin, markAllAsRead);
router.delete("/:id", authMiddleware, isAdmin, deleteNotification);

export default router;
