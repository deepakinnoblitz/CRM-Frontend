import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface PermissionAccess {
    name?: string;
    module_id: string;
    screen_id: string;
    add_permission: number;
    edit_permission: number;
    view_permission: number;
    delete_permission: number;
    export_permission: number;
    import_permission: number;
}

export interface PermissionManagement {
    name: string;
    frontend_role_name: string;
    backend_master_role: string;
    status: 'Enabled' | 'Disabled';
    permissions: PermissionAccess[];
}

export async function getRolePermissionList(
    page: number = 1,
    limit: number = 10,
    query: string = '',
    status: string = 'all'
): Promise<{ data: PermissionManagement[]; total: number }> {
    const filters: any[] = [];
    if (query) {
        filters.push(["Permission Management", "frontend_role_name", "like", `%${query}%`]);
    }
    if (status && status !== 'all') {
        filters.push(["Permission Management", "status", "=", status]);
    }

    const queryParams = new URLSearchParams({
        doctype: "Permission Management",
        fields: JSON.stringify(["name", "frontend_role_name", "backend_master_role", "status", "modified"]),
        filters: JSON.stringify(filters),
        limit_start: String((page - 1) * limit),
        limit_page_length: String(limit),
        order_by: "modified desc"
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${queryParams.toString()}`),
        frappeRequest(`/api/method/company.company.frontend_api.get_permitted_count?doctype=Permission Management&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch role permissions");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function getRolePermission(name: string): Promise<PermissionManagement> {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Permission Management&name=${encodeURIComponent(name)}&_ts=${Date.now()}`);
    if (!res.ok) throw new Error("Failed to fetch role permission details");
    return (await res.json()).message;
}

export async function createRolePermission(data: Partial<PermissionManagement>): Promise<PermissionManagement> {
    const payload = {
        doctype: 'Permission Management',
        ...data
    };
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ doc: payload })
    });
    if (!res.ok) throw new Error(handleFrappeError(res, "Failed to create role permission"));
    return (await res.json()).message;
}

export async function updateRolePermission(name: string, data: Partial<PermissionManagement>): Promise<PermissionManagement> {
    const pmDoc = await getRolePermission(name);

    if (data.frontend_role_name !== undefined) pmDoc.frontend_role_name = data.frontend_role_name;
    if (data.backend_master_role !== undefined) pmDoc.backend_master_role = data.backend_master_role;
    if (data.status !== undefined) pmDoc.status = data.status;
    if (data.permissions !== undefined) pmDoc.permissions = data.permissions;

    // Strip metadata/private fields starting with _ or __ to prevent database escape issues
    Object.keys(pmDoc).forEach((key) => {
        if (key.startsWith('_') || key.startsWith('__')) {
            delete (pmDoc as any)[key];
        }
    });

    if (pmDoc.permissions) {
        pmDoc.permissions.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (key.startsWith('_') || key.startsWith('__')) {
                    delete (row as any)[key];
                }
            });
        });
    }

    const res = await frappeRequest('/api/method/frappe.client.save', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ doc: pmDoc })
    });
    if (!res.ok) throw new Error(handleFrappeError(res, "Failed to update role permission"));
    return (await res.json()).message;
}

export async function deleteRolePermission(name: string) {
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Permission Management',
            name
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete role permission"));
    return json.message;
}

export async function fetchRolePermissions(roles: string[]): Promise<PermissionManagement[]> {
    if (!roles || roles.length === 0) {
        return [];
    }

    const filters = JSON.stringify([
        ["Permission Management", "backend_master_role", "in", roles],
        ["Permission Management", "status", "=", "Enabled"]
    ]);
    const fields = JSON.stringify(["name", "frontend_role_name", "backend_master_role"]);

    const res = await frappeRequest(`/api/method/frappe.client.get_list?doctype=Permission Management&filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent(fields)}&limit_page_length=99`);
    if (!res.ok) {
        throw new Error("Failed to fetch permission list");
    }

    const listData = await res.json();
    const list: { name: string; frontend_role_name: string; backend_master_role: string }[] = listData.message || [];

    const details = await Promise.all(
        list.map(async (item) => {
            const detailRes = await frappeRequest(`/api/method/frappe.client.get?doctype=Permission Management&name=${encodeURIComponent(item.name)}`);
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                return detailData.message as PermissionManagement;
            }
            return null;
        })
    );

    return details.filter((d): d is PermissionManagement => d !== null);
}

export async function getPopulatedPermissions(backendMasterRole: string): Promise<PermissionAccess[]> {
    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_populated_permissions?backend_master_role=${encodeURIComponent(backendMasterRole)}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to populate default permissions"));
    }
    const json = await res.json();
    return json.message || [];
}
