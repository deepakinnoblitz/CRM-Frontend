import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { getHRDoc } from './hr-management';

export async function getHRMSSettings() {
  try {
    const settings = await getHRDoc('HRMS Settings', 'HRMS Settings');
    return settings;
  } catch (error) {
    console.error('Failed to fetch HRMS Settings:', error);
    return null;
  }
}

export async function updateHRMSSettings(data: any) {
  const res = await frappeRequest('/api/method/frappe.client.set_value', {
    method: 'POST',
    body: JSON.stringify({
      doctype: 'HRMS Settings',
      name: 'HRMS Settings',
      fieldname: data,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update HRMS Settings'));
  return json.message;
}
