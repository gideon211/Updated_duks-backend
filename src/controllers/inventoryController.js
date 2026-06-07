import Inventory from "../models/inventory.js";

export const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, inventory: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch inventory" });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create inventory item" });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Inventory item not found" });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update inventory item" });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Inventory item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete inventory item" });
  }
};

export const getInventoryAlerts = async (req, res) => {
  try {
    const critical = await Inventory.countDocuments({
      $expr: { $lte: ["$stock", { $divide: ["$reorderPoint", 2] }] },
    });
    const lowStock = await Inventory.countDocuments({
      $expr: { $and: [
        { $gt: ["$stock", { $divide: ["$reorderPoint", 2] }] },
        { $lte: ["$stock", "$reorderPoint"] },
      ] },
    });
    res.json({ success: true, critical, lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch inventory alerts" });
  }
};
