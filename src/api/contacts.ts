import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Contact {
    name: string;
    first_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    designation?: string;
    source_lead?: string;
    address?: string;
    notes?: string;
    country?: string;
    state?: string;
    city?: string;
    customer_type?: string;
}

export async function fetchContacts(params: {
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
                filters.push(["Contacts", key, "=", value]);
            }
        });
    }


    const or_filters: any[] = params.search ? [
        ["Contacts", "first_name", "like", `%${params.search}%`],
        ["Contacts", "email", "like", `%${params.search}%`],
        ["Contacts", "company_name", "like", `%${params.search}%`],
        ["Contacts", "phone", "like", `%${params.search}%`]
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
        doctype: "Contacts",
        fields: JSON.stringify([
            "name",
            "first_name",
            "company_name",
            "email",
            "phone",
            "designation",
            "source_lead",
            "address",
            "notes",
            "country",
            "state",
            "city",
            "customer_type",
            "owner",
            "creation",
            "modified"
        ]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Contacts&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch contacts");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createContact(data: Partial<Contact>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Contacts",
                ...data
            }
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create contact"));
    return json.message;
}

export async function updateContact(name: string, data: Partial<Contact>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Contacts",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update contact"));
    return json.message;
}

export async function deleteContact(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Contacts",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete contact"));
    return json.message;
}

export async function getContactPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Contacts");

    // We might need to genericize get_lead_permissions to get_doc_permissions in the backend
    // Or just use get_lead_permissions if it's already generic enough or create a new one.
    // For now assuming get_lead_permissions was specifically for Lead.

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getContact(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Contacts&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch contact details");
    }

    return (await res.json()).message;
}
