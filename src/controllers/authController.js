import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { logActivity } from "../utils/activityLogger.js";

// =======================================================
// Helper: Generate Tokens (FIXED - includes isAdmin)
// =======================================================
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    isAdmin: user.isAdmin,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET); // never expires

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET); // also never expires

  return { token, refreshToken };
};


// =======================================================
// Helper: Fixed Admin Check
// =======================================================
const isFixedAdmin = (email, password) => {
  const admins = [
    {
      email: process.env.ADMIN_EMAIL_1,
      password: process.env.ADMIN_PASSWORD_1,
    },
    {
      email: process.env.ADMIN_EMAIL_2,
      password: process.env.ADMIN_PASSWORD_2,
    },
    {
      email: process.env.ADMIN_EMAIL_3,
      password: process.env.ADMIN_PASSWORD_3,
    },
  ];

  return admins.find(
    (admin) =>
      admin.email &&
      admin.password &&
      email.trim().toLowerCase() === admin.email.toLowerCase() &&
      password === admin.password
  );
};

// =======================================================
// SIGNUP Controller
// =======================================================
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      isAdmin: false,
    });

    const { token, refreshToken } = generateTokens(user);

    logActivity({
      user: user._id,
      email: user.email,
      action: "signup",
      details: `User ${user.username} created an account`,
      ip: req.ip,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      refreshToken,
      role: "user",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// LOGIN Controller (FIXED)
// =======================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check fixed admin credentials
    const matchedAdmin = isFixedAdmin(email, password);
    if (matchedAdmin) {
      let admin = await User.findOne({ email: matchedAdmin.email });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await User.create({
          username: matchedAdmin.email.split("@")[0],
          email: matchedAdmin.email,
          passwordHash: hashedPassword,
          isAdmin: true,
        });
      } else if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
      }

      const { token, refreshToken } = generateTokens(admin); // includes isAdmin:true

      logActivity({
        user: admin._id,
        email: admin.email,
        action: "login",
        details: `Admin logged in`,
        ip: req.ip,
        isAdmin: admin.isAdmin,
      });

      return res.status(200).json({
        message: "Admin logged in successfully",
        token,
        refreshToken,
        role: "admin",
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
        },
      });
    }

    // Regular user login
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const { token, refreshToken } = generateTokens(user);

    logActivity({
      user: user._id,
      email: user.email,
      action: "login",
      details: `User ${user.username} logged in`,
      ip: req.ip,
      isAdmin: user.isAdmin,
    });

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      role: user.isAdmin ? "admin" : "user",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// LOGOUT Controller
// =======================================================
export const logout = (req, res) => {
  res.json({ message: "Logout successful — remove token on client side" });
};

// =======================================================
// REFRESH TOKEN Controller (uses isAdmin)
// =======================================================
export const refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token required" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });

    const newAccessToken = jwt.sign(
      { id: decoded.id, isAdmin: decoded.isAdmin }, // preserve admin flag
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Access token refreshed successfully",
      token: newAccessToken,
    });
  });
};

// =======================================================
// GET CURRENT USER Controller
// =======================================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: user.isAdmin ? "Logged in as Admin" : "Logged in as User",
      user,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET TOTAL USER COUNT (Admin only) */
export const getUserCount = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    res.json({ success: true, total, thisMonth });
  } catch (err) {
    console.error("getUserCount error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET ALL USERS (Admin only) */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted permanently" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const batchDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided" });
    }
    const result = await User.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error("batchDeleteUsers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
