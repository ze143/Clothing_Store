import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, formatPrice } from '../lib/supabase';
import { CheckCircle2, Package, Copy, Printer, Truck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { statusLabel, STATUS_COLORS } from '../lib/statusLabels';

export default function Confirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.rpc('get_order_by_number', { p_order_number: orderNumber })
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="تأكيد الطلب" showBack={false} />
        <div className="grid place-items-center py-20">
          <p>جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="تأكيد الطلب" showBack={false} />
        <div className="grid place-items-center py-20 px-4">
          <div className="text-center">
            <p className="text-xl mb-4">لم يتم العثور على الطلب</p>
            <Link to="/" className="bg-black text-white px-6 py-2 rounded-xl">
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <PageHeader title="تأكيد الطلب" showBack={false} />
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Hero */}
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={64} />
            <h1 className="text-2xl font-bold mt-4">تم استلام طلبك!</h1>
            <p className="text-gray-600 mt-2">
              سنقوم بمراجعة العربون والتواصل معك خلال 24 ساعة.
            </p>
            <div className="bg-gray-100 rounded-xl p-4 mt-6 flex items-center justify-center gap-3">
              <span className="text-3xl font-black tracking-widest font-mono">
                {order.order_number}
              </span>
              <button onClick={copyOrderNumber} className="text-gray-600">
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">احتفظ بهذا الرقم لمتابعة طلبك</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package size={20} className="text-gray-700" />
              <h2 className="font-bold">حالة الطلب</h2>
            </div>
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full ${
                STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabel(order.status)}
            </span>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold mb-3">المنتجات</h2>
            <div className="space-y-2">
              {order.items?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{it.title}</p>
                    <p className="text-gray-500 text-xs">
                      {it.size && `مقاس: ${it.size}`} {it.color && ` · لون: ${it.color}`}
                    </p>
                  </div>
                  <div className="text-left">
                    <p>×{it.quantity}</p>
                    <p className="text-gray-700">
                      {formatPrice((it.unit_price ?? 0) * it.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white rounded-2xl shadow p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>الإجمالي</span>
              <b>{formatPrice(order.total_amount)}</b>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>العربون المطلوب</span>
              <b>{formatPrice(order.deposit_required)}</b>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>طريقة الدفع</span>
              <span>{order.deposit_method}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/track"
              className="bg-black text-white py-3 rounded-xl text-center flex items-center justify-center gap-2"
            >
              <Truck size={18} /> تتبع الطلب
            </Link>
            <button
              onClick={() => window.print()}
              className="border py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Printer size={18} /> طباعة
            </button>
          </div>

          <Link to="/" className="block text-center text-gray-600 text-sm py-2">
            ← العودة للمتجر
          </Link>
        </div>
      </div>
    </div>
  );
}