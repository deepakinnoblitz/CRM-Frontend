import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Lead {
    name: string;
    lead_name: string;
    company_name?: string;
    gstin?: string;
    phone_number?: string;
    email?: string;
    service?: string;
    leads_type: 'Incoming' | 'Outgoing';
    leads_from: string;
    remarks?: string;
    country?: string;
    state?: string;
    city?: string;
    status?: string;
    workflow_state?: string;
    billing_address?: string;
    interest_level?: 'High' | 'Medium' | 'Low';
}

export async function fetchLeads(params: {
    page: number;
    page_size: number;
    search?: string;
    filterValues?: Record<string, any>;
    sort_by?: string;
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Lead", "lead_name", "like", `%${params.search}%`]);
        or_filters.push(["Lead", "email", "like", `%${params.search}%`]);
        or_filters.push(["Lead", "company_name", "like", `%${params.search}%`]);
        or_filters.push(["Lead", "phone_number", "like", `%${params.search}%`]);
    }

    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filters.push(["Lead", key, "=", value]);
            }
        });
    }

    // Convert sort_by format (e.g., "creation_desc") to Frappe order_by format
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
        doctype: "Lead",
        fields: JSON.stringify([
            "name",
            "lead_name",
            "company_name",
            "gstin",
            "phone_number",
            "email",
            "service",
            "leads_type",
            "leads_from",
            "status",
            "workflow_state",
            "country",
            "state",
            "city",
            "billing_address",
            "remarks",
            "interest_level",
            "owner",
            "creation"
        ]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Lead&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch leads");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}


export async function createLead(data: Partial<Lead>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Lead",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create lead"));
    return json.message;
}


export async function updateLead(name: string, data: Partial<Lead>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Lead",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update lead"));
    return json.message;
}


export async function deleteLead(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Lead",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete lead"));
    return json.message;
}


export async function getDoctypeList(doctype: string, fields?: string[]) {
    const params: any = {
        doctype,
        limit_page_length: '1000',
    };

    if (fields) {
        params.fields = JSON.stringify(fields);
    }

    const query = new URLSearchParams(params);

    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_doctype_list?${query.toString()}`
    );

    if (!res.ok) {
        console.error(`Failed to fetch list for ${doctype}`);
        return [];
    }
    const data = await res.json();
    const message = data.message || [];

    // If it's a list of objects and we only wanted names, it would have been plucked on backend
    // but just in case, or if fields were specified, we return the message as is.
    return message;
}

export async function getStates(country: string) {
    const res = await frappeRequest(
        `/api/method/company.company.api.get_states?country=${encodeURIComponent(country)}`
    );

    if (!res.ok) {
        return [];
    }

    return (await res.json()).message || [];
}

export async function getCities(country: string, state: string) {
    const res = await frappeRequest(
        `/api/method/company.company.api.get_cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
    );

    if (!res.ok) {
        return [];
    }

    return (await res.json()).message || [];
}

export async function getDoc(doctype: string, name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch ${doctype} details`);
    }

    return (await res.json()).message;
}

export async function getLead(name: string) {
    return getDoc("Lead", name);
}

export async function getLeadPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_lead_permissions");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}


export interface WorkflowTransition {
    state: string;
    action: string;
    next_state: string;
    allowed: string;
}

export interface WorkflowStates {
    states: string[];
    transitions: WorkflowTransition[];
    actions: { action: string; next_state: string }[];
}

export async function getWorkflowStates(doctype: string = 'Lead'): Promise<WorkflowStates> {
    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_workflow_states?doctype=${doctype}`
    );

    if (!res.ok) {
        return { states: [], transitions: [], actions: [] };
    }

    return (await res.json()).message || { states: [], transitions: [], actions: [] };
}

export async function getWorkflowActions(doctype: string = 'Lead', currentState: string): Promise<{ action: string; next_state: string }[]> {
    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_workflow_states?doctype=${doctype}&current_state=${encodeURIComponent(currentState)}`
    );

    if (!res.ok) {
        return [];
    }

    const data = (await res.json()).message || { actions: [] };
    return data.actions || [];
}

export function getNextStates(currentState: string, transitions: WorkflowTransition[]): string[] {
    // Get all allowed next states from the current state
    const nextStates = transitions
        .filter(t => t.state === currentState)
        .map(t => t.next_state);

    // Always include the current state so user can keep it
    return [currentState, ...nextStates];
}

export interface ConvertLeadResponse {
    account: string;
    contact: string;
    messages: Array<{
        type: 'success' | 'warning' | 'error';
        text: string;
    }>;
}

export async function convertLead(leadName: string): Promise<ConvertLeadResponse> {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.crm_api.convert_lead", {
        method: "POST",
        headers,
        body: JSON.stringify({
            lead_name: leadName
        })
    });

    const json = await res.json();

    if (!res.ok || json.exc) {
        throw new Error(handleFrappeError(json, "Failed to convert lead"));
    }

    return json.message;
}
export async function applyWorkflowAction(doctype: string, name: string, action: string) {
    console.log('applyWorkflowAction calling:', { doctype, name, action });
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.apply_workflow_action", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype,
            name,
            action
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to apply workflow action"));
    return json.message;
}
