export interface Deal {
    name: string;
    deal_title: string;
    account: string;
    contact?: string;
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
    const filters: any[] = [];

    // Add dynamic filters from filterValues
    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filters.push(["Deal", key, "=", value]);
            }
        });
    }

    // Backward compatibility: if stage is provided directly (not in filterValues)
    if (params.stage && params.stage !== 'all' && !params.filterValues?.stage) {
        filters.push(["Deal", "stage", "=", params.stage]);
    }

    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Deal", "deal_title", "like", `%${params.search}%`]);
        or_filters.push(["Deal", "account", "like", `%${params.search}%`]);
    }

    // Convert sort_by format (e.g., "creation_desc") to Frappe order_by format
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
        doctype: "Deal",
        fields: JSON.stringify([
            "name",
            "deal_title",
            "account",
            "contact",
            "value",
            "expected_close_date",
            "stage",
            "probability",
            "type",
            "source_lead",
            "next_step",
            "notes",
            "deal_owner",
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
        fetch(`/api/method/frappe.client.get_count?doctype=Deal&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`, { credentials: "include" })
    ]);

    if (!res.ok) throw new Error("Failed to fetch deals");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
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
    const res = await fetch(`/api/method/frappe.client.get_value?doctype=Deal&name=${name}&fieldname=${JSON.stringify([
        "name",
        "deal_title",
        "account",
        "contact",
        "value",
        "expected_close_date",
        "stage",
        "probability",
        "type",
        "source_lead",
        "next_step",
        "notes",
        "deal_owner",
        "owner",
        "creation",
    ])}`, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch deal details");
    }

    return (await res.json()).message;
}
