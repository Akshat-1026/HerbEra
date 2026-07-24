import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LogOut, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ title, searchQuery, onSearchChange, searchPlaceholder }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-6 py-3 flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 shrink-0">{title}</h2>
      {onSearchChange && (
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || "Search..."}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <User size={16} />
          <span>{userInfo?.name || "Admin"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
