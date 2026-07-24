import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { Mail, Download } from "lucide-react";
import { toast } from "react-toastify";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", withCredentials: true });

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await API.get("/newsletter");
      setSubscribers(data);
    } catch {
      toast.error("Failed to load subscribers");
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const filtered = subscribers.filter((s) =>
    !searchQuery || s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const csv = "Email,Subscribed,Date\n" + filtered.map((s) => `${s.email},${s.subscribed},${new Date(s.createdAt).toLocaleDateString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "email", label: "Email",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-zinc-400" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      key: "subscribed", label: "Status",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.subscribed ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700" : "bg-red-100 dark:bg-red-900/40 text-red-700"}`}>
          {row.subscribed ? "Active" : "Unsubscribed"}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Subscribed On",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Newsletter Subscribers" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search email..." />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} subscribers</p>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
              <Download size={18} />
              Export CSV
            </button>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-10 text-zinc-400">No subscribers found</td></tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub._id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">{col.render ? col.render(sub) : sub[col.key]}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
