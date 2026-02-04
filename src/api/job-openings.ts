import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface JobOpening {
    name: string;
    job_title: string;
    designation: string;
    shift: string;
    location: string;
    experience: string;
    posted_on?: string;
    closes_on?: string;
    status: 'Open' | 'Closed';
    description?: string;
    small_description?: string;
    skills_required?: string;
    currency?: string;
    salary_per?: 'Month' | 'Year';
    lower_range?: number;
    upper_range?: number;
    creation?: string;
    modified?: string;
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        status?: string;
        location?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    // Add status and location filters
    if (params.filters) {
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['Job Opening', 'status', '=', params.filters.status]);
        }
        if (params.filters.location && params.filters.location !== 'all') {
            filters.push(['Job Opening', 'location', '=', params.filters.location]);
        }
        if (params.filters.startDate) {
            filters.push(['Job Opening', 'posted_on', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Job Opening', 'posted_on', '<=', params.filters.endDate]);
        }
    }

    // Use or_filters for search across multiple fields
    const or_filters: any[] = params.search ? [
        ['Job Opening', 'job_title', 'like', `%${params.search}%`],
        ['Job Opening', 'location', 'like', `%${params.search}%`]
    ] : [];

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "posted_on desc";

    const query = new URLSearchParams({
        doctype: 'Job Opening',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Job Opening&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch job openings");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchJobOpenings = (params: any) => fetchFrappeList(params);

export async function createJobOpening(data: Partial<JobOpening>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Job Opening", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create job opening"));
    }

    return (await res.json()).message;
}

export async function updateJobOpening(name: string, data: Partial<JobOpening>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Job Opening",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update job opening"));
    }

    return (await res.json()).message;
}

export async function deleteJobOpening(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Job Opening", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete job opening"));
    }

    return true;
}

export async function getJobOpening(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Job Opening&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch job opening details");
    }

    return (await res.json()).message;
}

export async function getJobOpeningPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Job Opening");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getJobLocations(): Promise<string[]> {
    try {
        const res = await frappeRequest("/api/method/frappe.client.get_list?doctype=Job Opening&fields=[\"location\"]&limit_page_length=999");

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        const locations = data.message || [];
        // Get unique locations
        const uniqueLocations = [...new Set(locations.map((item: any) => item.location).filter(Boolean))] as string[];
        return uniqueLocations;
    } catch (error) {
        console.error('Failed to fetch locations:', error);
        return [];
    }
}
