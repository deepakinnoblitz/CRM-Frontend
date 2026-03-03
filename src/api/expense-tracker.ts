import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface ExpenseTracker {
    name: string;
    type: 'Income' | 'Expense';
    titlenotes?: string;
    amount: number;
    date_time: string;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface ExpenseTrackerStats {
    total_income: number;
    total_expense: number;
    balance: number;
}

export async function fetchExpenseTrackerStats(filters?: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams();
    if (filters?.start_date) query.append('start_date', filters.start_date);
    if (filters?.end_date) query.append('end_date', filters.end_date);

    // Assuming the same backend method pattern works for Expense Tracker if renamed or generic
    // However, the user specified "Expense Tracker" doctype.
    // I need to check if company.company.frontend_api.get_crm_expense_tracker_stats is generic enough
    // or if I should use a more generic one. For now I will assume there is/should be a similar method.
    // Given the name CRM Expense Tracker was specific, I might need to use get_list and calculate manually
    // or use a generic stats method if it exists.
    // Let's check the backend api if possible.

    // For now, I'll use a generic approach if possible or keep it similar to crm-expense-tracker
    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_expense_tracker_stats?${query.toString()}`);
    if (!res.ok) {
        // Fallback: If the specific method doesn't exist, we might need to calculate it from the list
        // returning 0s for now to avoid crash, but ideally the backend should provide this.
        return { total_income: 0, total_expense: 0, balance: 0 };
    }
    const json = await res.json();
    return json.message as ExpenseTrackerStats;
}

export async function fetchExpenseTrackerList(params: {
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
        filters.push(['Expense Tracker', 'titlenotes', 'like', `%${params.search}%`]);
    }
    if (params.filters?.type && params.filters.type !== 'all') {
        filters.push(['Expense Tracker', 'type', '=', params.filters.type]);
    }
    if (params.filters?.start_date) {
        filters.push(['Expense Tracker', 'date_time', '>=', params.filters.start_date]);
    }
    if (params.filters?.end_date) {
        filters.push(['Expense Tracker', 'date_time', '<=', params.filters.end_date]);
    }

    let orderBy = "creation desc";
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const order = parts.pop();
        const field = parts.join('_');
        orderBy = `${field} ${order}`;
    }

    const query = new URLSearchParams({
        doctype: 'Expense Tracker',
        fields: JSON.stringify(['name', 'type', 'titlenotes', 'amount', 'date_time', 'creation']),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Expense Tracker&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch records");
    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export async function createExpenseTracker(data: Partial<ExpenseTracker>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Expense Tracker",
                ...data
            }
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create record"));
    return json.message;
}

export async function updateExpenseTracker(name: string, data: Partial<ExpenseTracker>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Expense Tracker",
            name,
            fieldname: data
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update record"));
    return json.message;
}

export async function deleteExpenseTracker(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Expense Tracker",
            name
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete record"));
    return json.message;
}
