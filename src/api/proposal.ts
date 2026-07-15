import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------------------------

export interface ProposalAttachmentItem {
    name?: string;
    attachment?: string;
    description?: string;
    file_name?: string;
    file_size?: string;
    uploaded_on?: string;
    uploaded_by?: string;
}

export interface Proposal {
    name: string;
    proposal_title: string;
    reference_no?: string;
    lead: string;
    lead_name?: string;
    company_name?: string;
    billing_account_name?: string;
    proposal_date: string;
    valid_until?: string;
    subject?: string;
    description?: string;
    terms_and_conditions?: string;
    status?: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
    total_attachments?: number;
    attachments_table?: ProposalAttachmentItem[];
    created_by?: string;
    owner_name: string;
    prospect?: string;
    creation?: string;
    modified?: string;
}

export interface FetchProposalsParams {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    filters?: {
        lead?: string;
        status?: string;
        proposal_date?: string;
        prospect?: string;
    };
}

// ----------------------------------------------------------------------
// Fetch Proposals (paginated)
// ----------------------------------------------------------------------

export async function fetchProposals(params: FetchProposalsParams) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(['Proposal', 'proposal_title', 'like', `%${params.search}%`]);
        or_filters.push(['Proposal', 'reference_no', 'like', `%${params.search}%`]);
        or_filters.push(['Proposal', 'lead_name', 'like', `%${params.search}%`]);
        or_filters.push(['Proposal', 'lead', 'like', `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.lead && params.filters.lead !== 'all') {
            filters.push(['Proposal', 'lead', '=', params.filters.lead]);
        }
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['Proposal', 'status', '=', params.filters.status]);
        }
        if (params.filters.proposal_date) {
            filters.push(['Proposal', 'proposal_date', '=', params.filters.proposal_date]);
        }
        if (params.filters.prospect) {
            filters.push(['Proposal', 'prospect', '=', params.filters.prospect]);
        }
    }

    let orderBy = 'creation desc';

    if (params.sort_by) {
        const [field, direction] = params.sort_by.split('_').reduce(
            (acc, part) => {
                if (part === 'asc' || part === 'desc') {
                    acc[1] = part;
                } else {
                    acc[0] = acc[0] ? `${acc[0]}_${part}` : part;
                }
                return acc;
            },
            ['', 'desc'] as [string, string]
        );

        const ambiguousFields = ['modified', 'creation', 'owner'];
        if (ambiguousFields.includes(field)) {
            orderBy = `tabProposal.${field} ${direction}`;
        } else {
            orderBy = `${field} ${direction}`;
        }
    }

    const query = new URLSearchParams({
        doctype: 'Proposal',
        fields: JSON.stringify([
            'name',
            'proposal_title',
            'reference_no',
            'lead',
            'lead_name',
            'company_name',
            'proposal_date',
            'valid_until',
            'status',
            'total_attachments',
            'owner_name',
            'created_by',
            'creation',
            'modified',
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
            `/api/method/company.company.frontend_api.get_permitted_count?doctype=Proposal&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`
        ),
    ]);

    if (!res.ok) throw new Error('Failed to fetch proposals');

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

// ----------------------------------------------------------------------
// Fetch Related Proposals by Prospect ID
// ----------------------------------------------------------------------

export async function fetchRelatedProposals(prospectId: string) {
    const filters = [['Proposal', 'prospect', '=', prospectId]];
    const query = new URLSearchParams({
        doctype: 'Proposal',
        fields: JSON.stringify([
            'name',
            'proposal_title',
            'reference_no',
            'lead',
            'lead_name',
            'proposal_date',
            'status',
            'total_attachments',
            'creation',
        ]),
        filters: JSON.stringify(filters),
        order_by: 'creation desc',
    });

    const res = await frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch related proposals');

    const data = await res.json();
    return data.message || [];
}

// ----------------------------------------------------------------------
// Get Single Proposal
// ----------------------------------------------------------------------

export async function getProposal(name: string): Promise<Proposal> {
    const res = await frappeRequest(
        `/api/method/frappe.client.get?doctype=Proposal&name=${encodeURIComponent(name)}`
    );

    if (!res.ok) {
        throw new Error('Failed to fetch proposal details');
    }

    return (await res.json()).message;
}

// ----------------------------------------------------------------------
// Create Proposal
// ----------------------------------------------------------------------

export async function createProposal(data: Partial<Proposal>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doc: {
                doctype: 'Proposal',
                ...data,
            },
        }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to create proposal'));
    return json.message;
}

// ----------------------------------------------------------------------
// Update Proposal
// ----------------------------------------------------------------------

export async function updateProposal(name: string, data: Partial<Proposal>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'Proposal',
            name,
            fieldname: data,
        }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to update proposal'));
    return json.message;
}

// ----------------------------------------------------------------------
// Delete Proposal
// ----------------------------------------------------------------------

export async function deleteProposal(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            doctype: 'Proposal',
            name,
        }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, 'Failed to delete proposal'));
    return true;
}

// ----------------------------------------------------------------------
// Get Proposal Permissions
// ----------------------------------------------------------------------

export async function getProposalPermissions() {
    const res = await frappeRequest(
        '/api/method/company.company.frontend_api.get_doc_permissions?doctype=Proposal'
    );

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

// ----------------------------------------------------------------------
// Get Proposal Print URL
// ----------------------------------------------------------------------

export function getProposalPrintUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Proposal&name=${encodeURIComponent(name)}`;
}
