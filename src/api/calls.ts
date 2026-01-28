import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { handleResponse } from './utils';

export interface Call {
    name: string;
    title: string;
    call_for: string;
    lead_name?: string;
    contact_name?: string;
    account_name?: string;
    call_start_time: string;
    call_end_time?: string;
    outgoing_call_status: string;
    call_purpose?: string;
    call_agenda?: string;
    color?: string;
}

export async function fetchCalls(start?: string, end?: string): Promise<Call[]> {
    const filters: any[] = [];
    if (start && end) {
        filters.push(["Calls", "call_start_time", "between", [start, end]]);
    }

    const query = new URLSearchParams({
        doctype: "Calls",
        fields: JSON.stringify([
            "name",
            "title",
            "call_for",
            "lead_name",
            "contact_name",
            "account_name",
            "call_start_time",
            "call_end_time",
            "outgoing_call_status",
            "call_purpose",
            "call_agenda",
            "color"
        ]),
        filters: JSON.stringify(filters),
        limit_page_length: "1000",
        order_by: "call_start_time asc"
    });

    const res = await frappeRequest(
        `/api/method/frappe.client.get_list?${query.toString()}`
    );

    const data = await handleResponse(res);
    return data.message;
}

export async function createCall(data: Partial<Call>): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Calls",
                ...data
            }
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to create call"));
    }
}

export async function updateCall(name: string, data: Partial<Call>): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.set_value`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "Calls",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to update call"));
    }
}

export async function deleteCall(name: string): Promise<void> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest(`/api/method/frappe.client.delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "Calls",
            name
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to delete call"));
    }
}

export async function getCallPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Calls");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    const data = await res.json();
    return data.message || { read: false, write: false, delete: false };
}

export async function getCall(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Calls&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch call details");
    }

    return (await res.json()).message;
}
