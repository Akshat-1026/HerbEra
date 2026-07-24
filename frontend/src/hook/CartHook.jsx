import { createContext, useContext, useEffect, useState } from "react";

// 1. CREATE CONTEXT
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

// 2. PROVIDER
export const CartProvider = ({ children }) => {
  const getCartId = (product) =>
    `${product._id}::${product.selectedVariant?.label || ''}`;

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("herbEraCart");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((item) => ({
      ...item,
      _cartId: item._cartId || getCartId(item),
    }));
  });

  // 💾 sync with localStorage
  useEffect(() => {
    localStorage.setItem("herbEraCart", JSON.stringify(cart));
  }, [cart]);

  // =====================
  // ADD TO CART
  // =====================
  const addToCart = (product, qty = 1) => {
    const cartId = getCartId(product);
    const variant = product.selectedVariant;
    const item = variant
      ? { ...product, price: variant.price, originalPrice: variant.originalPrice || product.originalPrice, selectedVariant: variant }
      : product;
    setCart((prev) => {
      const exist = prev.find((i) => i._cartId === cartId);

      if (exist) {
        return prev.map((i) =>
          i._cartId === cartId
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }

      return [...prev, { ...item, qty, _cartId: cartId }];
    });
  };

  // =====================
  // INCREASE QTY
  // =====================
  const increaseQty = (cartId) => {
    setCart((prev) =>
      prev.map((i) =>
        i._cartId === cartId ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  // =====================
  // DECREASE QTY
  // =====================
  const decreaseQty = (cartId) => {
    setCart((prev) =>
      prev.map((i) =>
        i._cartId === cartId
          ? { ...i, qty: i.qty > 1 ? i.qty - 1 : 1 }
          : i
      )
    );
  };

  // =====================
  // REMOVE ITEM
  // =====================
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((i) => i._cartId !== cartId));
  };

  // =====================
  // CLEAR CART
  // =====================
  const clearCart = () => {
    setCart([]);
  };

  // =====================
  // TOTAL PRICE
  // =====================
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. CUSTOM HOOK
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};