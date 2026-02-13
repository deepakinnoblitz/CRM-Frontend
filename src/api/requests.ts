import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Request {
    name: string;
    employee_id: string;
    employee_name: string;
    subject: string;
    message: string;
    approved_by?: string;
    workflow_state?: string;
    docstatus?: number;
    creation?: string;
    modified?: string;
}

// Generic fetch function for Request list
async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    status?: string;
    employee?: string;
}) {
    const filters: any[] = [];

    if (params.employee && params.employee !== 'all') {
        filters.push(['Request', 'employee_id', '=', params.employee]);
    }

    if (params.status && params.status !== 'all') {
        filters.push(['Request', 'workflow_state', '=', params.status]);
    }

    if (params.search) {
        filters.push([
            ['Request', 'subject', 'like', `%${params.search}%`],
            ['or', ['Request', 'employee_name', 'like', `%${params.search}%`]]
        ]);
    }

    if (params.startDate) {
        filters.push(['Request', 'creation', '>=', params.startDate]);
    }

    if (params.endDate) {
        filters.push(['Request', 'creation', '<=', `${params.endDate} 23:59:59`]);
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "creation desc";

    const query = new URLSearchParams({
        doctype: 'Request',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    // Fetch data and count in parallel
    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Request&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch requests");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchRequests = (params: any) => fetchFrappeList(params);

export async function createRequest(data: Partial<Request>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.submit", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Request", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create request"));
    }

    return (await res.json()).message;
}

export async function updateRequest(name: string, data: Partial<Request>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Request",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update request"));
    }

    return (await res.json()).message;
}

export async function updateRequestStatus(name: string, workflowState: string, updateData?: any) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.update_request_status", {
        method: "POST",
        headers,
        body: JSON.stringify({
            name,
            workflow_state: workflowState,
            update_data: updateData
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update request status"));
    }

    return (await res.json()).message;
}

export async function deleteRequest(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Request", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete request"));
    }

    return true;
}

export async function getRequest(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Request&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch request details");
    }

    return (await res.json()).message;
}

export async function getRequestPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Request");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}
