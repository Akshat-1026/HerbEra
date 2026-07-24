import { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "General", order: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = faqs.filter((f) =>
    !searchQuery || f.question?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchFAQs = async () => {
    try {
      const { data } = await axios.get(`${API}/faqs?all=true`);
      setFaqs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load FAQs");
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchFAQs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/faqs`, form, { withCredentials: true });
      toast.success("FAQ created");
      setOpen(false);
      setForm({ question: "", answer: "", category: "General", order: 0 });
      fetchFAQs();
    } catch {
      toast.error("Failed to create FAQ");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete FAQ "${item.question}"?`)) return;
    try {
      await axios.delete(`${API}/faqs/${item._id}`, { withCredentials: true });
      toast.success("FAQ deleted");
      fetchFAQs();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.put(`${API}/faqs/${item._id}`, { isActive: !item.isActive }, { withCredentials: true });
      toast.success(`FAQ ${item.isActive ? "deactivated" : "activated"}`);
      fetchFAQs();
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  const columns = [
    { key: "question", label: "Question", render: (row) => <span className="font-medium line-clamp-1">{row.question}</span> },
    { key: "category", label: "Category", render: (row) => <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">{row.category}</span> },
    { key: "order", label: "Order" },
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
        <Navbar title="FAQ" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search FAQs..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} FAQs</p>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add FAQ
            </button>
          </div>
          <Table columns={columns} data={filtered} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title="Add FAQ" onClose={() => setOpen(false)} size="sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Question</label>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Answer</label>
              <textarea rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Order</label>
              <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
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

export default AdminFAQ;
