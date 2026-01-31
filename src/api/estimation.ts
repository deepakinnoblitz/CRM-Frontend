import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface EstimationItem {
    name?: string;
    service?: string;
    hsn_code?: string;
    description?: string;
    quantity: number;
    price: number;
    discount_type?: 'Flat' | 'Percentage';
    discount?: number;
    tax_type?: string;
    tax_amount?: number;
    sub_total?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
}

export interface Estimation {
    name: string;
    ref_no: string;
    client_name: string;
    customer_name?: string;
    billing_name?: string;
    billing_address?: string;
    phone_number?: string;
    estimate_date: string;
    total_qty?: number;
    total_amount?: number;
    overall_discount_type?: 'Flat' | 'Percentage';
    overall_discount?: number;
    grand_total?: number;
    bank_account?: string;
    terms_and_conditions?: string;
    description?: string;
    attachments?: string;
    table_qecz?: EstimationItem[]; // Estimation Items
}

export async function fetchEstimations(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        client_name?: string;
        ref_no?: string;
        estimate_date?: string; // Expecting YYYY-MM-DD
        deal_id?: string;
    };
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Estimation", "ref_no", "like", `%${params.search}%`]);
        or_filters.push(["Estimation", "customer_name", "like", `%${params.search}%`]);
        or_filters.push(["Estimation", "phone_number", "like", `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.client_name && params.filters.client_name !== 'all') {
            filters.push(["Estimation", "client_name", "=", params.filters.client_name]);
        }
        if (params.filters.ref_no) {
            filters.push(["Estimation", "ref_no", "like", `%${params.filters.ref_no}%`]);
        }
        if (params.filters.estimate_date) {
            filters.push(["Estimation", "estimate_date", "=", params.filters.estimate_date]);
        }
        if (params.filters.deal_id) {
            filters.push(["Estimation", "deal", "=", params.filters.deal_id]);
        }
    }

    // Convert sort_by format (e.g., "estimate_date_desc") to Frappe order_by format
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
        doctype: "Estimation",
        fields: JSON.stringify([
            "name",
            "ref_no",
            "client_name",
            "customer_name",
            "estimate_date",
            "grand_total",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Estimation&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch estimations");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createEstimation(data: Partial<Estimation>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Estimation",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create estimation"));
    return json.message;
}

export async function updateEstimation(name: string, data: Partial<Estimation>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Estimation",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update estimation"));
    return json.message;
}

export async function deleteEstimation(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Estimation",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete estimation"));
    return json.message;
}

export async function getEstimation(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Estimation&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch estimation details");
    }

    return (await res.json()).message;
}

export async function getEstimationPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Estimation");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export function getEstimationPrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Estimation&name=${encodeURIComponent(name)}`;
}

export async function convertEstimationToInvoice(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.convert_estimation_to_invoice", {
        method: "POST",
        headers,
        body: JSON.stringify({ estimation: name })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to convert estimation"));
    return json.message;
}

export async function fetchRelatedEstimations(dealId: string) {
    const filters = [["Estimation", "deal", "=", dealId]];
    const query = new URLSearchParams({
        doctype: "Estimation",
        fields: JSON.stringify([
            "name",
            "ref_no",
            "customer_name",
            "estimate_date",
            "grand_total",
            "creation"
        ]),
        filters: JSON.stringify(filters),
        order_by: "creation desc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch related estimations");

    const data = await res.json();
    return data.message || [];
}
