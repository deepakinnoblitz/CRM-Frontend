import { frappeRequest } from 'src/utils/csrf';

import { handleResponse } from './utils';

export async function getMyReminders() {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.get_my_reminders', {
    method: 'POST',
  });
  const data = await handleResponse(res);
  return data.message;
}

export async function saveRemainder(data: any) {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.save_remainder', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  const result = await handleResponse(res);
  return result.message;
}

export async function getHRReminders() {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.get_hr_reminders', {
    method: 'GET',
  });
  const data = await handleResponse(res);
  return data.message || [];
}

export async function fetchHRReminders(params: {
  page: number;
  page_size: number;
  search?: string;
  sort_by?: string;
}) {
  const query = new URLSearchParams({
    params: JSON.stringify(params),
  });

  const res = await frappeRequest(
    `/api/method/company.company.employee_remainder_api.get_hr_reminders_paginated?${query.toString()}`,
    {
      method: 'GET',
    }
  );
  const data = await handleResponse(res);
  return data.message || { data: [], total: 0 };
}

export async function saveHRRemainder(data: any) {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.save_hr_remainder', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  const result = await handleResponse(res);
  return result.message;
}

export async function deleteHRReminder(name: string) {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.delete_hr_remainder', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  const result = await handleResponse(res);
  return result.message;
}

export async function getReminderSettings() {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.get_reminder_settings', {
    method: 'GET',
  });
  const data = await handleResponse(res);
  return data.message;
}

export async function saveReminderSettings(data: any) {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.save_reminder_settings', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  const result = await handleResponse(res);
  return result.message;
}
