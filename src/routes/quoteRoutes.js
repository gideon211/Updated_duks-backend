import express from "express";
import { getAllQuotes, createQuote, updateQuoteStatus, deleteQuote } from "../controllers/quoteController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllQuotes);
router.post("/", authMiddleware, isAdmin, createQuote);
router.patch("/:id/status", authMiddleware, isAdmin, updateQuoteStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteQuote);

export default router;
