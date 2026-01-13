import { getAuthHeaders, frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface ExpenseItem {
    name?: string;
    items: string;
    quantity: number;
    price: number;
    amount: number;
}

export interface Expense {
    name: string;
    expense_no: string;
    expense_category: string;
    date: string;
    payment_type: string;

    // Items
    table_qecz?: ExpenseItem[];

    // Total
    total?: number;

    description?: string;
    creation?: string;
    modified?: string;
    owner?: string;
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
            ['Expenses', 'expense_category', 'like', `%${params.search}%`]
        ]);
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "date desc";

    const query = new URLSearchParams({
        doctype: 'Expenses',
        fields: JSON.stringify([
            "name",
            "expense_no",
            "expense_category",
            "date",
            "payment_type",
            "total",
            "description",
            "owner",
            "creation"
        ]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        fetch(`/api/method/frappe.client.get_list?${query.toString()}`, { credentials: "include" }),
        fetch(`/api/method/frappe.client.get_count?doctype=Expenses&filters=${encodeURIComponent(JSON.stringify(filters))}`, { credentials: "include" })
    ]);

    if (!res.ok) throw new Error("Failed to fetch expenses");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchExpenses = (params: any) => fetchFrappeList(params);

export async function createExpense(data: Partial<Expense>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Expenses",
                ...data
            }
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create expense"));
    return json.message;
}

export async function updateExpense(name: string, data: Partial<Expense>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Expenses",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update expense"));
    return json.message;
}

export async function deleteExpense(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Expenses",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete expense"));
    return json.message;
}

export async function getExpense(name: string) {
    const res = await fetch(`/api/method/frappe.client.get?doctype=Expenses&name=${name}`, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch expense details");
    }

    return (await res.json()).message;
}

export async function getExpensePermissions() {
    const res = await fetch("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Expenses", {
        credentials: "include"
    });

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getDoctypeList(doctype: string, fields?: string[]) {
    const params: any = { doctype };
    if (fields) {
        params.fields = JSON.stringify(fields);
    }
    const query = new URLSearchParams(params);

    const res = await fetch(
        `/api/method/company.company.frontend_api.get_doctype_list?${query.toString()}`,
        { credentials: 'include' }
    );

    if (!res.ok) {
        return [];
    }
    return (await res.json()).message || [];
}

export function getExpensePrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Expenses&name=${encodeURIComponent(name)}`;
}
