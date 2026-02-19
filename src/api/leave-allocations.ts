import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { fetchFrappeList } from './hr-management';

export interface WorkflowAction {
    action: string;
    next_state: string;
}

export interface LeaveAllocation {
    name: string;
    employee: string;
    employee_name: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    total_leaves_allocated: number;
    total_leaves_taken: number;
    status: string;
    workflow_state?: string;
}

// Leave Allocation APIs
export const fetchLeaveAllocations = (params: any) => {
    const filters: any[] = [];
    if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                if (Array.isArray(value)) {
                    filters.push(["Leave Allocation", key, value[0], value[1]]);
                } else {
                    filters.push(["Leave Allocation", key, "=", value]);
                }
            }
        });
    }
    return fetchFrappeList("Leave Allocation", { ...params, filters, searchField: "employee_name" });
};

export async function createLeaveAllocation(data: Partial<LeaveAllocation>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Leave Allocation", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create leave allocation"));
    return json.message;
}

export async function updateLeaveAllocation(name: string, data: Partial<LeaveAllocation>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Leave Allocation", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update leave allocation"));
    return json.message;
}

export async function deleteLeaveAllocation(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Leave Allocation", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete leave allocation"));
    return true;
}

export async function applyLeaveAllocationWorkflowAction(name: string, action: string, comment?: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.apply_workflow_action", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Leave Allocation",
            name,
            action,
            comment
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to apply workflow action"));
    return json.message;
}

export async function getLeaveAllocationWorkflowActions(currentState: string): Promise<WorkflowAction[]> {
    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_workflow_states?doctype=Leave Allocation&current_state=${encodeURIComponent(currentState)}`
    );

    if (!res.ok) {
        return [];
    }

    const data = (await res.json()).message || { actions: [] };
    return data.actions || [];
}

export interface AllocationPreviewItem {
    leave_type: string;
    count: number;
    exists: boolean;
}

export interface EmployeeAllocationPreview {
    employee: string;
    employee_id: string;
    employee_name: string;
    date_of_joining: string;
    in_probation: boolean;
    allocations: AllocationPreviewItem[];
}

export async function getLeaveAllocationPreview(year: number, month: number): Promise<EmployeeAllocationPreview[]> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.api.get_leave_allocation_preview", {
        method: "POST",
        headers,
        body: JSON.stringify({ year, month })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to get allocation preview"));
    return json.message || [];
}

export async function autoAllocateMonthlyLeaves(year: number, month: number): Promise<string> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.api.auto_allocate_monthly_leaves", {
        method: "POST",
        headers,
        body: JSON.stringify({ year, month })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to auto-allocate leaves"));
    return json.message || "Allocation completed";
}
