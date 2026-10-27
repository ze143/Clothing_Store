import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const formatPrice = (n) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency', currency: 'EGP', currencyDisplay: 'code',
  }).format(n).replace('EGP', 'ج.م');

export const validatePhone = (phone) =>
  /^(\+20|0)?1[0125][0-9]{8}$/.test((phone || '').trim());

export const validateImage = (file, maxMB = 5) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type))
    throw new Error('صيغة الصورة غير مدعومة (JPG, PNG, WEBP, GIF فقط)');
  if (file.size > maxMB * 1024 * 1024)
    throw new Error(`حجم الصورة يتجاوز ${maxMB}MB`);
  return true;
};

export const safeFilename = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
};

// Generate idempotency key once per checkout session
export const makeIdempotencyKey = () => {
  const stored = sessionStorage.getItem('checkout_idem_key');
  if (stored) return stored;
  const key = crypto.randomUUID();
  sessionStorage.setItem('checkout_idem_key', key);
  return key;
};

export const clearIdempotencyKey = () =>
  sessionStorage.removeItem('checkout_idem_key');