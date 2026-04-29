import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------

export async function fetchEmployeeBadges(employeeId: string) {
  const query = new URLSearchParams({
    doctype: 'Employee Badge Assignment',
    fields: JSON.stringify([
      'name',
      'employee',
      'employee_name',
      'badge',
      'awarded_on',
      'awarded_by',
      'reason',
      'badge.icon',
    ]),
    filters: JSON.stringify([['employee', '=', employeeId]]),
    order_by: 'awarded_on desc, `tabEmployee Badge Assignment`.creation desc',
  });

  const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to fetch employee badges'));
  }

  return (await res.json()).message || [];
}

export async function fetchAllBadges() {
  const query = new URLSearchParams({
    doctype: 'Employee Badge',
    fields: JSON.stringify(['name', 'badge_name', 'badge_type', 'description', 'icon']),
    order_by: 'badge_name asc',
  });

  const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to fetch badges'));
  }

  return (await res.json()).message || [];
}

export async function createBadge(data: any) {
  const res = await frappeRequest('/api/method/frappe.client.insert', {
    method: 'POST',
    body: JSON.stringify({
      doc: {
        doctype: 'Employee Badge',
        ...data,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to create badge'));
  }

  return (await res.json()).message;
}

export async function updateBadge(name: string, data: any) {
  const res = await frappeRequest(`/api/resource/Employee Badge/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to update badge'));
  }

  return (await res.json()).data;
}

export async function assignBadge(data: any) {
  const res = await frappeRequest('/api/method/frappe.client.insert', {
    method: 'POST',
    body: JSON.stringify({
      doc: {
        doctype: 'Employee Badge Assignment',
        ...data,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to assign badge'));
  }

  return (await res.json()).message;
}

export async function deleteBadge(name: string) {
  const res = await frappeRequest(
    `/api/method/frappe.client.delete?doctype=Employee Badge&name=${name}`,
    {
      method: 'DELETE',
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to delete badge'));
  }

  return (await res.json()).message;
}

export async function deleteBadgeAssignment(name: string) {
  const res = await frappeRequest(
    `/api/method/frappe.client.delete?doctype=Employee Badge Assignment&name=${name}`,
    {
      method: 'DELETE',
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to delete badge assignment'));
  }

  return (await res.json()).message;
}

export async function renameBadge(oldName: string, newName: string) {
  const res = await frappeRequest('/api/method/company.company.frontend_api.rename_doc', {
    method: 'POST',
    body: JSON.stringify({
      doctype: 'Employee Badge',
      old: oldName,
      new: newName,
      merge: 0,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(handleFrappeError(error, 'Failed to rename badge'));
  }

  return (await res.json()).message;
}
