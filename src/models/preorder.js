import mongoose from "mongoose";

const preorderSchema = new mongoose.Schema({
  product: { type: String, required: true },
  customer: { type: String, required: true },
  email: { type: String },
  quantity: { type: Number, required: true },
  deliveryDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Preorder", preorderSchema);
