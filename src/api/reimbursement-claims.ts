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
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
}) {
    const filters: any[] = [];

    if (params.search) {
        filters.push([
            ['Reimbursement Claim', 'employee_name', 'like', `%${params.search}%`]
        ]);
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "date_of_expense desc";

    const query = new URLSearchParams({
        doctype: 'Reimbursement Claim',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Reimbursement Claim&filters=${encodeURIComponent(JSON.stringify(filters))}`)
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
