import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Timesheet {
    name: string;
    employee: string;
    employee_name: string;
    timesheet_date: string;
    total_hours: number;
    notes: string;
    creation?: string;
    modified?: string;
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        employee?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    if (params.search) {
        filters.push(['Timesheet', 'employee_name', 'like', `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.employee && params.filters.employee !== 'all') {
            filters.push(['Timesheet', 'employee', '=', params.filters.employee]);
        }
        if (params.filters.startDate) {
            filters.push(['Timesheet', 'timesheet_date', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Timesheet', 'timesheet_date', '<=', params.filters.endDate]);
        }
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "timesheet_date desc";

    const query = new URLSearchParams({
        doctype: 'Timesheet',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Timesheet&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch timesheets");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchTimesheets = (params: any) => fetchFrappeList(params);

export async function createTimesheet(data: Partial<Timesheet>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Timesheet", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create timesheet"));
    }

    return (await res.json()).message;
}

export async function updateTimesheet(name: string, data: Partial<Timesheet>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Timesheet",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update timesheet"));
    }

    return (await res.json()).message;
}

export async function deleteTimesheet(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Timesheet", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete timesheet"));
    }

    return true;
}

export async function getTimesheet(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Timesheet&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch timesheet details");
    }

    return (await res.json()).message;
}

export async function getTimesheetPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Timesheet");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function fetchProjects(params: {
    page: number;
    page_size: number;
    search?: string;
}) {
    const filters: any[] = [];
    if (params.search) {
        filters.push(['Project', 'project', 'like', `%${params.search}%`]);
    }

    const query = new URLSearchParams({
        doctype: 'Project',
        fields: JSON.stringify(["name", "project"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: "project asc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch projects");

    const data = await res.json();
    return {
        data: data.message || []
    };
}

export async function fetchActivityTypes(params: {
    page: number;
    page_size: number;
    search?: string;
}) {
    const filters: any[] = [];
    if (params.search) {
        filters.push(['Activity Type', 'activity_type', 'like', `%${params.search}%`]);
    }

    const query = new URLSearchParams({
        doctype: 'Activity Type',
        fields: JSON.stringify(["name", "activity_type"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: "activity_type asc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch activity types");

    const data = await res.json();
    return {
        data: data.message || []
    };
}
