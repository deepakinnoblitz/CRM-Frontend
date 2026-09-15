import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateCallsPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateCallsPdf({ reportData, selected = [], summary }: GenerateCallsPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Title',
    'Call For',
    'Lead/Client',
    'Company',
    'Status',
    'Time',
    'Owner'
  ];

  const body = dataToExport.map((row) => [
    row.title || '-',
    row.call_for || '-',
    row.lead_title || row.contact_title ? `${row.lead_title || row.contact_title} (${row.lead_name || row.contact_name})` : (row.lead_name || row.contact_name || '-'),
    row.account_title ? `${row.account_title} (${row.account_name})` : (row.account_name || '-'),
    row.outgoing_call_status || '-',
    row.call_start_time ? dayjs(row.call_start_time).format('DD MMM YYYY HH:mm') : '-',
    row.owner_full_name || row.owner_name || '-'
  ]);

  await exportToPdf({
    title: 'Calls Report',
    filename: 'Calls_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
