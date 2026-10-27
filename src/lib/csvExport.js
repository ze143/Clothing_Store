export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // BOM عشان Excel يقرأ العربي صح
  const BOM = '\uFEFF';

  const headerLine = headers.map((h) => `"${h.label}"`).join(',');

  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = BOM + [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}