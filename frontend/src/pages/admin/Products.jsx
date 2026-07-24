import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { ProductVariants } from "../../components/admin/ProductVariants";
import { toast } from "react-toastify";

const emptyProduct = { name: "", price: 0, category: "", description: "", image: "", countInStock: 0, sku: "", variants: [], goals: [] };

const Products = () => {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, goals, fetchAdminGoals } = useAdmin();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products.filter((p) =>
    !searchQuery || [p.name, p.category, p.sku].some((f) => f?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => { fetchProducts(); fetchAdminGoals(); }, [fetchProducts, fetchAdminGoals]);

  const handleOpen = (product = null) => {
    if (product) {
      setEditing(product);
      const goalIds = (product.goals || []).map((g) => (typeof g === "object" ? g._id : g));
      setForm({ ...product, goals: goalIds });
    } else {
      setEditing(null);
      setForm(emptyProduct);
    }
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateProduct(editing._id, form);
        toast.success("Product updated");
      } else {
        await createProduct(form);
        toast.success("Product created");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product._id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    { key: "image", label: "Image", sortable: false, render: (row) => (
      <img src={row.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
    )},
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU", render: (row) => (
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.sku || "—"}</span>
    )},
    { key: "category", label: "Category" },
    { key: "goals", label: "Goals", render: (row) => {
      const g = row.goals || [];
      if (g.length === 0) return <span className="text-xs text-zinc-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {g.map((goal, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {typeof goal === "object" ? goal.name : goal}
            </span>
          ))}
        </div>
      );
    }},
    { key: "price", label: "Price", render: (row) => `₹${row.price?.toLocaleString()}` },
    { key: "countInStock", label: "Stock", render: (row) => {
      const stock = row.countInStock || 0;
      return (
        <div className="flex items-center gap-2">
          <span className={`${stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {stock}
          </span>
          {stock > 0 && stock <= 5 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Low
            </span>
          )}
        </div>
      );
    }},
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Products" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search products..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} products</p>
            <button
              onClick={() => handleOpen()}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={(row) => handleOpen(row)} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setOpen(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">SKU (auto-generated)</label>
                <input value={form.sku || (editing ? "" : "Auto-generated on save")} readOnly className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
              </div>
            </div>
            <ProductVariants variants={form.variants} onChange={(variants) => setForm({ ...form, variants })} />
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            {goals.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Shop by Goal</label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => {
                    const selected = form.goals?.includes(goal._id);
                    return (
                      <button
                        key={goal._id}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? form.goals.filter((id) => id !== goal._id)
                            : [...(form.goals || []), goal._id];
                          setForm({ ...form, goals: updated });
                        }}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all border ${
                          selected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-zinc-600 border-zinc-300 hover:border-emerald-400 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:border-emerald-500"
                        }`}
                      >
                        {goal.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Products;
