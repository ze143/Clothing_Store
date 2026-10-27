export const STATUS_LABELS = {
  'Pending Review': 'قيد المراجعة',
  'Deposit Confirmed': 'تم تأكيد العربون',
  'Order Confirmed': 'الطلب مؤكد',
  'Delivered': 'تم التسليم',
  'Cancelled/Rejected': 'ملغي / مرفوض',
};

export const STATUS_COLORS = {
  'Pending Review': 'bg-yellow-100 text-yellow-800',
  'Deposit Confirmed': 'bg-blue-100 text-blue-800',
  'Order Confirmed': 'bg-indigo-100 text-indigo-800',
  'Delivered': 'bg-emerald-100 text-emerald-800',
  'Cancelled/Rejected': 'bg-red-100 text-red-800',
};

export const statusLabel = (status) => STATUS_LABELS[status] || status;