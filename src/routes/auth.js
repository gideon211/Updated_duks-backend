import express from "express";
import { signup, login, logout, refresh, getMe, getUserCount, getAllUsers, deleteUser, batchDeleteUsers } from "../controllers/authController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, getMe);
router.get("/users/count", authMiddleware, isAdmin, getUserCount);
router.get("/users", authMiddleware, isAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
router.post("/users/batch-delete", authMiddleware, isAdmin, batchDeleteUsers);

export default router;
