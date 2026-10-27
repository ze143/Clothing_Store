import { useEffect, useMemo, useState } from "react";
import { supabase, formatPrice } from "../../lib/supabase";
import { statusLabel, STATUS_COLORS } from "../../lib/statusLabels";
import { X, MapPin, Search, Bell } from "lucide-react";

const STATUSES = [
  "Pending Review",
  "Deposit Confirmed",
  "Order Confirmed",
  "Delivered",
  "Cancelled/Rejected",
];

const PAGE_SIZE = 20;

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 5000);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? payload.new : o)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    let list =
      filter === "All" ? orders : orders.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.includes(q) ||
          o.contact_person?.toLowerCase().includes(q) ||
          o.phone1?.includes(q),
      );
    }
    return list;
  }, [orders, filter, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const open = (o) => {
    setSelected(o);
    const safeStatus = STATUSES.includes(o.status)
      ? o.status
      : "Pending Review";
    setStatus(safeStatus);
    setAdminNotes(o.admin_notes ?? "");
  };

  const save = async () => {
    if (!status || !STATUSES.includes(status)) {
      alert(`القيمة "${status}" مش صالحة. اختار حالة من القايمة.`);
      return;
    }

    if (
      status === "Cancelled/Rejected" &&
      selected.status !== "Cancelled/Rejected"
    ) {
      if (
        !confirm('تحويل الطلب لـ "ملغي" هيرجع الكميات للمخزون تلقائياً. متأكد؟')
      )
        return;
    }
    if (
      selected.status === "Cancelled/Rejected" &&
      status !== "Cancelled/Rejected"
    ) {
      if (!confirm("إعادة تفعيل طلب ملغي هيخصم الـ stock تاني. متأكد؟")) return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({ status, admin_notes: adminNotes })
      .eq("id", selected.id);
    setSaving(false);

    if (error) {
      alert(
        `خطأ: ${error.message}\n\nCode: ${error.code}\nDetails: ${error.details || "N/A"}`,
      );
      return;
    }
    setSelected(null);
  };

  return (
    <div>
      {newOrderAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <Bell size={18} /> طلب جديد وصل!
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">الطلبات ({filtered.length})</h1>
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="ابحث برقم الطلب أو العميل أو الهاتف"
            className="w-full border rounded-xl pr-9 pl-3 py-2 text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          className="border rounded-xl px-3 py-2"
        >
          <option value="All">جميع الحالات</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-right">
            <tr>
              <th className="p-3">رقم الطلب</th>
              <th className="p-3">العميل</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">الإجمالي</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr
                key={o.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => open(o)}
              >
                <td className="p-3 font-mono font-bold">{o.order_number}</td>
                <td className="p-3">{o.contact_person}</td>
                <td className="p-3 font-mono text-xs">{o.phone1}</td>
                <td className="p-3">{formatPrice(o.total_amount)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      STATUS_COLORS[o.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabel(o.status)}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(o.created_at).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  لا توجد طلبات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-sm">
            صفحة {page + 1} من {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                طلب #{selected.order_number}
              </h2>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="اسم العميل" value={selected.contact_person} />
              <Info label="الشركة" value={selected.company_name || "—"} />
              <Info label="هاتف 1" value={selected.phone1} />
              <Info label="هاتف 2" value={selected.phone2 || "—"} />
              <Info label="العنوان" value={selected.address} wide />
              {selected.shipping_location_url && (
                <a
                  href={selected.shipping_location_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 flex items-center gap-1 col-span-2"
                >
                  <MapPin size={16} /> عرض الموقع على الخريطة
                </a>
              )}
              <Info label="ملاحظات العميل" value={selected.notes || "—"} wide />
            </div>

            <h3 className="font-bold mt-4 mb-2">المنتجات</h3>
            <div className="space-y-1 text-sm border rounded-xl p-3">
              {selected.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {it.title} × {it.quantity}
                    {it.size && ` · ${it.size}`}
                    {it.color && ` · ${it.color}`}
                  </span>
                  <span>{formatPrice(it.unit_price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-amber-50 rounded-xl p-3 text-sm space-y-1">
              <p className="font-semibold">تفاصيل الدفع</p>
              <p>طريقة الدفع: {selected.deposit_method}</p>
              <p>رقم المُحوِّل: {selected.sender_account_number}</p>
              <p>العربون: {formatPrice(selected.deposit_required)}</p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  تحديث الحالة
                </label>
                <select
                  value={status || "Pending Review"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ملاحظات الإدارة
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, wide }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}