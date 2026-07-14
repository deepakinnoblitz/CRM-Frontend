import { frappeRequest } from 'src/utils/csrf';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaLead {
    name: string;
    meta_lead_id: string;
    meta_app: string;
    meta_page: string;
    meta_form: string;
    campaign_name?: string;
    ad_set_name?: string;
    ad_name?: string;
    webhook_payload?: string;
    lead_json?: string;
    received_time?: string;
    processed_time?: string;
    processing_status: string;
    retry_count: number;
    error_message?: string;
    created_lead?: string;
    creation: string;
    modified: string;
}

export interface FetchLeadParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
}

// ----------------------------------------------------------------------
// Fetch CRM Meta Lead (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaLeads(params: FetchLeadParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Meta Lead', 'meta_lead_id', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Lead', 'meta_app', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Lead', 'meta_page', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Lead', 'meta_form', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Lead', 'processing_status', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta Lead',
        fields: JSON.stringify([
            'name', 'meta_lead_id', 'meta_app', 'meta_page', 'meta_form',
            'campaign_name', 'ad_set_name', 'ad_name', 'received_time',
            'processed_time', 'processing_status', 'retry_count', 'creation', 'modified'
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta Lead&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch CRM Meta Leads');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: (data.message || []) as MetaLead[],
        total: (countData.message || 0) as number,
    };
}

// ----------------------------------------------------------------------
// Fetch single CRM Meta Lead item by name
// ----------------------------------------------------------------------

export async function getMetaLeadItem(name: string): Promise<MetaLead> {
    const query = new URLSearchParams({
        doctype: 'CRM Meta Lead',
        name,
        fields: JSON.stringify([
            'name', 'meta_lead_id', 'meta_app', 'meta_page', 'meta_form',
            'campaign_name', 'ad_set_name', 'ad_name', 'webhook_payload',
            'lead_json', 'received_time', 'processed_time', 'processing_status',
            'retry_count', 'error_message', 'created_lead', 'creation'
        ]),
    });
    const res = await frappeRequest(`/api/method/frappe.client.get?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Meta Lead item details');
    const json = await res.json();
    return json.message as MetaLead;
}
