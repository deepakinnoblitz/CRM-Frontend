export interface Deal {
    name: string;
    deal_title: string;
    account: string;
    contact?: string;
    contact_name?: string;
    value: number;
    expected_close_date?: string;
    stage: 'Qualification' | 'Needs Analysis' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    probability?: number;
    type?: 'Existing Business' | 'New Business';
    source_lead?: string;
    next_step?: string;
    notes?: string;
    deal_owner?: string;
}

export async function fetchDeals(params: {
    page: number;
    page_size: number;
    search?: string;
    stage?: string; // Keep for backward compatibility
    sort_by?: string;
    filterValues?: Record<string, any>;
}) {
    const res = await fetch("/api/method/company.company.doctype.deal.deal.get_deals_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            start: (params.page - 1) * params.page_size,
            page_length: params.page_size,
            search: params.search,
            stage: params.stage,
            sort_by: params.sort_by,
            filterValues: params.filterValues
        })
    });

    if (!res.ok) throw new Error("Failed to fetch deals");

    const response = await res.json();

    return {
        data: response.message.data || [],
        total: response.message.total || 0
    };
}

export async function createDeal(data: Partial<Deal>) {
    const res = await fetch("/api/method/frappe.client.insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            doc: {
                doctype: "Deal",
                ...data
            }
        })
    });

    return (await res.json()).message;
}

export async function updateDeal(name: string, data: Partial<Deal>) {
    const res = await fetch("/api/method/frappe.client.set_value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            doctype: "Deal",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.exception || error.message || "Failed to update deal");
    }

    return (await res.json()).message;
}

export async function deleteDeal(name: string) {
    const res = await fetch("/api/method/frappe.client.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            doctype: "Deal",
            name
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.exception || error.message || "Failed to delete deal");
    }

    return (await res.json()).message;
}

export async function getDealPermissions() {
    const res = await fetch("/api/method/company.company.frontend_api.get_deal_permissions", {
        credentials: "include"
    });

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}
export async function getDeal(name: string) {
    const res = await fetch("/api/method/company.company.doctype.deal.deal.get_deal_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name
        })
    });

    if (!res.ok) {
        throw new Error("Failed to fetch deal details");
    }

    return (await res.json()).message;
}
