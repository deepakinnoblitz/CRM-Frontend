import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface WhatsAppSettings {
    name: string;
    enable_whatsapp: number;
    token_type: string;
    access_token?: string;
    phone_number_id: string;
    business_account_id: string;
    whatsapp_number?: string;
    webhook_verify_token?: string;
    webhook_url?: string;
    connection_status?: string;
    last_connected_on?: string;
}

// ----------------------------------------------------------------------
// Get CRM WhatsApp Settings (Single DocType)
// ----------------------------------------------------------------------

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM WhatsApp Settings&name=CRM WhatsApp Settings`
    );
    if (!res.ok) throw new Error('Failed to fetch WhatsApp settings');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Save CRM WhatsApp Settings
// ----------------------------------------------------------------------

export async function saveWhatsAppSettings(data: Partial<WhatsAppSettings>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM WhatsApp Settings',
            name: 'CRM WhatsApp Settings',
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to save WhatsApp settings'));
    return json.message;
}

// ----------------------------------------------------------------------
// Test WhatsApp Connection
// ----------------------------------------------------------------------

export async function testWhatsAppConnection() {
    const res = await frappeRequest('/api/method/company.company.crm_whatsapp_api.test_connection');
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to test WhatsApp connection'));
    return json.message;
}