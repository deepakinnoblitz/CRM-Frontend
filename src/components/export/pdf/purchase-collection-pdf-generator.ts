import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GeneratePurchaseCollectionPdfOptions {
  reportData: any[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generatePurchaseCollectionPdf({ reportData, summary }: GeneratePurchaseCollectionPdfOptions) {
  const headers = [
    'ID',
    'Purchase No',
    'Date',
    'Vendor ID',
    'Vendor Name',
    'Mode',
    'Amount to Pay',
    'Paid',
    'Pending'
  ];

  const body = reportData.map((row) => [
    row.id || '-',
    row.purchase || '-',
    row.collection_date ? dayjs(row.collection_date).format('DD MMM YYYY') : '-',
    row.vendor || '-',
    row.vendor_name || '-',
    row.mode_of_payment || '-',
    fCurrency(row.amount_to_pay) || '₹0.00',
    fCurrency(row.amount_collected) || '₹0.00',
    fCurrency(row.amount_pending) || '₹0.00'
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

