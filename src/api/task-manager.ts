import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { handleResponse } from './utils';

export interface TaskAssignee {
    name: string;
    employee: string;
    employee_name: string;
    user?: string;
}

export interface TaskHistory {
    name: string;
    event: 'Closed' | 'Reopened' | 'Accepted' | 'Submitted for Review';
    done_by: string;
    done_on: string;
    hours_spent?: string;
    remarks?: string;
    closing_attachment?: string;
}

export interface TaskManager {
    name: string;
    title: string;
    project?: string;
    department?: string;
    fetch_from_department?: number;
    due_date?: string;
    due_time?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Completed' | 'Reopened';
    tag_member?: string;
    attachment_required?: number;
    recurring_task?: number;
    recurring_frequency?: string;
    description?: string;
    creation: string;
    modified: string;
    closed_by?: string;
    closed_on?: string;
    assignees?: TaskAssignee[];
    history?: TaskHistory[];
}

export async function fetchTaskManagerList(filters: any[] = []): Promise<TaskManager[]> {
    const query = new URLSearchParams({
        doctype: "Task Manager",
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_page_length: "1000",
        order_by: "creation desc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    const data = await handleResponse(res);
    const tasks: TaskManager[] = data.message || [];

    if (tasks.length > 0) {
        try {
            const taskNames = tasks.map(t => t.name);
            const assigneeRes = await frappeRequest(`/api/method/company.company.doctype.task_manager.task_manager.get_assignees?task_names=${JSON.stringify(taskNames)}`);
            const assigneeData = await handleResponse(assigneeRes);
            const allAssignees = assigneeData.message || [];

            // Group assignees by parent task
            const assigneesByTask: Record<string, TaskAssignee[]> = {};
            allAssignees.forEach((a: any) => {
                if (!assigneesByTask[a.parent]) {
                    assigneesByTask[a.parent] = [];
                }
                assigneesByTask[a.parent].push({
                    name: a.name,
                    employee: a.employee,
                    employee_name: a.employee_name,
                    user: a.user
                });
            });

            // Attach assignees to tasks
            tasks.forEach(task => {
                task.assignees = assigneesByTask[task.name] || [];
            });
        } catch (error) {
            console.error("Failed to fetch assignees for task list:", error);
        }
    }

    return tasks;
}

export async function getEmployeesFromDepartment(department: string): Promise<TaskAssignee[]> {
    const res = await frappeRequest(`/api/method/company.company.doctype.task_manager.task_manager.get_employees_from_department?department=${encodeURIComponent(department)}`);
    const data = await handleResponse(res);
    return data.message || [];
}

export async function getTaskManager(name: string): Promise<TaskManager> {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Task Manager&name=${name}`);
    const data = await handleResponse(res);
    return data.message;
}

export async function createTaskManager(data: Partial<TaskManager>): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/frappe.client.insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Task Manager",
                ...data
            }
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to create task"));
    }
}

export async function updateTaskStatus(name: string, status: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/frappe.client.set_value`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "Task Manager",
            name,
            fieldname: "status",
            value: status
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to update task status"));
    }
}

export async function updateTaskManager(name: string, data: Partial<TaskManager>): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/frappe.client.set_value`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "Task Manager",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to update task"));
    }
}

export async function closeTaskManager(name: string, hours: string, remarks: string, attachment?: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/company.company.doctype.task_manager.task_manager.close_task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            task_name: name,
            hours_spent: hours,
            remarks: remarks,
            attachment: attachment
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to close task"));
    }
}

export async function reopenTaskManager(name: string, remarks: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/company.company.doctype.task_manager.task_manager.reopen_task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ task_name: name, remarks })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to reopen task"));
    }
}


export async function acceptTaskManager(name: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/company.company.doctype.task_manager.task_manager.accept_task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ task_name: name })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to accept task"));
    }
}

export async function deleteTaskManager(name: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(`/api/method/frappe.client.delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: "Task Manager",
            name
        })
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to delete task"));
    }
}

export async function fetchProjects(search?: string): Promise<{ name: string; project: string }[]> {
    const filters: any[] = [];
    if (search) {
        filters.push(['Project', 'project', 'like', `%${search}%`]);
    }

    const query = new URLSearchParams({
        doctype: "Project",
        fields: JSON.stringify(["name", "project"]),
        filters: JSON.stringify(filters),
        limit_page_length: "1000",
        order_by: "project asc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    const data = await handleResponse(res);
    return data.message || [];
}

export async function createProject(projectName: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doc: { doctype: 'Project', project: projectName } }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to create project'));
    }

    return (await res.json()).message;
}

export async function fetchDepartments(search?: string): Promise<{ name: string; department_name: string }[]> {
    const filters: any[] = [];
    if (search) {
        filters.push(['Department', 'department_name', 'like', `%${search}%`]);
    }

    const query = new URLSearchParams({
        doctype: "Department",
        fields: JSON.stringify(["name", "department_name"]),
        filters: JSON.stringify(filters),
        limit_page_length: "1000",
        order_by: "department_name asc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    const data = await handleResponse(res);
    return data.message || [];
}

export async function createDepartment(departmentName: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doc: { doctype: 'Department', department_name: departmentName } }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to create department'));
    }

    return (await res.json()).message;
}

export async function fetchEmployees(): Promise<{ name: string; employee_name: string }[]> {
    const query = new URLSearchParams({
        doctype: "Employee",
        fields: JSON.stringify(["name", "employee_name"]),
        filters: JSON.stringify([["Employee", "status", "=", "Active"]]),
        limit_page_length: "1000",
        order_by: "employee_name asc"
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    const data = await handleResponse(res);
    return data.message || [];
}

export async function getTaskManagerPermissions(): Promise<{ read: boolean; write: boolean; create: boolean; delete: boolean }> {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Task Manager");

    if (!res.ok) {
        return { read: false, write: false, create: false, delete: false };
    }

    const data = await res.json();
    return data.message || { read: false, write: false, create: false, delete: false };
}
