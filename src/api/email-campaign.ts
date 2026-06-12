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

export interface EmailCampaign {
    name: string;
    campaign_name: string;
    email_template: string;
    template_name?: string;
    subject?: string;
    status: string;
    target_type: string;
    filters?: CampaignFilter[];
    total_recipients: number;
    send_immediately: number;
    schedule_date?: string;
    sent_count: number;
    open_count: number;
    click_count: number;
    failed_count: number;
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface FetchEmailCampaignsParams {
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
// Fetch Email Campaigns (paginated)
// ----------------------------------------------------------------------

export async function fetchEmailCampaigns(params: FetchEmailCampaignsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['CRM Email Campaign', 'campaign_name', 'like', `%${params.search}%`]);
        or_filters.push(['CRM Email Campaign', 'subject', 'like', `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['CRM Email Campaign', 'status', '=', params.filters.status]);
        }
        if (params.filters.target_type && params.filters.target_type !== 'all') {
            filters.push(['CRM Email Campaign', 'target_type', '=', params.filters.target_type]);
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
        doctype: 'CRM Email Campaign',
        fields: JSON.stringify([
            'name', 'campaign_name', 'email_template', 'subject', 'status',
            'target_type', 'total_recipients', 'send_immediately', 'schedule_date',
            'sent_count', 'open_count', 'click_count', 'failed_count',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=CRM Email Campaign&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch email campaigns');

    const data = await res.json();
    const countData = await countRes.json();
    const campaigns = data.message || [];

    const templateIds = [
    ...new Set(
        campaigns
        .map((c: any) => c.email_template)
        .filter(Boolean)
    ),
    ];

    let templateMap: Record<string, string> = {};

    if (templateIds.length) {
    const templateQuery = new URLSearchParams({
        doctype: 'CRM Email Template',
        fields: JSON.stringify([
        'name',
        'template_name',
        ]),
        filters: JSON.stringify([
        ['CRM Email Template', 'name', 'in', templateIds],
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
        templateMap[campaign.email_template] ||
        campaign.email_template,
    })
    );

    return {
        data: enrichedCampaigns,
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Get Single Email Campaign
// ----------------------------------------------------------------------

export async function getEmailCampaign(name: string): Promise<EmailCampaign> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=CRM Email Campaign&name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error('Failed to fetch email campaign details');
    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Email Campaign
// ----------------------------------------------------------------------

export async function createEmailCampaign(data: Partial<EmailCampaign>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: { doctype: 'CRM Email Campaign', ...data },
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create email campaign'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Email Campaign
// ----------------------------------------------------------------------

export async function updateEmailCampaign(name: string, data: Partial<EmailCampaign>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'CRM Email Campaign',
            name,
            fieldname: data,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update email campaign'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Email Campaign
// ----------------------------------------------------------------------

export async function deleteEmailCampaign(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctype: 'CRM Email Campaign', name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete email campaign'));
    return true;
}

// ----------------------------------------------------------------------
// Campaign Actions (whitelisted methods)
// ----------------------------------------------------------------------

export async function startCampaign(campaignName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest('/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.start_campaign', {
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
    const res = await frappeRequest('/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.pause_campaign', {
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
    const res = await frappeRequest('/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.cancel_campaign', {
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
        `/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.calculate_recipients?campaign_name=${encodeURIComponent(campaignName)}`
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
        '/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.preview_recipients',
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
        `/api/method/company.company.doctype.crm_email_campaign.crm_email_campaign.get_filter_value_options?target_type=${encodeURIComponent(targetType)}&field_name=${encodeURIComponent(fieldName)}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to fetch filter options');
    return json.message;
}
