import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import TrackOrder from "./pages/TrackOrder";
import Legal from "./pages/Legal";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import OrderManager from "./pages/admin/OrderManager";
import ProductManager from "./pages/admin/ProductManager";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";

function AdminGuard({ children }) {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setChecked(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("role")
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
        setChecked(true);
      });
  }, [session]);

  if (session === undefined || !checked) {
    return <div className="p-10 text-center">جارٍ التحقق...</div>;
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)
    return (
      <div className="p-10 text-center text-red-600">
        ليس لديك صلاحية الوصول
      </div>
    );
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation/:orderNumber" element={<Confirmation />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/legal/:type" element={<Legal />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="reports" element={<Reports />} />

          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
