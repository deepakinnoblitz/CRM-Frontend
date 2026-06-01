import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GenerateEstimationPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generateEstimationPdf({ reportData, selected = [], summary }: GenerateEstimationPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Ref No',
    'Customer',
    'Date',
    'Item',
    'Qty',
    'Price',
    'Tax',
    'Subtotal',
    'Grand Total'
  ];

  const body = dataToExport.map((row) => [
    row.name || '-',
    row.customer_name || '-',
    row.estimate_date ? dayjs(row.estimate_date).format('DD MMM YYYY') : '-',
    row.service || '-',
    row.quantity || 0,
    fCurrency(row.price) || '₹0.00',
    fCurrency(row.tax_amount) || '₹0.00',
    fCurrency(row.sub_total) || '₹0.00',
    fCurrency(row.grand_total) || '₹0.00'
  ]);

  await exportToPdf({
    title: 'Estimation Report',
    filename: 'Estimation_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
