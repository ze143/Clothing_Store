import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, formatPrice } from '../lib/supabase';
import { useCart } from '../store/cartStore';
import ProductImage from '../components/ProductImage';
import { ChevronRight, ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  useEffect(() => {
    setLoading(true);
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => {
        setProduct(data);
        setSize(data?.sizes?.[0] ?? null);
        setColor(data?.colors?.[0] ?? null);
        setQty(data?.min_quantity ?? 1);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="جارٍ التحميل..." />
        <div className="p-10 text-center text-gray-500">جارٍ التحميل...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="المنتج غير موجود" />
        <div className="p-10 text-center">
          <p className="text-gray-500 mb-4">المنتج غير موجود</p>
          <Link to="/" className="inline-block bg-black text-white px-6 py-2 rounded-xl">
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const hasDiscount = product.discount_price != null;
  const price = hasDiscount ? product.discount_price : product.price;
  const minQty = product.min_quantity ?? 1;
  const outOfStock = product.stock < 1;

  const handleAdd = () => {
    add(product, qty, size, color);
    navigate('/?cart=open');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <PageHeader title={product.title} />

      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl p-6 shadow">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <ProductImage
                  src={images[idx]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setIdx((idx - 1 + images.length) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={() => setIdx((idx + 1) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  </>
                )}
                {hasDiscount && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    خصم
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {images.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        idx === i ? 'border-black' : 'border-transparent'
                      }`}
                    >
                      <ProductImage src={u} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-black">{product.title}</h1>
                <p className="text-gray-600 mt-2 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-emerald-700">
                  {formatPrice(price)}
                </span>
                {hasDiscount && (
                  <span className="text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {minQty > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                  الحد الأدنى للطلب: <b>{minQty}</b> قطعة
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">المقاس</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-4 py-2 border rounded-lg ${
                          size === s ? 'bg-black text-white' : ''
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">اللون</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`px-4 py-2 border rounded-lg ${
                          color === c ? 'bg-black text-white' : ''
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">الكمية:</span>
                <button
                  onClick={() => setQty(Math.max(minQty, qty - 1))}
                  className="w-8 h-8 border rounded grid place-items-center"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 border rounded grid place-items-center"
                >
                  <Plus size={16} />
                </button>
                <span className="text-xs text-gray-500 mr-2">
                  (متوفر {product.stock})
                </span>
              </div>

              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {outOfStock ? 'غير متوفر' : 'أضف للسلة'}
              </button>

              <Link
                to="/"
                className="block text-center text-sm text-gray-500 hover:text-black"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}