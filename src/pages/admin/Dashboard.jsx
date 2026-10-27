import { useEffect, useState } from 'react';
import { supabase, formatPrice } from '../../lib/supabase';
import { statusLabel } from '../../lib/statusLabels';
import { ShoppingBag, DollarSign, AlertTriangle, Package, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    supabase.rpc('admin_dashboard_stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="p-6">جارٍ التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<ShoppingBag />} label="إجمالي الطلبات" value={stats.total_orders} color="bg-blue-500" />
        <Card icon={<Clock />} label="طلبات معلقة" value={stats.pending_review} color="bg-yellow-500" />
        <Card icon={<Package />} label="طلبات اليوم" value={stats.today_orders} color="bg-indigo-500" />
        <Card icon={<DollarSign />} label="إيرادات اليوم" value={formatPrice(stats.today_revenue)} color="bg-emerald-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-bold mb-4">الإيرادات</h2>
          <p className="text-3xl font-black text-emerald-700">{formatPrice(stats.total_revenue)}</p>
          <p className="text-sm text-gray-500 mt-1">من الطلبات غير الملغية</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> منتجات تحتاج إعادة تخزين
          </h2>
          <p className="text-3xl font-black text-red-600">{stats.low_stock_count}</p>
          <p className="text-sm text-gray-500 mt-1">أقل من 5 قطع</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow">
        <h2 className="font-bold mb-4">توزيع الحالات</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats.status_breakdown || {}).map(([status, count]) => (
            <div key={status} className="border rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{count}</p>
              <p className="text-xs text-gray-600">{statusLabel(status)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-3">
      <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );
}