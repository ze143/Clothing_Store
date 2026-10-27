import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);
    navigate('/admin/orders');
  };

  return (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">لوحة الإدارة</h1>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <input className="w-full border rounded-xl px-3 py-2" placeholder="البريد الإلكتروني"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded-xl px-3 py-2" placeholder="كلمة المرور"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-3 rounded-xl">تسجيل الدخول</button>
      </form>
    </div>
  );
}