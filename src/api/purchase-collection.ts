import { getAuthHeaders, frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface PurchaseCollection {
    name: string;
    purchase: string;
    vendor: string;
    vendor_name?: string;
    collection_date: string;
    amount_to_pay: number;
    amount_collected: number;
    amount_pending: number;
    mode_of_payment: string;
    remarks?: string;
    creation: string;
    isLatest?: boolean;
}

export async function fetchPurchaseCollections(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Purchase Collection", "name", "like", `%${params.search}%`]);
        or_filters.push(["Purchase Collection", "purchase", "like", `%${params.search}%`]);
        or_filters.push(["Purchase Collection", "vendor_name", "like", `%${params.search}%`]);
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
        doctype: "Purchase Collection",
        fields: JSON.stringify([
            "name",
            "purchase",
            "vendor",
            "vendor_name",
            "collection_date",
            "amount_collected",
            "mode_of_payment",
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
        fetch(`/api/method/frappe.client.get_count?doctype=Purchase Collection&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`, { credentials: "include" })
    ]);

    if (!res.ok) throw new Error("Failed to fetch purchase collections");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createPurchaseCollection(data: Partial<PurchaseCollection>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Purchase Collection",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create purchase collection"));
    return json.message;
}

export async function updatePurchaseCollection(name: string, data: Partial<PurchaseCollection>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Purchase Collection",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update purchase collection"));
    return json.message;
}

export async function deletePurchaseCollection(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Purchase Collection",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete purchase collection"));
    return json.message;
}

export async function getPurchaseCollection(name: string) {
    const res = await fetch(`/api/method/frappe.client.get?doctype=Purchase Collection&name=${encodeURIComponent(name)}`, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch purchase collection details");
    }

    return (await res.json()).message;
}
