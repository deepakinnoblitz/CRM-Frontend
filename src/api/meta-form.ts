import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaFieldMapping {
    name?: string;
    meta_field: string;
    crm_field: string;
    required: number;
    default_value?: string;
    transform_function: string;
}

export interface MetaForm {
    name: string;
    form_name: string;
    form_id: string;
    meta_page: string;
    campaign_id?: string;
    campaign_name?: string;
    ad_set_id?: string;
    ad_set_name?: string;
    ad_id?: string;
    ad_name?: string;
    is_active?: number;
    allow_duplicates?: number;
    duplicate_limit_by?: string;
    field_mappings?: MetaFieldMapping[];
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchMetaFormsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
}

// ----------------------------------------------------------------------
// Fetch Meta Forms (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaForms(params: FetchMetaFormsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Meta Form', 'form_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Form', 'form_id', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta Form', 'meta_page', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta Form',
        fields: JSON.stringify([
            'name', 'form_name', 'form_id', 'meta_page',
            'campaign_id', 'campaign_name', 'ad_set_id', 'ad_set_name',
            'ad_id', 'ad_name', 'is_active', 'allow_duplicates',
            'duplicate_limit_by', 'creation', 'modified', 'owner',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta Form&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch Meta Forms');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Meta Form
// ----------------------------------------------------------------------

export async function getMetaForm(name: string): Promise<MetaForm> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Meta Form&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch Meta Form details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Meta Form
// ----------------------------------------------------------------------

export async function createMetaForm(data: Partial<MetaForm>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Meta Form', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create Meta Form'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Meta Form
// ----------------------------------------------------------------------

export async function updateMetaForm(name: string, data: Partial<MetaForm>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Meta Form',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update Meta Form'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Meta Form
// ----------------------------------------------------------------------

export async function deleteMetaForm(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Meta Form', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete Meta Form'));
    return true;
}
