import { Package, ShoppingCart, Users, DollarSign, Tag, Star } from "lucide-react";

const cards = [
  { label: "Total Orders", key: "orders", icon: ShoppingCart, color: "bg-blue-500" },
  { label: "Revenue", key: "revenue", icon: DollarSign, color: "bg-emerald-500", prefix: "₹" },
  { label: "Users", key: "users", icon: Users, color: "bg-violet-500" },
  { label: "Products", key: "products", icon: Package, color: "bg-amber-500" },
  { label: "Coupons", key: "coupons", icon: Tag, color: "bg-rose-500" },
  { label: "Reviews", key: "reviews", icon: Star, color: "bg-cyan-500" },
];

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(({ label, key, icon: Icon, color, prefix }) => (
        <div key={key} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex items-center gap-4 shadow-sm">
          <div className={`${color} p-3 rounded-lg`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              {prefix || ""}
              {stats ? (key === "revenue" ? Number(stats[key] || 0).toLocaleString() : stats[key] ?? 0) : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
