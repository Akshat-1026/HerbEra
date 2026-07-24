import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { resizeImage } from "../../utils/resizeImage";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "", isActive: true, order: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef(null);

  const filtered = goals.filter((g) =>
    !searchQuery || g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchGoals = async () => {
    try {
      const { data } = await axios.get(`${API}/goals`, { withCredentials: true });
      setGoals(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load goals");
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { withCredentials: true };
      if (editing) {
        await axios.put(`${API}/goals/${editing._id}`, form, config);
        toast.success("Goal updated");
      } else {
        await axios.post(`${API}/goals`, form, config);
        toast.success("Goal created");
      }
      setOpen(false);
      setEditing(null);
      setForm({ name: "", slug: "", description: "", image: "", isActive: true, order: 0 });
      fetchGoals();
    } catch {
      toast.error(editing ? "Failed to update goal" : "Failed to create goal");
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, description: item.description || "", image: item.image || "", isActive: item.isActive, order: item.order || 0 });
    setOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete goal "${item.name}"?`)) return;
    try {
      await axios.delete(`${API}/goals/${item._id}`, { withCredentials: true });
      toast.success("Goal deleted");
      fetchGoals();
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      setResizing(true);
      const resized = await resizeImage(file, { width: 800, height: 1120, quality: 0.85 });
      setForm({ ...form, image: resized });
      toast.success("Image resized to 800×1120");
    } catch {
      toast.error("Failed to resize image");
    } finally {
      setResizing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const columns = [
    { key: "image", label: "Image", render: (row) => row.image ? <img src={row.image} alt={row.name} className="h-10 w-7 rounded object-cover" /> : <span className="text-zinc-400 text-xs">—</span> },
    { key: "name", label: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "slug", label: "Slug" },
    { key: "order", label: "Order" },
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
        <Navbar title="Shop by Goal" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search goals..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} goals</p>
            <button onClick={() => { setEditing(null); setForm({ name: "", slug: "", description: "", image: "", isActive: true, order: 0 }); setOpen(true); }} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Goal
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Goal" : "Add Goal"} onClose={() => { setOpen(false); setEditing(null); }} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image</label>
              {form.image && (
                <div className="relative mb-3 inline-block">
                  <img src={form.image} alt="Preview" className="h-40 w-auto rounded-lg border border-zinc-200 dark:border-zinc-700 object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={resizing} className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50">
                  <Upload size={16} />
                  {resizing ? "Resizing…" : "Upload & Resize (800×1120)"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">Or paste a URL below</p>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" className="mt-1 w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Order</label>
                <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Active</label>
                <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Goals;