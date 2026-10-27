import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../store/cartStore";
import { useSettings } from "../lib/settings";
import BackButton from "./BackButton";

export default function PageHeader({
  title,
  showBack = true,
  showCart = false,
  onCartClick,
}) {
  const count = useCart((s) => s.items.length);
  const { storeName } = useSettings();

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        {/* ⭐ في RTL: أول عنصر = يمين، آخر عنصر = شمال */}

        {/* يمين: اسم المتجر/العنوان (قابل للضغط → الرئيسية) */}
        <Link
          to="/"
          className="text-lg font-black truncate hover:text-emerald-700 transition"
          title="الرئيسية"
        >
          {title || storeName}
        </Link>

        {/* شمال: أزرار (رجوع + سلة) */}
        <div className="flex items-center gap-2">
          {showCart && onCartClick && (
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          )}
          {showBack && <BackButton />}
        </div>
      </div>
    </header>
  );
}
