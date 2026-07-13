import { frappeRequest } from 'src/utils/csrf';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaWebhookLog {
    name: string;
    headers?: string;
    payload?: string;
    response?: string;
    http_status?: number;
    execution_time?: number;
    retry_count?: number;
    status: string;
    creation: string;
}

export interface FetchWebhookLogsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
}

// ----------------------------------------------------------------------
// Fetch CRM Meta Webhook Logs (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaWebhookLogs(params: FetchWebhookLogsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Meta Webhook Log', 'name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Webhook Log', 'status', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Webhook Log', 'response', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta Webhook Log',
        fields: JSON.stringify([
            'name', 'response', 'http_status', 'execution_time', 'retry_count', 'status', 'creation',
        ]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy,
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta Webhook Log&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch CRM Meta Webhook Logs');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: (data.message || []) as MetaWebhookLog[],
        total: (countData.message || 0) as number,
    };
}

// ----------------------------------------------------------------------
// Fetch single CRM Meta Webhook Log by name
// ----------------------------------------------------------------------

export async function getMetaWebhookLog(name: string): Promise<MetaWebhookLog> {
    const query = new URLSearchParams({
        doctype: 'CRM Meta Webhook Log',
        name,
        fields: JSON.stringify([
            'name', 'headers', 'payload', 'response',
            'http_status', 'execution_time', 'retry_count', 'status', 'creation',
        ]),
    });
    const res = await frappeRequest(`/api/method/frappe.client.get?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Webhook Log details');
    const json = await res.json();
    return json.message as MetaWebhookLog;
}
