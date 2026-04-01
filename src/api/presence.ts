import { frappeRequest } from 'src/utils/csrf';

export async function updatePresence(status: string, employee?: string, statusMessage?: string, source: string = 'Manual', startTime?: string) {
  const res = await frappeRequest('/api/method/company.company.presence_api.update_presence', {
    method: 'POST',
    body: JSON.stringify({ status, employee, status_message: statusMessage, source, start_time: startTime }),
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

export async function getPresenceSettings() {
  const res = await frappeRequest('/api/method/company.company.doctype.employee_presence_settings.employee_presence_settings.get_presence_settings', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!res.ok) return { enable_auto_status: 1 };
  const data = await res.json();
  return data.message;
}

export async function updatePresenceSettings(settings: {
  enable_auto_status: boolean,
  idle_threshold?: number,
  away_threshold?: number,
  break_threshold?: number,
  enable_auto_resume_break?: boolean,
  event_mousemove: boolean,
  event_keydown: boolean,
  event_scroll: boolean,
  event_click: boolean,
  event_touchstart: boolean
}) {
  const res = await frappeRequest('/api/method/company.company.doctype.employee_presence_settings.employee_presence_settings.set_presence_settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update presence settings');
  const data = await res.json();
  return data.message;
}
