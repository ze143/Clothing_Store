import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BackButton({ fallback = '/', label = 'رجوع', className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // لو المستخدم جاي من جوه الموقع، ارجعله
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-1 text-gray-600 hover:text-black text-sm ${className}`}
    >
      <ArrowRight size={16} /> {label}
    </button>
  );
}