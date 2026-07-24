import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  sectionLabel: "",
  heading: "",
  description: "",
  description2: "",
  ctaText: "",
  ctaLink: "/products",
  image: "",
  imageAlt: "",
  philosophy: [{ title: "", desc: "" }],
};

const OurStory = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/site-content/about`)
      .then(({ data }) => {
        if (data) {
          setForm({
            sectionLabel: data.sectionLabel || "",
            heading: data.heading || "",
            description: data.description || "",
            description2: data.description2 || "",
            ctaText: data.ctaText || "",
            ctaLink: data.ctaLink || "/products",
            image: data.image || "",
            imageAlt: data.imageAlt || "",
            philosophy: data.philosophy?.length > 0 ? data.philosophy : [{ title: "", desc: "" }],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/site-content/about`, form, { withCredentials: true });
      toast.success("Our Story updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updatePhilosophy = (index, field, value) => {
    const updated = [...form.philosophy];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, philosophy: updated });
  };

  const addPhilosophy = () => {
    setForm({ ...form, philosophy: [...form.philosophy, { title: "", desc: "" }] });
  };

  const removePhilosophy = (index) => {
    setForm({ ...form, philosophy: form.philosophy.filter((_, i) => i !== index) });
  };

  const inputClass = "w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Our Story" />
        <div className="p-6 max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Story Section */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 space-y-4">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Story Section</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Section Label</label>
                    <input value={form.sectionLabel} onChange={(e) => setForm({ ...form, sectionLabel: e.target.value })} placeholder="e.g. Our Story" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Heading</label>
                    <input value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} placeholder="e.g. Rooted in Ayurveda" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description (Paragraph 1)</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description (Paragraph 2)</label>
                  <textarea rows={3} value={form.description2} onChange={(e) => setForm({ ...form, description2: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CTA Button Text</label>
                    <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="e.g. Explore Products" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>CTA Link</label>
                    <input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/products" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                {form.image && (
                  <img src={form.image} alt={form.imageAlt} className="h-40 rounded-xl object-cover" />
                )}
                <div>
                  <label className={labelClass}>Image Alt Text</label>
                  <input value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Philosophy Section */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Philosophy Highlights</h2>
                  <button onClick={addPhilosophy} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                    <Plus size={16} /> Add
                  </button>
                </div>
                {form.philosophy.map((item, i) => (
                  <div key={i} className="relative rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 space-y-3">
                    {form.philosophy.length > 1 && (
                      <button onClick={() => removePhilosophy(i)} className="absolute right-3 top-3 text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div>
                      <label className={labelClass}>Title {i + 1}</label>
                      <input value={item.title} onChange={(e) => updatePhilosophy(i, "title", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Description {i + 1}</label>
                      <textarea rows={2} value={item.desc} onChange={(e) => updatePhilosophy(i, "desc", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OurStory;
