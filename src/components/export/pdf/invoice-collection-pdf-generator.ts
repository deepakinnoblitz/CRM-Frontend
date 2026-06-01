import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GenerateInvoiceCollectionPdfOptions {
  reportData: any[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generateInvoiceCollectionPdf({ reportData, summary }: GenerateInvoiceCollectionPdfOptions) {
  const headers = [
    'ID',
    'Invoice No',
    'Date',
    'Mode',
    'Amount to Pay',
    'Amount',
    'Pending'
  ];

  const body = reportData.map((row) => [
    row.id || '-',
    row.invoice || '-',
    row.collection_date ? dayjs(row.collection_date).format('DD MMM YYYY') : '-',
    row.mode_of_payment || '-',
    fCurrency(row.amount_to_pay) || '₹0.00',
    fCurrency(row.amount_collected) || '₹0.00',
    fCurrency(row.amount_pending) || '₹0.00'
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
