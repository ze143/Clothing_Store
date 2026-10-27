import { useEffect, useState } from 'react';
import { supabase } from './supabase';

let cache = null;
let promise = null;

export function useSettings() {
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    if (cache) {
      setSettings(cache);
      return;
    }
    if (!promise) {
      promise = supabase.rpc('get_public_settings').then(({ data }) => {
        cache = data ?? {};
        return cache;
      });
    }
    promise.then((s) => setSettings(s));
  }, []);

  return {
    depositRate: Number(settings?.deposit_rate ?? 0.2),
    storeName: settings?.store_name ?? 'متجر الملابس',
    storePhone: settings?.store_phone ?? '',
    storeAddress: settings?.store_address ?? '',   // ⭐ جديد
    instapayAccount: settings?.instapay_account ?? '',
    walletNumber: settings?.wallet_number ?? '',
    whatsappNumber: settings?.whatsapp_number ?? '',
    supportEmail: settings?.support_email ?? '',
    loaded: !!settings,
  };
}