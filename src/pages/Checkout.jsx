import { useState, useRef } from "react";
import { useCart } from "../store/cartStore";
import {
  supabase,
  formatPrice,
  validatePhone,
  makeIdempotencyKey,
  clearIdempotencyKey,
} from "../lib/supabase";
import { useSettings } from "../lib/settings";
import {
  Copy,
  CheckCircle2,
  Phone,
  Wallet,
  AlertCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { depositRate, instapayAccount, walletNumber } = useSettings();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const submittingRef = useRef(false);

  const [info, setInfo] = useState({
    contact_person: "",
    company_name: "",
    phone1: "",
    phone2: "",
    address: "",
    shipping_location_url: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    deposit_method: "InstaPay",
    sender_account_number: "",
  });

  const total = subtotal();
  const deposit = +(total * depositRate).toFixed(2);
  const targetAccount =
    payment.deposit_method === "InstaPay" ? instapayAccount : walletNumber;

  const copyAccount = () => {
    navigator.clipboard.writeText(targetAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const goToPayment = (e) => {
    e.preventDefault();
    setError("");
    if (!validatePhone(info.phone1))
      return setError("رقم الهاتف غير صحيح (مثال: 01012345678)");
    if (info.phone2 && !validatePhone(info.phone2))
      return setError("رقم الهاتف الثاني غير صحيح");
    setStep(2);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      const idem = makeIdempotencyKey();

      const { data, error } = await supabase.rpc("create_order_atomic", {
        payload: {
          idempotency_key: idem,
          contact_person: info.contact_person,
          company_name: info.company_name,
          phone1: info.phone1,
          phone2: info.phone2,
          address: info.address,
          shipping_location_url: info.shipping_location_url,
          notes: info.notes,
          deposit_method: payment.deposit_method,
          sender_account_number: payment.sender_account_number,
          deposit_proof_url: null,
          items: items.map((i) => ({
            product_id: i.product.id,
            title: i.product.title,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            unit_price: i.product.discount_price ?? i.product.price,
          })),
        },
      });

      if (error) throw error;

      clearIdempotencyKey();
      clear();
      navigate(`/confirmation/${data.order_number}`);
    } catch (err) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى");
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ⭐ الحالة لما السلة فاضية
  if (items.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="إتمام الطلب" />
        <div className="py-20 px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
            <p className="text-gray-500 mb-6">أضف منتجات للسلة أولاً لإتمام الطلب</p>
            <Link
              to="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <PageHeader title="إتمام الطلب" />
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
          <Stepper step={step} />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToPayment} className="space-y-4 mt-6">
              <h2 className="text-xl font-bold">بيانات العميل والشحن</h2>
              <Field
                label="اسم جهة الاتصال *"
                required
                value={info.contact_person}
                onChange={(v) => setInfo({ ...info, contact_person: v })}
              />
              <Field
                label="اسم الشركة (اختياري)"
                value={info.company_name}
                onChange={(v) => setInfo({ ...info, company_name: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="رقم الهاتف 1 *"
                  required
                  value={info.phone1}
                  onChange={(v) => setInfo({ ...info, phone1: v })}
                  type="tel"
                  placeholder="01012345678"
                />
                <Field
                  label="رقم الهاتف 2"
                  value={info.phone2}
                  onChange={(v) => setInfo({ ...info, phone2: v })}
                  type="tel"
                />
              </div>
              <Field
                label="العنوان *"
                required
                value={info.address}
                onChange={(v) => setInfo({ ...info, address: v })}
              />
              <Field
                label="رابط الموقع (Google Maps)"
                value={info.shipping_location_url}
                onChange={(v) => setInfo({ ...info, shipping_location_url: v })}
                placeholder="https://maps.google.com/..."
              />
              <Field
                label="ملاحظات"
                value={info.notes}
                textarea
                onChange={(v) => setInfo({ ...info, notes: v })}
              />

              <button className="w-full bg-black text-white py-3 rounded-xl font-semibold">
                متابعة للدفع
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitOrder} className="space-y-5 mt-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <div className="flex justify-between">
                  <span>إجمالي الطلب</span>
                  <b>{formatPrice(total)}</b>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>العربون المطلوب ({(depositRate * 100).toFixed(0)}%)</span>
                  <b>{formatPrice(deposit)}</b>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">طريقة الدفع</p>
                <div className="grid grid-cols-2 gap-3">
                  {["InstaPay", "Mobile Wallet"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment({ ...payment, deposit_method: m })}
                      className={`border rounded-xl py-3 flex items-center justify-center gap-2 ${
                        payment.deposit_method === m ? "bg-black text-white" : ""
                      }`}
                    >
                      {m === "InstaPay" ? <Wallet size={18} /> : <Phone size={18} />}{" "}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {targetAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 mb-1">
                    حوّل مبلغ العربون على الحساب التالي:
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border">
                    <span className="font-mono text-lg tracking-wider select-all">
                      {targetAccount}
                    </span>
                    <button
                      type="button"
                      onClick={copyAccount}
                      className="text-blue-600 flex items-center gap-1 text-sm"
                    >
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copied ? "تم" : "نسخ"}
                    </button>
                  </div>
                </div>
              )}

              <Field
                label={
                  payment.deposit_method === "InstaPay"
                    ? "رقم حساب المُحوِّل (InstaPay) *"
                    : "رقم محفظة المُحوِّل *"
                }
                required
                value={payment.sender_account_number}
                onChange={(v) => setPayment({ ...payment, sender_account_number: v })}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border py-3 rounded-xl"
                >
                  رجوع
                </button>
                <button
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> جارٍ الإرسال...
                    </>
                  ) : (
                    "تأكيد الطلب"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, textarea, placeholder }) {
  const Comp = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Comp
        type={textarea ? undefined : type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full grid place-items-center font-bold ${
              step >= n ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {n}
          </div>
          <span className="text-sm">{n === 1 ? "بيانات الشحن" : "الدفع"}</span>
          {n === 1 && <div className="w-8 h-px bg-gray-300" />}
        </div>
      ))}
    </div>
  );
}