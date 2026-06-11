import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface EmailTemplate {
    name: string;
    template_name: string;
    category: string;
    is_active: number;
    is_default: number;
    description?: string;
    subject: string;
    sender_name?: string;
    reply_to_email?: string;
    email_content: string;
    footer_content?: string;
    enable_open_tracking: number;
    enable_click_tracking: number;
    enable_unsubscribe: number;
    attachments?: any[];
    available_variables?: string;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchEmailTemplatesParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        category?: string;
        is_active?: string;
    };
}

// ----------------------------------------------------------------------
// Fetch Email Templates (paginated)
// ----------------------------------------------------------------------

export async function fetchEmailTemplates(params: FetchEmailTemplatesParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Email Template', 'template_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Email Template', 'subject', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Email Template', 'category', 'like', `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.category && params.filters.category !== 'all') {
            filters.push(['CRM Email Template', 'category', '=', params.filters.category]);
        }
        if (params.filters.is_active && params.filters.is_active !== 'all') {
            filters.push(['CRM Email Template', 'is_active', '=', params.filters.is_active === 'yes' ? 1 : 0]);
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
        doctype: 'CRM Email Template',
        fields: JSON.stringify([
            'name', 'template_name', 'category', 'is_active', 'is_default',
            'subject', 'sender_name', 'description',
            'enable_open_tracking', 'enable_click_tracking', 'enable_unsubscribe',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Email Template&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch email templates');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Email Template
// ----------------------------------------------------------------------

export async function getEmailTemplate(name: string): Promise<EmailTemplate> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Email Template&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch email template details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Email Template
// ----------------------------------------------------------------------

export async function createEmailTemplate(data: Partial<EmailTemplate>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Email Template', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create email template'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Email Template
// ----------------------------------------------------------------------

export async function updateEmailTemplate(name: string, data: Partial<EmailTemplate>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Email Template',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update email template'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Email Template
// ----------------------------------------------------------------------

export async function deleteEmailTemplate(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Email Template', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete email template'));
    return true;
}
