import { exportToPdf } from 'src/utils/pdf-export';
import { fCurrency } from 'src/utils/format-number';

interface GenerateSalesTargetEntryPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any; isCurrency?: boolean }[];
}

export async function generateSalesTargetEntryPdf({
  reportData,
  selected = [],
  summary,
}: GenerateSalesTargetEntryPdfOptions) {
  const dataToExport =
    selected.length > 0
      ? reportData.filter((row) => selected.includes(row.sales_entry_id || row.name))
      : reportData;

  const headers = [
    'Sales Entry ID',
    'Sales Person',
    'Month',
    'In Date',
    'Contact Name',
    'Contact Number',
    'Industry',
    'Lead Source',
    'Service',
    'Value',
    'Advance',
    'Balance',
    'Status',
    'Out Date',
  ];

  const body = dataToExport.map((row) => [
    row.sales_entry_id || '-',
    row.sales_person || '-',
    row.month || '-',
    row.in_date || '-',
    row.contact_name || '-',
    row.contact_number || '-',
    row.industry || '-',
    row.lead_source || '-',
    row.service || '-',
    row.value != null ? fCurrency(row.value) : '-',
    row.advance != null ? fCurrency(row.advance) : '-',
    row.balance != null ? fCurrency(row.balance) : '-',
    row.status || '-',
    row.out_date || '-',
  ]);

  await exportToPdf({
    title: 'Sales Target Entry Report',
    filename: 'Sales_Target_Entry_Report',
    headers,
    body,
    orientation: 'landscape',
    summary,
  });
}
