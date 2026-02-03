import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface JobApplicant {
    name: string;
    applicant_name: string;
    email_id: string;
    phone_number: string;
    job_title: string;
    designation: string;
    status: string;
    source: string;
    cover_letter: string;
    resume_attachment: string;
    resume_link: string;
    lower_range: string;
    upper_range: string;
    currency: string;
    creation?: string;
}

export async function fetchJobApplicants(params: {
    page: number;
    pageSize: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        status?: string;
        job_title?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    // Add filters
    if (params.filters) {
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['Job Applicant', 'status', '=', params.filters.status]);
        }
        if (params.filters.job_title && params.filters.job_title !== 'all') {
            filters.push(['Job Applicant', 'job_title', '=', params.filters.job_title]);
        }
        if (params.filters.startDate) {
            filters.push(['Job Applicant', 'creation', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Job Applicant', 'creation', '<=', params.filters.endDate]);
        }
    }

    // Use or_filters for search
    const or_filters: any[] = params.search ? [
        ['Job Applicant', 'applicant_name', 'like', `%${params.search}%`],
        ['Job Applicant', 'email_id', 'like', `%${params.search}%`],
        ['Job Applicant', 'phone_number', 'like', `%${params.search}%`]
    ] : [];

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "creation desc";

    const query = new URLSearchParams({
        doctype: 'Job Applicant',
        fields: JSON.stringify(['*']),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.pageSize),
        limit_page_length: String(params.pageSize),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Job Applicant&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch job applicants");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

export async function getJobApplicant(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Job Applicant&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch job applicant details");
    }

    return (await res.json()).message;
}

export async function createJobApplicant(data: Partial<JobApplicant>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Job Applicant", ...data } })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create job applicant"));
    return json.message;
}

export async function updateJobApplicant(name: string, data: Partial<JobApplicant>) {
    const headers = await getAuthHeaders();

    const updateData = { ...data } as any;
    const fieldsToRemove = ['name', 'creation', 'modified', 'owner', 'modified_by', 'docstatus', 'idx'];
    fieldsToRemove.forEach((f) => delete updateData[f]);

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Job Applicant",
            name,
            fieldname: updateData
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update job applicant"));
    return json.message;
}

export async function deleteJobApplicant(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Job Applicant", name })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete job applicant"));
    return json.message;
}

export async function getJobApplicantPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Job Applicant");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}
