import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GenerateInvoiceCollectionPdfOptions {
  reportData: any[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generateInvoiceCollectionPdf({ reportData, summary }: GenerateInvoiceCollectionPdfOptions) {
  const headers = [
    'Invoice',
    'Date',
    'Customer ID',
    'Customer Name',
    'Grand Total',
    'Collected',
    'Pending',
    'Last Collection',
    'Mode'
  ];

  const body = reportData.map((row) => [
    row.invoice || '-',
    row.invoice_date ? dayjs(row.invoice_date).format('DD MMM YYYY') : '-',
    row.customer || '-',
    row.customer_name || '-',
    fCurrency(row.grand_total) || '₹0.00',
    fCurrency(row.amount_collected) || '₹0.00',
    fCurrency(row.amount_pending) || '₹0.00',
    row.last_collection_date ? dayjs(row.last_collection_date).format('DD MMM YYYY') : '-',
    row.payment_mode || '-'
  ]);

  await exportToPdf({
    title: 'Invoice Collection Summary',
    filename: 'Invoice_Collection_Summary',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
