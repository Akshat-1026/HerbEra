import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../middleware/validate.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  googleLogin,
} from "../controllers/authController.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", protect, logoutUser);
router.post("/google", googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.put("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/users/:id/make-admin", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isAdmin = true;
    await user.save();
    res.json({ message: "User updated to admin", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
