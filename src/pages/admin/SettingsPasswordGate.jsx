import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SettingsPasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.rpc('verify_settings_password', {
      p_password: password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data) {
      setError('كلمة السر غلط');
      return;
    }

    // ✅ نجح
    onUnlock();
  };

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-4"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full grid place-items-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold">صفحة محمية</h2>
          <p className="text-gray-500 text-sm mt-1">
            أدخل كلمة سر الإعدادات للمتابعة
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            required
            autoFocus
            className="w-full border rounded-xl px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'جارٍ التحقق...' : 'دخول'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          🔒 هذه الصفحة محمية بكلمة سر منفصلة لحماية بيانات المتجر
        </p>
      </form>
    </div>
  );
}