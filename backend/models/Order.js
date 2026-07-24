import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestEmail: {
      type: String,
    },
    guestName: {
      type: String,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        sku: { type: String },
        variantLabel: { type: String },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "PayPal or Card",
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountAmount: {
      type: Number,
      default: 0.0,
    },
    couponCode: {
      type: String,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    gstRate: {
      type: Number,
      default: 5,
    },
    gstAmount: {
      type: Number,
      default: 0.0,
    },
    gstBreakdown: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    trackingNumber: String,

    estimatedDelivery: Date,

    timeline: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],

    cancelReason: String,

    refundStatus: {
      type: String,
      enum: ["none", "requested", "approved", "completed"],
      default: "none",
    },

    paymentResult: {
      id: String,
      orderId: String,
      signature: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;