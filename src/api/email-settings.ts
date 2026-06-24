import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface EmailSettings {
    name?: string;
    default_email_account: string;
    max_emails_per_batch: number;
    batch_delay: number;
    maximum_retry_count: number;
    auto_retry_failed_emails: number;
    enable_email_automation: number;
    scheduler_interval: string;
    create_campaign_history: number;
    queue_size: number;
    auto_delete_old_queue_records: number;
    queue_retention_days: number;
    enable_debug_logs: number;
}

// ----------------------------------------------------------------------
// Get CRM Email Settings (Single DocType)
// ----------------------------------------------------------------------

export async function getEmailSettings(): Promise<EmailSettings> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Email Settings&name=CRM Email Settings`
    );
    if (!res.ok) throw new Error('Failed to fetch email settings');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Save CRM Email Settings
// ----------------------------------------------------------------------

export async function saveEmailSettings(data: Partial<EmailSettings>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Email Settings',
            name: 'CRM Email Settings',
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to save email settings'));
    return json.message;
}

// ----------------------------------------------------------------------
// Fetch Email Account options for dropdown
// ----------------------------------------------------------------------

export async function getEmailAccountOptions(): Promise<{ name: string; email_id?: string }[]> {
    const query = new URLSearchParams({
        doctype: 'Email Account',
        fields: JSON.stringify(['name', 'email_id']),
        limit_page_length: '100',
    });
    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.message || [];
}
