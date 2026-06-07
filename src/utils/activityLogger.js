import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({
  user = null,
  email = null,
  action,
  details = "",
  metadata = {},
  ip = null,
  isAdmin = false,
}) {
  if (isAdmin) return; // skip admin activity
  try {
    await ActivityLog.create({ user, email, action, details, metadata, ip });
  } catch (err) {
    console.error("logActivity error:", err);
  }
}
