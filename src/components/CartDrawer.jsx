import { useCart } from '../store/cartStore';
import { formatPrice } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import ProductImage from './ProductImage';
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, remove, subtotal } = useCart();
  const navigate = useNavigate();
  const { depositRate } = useSettings();
  const total = subtotal();
  const deposit = +(total * depositRate).toFixed(2);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl z-50
        transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }
        flex flex-col`}
        dir="rtl"
      >
        <header className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag size={20} /> سلة المشتريات
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="mb-4">سلتك فارغة</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
                className="bg-black text-white px-6 py-2 rounded-xl text-sm"
              >
                تصفح المنتجات
              </button>
            </div>
          )}
          {items.map((i) => {
            const p = i.product;
            const price = p.discount_price ?? p.price;
            return (
              <div key={i.key} className="flex gap-3 border rounded-xl p-3">
                <Link
                  to={`/product/${p.id}`}
                  onClick={onClose}
                  className="shrink-0"
                >
                  <ProductImage
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${p.id}`}
                    onClick={onClose}
                    className="font-semibold hover:underline block truncate"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {i.size && `مقاس: ${i.size}`}{' '}
                    {i.color && `· لون: ${i.color}`}
                  </p>
                  <p className="text-emerald-700 font-bold mt-1">
                    {formatPrice(price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="w-7 h-7 grid place-items-center border rounded disabled:opacity-40"
                      onClick={() => updateQty(i.key, -1)}
                      disabled={i.quantity <= (p.min_quantity ?? 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <button
                      className="w-7 h-7 grid place-items-center border rounded"
                      onClick={() => updateQty(i.key, +1)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="ml-auto text-red-500"
                      onClick={() => remove(i.key)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <footer className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>الإجمالي الفرعي</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-amber-700">
              <span>العربون المطلوب ({(depositRate * 100).toFixed(0)}%)</span>
              <span className="font-semibold">{formatPrice(deposit)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800"
            >
              متابعة الطلب
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/track');
              }}
              className="w-full border border-gray-300 py-2 rounded-xl text-sm text-gray-700"
            >
              تتبع طلب سابق
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}