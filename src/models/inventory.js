import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  stock: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 0 },
  supplier: { type: String },
  unit: { type: String, default: "units" },
}, { timestamps: true });

export default mongoose.model("Inventory", inventorySchema);
