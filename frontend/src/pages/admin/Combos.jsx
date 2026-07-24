import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";

const emptyForm = { name: "", description: "", image: "", comboPrice: "", originalPrice: "", products: [], isActive: true };

const Combos = () => {
  const { combos, products, fetchCombos, fetchProducts, createCombo, updateCombo, deleteCombo } = useAdmin();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchCombos(); fetchProducts(); }, [fetchCombos, fetchProducts]);

  const filtered = combos.filter((c) =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (combo) => {
    setEditing(combo._id);
    setForm({
      name: combo.name,
      description: combo.description || "",
      image: combo.image || "",
      comboPrice: combo.comboPrice,
      originalPrice: combo.originalPrice,
      products: combo.products?.map((p) => p._id || p) || [],
      isActive: combo.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        comboPrice: Number(form.comboPrice),
        originalPrice: Number(form.originalPrice),
      };
      if (editing) {
        await updateCombo(editing, payload);
        toast.success("Combo updated");
      } else {
        await createCombo(payload);
        toast.success("Combo created");
      }
      setOpen(false);
    } catch {
      toast.error(editing ? "Failed to update combo" : "Failed to create combo");
    }
  };

  const handleDelete = async (combo) => {
    if (!window.confirm(`Delete combo "${combo.name}"?`)) return;
    try {
      await deleteCombo(combo._id);
      toast.success("Combo deleted");
    } catch {
      toast.error("Failed to delete combo");
    }
  };

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(id) ? prev.products.filter((p) => p !== id) : [...prev.products, id],
    }));
  };

  const columns = [
    { key: "image", label: "Image", sortable: false, render: (row) => (
      <img src={row.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
    )},
    { key: "name", label: "Name" },
    { key: "products", label: "Products", render: (row) => (
      <span className="text-xs text-zinc-500">{row.products?.length || 0} items</span>
    )},
    { key: "comboPrice", label: "Combo Price", render: (row) => `₹${row.comboPrice?.toLocaleString()}` },
    { key: "originalPrice", label: "Original Price", render: (row) => (
      <span className="text-xs text-zinc-400 line-through">₹{row.originalPrice?.toLocaleString()}</span>
    )},
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
        <Navbar title="Combos" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search combos..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} combos</p>
            <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Combo
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Combo" : "Add Combo"} onClose={() => setOpen(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Combo Price (₹)</label>
                <input type="number" value={form.comboPrice} onChange={(e) => setForm({ ...form, comboPrice: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Original Price (₹)</label>
                <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select Products</label>
              <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((p) => (
                  <label key={p._id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">
                    <input
                      type="checkbox"
                      checked={form.products.includes(p._id)}
                      onChange={() => toggleProduct(p._id)}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="flex-1 text-zinc-700 dark:text-zinc-300">{p.name}</span>
                    <span className="text-xs text-zinc-400">₹{p.price}</span>
                  </label>
                ))}
              </div>
              {form.products.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.products.map((id) => {
                    const p = products.find((x) => x._id === id);
                    return p ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300">
                        {p.name}
                        <button type="button" onClick={() => toggleProduct(id)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
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

export default Combos;
