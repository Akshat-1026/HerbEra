import User from "../models/User.js";

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cart.product"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= ADD TO CART ================= */
export const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // If product already in cart → update quantity
      user.cart[itemIndex].qty += qty || 1;
    } else {
      // Add new product
      user.cart.push({
        product: productId,
        qty: qty || 1,
      });
    }

    await user.save();

    res.json({
      message: "Product added to cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE CART ITEM ================= */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.qty = qty;

    await user.save();

    res.json({
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= REMOVE FROM CART ================= */
export const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.json({
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = [];

    await user.save();

    res.json({
      message: "Cart cleared",
      cart: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};