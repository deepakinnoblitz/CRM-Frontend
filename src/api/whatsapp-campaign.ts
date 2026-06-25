import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface CampaignFilter {
    field_name: string;
    operator: string;
    value: string;
}

export interface WhatsAppCampaign {
    name: string;
    campaign_name: string;
    whatsapp_template: string;
    template_name?: string;
    subject?: string;
    status: string;
    target_type: string;
    filters?: CampaignFilter[];
    total_recipients: number;
    send_immediately: number;
    schedule_date?: string;
    sent_count: number;
    failed_count: number;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchWhatsAppCampaignsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        status?: string;
        target_type?: string;
    };
}

// ----------------------------------------------------------------------
// Fetch WhatsApp Campaigns (paginated)
// ----------------------------------------------------------------------

export async function fetchWhatsAppCampaigns(params: FetchWhatsAppCampaignsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM WhatsApp Campaign', 'campaign_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM WhatsApp Campaign', 'subject', 'like', `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['CRM WhatsApp Campaign', 'status', '=', params.filters.status]);
        }
        if (params.filters.target_type && params.filters.target_type !== 'all') {
            filters.push(['CRM WhatsApp Campaign', 'target_type', '=', params.filters.target_type]);
        }
    }

    let orderBy = 'creation desc';
    if (params.sort_by) {
        let sortBy = params.sort_by;
        if (sortBy.startsWith('created_')) {
            sortBy = sortBy.replace('created_', 'creation_');
        }
        const parts = sortBy.split('_');
        const dir = parts.pop() || 'desc';
        const field = parts.join('_');
        orderBy = `${field} ${dir}`;
    }

    const query = new URLSearchParams({
        doctype: 'CRM WhatsApp Campaign',
        fields: JSON.stringify([
            'name', 'campaign_name', 'whatsapp_template', 'subject', 'status',
            'target_type', 'total_recipients', 'send_immediately', 'schedule_date',
            'sent_count', 'failed_count', 'creation', 'modified',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM WhatsApp Campaign&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch WhatsApp campaigns');

    const data = await res.json();
    const countData = await countRes.json();
    const campaigns = data.message || [];

    const templateIds = [
        ...new Set(
            campaigns
                .map((c: any) => c.whatsapp_template)
                .filter(Boolean)
        ),
    ];

    let templateMap: Record<string, string> = {};

    if (templateIds.length) {
        const templateQuery = new URLSearchParams({
            doctype: 'CRM WhatsApp Template',
            fields: JSON.stringify([
                'name',
                'template_name',
            ]),
            filters: JSON.stringify([
                ['CRM WhatsApp Template', 'name', 'in', templateIds],
            ]),
            limit_page_length: '500',
        });

        const templateRes = await frappeRequest(
            `/api/method/frappe.client.get_list?${templateQuery}`
        );

        const templateJson = await templateRes.json();

        templateMap = Object.fromEntries(
            (templateJson.message || []).map(
                (t: any) => [
                    t.name,
                    t.template_name,
                ]
            )
        );
    }

    const enrichedCampaigns = campaigns.map(
        (campaign: any) => ({
            ...campaign,
            template_name:
                templateMap[campaign.whatsapp_template] ||
                campaign.whatsapp_template,
        })
    );

    return {
        data: enrichedCampaigns,
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single WhatsApp Campaign
// ----------------------------------------------------------------------

export async function getWhatsAppCampaign(name: string): Promise<WhatsAppCampaign> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM WhatsApp Campaign&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch WhatsApp campaign details');
    const campaign = (await res.json()).message;

    if (campaign.whatsapp_template) {
        try {
            const templateRes = await frappeRequest(
                `/api/method/frappe.client.get_value?doctype=CRM WhatsApp Template&fieldname=template_name&filters={"name":"${campaign.whatsapp_template}"}`
            );
            const templateJson = await templateRes.json();
            if (templateJson.message && templateJson.message.template_name) {
                campaign.template_name = templateJson.message.template_name;
            }
        } catch (err) {
            console.error('Failed to fetch template name', err);
        }
    }

    return campaign;
}

// ----------------------------------------------------------------------
// Create WhatsApp Campaign
// ----------------------------------------------------------------------

export async function createWhatsAppCampaign(data: Partial<WhatsAppCampaign>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM WhatsApp Campaign', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create WhatsApp campaign'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update WhatsApp Campaign
// ----------------------------------------------------------------------

export async function updateWhatsAppCampaign(name: string, data: Partial<WhatsAppCampaign>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM WhatsApp Campaign',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update WhatsApp campaign'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete WhatsApp Campaign
// ----------------------------------------------------------------------

export async function deleteWhatsAppCampaign(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM WhatsApp Campaign', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete WhatsApp campaign'));
    return true;
}

// ----------------------------------------------------------------------
// Campaign Actions (whitelisted methods)
// ----------------------------------------------------------------------

export async function startCampaign(campaignName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.start_campaign', {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_name: campaignName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to start campaign'));
    return json.message;
}

export async function pauseCampaign(campaignName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.pause_campaign', {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_name: campaignName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to pause campaign'));
    return json.message;
}

export async function cancelCampaign(campaignName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.cancel_campaign', {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_name: campaignName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to cancel campaign'));
    return json.message;
}

export async function calculateRecipients(campaignName: string) {
    const res = await frappeRequest(
        `/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.calculate_recipients?campaign_name=${encodeURIComponent(campaignName)}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to calculate recipients'));
    return json.message;
}

export async function previewRecipients(
    targetType: string,
    filters: any[]
) {
    const res = await frappeRequest(
        '/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.preview_recipients',
        {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({
                target_type: targetType,
                filters: JSON.stringify(filters),
            }),
        }
    );

    const json = await res.json();

    if (!res.ok) {
        throw new Error('Failed to preview recipients');
    }

    return json.message;
}

export async function getFilterValueOptions(targetType: string, fieldName: string) {
    const res = await frappeRequest(
        `/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.get_filter_value_options?target_type=${encodeURIComponent(targetType)}&field_name=${encodeURIComponent(fieldName)}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to fetch filter options');
    return json.message;
}

export async function getFilterFields(targetType: string) {
    const res = await frappeRequest(
        `/api/method/company.company.doctype.crm_whatsapp_campaign.crm_whatsapp_campaign.get_filter_fields?target_type=${encodeURIComponent(targetType)}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to fetch filter fields');
    return json.message || [];
}

// ----------------------------------------------------------------------
// Fetch WhatsApp Queue for a Campaign
// ----------------------------------------------------------------------

export interface WhatsAppQueueItem {
    name: string;
    recipient_name: string;
    recipient_phone: string;
    status: string;
    queued_on: string;
    sent_on: string;
    error_message: string;
}

export async function fetchWhatsAppQueue(campaignName: string): Promise<WhatsAppQueueItem[]> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get_list?doctype=CRM%20WhatsApp%20Queue&filters=${encodeURIComponent(JSON.stringify([['CRM WhatsApp Queue', 'campaign', '=', campaignName]]))}&fields=${encodeURIComponent(JSON.stringify(['name', 'recipient_name', 'recipient_phone', 'status', 'queued_on', 'sent_on', 'error_message']))}`
    );
    if (!res.ok) throw new Error('Failed to fetch WhatsApp queue');
    const json = await res.json();
    return json.message || [];
}
