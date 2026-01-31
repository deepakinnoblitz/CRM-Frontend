import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface InvoiceItem {
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

export interface Item {
    name: string;
    item_name: string;
    item_code: string;
    rate: number;
}

export interface Invoice {
    name: string;
    ref_no: string;
    client_name: string;
    customer_name?: string;
    billing_name?: string;
    billing_address?: string;
    phone_number?: string;
    invoice_date: string;
    due_date?: string;
    payment_terms?: string;
    po_no?: string;
    po_date?: string;
    total_qty?: number;
    total_amount?: number;
    overall_discount_type?: 'Flat' | 'Percentage';
    overall_discount?: number;
    grand_total?: number;
    received_amount?: number;
    balance_amount?: number;
    bank_account?: string;
    terms_and_conditions?: string;
    description?: string;
    attachments?: string;
    table_qecz?: InvoiceItem[]; // Invoice Items
}

export async function fetchInvoices(params: {
    filters?: {
        client_name?: string;
        ref_no?: string;
        invoice_date?: string | null;
        deal_id?: string;
    };
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.filters) {
        if (params.filters.client_name && params.filters.client_name !== 'all') {
            filters.push(["Invoice", "client_name", "=", params.filters.client_name]);
        }
        if (params.filters.ref_no) {
            filters.push(["Invoice", "ref_no", "=", params.filters.ref_no]);
        }
        if (params.filters.invoice_date) {
            filters.push(["Invoice", "invoice_date", "=", params.filters.invoice_date]);
        }
        if (params.filters.deal_id) {
            filters.push(["Invoice", "deal", "=", params.filters.deal_id]);
        }
    }

    if (params.search) {
        or_filters.push(["Invoice", "ref_no", "like", `%${params.search}%`]);
        or_filters.push(["Invoice", "customer_name", "like", `%${params.search}%`]);
        or_filters.push(["Invoice", "phone_number", "like", `%${params.search}%`]);
    }

    // Convert sort_by format (e.g., "invoice_date_desc") to Frappe order_by format
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
        doctype: "Invoice",
        fields: JSON.stringify([
            "name",
            "ref_no",
            "client_name",
            "customer_name",
            "invoice_date",
            "grand_total",
            "received_amount",
            "balance_amount",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Invoice&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch invoices");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createInvoice(data: Partial<Invoice>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Invoice",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create invoice"));
    return json.message;
}

export async function updateInvoice(name: string, data: Partial<Invoice>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Invoice",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update invoice"));
    return json.message;
}

export async function deleteInvoice(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Invoice",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete invoice"));
    return json.message;
}

export async function getInvoice(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Invoice&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch invoice details");
    }

    return (await res.json()).message;
}

export async function getInvoicePermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Invoice");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export function getInvoicePrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Invoice&name=${encodeURIComponent(name)}`;
}

export async function createItem(data: { item_name: string; item_code: string; rate: number }) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Item",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create item"));
    return json.message;
}

export async function createTaxType(data: { tax_name: string; tax_percentage: number; tax_type: string }) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Tax Types",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create tax type"));
    return json.message;
}

export async function fetchRelatedInvoices(dealId: string) {
    const filters = [["Invoice", "deal", "=", dealId]];
    const fields = ["name", "ref_no", "invoice_date", "grand_total", "received_amount", "balance_amount"];

    const query = new URLSearchParams({
        doctype: "Invoice",
        fields: JSON.stringify(fields),
        filters: JSON.stringify(filters),
        order_by: "creation desc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);

    if (!res.ok) {
        throw new Error("Failed to fetch related invoices");
    }

    const data = await res.json();
    return data.message || [];
}
