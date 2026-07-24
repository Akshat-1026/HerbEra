import Coupon from "../models/Coupon.js";
import { broadcast } from "../utils/sseManager.js";

export const getCoupons = async (req, res) => {
  try {
    await Coupon.updateMany(
      { isActive: true, expiry: { $lt: new Date() } },
      { $set: { isActive: false } }
    );
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiry } = req.body;
    const coupon = await Coupon.create({ code, discount, expiry });
    broadcast("site-update", { type: "coupon", action: "created" });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: "Please provide a coupon code",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      return res.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.json({
        valid: false,
        message: "Coupon is no longer active",
      });
    }

    if (new Date(coupon.expiry) < new Date()) {
      await Coupon.findByIdAndUpdate(coupon._id, { isActive: false });
      return res.json({
        valid: false,
        message: "Coupon has expired",
      });
    }

    res.json({
      valid: true,
      discount: coupon.discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    broadcast("site-update", { type: "coupon", action: "deleted" });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
