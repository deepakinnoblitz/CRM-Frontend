import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GenerateInvoicePdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generateInvoicePdf({ reportData, selected = [], summary }: GenerateInvoicePdfOptions) {
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
    row.invoice_date ? dayjs(row.invoice_date).format('DD MMM YYYY') : '-',
    row.service || '-',
    row.quantity || 0,
    fCurrency(row.price) || '₹0.00',
    fCurrency(row.tax_amount) || '₹0.00',
    fCurrency(row.sub_total) || '₹0.00',
    fCurrency(row.grand_total) || '₹0.00'
  ]);

  await exportToPdf({
    title: 'Invoice Report',
    filename: 'Invoice_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
