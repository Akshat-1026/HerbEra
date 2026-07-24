import PDFDocument from "pdfkit";
import config from "../config/index.js";

export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // --- Header ---
    doc
      .rect(0, 0, 595.28, 80)
      .fill("#15803d");

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#ffffff")
      .text(config.businessName, 40, 20, { continued: true })
      .fontSize(10)
      .text("  TAX INVOICE", { align: "right" });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#ffffff")
      .text(config.businessAddress, 40, 48)
      .text(`GSTIN: ${config.gstin}  |  State: ${config.businessState}`, 40, 60);

    // --- Invoice meta ---
    let y = 100;
    doc.fillColor("#000000");
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Invoice No:", 40, y);
    doc.font("Helvetica").text(order.invoiceNumber || "N/A", 130, y);
    doc.font("Helvetica-Bold").text("Date:", 350, y);
    doc.font("Helvetica").text(new Date(order.createdAt).toLocaleDateString("en-IN"), 400, y);

    y += 16;
    doc.font("Helvetica-Bold").text("Tracking:", 40, y);
    doc.font("Helvetica").text(order.trackingNumber, 130, y);
    doc.font("Helvetica-Bold").text("Payment:", 350, y);
    doc.font("Helvetica").text(order.paymentMethod, 400, y);

    // --- Billing To ---
    y += 30;
    doc.font("Helvetica-Bold").fontSize(10).text("Bill To:", 40, y);
    y += 14;
    doc.font("Helvetica").fontSize(9);
    const addr = order.shippingAddress;
    const customerName = addr.name || order.guestName || order.user?.name || "Customer";
    doc.text(customerName, 40, y);
    y += 12;
    doc.text(addr.address, 40, y);
    y += 12;
    doc.text(`${addr.city}, ${addr.postalCode}`, 40, y);
    y += 12;
    doc.text(`${addr.state || ""} ${addr.country || "India"}`, 40, y);
    if (order.guestEmail || order.user?.email) {
      y += 12;
      doc.text(order.guestEmail || order.user?.email, 40, y);
    }

    // --- Items Table ---
    y += 30;
    const tableTop = y;
    const colX = [40, 50, 260, 310, 360, 440, 500];

    // Table header
    doc
      .rect(40, y - 4, 515, 18)
      .fill("#f0fdf4");
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#000000")
      .text("#", colX[0], y, { width: 10 })
      .text("Item", colX[1], y, { width: 210 })
      .text("HSN", colX[2], y, { width: 50 })
      .text("Qty", colX[3], y, { width: 50 })
      .text("Rate", colX[4], y, { width: 80 })
      .text("Amount", colX[5], y, { width: 70 });

    y += 18;
    doc.font("Helvetica").fontSize(8);

    order.orderItems.forEach((item, i) => {
      if (y > 680) {
        doc.addPage();
        y = 40;
      }

      const lineAmount = item.price * item.qty;
      doc
        .text(String(i + 1), colX[0], y, { width: 10 })
        .text(item.name + (item.variantLabel ? ` (${item.variantLabel})` : ""), colX[1], y, { width: 210 })
        .text(item.hsnCode || "1211", colX[2], y, { width: 50 })
        .text(String(item.qty), colX[3], y, { width: 50 })
        .text(`Rs. ${item.price.toLocaleString("en-IN")}`, colX[4], y, { width: 80 })
        .text(`Rs. ${lineAmount.toLocaleString("en-IN")}`, colX[5], y, { width: 70 });

      y += 16;
    });

    // --- Totals ---
    y += 6;
    doc.moveTo(40, y).lineTo(555, y).stroke("#e5e7eb");
    y += 10;

    const rightX = 440;
    const labelX = 350;

    const drawLine = (label, value, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      doc.text(label, labelX, y, { width: 90, align: "right" });
      doc.text(value, rightX, y, { width: 115, align: "right" });
      y += 14;
    };

    drawLine("Subtotal:", `Rs. ${order.subtotal.toLocaleString("en-IN")}`);

    if (order.discountAmount > 0) {
      doc.fillColor("#16a34a");
      drawLine(`Discount (${order.couponCode || ""}):`, `-Rs. ${order.discountAmount.toLocaleString("en-IN")}`);
      doc.fillColor("#000000");
    }

    drawLine("Shipping:", order.shippingPrice === 0 ? "FREE" : `Rs. ${order.shippingPrice.toLocaleString("en-IN")}`);

    // GST breakdown
    if (order.gstAmount > 0) {
      const bd = order.gstBreakdown || {};
      if (bd.cgst > 0) drawLine(`CGST (${(order.gstRate / 2).toFixed(1)}%):`, `Rs. ${bd.cgst.toLocaleString("en-IN")}`);
      if (bd.sgst > 0) drawLine(`SGST (${(order.gstRate / 2).toFixed(1)}%):`, `Rs. ${bd.sgst.toLocaleString("en-IN")}`);
      if (bd.igst > 0) drawLine(`IGST (${order.gstRate}%):`, `Rs. ${bd.igst.toLocaleString("en-IN")}`);
    }

    // Grand total
    y += 4;
    doc.moveTo(labelX, y).lineTo(555, y).stroke("#000000");
    y += 6;
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Total Payable:", labelX, y, { width: 90, align: "right" });
    doc.text(`Rs. ${order.totalPrice.toLocaleString("en-IN")}`, rightX, y, { width: 115, align: "right" });

    // --- Footer ---
    y += 40;
    doc.moveTo(40, y).lineTo(555, y).stroke("#e5e7eb");
    y += 14;
    doc.font("Helvetica").fontSize(8).fillColor("#6b7280");
    doc.text("This is a computer-generated invoice. No signature required.", 40, y, { align: "center" });
    y += 12;
    doc.text(`${config.businessName}  |  ${config.businessAddress}  |  GSTIN: ${config.gstin}`, 40, y, { align: "center" });
    y += 12;
    doc.text("For queries, contact: " + config.adminEmail, 40, y, { align: "center" });

    doc.end();
  });
}
