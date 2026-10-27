import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Package,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Settings as SettingsIcon,
  BarChart3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const link = (to, Icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `p-2 rounded flex items-center gap-2 ${isActive ? "bg-white/20" : ""}`
      }
    >
      <Icon size={18} /> {label}
    </NavLink>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-black text-white p-4 flex flex-col gap-2">
        <h2 className="text-lg font-black mb-4">Admin</h2>
        {link("/admin/dashboard", LayoutDashboard, "لوحة التحكم")}
        {link("/admin/orders", ClipboardList, "الطلبات")}
        {link("/admin/products", Package, "المنتجات")}
        {link("/admin/reports", BarChart3, "التقارير")}
        {link("/admin/settings", SettingsIcon, "الإعدادات")}
        <button
          onClick={logout}
          className="mt-auto p-2 rounded flex items-center gap-2 hover:bg-white/10"
        >
          <LogOut size={18} /> خروج
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
