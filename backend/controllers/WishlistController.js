import User from "../models/User.js";

/* GET WISHLIST */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("Wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.Wishlist);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ADD TO WISHLIST */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.Wishlist.includes(productId)) {
      user.Wishlist.push(productId);
      await user.save();
    }

    res.json(user.Wishlist);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* REMOVE FROM WISHLIST */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.Wishlist = user.Wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.json(user.Wishlist);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};