import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// Generic fetch function for Frappe list
export async function fetchFrappeList(doctype: string, params: {
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

    // Fetch data and count in parallel
    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=${doctype}&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch ${doctype}`));
    }
    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

// Generic fetch for a single document
export async function getHRDoc(doctype: string, name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=${doctype}&name=${name}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch ${doctype} details`));
    }

    return (await res.json()).message;
}

// DocType Metadata API
export async function getDocTypeMetadata(doctype: string) {
    const res = await frappeRequest(`/api/method/frappe.desk.form.load.getdoctype?doctype=${doctype}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch metadata for ${doctype}`));
    }
    const json = await res.json();
    return json.docs?.[0] || json.message;
}

// Salary Component API
export async function fetchSalaryComponents() {
    const res = await frappeRequest(`/api/method/frappe.client.get_list?doctype=Salary Structure Component&fields=${JSON.stringify(["component_name", "field_name", "type", "percentage", "static_amount"])}&limit_page_length=100`);
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to fetch salary components"));
    return json.message || [];
}

// Generic Permission API
export async function getHRPermissions(doctype: string) {
    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_doc_permissions?doctype=${doctype}`);
    if (!res.ok) return { read: false, write: false, delete: false };
    const json = await res.json();
    return json.message || { read: false, write: false, delete: false };
}
