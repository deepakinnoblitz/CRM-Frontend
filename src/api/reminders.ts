import { frappeRequest } from 'src/utils/csrf';

import { handleResponse } from './utils';

export async function getMyReminders() {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.get_my_reminders', {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function saveRemainder(data: any) {
  const res = await frappeRequest('/api/method/company.company.employee_remainder_api.save_remainder', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return handleResponse(res);
}
