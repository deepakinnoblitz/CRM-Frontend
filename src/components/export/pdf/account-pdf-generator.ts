import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateAccountPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateAccountPdf({ reportData, selected = [], summary }: GenerateAccountPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Account Name',
    'Phone',
    'Website',
    'GSTIN',
    'Location',
    'Owner'
  ];

  const body = dataToExport.map((row) => [
    row.account_name || '-',
    row.phone_number || '-',
    row.website || '-',
    row.gstin || '-',
    [row.city, row.state, row.country].filter(Boolean).join(', ') || '-',
    row.owner_name || '-'
  ]);

  await exportToPdf({
    title: 'Account Report',
    filename: 'Account_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
