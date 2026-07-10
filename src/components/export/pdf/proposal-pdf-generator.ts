import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateProposalPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateProposalPdf({ reportData, selected = [], summary }: GenerateProposalPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Proposal No',
    'Proposal Title',
    'Lead Name',
    'Lead ID',
    'Company Name',
    'Proposal Date',
    'Status',
    'Attachments'
  ];

  const body = dataToExport.map((row) => [
    row.reference_no || row.name || '-',
    row.proposal_title || '-',
    row.lead_name || '-',
    row.lead || '-',
    row.company_name || '-',
    row.proposal_date || '-',
    row.status || '-',
    String(row.total_attachments || 0)
  ]);

  await exportToPdf({
    title: 'Proposal Report',
    filename: 'Proposal_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
