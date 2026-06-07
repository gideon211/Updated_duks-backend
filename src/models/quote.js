import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  company: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  quantity: { type: Number, required: true },
  product: { type: String },
  estimatedTotal: { type: Number, default: 0 },
  notes: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "converted", "denied"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Quote", quoteSchema);
