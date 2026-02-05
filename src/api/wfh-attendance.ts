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

import { fetchFrappeList } from './hr-management';

export const fetchWFHAttendance = async (params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        employee?: string;
        status?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) => {
    const filters: any[] = [];
    if (params.filters) {
        if (params.filters.employee && params.filters.employee !== 'all') {
            filters.push(['WFH Attendance', 'employee', '=', params.filters.employee]);
        }
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['WFH Attendance', 'workflow_state', '=', params.filters.status]);
        }
        if (params.filters.startDate) {
            filters.push(['WFH Attendance', 'date', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['WFH Attendance', 'date', '<=', params.filters.endDate]);
        }
    }

    return fetchFrappeList("WFH Attendance", {
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        searchField: "employee_name",
        filters,
        orderBy: params.orderBy,
        order: params.order
    });
};

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
