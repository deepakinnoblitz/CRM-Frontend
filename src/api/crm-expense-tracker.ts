import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface CRMExpenseTracker {
    name: string;
    type: 'Income' | 'Expense';
    titlenotes?: string;
    amount: number;
    date_time: string;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface CRMExpenseTrackerStats {
    total_income: number;
    total_expense: number;
    balance: number;
}

export async function fetchCRMExpenseTrackerStats(filters?: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams();
    if (filters?.start_date) query.append('start_date', filters.start_date);
    if (filters?.end_date) query.append('end_date', filters.end_date);

    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_crm_expense_tracker_stats?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    const json = await res.json();
    return json.message as CRMExpenseTrackerStats;
}

export async function fetchCRMExpenseTrackerList(params: {
    page: number;
    page_size: number;
    search?: string;
    filters?: {
        type?: string;
        start_date?: string;
        end_date?: string;
    };
    sort_by?: string;
}) {
    const filters: any[] = [];
    if (params.search) {
        filters.push(['CRM Expense Tracker', 'titlenotes', 'like', `%${params.search}%`]);
    }
    if (params.filters?.type && params.filters.type !== 'all') {
        filters.push(['CRM Expense Tracker', 'type', '=', params.filters.type]);
    }
    if (params.filters?.start_date) {
        filters.push(['CRM Expense Tracker', 'date_time', '>=', params.filters.start_date]);
    }
    if (params.filters?.end_date) {
        filters.push(['CRM Expense Tracker', 'date_time', '<=', params.filters.end_date]);
    }

    let orderBy = "creation desc";
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const order = parts.pop();
        const field = parts.join('_');
        orderBy = `${field} ${order}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Expense Tracker',
        fields: JSON.stringify(['name', 'type', 'titlenotes', 'amount', 'date_time', 'creation']),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=CRM Expense Tracker&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch records");
    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createCRMExpenseTracker(data: Partial<CRMExpenseTracker>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "CRM Expense Tracker",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create record"));
    return json.message;
}

export async function updateCRMExpenseTracker(name: string, data: Partial<CRMExpenseTracker>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "CRM Expense Tracker",
            name,
            fieldname: data
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update record"));
    return json.message;
}

export async function deleteCRMExpenseTracker(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "CRM Expense Tracker",
            name
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete record"));
    return json.message;
}
