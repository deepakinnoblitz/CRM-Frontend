import { frappeRequest } from 'src/utils/csrf';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaQueue {
    name: string;
    meta_lead: string;
    job_id?: string;
    status: string;
    attempts: number;
    started?: string;
    completed?: string;
    last_error?: string;
    creation: string;
    modified: string;
}

export interface FetchQueueParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
}

// ----------------------------------------------------------------------
// Fetch CRM Meta Queue (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaQueue(params: FetchQueueParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.status && params.status !== 'all') {
        filters.push(['CRM Meta Queue', 'status', '=', params.status]);
    }
    if (params.from_date) {
        filters.push(['CRM Meta Queue', 'started', '>=', params.from_date]);
    }
    if (params.to_date) {
        filters.push(['CRM Meta Queue', 'started', '<=', params.to_date]);
    }

    if (params.search) {
        or_filters.push(['CRM Meta Queue', 'name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Queue', 'status', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Queue', 'meta_lead', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Queue', 'job_id', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta Queue',
        fields: JSON.stringify([
            'name', 'meta_lead', 'job_id', 'status',
            'attempts', 'started', 'completed', 'last_error', 'creation', 'modified',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta Queue&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch CRM Meta Queue');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: (data.message || []) as MetaQueue[],
        total: (countData.message || 0) as number,
    };
}

// ----------------------------------------------------------------------
// Fetch single CRM Meta Queue item by name
// ----------------------------------------------------------------------

export async function getMetaQueueItem(name: string): Promise<MetaQueue> {
    const query = new URLSearchParams({
        doctype: 'CRM Meta Queue',
        name,
        fields: JSON.stringify([
            'name', 'meta_lead', 'job_id', 'status',
            'attempts', 'started', 'completed', 'last_error', 'creation',
        ]),
    });
    const res = await frappeRequest(`/api/method/frappe.client.get?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Meta Queue item details');
    const json = await res.json();
    return json.message as MetaQueue;
}
