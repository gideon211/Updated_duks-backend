import Preorder from "../models/preorder.js";

export const getAllPreorders = async (req, res) => {
  try {
    const preorders = await Preorder.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, preorders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch preorders" });
  }
};

export const createPreorder = async (req, res) => {
  try {
    const preorder = await Preorder.create(req.body);
    res.status(201).json({ success: true, preorder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create preorder" });
  }
};

export const updatePreorderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const preorder = await Preorder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!preorder) return res.status(404).json({ success: false, message: "Preorder not found" });
    res.json({ success: true, preorder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update preorder" });
  }
};

export const deletePreorder = async (req, res) => {
  try {
    await Preorder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Preorder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete preorder" });
  }
};
