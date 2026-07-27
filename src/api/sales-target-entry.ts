import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface SalesTargetEntry {
    name: string;
    sales_entry_id: string;
    sales_person: string;
    in_date?: string;
    month?: string;
    contact_name?: string;
    contact_number?: string;
    industry?: string;
    lead_source?: string;
    service?: string;
    value?: number;
    gst_type?: 'GST' | 'NGST';
    advance?: number;
    balance?: number;
    out_date?: string;
    status?: 'New' | 'Confirmed' | 'In Progress' | 'Completed' | 'Hold' | 'Cancelled';
    remarks?: string;
}

export async function fetchSalesTargetEntries(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filterValues?: Record<string, any>;
}) {
    const filters: any[] = [];

    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filters.push(["Sales Target Entry", key, "=", value]);
            }
        });
    }

    const or_filters: any[] = params.search ? [
        ["Sales Target Entry", "sales_entry_id", "like", `%${params.search}%`],
        ["Sales Target Entry", "sales_person", "like", `%${params.search}%`],
        ["Sales Target Entry", "contact_name", "like", `%${params.search}%`],
        ["Sales Target Entry", "industry", "like", `%${params.search}%`],
        ["Sales Target Entry", "service", "like", `%${params.search}%`],
        ["Sales Target Entry", "status", "like", `%${params.search}%`]
    ] : [];

    let orderBy = "creation desc";
    if (params.sort_by) {
        const [field, direction] = params.sort_by.split('_').reduce((acc, part) => {
            if (part === 'asc' || part === 'desc') {
                acc[1] = part;
            } else {
                acc[0] = acc[0] ? `${acc[0]}_${part}` : part;
            }
            return acc;
        }, ['', 'desc']);
        orderBy = `${field} ${direction}`;
    }

    const query = new URLSearchParams({
        doctype: "Sales Target Entry",
        fields: JSON.stringify([
            "name",
            "sales_entry_id",
            "sales_person",
            "in_date",
            "month",
            "contact_name",
            "contact_number",
            "industry",
            "lead_source",
            "service",
            "value",
            "gst_type",
            "advance",
            "balance",
            "out_date",
            "status",
            "remarks",
            "owner",
            "creation"
        ]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/company.company.frontend_api.get_permitted_count?doctype=Sales Target Entry&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch Sales Target Entries");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function fetchNextSalesTargetPreview() {
    const res = await frappeRequest("/api/method/company.company.doctype.sales_target_entry.sales_target_entry.get_next_sales_target_preview");
    if (!res.ok) {
        throw new Error("Failed to fetch Sales Target preview ID");
    }
    const json = await res.json();
    return json.message;
}

export async function createSalesTargetEntry(data: Partial<SalesTargetEntry>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Sales Target Entry",
                ...data
            }
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create sales target entry"));
    return json.message;
}

export async function updateSalesTargetEntry(name: string, data: Partial<SalesTargetEntry>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Sales Target Entry",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update sales target entry"));
    return json.message;
}

export async function deleteSalesTargetEntry(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Sales Target Entry",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete sales target entry"));
    return json.message;
}

export async function getSalesTargetEntryPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Sales Target Entry");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}
