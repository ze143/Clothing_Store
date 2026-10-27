import { useEffect, useState } from 'react';
import { supabase, validateImage, safeFilename } from '../../lib/supabase';
import ProductImage from '../../components/ProductImage';
import { Trash2, Pencil, Plus, Upload, X } from 'lucide-react';

const EMPTY = {
  title: '',
  description: '',
  price: '',
  discount_price: '',
  min_quantity: 1,
  sizes: '',
  colors: '',
  stock: 0,
  images: [],
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const uploadImages = async (files) => {
    setError('');
    setUploading(true);
    try {
      const urls = [...form.images];
      for (const file of files) {
        validateImage(file);
        const path = safeFilename(file);
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm({ ...form, images: urls });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url) => {
    const marker = '/product-images/';
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length);
      await supabase.storage.from('product-images').remove([path]);
    }
    setForm({ ...form, images: form.images.filter((u) => u !== url) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title,
      description: form.description,
      price: +form.price,
      discount_price: form.discount_price ? +form.discount_price : null,
      min_quantity: +form.min_quantity,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      stock: +form.stock,
      images: form.images,
    };
    const { error: err } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload);
    if (err) return setError(err.message);
    setForm(EMPTY);
    setEditingId(null);
    load();
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? '',
      price: p.price,
      discount_price: p.discount_price ?? '',
      min_quantity: p.min_quantity,
      sizes: p.sizes.join(', '),
      colors: p.colors.join(', '),
      stock: p.stock,
      images: p.images ?? [],
    });
  };

  const remove = async (id) => {
    if (!confirm('حذف المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-4 space-y-3 h-fit sticky top-4"
      >
        <h2 className="font-bold text-lg">
          {editingId ? 'تعديل' : 'إضافة'} منتج
        </h2>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
        )}
        <Input
          label="العنوان"
          v={form.title}
          on={(v) => setForm({ ...form, title: v })}
          required
        />
        <Input
          label="الوصف"
          v={form.description}
          on={(v) => setForm({ ...form, description: v })}
          textarea
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="السعر"
            v={form.price}
            on={(v) => setForm({ ...form, price: v })}
            type="number"
            required
          />
          <Input
            label="سعر بعد الخصم"
            v={form.discount_price}
            on={(v) => setForm({ ...form, discount_price: v })}
            type="number"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="الحد الأدنى"
            v={form.min_quantity}
            on={(v) => setForm({ ...form, min_quantity: v })}
            type="number"
          />
          <Input
            label="المخزون"
            v={form.stock}
            on={(v) => setForm({ ...form, stock: v })}
            type="number"
          />
        </div>
        <Input
          label="المقاسات (فاصلة)"
          v={form.sizes}
          on={(v) => setForm({ ...form, sizes: v })}
          placeholder="S, M, L"
        />
        <Input
          label="الألوان (فاصلة)"
          v={form.colors}
          on={(v) => setForm({ ...form, colors: v })}
          placeholder="أحمر, أزرق"
        />

        <div>
          <label className="block text-sm font-medium mb-1">الصور</label>
          <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer">
            <Upload size={16} /> {uploading ? 'جارٍ الرفع...' : 'رفع صور'}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => uploadImages([...e.target.files])}
            />
          </label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {form.images.map((u, i) => (
              <div key={i} className="relative">
                <ProductImage
                  src={u}
                  alt=""
                  className="w-16 h-16 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(u)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-black text-white py-2 rounded-xl flex items-center justify-center gap-1">
            <Plus size={16} /> حفظ
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
              className="px-3 border rounded-xl"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-3 flex gap-3 items-center"
          >
            <ProductImage
              src={p.images?.[0]}
              alt={p.title}
              className="w-16 h-16 rounded object-cover bg-gray-100"
            />
            <div className="flex-1">
              <p className="font-bold">{p.title}</p>
              <p className="text-sm text-gray-500">
                {p.price} {p.discount_price && `→ ${p.discount_price}`} · مخزون{' '}
                <span
                  className={p.stock < 5 ? 'text-red-600 font-bold' : ''}
                >
                  {p.stock}
                </span>
              </p>
            </div>
            <button
              onClick={() => edit(p)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => remove(p.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, v, on, type = 'text', textarea, placeholder, required }) {
  const C = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <C
        type={textarea ? undefined : type}
        value={v}
        placeholder={placeholder}
        required={required}
        onChange={(e) => on(e.target.value)}
        rows={textarea ? 2 : undefined}
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}