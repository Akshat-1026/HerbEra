import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Star } from "lucide-react";
import { toast } from "react-toastify";

const Reviews = () => {
  const { reviews, fetchReviews, deleteReview } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = reviews.filter((r) => {
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{filtered.length} reviews</p>
          <Table columns={columns} data={filtered} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Reviews;
