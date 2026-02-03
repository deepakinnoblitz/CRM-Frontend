import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface AssetAssignment {
    name: string;
    asset: string;
    asset_name: string;
    assigned_to: string;
    employee_name: string;
    assigned_on: string;
    returned_on?: string;
    remarks?: string;
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
        status?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    // Add employee and status filters
    if (params.filters) {
        if (params.filters.employee && params.filters.employee !== 'all') {
            filters.push(['Asset Assignment', 'assigned_to', '=', params.filters.employee]);
        }
        if (params.filters.status && params.filters.status !== 'all') {
            if (params.filters.status === 'active') {
                filters.push(['Asset Assignment', 'returned_on', 'is', 'not set']);
            } else if (params.filters.status === 'returned') {
                filters.push(['Asset Assignment', 'returned_on', 'is', 'set']);
            }
        }
        if (params.filters.startDate) {
            filters.push(['Asset Assignment', 'assigned_on', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Asset Assignment', 'assigned_on', '<=', params.filters.endDate]);
        }
    }

    // Use or_filters for search across multiple fields
    const or_filters: any[] = params.search ? [
        ['Asset Assignment', 'asset_name', 'like', `%${params.search}%`],
        ['Asset Assignment', 'employee_name', 'like', `%${params.search}%`]
    ] : [];

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "assigned_on desc";

    const query = new URLSearchParams({
        doctype: 'Asset Assignment',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Asset Assignment&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch asset assignments");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchAssetAssignments = (params: any) => fetchFrappeList(params);

export async function createAssetAssignment(data: Partial<AssetAssignment>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Asset Assignment", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create asset assignment"));
    }

    return (await res.json()).message;
}

export async function updateAssetAssignment(name: string, data: Partial<AssetAssignment>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Asset Assignment",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update asset assignment"));
    }

    return (await res.json()).message;
}

export async function deleteAssetAssignment(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Asset Assignment", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete asset assignment"));
    }

    return true;
}

export async function getAssetAssignment(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Asset Assignment&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch asset assignment details");
    }

    return (await res.json()).message;
}

export async function getAssetAssignmentPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Asset Assignment");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getEmployees(): Promise<Array<{ name: string; employee_name: string }>> {
    try {
        const res = await frappeRequest("/api/method/frappe.client.get_list?doctype=Employee&fields=[\"name\",\"employee_name\"]&limit_page_length=999");

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return data.message || [];
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return [];
    }
}

export async function getAvailableAssets(): Promise<Array<{ name: string; asset_name: string }>> {
    try {
        const res = await frappeRequest("/api/method/frappe.client.get_list?doctype=Asset&fields=[\"name\",\"asset_name\"]&limit_page_length=999");

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return data.message || [];
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return [];
    }
}
