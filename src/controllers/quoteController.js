import Quote from "../models/quote.js";

export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch quotes" });
  }
};

export const createQuote = async (req, res) => {
  try {
    const quote = await Quote.create(req.body);
    res.status(201).json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create quote" });
  }
};

export const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quote = await Quote.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });
    res.json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update quote" });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Quote deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete quote" });
  }
};
