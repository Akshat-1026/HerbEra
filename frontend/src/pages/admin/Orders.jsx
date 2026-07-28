import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { toast } from "react-toastify";
import { Trash2, ChevronDown, Banknote, Eye, X, MapPin, User, Package, CreditCard, Truck, RotateCcw, Loader2 } from "lucide-react";

const nextStatuses = {
  pending: [{ value: "confirmed", label: "Confirmed" }],
  confirmed: [{ value: "processing", label: "Processing" }],
  processing: [{ value: "shipped", label: "Shipped" }],
  shipped: [{ value: "delivered", label: "Delivered" }],
};

const statusColors = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const refundStatusColors = {
  none: "",
  requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const Orders = () => {
  const { orders, fetchOrders, updateOrderStatus, markAsPaid, deleteOrder, refundOrder } = useAdmin();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [payDropdownOpen, setPayDropdownOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const customer = o.user?.name || o.guestName || "";
    const id = o._id || "";
    const addr = o.shippingAddress ? `${o.shippingAddress.address} ${o.shippingAddress.city} ${o.shippingAddress.postalCode}` : "";
    const tracking = o.trackingNumber || "";
    return customer.toLowerCase().includes(q) || id.toLowerCase().includes(q) || addr.toLowerCase().includes(q) || tracking.toLowerCase().includes(q);
  });

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!dropdownOpen && !payDropdownOpen) return;
    const close = () => { setDropdownOpen(null); setPayDropdownOpen(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen, payDropdownOpen]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order ${status}`);
      setDropdownOpen(null);
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      toast.success("Order deleted");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleMarkPaid = async (id, method) => {
    try {
      await markAsPaid(id, method);
      toast.success(`Order marked as paid via ${method}`);
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const handleRefund = async () => {
    if (!refundModal) return;
    setRefunding(true);
    try {
      const amt = refundAmount ? Number(refundAmount) : undefined;
      const result = await refundOrder(refundModal._id, amt, refundReason);
      toast.success(result.message || "Refund processed");
      setRefundModal(null);
      setRefundAmount("");
      setRefundReason("");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setRefunding(false);
    }
  };

  const columns = [
    { key: "_id", label: "Order ID", render: (row) => <span className="font-mono text-xs">#{row._id?.slice(-8)}</span> },
    { key: "user", label: "Customer", render: (row) => row.user?.name || row.guestName || "Guest" },
    { key: "shippingAddress", label: "Delivery Address", sortable: false, render: (row) => {
      const a = row.shippingAddress;
      if (!a) return <span className="text-zinc-400">—</span>;
      return (
        <span className="text-xs leading-tight">
          {a.address}{a.city ? `, ${a.city}` : ""}{a.postalCode ? ` - ${a.postalCode}` : ""}
        </span>
      );
    }},
    { key: "totalPrice", label: "Total", render: (row) => `₹${row.totalPrice?.toLocaleString() || "0"}` },
    { key: "paymentMethod", label: "Payment" },
    { key: "isPaid", label: "Paid", render: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.isPaid ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"}`}>
        {row.isPaid ? "Yes" : "No"}
      </span>
    )},
    { key: "status", label: "Status", render: (row) => {
      const s = row.status || (row.isDelivered ? "delivered" : "pending");
      const color = statusColors[s] || statusColors.pending;
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
          {s}
        </span>
      );
    }},
    { key: "refundStatus", label: "Refund", render: (row) => {
      if (!row.refundStatus || row.refundStatus === "none") return <span className="text-zinc-400">—</span>;
      const color = refundStatusColors[row.refundStatus] || "";
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
          {row.refundStatus} {row.refundAmount ? `(₹${row.refundAmount.toLocaleString()})` : ""}
        </span>
      );
    }},
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Orders" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by customer, order ID, address, or tracking..." />
        <div className="p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{filtered.length} orders</p>
          <Table
            columns={columns}
            data={filtered}
            renderActions={(row) => {
              const s = row.status || (row.isDelivered ? "delivered" : "pending");
              const nextOpts = nextStatuses[s];
              return (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setDetailOrder(row); }}
                  className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View order details"
                >
                  <Eye size={16} />
                </button>
                {!row.isPaid && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayDropdownOpen(payDropdownOpen === row._id ? null : row._id);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      title="Mark order as paid"
                    >
                      <Banknote size={14} /> Paid <ChevronDown size={10} />
                    </button>
                    {payDropdownOpen === row._id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
                        {["COD", "Razorpay", "UPI", "Bank Transfer", "Other"].map((method) => (
                          <button
                            key={method}
                            onClick={() => { handleMarkPaid(row._id, method); setPayDropdownOpen(null); }}
                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {row.isPaid && row.paymentMethod === "Razorpay" && row.refundStatus !== "completed" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setRefundModal(row); setRefundAmount(""); setRefundReason(""); }}
                    className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    title="Refund payment"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
                {nextOpts && nextOpts.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === row._id ? null : row._id);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update <ChevronDown size={12} />
                    </button>
                    {dropdownOpen === row._id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
                        {nextOpts.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusUpdate(row._id, opt.value)}
                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors capitalize"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setConfirmDelete(row._id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              );
            }}
          />

          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 w-full max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Delete Order</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )}

          {refundModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setRefundModal(null)}>
              <div className="rounded-2xl bg-white shadow-xl dark:bg-zinc-900 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Refund Payment</h3>
                  </div>
                  <button onClick={() => setRefundModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 text-sm">
                    <p className="text-zinc-500">Order Total</p>
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">₹{refundModal.totalPrice?.toLocaleString()}</p>
                    {refundModal.refundAmount > 0 && (
                      <p className="text-xs text-amber-600 mt-1">Already refunded: ₹{refundModal.refundAmount.toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Refund Amount (₹)</label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={`Full: ₹${refundModal.totalPrice - (refundModal.refundAmount || 0)}`}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    />
                    <p className="text-xs text-zinc-400 mt-1">Leave empty for full refund</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason</label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={3}
                      placeholder="Reason for refund..."
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 pb-6">
                  <button onClick={() => setRefundModal(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
                  <button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="px-5 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {refunding && <Loader2 size={16} className="animate-spin" />}
                    {refunding ? "Processing..." : "Process Refund"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDetailOrder(null)}>
              <div className="rounded-2xl bg-white shadow-xl dark:bg-zinc-900 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-4 rounded-t-2xl">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Order Details</h3>
                    <p className="text-xs text-zinc-400 font-mono">#{detailOrder._id}</p>
                  </div>
                  <button onClick={() => setDetailOrder(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Delivery Address</h4>
                    </div>
                    {detailOrder.shippingAddress ? (
                      <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
                        <p>{detailOrder.shippingAddress.address}</p>
                        <p>{detailOrder.shippingAddress.city}{detailOrder.shippingAddress.postalCode ? ` - ${detailOrder.shippingAddress.postalCode}` : ""}</p>
                        {detailOrder.shippingAddress.state && <p>{detailOrder.shippingAddress.state}</p>}
                        {detailOrder.shippingAddress.country && <p>{detailOrder.shippingAddress.country}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">No address provided</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Customer</h4>
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
                      <p>{detailOrder.user?.name || detailOrder.guestName || "Guest"}</p>
                      <p>{detailOrder.user?.email || detailOrder.guestEmail || "—"}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Order Status</h4>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[detailOrder.status || "pending"]}`}>
                          {detailOrder.status || "pending"}
                        </span>
                      </div>
                      {detailOrder.trackingNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Tracking:</span>
                          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{detailOrder.trackingNumber}</span>
                        </div>
                      )}
                      {detailOrder.invoiceNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Invoice:</span>
                          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{detailOrder.invoiceNumber}</span>
                        </div>
                      )}
                    </div>
                    {detailOrder.timeline?.length > 0 && (
                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Timeline</p>
                        <div className="space-y-2">
                          {[...detailOrder.timeline].reverse().map((t, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-[#2d5c49] dark:bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-zinc-800 dark:text-zinc-100 capitalize">{t.status}</span>
                                  <span className="text-xs text-zinc-400">{new Date(t.date).toLocaleString()}</span>
                                </div>
                                {t.note && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Items ({detailOrder.orderItems?.length || 0})</h4>
                    </div>
                    <div className="space-y-2">
                      {detailOrder.orderItems?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-zinc-800 dark:text-zinc-100 truncate">{item.name}</p>
                            {item.variantLabel && <p className="text-xs text-zinc-400">{item.variantLabel}</p>}
                          </div>
                          <span className="text-xs text-zinc-500">x{item.qty}</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-200">₹{item.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Payment Summary</h4>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                        <span>Subtotal</span>
                        <span>₹{detailOrder.subtotal?.toLocaleString()}</span>
                      </div>
                      {detailOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Discount{detailOrder.couponCode ? ` (${detailOrder.couponCode})` : ""}</span>
                          <span>-₹{detailOrder.discountAmount?.toLocaleString()}</span>
                        </div>
                      )}
                      {detailOrder.shippingPrice > 0 && (
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                          <span>Shipping</span>
                          <span>₹{detailOrder.shippingPrice}</span>
                        </div>
                      )}
                      {detailOrder.shippingPrice === 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Shipping</span>
                          <span>Free</span>
                        </div>
                      )}
                      {detailOrder.gstAmount > 0 && (
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                          <span>GST ({detailOrder.gstRate}%)</span>
                          <span>₹{detailOrder.gstAmount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 font-semibold text-zinc-800 dark:text-zinc-100">
                        <span>Total</span>
                        <span>₹{detailOrder.totalPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1 text-zinc-500 dark:text-zinc-400">
                        <span>Payment Method</span>
                        <span>{detailOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Paid</span>
                        <span>{detailOrder.isPaid ? `Yes (${new Date(detailOrder.paidAt).toLocaleDateString()})` : "No"}</span>
                      </div>
                      {detailOrder.refundStatus && detailOrder.refundStatus !== "none" && (
                        <>
                          <div className="flex justify-between pt-1 text-amber-600 dark:text-amber-400">
                            <span>Refund Status</span>
                            <span className="capitalize">{detailOrder.refundStatus}</span>
                          </div>
                          {detailOrder.refundAmount > 0 && (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                              <span>Refund Amount</span>
                              <span>₹{detailOrder.refundAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {detailOrder.refundedAt && (
                            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                              <span>Refunded On</span>
                              <span>{new Date(detailOrder.refundedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
