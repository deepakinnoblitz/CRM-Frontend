import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { handleResponse } from './utils';

export interface ToDo {
    name: string;
    description: string;
    status: 'Open' | 'Closed' | 'Cancelled';
    priority: 'High' | 'Medium' | 'Low';
    date: string;
    allocated_to?: string;
    reference_type?: string;
    reference_name?: string;
    color?: string;
}

export async function fetchToDos(start?: string, end?: string): Promise<ToDo[]> {
    const filters: any[] = [];
    if (start && end) {
        filters.push(["ToDo", "date", "between", [start, end]]);
    }

    const query = new URLSearchParams({
        doctype: "ToDo",
        fields: JSON.stringify([
            "name",
            "description",
            "status",
            "priority",
            "date",
            "allocated_to",
            "reference_type",
            "reference_name",
            "color"
        ]),
        filters: JSON.stringify(filters),
        limit_page_length: "1000",
        order_by: "date asc"
    });

    const res = await frappeRequest(
        `/api/method/frappe.client.get_list?${query.toString()}`
    );

    const data = await handleResponse(res);
    return data.message;
}

export async function createToDo(data: Partial<ToDo>): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "ToDo",
                ...data
            }
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to create todo"));
    }
}

export async function updateToDo(name: string, data: Partial<ToDo>): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.set_value`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "ToDo",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to update todo"));
    }
}

export async function deleteToDo(name: string): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "ToDo",
            name
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to delete todo"));
    }
}

export async function getToDoPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=ToDo");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    const data = await res.json();
    return data.message || { read: false, write: false, delete: false };
}

export async function getToDo(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=ToDo&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch ToDo details");
    }

    return (await res.json()).message;
}
