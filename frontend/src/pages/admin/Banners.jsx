import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const emptyForm = { title: "", description: "", discountPercentage: "", link: "/products", image: "", isActive: true, startDate: "", endDate: "" };

const Banners = () => {
  const { banners, fetchBanners, createBanner, updateBanner, deleteBanner } = useAdmin();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = banners.filter((b) =>
    !searchQuery || b.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (banner) => {
    setEditing(banner._id);
    setForm({
      title: banner.title,
      description: banner.description || "",
      discountPercentage: banner.discountPercentage,
      link: banner.link || "/products",
      image: banner.image || "",
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        discountPercentage: Number(form.discountPercentage),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editing) {
        await updateBanner(editing, payload);
        toast.success("Banner updated");
      } else {
        await createBanner(payload);
        toast.success("Banner created");
      }
      setOpen(false);
    } catch {
      toast.error(editing ? "Failed to update banner" : "Failed to create banner");
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await deleteBanner(banner._id);
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggle = async (banner) => {
    try {
      await updateBanner(banner._id, { isActive: !banner.isActive });
      toast.success(`Banner ${banner.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to toggle banner");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "discountPercentage", label: "Discount",
      render: (row) => <span className="font-bold text-emerald-600">{row.discountPercentage}% OFF</span>,
    },
    {
      key: "isActive", label: "Active",
      render: (row) => (
        <button
          onClick={() => handleToggle(row)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            row.isActive
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "startDate", label: "Start",
      render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "—",
    },
    {
      key: "endDate", label: "End",
      render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Banners" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search banners..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} banners</p>
            <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Banner
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Banner" : "Add Banner"} onClose={() => setOpen(false)} size="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="Summer Sale" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" rows={2} placeholder="Get amazing discounts on all herbal products" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Discount (%)</label>
                <input type="number" min="1" max="100" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Link</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="/products" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL (optional)</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
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

export default Banners;
