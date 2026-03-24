import { frappeRequest } from 'src/utils/csrf';

export async function updatePresence(status: string, employee?: string, statusMessage?: string) {
  const res = await frappeRequest('/api/method/company.company.presence_api.update_presence', {
    method: 'POST',
    body: JSON.stringify({ status, employee, status_message: statusMessage }),
  });
  if (!res.ok) throw new Error('Failed to update presence');
  const data = await res.json();
  return data.message;
}

export async function pingPresence(employee?: string) {
  const res = await frappeRequest('/api/method/company.company.presence_api.ping_presence', {
    method: 'POST',
    body: JSON.stringify({ employee }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.message;
}

export async function getPresence(employee?: string) {
  const res = await frappeRequest('/api/method/company.company.presence_api.get_presence', {
    method: 'POST',
    body: JSON.stringify({ employee }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.message;
}

export async function checkTodayTimesheet(employee?: string) {
  const res = await frappeRequest('/api/method/company.company.presence_api.check_today_timesheet', {
    method: 'POST',
    body: JSON.stringify({ employee }),
  });
  if (!res.ok) return { has_timesheet: false };
  const data = await res.json();
  return data.message;
}
export async function getAllPresences() {
  const res = await frappeRequest('/api/method/company.company.presence_api.get_all_presences', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.message || {};
}
