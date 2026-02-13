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
    has_permission?: boolean;
}

export async function fetchUsers(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        user_type?: string;
        enabled?: string;
        permission?: string;
        roles?: string[];
    };
}) {
    const filters: any[] = [["User", "user_type", "=", "System User"]];
    const or_filters: any[] = [];

    // Fetch users with permissions first to support filtering
    let usersWithPermissions: string[] = [];
    try {
        const permRes = await frappeRequest('/api/method/frappe.client.get_list?doctype=User Permission&fields=["user"]&limit_page_length=9999');
        if (permRes.ok) {
            const permData = await permRes.json();
            usersWithPermissions = [...new Set((permData.message || []).map((p: any) => p.user))] as string[];
        }
    } catch (error) {
        console.error('Failed to fetch users with permissions:', error);
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase();

        // Basic fields
        or_filters.push(["User", "full_name", "like", `%${params.search}%`]);
        or_filters.push(["User", "email", "like", `%${params.search}%`]);
        or_filters.push(["User", "name", "like", `%${params.search}%`]);
        or_filters.push(["User", "user_type", "like", `%${params.search}%`]);

        // Status labels
        if ("enabled".includes(searchLower)) {
            or_filters.push(["User", "enabled", "=", 1]);
        }
        if ("disabled".includes(searchLower)) {
            or_filters.push(["User", "enabled", "=", 0]);
        }

        // Permission labels
        if ("added".includes(searchLower)) {
            or_filters.push(["User", "name", "in", usersWithPermissions]);
        }
        if ("not added".includes(searchLower)) {
            or_filters.push(["User", "name", "not in", usersWithPermissions]);
        }
    }

    // Add filters
    if (params.filters) {
        if (params.filters.user_type && params.filters.user_type !== 'all') {
            filters.push(["User", "user_type", "=", params.filters.user_type]);
        }
        if (params.filters.enabled && params.filters.enabled !== 'all') {
            filters.push(["User", "enabled", "=", parseInt(params.filters.enabled, 10)]);
        }
        if (params.filters.permission && params.filters.permission !== 'all') {
            if (params.filters.permission === 'added') {
                filters.push(["User", "name", "in", usersWithPermissions]);
            } else if (params.filters.permission === 'not_added') {
                filters.push(["User", "name", "not in", usersWithPermissions]);
            }
        }
        if (params.filters.roles && params.filters.roles.length > 0) {
            // Filter by one of the selected roles
            filters.push(["Has Role", "role", "in", params.filters.roles]);
        }
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
        group_by: "name",
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=User&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch users");

    const data = await res.json();
    const countData = await countRes.json();

    const users = data.message || [];

    const dataWithPermissions = users.map((user: any) => ({
        ...user,
        has_permission: usersWithPermissions.includes(user.name) || usersWithPermissions.includes(user.email)
    }));

    return {
        data: dataWithPermissions,
        total: countData.message || 0
    };
}

export async function createUser(data: {
    email: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    full_name?: string;
    username?: string;
    enabled?: 0 | 1;
    user_type?: string;
    role_profile_name?: string;
    roles?: string[];
    block_modules?: string[];
    send_welcome_email?: 0 | 1;
    new_password?: string;
}) {
    const payload: any = {
        doctype: 'User',
        email: data.email,
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        full_name: data.full_name || '',
        username: data.username || '',
        enabled: data.enabled ?? 1,
        user_type: data.user_type || 'System User',
        send_welcome_email: data.send_welcome_email ?? 1,
        new_password: data.new_password || ''
    };

    if (data.role_profile_name) {
        payload.role_profile_name = data.role_profile_name;
    }

    if (data.roles && data.roles.length > 0) {
        payload.roles = data.roles.map((role: string) => ({ role }));
    }

    if (data.block_modules && data.block_modules.length > 0) {
        payload.block_modules = data.block_modules.map((module: string) => ({ module }));
    }

    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ doc: payload })
    });

    if (!res.ok) throw new Error(handleFrappeError(res, "Failed to create user"));
    return await res.json();
}

export async function updateUser(name: string, data: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    full_name?: string;
    username?: string;
    enabled?: 0 | 1;
    user_type?: string;
    role_profile_name?: string;
    roles?: string[];
    block_modules?: string[];
}) {
    const payload: any = {};

    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.middle_name !== undefined) payload.middle_name = data.middle_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.full_name !== undefined) payload.full_name = data.full_name;
    if (data.username !== undefined) payload.username = data.username;
    if (data.enabled !== undefined) payload.enabled = data.enabled;
    if (data.user_type !== undefined) payload.user_type = data.user_type;
    if (data.role_profile_name !== undefined) payload.role_profile_name = data.role_profile_name;

    if (data.roles !== undefined) {
        payload.roles = data.roles.map((role: string) => ({ role }));
    }

    if (data.block_modules !== undefined) {
        payload.block_modules = data.block_modules.map((module: string) => ({ module }));
    }

    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'User',
            name,
            fieldname: payload
        })
    });

    if (!res.ok) throw new Error(handleFrappeError(res, "Failed to update user"));
    return await res.json();
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

export async function getRoleProfiles() {
    const res = await frappeRequest('/api/method/frappe.client.get_list?doctype=Role Profile&fields=["name"]&limit_page_length=999');
    if (!res.ok) throw new Error("Failed to fetch role profiles");
    return (await res.json()).message;
}

export async function getRoles() {
    const res = await frappeRequest('/api/method/frappe.client.get_list?doctype=Role&fields=["name"]&limit_page_length=999');
    if (!res.ok) throw new Error("Failed to fetch roles");
    return (await res.json()).message;
}

export async function getModules() {
    const res = await frappeRequest('/api/method/frappe.client.get_list?doctype=Module Def&fields=["name"]&limit_page_length=999');
    if (!res.ok) throw new Error("Failed to fetch modules");
    return (await res.json()).message;
}

export async function changeUserPassword(userId: string, newPassword: string) {
    const res = await frappeRequest('/api/method/company.company.frontend_api.admin_change_user_password', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            user_email: userId,
            new_password: newPassword
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.exception || errorData.message || "Failed to change password");
    }

    const result = await res.json();
    if (result.message?.status === 'success') {
        return result.message;
    }

    throw new Error(result.message?.message || "Failed to change password");
}
