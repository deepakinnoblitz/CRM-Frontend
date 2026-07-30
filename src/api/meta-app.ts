import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface MetaApp {
    name: string;
    app_name: string;
    app_id: string;
    app_secret?: string;
    verify_token?: string;
    webhook_url?: string;
    oauth_redirect_uri?: string;
    graph_api_version?: string;
    business_manager_id?: string;
    app_status?: string;
    webhook_secret?: string;
    signature_validation?: number;
    is_default?: number;
    is_active?: number;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchMetaAppsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    app_status?: string;
    is_active?: string;
    is_default?: string;
}

// ----------------------------------------------------------------------
// Fetch Meta Apps (paginated)
// ----------------------------------------------------------------------

export async function fetchMetaApps(params: FetchMetaAppsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.app_status && params.app_status !== 'all') {
        filters.push(['CRM Meta App', 'app_status', '=', params.app_status]);
    }
    if (params.is_active && params.is_active !== 'all') {
        filters.push(['CRM Meta App', 'is_active', '=', params.is_active === 'yes' ? 1 : 0]);
    }
    if (params.is_default && params.is_default !== 'all') {
        filters.push(['CRM Meta App', 'is_default', '=', params.is_default === 'yes' ? 1 : 0]);
    }

    if (params.search) {
        or_filters.push(['CRM Meta App', 'app_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta App', 'app_id', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Meta App', 'business_manager_id', 'like', `%${params.search}%`]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Meta App',
        fields: JSON.stringify([
            'name', 'app_name', 'app_id', 'webhook_url', 'oauth_redirect_uri',
            'graph_api_version', 'business_manager_id', 'app_status',
            'signature_validation', 'is_default', 'is_active',
            'creation', 'modified', 'owner',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Meta App&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch Meta Apps');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Meta App
// ----------------------------------------------------------------------

export async function getMetaApp(name: string): Promise<MetaApp> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Meta App&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch Meta App details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Meta App
// ----------------------------------------------------------------------

export async function createMetaApp(data: Partial<MetaApp>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Meta App', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create Meta App'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Meta App
// ----------------------------------------------------------------------

export async function updateMetaApp(name: string, data: Partial<MetaApp>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Meta App',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update Meta App'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Meta App
// ----------------------------------------------------------------------

export async function deleteMetaApp(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Meta App', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete Meta App'));
    return true;
}

// ----------------------------------------------------------------------
// Phase 3 OAuth & Account API Helpers
// ----------------------------------------------------------------------

export async function initiateMetaOAuth(metaApp?: string) {
    const url = `/api/method/company.company.crm_meta_api.initiate_meta_oauth${metaApp ? `?meta_app=${encodeURIComponent(metaApp)}` : ''}`;
    const res = await frappeRequest(url);
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to initiate Meta OAuth'));
    return json.message;
}

export async function getMetaAccountStatus(accountName?: string) {
    const url = `/api/method/company.company.crm_meta_account_api.get_meta_account_status${accountName ? `?account_name=${encodeURIComponent(accountName)}` : ''}`;
    const res = await frappeRequest(url);
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to fetch Meta Account status'));
    return json.message;
}

export async function disconnectMetaAccount(accountName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.crm_meta_account_api.disconnect_meta_account', {
        method: 'POST',
        headers,
        body: JSON.stringify({ account_name: accountName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to disconnect Meta Account'));
    return json.message;
}

// ----------------------------------------------------------------------
// Phase 4 & 5 Facebook Page Discovery & Toggle Helpers
// ----------------------------------------------------------------------

export async function fetchMetaPagesFromGraphAPI(accountName?: string) {
    const url = `/api/method/company.company.crm_meta_page_api.fetch_meta_pages_from_graph_api${accountName ? `?account_name=${encodeURIComponent(accountName)}` : ''}`;
    const res = await frappeRequest(url);
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to discover Facebook Pages'));
    return json.message;
}

export async function toggleMetaPageConnection(pageName: string, isConnected: boolean) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.crm_meta_page_api.toggle_meta_page_connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_name: pageName, is_connected: isConnected ? 1 : 0 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update Page connection status'));
    return json.message;
}

// ----------------------------------------------------------------------
// Phase 6 Meta Lead Form Discovery & Toggle Helpers
// ----------------------------------------------------------------------

export async function fetchMetaFormsFromGraphAPI(pageName?: string) {
    const url = `/api/method/company.company.crm_meta_form_api.fetch_meta_forms_from_graph_api${pageName ? `?page_name=${encodeURIComponent(pageName)}` : ''}`;
    const res = await frappeRequest(url);
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to discover Meta Lead Forms'));
    return json.message;
}

export async function toggleMetaFormConnection(formName: string, isActive: boolean) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.crm_meta_form_api.toggle_meta_form_connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({ form_name: formName, is_active: isActive ? 1 : 0 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update Form sync status'));
    return json.message;
}
