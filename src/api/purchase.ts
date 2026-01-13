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
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

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
        fetch(`/api/method/frappe.client.get_list?${query.toString()}`, { credentials: "include" }),
        fetch(`/api/method/frappe.client.get_count?doctype=Purchase&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`, { credentials: "include" })
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
    const res = await fetch("/api/method/frappe.client.insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    const res = await fetch("/api/method/frappe.client.set_value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    const res = await fetch("/api/method/frappe.client.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    const res = await fetch(`/api/method/frappe.client.get?doctype=Purchase&name=${name}`, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch purchase details");
    }

    return (await res.json()).message;
}

export async function getDoctypeList(doctype: string, fields?: string[]) {
    const params: any = { doctype };
    if (fields) {
        params.fields = JSON.stringify(fields);
    }
    const query = new URLSearchParams(params);

    const res = await fetch(
        `/api/method/company.company.frontend_api.get_doctype_list?${query.toString()}`,
        { credentials: 'include' }
    );

    if (!res.ok) {
        return [];
    }
    return (await res.json()).message || [];
}

export async function getPurchasePermissions() {
    const res = await fetch("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Purchase", {
        credentials: "include"
    });

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export function getPurchasePrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Purchase&name=${encodeURIComponent(name)}`;
}
