import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import config from "../config/index.js";

export const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await TokenBlacklist.create({ token, expiresAt });
  } catch (err) {
    console.error("Failed to blacklist token:", err.message);
  }
};

export const isTokenBlacklisted = async (token) => {
  try {
    const exists = await TokenBlacklist.findOne({ token }).lean();
    return !!exists;
  } catch {
    return false;
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: "Admin access required" });
};

const extractToken = (req) => {
  const fromCookie = req.cookies?.jwt;
  if (fromCookie && fromCookie !== "null" && fromCookie !== "undefined") return fromCookie;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const fromHeader = authHeader.split(" ")[1];
    if (fromHeader && fromHeader !== "null" && fromHeader !== "undefined") return fromHeader;
  }
  return null;
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    if (await isTokenBlacklisted(token)) return next();

    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select("-password");
    if (user) req.user = user;
  } catch {}
  next();
};

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }

    const userId = decoded.id || decoded.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};