import { useState } from "react";
import { useCart } from "../store/cartStore";
import { formatPrice } from "../lib/supabase";
import ProductImage from "./ProductImage";
import { ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] ?? null);
  const [color, setColor] = useState(product.colors?.[0] ?? null);
  const [qty, setQty] = useState(product.min_quantity ?? 1);
  const add = useCart((s) => s.add);

  const images = product.images?.length ? product.images : [];
  const hasDiscount = product.discount_price != null;
  const price = hasDiscount ? product.discount_price : product.price;
  const minQty = product.min_quantity ?? 1;
  const outOfStock = product.stock < 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col h-full">
      {/* الصورة — مقاس ثابت 1:1 */}
      <div className="relative w-full aspect-square bg-gray-100 group overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <ProductImage
            src={images[idx]}
            alt={product.title}
            className="w-full h-full object-cover cursor-pointer"
          />
        </Link>
        {/* ... باقي الأزرار والـ badges زي ما هي ... */}
      </div>

      {/* المحتوى — ارتفاع ثابت للجزء ده */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold line-clamp-1 hover:text-emerald-700 transition">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2 min-h-[28px]">
          <span className="text-emerald-700 font-bold">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* المقاسات — ارتفاع ثابت */}
        {product.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1 min-h-[30px]">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-2 py-1 text-xs border rounded ${
                  size === s ? "bg-black text-white" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* الألوان — ارتفاع ثابت */}
        {product.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 min-h-[30px]">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-2 py-1 text-xs border rounded ${
                  color === c ? "bg-black text-white" : ""
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* زر الإضافة + الكمية — في آخر الكارت */}
        <div className="mt-auto flex items-center gap-2">
          <input
            type="number"
            min={minQty}
            max={product.stock}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(minQty, +e.target.value || minQty))
            }
            className="w-16 border rounded-lg px-2 py-2 text-center"
            disabled={outOfStock}
          />
          <button
            onClick={() => add(product, qty, size, color)}
            disabled={outOfStock}
            className="flex-1 bg-black text-white rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            {outOfStock ? "غير متوفر" : "أضف للسلة"}
          </button>
        </div>
      </div>
    </div>
  );
}
