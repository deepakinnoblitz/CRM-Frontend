import { getAuthHeaders, frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Account {
    name: string;
    account_name: string;
    phone_number?: string;
    website?: string;
    account_owner?: string;
    gstin?: string;
    country?: string;
    state?: string;
    city?: string;
}

export async function fetchAccounts(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filterValues?: Record<string, any>;
}) {
    const filters: any[] = [];

    // Add dynamic filters from filterValues
    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filters.push(["Accounts", key, "=", value]);
            }
        });
    }

    const or_filters: any[] = params.search ? [
        ["Accounts", "account_name", "like", `%${params.search}%`],
        ["Accounts", "account_owner", "like", `%${params.search}%`],
        ["Accounts", "phone_number", "like", `%${params.search}%`],
        ["Accounts", "website", "like", `%${params.search}%`]
    ] : [];

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
        doctype: "Accounts",
        fields: JSON.stringify([
            "name",
            "account_name",
            "phone_number",
            "website",
            "account_owner",
            "gstin",
            "country",
            "state",
            "city",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Accounts&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch accounts");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createAccount(data: Partial<Account>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Accounts",
                ...data
            }
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create account"));
    return json.message;
}

export async function updateAccount(name: string, data: Partial<Account>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Accounts",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update account"));
    return json.message;
}

export async function deleteAccount(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Accounts",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete account"));
    return json.message;
}

export async function getAccountPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Accounts");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}


export async function getAccount(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Accounts&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch account details");
    }

    return (await res.json()).message;
}
