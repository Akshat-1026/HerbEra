import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const Coupons = () => {
  const { coupons, fetchCoupons, createCoupon, deleteCoupon } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", expiry: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = coupons.filter((c) =>
    !searchQuery || c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(form);
      toast.success("Coupon created");
      setOpen(false);
      setForm({ code: "", discount: "", expiry: "" });
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await deleteCoupon(coupon._id);
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const columns = [
    { key: "code", label: "Code", render: (row) => (
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.code}</span>
    )},
    { key: "discount", label: "Discount", render: (row) => `${row.discount}%` },
    { key: "expiry", label: "Expiry", render: (row) => new Date(row.expiry).toLocaleDateString() },
    { key: "isActive", label: "Active", render: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"}`}>
        {row.isActive ? "Active" : "Inactive"}
      </span>
    )},
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Coupons" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search coupons..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} coupons</p>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Coupon
            </button>
          </div>
          <Table columns={columns} data={filtered} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title="Add Coupon" onClose={() => setOpen(false)} size="sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white uppercase" required placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Discount (%)</label>
              <input type="number" min="1" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Coupons;
