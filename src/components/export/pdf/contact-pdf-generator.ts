import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateContactPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateContactPdf({ reportData, selected = [], summary }: GenerateContactPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Name',
    'Company',
    'Email',
    'Phone',
    'Location',
    'Source',
    'Owner'
  ];

  const body = dataToExport.map((row) => [
    row.first_name || '-',
    row.company_name || '-',
    row.email || '-',
    row.phone || '-',
    [row.city, row.state, row.country].filter(Boolean).join(', ') || '-',
    row.source_lead || '-',
    row.owner_name || '-'
  ]);

  await exportToPdf({
    title: 'Contact Report',
    filename: 'Contact_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
