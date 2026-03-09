// src/models/TrainingRegistration.js
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      match: [/^\+?[0-9]{7,15}$/, "Invalid phone number"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      required: true,
    },
  },
  { _id: false }
);

const trainingRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow guest registrations
    },

    participant: {
      type: participantSchema,
      required: true,
    },

    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: true,
      index: true,
    },

    trainingName: {
      type: String,
      required: true,
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
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    schedule: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Mon-Wed-Fri 6:00 AM - 8:00 AM" or "Tues & Thurs 5:00 PM - 7:00 PM"
    },

    paystackReference: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    registrationStatus: {
      type: String,
      enum: ["confirmed", "in-progress", "completed", "cancelled"],
      default: "confirmed",
    },

    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for admin dashboards
trainingRegistrationSchema.index({ createdAt: -1 });
trainingRegistrationSchema.index({ userId: 1 });
trainingRegistrationSchema.index({ trainingId: 1 });
trainingRegistrationSchema.index({ paymentStatus: 1 });
trainingRegistrationSchema.index({ registrationStatus: 1 });

export default mongoose.model("TrainingRegistration", trainingRegistrationSchema);
