import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface AutomationFilter {
    field_name: string;
    operator: string;
    value: string;
}

export interface EmailAutomation {
    name: string;
    automation_name: string;
    is_active: number;
    status: string;
    description?: string;
    email_template: string;
    subject_override?: string;
    target_type: string;
    filters?: AutomationFilter[];
    frequency: string;
    start_date: string;
    end_date?: string;
    run_time: string;
    week_day?: string;
    day_of_month?: number;
    create_separate_campaign: number;
    send_immediately: number;
    auto_pause_on_error: number;
    max_retry_count: number;
    last_run_on?: string;
    next_run_on?: string;
    last_campaign?: string;
    total_runs: number;
    total_recipients: number;
    total_emails_sent: number;
    total_failed: number;
    open_count: number;
    click_count: number;
    creation?: string;
    modified?: string;
}

export interface FetchEmailAutomationsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    email_template?: string;
    status?: string;
    start_date?: string;
}

// ----------------------------------------------------------------------
// Fetch Email Automations (paginated)
// ----------------------------------------------------------------------

export async function fetchEmailAutomations(params: FetchEmailAutomationsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Email Automation', 'automation_name', 'like', `%${params.search}%`]);
    }

    if (params.status && params.status !== 'all') {
        filters.push(['CRM Email Automation', 'status', '=', params.status]);
    }
    if (params.email_template && params.email_template !== 'all') {
        filters.push(['CRM Email Automation', 'email_template', '=', params.email_template]);
    }
    if (params.start_date) {
        filters.push(['CRM Email Automation', 'start_date', '=', params.start_date]);
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM Email Automation',
        fields: JSON.stringify([
            'name', 'automation_name', 'is_active', 'status', 'description',
            'email_template', 'target_type', 'frequency', 'start_date', 'end_date',
            'run_time', 'last_run_on', 'next_run_on',
            'total_runs', 'total_emails_sent', 'total_failed',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Email Automation&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch email automations');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Email Automation
// ----------------------------------------------------------------------

export async function getEmailAutomation(name: string): Promise<EmailAutomation> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Email Automation&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch email automation details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Email Automation
// ----------------------------------------------------------------------

export async function createEmailAutomation(data: Partial<EmailAutomation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Email Automation', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create email automation'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Email Automation
// ----------------------------------------------------------------------

export async function updateEmailAutomation(name: string, data: Partial<EmailAutomation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Email Automation',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update email automation'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Email Automation
// ----------------------------------------------------------------------

export async function deleteEmailAutomation(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Email Automation', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete email automation'));
    return true;
}

// ----------------------------------------------------------------------
// Toggle automation active state
// ----------------------------------------------------------------------

export async function toggleAutomationActive(name: string, isActive: boolean) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Email Automation',
            name,
            fieldname: { is_active: isActive ? 1 : 0 },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to toggle automation'));
    return json.message;
}
