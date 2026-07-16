import { frappeRequest } from 'src/utils/csrf';

export interface PermissionAccess {
    name: string;
    module_id: string;
    screen_id: string;
    add_permission: number;
    edit_permission: number;
    view_permission: number;
    delete_permission: number;
    export_permission: number;
}

export interface PermissionManagement {
    name: string;
    frontend_role_name: string;
    backend_master_role: string;
    status: 'Enabled' | 'Disabled';
    permissions: PermissionAccess[];
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
