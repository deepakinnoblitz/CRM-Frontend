import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateLeadPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateLeadPdf({ reportData, selected = [], summary }: GenerateLeadPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Lead Name',
    'Company',
    'Phone',
    'Email',
    'Service',
    'Leads Type',
    'Leads From',
    'Owner'
  ];

  const body = dataToExport.map((row) => [
    row.lead_name || '-',
    row.company_name || '-',
    row.phone_number || '-',
    row.email || '-',
    row.service || '-',
    row.leads_type || '-',
    row.leads_from || '-',
    row.owner_name || '-'
  ]);

  await exportToPdf({
    title: 'Lead Report',
    filename: 'Lead_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
