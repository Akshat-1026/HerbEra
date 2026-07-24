import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Star, Image, Settings, LogOut, Gift, FileText, BadgePercent, Mail, MessageSquare, MessageCircle, Quote, Target, BookOpen } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/blogs", label: "Blog / Journal", icon: FileText },
  { to: "/admin/deals", label: "Deals", icon: BadgePercent },
  { to: "/admin/goals", label: "Shop by Goal", icon: Target },
  { to: "/admin/our-story", label: "Our Story", icon: BookOpen },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { to: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { to: "/admin/faqs", label: "FAQ", icon: MessageCircle },
  { to: "/admin/combos", label: "Combos", icon: Gift },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ className = "" }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <aside className={`w-64 bg-zinc-900 text-white flex flex-col min-h-screen ${className}`}>
      <div className="p-5 border-b border-zinc-700">
        <h1 className="text-xl font-bold tracking-tight">Herb-Era</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
