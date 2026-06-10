import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, unknown>[], filename: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportOrdersReport(orders: {
  date: string;
  doctor: string;
  clinic: string;
  area: string;
  total: number;
  status: string;
  invoice: string;
}[], filename: string) {
  const data = orders.map(o => ({
    'Date': o.date,
    'Doctor': o.doctor,
    'Clinic': o.clinic,
    'Area': o.area,
    'Total (₹)': o.total,
    'Payment Status': o.status.toUpperCase(),
    'Invoice No.': o.invoice || '-',
  }));
  exportToExcel(data, filename, 'Orders Report');
}
