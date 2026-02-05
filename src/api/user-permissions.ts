import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface UserPermission {
    name: string;
    user: string;
    allow: string;
    for_value: string;
    applicable_for?: string;
    apply_to_all_doctypes?: number;
    is_default?: number;
    creation?: string;
    modified?: string;
}

export async function fetchUserPermissions(params: {
    page: number;
    page_size: number;
    search?: string;
    filters?: { user?: string; allow?: string; for_value?: string };
    order_by?: string;
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["User Permission", "name", "like", `%${params.search}%`]);
        or_filters.push(["User Permission", "user", "like", `%${params.search}%`]);
        or_filters.push(["User Permission", "allow", "like", `%${params.search}%`]);
        or_filters.push(["User Permission", "for_value", "like", `%${params.search}%`]);
    }

    // Add filters
    if (params.filters) {
        if (params.filters.user) {
            filters.push(["User Permission", "user", "=", params.filters.user]);
        }
        if (params.filters.allow) {
            filters.push(["User Permission", "allow", "=", params.filters.allow]);
        }
        if (params.filters.for_value) {
            filters.push(["User Permission", "for_value", "like", `%${params.filters.for_value}%`]);
        }
    }

    const query = new URLSearchParams({
        doctype: "User Permission",
        fields: JSON.stringify([
            "name",
            "user",
            "allow",
            "for_value",
            "applicable_for",
            "apply_to_all_doctypes",
            "is_default",
            "creation",
            "modified"
        ]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: params.order_by || "creation desc"
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=User Permission&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch user permissions");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createUserPermission(data: {
    user: string;
    allow: string;
    for_value: string;
    applicable_for?: string;
    apply_to_all_doctypes?: number;
    is_default?: number;
}) {
    const payload: any = {
        doctype: 'User Permission',
        user: data.user,
        allow: data.allow,
        for_value: data.for_value,
        apply_to_all_doctypes: data.apply_to_all_doctypes ?? 0,
        is_default: data.is_default ?? 0
    };

    if (data.applicable_for) {
        payload.applicable_for = data.applicable_for;
    }

    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ doc: payload })
    });

    if (!res.ok) throw new Error(handleFrappeError(res, "Failed to create user permission"));
    return await res.json();
}

export async function deleteUserPermission(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "User Permission",
            name
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete user permission"));
    return json.message;
}

export async function getDocTypes() {
    const res = await frappeRequest('/api/method/frappe.client.get_list?doctype=DocType&fields=["name"]&filters=[["DocType","issingle","=",0],["DocType","istable","=",0]]&limit_page_length=999&order_by=name asc');
    if (!res.ok) throw new Error("Failed to fetch doctypes");
    return (await res.json()).message;
}

export async function getUsers() {
    const res = await frappeRequest('/api/method/frappe.client.get_list?doctype=User&fields=["name","email","full_name"]&filters=[["User","enabled","=",1]]&limit_page_length=999&order_by=full_name asc');
    if (!res.ok) throw new Error("Failed to fetch users");
    return (await res.json()).message;
}

export async function getForValueOptions(doctype: string) {
    const fields = ["name"];
    if (doctype === 'Employee') {
        fields.push("employee_name");
    }
    const res = await frappeRequest(`/api/method/frappe.client.get_list?doctype=${doctype}&fields=${JSON.stringify(fields)}&limit_page_length=999&order_by=name asc`);
    if (!res.ok) throw new Error(`Failed to fetch ${doctype} records`);
    return (await res.json()).message;
}
