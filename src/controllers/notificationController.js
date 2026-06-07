import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit)),
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
    ]);
    res.json({ success: true, notifications, total, unreadCount });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ success: true, count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
