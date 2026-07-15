import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaPage {
    name: string;
    page_name: string;
    page_id: string;
    meta_app: string;
    page_access_token?: string;
    long_lived_token?: string;
    webhook_enabled?: number;
    business_id?: string;
    is_active?: number;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchMetaPagesParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    meta_app?: string;
    webhook_enabled?: string;
    is_active?: string;
}

// ----------------------------------------------------------------------
// Fetch Meta Pages (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaPages(params: FetchMetaPagesParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.meta_app && params.meta_app !== 'all') {
        filters.push(['CRM Meta Page', 'meta_app', '=', params.meta_app]);
    }
    if (params.webhook_enabled && params.webhook_enabled !== 'all') {
        filters.push(['CRM Meta Page', 'webhook_enabled', '=', params.webhook_enabled === 'yes' ? 1 : 0]);
    }
    if (params.is_active && params.is_active !== 'all') {
        filters.push(['CRM Meta Page', 'is_active', '=', params.is_active === 'yes' ? 1 : 0]);
    }

    if (params.search) {
        or_filters.push(['CRM Meta Page', 'page_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Page', 'page_id', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Page', 'meta_app', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta Page',
        fields: JSON.stringify([
            'name', 'page_name', 'page_id', 'meta_app',
            'page_access_token', 'long_lived_token', 'webhook_enabled',
            'business_id', 'is_active', 'creation', 'modified', 'owner',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta Page&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch Meta Pages');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Meta Page
// ----------------------------------------------------------------------

export async function getMetaPage(name: string): Promise<MetaPage> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Meta Page&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch Meta Page details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Meta Page
// ----------------------------------------------------------------------

export async function createMetaPage(data: Partial<MetaPage>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Meta Page', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create Meta Page'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Meta Page
// ----------------------------------------------------------------------

export async function updateMetaPage(name: string, data: Partial<MetaPage>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Meta Page',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update Meta Page'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Meta Page
// ----------------------------------------------------------------------

export async function deleteMetaPage(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Meta Page', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete Meta Page'));
    return true;
}
