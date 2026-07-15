import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------
export interface WhatsAppAutomation {
    name: string;
    automation_name: string;
    is_active: number;
    description?: string;
    document_type: string;
    trigger_event: string;
    workflow_state?: string;
    previous_workflow_state?: string;
    deal_stage?: string;
    previous_deal_stage?: string;
    whatsapp_template: string;
    show_confirmation_dialog: number;
    dialog_title?: string;
    dialog_message?: string;
    auto_send: number;
    creation?: string;
    modified?: string;
}

export interface FetchWhatsAppAutomationsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    whatsapp_template?: string;
    document_type?: string;
    filters?: { whatsapp_template?: string; document_type?: string; is_active?: string };
}

// ----------------------------------------------------------------------
// Fetch WhatsApp Automations (paginated)
// ----------------------------------------------------------------------

export async function fetchWhatsAppAutomations(params: FetchWhatsAppAutomationsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM WhatsApp Automation', 'automation_name', 'like', `%${params.search}%`]);
    }

    if (params.whatsapp_template && params.whatsapp_template !== 'all') {
        filters.push(['CRM WhatsApp Automation', 'whatsapp_template', '=', params.whatsapp_template]);
    }
    if (params.document_type && params.document_type !== 'all') {
        filters.push(['CRM WhatsApp Automation', 'document_type', '=', params.document_type]);
    }
    if (params.filters) {
        if (params.filters.whatsapp_template && params.filters.whatsapp_template !== 'all') {
            filters.push(['CRM WhatsApp Automation', 'whatsapp_template', '=', params.filters.whatsapp_template]);
        }
        if (params.filters.document_type && params.filters.document_type !== 'all') {
            filters.push(['CRM WhatsApp Automation', 'document_type', '=', params.filters.document_type]);
        }
        if (params.filters.is_active && params.filters.is_active !== 'all') {
            filters.push(['CRM WhatsApp Automation', 'is_active', '=', params.filters.is_active === '1' ? 1 : 0]);
        }
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM WhatsApp Automation',
        fields: JSON.stringify([
            'name', 'automation_name', 'is_active', 'description',
            'document_type', 'trigger_event', 'whatsapp_template',
            'creation', 'modified',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM WhatsApp Automation&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch WhatsApp automations');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single WhatsApp Automation
// ----------------------------------------------------------------------

export async function getWhatsAppAutomation(name: string): Promise<WhatsAppAutomation> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM WhatsApp Automation&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch WhatsApp automation details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create WhatsApp Automation
// ----------------------------------------------------------------------

export async function createWhatsAppAutomation(data: Partial<WhatsAppAutomation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM WhatsApp Automation', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create WhatsApp automation'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update WhatsApp Automation
// ----------------------------------------------------------------------

export async function updateWhatsAppAutomation(name: string, data: Partial<WhatsAppAutomation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM WhatsApp Automation',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update WhatsApp automation'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete WhatsApp Automation
// ----------------------------------------------------------------------

export async function deleteWhatsAppAutomation(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM WhatsApp Automation', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete WhatsApp automation'));
    return true;
}

// ----------------------------------------------------------------------
// Toggle automation active state
// ----------------------------------------------------------------------

export async function toggleWhatsAppAutomationActive(name: string, isActive: boolean) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM WhatsApp Automation',
            name,
            fieldname: { is_active: isActive ? 1 : 0 },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to toggle WhatsApp automation'));
    return json.message;
}
