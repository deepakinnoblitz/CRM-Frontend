import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { fetchFrappeList } from './hr-management';

export interface Employee {
    name: string;
    employee_id: string;
    employee_name: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    status: 'Active' | 'Inactive';
    date_of_joining?: string;
    personal_email?: string;
    dob?: string;
}

// Employee APIs
export const fetchEmployees = (params: any) => {
    const { search, ...restParams } = params;

    // If there's a search query, create or_filters to search across multiple fields
    const or_filters = search ? [
        ["Employee", "employee_name", "like", `%${search}%`],
        ["Employee", "employee_id", "like", `%${search}%`],
        ["Employee", "department", "like", `%${search}%`],
        ["Employee", "designation", "like", `%${search}%`],
        ["Employee", "status", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Employee", {
        ...restParams,
        search: undefined, // Remove search param since we're using or_filters
        or_filters
    });
};

export async function createEmployee(data: Partial<Employee>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Employee", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create employee"));
    return json.message;
}

export async function updateEmployee(name: string, data: Partial<Employee>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Employee", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update employee"));
    return json.message;
}

export async function deleteEmployee(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Employee", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete employee"));
    return true;
}
