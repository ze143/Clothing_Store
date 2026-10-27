import { useState } from 'react';
import { supabase, formatPrice } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import { statusLabel, STATUS_COLORS } from '../lib/statusLabels';
import { Search } from 'lucide-react';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: orderNumber.trim(),
      p_phone: phone.trim(),
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (!data?.found) return setError('لم يتم العثور على طلب بهذا الرقم والهاتف');
    setResult(data);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <PageHeader title="تتبع الطلب" />
      <div className="py-10 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
          <form onSubmit={search} className="space-y-3">
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="رقم الطلب (مثال: 739201)"
              className="w-full border rounded-xl px-3 py-2 text-center font-mono text-lg"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="رقم الهاتف المستخدم في الطلب"
              className="w-full border rounded-xl px-3 py-2 text-center"
            />
            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Search size={18} /> {loading ? 'جارٍ البحث...' : 'بحث'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 border rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">رقم الطلب</span>
                <span className="font-mono font-bold">{result.order_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">الحالة</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    STATUS_COLORS[result.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabel(result.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الإجمالي</span>
                <span>{formatPrice(result.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">العربون</span>
                <span>{formatPrice(result.deposit_required)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">عدد المنتجات</span>
                <span>{result.items_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ الطلب</span>
                <span>{new Date(result.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              {result.admin_notes && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500 text-sm mb-1">ملاحظات:</p>
                  <p className="text-sm">{result.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}