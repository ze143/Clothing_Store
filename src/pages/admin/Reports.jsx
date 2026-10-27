import { useEffect, useState } from 'react';
import { supabase, formatPrice } from '../../lib/supabase';
import { statusLabel, STATUS_COLORS } from '../../lib/statusLabels';
import { exportToCSV } from '../../lib/csvExport';
import {
  Download,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Loader2,
} from 'lucide-react';

const RANGES = [
  { key: 'today', label: 'اليوم', days: 0 },
  { key: 'week', label: 'آخر 7 أيام', days: 7 },
  { key: 'month', label: 'آخر 30 يوم', days: 30 },
  { key: 'quarter', label: 'آخر 90 يوم', days: 90 },
  { key: 'custom', label: 'مخصص', days: null },
];

function daysAgoToISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayEndISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function Reports() {
  const [rangeKey, setRangeKey] = useState('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (customFrom = null, customTo = null) => {
    setLoading(true);
    setError('');

    let fromISO, toISO;

    if (customFrom && customTo) {
      fromISO = new Date(customFrom).toISOString();
      toISO = new Date(`${customTo}T23:59:59`).toISOString();
    } else if (rangeKey === 'custom') {
      // مش المفروض نوصل هنا، بس احتياط
      setError('اختار تاريخ البداية والنهاية');
      setLoading(false);
      return;
    } else if (rangeKey === 'today') {
      fromISO = daysAgoToISO(0);
      toISO = todayEndISO();
    } else {
      const days = RANGES.find((r) => r.key === rangeKey)?.days ?? 30;
      fromISO = daysAgoToISO(days);
      toISO = todayEndISO();
    }

    const { data, error } = await supabase.rpc('admin_reports', {
      p_from: fromISO,
      p_to: toISO,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    // ⭐ لو "مخصص" — متحملش لحد ما المستخدم يختار التاريخ
    if (rangeKey === 'custom') {
      setLoading(false);
      setData(null);
      setError('');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  // ⭐ دالة منفصلة لزر "عرض" للتواريخ المخصصة
  const applyCustomRange = () => {
    if (!fromDate || !toDate) {
      setError('اختار تاريخ البداية والنهاية');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('تاريخ البداية لازم يكون قبل تاريخ النهاية');
      return;
    }
    load(fromDate, toDate);
  };

  const exportDailySales = () => {
    if (!data?.daily_sales) return;
    exportToCSV(
      'المبيعات-اليومية',
      data.daily_sales.map((d) => ({
        day: d.day,
        orders: d.orders,
        revenue: d.revenue,
      })),
      [
        { key: 'day', label: 'التاريخ' },
        { key: 'orders', label: 'عدد الطلبات' },
        { key: 'revenue', label: 'الإيرادات' },
      ]
    );
  };

  const exportTopProducts = () => {
    if (!data?.top_products) return;
    exportToCSV(
      'أفضل-المنتجات',
      data.top_products,
      [
        { key: 'title', label: 'المنتج' },
        { key: 'total_qty', label: 'الكمية المباعة' },
        { key: 'revenue', label: 'الإيرادات' },
      ]
    );
  };

  const exportTopCustomers = () => {
    if (!data?.top_customers) return;
    exportToCSV(
      'أفضل-العملاء',
      data.top_customers,
      [
        { key: 'name', label: 'العميل' },
        { key: 'phone1', label: 'الهاتف' },
        { key: 'orders', label: 'عدد الطلبات' },
        { key: 'total_spent', label: 'إجمالي الشراء' },
      ]
    );
  };

  // ⭐ حالة "مخصص" قبل ما يدوس عرض
  const isCustomWaiting = rangeKey === 'custom' && !data && !error;

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">التقارير</h1>

        <div className="flex bg-white rounded-xl border overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              className={`px-3 py-2 text-sm transition ${
                rangeKey === r.key
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom range inputs */}
      {rangeKey === 'custom' && (
        <div className="bg-white rounded-2xl shadow p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm mb-1">من</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
              className="border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">إلى</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              max={new Date().toISOString().slice(0, 10)}
              className="border rounded-xl px-3 py-2"
            />
          </div>
          <button
            onClick={applyCustomRange}
            disabled={!fromDate || !toDate}
            className="bg-black text-white px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Calendar size={16} /> عرض
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Waiting for custom range */}
      {isCustomWaiting && (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
          <p>اختار تاريخ البداية والنهاية واضغط "عرض"</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid place-items-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Report content */}
      {!loading && data && (
        <>
          {/* Period info */}
          <div className="text-sm text-gray-500">
            الفترة: {new Date(data.period.from).toLocaleDateString('ar-EG')} →{' '}
            {new Date(data.period.to).toLocaleDateString('ar-EG')} (
            {data.period.days} يوم)
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={<ShoppingBag />}
              label="إجمالي الطلبات"
              value={data.summary.total_orders}
              color="bg-blue-500"
              sub={`${data.summary.cancelled_count} ملغي`}
            />
            <KpiCard
              icon={<DollarSign />}
              label="الإيرادات"
              value={formatPrice(data.summary.total_revenue)}
              color="bg-emerald-500"
              sub={`مؤكدة: ${formatPrice(data.summary.confirmed_revenue)}`}
            />
            <KpiCard
              icon={<TrendingUp />}
              label="متوسط قيمة الطلب"
              value={formatPrice(data.summary.avg_order_value)}
              color="bg-indigo-500"
              sub="غير الملغي"
            />
            <KpiCard
              icon={<Users />}
              label="عملاء فريدين"
              value={data.summary.unique_customers}
              color="bg-purple-500"
              sub={`${data.summary.pending_count} قيد المراجعة`}
            />
          </div>

          {/* Sales chart */}
          <Card title="المبيعات اليومية" onExport={exportDailySales}>
            <DailySalesChart data={data.daily_sales} />
          </Card>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="توزيع الحالات">
              <StatusBreakdown data={data.status_breakdown} />
            </Card>
            <Card title="طرق الدفع">
              <PaymentBreakdown data={data.payment_breakdown} />
            </Card>
          </div>

          {/* Top products */}
          <Card title="أفضل 10 منتجات مبيعاً" onExport={exportTopProducts}>
            <TopProductsTable data={data.top_products} />
          </Card>

          {/* Top customers */}
          <Card title="أفضل 10 عملاء" onExport={exportTopCustomers}>
            <TopCustomersTable data={data.top_customers} />
          </Card>

          {/* Low stock */}
          <Card title="منتجات منخفضة المخزون (أقل من 5 قطع)">
            <LowStockTable data={data.low_stock} />
          </Card>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────

function KpiCard({ icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-start gap-3">
      <div className={`${color} text-white p-3 rounded-xl shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-black truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Card({ title, onExport, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">{title}</h2>
        {onExport && (
          <button
            onClick={onExport}
            className="text-sm text-emerald-700 flex items-center gap-1 hover:underline"
          >
            <Download size={14} /> تصدير CSV
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function DailySalesChart({ data }) {
  if (!data?.length) {
    return <p className="text-gray-500 text-sm py-10 text-center">لا توجد بيانات</p>;
  }

  const max = Math.max(...data.map((d) => Number(d.revenue)), 1);

  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = (Number(d.revenue) / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-24 text-gray-500 shrink-0">
              {new Date(d.day).toLocaleDateString('ar-EG', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
                {d.orders} طلب
              </span>
            </div>
            <span className="w-28 text-left font-mono text-xs text-gray-600">
              {formatPrice(d.revenue)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBreakdown({ data }) {
  const entries = Object.entries(data || {});
  if (!entries.length) {
    return <p className="text-gray-500 text-sm py-6 text-center">لا توجد بيانات</p>;
  }

  const total = entries.reduce((sum, [, c]) => sum + Number(c), 0);

  return (
    <div className="space-y-2">
      {entries.map(([status, count]) => {
        const pct = total ? Math.round((Number(count) / total) * 100) : 0;
        return (
          <div key={status} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className={`px-2 py-1 rounded-full text-xs shrink-0 ${
                  STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusLabel(status)}
              </span>
              <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
                <div className="bg-gray-700 h-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-xs w-16 text-left">
              {count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PaymentBreakdown({ data }) {
  const entries = Object.entries(data || {});
  if (!entries.length) {
    return <p className="text-gray-500 text-sm py-6 text-center">لا توجد بيانات</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([method, count]) => (
        <div
          key={method}
          className="flex items-center justify-between border rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <span className="font-medium">{method}</span>
          </div>
          <span className="font-mono font-bold">{count}</span>
        </div>
      ))}
    </div>
  );
}

function TopProductsTable({ data }) {
  if (!data?.length) {
    return <p className="text-gray-500 text-sm py-6 text-center">لا توجد بيانات</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-right">
          <tr>
            <th className="p-2 font-semibold">#</th>
            <th className="p-2 font-semibold">المنتج</th>
            <th className="p-2 font-semibold">الكمية</th>
            <th className="p-2 font-semibold">الإيرادات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.product_id || i} className="border-t">
              <td className="p-2 text-gray-500">{i + 1}</td>
              <td className="p-2">{p.title}</td>
              <td className="p-2 font-mono">{p.total_qty}</td>
              <td className="p-2 font-mono font-bold text-emerald-700">
                {formatPrice(p.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopCustomersTable({ data }) {
  if (!data?.length) {
    return <p className="text-gray-500 text-sm py-6 text-center">لا توجد بيانات</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-right">
          <tr>
            <th className="p-2 font-semibold">#</th>
            <th className="p-2 font-semibold">العميل</th>
            <th className="p-2 font-semibold">الهاتف</th>
            <th className="p-2 font-semibold">الطلبات</th>
            <th className="p-2 font-semibold">إجمالي الشراء</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={c.phone1} className="border-t">
              <td className="p-2 text-gray-500">{i + 1}</td>
              <td className="p-2">{c.name || '—'}</td>
              <td className="p-2 font-mono text-xs">{c.phone1}</td>
              <td className="p-2 font-mono">{c.orders}</td>
              <td className="p-2 font-mono font-bold text-emerald-700">
                {formatPrice(c.total_spent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LowStockTable({ data }) {
  if (!data?.length) {
    return (
      <p className="text-emerald-600 text-sm py-6 text-center">
        ✓ كل المنتجات بمخزون كافي
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between border rounded-xl px-4 py-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={16}
              className={p.stock === 0 ? 'text-red-500' : 'text-yellow-500'}
            />
            <span>{p.title}</span>
          </div>
          <span
            className={`font-mono font-bold ${
              p.stock === 0 ? 'text-red-600' : 'text-yellow-700'
            }`}
          >
            {p.stock} قطعة
          </span>
        </div>
      ))}
    </div>
  );
}