import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import config from "../config/index.js";
import { sendPasswordReset } from "../utils/emailService.js";
import { blacklistToken } from "../middleware/authMiddleware.js";

const googleClient = new OAuth2Client();

const isProduction = config.nodeEnv === "production";

const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });
};

const PASSWORD_MIN_LENGTH = 8;

const isStrongPassword = (pw) => {
  if (!pw || typeof pw !== "string") return false;
  if (pw.length < PASSWORD_MIN_LENGTH) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  return true;
};

/* ================= REGISTER ================= */

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, and a number",
      });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name: String(name).trim(), email: String(email).toLowerCase(), password: hashed });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= LOGOUT ================= */

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      await blacklistToken(token);
    }
    res.clearCookie("jwt", { path: "/" });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= FORGOT PASSWORD ================= */

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If an account exists with that email, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    try {
      await sendPasswordReset(user, resetToken);
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }

    res.json({ message: "If an account exists with that email, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= RESET PASSWORD ================= */

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, and a number",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET PROFILE ================= */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE PROFILE ================= */

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters with uppercase, lowercase, and a number",
        });
      }
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    const updated = await user.save();
    const token = generateToken(updated._id);
    setTokenCookie(res, token);

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      isAdmin: updated.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GOOGLE LOGIN ================= */

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ message: "Google login is not configured" });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ message: "Invalid Google credential" });
      }
    } catch {
      return res.status(401).json({ message: "Invalid Google credential" });
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: crypto.randomBytes(32).toString("hex"),
        googleId,
        isAdmin: false,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
