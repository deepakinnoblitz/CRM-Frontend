import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GeneratePurchasePdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generatePurchasePdf({ reportData, selected = [], summary }: GeneratePurchasePdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Purchase ID',
    'Vendor',
    'Bill No',
    'Bill Date',
    'Item',
    'Qty',
    'Grand Total'
  ];

  const body = dataToExport.map((row) => [
    row.name || '-',
    row.vendor_name ? (row.vendor_real_name ? `${row.vendor_name} - ${row.vendor_real_name}` : row.vendor_name) : '-',
    row.bill_no || '-',
    row.bill_date ? dayjs(row.bill_date).format('DD MMM YYYY') : '-',
    row.service || '-',
    row.quantity || 0,
    fCurrency(row.grand_total) || '₹0.00'
  ]);

  await exportToPdf({
    title: 'Purchase Report',
    filename: 'Purchase_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
