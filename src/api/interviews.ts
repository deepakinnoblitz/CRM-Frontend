import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface InterviewFeedback {
    name?: string;
    interview_type: string;
    rating: number;
    interviewer: string;
    notes: string;
}

export interface Interview {
    name: string;
    job_applicant: string;
    email_id?: string;
    phone_number?: string;
    country?: string;
    job_applied?: string;
    designation?: string;
    state?: string;
    city?: string;
    notes?: string;
    cover_letter?: string;
    resume_attachment?: string;
    resume_link?: string;
    currency?: string;
    lower_range?: string;
    upper_range?: string;
    scheduled_on: string;
    from_time: string;
    to_time: string;
    interview_summary?: string;
    overall_performance?: string;
    overall_status: string;
    feedbacks?: InterviewFeedback[];
    creation?: string;
}

export async function fetchInterviews(
    page: number = 1,
    page_size: number = 10,
    search: string = '',
    orderBy: string = 'creation',
    order: 'asc' | 'desc' = 'desc'
) {
    const filters: any[] = [];
    if (search) {
        filters.push(['Interview', 'job_applicant', 'like', `%${search}%`]);
    }

    const orderByParam = `${orderBy} ${order}`;

    const query = new URLSearchParams({
        doctype: 'Interview',
        fields: JSON.stringify(['*']),
        filters: JSON.stringify(filters),
        limit_start: String((page - 1) * page_size),
        limit_page_length: String(page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Interview&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch interviews");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0,
    };
}

export async function getInterview(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Interview&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch interview details");
    }

    return (await res.json()).message;
}

export async function createInterview(data: Partial<Interview>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Interview", ...data } })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create interview"));
    return json.message;
}

export async function updateInterview(name: string, data: Partial<Interview>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Interview",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update interview"));
    return json.message;
}

export async function deleteInterview(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Interview", name })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete interview"));
    return json.message;
}

export async function getInterviewPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Interview");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}
