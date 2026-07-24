import { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", text: "", rating: 5, image: "", video: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = testimonials.filter((t) =>
    !searchQuery || t.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get(`${API}/testimonials?all=true`);
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load testimonials");
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTestimonials(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/testimonials`, form, { withCredentials: true });
      toast.success("Testimonial created");
      setOpen(false);
      setForm({ name: "", location: "", text: "", rating: 5, image: "", video: "" });
      fetchTestimonials();
    } catch {
      toast.error("Failed to create testimonial");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete testimonial from "${item.name}"?`)) return;
    try {
      await axios.delete(`${API}/testimonials/${item._id}`, { withCredentials: true });
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch {
      toast.error("Failed to delete testimonial");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.put(`${API}/testimonials/${item._id}`, { isActive: !item.isActive }, { withCredentials: true });
      toast.success(`Testimonial ${item.isActive ? "deactivated" : "activated"}`);
      fetchTestimonials();
    } catch {
      toast.error("Failed to update testimonial");
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "location", label: "Location" },
    { key: "text", label: "Text", render: (row) => <span className="text-sm text-zinc-500 line-clamp-2">{row.text}</span> },
    { key: "rating", label: "Rating", render: (row) => `${"★".repeat(row.rating)}${"☆".repeat(5 - row.rating)}` },
    { key: "media", label: "Media", render: (row) => (
      <div className="flex gap-1">
        {row.image && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Photo</span>}
        {row.video && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Video</span>}
        {!row.image && !row.video && <span className="text-xs text-zinc-400">—</span>}
      </div>
    )},
    { key: "isActive", label: "Active", render: (row) => (
      <button onClick={() => handleToggleActive(row)} className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${row.isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"}`}>
        {row.isActive ? "Active" : "Inactive"}
      </button>
    )},
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Testimonials" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search testimonials..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} testimonials</p>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Testimonial
            </button>
          </div>
          <Table columns={columns} data={filtered} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title="Add Testimonial" onClose={() => setOpen(false)} size="sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Text</label>
              <textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Customer Photo URL (optional)</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Video URL (optional)</label>
              <input value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} placeholder="YouTube / Vimeo / MP4 link" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
              <p className="mt-1 text-xs text-zinc-400">Paste a YouTube, Vimeo, or direct .mp4 link</p>
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

export default Testimonials;
