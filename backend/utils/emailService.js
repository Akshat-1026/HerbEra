import nodemailer from "nodemailer";
import config from "../config/index.js";
import { escapeHtml } from "./sanitize.js";

const transporter = config.smtpHost
  ? nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    })
  : null;

const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"Herb-Era" <${config.smtpFrom}>`,
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmation = async (order, user) => {
  const itemsHtml = order.orderItems
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><img src="${escapeHtml(i.image || "")}" width="50" style="border-radius:8px"/></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(i.name)} x${escapeHtml(String(i.qty))}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">\u20B9${(i.price * i.qty).toLocaleString("en-IN")}</td></tr>`
    )
    .join("");

  const discountRow = order.discountAmount > 0
    ? `<tr><td colspan="2" style="padding:6px 8px;color:#16a34a;">Discount (${escapeHtml(order.couponCode || "")})</td><td style="padding:6px 8px;text-align:right;color:#16a34a;">-\u20B9${order.discountAmount.toLocaleString("en-IN")}</td></tr>`
    : "";

  const gstRow = order.gstAmount > 0
    ? `<tr><td colspan="2" style="padding:6px 8px;">GST (${order.gstRate || 5}%)</td><td style="padding:6px 8px;text-align:right;">\u20B9${order.gstAmount.toLocaleString("en-IN")}</td></tr>`
    : "";

  const shippingRow = `<tr><td colspan="2" style="padding:6px 8px;">Shipping</td><td style="padding:6px 8px;text-align:right;">${order.shippingPrice === 0 ? "FREE" : `\u20B9${order.shippingPrice}`}</td></tr>`;

  const summaryHtml = `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td colspan="2" style="padding:6px 8px;">Subtotal</td><td style="padding:6px 8px;text-align:right;">\u20B9${(order.subtotal || order.totalPrice).toLocaleString("en-IN")}</td></tr>
      ${discountRow}
      ${shippingRow}
      ${gstRow}
      <tr><td colspan="2" style="padding:8px;border-top:2px solid #15803d;font-weight:bold;font-size:16px;">Total</td><td style="padding:8px;border-top:2px solid #15803d;text-align:right;font-weight:bold;font-size:16px;color:#15803d;">\u20B9${order.totalPrice.toLocaleString("en-IN")}</td></tr>
    </table>`;

  await sendMail({
    to: user.email,
    subject: `Order Confirmed \u2014 #${order.trackingNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <div style="background:#15803d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Order Confirmed!</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;">
          <p style="color:#374151;font-size:16px;">Hi <strong>${escapeHtml(user.name)}</strong>,</p>
          <p style="color:#6b7280;">Your order has been placed successfully.</p>
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Invoice:</strong> ${escapeHtml(order.invoiceNumber || "N/A")}</p>
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Tracking:</strong> <span style="color:#15803d;font-family:monospace;">${escapeHtml(order.trackingNumber)}</span></p>
          </div>
          <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          ${summaryHtml}
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.frontendUrl}/track-order?tracking=${escapeHtml(order.trackingNumber)}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Track Order</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#9ca3af;font-size:12px;">
          Herb-Era \u2014 Nature's Wisdom, Modern Wellness
        </div>
      </div>
    `,
  });
};

export const sendStatusUpdate = async (order, user) => {
  await sendMail({
    to: user.email,
    subject: `Order Update \u2014 ${order.status} \u2014 #${order.trackingNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <div style="background:#15803d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Order Update</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;">
          <p style="color:#374151;font-size:16px;">Hi <strong>${escapeHtml(user.name)}</strong>,</p>
          <p style="color:#6b7280;">Your order status has been updated to <strong style="color:#15803d;text-transform:capitalize;">${escapeHtml(order.status)}</strong>.</p>
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Tracking:</strong> <span style="color:#15803d;font-family:monospace;">${escapeHtml(order.trackingNumber)}</span></p>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.frontendUrl}/track-order?tracking=${escapeHtml(order.trackingNumber)}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Details</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#9ca3af;font-size:12px;">
          Herb-Era \u2014 Nature's Wisdom, Modern Wellness
        </div>
      </div>
    `,
  });
};

export const sendPasswordReset = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  await sendMail({
    to: user.email,
    subject: "Reset Your Herb-Era Password",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <div style="background:#15803d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Password Reset</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;">
          <p style="color:#374151;font-size:16px;">Hi <strong>${escapeHtml(user.name)}</strong>,</p>
          <p style="color:#6b7280;">You requested a password reset. Click below to set a new password.</p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${resetUrl}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
        <div style="padding:16px;text-align:center;color:#9ca3af;font-size:12px;">
          Herb-Era \u2014 Nature's Wisdom, Modern Wellness
        </div>
      </div>
    `,
  });
};

export const sendAdminOrderNotification = async (order, customerName) => {
  const itemsHtml = order.orderItems
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(i.name)} x${escapeHtml(String(i.qty))}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">\u20B9${(i.price * i.qty).toLocaleString("en-IN")}</td></tr>`
    )
    .join("");

  await sendMail({
    to: config.adminEmail,
    subject: `\u{1F6D2} New Order \u2014 #${order.trackingNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <div style="background:#15803d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">New Order Received!</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;">
          <p style="color:#374151;font-size:16px;">A new order has been placed.</p>
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Invoice:</strong> ${escapeHtml(order.invoiceNumber || "N/A")}</p>
            <p style="margin:0 0 4px;color:#374151;font-size:14px;"><strong>Tracking:</strong> <span style="color:#15803d;font-family:monospace;">${escapeHtml(order.trackingNumber)}</span></p>
            <p style="margin:0;color:#374151;font-size:14px;"><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          <div style="margin-top:16px;padding-top:12px;border-top:2px solid #15803d;text-align:right;">
            <span style="font-size:18px;font-weight:bold;color:#15803d;">Total: \u20B9${order.totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.frontendUrl}/admin/orders" style="display:inline-block;background:#15803d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View in Admin</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#9ca3af;font-size:12px;">
          Herb-Era \u2014 Nature's Wisdom, Modern Wellness
        </div>
      </div>
    `,
  });
};
