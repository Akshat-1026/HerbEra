import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Star, BadgeCheck, Flag, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const Reviews = () => {
  const { reviews, fetchReviews, deleteReview } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = reviews.filter((r) => {
    if (filter === "reported" && !r.isReported) return false;
    if (filter === "unapproved" && r.isApproved !== false) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.user?.name?.toLowerCase().includes(q) || r.product?.name?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q);
  });

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(review._id);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleToggleApproval = useCallback(async (review) => {
    try {
      await api.put(`/reviews/${review._id}/approve`);
      toast.success(review.isApproved === false ? "Review approved" : "Review rejected");
      fetchReviews();
    } catch {
      toast.error("Failed to update approval");
    }
  }, [fetchReviews]);

  const columns = [
    { key: "user", label: "User", render: (row) => row.user?.name || "Anonymous" },
    { key: "product", label: "Product", render: (row) => row.product?.name || "—" },
    { key: "rating", label: "Rating", render: (row) => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < row.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"} />
        ))}
      </div>
    )},
    { key: "comment", label: "Comment", render: (row) => (
      <div className="max-w-xs truncate">{row.comment || "—"}</div>
    )},
    { key: "images", label: "Images", render: (row) => (
      row.images?.length > 0 ? (
        <div className="flex gap-1">
          {row.images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="" className="h-8 w-8 rounded object-cover" />
          ))}
          {row.images.length > 3 && <span className="text-xs text-zinc-400 self-center">+{row.images.length - 3}</span>}
        </div>
      ) : <span className="text-zinc-400 text-xs">—</span>
    )},
    { key: "isVerifiedPurchase", label: "Verified", render: (row) => (
      row.isVerifiedPurchase ? <BadgeCheck size={16} className="text-emerald-500" /> : <span className="text-zinc-400 text-xs">—</span>
    )},
    { key: "isApproved", label: "Status", render: (row) => (
      <button onClick={() => handleToggleApproval(row)} className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${row.isApproved !== false ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200"}`}>
        {row.isApproved !== false ? "Approved" : "Rejected"}
      </button>
    )},
    { key: "isReported", label: "Reported", render: (row) => (
      row.isReported ? (
        <div className="flex items-center gap-1 text-red-500">
          <Flag size={12} />
          <span className="text-xs truncate max-w-[80px]" title={row.reportReason}>{row.reportReason || "Flagged"}</span>
        </div>
      ) : <span className="text-zinc-400 text-xs">—</span>
    )},
    { key: "helpfulCount", label: "Helpful", render: (row) => (
      <span className="text-xs text-zinc-500">{row.helpfulCount || 0}</span>
    )},
    { key: "createdAt", label: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Reviews" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search reviews..." />
        <div className="p-6">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} reviews</p>
            <div className="flex gap-2">
              {["all", "reported", "unapproved"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === f ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                >
                  {f === "all" ? "All" : f === "reported" ? `Reported (${reviews.filter((r) => r.isReported).length})` : `Pending (${reviews.filter((r) => r.isApproved === false).length})`}
                </button>
              ))}
            </div>
          </div>
          <Table columns={columns} data={filtered} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Reviews;
