import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface ReimbursementClaim {
    name: string;
    employee: string;
    employee_name: string;
    claim_type: string;
    date_of_expense: string;
    amount: number;
    claim_details: string;
    receipt?: string;
    paid: number;
    approved_by?: string;
    paid_by?: string;
    paid_date?: string;
    payment_reference?: string;
    payment_proof?: string;
    approver_comments?: string;
    creation?: string;
    modified?: string;
    workflow_state?: string;
}

export interface WorkflowAction {
    state: string;
    action: string;
    next_state: string;
    allowed: string;
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        employee?: string;
        paid?: number | string | null;
        claim_type?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    // Add filters
    if (params.filters) {
        if (params.filters.employee && params.filters.employee !== 'all') {
            filters.push(['Reimbursement Claim', 'employee', '=', params.filters.employee]);
        }
        if (params.filters.paid !== undefined && params.filters.paid !== null && params.filters.paid !== 'all') {
            filters.push(['Reimbursement Claim', 'paid', '=', params.filters.paid === 'paid' ? 1 : 0]);
        }
        if (params.filters.claim_type && params.filters.claim_type !== 'all') {
            filters.push(['Reimbursement Claim', 'claim_type', '=', params.filters.claim_type]);
        }
        if (params.filters.startDate) {
            filters.push(['Reimbursement Claim', 'date_of_expense', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Reimbursement Claim', 'date_of_expense', '<=', params.filters.endDate]);
        }
    }

    // Use or_filters for search
    const or_filters: any[] = params.search ? [
        ['Reimbursement Claim', 'employee_name', 'like', `%${params.search}%`],
        ['Reimbursement Claim', 'claim_type', 'like', `%${params.search}%`]
    ] : [];

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}, creation ${params.order}` : "date_of_expense desc, creation desc";

    const query = new URLSearchParams({
        doctype: 'Reimbursement Claim',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Reimbursement Claim&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch reimbursement claims");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchReimbursementClaims = (params: any) => fetchFrappeList(params);

export async function getClaimTypes() {
    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_doctype_list?doctype=Claim Type&fields=["*"]`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.message || [];
}

export async function createReimbursementClaim(data: Partial<ReimbursementClaim>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Reimbursement Claim", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create reimbursement claim"));
    }

    return (await res.json()).message;
}

export async function updateReimbursementClaim(name: string, data: Partial<ReimbursementClaim>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Reimbursement Claim",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update reimbursement claim"));
    }

    return (await res.json()).message;
}

export async function deleteReimbursementClaim(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Reimbursement Claim", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete reimbursement claim"));
    }

    return true;
}

export async function getReimbursementClaim(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Reimbursement Claim&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch reimbursement claim details");
    }

    return (await res.json()).message;
}

export async function getReimbursementClaimPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Reimbursement Claim");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getReimbursementClaimWorkflowActions(currentState: string): Promise<WorkflowAction[]> {
    const res = await frappeRequest(
        `/api/method/company.company.frontend_api.get_workflow_states?doctype=Reimbursement Claim&current_state=${encodeURIComponent(currentState)}`
    );

    if (!res.ok) {
        return [];
    }

    const data = (await res.json()).message || { actions: [] };
    return data.actions || [];
}

export async function applyReimbursementClaimWorkflowAction(name: string, action: string, comment?: string, paymentDetails?: any) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/company.company.frontend_api.apply_workflow_action", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Reimbursement Claim",
            name,
            action,
            comment,
            payment_details: paymentDetails
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to apply workflow action"));
    return json.message;
}
