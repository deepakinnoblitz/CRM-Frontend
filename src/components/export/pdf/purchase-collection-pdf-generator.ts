import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GeneratePurchaseCollectionPdfOptions {
  reportData: any[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generatePurchaseCollectionPdf({ reportData, summary }: GeneratePurchaseCollectionPdfOptions) {
  const headers = [
    'Purchase',
    'Bill Date',
    'Vendor ID',
    'Vendor Name',
    'Grand Total',
    'Paid',
    'Pending',
    'Last Payment',
    'Mode'
  ];

  const body = reportData.map((row) => [
    row.purchase || '-',
    row.bill_date ? dayjs(row.bill_date).format('DD MMM YYYY') : '-',
    row.vendor || '-',
    row.vendor_name || '-',
    fCurrency(row.grand_total) || '₹0.00',
    fCurrency(row.amount_paid) || '₹0.00',
    fCurrency(row.amount_pending) || '₹0.00',
    row.last_payment_date ? dayjs(row.last_payment_date).format('DD MMM YYYY') : '-',
    row.payment_mode || '-'
  ]);

  await exportToPdf({
    title: 'Purchase Settlement Report',
    filename: 'Purchase_Settlement_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
