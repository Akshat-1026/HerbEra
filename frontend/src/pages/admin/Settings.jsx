import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { toast } from "react-toastify";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", withCredentials: true });

const defaultBenefits = [
  { icon: "🌿", text: "" },
  { icon: "🚚", text: "" },
  { icon: "⚡", text: "" },
  { icon: "🛡️", text: "" },
  { icon: "💳", text: "" },
  { icon: "⭐", text: "" },
];

const Settings = () => {
  const [announcement, setAnnouncement] = useState({ title: "", description: "" });
  const [benefits, setBenefits] = useState(defaultBenefits);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/settings");
        if (data.announcement_bar) setAnnouncement(data.announcement_bar);
        if (data.benefits_bar) setBenefits(data.benefits_bar);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const saveAnnouncement = async () => {
    try {
      await API.put("/settings", { key: "announcement_bar", value: announcement });
      toast.success("Announcement bar saved");
    } catch {
      toast.error("Failed to save announcement bar");
    }
  };

  const saveBenefits = async () => {
    try {
      await API.put("/settings", { key: "benefits_bar", value: benefits });
      toast.success("Benefits bar saved");
    } catch {
      toast.error("Failed to save benefits bar");
    }
  };

  const addBenefit = () => {
    setBenefits([...benefits, { icon: "✨", text: "" }]);
  };

  const removeBenefit = (i) => {
    setBenefits(benefits.filter((_, idx) => idx !== i));
  };

  const updateBenefit = (i, field, val) => {
    const copy = [...benefits];
    copy[i] = { ...copy[i], [field]: val };
    setBenefits(copy);
  };

  const removeAnnouncement = async () => {
    try {
      const empty = { title: "", description: "" };
      await API.put("/settings", { key: "announcement_bar", value: empty });
      setAnnouncement(empty);
      toast.success("Announcement bar cleared");
    } catch {
      toast.error("Failed to clear announcement bar");
    }
  };

  const clearBenefits = async () => {
    if (!window.confirm("Remove all benefits?")) return;
    try {
      await API.put("/settings", { key: "benefits_bar", value: [] });
      setBenefits([]);
      toast.success("Benefits bar cleared");
    } catch {
      toast.error("Failed to clear benefits bar");
    }
  };

  if (loading) return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Site Settings" />
        <div className="p-6 space-y-10 max-w-3xl">
          {/* Announcement Bar */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Announcement Bar</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                <input
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
                  placeholder="Pay Day Sale is Live"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <input
                  value={announcement.description}
                  onChange={(e) => setAnnouncement({ ...announcement, description: e.target.value })}
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
                  placeholder="Flat 10% Off Sitewide + Free Gift on Orders Above ₹1499"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={removeAnnouncement} className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">Clear</button>
                <button onClick={saveAnnouncement} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Save</button>
              </div>
            </div>
          </section>

          {/* Benefits Bar */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Benefits Bar</h2>
              <div className="flex items-center gap-3">
                {benefits.length > 0 && (
                  <button onClick={clearBenefits} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear All</button>
                )}
                <button onClick={addBenefit} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Item</button>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-4">
              {benefits.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={item.icon}
                    onChange={(e) => updateBenefit(i, "icon", e.target.value)}
                    className="w-14 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
                    placeholder="🌿"
                  />
                  <input
                    value={item.text}
                    onChange={(e) => updateBenefit(i, "text", e.target.value)}
                    className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
                    placeholder="100% Natural Ingredients"
                  />
                  <button onClick={() => removeBenefit(i)} className="text-red-500 hover:text-red-600 text-sm font-medium whitespace-nowrap">Remove</button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={saveBenefits} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Save</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
