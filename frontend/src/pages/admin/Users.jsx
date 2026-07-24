import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Table from "../../components/admin/Table";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { toast } from "react-toastify";

const Users = () => {
  const { users, fetchUsers, deleteUser, makeAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    try {
      await deleteUser(user._id);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleMakeAdmin = async (user) => {
    try {
      await makeAdmin(user._id);
      toast.success(`${user.name} is now an admin`);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "isAdmin", label: "Role", render: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.isAdmin ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
        {row.isAdmin ? "Admin" : "User"}
      </span>
    )},
    { key: "createdAt", label: "Joined", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Users" searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search users..." />
        <div className="p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{filtered.length} users</p>
          <Table
            columns={columns}
            data={filtered}
            onDelete={handleDelete}
            renderActions={(row) =>
              !row.isAdmin && (
                <button
                  onClick={() => handleMakeAdmin(row)}
                  className="px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Make Admin
                </button>
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Users;
