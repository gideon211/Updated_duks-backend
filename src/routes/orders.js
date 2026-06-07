// src/routes/orders.js
import express from "express";
import { 
  getUserOrders, 
  getOrderById, 
  getAllOrders, 
  getOrderStats, 
  getRevenueTrend, 
  getPaymentsList, 
  getCustomers, 
  deleteOrder,
  batchDeleteOrders,
  deleteCustomerOrders,
  batchDeleteCustomerOrders,
  cancelOrder, 
  updateOrderStatus 
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==================== HELPER MIDDLEWARE ==================== */

// Admin check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required" 
    });
  }
  next();
};

/* ==================== USER ORDER ROUTES ==================== */

// Get logged-in user's orders
router.get("/my-orders", authMiddleware, getUserOrders);

// Cancel order (user can cancel their own orders)
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// Get single order by ID (must come after specific routes)
router.get("/:id", authMiddleware, getOrderById);

/* ==================== ADMIN ORDER ROUTES ==================== */

// Get order statistics (admin only)
router.get("/admin/stats", authMiddleware, requireAdmin, getOrderStats);

// Get all orders (admin only)  
router.get("/admin/all", authMiddleware, requireAdmin, getAllOrders);

// Update order status (admin only)
router.patch("/admin/:id/status", authMiddleware, requireAdmin, updateOrderStatus);

// Revenue trend (admin only)
router.get("/admin/revenue-trend", authMiddleware, requireAdmin, getRevenueTrend);

// Payments list (admin only)
router.get("/admin/payments", authMiddleware, requireAdmin, getPaymentsList);

// Customers list (admin only) - unique buyers from orders
router.get("/admin/customers", authMiddleware, requireAdmin, getCustomers);

// Delete order permanently (admin only)
router.delete("/admin/:id", authMiddleware, requireAdmin, deleteOrder);

// Batch delete orders (admin only)
router.post("/admin/batch-delete", authMiddleware, requireAdmin, batchDeleteOrders);

// Delete all orders for a customer (admin only)
router.delete("/admin/customer/:email", authMiddleware, requireAdmin, deleteCustomerOrders);

// Batch delete customer orders (admin only)
router.post("/admin/customer/batch-delete", authMiddleware, requireAdmin, batchDeleteCustomerOrders);

export default router;