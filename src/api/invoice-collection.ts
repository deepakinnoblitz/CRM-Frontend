import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface InvoiceCollection {
    name: string;
    invoice: string;
    customer: string;
    customer_name?: string;
    company_name?: string;
    collection_date: string;
    amount_to_pay: number;
    amount_collected: number;
    amount_pending: number;
    mode_of_payment: string;
    remarks?: string;
    creation: string;
    isLatest?: boolean;
}

export async function fetchInvoiceCollections(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        invoice?: string;
        customer?: string;
        collection_date?: string | null;
        mode_of_payment?: string;
    };
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.filters) {
        if (params.filters.invoice) {
            filters.push(["Invoice Collection", "invoice", "=", params.filters.invoice]);
        }
        if (params.filters.customer && params.filters.customer !== 'all') {
            filters.push(["Invoice Collection", "customer", "=", params.filters.customer]);
        }
        if (params.filters.collection_date) {
            filters.push(["Invoice Collection", "collection_date", "=", params.filters.collection_date]);
        }
        if (params.filters.mode_of_payment && params.filters.mode_of_payment !== 'all') {
            filters.push(["Invoice Collection", "mode_of_payment", "=", params.filters.mode_of_payment]);
        }
    }

    if (params.search) {
        or_filters.push(["Invoice Collection", "name", "like", `%${params.search}%`]);
        or_filters.push(["Invoice Collection", "invoice", "like", `%${params.search}%`]);
        or_filters.push(["Invoice Collection", "customer_name", "like", `%${params.search}%`]);
    }

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
        doctype: "Invoice Collection",
        fields: JSON.stringify([
            "name",
            "invoice",
            "customer",
            "customer_name",
            "company_name",
            "collection_date",
            "amount_collected",
            "mode_of_payment",
            "amount_pending",
            "amount_to_pay",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Invoice Collection&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch invoice collections");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createInvoiceCollection(data: Partial<InvoiceCollection>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Invoice Collection",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create invoice collection"));
    return json.message;
}

export async function updateInvoiceCollection(name: string, data: Partial<InvoiceCollection>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Invoice Collection",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update invoice collection"));
    return json.message;
}

export async function deleteInvoiceCollection(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Invoice Collection",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete invoice collection"));
    return json.message;
}

export async function getInvoiceCollection(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Invoice Collection&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch invoice collection details");
    }

    return (await res.json()).message;
}
