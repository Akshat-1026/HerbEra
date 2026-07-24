import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import { ShoppingCart, Package, Users, DollarSign, Tag, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const cards = [
  { label: "Total Revenue", key: "revenue", icon: DollarSign, color: "bg-emerald-500", prefix: "₹" },
  { label: "Total Orders", key: "orders", icon: ShoppingCart, color: "bg-blue-500" },
  { label: "Total Users", key: "users", icon: Users, color: "bg-violet-500" },
  { label: "Total Products", key: "products", icon: Package, color: "bg-amber-500" },
  { label: "Total Coupons", key: "coupons", icon: Tag, color: "bg-rose-500" },
  { label: "Total Reviews", key: "reviews", icon: Star, color: "bg-cyan-500" },
];

const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex items-center gap-4 shadow-sm animate-pulse">
        <div className="w-11 h-11 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
        <div className="space-y-2">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label, prefix }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
        <p className="font-semibold text-zinc-800 dark:text-zinc-100">
          {prefix || ""}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { stats, fetchStats } = useAdmin();
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    fetchStats().finally(() => setLoaded(true));
  }, [fetchStats]);

  useEffect(() => {
    const checkDark = () => setDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const chartColors = {
    text: dark ? "#a1a1aa" : "#71717a",
    grid: dark ? "#3f3f46" : "#e4e4e7",
    line: "#059669",
  };

  const chartData = stats?.ordersByMonth?.map((m) => ({
    name: monthNames[m._id - 1] || m._id,
    revenue: m.revenue || 0,
    orders: m.count || 0,
  })) || [];

  return (
    <div className="flex min-h-screen relative">
      <img src="/images/shop.jpg" alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0" />
      <Sidebar className="relative z-10" />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar title="Dashboard" />
        <div className="p-6 space-y-6">
          {!loaded && !stats ? <Skeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
          )}

          {chartData.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
                  Monthly Revenue
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} />
                    <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Line type="monotone" dataKey="revenue" stroke={chartColors.line} strokeWidth={2} dot={{ fill: chartColors.line, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
                  Monthly Orders
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} />
                    <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill={chartColors.line} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm p-6">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <ShoppingCart size={18} className="text-zinc-500 dark:text-zinc-400" />
              Recent Orders
            </h3>
            {loaded && stats?.recentOrders?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left text-zinc-500 dark:text-zinc-400">
                      <th className="pb-2 font-medium">Order ID</th>
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id} className="text-zinc-700 dark:text-zinc-300">
                        <td className="py-2.5 font-mono text-xs">{order._id.slice(-8)}</td>
                        <td className="py-2.5">{order.user?.name || "Guest"}</td>
                        <td className="py-2.5">₹{order.totalPrice?.toLocaleString() || "0"}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.isDelivered ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                          }`}>
                            {order.isDelivered ? "Delivered" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
