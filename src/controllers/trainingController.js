// src/controllers/trainingController.js
import Training from "../models/Training.js";

// ================= GET ALL TRAININGS (Public)
export const getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find();
    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    console.error("❌ Error fetching trainings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching trainings",
      error: error.message,
    });
  }
};

// ================= GET ONE TRAINING BY ID (Public)
export const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ 
        success: false, 
        message: "Training not found" 
      });
    }
    res.status(200).json({ success: true, training });
  } catch (error) {
    console.error("❌ Error fetching training:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching training",
      error: error.message,
    });
  }
};

// ================= ADD NEW TRAINING (Admin)
export const addTraining = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      format,
      category,
      status,
      maxParticipants,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      if (req.file.path) imageUrl = req.file.path;
      else if (req.file.url) imageUrl = req.file.url;
    }

    const trainingStatus = status ? status.toLowerCase() : "active";

    const newTraining = new Training({
      name,
      description: description || "",
      price: parseFloat(price),
      duration: duration || "4 weeks",
      format: format || "In-person",
      category: category || "",
      status: trainingStatus,
      available: true,
      imageUrl,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      currentParticipants: 0,
    });

    const savedTraining = await newTraining.save();

    res.status(201).json({
      success: true,
      message: "✅ Training added successfully",
      training: savedTraining,
    });
  } catch (error) {
    console.error("❌ Error adding training:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding training",
      error: error.message,
    });
  }
};

// ================= UPDATE A TRAINING (Admin)
export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    if (updates.status) {
      updates.status = updates.status.toLowerCase();
    }

    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }

    if (updates.maxParticipants !== undefined) {
      updates.maxParticipants = updates.maxParticipants 
        ? parseInt(updates.maxParticipants) 
        : null;
    }

    if (req.file) {
      if (req.file.path) updates.imageUrl = req.file.path;
      else if (req.file.url) updates.imageUrl = req.file.url;
    }

    const updatedTraining = await Training.findByIdAndUpdate(id, updates, { 
      new: true 
    });
    
    if (!updatedTraining) {
      return res.status(404).json({ 
        success: false, 
        message: "Training not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Training updated successfully",
      training: updatedTraining,
    });
  } catch (error) {
    console.error("❌ Error updating training:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating training",
      error: error.message,
    });
  }
};

// ================= DELETE A TRAINING (Admin)
export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTraining = await Training.findByIdAndDelete(id);

    if (!deletedTraining) {
      return res.status(404).json({ 
        success: false, 
        message: "Training not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Training deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting training:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting training",
      error: error.message,
    });
  }
};

// ================= GET ALL REGISTRATIONS (Admin)
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await TrainingRegistration.find()
      .populate("trainingId", "name category")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching registrations",
      error: error.message,
    });
  }
};
