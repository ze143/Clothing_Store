import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import SettingsPasswordGate from './SettingsPasswordGate';
import { Save, Lock, LogOut } from 'lucide-react';

const FIELDS = [
  { key: 'store_name', label: 'اسم المتجر', type: 'text' },
  { key: 'store_phone', label: 'رقم التليفون', type: 'text' },
  { key: 'store_address', label: 'عنوان المتجر', type: 'text' },
  { key: 'instapay_account', label: 'حساب InstaPay', type: 'text' },
  { key: 'wallet_number', label: 'رقم المحفظة', type: 'text' },
  { key: 'whatsapp_number', label: 'رقم واتساب (بصيغة دولية مثل 2010...)', type: 'text' },
  { key: 'support_email', label: 'إيميل الدعم', type: 'email' },
  { key: 'deposit_rate', label: 'نسبة العربون (مثال: 0.20 = 20%)', type: 'number', step: '0.01' },
];

const SESSION_KEY = 'settings_unlocked_until';
const SESSION_DURATION = 30 * 60 * 1000; // 30 دقيقة

function isSessionValid() {
  const until = sessionStorage.getItem(SESSION_KEY);
  if (!until) return false;
  return Date.now() < Number(until);
}

export default function Settings() {
  const [unlocked, setUnlocked] = useState(isSessionValid());
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Load settings only when unlocked
  useEffect(() => {
    if (!unlocked) return;
    supabase.from('store_settings').select('*').then(({ data }) => {
      const map = {};
      (data ?? []).forEach((r) => {
        // استثناء كلمة السر من العرض
        if (r.key === 'settings_password_hash') return;
        map[r.key] = typeof r.value === 'string' ? r.value : String(r.value);
      });
      setValues(map);
      setLoading(false);
    });
  }, [unlocked]);

  const unlock = () => {
    sessionStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION));
    setUnlocked(true);
  };

  const lockNow = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setValues({});
  };

  const save = async () => {
    setSaving(true);
    setMsg('');

    const updates = FIELDS.map((f) => {
      let v = values[f.key] ?? '';
      if (f.type === 'number') v = Number(v);
      return supabase
        .from('store_settings')
        .upsert({ key: f.key, value: v, updated_at: new Date().toISOString() })
        .then(({ error }) => error);
    });

    const results = await Promise.all(updates);
    const err = results.find(Boolean);
    setSaving(false);

    if (err) return setMsg(`خطأ: ${err.message}`);
    setMsg('تم الحفظ بنجاح ✓');
    setTimeout(() => setMsg(''), 3000);
  };

  // 🔒 لو مش مفتوح، اعرض شاشة كلمة السر
  if (!unlocked) {
    return <SettingsPasswordGate onUnlock={unlock} />;
  }

  if (loading) return <p>جارٍ التحميل...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lock size={22} className="text-emerald-600" />
          إعدادات المتجر
        </h1>
        <button
          onClick={lockNow}
          className="text-sm text-red-600 flex items-center gap-1 hover:underline"
        >
          <LogOut size={14} /> قفل الصفحة
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 max-w-2xl space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type}
              step={f.step}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>
        ))}

        {msg && (
          <p className={`text-sm ${msg.startsWith('خطأ') ? 'text-red-600' : 'text-emerald-600'}`}>
            {msg}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="bg-black text-white py-3 px-6 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>

        <p className="text-xs text-gray-500">
          * التغييرات تظهر للعملاء بعد refresh للصفحة
        </p>
      </div>

      <ChangePasswordSection />
    </div>
  );
}

// مكون تغيير كلمة السر
function ChangePasswordSection() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (newPass !== confirmPass) {
      setMsg('كلمة السر الجديدة غير متطابقة');
      return;
    }
    if (newPass.length < 8) {
      setMsg('كلمة السر الجديدة لازم تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('change_settings_password', {
      p_old: oldPass,
      p_new: newPass,
    });
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg('تم تغيير كلمة السر بنجاح ✓');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 max-w-2xl mt-6">
      <h2 className="font-bold mb-4">تغيير كلمة سر الإعدادات</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          placeholder="كلمة السر الحالية"
          required
          className="w-full border rounded-xl px-3 py-2"
        />
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="كلمة السر الجديدة (8 أحرف على الأقل)"
          required
          minLength={8}
          className="w-full border rounded-xl px-3 py-2"
        />
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="تأكيد كلمة السر الجديدة"
          required
          className="w-full border rounded-xl px-3 py-2"
        />
        {msg && (
          <p className={`text-sm ${msg.includes('بن��ح') ? 'text-emerald-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}
        <button
          disabled={loading}
          className="bg-gray-800 text-white py-2 px-4 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'جارٍ التغيير...' : 'تغيير كلمة السر'}
        </button>
      </form>
    </div>
  );
}