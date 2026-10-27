import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import { useSettings } from "../lib/settings";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const [cartOpen, setCartOpen] = useState(params.get("cart") === "open");
  const { storeName } = useSettings();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  const closeCart = () => {
    setCartOpen(false);
    if (params.get("cart")) {
      params.delete("cart");
      setParams(params, { replace: true });
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        title={storeName}
        showBack={false}
        showCart
        onCartClick={() => setCartOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded mt-3" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </div>
  );
}