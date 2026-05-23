import dayjs from 'dayjs';

import { exportToPdf } from 'src/utils/pdf-export';

interface GenerateMeetingPdfOptions {
  reportData: any[];
  selected?: string[];
  summary?: { label: string; value: any }[];
}

export async function generateMeetingPdf({ reportData, selected = [], summary }: GenerateMeetingPdfOptions) {
  const dataToExport = selected.length > 0
    ? reportData.filter((row) => selected.includes(row.name))
    : reportData;

  const headers = [
    'Title',
    'Meet For',
    'Lead/Contact',
    'Account',
    'Status',
    'Time',
    'Venue',
    'Owner'
  ];

  const body = dataToExport.map((row) => [
    row.title || '-',
    row.meet_for || '-',
    row.lead_name || row.contact_name || '-',
    row.accounts_name || '-',
    row.outgoing_call_status || '-',
    row.from_time ? dayjs(row.from_time).format('DD MMM YYYY HH:mm') : '-',
    row.meeting_venue || row.location || '-',
    row.owner_name || '-'
  ]);

  await exportToPdf({
    title: 'Meeting Report',
    filename: 'Meeting_Report',
    headers,
    body,
    orientation: 'landscape',
    summary
  });
}
