import ActivityLog from "../models/ActivityLog.js";
import { logActivity } from "../utils/activityLogger.js";

export const getActivityLogs = async (req, res) => {
  try {
    const { email, action, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (email) filter.email = { $regex: email, $options: "i" };
    if (action) filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "username email")
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    logActivity({
      user: req.user._id,
      email: req.user.email,
      action: "admin_view_activity",
      details: `Admin viewed activity logs${email ? ` filtered by ${email}` : ""}`,
      isAdmin: true,
    });

    res.json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("getActivityLogs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity logs" });
  }
};

export const getActivityLogsByCustomer = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find({ email: { $regex: email, $options: "i" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "username email")
        .lean(),
      ActivityLog.countDocuments({ email: { $regex: email, $options: "i" } }),
    ]);

    res.json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("getActivityLogsByCustomer error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity logs" });
  }
};

export const getDistinctActions = async (req, res) => {
  try {
    const actions = await ActivityLog.distinct("action");
    res.json({ success: true, actions });
  } catch (error) {
    console.error("getDistinctActions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch actions" });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalActivities,
      uniqueCustomers,
      actionBreakdown,
      thisWeekCount,
      todayCount,
      thisMonthCount,
    ] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.distinct("email").then((emails) => emails.filter(Boolean).length),
      ActivityLog.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfWeek } }),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      ActivityLog.countDocuments({
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalActivities,
        uniqueCustomers,
        thisWeek: thisWeekCount,
        today: todayCount,
        thisMonth: thisMonthCount,
        actionBreakdown: actionBreakdown.map((a) => ({ action: a._id, count: a.count })),
      },
    });
  } catch (error) {
    console.error("getActivityStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity stats" });
  }
};
