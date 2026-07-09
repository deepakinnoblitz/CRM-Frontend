import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateProspectsPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateProspectsPdf({ reportData, selected = [], summary }: GenerateProspectsPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Title',
    'Company Name',
    'Company ID',
    'Client Name',
    'Client ID',
    'Stage',
  ];

  const body = dataToExport.map((row) => [
    row.deal_title || '-',
    row.company_name || '-',
    row.account || '-',
    row.contact_name || '-',
    row.contact || '-',
    row.stage || '-',
  ]);

  await exportToPdf({
    title: 'Prospects Report',
    filename: 'Prospects_Report',
    headers,
    body,
    orientation: 'landscape',
    summary,
  });
}
