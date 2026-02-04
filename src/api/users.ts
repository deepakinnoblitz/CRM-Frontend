import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface User {
    name: string;
    email: string;
    full_name: string;
    username?: string;
    enabled: 0 | 1;
    user_type: string;
    role_profile_name?: string;
    last_login?: string;
    user_image?: string;
}

export async function fetchUsers(params: {
    page: number;
    page_size: number;
    search?: string;
    filterValues?: Record<string, any>;
    sort_by?: string;
    filterStatus?: string;
}) {
    const filters: any[] = [["User", "user_type", "=", "System User"]];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["User", "full_name", "like", `%${params.search}%`]);
        or_filters.push(["User", "email", "like", `%${params.search}%`]);
        or_filters.push(["User", "name", "like", `%${params.search}%`]);
    }

    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filters.push(["User", key, "=", value]);
            }
        });
    }

    // Add status filter
    if (params.filterStatus && params.filterStatus !== 'all') {
        filters.push(["User", "enabled", "=", parseInt(params.filterStatus, 10)]);
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
        doctype: "User",
        fields: JSON.stringify([
            "name",
            "full_name",
            "email",
            "username",
            "enabled",
            "user_type",
            "role_profile_name",
            "last_login",
            "user_image",
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
        frappeRequest(`/api/method/frappe.client.get_count?doctype=User&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch users");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createUser(data: Partial<User>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "User",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create user"));
    return json.message;
}

export async function updateUser(name: string, data: Partial<User>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "User",
            name,
            fieldname: data
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update user"));
    return json.message;
}

export async function deleteUser(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "User",
            name
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete user"));
    return json.message;
}

export async function getUser(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=User&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch user details");
    return (await res.json()).message;
}
