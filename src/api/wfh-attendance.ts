import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface WFHAttendance {
    name: string;
    employee: string;
    employee_name: string;
    employee_id: string;
    date: string;
    from_time: string;
    to_time: string;
    total_hours: string;
    approved_by?: string;
    task_description?: string;
    workflow_state?: string;
}

// Generic fetch function for Frappe list
async function fetchFrappeList(doctype: string, params: {
    page: number;
    page_size: number;
    search?: string;
    searchField?: string;
    filters?: any[];
    orderBy?: string;
    order?: 'asc' | 'desc';
}) {
    const filters: any[] = params.filters || [];

    if (params.search && params.searchField) {
        filters.push([doctype, params.searchField, "like", `%${params.search}%`]);
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "creation desc";

    const query = new URLSearchParams({
        doctype,
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    try {
        // Fetch data and count in parallel
        const [res, countRes] = await Promise.all([
            frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
            frappeRequest(`/api/method/frappe.client.get_count?doctype=${doctype}&filters=${encodeURIComponent(JSON.stringify(filters))}`)
        ]);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(handleFrappeError(errorData, `Failed to fetch ${doctype} list`));
        }
        if (!countRes.ok) {
            const errorData = await countRes.json();
            throw new Error(handleFrappeError(errorData, `Failed to fetch ${doctype} count`));
        }

        const data = await res.json();
        const countData = await countRes.json();

        return {
            data: data.message || [],
            total: countData.message || 0
        };
    } catch (error) {
        // If handleFrappeError was already used in the if (!res.ok) block,
        // the error thrown will already be a formatted Error object.
        // Otherwise, it's a network error or other unexpected error.
        if (error instanceof Error) {
            throw error;
        }
        // For any other unexpected error type
        throw new Error(handleFrappeError(error, `An unexpected error occurred while fetching ${doctype}`));
    }
}

export const fetchWFHAttendance = (params: any) => fetchFrappeList("WFH Attendance", { ...params, searchField: "employee_name" });

export async function createWFHAttendance(data: Partial<WFHAttendance>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "WFH Attendance", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create WFH attendance record"));
    return json.message;
}

export async function updateWFHAttendance(name: string, data: Partial<WFHAttendance>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "WFH Attendance", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update WFH attendance record"));
    return json.message;
}

export async function deleteWFHAttendance(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "WFH Attendance", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete WFH attendance record"));
    return true;
}

export async function getWFHAttendance(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=WFH Attendance&name=${name}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch WFH Attendance details`));
    }

    return (await res.json()).message;
}

export async function applyWorkflowAction(name: string, action: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.frontend_api.apply_workflow_action', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'WFH Attendance',
            name,
            action,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(handleFrappeError(errorData, `Failed to apply action ${action}`));
    }

    return await res.json();
}

export async function getWorkflowInfo(current_state?: string) {
    const url = `/api/method/company.company.frontend_api.get_workflow_states?doctype=WFH Attendance${current_state ? `&current_state=${current_state}` : ''}`;
    const res = await frappeRequest(url);

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(handleFrappeError(errorData, 'Failed to fetch workflow info'));
    }

    const data = await res.json();
    return data.message;
}
