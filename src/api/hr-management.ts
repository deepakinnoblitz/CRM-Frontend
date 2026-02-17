import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// Generic fetch function for Frappe list
export async function fetchFrappeList(doctype: string, params: {
    page: number;
    page_size: number;
    search?: string;
    searchField?: string;
    filters?: any[];
    or_filters?: any[];
    orderBy?: string;
    order?: 'asc' | 'desc';
}) {
    const filters: any[] = params.filters || [];
    const or_filters: any[] = params.or_filters || [];

    if (params.search && params.searchField) {
        if (Array.isArray(params.searchField)) {
            params.searchField.forEach(field => {
                or_filters.push([doctype, field, "like", `%${params.search}%`]);
            });
        } else if (typeof params.searchField === 'string' && params.searchField.includes(',')) {
            params.searchField.split(',').forEach(field => {
                or_filters.push([doctype, field.trim(), "like", `%${params.search}%`]);
            });
        } else {
            filters.push([doctype, params.searchField as string, "like", `%${params.search}%`]);
        }
    }

    let orderByParam = "creation desc";
    if (params.orderBy) {
        if (params.order) {
            orderByParam = `${params.orderBy} ${params.order}`;
        } else {
            // Handle combined string like "upload_date_desc" or "upload_date desc"
            const parts = params.orderBy.split(/[ _]/);
            const direction = parts[parts.length - 1].toLowerCase();
            if (direction === 'asc' || direction === 'desc') {
                parts.pop();
                orderByParam = `${parts.join('_')} ${direction}`;
            } else {
                orderByParam = `${params.orderBy} desc`;
            }
        }
    }

    const res = await frappeRequest("/api/method/company.company.frontend_api.get_list_enhanced", {
        method: "POST",
        body: JSON.stringify({
            doctype,
            fields: ["*"],
            filters,
            or_filters,
            limit_start: (params.page - 1) * params.page_size,
            limit_page_length: params.page_size,
            order_by: orderByParam
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch ${doctype}`));
    }
    const json = await res.json();
    const result = json.message || { data: [], total: 0 };

    return {
        data: result.data || [],
        total: result.total || 0
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
