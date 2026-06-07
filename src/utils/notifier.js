import Notification from "../models/Notification.js";

let io = null;

export function setSocketIO(socketIO) {
  io = socketIO;
}

export function getIO() {
  return io;
}

export async function createNotification({ type, title, message, link = null, metadata = {} }) {
  try {
    const notification = await Notification.create({ type, title, message, link, metadata });
    if (io) {
      io.to("admin").emit("notification", notification);
      const unreadCount = await Notification.countDocuments({ read: false });
      io.to("admin").emit("unread_count", unreadCount);
    }
    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
}
