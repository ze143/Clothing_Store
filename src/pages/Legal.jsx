import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const CONTENT = {
  terms: {
    title: 'شروط الاستخدام',
    body: `
      باستخدامك لهذا الموقع، فإنك توافق على الشروط التالية:
      
      1. جميع الأسعار المعروضة بالجنيه المصري وشاملة ضريبة القيمة المضافة (إن وجدت).
      2. الحد الأدنى للطلب يظهر على كل منتج.
      3. يجب دفع عربون 20% من قيمة الطلب لتأكيد الطلب.
      4. يتم التواصل خلال 24 ساعة من استلام الطلب لتأكيد التفاصيل.
      5. قد تختلف الألوان قليلاً عن الصور المعروضة بسبب اختلاف الشاشات.
    `,
  },
  privacy: {
    title: 'سياسة الخصوصية',
    body: `
      نحن نحترم خصوصيتك ونلتزم بحماية بياناتك:
      
      1. نجمع فقط البيانات اللازمة لإتمام طلبك (الاسم، الهاتف، العنوان).
      2. لا نشارك بياناتك مع أي طرف ثالث إلا لشركات الشحن.
      3. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا.
      4. نستخدم تشفير SSL لحماية جميع البيانات المرسلة.
    `,
  },
  returns: {
    title: 'سياسة الاسترجاع',
    body: `
      يمكنك استرجاع المنتج خلال 14 يوم من الاستلام بشرط:
      
      1. أن يكون المنتج بحالته الأصلية مع البطاقات.
      2. عدم استخدام المنتج أو غسله.
      3. وجود فاتورة الشراء.
      
      في حالة وجود عيب مصنعي:
      - نتحمل نحن تكاليف الشحن والإرجاع.
      - يتم الاستبدال أو استرداد كامل المبلغ خلال 7 أيام عمل.
      
      في حالة تغيير الرأي:
      - يتحمل العميل تكاليف الشحن.
      - يتم استرداد المبلغ خلال 14 يوم عمل.
    `,
  },
};

export default function Legal() {
  const { type } = useParams();
  const content = CONTENT[type];

  if (!content) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <PageHeader title="غير موجود" />
        <div className="p-10 text-center">الصفحة غير موجودة</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <PageHeader title={content.title} />
      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
          <p className="whitespace-pre-line leading-8 text-gray-700">{content.body}</p>
          <p className="mt-8 text-sm text-gray-500">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
    </div>
  );
}