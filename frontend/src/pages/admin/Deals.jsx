import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const DEAL_TYPES = ["flash_sale", "daily_deal", "combo", "bogo", "festival"];
const DISCOUNT_TYPES = ["percentage", "fixed"];

const emptyForm = { name: "", type: "flash_sale", discountType: "percentage", discountValue: "", products: [], minPurchase: 0, startsAt: "", endsAt: "", isActive: true, bannerImage: "", couponCode: "" };

const Deals = () => {
  const { fetchAdminDeals, createDeal, updateDeal, deleteDeal, products, fetchProducts } = useAdmin();
  const [deals, setDeals] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = deals.filter((d) =>
    !searchQuery || d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const load = async () => {
    const data = await fetchAdminDeals();
    if (data) setDeals(data);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
    load();
    fetchProducts();
  }, []); // eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (deal) => {
    setEditing(deal._id);
    const pd = deal.products || [];
    const productIds = pd.map((p) => (typeof p === "string" ? p : p._id));
    setForm({
      name: deal.name,
      type: deal.type || "flash_sale",
      discountType: deal.discountType || "percentage",
      discountValue: deal.discountValue || "",
      products: productIds,
      minPurchase: deal.minPurchase || 0,
      startsAt: deal.startsAt ? new Date(deal.startsAt).toISOString().slice(0, 16) : "",
      endsAt: deal.endsAt ? new Date(deal.endsAt).toISOString().slice(0, 16) : "",
      isActive: deal.isActive ?? true,
      bannerImage: deal.bannerImage || "",
      couponCode: deal.couponCode || "",
    });
    setOpen(true);
  };

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(id) ? prev.products.filter((p) => p !== id) : [...prev.products, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (editing) {
        await updateDeal(editing, payload);
        toast.success("Deal updated");
      } else {
        await createDeal(payload);
        toast.success("Deal created");
      }
      setOpen(false);
      load();
    } catch {
      toast.error(editing ? "Failed to update deal" : "Failed to create deal");
    }
  };

  const handleDelete = async (deal) => {
    if (!window.confirm(`Delete deal "${deal.name}"?`)) return;
    try {
      await deleteDeal(deal._id);
      toast.success("Deal deleted");
      load();
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "type", label: "Type",
      render: (row) => <span className="capitalize">{row.type?.replace("_", " ")}</span>,
    },
    {
      key: "discountValue", label: "Discount",
      render: (row) => row.discountType === "percentage" ? `${row.discountValue}%` : `₹${row.discountValue}`,
    },
    {
      key: "isActive", label: "Active",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700" : "bg-red-100 dark:bg-red-900/40 text-red-700"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "endsAt", label: "Ends",
      render: (row) => new Date(row.endsAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Deals" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search deals..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} deals</p>
            <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Deal
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Deal" : "Add Deal"} onClose={() => setOpen(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="Mega Monsoon Sale" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white">
                  {DEAL_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white">
                  {DISCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Discount Value</label>
                <input type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder={form.discountType === "percentage" ? "25" : "500"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Min Purchase (₹)</label>
                <input type="number" min="0" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Coupon Code</label>
                <input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="MONSOON25" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
                <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Banner Image URL</label>
              <input value={form.bannerImage} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Products</label>
              <div className="max-h-32 overflow-y-auto border border-zinc-300 dark:border-zinc-600 rounded-lg p-2 space-y-1">
                {products.length === 0 && <p className="text-xs text-zinc-400 p-2">No products found</p>}
                {products.map((p) => (
                  <label key={p._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 px-2 py-1 rounded">
                    <input type="checkbox" checked={form.products.includes(p._id)} onChange={() => toggleProduct(p._id)} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
              <label className="text-sm text-zinc-700 dark:text-zinc-300">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Deals;
