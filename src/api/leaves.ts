import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { fetchFrappeList } from './hr-management';

export interface LeaveApplication {
    name: string;
    employee: string;
    employee_name: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    total_days: number;
    half_day?: number | boolean;
    half_day_date?: string;
    permission_hours?: number;
    attachment?: string;
    reson: string;
    workflow_state?: string;
    status?: string;
    hr_query?: string;
    employee_reply?: string;
    hr_query_2?: string;
    employee_reply_2?: string;
    hr_query_3?: string;
    employee_reply_3?: string;
    hr_query_4?: string;
    employee_reply_4?: string;
    hr_query_5?: string;
    employee_reply_5?: string;
}

export interface WorkflowAction {
    action: string;
    next_state: string;
}

// Leave Application APIs
export const fetchLeaveApplications = (params: any) => {
    const filters: any[] = [];
    if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                if (key === 'start_date' || key === 'end_date') {
                    // Handled below for range
                } else {
                    filters.push(["Leave Application", key, "=", value]);
                }
            }
        });

        if (params.filters.start_date || params.filters.end_date) {
            const start = params.filters.start_date || '1970-01-01';
            const end = params.filters.end_date || '2099-12-31';
            filters.push(["Leave Application", "from_date", "between", [start, end]]);
        }
    }
    return fetchFrappeList("Leave Application", { ...params, filters, searchField: "employee_name" });
};

export async function createLeaveApplication(data: Partial<LeaveApplication>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Leave Application", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create leave application"));
    return json.message;
}

export async function updateLeaveApplication(name: string, data: Partial<LeaveApplication>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Leave Application", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update leave application"));
    return json.message;
}

export async function deleteLeaveApplication(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Leave Application", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete leave application"));
    return true;
}

// Leave Balance & Probation APIs
export async function checkLeaveBalance(params: {
    employee: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    half_day?: number;
    permission_hours?: number;
}) {
    const query = new URLSearchParams({
        employee: params.employee,
        leave_type: params.leave_type,
        from_date: params.from_date,
        to_date: params.to_date,
        half_day: String(params.half_day || 0),
        permission_hours: String(params.permission_hours || "")
    });

    const res = await frappeRequest(`/api/method/company.company.api.check_leave_balance?${query.toString()}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to check leave balance"));
    }
    return (await res.json()).message;
}

export async function getEmployeeProbationInfo(employee: string, date?: string) {
    const query = new URLSearchParams({ employee });
    if (date) query.append("date", date);

    const res = await frappeRequest(`/api/method/company.company.api.get_employee_probation_info?${query.toString()}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to fetch probation info"));
    }
    return (await res.json()).message;
}

export async function getLeaveWorkflowActions(currentState: string): Promise<WorkflowAction[]> {
    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_workflow_states?doctype=Leave Application&current_state=${encodeURIComponent(currentState)}`
    );

    if (!res.ok) {
        return [];
    }

    const data = (await res.json()).message || { actions: [] };
    return data.actions || [];
}

export async function applyLeaveWorkflowAction(name: string, action: string, comment?: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.apply_workflow_action", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Leave Application",
            name,
            action,
            comment
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to apply workflow action"));
    return json.message;
}
