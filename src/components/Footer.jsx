import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../lib/settings';

export default function Footer() {
  const { whatsappNumber, supportEmail, storeName, storePhone, storeAddress } = useSettings();

  return (
    <footer dir="rtl" className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-black text-lg mb-2">{storeName}</h3>
          <p className="text-sm text-gray-400">
            جودة عالية وأسعار منافسة. تسوق أونلاين بأمان.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-gray-300 hover:text-white">الرئيسية</Link></li>
            <li><Link to="/track" className="text-gray-300 hover:text-white">تتبع الطلب</Link></li>
            <li><Link to="/legal/terms" className="text-gray-300 hover:text-white">شروط الاستخدام</Link></li>
            <li><Link to="/legal/privacy" className="text-gray-300 hover:text-white">سياسة الخصوصية</Link></li>
            <li><Link to="/legal/returns" className="text-gray-300 hover:text-white">سياسة الاسترجاع</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-3">تواصل معنا</h4>
          <ul className="space-y-2 text-sm">
            {storeAddress && (
              <li className="text-gray-300 flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{storeAddress}</span>
              </li>
            )}
            {storePhone && (
              <li>
                <a href={`tel:${storePhone}`}
                  className="text-gray-300 hover:text-white flex items-center gap-2">
                  <Phone size={16} /> {storePhone}
                </a>
              </li>
            )}
            {whatsappNumber && (
              <li>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"
                  className="text-gray-300 hover:text-white flex items-center gap-2">
                  <MessageCircle size={16} /> واتساب
                </a>
              </li>
            )}
            {supportEmail && (
              <li>
                <a href={`mailto:${supportEmail}`}
                  className="text-gray-300 hover:text-white flex items-center gap-2">
                  <Mail size={16} /> {supportEmail}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} {storeName} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}