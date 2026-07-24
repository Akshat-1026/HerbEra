import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyForm = { title: "", slug: "", excerpt: "", content: "", image: "", category: "", tags: "", author: "Herb-Era", readTime: 5, published: true };

const Blogs = () => {
  const { fetchAdminBlogs, createBlog, updateBlog, deleteBlog } = useAdmin();
  const [blogs, setBlogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = blogs.filter((b) =>
    !searchQuery || b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const load = async () => {
    const data = await fetchAdminBlogs();
    if (data) setBlogs(data.blogs || data);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (blog) => {
    setEditing(blog._id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category || "",
      tags: (blog.tags || []).join(", "),
      author: blog.author || "Herb-Era",
      readTime: blog.readTime || 5,
      published: blog.published ?? true,
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        readTime: Number(form.readTime),
      };
      if (editing) {
        await updateBlog(editing, payload);
        toast.success("Blog updated");
      } else {
        await createBlog(payload);
        toast.success("Blog created");
      }
      setOpen(false);
      load();
    } catch {
      toast.error(editing ? "Failed to update blog" : "Failed to create blog");
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete blog "${blog.title}"?`)) return;
    try {
      await deleteBlog(blog._id);
      toast.success("Blog deleted");
      load();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const columns = [
    { key: "title", label: "Title", render: (row) => <span className="font-medium truncate max-w-[200px] block">{row.title}</span> },
    { key: "category", label: "Category" },
    {
      key: "published", label: "Status",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.published ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
          {row.published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "readTime", label: "Read",
      render: (row) => `${row.readTime || "—"} min`,
    },
    {
      key: "createdAt", label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Blog / Journal" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search blogs..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} articles</p>
            <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
              Add Article
            </button>
          </div>
          <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Article" : "Add Article"} onClose={() => setOpen(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="Benefits of Ashwagandha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="benefits-of-ashwagandha" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="Ayurveda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" required placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" rows={2} required placeholder="Short summary of the article..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Content (HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white font-mono" rows={10} required placeholder="<p>Full article content...</p>" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" placeholder="herbs, wellness, ayurveda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Read Time (minutes)</label>
                <input type="number" min="1" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
              <label className="text-sm text-zinc-700 dark:text-zinc-300">Published</label>
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

export default Blogs;
