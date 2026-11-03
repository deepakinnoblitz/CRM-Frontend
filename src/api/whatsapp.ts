import { handleFrappeError } from 'src/utils/api-error-handler';
import { frappeRequest, getAuthHeaders, getCSRFToken } from 'src/utils/csrf';

export interface WhatsappMessage {
    name: string;
    message_direction: 'Incoming' | 'Outgoing';
    message_content?: string;
    attachment?: string;
    status?: string;
    creation: string;
}

export async function fetchWhatsappMessages(phone: string, start: number = 0, limit: number = 10): Promise<WhatsappMessage[]> {
    const res = await frappeRequest(
        `/api/method/company.company.crm_whatsapp_api.get_whatsapp_messages?phone=${encodeURIComponent(phone)}&start=${start}&limit=${limit}`
    );
    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, "Failed to fetch WhatsApp messages"));
    }
    const data = await res.json();
    return data.message || [];
}

export async function sendWhatsappMessage(phone: string, message: string, attachment?: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(
        '/api/method/company.company.crm_whatsapp_api.send_whatsapp',
        {
            method: 'POST',
            headers,
            body: JSON.stringify({
                phone,
                message,
                attachment,
            }),
        }
    );
    const json = await res.json();
    if (!res.ok) {
        throw new Error(handleFrappeError(json, "Failed to send WhatsApp message"));
    }
    if (json.message && json.message.success === false) {
        const err = json.message.error;
        const msg = typeof err === 'string' ? err : err?.error?.message || err?.message || JSON.stringify(err);
        throw new Error(msg || "Failed to send WhatsApp message");
    }
    return json.message;
}

export async function uploadWhatsappAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_private', '0');

    // Get only the CSRF token — do NOT set Content-Type manually.
    // The browser must set it automatically with the multipart boundary.
    const csrfToken = await getCSRFToken();
    const res = await fetch('/api/method/upload_file', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Frappe-CSRF-Token': csrfToken,
        },
        body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(handleFrappeError(json, "File upload failed"));
    }
    const fileUrl = json.message?.file_url;
    if (!fileUrl) {
        throw new Error("Upload succeeded but no file URL was returned");
    }
    return fileUrl;
}

export interface AvailableWhatsAppTemplate {
    name: string;
    template_name: string;
    category?: string;
    language?: string;
    status: string;
    header_text?: string;
    message_body: string;
    footer_text?: string;
    allow_attachment?: number;
    default_attachment?: { file: string; description?: string }[];
}

export async function fetchAvailableWhatsAppTemplates(): Promise<AvailableWhatsAppTemplate[]> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get_list?doctype=CRM WhatsApp Template&fields=${encodeURIComponent(
            JSON.stringify([
                'name',
                'template_name',
                'category',
                'language',
                'status',
                'header_text',
                'message_body',
                'footer_text',
                'allow_attachment',
            ])
        )}&limit_page_length=0&order_by=template_name asc`
    );
    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, 'Failed to fetch WhatsApp templates'));
    }
    const json = await res.json();
    return json.message || [];
}

export interface LeadWhatsAppTemplateAttachment {
    file: string;
    file_name?: string;
    description?: string;
    file_size?: string;
}

export interface LeadWhatsAppTemplatePreview {
    header: string;
    body: string;
    footer: string;
    rendered_message: string;
    attachments: (string | LeadWhatsAppTemplateAttachment)[];
    allow_attachment: boolean;
    phone_number: string;
    lead_name: string;
}

export async function getLeadWhatsAppTemplatePreview(leadId: string, templateName: string): Promise<LeadWhatsAppTemplatePreview> {
    const res = await frappeRequest(
        `/api/method/company.company.crm_whatsapp_api.get_lead_whatsapp_template_preview?lead_id=${encodeURIComponent(leadId)}&template_name=${encodeURIComponent(templateName)}`
    );
    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, 'Failed to preview WhatsApp template'));
    }
    const json = await res.json();
    return json.message;
}

export async function sendLeadWhatsAppTemplate(
    leadId: string,
    templateName: string,
    customMessage?: string,
    attachment?: string
) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest(
        '/api/method/company.company.crm_whatsapp_api.send_lead_whatsapp_template',
        {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lead_id: leadId,
                template_name: templateName,
                custom_message: customMessage,
                attachment,
            }),
        }
    );
    const json = await res.json();
    if (!res.ok) {
        throw new Error(handleFrappeError(json, 'Failed to send WhatsApp template'));
    }
    if (json.message && json.message.success === false) {
        const err = json.message.error;
        const msg = typeof err === 'string' ? err : err?.error?.message || err?.message || JSON.stringify(err);
        throw new Error(msg || 'Failed to send WhatsApp template');
    }
    return json.message;
}

