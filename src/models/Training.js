// src/models/Training.js
import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: String,
      default: "4 weeks",
      trim: true,
    },
    format: {
      type: String,
      default: "In-person",
      enum: ["In-person", "Online", "Hybrid"],
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "coming soon"],
      default: "active",
    },
    available: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    maxParticipants: {
      type: Number,
      default: null, // null = unlimited
      min: [0, "Max participants cannot be negative"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, "Current participants cannot be negative"],
    },
  },
  { timestamps: true }
);

// Index for querying active trainings
trainingSchema.index({ status: 1, available: 1 });

export default mongoose.model("Training", trainingSchema);
