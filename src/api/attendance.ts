import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { fetchFrappeList } from './hr-management';

export interface Attendance {
    name: string;
    employee: string;
    employee_name: string;
    attendance_date: string;
    status: 'Present' | 'Absent' | 'On Leave' | 'Holiday' | 'Half Day' | 'Missing';
    in_time?: string;
    out_time?: string;
    leave_type?: string;
}

// Attendance APIs
export const fetchAttendance = (params: any) => fetchFrappeList("Attendance", { ...params, searchField: "employee_name" });

export async function createAttendance(data: Partial<Attendance>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Attendance", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create attendance record"));
    return json.message;
}

export async function updateAttendance(name: string, data: Partial<Attendance>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Attendance", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update attendance record"));
    return json.message;
}

export async function deleteAttendance(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Attendance", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete attendance record"));
    return true;
}

export async function getAttendance(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Attendance&name=${name}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch Attendance details`));
    }

    const data = await res.json();
    return data.message;
}
