import { formatDate, formatCurrency, getMonthLabel } from './helpers';
import jsPDF from 'jspdf';

export const exportCSV = (transactions, currency = 'INR') => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type,
    t.category,
    `"${t.description.replace(/"/g, '""')}"`,
    formatCurrency(currency, currency, t.amount),
  ]);
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportPDF = (transactions, income, expenses, budget, currency = 'INR') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241);
  doc.text('Budget Tracker Report', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(14, 33, pageWidth - 14, 33);

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Summary', 14, 45);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const summaryData = [
    ['Total Income:', formatCurrency(currency, income)],
    ['Total Expenses:', formatCurrency(currency, expenses)],
    ['Remaining Balance:', formatCurrency(currency, income - expenses)],
    ['Monthly Budget:', formatCurrency(currency, budget)],
    ['Budget Remaining:', formatCurrency(currency, budget - expenses)],
  ];
  let y = 55;
  summaryData.forEach(([label, value]) => {
    doc.text(label, 20, y);
    doc.text(value, pageWidth - 20, y, { align: 'right' });
    y += 8;
  });

  y += 10;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(14, y - 2, pageWidth - 14, y - 2);

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Recent Transactions', 14, y + 5);
  y += 15;

  const headers = [['Date', 'Type', 'Category', 'Description', 'Amount']];
  const cols = [28, 22, 28, 60, 28];
  const recentTransactions = [...transactions].reverse().slice(0, 20);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(99, 102, 241);
  let x = 14;
  headers[0].forEach((h, i) => {
    doc.rect(x, y - 4, cols[i], 7, 'F');
    doc.text(h, x + 2, y + 1);
    x += cols[i];
  });
  y += 6;
  doc.setTextColor(71, 85, 105);

  recentTransactions.forEach((t, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    x = 14;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 3, pageWidth - 28, 7, 'F');
    }
    const row = [
      formatDate(t.date),
      t.type,
      t.category,
      t.description.length > 20 ? t.description.slice(0, 20) + '...' : t.description,
      formatCurrency(currency, t.amount),
    ];
    row.forEach((val, i) => {
      doc.text(val, x + 2, y + 1);
      x += cols[i];
    });
    y += 7;
  });

  doc.save(`budget_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
