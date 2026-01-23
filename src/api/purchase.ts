import { getAuthHeaders, frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface PurchaseItem {
    name?: string;
    service?: string;
    hsn_code?: string;
    description?: string;
    quantity?: number;
    price?: number;
    discount_type?: string;
    discount?: number;
    tax_type?: string;
    tax_amount?: number;
    sub_total?: number;
}

export interface Purchase {
    name: string;
    vendor_name: string;
    vendor_id?: string;
    bill_no: string;
    bill_date: string;
    payment_type?: string;
    payment_terms?: string;
    due_date?: string;

    // Items
    table_qecz?: PurchaseItem[];

    // Totals
    total_qty?: number;
    total_amount?: number;
    overall_discount_type?: string;
    overall_discount?: number;
    grand_total?: number;
    paid_amount?: number;
    balance_amount?: number;

    description?: string;
    attach?: string; // File path or URL

    creation?: string;
    owner?: string;
}

export async function fetchPurchases(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filterValues?: Record<string, any>;
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    // Add dynamic filters from filterValues
    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                if (key === 'vendor_name') {
                    // Special handling for vendor name if needed, but standard link field works
                    filters.push(["Purchase", key, "=", value]);
                } else {
                    filters.push(["Purchase", key, "=", value]);
                }
            }
        });
    }

    if (params.search) {
        or_filters.push(["Purchase", "vendor_name", "like", `%${params.search}%`]);
        or_filters.push(["Purchase", "bill_no", "like", `%${params.search}%`]);
    }

    // Convert sort_by format (e.g., "bill_date_desc") to Frappe order_by format
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
        doctype: "Purchase",
        fields: JSON.stringify([
            "name",
            "vendor_name",
            "bill_no",
            "bill_date",
            "payment_type",
            "payment_terms",
            "due_date",
            "grand_total",
            "paid_amount",
            "balance_amount",
            "description",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Purchase&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch purchases");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createPurchase(data: Partial<Purchase>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Purchase",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create purchase"));
    return json.message;
}

export async function updatePurchase(name: string, data: Partial<Purchase>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Purchase",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update purchase"));
    return json.message;
}

export async function deletePurchase(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Purchase",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete purchase"));
    return json.message;
}

export async function getPurchase(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Purchase&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch purchase details");
    }

    return (await res.json()).message;
}

export async function getDoctypeList(doctype: string, fields?: string[], filters?: any) {
    const params: any = { doctype };
    if (fields) {
        params.fields = JSON.stringify(fields);
    }
    if (filters) {
        params.filters = JSON.stringify(filters);
    }
    const query = new URLSearchParams(params);

    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_doctype_list?${query.toString()}`
    );

    if (!res.ok) {
        return [];
    }
    return (await res.json()).message || [];
}

export async function getPurchasePermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Purchase");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export function getPurchasePrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Purchase&name=${encodeURIComponent(name)}`;
}
