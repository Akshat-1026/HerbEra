import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import Modal from "../../components/admin/Modal";
import { Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", withCredentials: true });

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMsg, setViewMsg] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await API.get("/contact/admin");
      setContacts(data);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const filtered = contacts.filter((c) =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete message from "${contact.name}"?`)) return;
    try {
      await API.delete(`/contact/admin/${contact._id}`);
      toast.success("Message deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const columns = [
    {
      key: "name", label: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
    {
      key: "createdAt", label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "_id", label: "",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMsg(row)} className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors" title="View">
            <Eye size={16} />
          </button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Contact Messages" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search messages..." />
        <div className="p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{filtered.length} messages</p>
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
                  <tr><td colSpan={columns.length} className="text-center py-10 text-zinc-400">No messages found</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">{col.render ? col.render(c) : c[col.key]}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewMsg && (
        <Modal title={`Message from ${viewMsg.name}`} onClose={() => setViewMsg(null)} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Name</p>
                <p className="font-medium">{viewMsg.name}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Email</p>
                <p className="font-medium">{viewMsg.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-zinc-500 dark:text-zinc-400">Subject</p>
                <p className="font-medium">{viewMsg.subject}</p>
              </div>
              <div className="col-span-2">
                <p className="text-zinc-500 dark:text-zinc-400">Date</p>
                <p className="font-medium">{new Date(viewMsg.createdAt).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-zinc-500 dark:text-zinc-400 mb-2">Message</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {viewMsg.message}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewMsg(null)} className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Contacts;
