import { frappeRequest } from 'src/utils/csrf';

export async function submitAssetRequest(data: {
  request_type: string;
  priority: string;
  purpose: string;
  asset_category?: string;
  asset?: string;
  asset_name?: string;
  asset_tag?: string;
  employee?: string;
  return_attachment?: string;
}) {
  // Use custom API so employee is resolved server-side from frappe.session.user
  const response = await frappeRequest(
    '/api/method/company.company.frontend_api.submit_asset_request',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData; // Throw full object so parseServerError can read _server_messages
  }

  return response.json();
}

export async function fetchMyAssetRequests(
  employeeId: string,
  page: number = 1,
  limit: number = 10,
  requestType: string = 'all',
  status: string = 'all',
  sortBy: string = 'modified desc',
  filters?: {
    category?: string;
    asset?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    request_type: requestType.toLowerCase() === 'all' ? '' : requestType,
    status: status.toLowerCase() === 'all' ? '' : status,
    sort_by: sortBy,
    category: filters?.category || '',
    asset: filters?.asset || '',
    priority: filters?.priority || '',
    start_date: filters?.startDate || '',
    end_date: filters?.endDate || '',
  });

  const response = await frappeRequest(
    `/api/method/company.company.frontend_api.get_my_asset_requests?${params.toString()}&_=${Date.now()}`
  );

  if (!response.ok) throw new Error('Failed to fetch Asset Requests');

  const data = await response.json();
  return data.message || { data: [], total: 0 };
}

export async function fetchPendingAssetRequests(
  page: number = 1,
  limit: number = 10,
  requestType: string = 'all',
  status: string = 'all',
  sortBy: string = 'modified desc',
  filters?: {
    category?: string;
    asset?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    request_type: requestType.toLowerCase() === 'all' ? '' : requestType,
    status: status.toLowerCase() === 'all' ? '' : status,
    sort_by: sortBy,
    category: filters?.category || '',
    asset: filters?.asset || '',
    priority: filters?.priority || '',
    start_date: filters?.startDate || '',
    end_date: filters?.endDate || '',
  });

  const response = await frappeRequest(
    `/api/method/company.company.frontend_api.get_pending_asset_requests?${params.toString()}&_=${Date.now()}`
  );

  if (!response.ok) throw new Error('Failed to fetch pending Asset Requests');

  const data = await response.json();
  return data.message || { data: [], total: 0 };
}

export async function updateAssetRequest(name: string, data: any) {
  const response = await frappeRequest(`/api/resource/Asset Request/${name}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update Asset Request');
  }

  return response.json();
}

export async function approveDeclaration(payload: {
  request_name: string;
  hr_remarks?: string;
  asset_name?: string;
  asset_tag?: string;
  asset_category?: string;
  purchase_date?: string;
  purchase_cost?: number;
}) {
  const response = await frappeRequest(
    '/api/method/company.company.frontend_api.approve_declaration',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
}
