import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Column {
  key: string;
  label: string;
}

export function exportToCSV(data: Record<string, any>[], filename: string, columns: Column[]) {
  const header = columns.map((c) => c.label).join(',');
  const rows = data.map((item) =>
    columns
      .map((c) => {
        let val = item[c.key] ?? '';
        val = String(val).replace(/"/g, '""');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val}"`;
        }
        return val;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(data: Record<string, any>[], filename: string, columns: Column[], title: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [columns.map((c) => c.label)],
    body: data.map((item) =>
      columns.map((c) => {
        const val = item[c.key] ?? '';
        const str = String(val);
        return str.length > 80 ? str.substring(0, 77) + '...' : str;
      })
    ),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${filename}.pdf`);
}
